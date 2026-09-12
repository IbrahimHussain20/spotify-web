/// A single playable track (mirrors Spotify's track model, sourced from YouTube).
class Track {
  final String id; // YouTube video id
  final String title;
  final String artist;
  final String thumbnail;
  final Duration duration;

  const Track({
    required this.id,
    required this.title,
    required this.artist,
    required this.thumbnail,
    required this.duration,
  });

  String get durationLabel {
    final m = duration.inMinutes;
    final s = duration.inSeconds % 60;
    final h = duration.inHours;
    if (h > 0) {
      return '$h:${m.remainder(60).toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  String get defaultThumbnail => thumbnail.isEmpty
      ? 'https://via.placeholder.com/300?text=Music'
      : thumbnail;

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'artist': artist,
    'thumbnail': thumbnail,
    'durationMs': duration.inMilliseconds,
  };

  factory Track.fromJson(Map<String, dynamic> json) => Track(
    id: json['id'] as String,
    title: json['title'] as String,
    artist: json['artist'] as String? ?? 'YouTube Music',
    thumbnail: json['thumbnail'] as String? ?? '',
    duration: Duration(
      milliseconds: (json['durationMs'] as num?)?.toInt() ?? 0,
    ),
  );

  Track copyWith({String? title, String? artist}) => Track(
    id: id,
    title: title ?? this.title,
    artist: artist ?? this.artist,
    thumbnail: thumbnail,
    duration: duration,
  );

  @override
  bool operator ==(Object other) => other is Track && other.id == id;

  @override
  int get hashCode => id.hashCode;
}
