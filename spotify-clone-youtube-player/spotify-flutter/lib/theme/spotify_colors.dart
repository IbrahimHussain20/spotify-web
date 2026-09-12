import 'package:flutter/material.dart';

/// Spotify's official dark theme color palette.
class SpotifyColors {
  SpotifyColors._();

  static const Color background = Color(0xFF000000);
  static const Color surface = Color(0xFF121212);
  static const Color elevated = Color(0xFF181818);
  static const Color highlight = Color(0xFF2A2A2A);
  static const Color border = Color(0xFF242424);

  static const Color green = Color(0xFF1DB954);
  static const Color greenBright = Color(0xFF1ED760);

  static const Color textBase = Color(0xFFFFFFFF);
  static const Color textSubdued = Color(0xFFB3B3B3);
  static const Color textFaint = Color(0xFF7A7A7A);

  static ThemeData get theme => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: background,
    useMaterial3: true,
    fontFamily: 'CircularStd',
        colorScheme: const ColorScheme.dark(
          primary: green,
          secondary: greenBright,
          surface: surface,
          onPrimary: Colors.black,
          onSurface: textBase,
        ),
    highlightColor: Colors.transparent,
    splashColor: Colors.transparent,
    hoverColor: Colors.white.withOpacity(0.08),
    dividerColor: highlight,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      foregroundColor: textBase,
    ),
    iconTheme: const IconThemeData(color: textSubdued),
  );
}
