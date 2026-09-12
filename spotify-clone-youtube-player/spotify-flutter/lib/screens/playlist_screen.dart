import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/spotify_colors.dart';
import '../models/playlist.dart';
import '../state/player_state.dart';
import '../widgets/track_row.dart';

class PlaylistScreen extends StatelessWidget {
  final String playlistId;
  const PlaylistScreen({super.key, required this.playlistId});

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerState>(
      builder: (ctx, state, _) {
        final playlist = state.playlists.firstWhere(
          (p) => p.id == playlistId,
          orElse: () => Playlist(id: playlistId, name: 'Playlist'),
        );
        final tracks = playlist.tracks;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Container(
                    width: 160,
                    height: 160,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF282828), Color(0xFF1A1A1A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.all(Radius.circular(8)),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      playlist.name.isNotEmpty
                          ? playlist.name[0].toUpperCase()
                          : 'P',
                      style: const TextStyle(
                        fontSize: 64,
                        fontWeight: FontWeight.w900,
                        color: SpotifyColors.textSubdued,
                      ),
                    ),
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Playlist',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          playlist.name,
                          style: const TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${tracks.length} songs',
                          style: const TextStyle(
                            fontSize: 14,
                            color: SpotifyColors.textSubdued,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: tracks.isEmpty
                  ? const Center(
                      child: Text(
                        'Add songs to this playlist from search results.',
                        style: TextStyle(color: SpotifyColors.textSubdued),
                      ),
                    )
                  : ListView.separated(
                      itemCount: tracks.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 2),
                      itemBuilder: (_, i) => TrackRow(
                        track: tracks[i],
                        index: i,
                        contextTracks: tracks,
                        onPlay: (t) => state.playTrack(t, context: tracks),
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }
}
