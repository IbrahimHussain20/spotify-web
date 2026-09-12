# Spotify Clone — Flutter

A Spotify-style music player (desktop/web) that streams songs from **YouTube** — no API key required.

## Features

- 🎨 100% Spotify-inspired dark UI (sidebar, home grids, player bar, queue)
- 🎵 Streams real songs from YouTube using `youtube_explode_dart`
- 🔍 Live YouTube search with artist/title parsing
- ❤️ Liked Songs (persisted locally)
- 📁 Playlists — create, add, and play
- 🔀 Shuffle, Repeat (off/all/one), seek, volume/mute
- ⏭ Auto-advance queue + auto-skip unplayable tracks

## Tech Stack

- **Flutter** (Dart)
- `provider` — state management
- `youtube_explode_dart` — YouTube search + audio stream resolution
- `just_audio` — audio playback
- `shared_preferences` — local persistence
- `cached_network_image` — artwork caching

## Getting Started

```bash
# 1. Install Flutter SDK (>= 3.3)

# 2. Generate platform folders (android/ios/web/...)
flutter create .

# 3. Get dependencies
flutter pub get

# 4. Run (desktop / web)
flutter run -d chrome     # web
flutter run -d macos      # macOS (requires macOS desktop enabled)
flutter run -d windows    # Windows (requires Windows desktop enabled)
```

## Project Structure

```
lib/
├── main.dart                    # App entry + provider setup
├── models/
│   ├── track.dart               # Track model
│   └── playlist.dart            # Playlist model
├── services/
│   ├── youtube_service.dart     # YouTube search + stream resolution
│   └── library_service.dart     # Liked songs + playlists persistence
├── state/
│   └── player_state.dart        # Central player + app state (Provider)
├── theme/
│   └── spotify_colors.dart      # Spotify color palette + theme
├── screens/
│   ├── app_shell.dart           # Sidebar + main content + player bar shell
│   ├── home_screen.dart         # Home with trending + collections
│   ├── search_screen.dart       # Search with debounce
│   ├── library_screen.dart      # Library grid
│   ├── liked_screen.dart        # Liked songs list
│   └── playlist_screen.dart     # Single playlist view
└── widgets/
    ├── sidebar.dart             # Left navigation sidebar
    ├── player_bar.dart          # Bottom player bar
    ├── track_row.dart           # Reusable track list row
    └── track_card.dart          # Grid card with hover-play
```
