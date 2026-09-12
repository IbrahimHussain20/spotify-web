import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../theme/spotify_colors.dart';
import '../state/player_state.dart';

class PlayerBar extends StatelessWidget {
  const PlayerBar({super.key});

  String _fmt(Duration d) {
    final m = d.inMinutes;
    final s = d.inSeconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerState>(
      builder: (ctx, state, _) {
        final track = state.currentTrack;
        final progress = state.trackDuration.inMilliseconds > 0
            ? state.position.inMilliseconds / state.trackDuration.inMilliseconds
            : 0.0;

        return Container(
          height: 88,
          decoration: const BoxDecoration(
            color: SpotifyColors.background,
            border: Border(top: BorderSide(color: SpotifyColors.border)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // Left: now playing info
              Expanded(
                flex: 3,
                child: track == null
                    ? const _NoTrack()
                    : _NowPlaying(track: track),
              ),
              // Center: controls
              Expanded(
                flex: 4,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: Icon(
                            Icons.shuffle_rounded,
                            color: state.shuffle
                                ? SpotifyColors.green
                                : SpotifyColors.textSubdued,
                          ),
                          onPressed: state.toggleShuffle,
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.skip_previous_rounded,
                            size: 28,
                          ),
                          onPressed: state.hasTrack ? state.previous : null,
                        ),
                        IconButton(
                          iconSize: 40,
                          icon: Icon(
                            state.loading
                                ? Icons.hourglass_empty_rounded
                                : state.isPlaying
                                ? Icons.pause_circle_filled_rounded
                                : Icons.play_circle_fill_rounded,
                            color: Colors.white,
                          ),
                          onPressed: state.hasTrack ? state.togglePlay : null,
                        ),
                        IconButton(
                          icon: const Icon(Icons.skip_next_rounded, size: 28),
                          onPressed: state.hasTrack ? state.next : null,
                        ),
                        IconButton(
                          icon: Icon(
                            state.repeat == RepeatMode.one
                                ? Icons.repeat_one_rounded
                                : Icons.repeat_rounded,
                            color: state.repeat != RepeatMode.off
                                ? SpotifyColors.green
                                : SpotifyColors.textSubdued,
                          ),
                          onPressed: state.cycleRepeat,
                        ),
                      ],
                    ),
                    // Timeline
                    Row(
                      children: [
                        Text(
                          _fmt(state.position),
                          style: const TextStyle(
                            fontSize: 11,
                            color: SpotifyColors.textSubdued,
                          ),
                        ),
                        Expanded(
                          child: SliderTheme(
                            data: SliderTheme.of(context).copyWith(
                              trackHeight: 4,
                              thumbShape: const RoundSliderThumbShape(
                                enabledThumbRadius: 6,
                              ),
                              overlayShape: const RoundSliderOverlayShape(
                                overlayRadius: 12,
                              ),
                              activeTrackColor: Colors.white,
                              inactiveTrackColor: SpotifyColors.highlight,
                              thumbColor: Colors.white,
                            ),
                            child: Slider(
                              value: progress.clamp(0.0, 1.0),
                              onChanged: state.trackDuration.inMilliseconds > 0
                                  ? (v) => state.seek(
                                      Duration(
                                        milliseconds:
                                            (v *
                                                    state
                                                        .trackDuration
                                                        .inMilliseconds)
                                                .round(),
                                      ),
                                    )
                                  : null,
                            ),
                          ),
                        ),
                        Text(
                          state.trackDuration.inMilliseconds > 0
                              ? _fmt(state.trackDuration)
                              : track?.durationLabel ?? '0:00',
                          style: const TextStyle(
                            fontSize: 11,
                            color: SpotifyColors.textSubdued,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Right: volume
              Expanded(
                flex: 3,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    IconButton(
                      icon: Icon(
                        state.muted || state.volume == 0
                            ? Icons.volume_off_rounded
                            : state.volume > 0.66
                            ? Icons.volume_up_rounded
                            : Icons.volume_down_rounded,
                        color: SpotifyColors.textSubdued,
                      ),
                      onPressed: state.toggleMute,
                    ),
                    SizedBox(
                      width: 100,
                      child: SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          trackHeight: 4,
                          thumbShape: const RoundSliderThumbShape(
                            enabledThumbRadius: 6,
                          ),
                          activeTrackColor: Colors.white,
                          inactiveTrackColor: SpotifyColors.highlight,
                          thumbColor: Colors.white,
                        ),
                        child: Slider(
                          value: state.muted ? 0 : state.volume,
                          onChanged: state.setVolume,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _NoTrack extends StatelessWidget {
  const _NoTrack();

  @override
  Widget build(BuildContext context) {
    return const Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Nothing playing',
          style: TextStyle(fontSize: 14, color: SpotifyColors.textSubdued),
        ),
        Text(
          'Search for a song and press play',
          style: TextStyle(fontSize: 12, color: SpotifyColors.textFaint),
        ),
      ],
    );
  }
}

class _NowPlaying extends StatelessWidget {
  final dynamic track;
  const _NowPlaying({required this.track});

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerState>(
      builder: (ctx, state, _) {
        final liked = state.isLiked(track.id);
        return Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: CachedNetworkImage(
                imageUrl: track.defaultThumbnail,
                width: 56,
                height: 56,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(
                  width: 56,
                  height: 56,
                  color: SpotifyColors.highlight,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    track.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14, color: Colors.white),
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
            IconButton(
              icon: Icon(
                liked ? Icons.favorite : Icons.favorite_border,
                color: liked ? SpotifyColors.green : SpotifyColors.textSubdued,
              ),
              onPressed: () => state.toggleLike(track),
            ),
          ],
        );
      },
    );
  }
}
