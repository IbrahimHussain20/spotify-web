import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../theme/spotify_colors.dart';
import '../models/track.dart';
import '../state/player_state.dart';

class TrackRow extends StatelessWidget {
  final Track track;
  final int index;
  final void Function(Track track) onPlay;
  final List<Track> contextTracks;

  const TrackRow({
    super.key,
    required this.track,
    required this.index,
    required this.onPlay,
    required this.contextTracks,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerState>(
      builder: (ctx, state, _) {
        final isActive = state.currentTrack?.id == track.id;
        final isPlaying = state.isPlaying;
        final liked = state.isLiked(track.id);

        return InkWell(
          onTap: () => isActive ? state.togglePlay() : onPlay(track),
          onHover: (_) {},
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                // Index / playing indicator
                SizedBox(
                  width: 28,
                  child: isActive
                      ? _Equalizer(isPlaying: isPlaying)
                      : Text(
                          '${index + 1}',
                          style: const TextStyle(
                            color: SpotifyColors.textSubdued,
                            fontSize: 14,
                          ),
                        ),
                ),
                const SizedBox(width: 12),
                // Artwork
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: CachedNetworkImage(
                    imageUrl: track.defaultThumbnail,
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      width: 40,
                      height: 40,
                      color: SpotifyColors.highlight,
                    ),
                    errorWidget: (_, __, ___) => Container(
                      width: 40,
                      height: 40,
                      color: SpotifyColors.highlight,
                      child: const Icon(
                        Icons.music_note,
                        color: SpotifyColors.textFaint,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Title + artist
                Expanded(
                  flex: 4,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        track.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: isActive ? SpotifyColors.green : Colors.white,
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
                // Album placeholder
                const Expanded(
                  flex: 2,
                  child: Text(
                    'YouTube',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      color: SpotifyColors.textSubdued,
                    ),
                  ),
                ),
                // Like + duration
                IconButton(
                  icon: Icon(
                    liked ? Icons.favorite : Icons.favorite_border,
                    color: liked
                        ? SpotifyColors.green
                        : SpotifyColors.textSubdued,
                    size: 18,
                  ),
                  onPressed: () => state.toggleLike(track),
                ),
                SizedBox(
                  width: 48,
                  child: Text(
                    track.durationLabel,
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      color: SpotifyColors.textSubdued,
                      fontSize: 13,
                    ),
                  ),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(
                    Icons.more_horiz,
                    color: SpotifyColors.textSubdued,
                  ),
                  onSelected: (val) {
                    if (val == 'queue') state.addToQueue(track);
                    if (val == 'like') state.toggleLike(track);
                  },
                  itemBuilder: (_) => const [
                    PopupMenuItem(value: 'queue', child: Text('Add to queue')),
                    PopupMenuItem(
                      value: 'like',
                      child: Text('Save to Liked Songs'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _Equalizer extends StatelessWidget {
  final bool isPlaying;
  const _Equalizer({required this.isPlaying});

  @override
  Widget build(BuildContext context) {
    if (!isPlaying) {
      return const Icon(
        Icons.pause_circle_filled,
        color: SpotifyColors.green,
        size: 16,
      );
    }
    // Simple static equalizer bars (animated in production with an animation controller).
    return const Row(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        SizedBox(
          width: 3,
          height: 14,
          child: DecoratedBox(
            decoration: BoxDecoration(color: SpotifyColors.green),
          ),
        ),
        SizedBox(width: 2),
        SizedBox(
          width: 3,
          height: 6,
          child: DecoratedBox(
            decoration: BoxDecoration(color: SpotifyColors.green),
          ),
        ),
        SizedBox(width: 2),
        SizedBox(
          width: 3,
          height: 10,
          child: DecoratedBox(
            decoration: BoxDecoration(color: SpotifyColors.green),
          ),
        ),
      ],
    );
  }
}
