import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'theme/spotify_colors.dart';
import 'state/player_state.dart';
import 'screens/app_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SpotifyCloneApp());
}

class SpotifyCloneApp extends StatelessWidget {
  const SpotifyCloneApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => PlayerState(),
      child: MaterialApp(
        title: 'Spotify — Web Player',
        debugShowCheckedModeBanner: false,
        theme: SpotifyColors.theme,
        home: const AppShell(),
      ),
    );
  }
}
