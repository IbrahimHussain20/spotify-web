import 'package:youtube_explode_dart/youtube_explode_dart.dart';

import '../models/track.dart';

/// Wraps `youtube_explode_dart` to provide search + audio stream resolution
/// without needing a YouTube API key.
class YoutubeService {
  YoutubeService._();
  static final YoutubeService instance = YoutubeService._();

  late final YoutubeExplode _yt = YoutubeExplode();

  /// Search YouTube for songs matching [query].
  Future<List<Track>> search(String query) async {
    if (query.trim().isEmpty) return [];
    try {
      final searchList = await _yt.search.search(query.trim());

      final tracks = <Track>[];
      // Limit to the first 30 reasonable results.
      final videos = searchList.take(30);
      for (final video in videos) {
        // Skip very long "compilation" videos so we surface real songs.
        if (video.duration != null &&
            video.duration! > const Duration(minutes: 12)) {
          continue;
        }
        final artist = _extractArtist(video.title);
        final title = _extractTitle(video.title);
        tracks.add(
          Track(
            id: video.id.value,
            title: title,
            artist: artist,
            thumbnail: video.thumbnails.highResUrl.isNotEmpty
                ? video.thumbnails.highResUrl
                : video.thumbnails.mediumResUrl,
            duration: video.duration ?? Duration.zero,
          ),
        );
      }
      return tracks;
    } catch (_) {
      return [];
    }
  }

  /// Resolve a direct, playable audio URL for [videoId].
  Future<String?> resolveAudioUrl(String videoId) async {
    try {
      final manifest = await _yt.videos.streams.getManifest(videoId);
      // Prefer the highest quality audio-only stream (copy then sort).
      final audioStreams = List.of(manifest.audioOnly);
      if (audioStreams.isNotEmpty) {
        audioStreams.sort((a, b) => b.bitrate.compareTo(a.bitrate));
        return audioStreams.first.url.toString();
      }
      // Fallback to muxed (audio + video) stream URL.
      final muxed = List.of(manifest.muxed);
      if (muxed.isNotEmpty) {
        return muxed.last.url.toString();
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  void dispose() {
    _yt.close();
  }

  /// "Ed Sheeran - Perfect (Official Video)" -> artist "Ed Sheeran"
  String _extractArtist(String rawTitle) {
    final m = RegExp(r'^(.+?)\s+[-–—]\s+(.+)$').firstMatch(rawTitle);
    if (m != null && m.group(1)!.length <= 60) {
      return _clean(m.group(1)!);
    }
    return 'YouTube Music';
  }

  String _extractTitle(String rawTitle) {
    final m = RegExp(r'^(.+?)\s+[-–—]\s+(.+)$').firstMatch(rawTitle);
    if (m != null) {
      final t = _clean(m.group(2)!);
      if (t.isNotEmpty) return t;
    }
    return rawTitle;
  }

  String _clean(String s) =>
      s.replaceAll(RegExp(r'\s*[\[(][^\])]*[\])]\s*$'), '').trim();
}
