import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';

import '../models/track.dart';
import '../models/playlist.dart';
import '../services/youtube_service.dart';
import '../services/library_service.dart';

enum RepeatMode { off, all, one }

/// Central app state: playback, queue, shuffle/repeat, likes, playlists.
class PlayerState extends ChangeNotifier {
  final AudioPlayer _player = AudioPlayer();
  final YoutubeService _yt = YoutubeService.instance;
  final LibraryService _lib = LibraryService.instance;

  // Playback
  Track? currentTrack;
  bool isPlaying = false;
  bool loading = false;
  String? error;

  // Queue
  List<Track> queue = [];
  int _queueIndex = -1;
  final List<int> _history = [];
  final Random _random = Random();

  // Playback settings
  bool shuffle = false;
  RepeatMode repeat = RepeatMode.off;
  double volume = 0.8;
  bool muted = false;

  // Library
  Set<String> likedIds = {};
  List<Playlist> playlists = [];

  Duration position = Duration.zero;
  Duration trackDuration = Duration.zero;

  bool get hasTrack => currentTrack != null;

  PlayerState() {
    _init();
  }

  Future<void> _init() async {
    // Load library state.
    final liked = await _lib.getLiked();
    likedIds = liked.map((t) => t.id).toSet();
    playlists = await _lib.getPlaylists();

    // Wire up the player.
    _player.positionStream.listen((pos) {
      position = pos;
      notifyListeners();
    });

    _player.durationStream.listen((dur) {
      trackDuration = dur ?? Duration.zero;
      notifyListeners();
    });

    _player.playerStateStream.listen((state) {
      if (state.processingState == ProcessingState.completed) {
        _onTrackEnded();
      } else if (state.processingState == ProcessingState.ready ||
          state.processingState == ProcessingState.idle) {
        loading = false;
      } else {
        loading = state.processingState == ProcessingState.loading ||
            state.processingState == ProcessingState.buffering;
      }
      isPlaying = state.playing;
      notifyListeners();
    });

    _player.setVolume(volume);
    notifyListeners();
  }

  void _onTrackEnded() {
    if (repeat == RepeatMode.one) {
      _player.seek(Duration.zero);
      _player.play();
      return;
    }
    next();
  }

  // ---- Playback controls ----
  Future<void> playTrack(Track track, {List<Track>? context}) async {
    if (context != null && context.isNotEmpty) {
      final idx = context.indexWhere((t) => t.id == track.id);
      if (idx >= 0) {
        queue = List.of(context);
        _queueIndex = idx;
      } else {
        queue = [track];
        _queueIndex = 0;
      }
    } else {
      queue = [track];
      _queueIndex = 0;
    }
    _history.clear();
    await _load(track);
  }

  Future<void> playQueueIndex(int index) async {
    if (index < 0 || index >= queue.length) return;
    _history.add(_queueIndex);
    _queueIndex = index;
    await _load(queue[index]);
  }

  Future<void> _load(Track track) async {
    error = null;
    loading = true;
    currentTrack = track;
    position = Duration.zero;
    trackDuration = Duration.zero;
    notifyListeners();

    try {
      final url = await _yt.resolveAudioUrl(track.id);
      if (url == null) {
        throw Exception('No stream available');
      }
      await _player.setUrl(url);
      await _player.play();
      isPlaying = true;
    } catch (_) {
      error = "This song can't be played right now.";
      isPlaying = false;
      // Auto-skip unplayable tracks like Spotify.
      next();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> togglePlay() async {
    if (currentTrack == null) return;
    if (_player.playing) {
      await _player.pause();
      isPlaying = false;
    } else {
      await _player.play();
      isPlaying = true;
    }
    notifyListeners();
  }

  void next() {
    if (queue.isEmpty) return;
    final idx = _queueIndex;

    if (shuffle) {
      final rnd = _random.nextInt(queue.length);
      int nextIdx = rnd;
      if (queue.length > 1 && nextIdx == idx) {
        nextIdx = (nextIdx + 1) % queue.length;
      }
      _history.add(idx);
      _queueIndex = nextIdx;
      _load(queue[nextIdx]);
      return;
    }

    if (idx + 1 < queue.length) {
      _history.add(idx);
      _queueIndex = idx + 1;
      _load(queue[_queueIndex]);
    } else if (repeat == RepeatMode.all) {
      _history.add(idx);
      _queueIndex = 0;
      _load(queue[0]);
    } else {
      isPlaying = false;
      _player.pause();
      notifyListeners();
    }
  }

  void previous() {
    if (_player.position.inSeconds > 3) {
      _player.seek(Duration.zero);
      return;
    }
    if (_history.isNotEmpty) {
      final prev = _history.removeLast();
      if (prev >= 0 && prev < queue.length) {
        _queueIndex = prev;
        _load(queue[prev]);
        return;
      }
    }
    _player.seek(Duration.zero);
  }

  Future<void> seek(Duration pos) async {
    await _player.seek(pos);
    position = pos;
    notifyListeners();
  }

  void toggleShuffle() {
    shuffle = !shuffle;
    notifyListeners();
  }

  void cycleRepeat() {
    repeat = RepeatMode.values[(repeat.index + 1) % RepeatMode.values.length];
    notifyListeners();
  }

  void setVolume(double v) {
    volume = v.clamp(0.0, 1.0);
    muted = false;
    _player.setVolume(volume);
    notifyListeners();
  }

  void toggleMute() {
    muted = !muted;
    _player.setVolume(muted ? 0 : volume);
    notifyListeners();
  }

  // ---- Library actions ----
  bool isLiked(String id) => likedIds.contains(id);

  Future<void> toggleLike(Track track) async {
    final updated = await _lib.toggleLike(track);
    likedIds = updated.map((t) => t.id).toSet();
    notifyListeners();
  }

  Future<Playlist> createPlaylist(String name) async {
    final pl = await _lib.createPlaylist(name);
    playlists = await _lib.getPlaylists();
    notifyListeners();
    return pl;
  }

  Future<void> addToPlaylist(String playlistId, Track track) async {
    await _lib.addToPlaylist(playlistId, track);
    playlists = await _lib.getPlaylists();
    notifyListeners();
  }

  Future<void> deletePlaylist(String playlistId) async {
    await _lib.deletePlaylist(playlistId);
    playlists = await _lib.getPlaylists();
    notifyListeners();
  }

  void addToQueue(Track track) {
    queue = List.of(queue)..add(track);
    notifyListeners();
  }

  void removeFromQueue(int index) {
    final copy = List.of(queue);
    if (index < 0 || index >= copy.length) return;
    copy.removeAt(index);
    if (index < _queueIndex) _queueIndex--;
    queue = copy;
    notifyListeners();
  }

  @override
  void dispose() {
    _yt.dispose();
    _player.dispose();
    super.dispose();
  }
}
