"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "@/lib/player-context";
import Sidebar from "./Sidebar";
import TrackRow from "./TrackRow";
import type { Track, Playlist, LikedTrack } from "@/lib/types";
import {
  SearchIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from "./icons";

type View = "home" | "search" | "library" | "playlist" | "liked";

// Curated browse queries for the Home page
const FEATURED: { title: string; query: string; gradient: string }[] = [
  { title: "Top Hits", query: "top hit songs official audio", gradient: "from-amber-500 to-orange-600" },
  { title: "Lo-Fi Beats", query: "lofi hip hop music for studying", gradient: "from-sky-500 to-indigo-600" },
  { title: "Chill Vibes", query: "chill acoustic songs official audio", gradient: "from-emerald-500 to-teal-600" },
  { title: "Hip-Hop", query: "hip hop songs official audio", gradient: "from-rose-500 to-red-600" },
  { title: "Electronic", query: "electronic dance music songs official audio", gradient: "from-fuchsia-500 to-purple-600" },
  { title: "Acoustic", query: "acoustic guitar cover songs", gradient: "from-lime-500 to-green-600" },
];

const TRENDING_QUERY = "popular songs official music video 2025";

export default function MainView() {
  const { playTrack, currentTrack, isPlaying, togglePlay, addToQueue, addToPlaylist, isCurrent } =
    usePlayer();

  const [view, setView] = useState<View>("home");
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [trending, setTrending] = useState<Track[]>([]);
  const [featuredResults, setFeaturedResults] = useState<Record<string, Track[]>>({});

  const [playlistModal, setPlaylistModal] = useState<{ track: Track } | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load playlists + liked songs
  const refreshPlaylists = useCallback(() => {
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((d) => setPlaylists(d.items ?? []))
      .catch(() => {});
  }, []);

  const refreshLiked = useCallback(() => {
    fetch("/api/liked")
      .then((r) => r.json())
      .then((d) => setLikedTracks(d.items ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshPlaylists();
    refreshLiked();
  }, [refreshPlaylists, refreshLiked]);

  // Load trending + featured on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(TRENDING_QUERY)}`);
        const d = await res.json();
        setTrending(d.items ?? []);
      } catch {}
      FEATURED.forEach(async (f) => {
        // throttle by staggering
        await new Promise((r) => setTimeout(r, 300));
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(f.query)}`);
          const d = await res.json();
          setFeaturedResults((prev) => ({ ...prev, [f.title]: d.items ?? [] }));
        } catch {}
      });
    }
    load();
  }, []);

  // Debounced search
  const doSearch = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const term = q.trim();
    if (!term) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const d = await res.json();
        setResults(d.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  useEffect(() => {
    doSearch(query);
  }, [query, doSearch]);

  const handleOpenPlaylist = useCallback((id: number) => {
    setActivePlaylistId(id);
    setView("playlist");
  }, []);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId) ?? null,
    [playlists, activePlaylistId]
  );

  function toggleLikedRefresh() {
    refreshLiked();
  }

  function handleViewChange(v: View) {
    setView(v);
    if (v === "library") refreshPlaylists();
  }

  return (
    <>
      <Sidebar
        view={view}
        setView={handleViewChange}
        activePlaylistId={activePlaylistId}
        onOpenPlaylist={handleOpenPlaylist}
        playlists={playlists}
        refreshPlaylists={refreshPlaylists}
        likedCount={likedTracks.length}
      />
      <main className="relative flex min-w-0 flex-1 flex-col bg-[#121212]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("home")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView("home")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="flex w-[40%] max-w-md items-center gap-2 rounded-full bg-[#242424] px-4 py-2 focus-within:bg-[#2a2a2a]">
          <SearchIcon className="h-5 w-5 text-[#b3b3b3]" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) {
                setView("search");
              }
            }}
            placeholder="What do you want to play?"
            className="w-full bg-transparent text-sm text-white placeholder-[#b3b3b3] outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-bold text-[#b3b3b3] hover:text-white">
            Sign up
          </button>
          <button className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black hover:scale-105">
            Log in
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {view === "home" && (
          <HomeView
            trending={trending}
            featuredResults={featuredResults}
            onPlay={playTrack}
            onOpenSearch={() => setView("search")}
          />
        )}

        {view === "search" && (
          <SearchView
            query={query}
            results={results}
            searching={searching}
            onPlay={playTrack}
            onAddToPlaylist={(t) => setPlaylistModal({ track: t })}
            onAddToQueue={addToQueue}
          />
        )}

        {view === "library" && (
          <LibraryView
            playlists={playlists}
            likedTracks={likedTracks}
            onOpenPlaylist={handleOpenPlaylist}
            onOpenLiked={() => setView("liked")}
          />
        )}

        {view === "liked" && (
          <LikedView
            tracks={likedTracks}
            onRefresh={toggleLikedRefresh}
            onAddToPlaylist={(t) => setPlaylistModal({ track: t })}
            onAddToQueue={addToQueue}
          />
        )}

        {view === "playlist" && activePlaylist && (
          <PlaylistView
            playlist={activePlaylist}
            onRefresh={refreshPlaylists}
            onAddToQueue={addToQueue}
          />
        )}
      </div>

      {/* Playlist modal */}
      {playlistModal && (
        <PlaylistModal
          track={playlistModal.track}
          playlists={playlists}
          onClose={() => setPlaylistModal(null)}
          onAdd={(pid) => {
            addToPlaylist(pid, playlistModal.track);
            setPlaylistModal(null);
          }}
          onCreate={async (name) => {
            const res = await fetch("/api/playlists", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
            if (res.ok) {
              refreshPlaylists();
            }
          }}
        />
      )}

      </main>
    </>
  );
}

/* ---------------------- HOME ---------------------- */
function HomeView({
  trending,
  featuredResults,
  onPlay,
  onOpenSearch,
}: {
  trending: Track[];
  featuredResults: Record<string, Track[]>;
  onPlay: (t: Track, ctx?: Track[]) => void;
  onOpenSearch: () => void;
}) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="mt-2 flex items-end gap-6 rounded-xl bg-gradient-to-b from-[#1f1f1f] to-[#121212] p-6">
        <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-lg shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700" />
          <div className="absolute inset-0 flex items-center justify-center text-7xl">
            🎧
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-white">
            Your soundtrack starts here
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            Good afternoon
          </h1>
          <p className="mt-3 text-sm text-[#b3b3b3]">
            Stream music straight from YouTube in a familiar Spotify-style
            player.
          </p>
          <button
            onClick={onOpenSearch}
            className="btn-green mt-5 flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold"
          >
            <PlayIcon className="h-5 w-5" /> Start listening
          </button>
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Trending now</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {trending.slice(0, 10).map((t) => (
            <TrackCard key={t.id} track={t} context={trending} onPlay={onPlay} />
          ))}
        </div>
      </section>

      {/* Featured collections */}
      {FEATURED.map((f) => {
        const items = featuredResults[f.title] ?? [];
        if (items.length === 0) return null;
        return (
          <section key={f.title}>
            <h2 className="mb-4 text-2xl font-bold text-white">{f.title}</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {items.slice(0, 8).map((t) => (
                <TrackCard
                  key={t.id}
                  track={t}
                  context={items}
                  onPlay={onPlay}
                  compact
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TrackCard({
  track,
  context,
  onPlay,
  compact = false,
}: {
  track: Track;
  context: Track[];
  onPlay: (t: Track, ctx?: Track[]) => void;
  compact?: boolean;
}) {
  const { currentTrack, isPlaying, isCurrent, togglePlay } = usePlayer();
  const active = isCurrent(track.id);

  return (
    <div
      className={`card group relative cursor-pointer rounded-lg p-4 ${compact ? "w-40 shrink-0" : ""}`}
      onClick={() => (active ? togglePlay() : onPlay(track, context))}
    >
      <div className="relative">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="mb-4 aspect-square w-full rounded object-cover shadow-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.visibility = "hidden";
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            active ? togglePlay() : onPlay(track, context);
          }}
          className="play-overlay absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] text-black shadow-xl hover:scale-105"
        >
          {active && isPlaying ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      <p className="truncate text-sm font-semibold text-white">{track.title}</p>
      <p className="truncate text-xs text-[#b3b3b3]">{track.artist}</p>
    </div>
  );
}

/* ---------------------- SEARCH ---------------------- */
function SearchView({
  query,
  results,
  searching,
  onPlay,
  onAddToPlaylist,
  onAddToQueue,
}: {
  query: string;
  results: Track[];
  searching: boolean;
  onPlay: (t: Track, ctx?: Track[]) => void;
  onAddToPlaylist?: (t: Track) => void;
  onAddToQueue?: (t: Track) => void;
}) {
  if (!query.trim()) {
    return (
      <div className="mt-8">
        <h2 className="mb-6 text-2xl font-bold text-white">
          Browse all
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED.map((f, i) => (
            <div
              key={f.title}
              className="h-44 cursor-pointer rounded-lg p-4 text-start font-black text-white"
            >
              <div
                className={`flex h-full w-full items-end rounded-lg bg-gradient-to-br ${f.gradient} p-4`}
              >
                <span className="text-xl">{f.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="mb-4 text-2xl font-bold text-white">
        {searching ? "Searching…" : `Results for "${query}"`}
      </h2>

      {searching && (
        <div className="flex items-center gap-3 py-8 text-[#b3b3b3]">
          <span className="spin inline-block h-6 w-6 rounded-full border-2 border-[#b3b3b3] border-t-transparent" />
          Finding tracks…
        </div>
      )}

      {!searching && results.length === 0 && (
        <div className="py-16 text-center">
          <SearchIcon className="mx-auto mb-4 h-10 w-10 text-[#b3b3b3]" />
          <p className="text-lg font-bold text-white">No results found</p>
          <p className="text-sm text-[#b3b3b3]">
            Try different keywords or check your spelling.
          </p>
        </div>
      )}

      {!searching && results.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="mb-2 grid grid-cols-[16px_minmax(0,4fr)_minmax(0,2fr)] items-center gap-3 border-b border-white/10 px-4 pb-2 text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">
            <span>#</span>
            <span>Title</span>
            <span>Time</span>
          </div>
          {results.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              withAlbum
              onPlay={(track) => onPlay(track, results)}
              onAddToQueue={onAddToQueue}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------- LIBRARY ---------------------- */
function LibraryView({
  playlists,
  likedTracks,
  onOpenPlaylist,
  onOpenLiked,
}: {
  playlists: Playlist[];
  likedTracks: LikedTrack[];
  onOpenPlaylist: (id: number) => void;
  onOpenLiked: () => void;
}) {
  return (
    <div className="mt-4">
      <h1 className="mb-6 text-2xl font-bold text-white">Your Library</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {/* Liked songs card */}
        <div
          onClick={onOpenLiked}
          className="card flex cursor-pointer flex-col rounded-lg p-4"
        >
          <div className="mb-4 flex h-32 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-400">
            <HeartIcon filled className="h-14 w-14 text-white" />
          </div>
          <p className="truncate text-sm font-semibold text-white">
            Liked Songs
          </p>
          <p className="text-xs text-[#b3b3b3]">{likedTracks.length} songs</p>
        </div>

        {playlists.map((p) => (
          <div
            key={p.id}
            onClick={() => onOpenPlaylist(p.id)}
            className="card flex cursor-pointer flex-col rounded-lg p-4"
          >
            <div className="mb-4 flex h-32 items-center justify-center rounded bg-[#282828] text-5xl font-black text-[#b3b3b3]">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <p className="truncate text-sm font-semibold text-white">{p.name}</p>
            <p className="text-xs text-[#b3b3b3]">
              Playlist • {p.tracks.length} songs
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- LIKED ---------------------- */
function LikedView({
  tracks,
  onRefresh,
  onAddToPlaylist,
  onAddToQueue,
}: {
  tracks: LikedTrack[];
  onRefresh: () => void;
  onAddToPlaylist?: (t: Track) => void;
  onAddToQueue?: (t: Track) => void;
}) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const trackList: Track[] = tracks.map((t) => ({
    id: t.videoId,
    title: t.title,
    artist: t.artist,
    thumbnail: t.thumbnail,
    duration: t.duration,
    durationSeconds: 0,
  }));

  return (
    <div className="mt-4">
      <div className="mb-6 flex items-end gap-6">
        <div className="flex h-52 w-52 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-400 shadow-2xl">
          <HeartIcon filled className="h-24 w-24 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-white">Playlist</p>
          <h1 className="mt-1 text-5xl font-black text-white">Liked Songs</h1>
          <p className="mt-3 text-sm text-[#b3b3b3]">
            {tracks.length} songs
          </p>
        </div>
      </div>

      {trackList.length === 0 ? (
        <p className="py-16 text-center text-[#b3b3b3]">
          Songs you like will appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="mb-2 grid grid-cols-[16px_minmax(0,4fr)_minmax(0,2fr)_40px] items-center gap-3 border-b border-white/10 px-4 pb-2 text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">
            <span>#</span>
            <span>Title</span>
            <span className="text-right">
              <ClockIcon className="ml-auto h-4 w-4" />
            </span>
          </div>
          {trackList.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              withAlbum
              onPlay={(track) => playTrack(track, trackList)}
              onAddToQueue={onAddToQueue}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------- PLAYLIST ---------------------- */
function PlaylistView({
  playlist,
  onRefresh,
  onAddToQueue,
}: {
  playlist: Playlist;
  onRefresh: () => void;
  onAddToQueue?: (t: Track) => void;
}) {
  const { playTrack } = usePlayer();

  return (
    <div className="mt-4">
      <div className="mb-6 flex items-end gap-6">
        <div className="flex h-52 w-52 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#282828] to-[#1a1a1a] text-7xl font-black text-[#b3b3b3] shadow-2xl">
          {playlist.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-white">Playlist</p>
          <h1 className="mt-1 text-5xl font-black text-white">
            {playlist.name}
          </h1>
          <p className="mt-3 text-sm text-[#b3b3b3]">
            {playlist.tracks.length} songs
          </p>
        </div>
      </div>

      {playlist.tracks.length === 0 ? (
        <p className="py-16 text-center text-[#b3b3b3]">
          Add songs to this playlist from search results.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="mb-2 grid grid-cols-[16px_minmax(0,4fr)_minmax(0,2fr)_40px] items-center gap-3 border-b border-white/10 px-4 pb-2 text-xs font-medium uppercase tracking-wider text-[#b3b3b3]">
            <span>#</span>
            <span>Title</span>
            <span className="text-right">
              <ClockIcon className="ml-auto h-4 w-4" />
            </span>
          </div>
          {playlist.tracks.map((t, i) => (
            <TrackRow
              key={t.id + i}
              track={t}
              index={i}
              withAlbum
              onPlay={(track) => playTrack(track, playlist.tracks)}
              onAddToQueue={onAddToQueue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------- PLAYLIST MODAL ---------------------- */
function PlaylistModal({
  track,
  playlists,
  onClose,
  onAdd,
  onCreate,
}: {
  track: Track;
  playlists: Playlist[];
  onClose: () => void;
  onAdd: (id: number) => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-[#282828] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Add to playlist</h3>
            <p className="mt-1 truncate text-sm text-[#b3b3b3]">{track.title}</p>
          </div>
          <button onClick={onClose} className="text-[#b3b3b3] hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name"
            className="flex-1 rounded bg-[#3e3e3e] px-3 py-2 text-sm text-white placeholder-[#7a7a7a] outline-none"
          />
          <button
            onClick={async () => {
              if (name.trim()) {
                await onCreate(name.trim());
                setName("");
              }
            }}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:scale-105"
          >
            Create
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => onAdd(p.id)}
              className="flex w-full items-center gap-3 rounded px-2 py-2.5 hover:bg-white/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded bg-[#181818] text-lg font-bold text-[#b3b3b3]">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-white">{p.name}</span>
            </button>
          ))}
          {playlists.length === 0 && (
            <p className="py-6 text-center text-sm text-[#b3b3b3]">
              Create your first playlist above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
