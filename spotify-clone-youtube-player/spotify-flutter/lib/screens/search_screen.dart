import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/spotify_colors.dart';
import '../models/track.dart';
import '../services/youtube_service.dart';
import '../state/player_state.dart';
import '../widgets/track_row.dart';

class SearchScreen extends StatelessWidget {
  final String initialQuery;
  const SearchScreen({super.key, this.initialQuery = ''});

  @override
  Widget build(BuildContext context) {
    return _SearchBody(initialQuery: initialQuery);
  }
}

class _SearchBody extends StatefulWidget {
  final String initialQuery;
  const _SearchBody({required this.initialQuery});

  @override
  State<_SearchBody> createState() => _SearchBodyState();
}

class _SearchBodyState extends State<_SearchBody> {
  final YoutubeService _yt = YoutubeService.instance;
  final TextEditingController _controller = TextEditingController();
  Timer? _debounce;

  List<Track> _results = [];
  bool _searching = false;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _query = widget.initialQuery;
    _controller.text = widget.initialQuery;
    if (_query.isNotEmpty) _search(_query);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _query = value;
    _debounce?.cancel();
    if (value.trim().isEmpty) {
      setState(() {
        _results = [];
        _searching = false;
      });
      return;
    }
    setState(() => _searching = true);
    _debounce = Timer(const Duration(milliseconds: 400), () => _search(value));
  }

  Future<void> _search(String value) async {
    final results = await _yt.search(value);
    if (!mounted) return;
    setState(() {
      _results = results;
      _searching = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final player = context.read<PlayerState>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
          child: TextField(
            controller: _controller,
            onChanged: _onChanged,
            autofocus: widget.initialQuery.isEmpty,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'What do you want to play?',
              hintStyle: const TextStyle(
                color: SpotifyColors.textSubdued,
                fontSize: 14,
              ),
              prefixIcon: const Icon(
                Icons.search,
                color: SpotifyColors.textSubdued,
              ),
              filled: true,
              fillColor: SpotifyColors.highlight,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),
        Expanded(
          child: _query.trim().isEmpty
              ? const _BrowseAll()
              : _searching
              ? const Center(
                  child: CircularProgressIndicator(color: SpotifyColors.green),
                )
              : _results.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.search_off_rounded,
                        size: 48,
                        color: SpotifyColors.textSubdued,
                      ),
                      SizedBox(height: 12),
                      Text(
                        'No results found',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Try different keywords.',
                        style: TextStyle(
                          fontSize: 13,
                          color: SpotifyColors.textSubdued,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _results.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 2),
                  itemBuilder: (_, i) => TrackRow(
                    track: _results[i],
                    index: i,
                    contextTracks: _results,
                    onPlay: (t) => player.playTrack(t, context: _results),
                  ),
                ),
        ),
      ],
    );
  }
}

class _BrowseAll extends StatelessWidget {
  const _BrowseAll();

  static const categories = [
    ('Top Hits', Color(0xFFF59E0B)),
    ('Lo-Fi Beats', Color(0xFF6366F1)),
    ('Chill Vibes', Color(0xFF10B981)),
    ('Hip-Hop', Color(0xFFEF4444)),
    ('Electronic', Color(0xFFA855F7)),
    ('Acoustic', Color(0xFF84CC16)),
    ('Pop', Color(0xFFEC4899)),
    ('RNB', Color(0xFF06B6D4)),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text(
          'Browse all',
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
          childAspectRatio: 1.6,
          children: categories
              .map(
                (c) => InkWell(
                  onTap: () {
                    final searchScreen = context
                        .findAncestorStateOfType<_SearchBodyState>();
                    if (searchScreen != null) {
                      searchScreen._controller.text = c.$1;
                      searchScreen._onChanged(c.$1);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: c.$2,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.bottomLeft,
                    child: Text(
                      c.$1,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}
