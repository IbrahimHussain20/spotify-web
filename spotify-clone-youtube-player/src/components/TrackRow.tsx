"use client";

import { useState, useRef, useEffect } from "react";
import { usePlayer } from "@/lib/player-context";
import type { Track } from "@/lib/types";
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  MoreIcon,
  QueueIcon,
  PlusIcon,
} from "./icons";

interface TrackRowProps {
  track: Track;
  index: number;
  onPlay: (track: Track) => void;
  withAlbum?: boolean;
  showCover?: boolean;
  onAddToQueue?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export default function TrackRow({
  track,
  index,
  onPlay,
  withAlbum = false,
  showCover = true,
  onAddToQueue,
  onAddToPlaylist,
}: TrackRowProps) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    toggleLike,
    isLiked,
    isCurrent,
  } = usePlayer();
  const [hover, setHover] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = isCurrent(track.id);
  const liked = isLiked(track.id);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (isActive) togglePlay();
        else onPlay(track);
      }}
      className={`group grid cursor-pointer grid-cols-[16px_minmax(0,4fr)_minmax(0,2fr)_minmax(0,1fr)_40px] items-center gap-3 rounded px-4 py-2 transition hover:bg-white/10 ${
        isActive ? "text-[#1db954]" : "text-white"
      }`}
    >
      {/* Index / play indicator */}
      <div className="flex w-4 justify-center text-sm text-[#b3b3b3]">
        {isActive ? (
          <span className="eq flex items-end gap-[2px]">
            <span className="eq-bar" style={{ animationDelay: "0ms" }} />
            <span className="eq-bar" style={{ animationDelay: "200ms" }} />
            <span className="eq-bar" style={{ animationDelay: "400ms" }} />
          </span>
        ) : hover ? (
          <PlayIcon className="h-4 w-4 text-white" />
        ) : (
          <span className="tabular-nums">{index + 1}</span>
        )}
      </div>

      {/* Title + artist */}
      <div className="flex min-w-0 items-center gap-3">
        {showCover && (
          <img
            src={track.thumbnail}
            alt=""
            className="h-10 w-10 shrink-0 rounded object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        )}
        <div className="min-w-0">
          <p
            className={`truncate text-sm font-medium ${
              isActive ? "text-[#1db954]" : "text-white"
            }`}
          >
            {track.title}
          </p>
          <p className="truncate text-xs text-[#b3b3b3]">{track.artist}</p>
        </div>
      </div>

      {/* Album / playlist hint */}
      {withAlbum && (
        <div className="truncate text-sm text-[#b3b3b3]">YouTube</div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {hover && !isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
            className="text-[#b3b3b3] hover:text-white"
          >
            <PlayIcon className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          className={`${liked ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"} ${
            hover || liked ? "opacity-100" : "opacity-0"
          } transition group-hover:opacity-100`}
        >
          <HeartIcon filled={liked} className="h-4 w-4" />
        </button>

        <span className="w-10 text-right text-sm text-[#b3b3b3] tabular-nums">
          {track.duration}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenu((m) => !m);
            }}
            className="text-[#b3b3b3] hover:text-white"
          >
            <MoreIcon className="h-5 w-5" />
          </button>

          {menu && (
            <div
              className="absolute right-0 top-6 z-50 w-56 rounded-md bg-[#282828] p-1 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {onAddToQueue && (
                <button
                  onClick={() => {
                    onAddToQueue(track);
                    setMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-white hover:bg-white/10"
                >
                  <QueueIcon className="h-4 w-4" /> Add to queue
                </button>
              )}
              {onAddToPlaylist && (
                <button
                  onClick={() => {
                    onAddToPlaylist(track);
                    setMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-white hover:bg-white/10"
                >
                  <PlusIcon className="h-4 w-4" /> Add to playlist
                </button>
              )}
              <button
                onClick={() => {
                  toggleLike(track);
                  setMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-white hover:bg-white/10"
              >
                <HeartIcon className="h-4 w-4" />{" "}
                {liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
