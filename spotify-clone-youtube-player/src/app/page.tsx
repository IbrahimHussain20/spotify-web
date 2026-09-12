"use client";

import { PlayerProvider } from "@/lib/player-context";
import MainView from "@/components/MainView";
import PlayerBar from "@/components/PlayerBar";

export default function Home() {
  return (
    <PlayerProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-black text-white">
        <div className="flex min-h-0 flex-1">
          <MainView />
        </div>
        <PlayerBar />
      </div>
    </PlayerProvider>
  );
}
