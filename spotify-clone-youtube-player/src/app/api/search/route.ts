import { searchYoutube } from "@/lib/youtube";
import type { Track } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// "Artist - Song Title (Official Video)" -> artist "Artist", title "Song Title"
function deriveArtist(rawTitle: string, channel?: string): string {
  // Try "A - B" split
  const m = rawTitle.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (m && m[1].length <= 60) {
    return cleanSuffix(m[1]).trim();
  }
  return channel?.trim() || "YouTube Music";
}

function deriveTitle(rawTitle: string): string {
  const m = rawTitle.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (m) return cleanSuffix(m[2]).trim() || rawTitle;
  return rawTitle;
}

function cleanSuffix(s: string): string {
  // Remove trailing bracketed/parenthetical qualifiers like "(Official Video)"
  return s.replace(/\s*[\[(][^\])]*[\])]\s*$/, "").trim();
}

function parseDuration(raw: string): { label: string; seconds: number } {
  const str = raw.replace(/[^0-9:]/g, "");
  const parts = str.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) {
    return { label: raw || "0:00", seconds: 0 };
  }
  let seconds = 0;
  for (const p of parts) {
    seconds = seconds * 60 + p;
  }
  return { label: str || "0:00", seconds };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return Response.json({ items: [] });
  }

  try {
    const raw = await searchYoutube(q);
    const items: Track[] = raw
      .filter((r) => r.title && r.title.length > 0 && r.videoId)
      // Prefer individual songs: drop very long "compilation" videos.
      .filter((r) => {
        const { seconds } = parseDuration(r.duration);
        return seconds === 0 || seconds <= 12 * 60;
      })
      .map((r) => {
        const { label, seconds } = parseDuration(r.duration);
        return {
          id: r.videoId,
          title: deriveTitle(r.title),
          artist: deriveArtist(r.title, r.channel),
          thumbnail: r.thumbnail,
          duration: label,
          durationSeconds: seconds,
        };
      });

    return Response.json({ items });
  } catch (err) {
    console.error("youtube search error", err);
    return Response.json(
      { items: [], error: "Search failed. Please try again." },
      { status: 502 }
    );
  }
}
