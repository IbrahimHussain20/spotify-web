import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../theme/spotify_colors.dart';
import '../models/track.dart';
import '../state/player_state.dart';

class TrackCard extends StatelessWidget {
  final Track track;
  final List<Track> contextTracks;
  final bool compact;

  const TrackCard({
    super.key,
    required this.track,
    required this.contextTracks,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerState>(
      builder: (ctx, state, _) {
        final isActive = state.currentTrack?.id == track.id;

        return MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () => isActive
                ? state.togglePlay()
                : state.playTrack(track, context: contextTracks),
            child: Container(
              width: compact ? 160 : null,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: SpotifyColors.elevated,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Artwork with hover play overlay
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: AspectRatio(
                          aspectRatio: 1,
                          child: CachedNetworkImage(
                            imageUrl: track.defaultThumbnail,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(
                              color: SpotifyColors.highlight,
                              child: const Icon(
                                Icons.music_note,
                                color: SpotifyColors.textFaint,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        right: 8,
                        bottom: 8,
                        child: AnimatedOpacity(
                          opacity: isActive ? 1 : 0,
                          duration: const Duration(milliseconds: 200),
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: const BoxDecoration(
                              color: SpotifyColors.green,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(color: Colors.black45, blurRadius: 8),
                              ],
                            ),
                            child: Icon(
                              isActive && state.isPlaying
                                  ? Icons.pause
                                  : Icons.play_arrow,
                              color: Colors.black,
                              size: 26,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    track.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    track.artist,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: SpotifyColors.textSubdued,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
