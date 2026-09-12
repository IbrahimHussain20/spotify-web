"use client";

import { useRef, useState } from "react";
import { usePlayer } from "@/lib/player-context";
import {
  ShuffleIcon,
  PrevIcon,
  PlayIcon,
  PauseIcon,
  NextIcon,
  RepeatIcon,
  HeartIcon,
  VolumeIcon,
  VolumeMuteIcon,
  QueueIcon,
  MoreIcon,
  SpeakerIcon,
  XIcon,
} from "./icons";

function formatTime(s: number) {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    next,
    prev,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    volume,
    muted,
    setVolume,
    toggleMute,
    currentTime,
    duration,
    seek,
    toggleLike,
    isLiked,
    queue,
    removeFromQueue,
    playQueueIndex,
    isCurrent,
    loading,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleSeekFromClick(e: React.MouseEvent) {
    const el = timelineRef.current;
    if (!el || duration <= 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, ratio)) * duration);
  }

  const volumeLevel = muted ? 0 : volume;

  return (
    <>
      {/* Queue panel */}
      {showQueue && (
        <div className="fixed bottom-[90px] right-4 z-50 flex max-h-[60vh] w-96 flex-col rounded-lg bg-[#181818] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <QueueIcon className="h-5 w-5" />
              <h3 className="text-sm font-bold">Queue</h3>
              <span className="text-xs text-[#b3b3b3]">{queue.length}</span>
            </div>
            <button
              onClick={() => setShowQueue(false)}
              className="text-[#b3b3b3] hover:text-white"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {queue.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#b3b3b3]">
                Your queue is empty.
              </p>
            ) : (
              queue.map((t, i) => (
                <div
                  key={t.id + i}
                  onClick={() => {
                    playQueueIndex(i);
                    setShowQueue(false);
                  }}
                  className={`flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-white/10 ${
                    isCurrent(t.id) ? "text-[#1db954]" : "text-white"
                  }`}
                >
                  <img
                    src={t.thumbnail}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="truncate text-xs text-[#b3b3b3]">
                      {t.artist}
                    </p>
                  </div>
                  <span className="text-xs text-[#b3b3b3]">{t.duration}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(i);
                    }}
                    className="text-[#b3b3b3] hover:text-white"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <footer className="flex h-[88px] shrink-0 items-center justify-between border-t border-[#242424] bg-black px-4">
        {/* LEFT: now playing */}
        <div className="flex w-[30%] min-w-0 items-center gap-3">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="h-14 w-14 shrink-0 rounded object-cover shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.visibility = "hidden";
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">
                    {currentTrack.title}
                  </p>
                  <button
                    onClick={() => toggleLike(currentTrack)}
                    className={
                      isLiked(currentTrack.id)
                        ? "shrink-0 text-[#1db954]"
                        : "shrink-0 text-[#b3b3b3] hover:text-white"
                    }
                  >
                    <HeartIcon
                      filled={isLiked(currentTrack.id)}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
                <p className="truncate text-xs text-[#b3b3b3]">
                  {currentTrack.artist}
                </p>
              </div>
            </>
          ) : (
            <div className="min-w-0">
              <p className="truncate text-sm text-[#b3b3b3]">
                Nothing playing
              </p>
              <p className="text-xs text-[#7a7a7a]">
                Search for a song and press play
              </p>
            </div>
          )}
        </div>

        {/* CENTER: playback controls */}
        <div className="flex w-[40%] max-w-xl flex-col items-center gap-1.5">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              title="Shuffle"
              className={shuffle ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"}
            >
              <ShuffleIcon active={shuffle} className="h-4 w-4" />
            </button>
            <button
              onClick={prev}
              title="Previous"
              className="text-[#b3b3b3] hover:text-white"
            >
              <PrevIcon className="h-5 w-5" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              title={isPlaying ? "Pause" : "Play"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-40"
            >
              {loading ? (
                <span className="spin inline-block h-4 w-4 rounded-full border-2 border-black border-t-transparent" />
              ) : isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={next}
              title="Next"
              className="text-[#b3b3b3] hover:text-white"
            >
              <NextIcon className="h-5 w-5" />
            </button>
            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
              className={
                repeat !== "off"
                  ? "text-[#1db954]"
                  : "text-[#b3b3b3] hover:text-white"
              }
            >
              <span className="relative">
                <RepeatIcon active={repeat !== "off"} className="h-4 w-4" />
                {repeat === "one" && (
                  <span className="absolute -right-1 -top-2.5 text-[7px] font-bold text-[#1db954]">
                    1
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Timeline + time */}
          <div className="flex w-full items-center gap-2">
            <span className="w-10 text-right text-[11px] text-[#b3b3b3] tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div
              ref={timelineRef}
              onClick={handleSeekFromClick}
              className="group relative h-4 flex-1 cursor-pointer"
            >
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-[#4d4d4d]">
                <div
                  className="relative h-full rounded bg-white group-hover:bg-[#1db954]"
                  style={{ width: `${progress}%` }}
                >
                  <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 transition group-hover:opacity-100" />
                </div>
              </div>
            </div>
            <span className="w-10 text-left text-[11px] text-[#b3b3b3] tabular-nums">
              {duration > 0 ? formatTime(duration) : currentTrack?.duration ?? "0:00"}
            </span>
          </div>
        </div>

        {/* RIGHT: volume + queue */}
        <div className="flex w-[30%] items-center justify-end gap-4">
          <button
            onClick={() => setShowQueue((s) => !s)}
            title="Queue"
            className="text-[#b3b3b3] hover:text-white"
          >
            <QueueIcon className="h-5 w-5" />
          </button>
          <div className="group flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-[#b3b3b3] hover:text-white"
            >
              {volumeLevel === 0 ? (
                <VolumeMuteIcon className="h-5 w-5" />
              ) : (
                <VolumeIcon
                  level={volumeLevel > 0.66 ? 3 : volumeLevel > 0.33 ? 2 : 1}
                  className="h-5 w-5"
                />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="spotify-range w-24"
              style={{
                background: `linear-gradient(to right, #fff ${
                  volumeLevel * 100
                }%, #4d4d4d ${volumeLevel * 100}%)`,
              }}
            />
          </div>
        </div>
      </footer>
    </>
  );
}
