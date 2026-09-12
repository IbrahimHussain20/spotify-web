import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/track.dart';
import '../models/playlist.dart';

/// Persists liked songs and playlists locally using SharedPreferences.
/// (Swap with a real backend / database in production.)
class LibraryService {
  LibraryService._();
  static final LibraryService instance = LibraryService._();

  static const _likedKey = 'liked_songs';
  static const _playlistsKey = 'playlists';

  SharedPreferences? _prefs;

  Future<SharedPreferences> get _p async {
    return _prefs ??= await SharedPreferences.getInstance();
  }

  /// --- Liked songs ---
  Future<List<Track>> getLiked() async {
    final p = await _p;
    final raw = p.getString(_likedKey);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List;
    return list.map((e) => Track.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<bool> isLiked(String id) async {
    final liked = await getLiked();
    return liked.any((t) => t.id == id);
  }

  Future<List<Track>> toggleLike(Track track) async {
    final liked = await getLiked();
    final exists = liked.any((t) => t.id == track.id);
    if (exists) {
      liked.removeWhere((t) => t.id == track.id);
    } else {
      liked.insert(0, track);
    }
    await _saveLiked(liked);
    return liked;
  }

  Future<void> _saveLiked(List<Track> liked) async {
    final p = await _p;
    await p.setString(
      _likedKey,
      jsonEncode(liked.map((t) => t.toJson()).toList()),
    );
  }

  /// --- Playlists ---
  Future<List<Playlist>> getPlaylists() async {
    final p = await _p;
    final raw = p.getString(_playlistsKey);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List;
    return list
        .map((e) => Playlist.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Playlist> createPlaylist(String name) async {
    final lists = await getPlaylists();
    final existing = lists
        .where((pl) => pl.name.toLowerCase() == name.toLowerCase())
        .toList();
    if (existing.isNotEmpty) return existing.first;

    final playlist = Playlist(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
    );
    lists.add(playlist);
    await _savePlaylists(lists);
    return playlist;
  }

  Future<void> addToPlaylist(String playlistId, Track track) async {
    final lists = await getPlaylists();
    for (final pl in lists) {
      if (pl.id == playlistId) {
        if (!pl.tracks.any((t) => t.id == track.id)) {
          pl.tracks.add(track);
        }
      }
    }
    await _savePlaylists(lists);
  }

  Future<void> removeFromPlaylist(String playlistId, String trackId) async {
    final lists = await getPlaylists();
    for (final pl in lists) {
      if (pl.id == playlistId) {
        pl.tracks.removeWhere((t) => t.id == trackId);
      }
    }
    await _savePlaylists(lists);
  }

  Future<void> deletePlaylist(String playlistId) async {
    final lists = await getPlaylists();
    lists.removeWhere((pl) => pl.id == playlistId);
    await _savePlaylists(lists);
  }

  Future<void> _savePlaylists(List<Playlist> lists) async {
    final p = await _p;
    await p.setString(
      _playlistsKey,
      jsonEncode(lists.map((pl) => pl.toJson()).toList()),
    );
  }
}
