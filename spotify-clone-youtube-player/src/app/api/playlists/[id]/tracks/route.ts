import { db } from "@/db";
import { playlistTracks } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import type { Track } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playlistId = Number(id);
  if (!playlistId) return Response.json({ error: "invalid id" }, { status: 400 });

  const body = (await req.json()) as Track;
  const inserted = await db
    .insert(playlistTracks)
    .values({
      playlistId,
      videoId: body.id,
      title: body.title,
      artist: body.artist,
      thumbnail: body.thumbnail,
      duration: body.duration,
    })
    .returning();

  const tracks = await db
    .select()
    .from(playlistTracks)
    .where(eq(playlistTracks.playlistId, playlistId))
    .orderBy(asc(playlistTracks.id));

  return Response.json({ items: tracks }, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playlistId = Number(id);
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!playlistId || !videoId) {
    return Response.json({ error: "missing params" }, { status: 400 });
  }

  await db
    .delete(playlistTracks)
    .where(
      and(
        eq(playlistTracks.playlistId, playlistId),
        eq(playlistTracks.videoId, videoId)
      )
    );

  return Response.json({ ok: true });
}
