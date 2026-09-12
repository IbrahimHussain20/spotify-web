import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/spotify_colors.dart';
import '../models/track.dart';
import '../state/player_state.dart';
import '../services/library_service.dart';
import '../widgets/track_row.dart';

class LikedScreen extends StatefulWidget {
  const LikedScreen({super.key});

  @override
  State<LikedScreen> createState() => _LikedScreenState();
}

class _LikedScreenState extends State<LikedScreen> {
  List<Track> _tracks = [];
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final tracks = await LibraryService.instance.getLiked();
    if (!mounted) return;
    setState(() {
      _tracks = tracks;
      _loaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final player = context.read<PlayerState>();

    return Consumer<PlayerState>(
      builder: (ctx, state, _) {
        // Keep in sync with the source of truth in player state's likedIds
        if (!_loaded) {
          return const Center(
            child: CircularProgressIndicator(color: SpotifyColors.green),
          );
        }

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
                        colors: [Color(0xFF6366F1), Color(0xFFA78BFA)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.all(Radius.circular(8)),
                    ),
                    child: const Icon(
                      Icons.favorite_rounded,
                      color: Colors.white,
                      size: 72,
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
                        const Text(
                          'Liked Songs',
                          style: TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${_tracks.length} songs',
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
              child: _tracks.isEmpty
                  ? const Center(
                      child: Text(
                        'Songs you like will appear here.',
                        style: TextStyle(color: SpotifyColors.textSubdued),
                      ),
                    )
                  : ListView.separated(
                      itemCount: _tracks.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 2),
                      itemBuilder: (_, i) => TrackRow(
                        track: _tracks[i],
                        index: i,
                        contextTracks: _tracks,
                        onPlay: (t) => player.playTrack(t, context: _tracks),
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }
}
