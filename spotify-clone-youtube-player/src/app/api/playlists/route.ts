import { db } from "@/db";
import { playlists, playlistTracks } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import type { Track } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const pls = await db.select().from(playlists).orderBy(asc(playlists.id));
  const tracks = await db
    .select()
    .from(playlistTracks)
    .orderBy(asc(playlistTracks.id));

  const result = pls.map((p) => ({
    id: p.id,
    name: p.name,
    tracks: tracks
      .filter((t) => t.playlistId === p.id)
      .map((t) => ({
        id: t.videoId,
        title: t.title,
        artist: t.artist,
        thumbnail: t.thumbnail,
        duration: t.duration,
        durationSeconds: 0,
      })),
  }));

  return Response.json({ items: result });
}

// Create a playlist
export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  if (!name) return Response.json({ error: "name required" }, { status: 400 });

  const existing = await db
    .select()
    .from(playlists)
    .where(eq(playlists.name, name));
  if (existing.length > 0) {
    return Response.json({ items: existing }, { status: 201 });
  }

  const inserted = await db
    .insert(playlists)
    .values({ name })
    .returning();
  return Response.json({ items: inserted }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return Response.json({ error: "missing id" }, { status: 400 });
  await db.delete(playlists).where(eq(playlists.id, id));
  return Response.json({ ok: true });
}
