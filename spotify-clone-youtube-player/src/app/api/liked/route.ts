import { db } from "@/db";
import { likedSongs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Track } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(likedSongs)
    .orderBy(desc(likedSongs.createdAt));
  return Response.json({ items: rows });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Track;
  if (!body?.id || !body?.title) {
    return Response.json({ error: "invalid track" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(likedSongs)
    .where(eq(likedSongs.videoId, body.id));

  if (existing.length > 0) {
    return Response.json({ items: existing, duplicate: true });
  }

  const inserted = await db
    .insert(likedSongs)
    .values({
      videoId: body.id,
      title: body.title,
      artist: body.artist,
      thumbnail: body.thumbnail,
      duration: body.duration,
    })
    .returning();

  return Response.json({ items: inserted });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  if (!videoId) return Response.json({ error: "missing videoId" }, { status: 400 });

  await db.delete(likedSongs).where(eq(likedSongs.videoId, videoId));
  return Response.json({ ok: true });
}
