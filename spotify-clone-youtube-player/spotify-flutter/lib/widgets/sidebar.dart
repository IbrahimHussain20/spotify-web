import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/spotify_colors.dart';
import '../state/player_state.dart';

enum AppView { home, search, library, playlist, liked }

class Sidebar extends StatelessWidget {
  final AppView view;
  final ValueChanged<AppView> onViewChanged;
  final String? activePlaylistId;
  final ValueChanged<String> onOpenPlaylist;

  const Sidebar({
    super.key,
    required this.view,
    required this.onViewChanged,
    required this.activePlaylistId,
    required this.onOpenPlaylist,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 240,
      color: SpotifyColors.background,
      padding: const EdgeInsets.all(8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top nav
          Container(
            decoration: BoxDecoration(
              color: SpotifyColors.surface,
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.all(8),
            child: Column(
              children: [
                _NavButton(
                  icon: Icons.home_rounded,
                  label: 'Home',
                  selected: view == AppView.home,
                  onTap: () => onViewChanged(AppView.home),
                ),
                _NavButton(
                  icon: Icons.search_rounded,
                  label: 'Search',
                  selected: view == AppView.search,
                  onTap: () => onViewChanged(AppView.search),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Library
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: SpotifyColors.surface,
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _NavButton(
                          icon: Icons.library_music_rounded,
                          label: 'Your Library',
                          selected: view == AppView.library,
                          onTap: () => onViewChanged(AppView.library),
                        ),
                      ),
                      InkWell(
                        onTap: () => _showCreatePlaylistDialog(context),
                        borderRadius: BorderRadius.circular(16),
                        child: const Padding(
                          padding: EdgeInsets.all(6),
                          child: Icon(
                            Icons.add_rounded,
                            color: SpotifyColors.textSubdued,
                            size: 22,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Quick links
                  Expanded(
                    child: Consumer<PlayerState>(
                      builder: (ctx, state, _) {
                        return ListView(
                          children: [
                            _LibraryTile(
                              leading: _LikedArt(),
                              title: 'Liked Songs',
                              subtitle:
                                  'Playlist • ${state.likedIds.length} songs',
                              selected: view == AppView.liked,
                              onTap: () => onViewChanged(AppView.liked),
                            ),
                            ...state.playlists.map(
                              (pl) => _LibraryTile(
                                leading: _PlaylistArt(name: pl.name),
                                title: pl.name,
                                subtitle:
                                    'Playlist • ${pl.tracks.length} songs',
                                selected:
                                    view == AppView.playlist &&
                                    activePlaylistId == pl.id,
                                onTap: () => onOpenPlaylist(pl.id),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showCreatePlaylistDialog(BuildContext context) async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SpotifyColors.elevated,
        title: const Text(
          'Create playlist',
          style: TextStyle(color: Colors.white),
        ),
        content: TextField(
          controller: controller,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'Playlist name',
            hintStyle: TextStyle(color: SpotifyColors.textFaint),
          ),
          onSubmitted: (v) => Navigator.pop(ctx, v),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Cancel',
              style: TextStyle(color: SpotifyColors.textSubdued),
            ),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, controller.text),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
            ),
            child: const Text('Create'),
          ),
        ],
      ),
    );
    if (name != null && name.trim().isNotEmpty) {
      // ignore: use_build_context_synchronously
      await context.read<PlayerState>().createPlaylist(name.trim());
    }
  }
}

class _NavButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _NavButton({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        child: Row(
          children: [
            Icon(
              icon,
              size: 24,
              color: selected ? Colors.white : SpotifyColors.textSubdued,
            ),
            const SizedBox(width: 14),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: selected ? Colors.white : SpotifyColors.textSubdued,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LibraryTile extends StatelessWidget {
  final Widget leading;
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  const _LibraryTile({
    required this.leading,
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          children: [
            leading,
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: selected ? Colors.white : Colors.white,
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
          ],
        ),
      ),
    );
  }
}

class _LikedArt extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF6366F1), Color(0xFFA78BFA)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.all(Radius.circular(4)),
      ),
      child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 22),
    );
  }
}

class _PlaylistArt extends StatelessWidget {
  final String name;
  const _PlaylistArt({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: const BoxDecoration(
        color: SpotifyColors.highlight,
        borderRadius: BorderRadius.all(Radius.circular(4)),
      ),
      alignment: Alignment.center,
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : 'P',
        style: const TextStyle(
          fontWeight: FontWeight.w900,
          fontSize: 20,
          color: SpotifyColors.textSubdued,
        ),
      ),
    );
  }
}
