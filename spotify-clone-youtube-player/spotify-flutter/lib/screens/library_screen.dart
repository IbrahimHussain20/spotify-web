import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/spotify_colors.dart';
import '../state/player_state.dart';

class LibraryScreen extends StatelessWidget {
  final ValueChanged<String> onOpenPlaylist;
  final VoidCallback onOpenLiked;

  const LibraryScreen({
    super.key,
    required this.onOpenPlaylist,
    required this.onOpenLiked,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerState>(
      builder: (ctx, state, _) {
        return ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const Text(
              'Your Library',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            GridView.count(
              crossAxisCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.75,
              children: [
                _LibraryCard(
                  title: 'Liked Songs',
                  subtitle: '${state.likedIds.length} songs',
                  color: const Color(0xFF6366F1),
                  icon: Icons.favorite_rounded,
                  onTap: onOpenLiked,
                ),
                ...state.playlists.map(
                  (pl) => _LibraryCard(
                    title: pl.name,
                    subtitle: 'Playlist • ${pl.tracks.length} songs',
                    color: SpotifyColors.highlight,
                    icon: Icons.queue_music_rounded,
                    onTap: () => onOpenPlaylist(pl.id),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

class _LibraryCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Color color;
  final IconData icon;
  final VoidCallback onTap;

  const _LibraryCard({
    required this.title,
    required this.subtitle,
    required this.color,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: SpotifyColors.elevated,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(icon, color: Colors.white, size: 48),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            Text(
              subtitle,
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
    );
  }
}
