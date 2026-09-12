import 'track.dart';

/// A user-created playlist containing tracks.
class Playlist {
  final String id;
  final String name;
  final List<Track> tracks;

  Playlist({required this.id, required this.name, List<Track>? tracks})
    : tracks = tracks ?? [];

  Playlist copyWith({List<Track>? tracks}) =>
      Playlist(id: id, name: name, tracks: tracks ?? this.tracks);

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'tracks': tracks.map((t) => t.toJson()).toList(),
  };

  factory Playlist.fromJson(Map<String, dynamic> json) => Playlist(
    id: json['id'] as String,
    name: json['name'] as String,
    tracks: (json['tracks'] as List? ?? [])
        .map((t) => Track.fromJson(t as Map<String, dynamic>))
        .toList(),
  );
}
