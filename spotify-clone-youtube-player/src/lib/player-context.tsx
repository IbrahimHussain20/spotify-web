"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Track } from "@/lib/types";

type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  likedIds: Set<string>;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  error: string | null;
}

interface PlayerContextValue extends PlayerState {
  playTrack: (track: Track, context?: Track[]) => void;
  playQueueIndex: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleLike: (track: Track) => void;
  isLiked: (id: string) => boolean;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  playNext: (track: Track) => void;
  addToPlaylist: (playlistId: number, track: Track) => Promise<void>;
  createPlaylist: (name: string) => Promise<number | null>;
  isCurrent: (id: string) => boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

// Minimal typing for the YouTube IFrame player (loaded from YouTube's CDN).
interface YTPlayer {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVideoUrl: () => string;
  setShuffle: (o: object) => void;
  setLoop: (o: boolean) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (el: string, opts: object) => YTPlayer;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
    // Only inject once.
    if (document.getElementById("yt-iframe-api")) {
      // already loading; wait for callback
      return;
    }
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    // Fallback: if callback never fires, retry resolve after timeout.
    setTimeout(() => {
      if (!window.YT?.Player) resolve();
      else resolve();
    }, 5000);
  });
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const playerReadyRef = useRef(false);
  const containerIdRef = useRef("ytplayer");

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queueIndexRef = useRef(-1);
  const historyRef = useRef<number[]>([]);
  const onEndedRef = useRef<() => void>(() => {});

  // Initialize the YouTube player once.
  useEffect(() => {
    let disposed = false;
    let poll: ReturnType<typeof setInterval> | null = null;

    loadYouTubeApi().then(() => {
      if (disposed || !window.YT) return;

      const player = new window.YT.Player(containerIdRef.current, {
        height: "0",
        width: "0",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            if (playerRef.current) {
              try {
                playerRef.current.setVolume(volume * 100);
              } catch {}
            }
          },
          onStateChange: (event: { data: number }) => {
            const S = window.YT!.PlayerState;
            if (event.data === S.PLAYING) {
              setIsPlaying(true);
              setLoading(false);
              setError(null);
            } else if (event.data === S.PAUSED) {
              setIsPlaying(false);
              setLoading(false);
            } else if (event.data === S.BUFFERING) {
              setLoading(true);
            } else if (event.data === S.ENDED) {
              setIsPlaying(false);
              onEndedRef.current();
            } else if (event.data === S.CUED) {
              setLoading(false);
            }
          },
          onError: () => {
            setLoading(false);
            setIsPlaying(false);
            // Skip unplayable videos automatically (like Spotify).
            setError("This video can't be played.");
            onEndedRef.current();
          },
        },
      });

      playerRef.current = player;

      // Poll time/duration updates.
      poll = setInterval(() => {
        if (!playerRef.current || !playerReadyRef.current) return;
        try {
          const t = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration();
          if (typeof t === "number" && Number.isFinite(t)) setCurrentTime(t);
          if (typeof d === "number" && Number.isFinite(d) && d > 0)
            setDuration(d);
        } catch {}
      }, 500);
    });

    return () => {
      disposed = true;
      if (poll) clearInterval(poll);
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load liked songs on mount.
  useEffect(() => {
    fetch("/api/liked")
      .then((r) => r.json())
      .then((d) => {
        const ids = new Set<string>();
        (d.items ?? []).forEach((t: { videoId: string }) => ids.add(t.videoId));
        setLikedIds(ids);
      })
      .catch(() => {});
  }, []);

  const loadAndPlay = useCallback(
    (track: Track) => {
      setError(null);
      setLoading(true);
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(0);
      const p = playerRef.current;
      if (p && playerReadyRef.current) {
        try {
          p.loadVideoById(track.id);
          setLoading(false);
        } catch {
          setLoading(false);
        }
      } else {
        // Player not ready yet - store and retry.
        const retry = setInterval(() => {
          const pp = playerRef.current;
          if (pp && playerReadyRef.current) {
            clearInterval(retry);
            try {
              pp.loadVideoById(track.id);
              setLoading(false);
            } catch {
              setLoading(false);
            }
          }
        }, 200);
      }
    },
    []
  );

  const handleNext = useCallback(() => {
    const q = queue;
    if (q.length === 0) return;
    const idx = queueIndexRef.current;

    if (shuffle) {
      let nextIdx = Math.floor(Math.random() * q.length);
      if (q.length > 1 && nextIdx === idx) nextIdx = (nextIdx + 1) % q.length;
      historyRef.current.push(idx);
      queueIndexRef.current = nextIdx;
      loadAndPlay(q[nextIdx]);
      return;
    }

    const nextIdx = idx + 1;
    if (nextIdx < q.length) {
      historyRef.current.push(idx);
      queueIndexRef.current = nextIdx;
      loadAndPlay(q[nextIdx]);
    } else if (repeat === "all") {
      historyRef.current.push(idx);
      queueIndexRef.current = 0;
      loadAndPlay(q[0]);
    } else {
      setIsPlaying(false);
      try {
        playerRef.current?.pauseVideo();
      } catch {}
    }
  }, [queue, shuffle, repeat, loadAndPlay]);

  // Keep a ref to the latest handleNext for the end handler.
  useEffect(() => {
    onEndedRef.current = () => {
      if (repeat === "one") {
        const p = playerRef.current;
        try {
          p?.seekTo(0, true);
          p?.playVideo();
        } catch {}
        return;
      }
      handleNext();
    };
  }, [repeat, handleNext]);

  const playTrack = useCallback(
    (track: Track, context?: Track[]) => {
      if (context && context.length > 0) {
        const idx = context.findIndex((t) => t.id === track.id);
        if (idx >= 0) {
          setQueue(context);
          queueIndexRef.current = idx;
          historyRef.current = [];
          loadAndPlay(track);
          return;
        }
      }
      setQueue([track]);
      queueIndexRef.current = 0;
      historyRef.current = [];
      loadAndPlay(track);
    },
    [loadAndPlay]
  );

  const playQueueIndex = useCallback(
    (index: number) => {
      const q = queue;
      if (index < 0 || index >= q.length) return;
      historyRef.current.push(queueIndexRef.current);
      queueIndexRef.current = index;
      loadAndPlay(q[index]);
    },
    [queue, loadAndPlay]
  );

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p || !playerReadyRef.current) return;
    if (!currentTrack) return;
    try {
      const state = p.getPlayerState();
      const S = window.YT?.PlayerState;
      if (S && state === S.PLAYING) {
        p.pauseVideo();
      } else {
        p.playVideo();
      }
    } catch {}
  }, [currentTrack]);

  const next = useCallback(() => handleNext(), [handleNext]);

  const prev = useCallback(() => {
    const p = playerRef.current;
    if (p && playerReadyRef.current) {
      try {
        const t = p.getCurrentTime();
        if (t > 3) {
          p.seekTo(0, true);
          setCurrentTime(0);
          return;
        }
      } catch {}
    }
    const hist = historyRef.current;
    if (hist.length > 0) {
      const prevIdx = hist.pop()!;
      const q = queue;
      if (prevIdx >= 0 && prevIdx < q.length) {
        queueIndexRef.current = prevIdx;
        loadAndPlay(q[prevIdx]);
        return;
      }
    }
    if (p && playerReadyRef.current) {
      try {
        p.seekTo(0, true);
        setCurrentTime(0);
      } catch {}
    }
  }, [queue, loadAndPlay]);

  const seek = useCallback((time: number) => {
    const p = playerRef.current;
    if (!p || !playerReadyRef.current) return;
    try {
      p.seekTo(time, true);
      setCurrentTime(time);
    } catch {}
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);

  const cycleRepeat = useCallback(
    () =>
      setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    []
  );

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setMuted(false);
    const p = playerRef.current;
    if (p && playerReadyRef.current) {
      try {
        p.unMute();
        p.setVolume(v * 100);
      } catch {}
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const nm = !m;
      const p = playerRef.current;
      if (p && playerReadyRef.current) {
        try {
          if (nm) p.mute();
          else p.unMute();
        } catch {}
      }
      return nm;
    });
  }, []);

  const toggleLike = useCallback(
    async (track: Track) => {
      const wasLiked = likedIds.has(track.id);
      setLikedIds((prev) => {
        const n = new Set(prev);
        if (n.has(track.id)) n.delete(track.id);
        else n.add(track.id);
        return n;
      });
      try {
        if (wasLiked) {
          await fetch(`/api/liked?videoId=${track.id}`, { method: "DELETE" });
        } else {
          await fetch("/api/liked", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(track),
          });
        }
      } catch {}
    },
    [likedIds]
  );

  const addToQueue = useCallback((track: Track) => {
    setQueue((q) => [...q, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((q) => {
      const n = [...q];
      n.splice(index, 1);
      if (index < queueIndexRef.current) queueIndexRef.current--;
      return n;
    });
  }, []);

  const playNext = useCallback((track: Track) => {
    setQueue((q) => {
      const n = [...q];
      const insertAt = queueIndexRef.current + 1;
      n.splice(Math.max(0, insertAt), 0, track);
      return n;
    });
  }, []);

  const addToPlaylist = useCallback(async (playlistId: number, track: Track) => {
    await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(track),
    });
  }, []);

  const createPlaylist = useCallback(
    async (name: string): Promise<number | null> => {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.items?.[0]?.id ?? null;
      }
      return null;
    },
    []
  );

  const isLiked = useCallback((id: string) => likedIds.has(id), [likedIds]);
  const isCurrent = useCallback(
    (id: string) => currentTrack?.id === id,
    [currentTrack]
  );

  const value: PlayerContextValue = {
    currentTrack,
    isPlaying,
    queue,
    likedIds,
    shuffle,
    repeat,
    volume,
    muted,
    currentTime,
    duration,
    loading,
    error,
    playTrack,
    playQueueIndex,
    togglePlay,
    next,
    prev,
    seek,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    toggleMute,
    toggleLike,
    isLiked,
    addToQueue,
    removeFromQueue,
    playNext,
    addToPlaylist,
    createPlaylist,
    isCurrent,
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Hidden YouTube player host */}
      <div
        id={containerIdRef.current}
        style={{
          position: "fixed",
          bottom: -9999,
          right: -9999,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
}
