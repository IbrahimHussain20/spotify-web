import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

// A liked / saved track (mirrors Spotify "Liked Songs")
export const likedSongs = pgTable("liked_songs", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull().unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  thumbnail: text("thumbnail").notNull(),
  duration: text("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Simple named playlists
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tracks inside a playlist
export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: serial("playlist_id")
    .notNull()
    .references(() => playlists.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  thumbnail: text("thumbnail").notNull(),
  duration: text("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
