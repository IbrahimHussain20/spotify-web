import 'package:flutter/material.dart';

import '../theme/spotify_colors.dart';
import '../models/track.dart';
import '../services/youtube_service.dart';
import '../widgets/track_card.dart';

class HomeScreen extends StatefulWidget {
  final void Function(String query) onOpenSearch;
  const HomeScreen({super.key, required this.onOpenSearch});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final YoutubeService _yt = YoutubeService.instance;

  final List<String> _featuredQueries = [
    'top hit songs official audio',
    'lofi hip hop music for studying',
    'chill acoustic songs official audio',
    'hip hop songs official audio',
    'electronic dance music songs official audio',
    'acoustic guitar cover songs',
  ];

  List<Track> _trending = [];
  Map<String, List<Track>> _featured = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final trending = await _yt.search('popular songs official music video');

    Map<String, List<Track>> featured = {};
    for (int i = 0; i < _featuredQueries.length; i++) {
      final results = await _yt.search(_featuredQueries[i]);
      featured[_featuredQueries[i]] = results;
    }

    if (!mounted) return;
    setState(() {
      _trending = trending;
      _featured = featured;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        // Hero
        _Hero(onListen: () => widget.onOpenSearch('')),
        const SizedBox(height: 32),
        if (_loading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(40),
              child: CircularProgressIndicator(color: SpotifyColors.green),
            ),
          )
        else ...[
          // Trending
          _Section(
            title: 'Trending now',
            child: GridView.count(
              crossAxisCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.66,
              children: _trending
                  .take(8)
                  .map((t) => TrackCard(track: t, contextTracks: _trending))
                  .toList(),
            ),
          ),
          // Featured collections
          for (int i = 0; i < _featuredQueries.length; i++)
            if ((_featured[_featuredQueries[i]] ?? []).isNotEmpty)
              _Section(
                title: _collectionTitle(_featuredQueries[i]),
                child: SizedBox(
                  height: 220,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _featured[_featuredQueries[i]]!.take(8).length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (_, idx) {
                      final items = _featured[_featuredQueries[i]]!;
                      return TrackCard(
                        track: items[idx],
                        contextTracks: items,
                        compact: true,
                      );
                    },
                  ),
                ),
              ),
        ],
      ],
    );
  }

  String _collectionTitle(String query) {
    if (query.contains('lofi')) return 'Lo-Fi Beats';
    if (query.contains('chill')) return 'Chill Vibes';
    if (query.contains('hip hop')) return 'Hip-Hop';
    if (query.contains('electronic')) return 'Electronic';
    if (query.contains('acoustic')) return 'Acoustic';
    return 'Top Hits';
  }
}

class _Hero extends StatelessWidget {
  final VoidCallback onListen;
  const _Hero({required this.onListen});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1F1F1F), SpotifyColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 150,
            height: 150,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF10B981), Color(0xFF047857)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.headphones_rounded,
              color: Colors.white,
              size: 70,
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Good afternoon',
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Stream music straight from YouTube in a familiar Spotify-style player.',
                  style: TextStyle(
                    fontSize: 14,
                    color: SpotifyColors.textSubdued,
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: onListen,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SpotifyColors.green,
                    foregroundColor: Colors.black,
                    shape: const StadiumBorder(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 14,
                    ),
                  ),
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: const Text(
                    'Start listening',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final Widget child;
  const _Section({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 20),
        child,
        const SizedBox(height: 32),
      ],
    );
  }
}
