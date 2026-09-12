"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/player-context";
import { HomeIcon, SearchIcon, LibraryIcon, PlusIcon, HeartIcon } from "./icons";
import type { Playlist } from "@/lib/types";

type View = "home" | "search" | "library" | "playlist" | "liked";

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  activePlaylistId: number | null;
  onOpenPlaylist: (id: number) => void;
  playlists: Playlist[];
  refreshPlaylists: () => void;
  likedCount: number;
}

export default function Sidebar({
  view,
  setView,
  activePlaylistId,
  onOpenPlaylist,
  playlists,
  refreshPlaylists,
  likedCount,
}: SidebarProps) {
  const { currentTrack, isPlaying } = usePlayer();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const { createPlaylist } = usePlayer();

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await createPlaylist(name);
    setNewName("");
    setShowCreate(false);
    refreshPlaylists();
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col bg-black p-2">
      {/* Top nav block */}
      <div className="rounded-lg bg-[#121212] p-2">
        <button
          onClick={() => setView("home")}
          className={`mb-1 flex w-full items-center gap-4 rounded px-3 py-2 text-sm font-bold transition ${
            view === "home" ? "text-white" : "text-[#b3b3b3] hover:text-white"
          }`}
        >
          <HomeIcon filled={view === "home"} className="h-6 w-6" />
          Home
        </button>
        <button
          onClick={() => setView("search")}
          className={`flex w-full items-center gap-4 rounded px-3 py-2 text-sm font-bold transition ${
            view === "search" ? "text-white" : "text-[#b3b3b3] hover:text-white"
          }`}
        >
          <SearchIcon className="h-6 w-6" />
          Search
        </button>
      </div>

      {/* Library block */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col rounded-lg bg-[#121212] p-2">
        <div className="flex items-center justify-between px-3 py-1.5">
          <button
            onClick={() => setView("library")}
            className={`flex items-center gap-4 text-sm font-bold transition ${
              view === "library"
                ? "text-white"
                : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <LibraryIcon className="h-6 w-6" />
            Your Library
          </button>
          <button
            onClick={() => setShowCreate((s) => !s)}
            title="Create playlist"
            className="text-[#b3b3b3] hover:text-white"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>

        {showCreate && (
          <div className="mx-2 mt-1 rounded-lg bg-[#242424] p-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Playlist name"
              className="mb-2 w-full rounded bg-[#3e3e3e] px-2 py-1.5 text-sm text-white placeholder-[#7a7a7a] outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 rounded-full bg-white py-1 text-xs font-bold text-black hover:scale-105"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-full border border-white/20 py-1 text-xs font-bold text-white hover:border-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Navigation chips */}
        <div className="mt-2 flex flex-wrap gap-1.5 px-2">
          <button
            onClick={() => setView("liked")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              view === "liked"
                ? "bg-white text-black"
                : "bg-[#242424] text-white hover:bg-[#2f2f2f]"
            }`}
          >
            Liked
          </button>
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPlaylist(p.id)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold capitalize transition ${
                activePlaylistId === p.id && view === "playlist"
                  ? "bg-white text-black"
                  : "bg-[#242424] text-white hover:bg-[#2f2f2f]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Liked songs quick list */}
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-2">
          <button
            onClick={() => setView("liked")}
            className="mb-1 flex w-full items-center gap-3 rounded p-1.5 text-left transition hover:bg-[#1a1a1a]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-400">
              <HeartIcon filled className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Liked Songs
              </p>
              <p className="text-xs text-[#b3b3b3]">
                Playlist • {likedCount} songs
              </p>
            </div>
          </button>

          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPlaylist(p.id)}
              className="mb-1 flex w-full items-center gap-3 rounded p-1.5 text-left transition hover:bg-[#1a1a1a]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#282828] text-lg font-bold text-[#b3b3b3]">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {p.name}
                </p>
                <p className="text-xs text-[#b3b3b3]">
                  Playlist • {p.tracks.length} songs
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
