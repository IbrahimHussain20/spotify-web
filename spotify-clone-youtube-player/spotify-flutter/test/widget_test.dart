import 'package:flutter_test/flutter_test.dart';
import 'package:spotify_clone/models/track.dart';

void main() {
  test('Track parses "Artist - Title" and duration label correctly', () {
    const track = Track(
      id: 'abc123',
      title: 'Perfect',
      artist: 'Ed Sheeran',
      thumbnail: 'https://example.com/thumb.jpg',
      duration: Duration(minutes: 4, seconds: 42),
    );

    expect(track.durationLabel, '4:42');
    expect(track.id, 'abc123');
    expect(track.artist, 'Ed Sheeran');

    // Serialization round-trip
    final json = track.toJson();
    final restored = Track.fromJson(json);
    expect(restored.id, track.id);
    expect(restored.title, track.title);
    expect(restored.duration.inMilliseconds, track.duration.inMilliseconds);
  });
}
