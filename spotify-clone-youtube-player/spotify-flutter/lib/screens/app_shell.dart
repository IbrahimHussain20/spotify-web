import 'package:flutter/material.dart';

import '../theme/spotify_colors.dart';
import '../widgets/sidebar.dart';
import '../widgets/player_bar.dart';
import 'home_screen.dart';
import 'search_screen.dart';
import 'library_screen.dart';
import 'liked_screen.dart';
import 'playlist_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  AppView _view = AppView.home;
  String? _activePlaylistId;
  String _searchQuery = '';

  void _openSearch(String query) {
    setState(() {
      _searchQuery = query;
      _view = AppView.search;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SpotifyColors.background,
      body: Column(
        children: [
          Expanded(
            child: Row(
              children: [
                Sidebar(
                  view: _view,
                  onViewChanged: (v) => setState(() => _view = v),
                  activePlaylistId: _activePlaylistId,
                  onOpenPlaylist: (id) => setState(() {
                    _activePlaylistId = id;
                    _view = AppView.playlist;
                  }),
                ),
                Expanded(
                  child: Container(
                    color: SpotifyColors.surface,
                    child: _buildView(),
                  ),
                ),
              ],
            ),
          ),
          const PlayerBar(),
        ],
      ),
    );
  }

  Widget _buildView() {
    switch (_view) {
      case AppView.home:
        return HomeScreen(onOpenSearch: _openSearch);
      case AppView.search:
        return SearchScreen(
          key: ValueKey(_searchQuery),
          initialQuery: _searchQuery,
        );
      case AppView.library:
        return LibraryScreen(
          onOpenPlaylist: (id) => setState(() {
            _activePlaylistId = id;
            _view = AppView.playlist;
          }),
          onOpenLiked: () => setState(() => _view = AppView.liked),
        );
      case AppView.liked:
        return const LikedScreen();
      case AppView.playlist:
        return PlaylistScreen(
          key: ValueKey(_activePlaylistId),
          playlistId: _activePlaylistId ?? '',
        );
    }
  }
}
