// Lightweight YouTube search scraper using the public search page and the
// embedded `ytInitialData` JSON blob. No API key, no heavy dependencies.

export interface RawVideo {
  videoId: string;
  title: string;
  duration: string;
  thumbnail: string;
  channel?: string;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36";

export async function searchYoutube(query: string): Promise<RawVideo[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}&hl=en`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!res.ok) return [];

  const html = await res.text();

  const marker = "var ytInitialData = ";
  const start = html.indexOf(marker);
  if (start === -1) return [];

  let end = html.indexOf(";</script>", start);
  if (end === -1) end = html.indexOf("};", start) + 1;
  const jsonStr = html.slice(start + marker.length, end);

  let data: any;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    return [];
  }

  // Walk the nested contents structure to find videoRenderers / items.
  const videos: RawVideo[] = [];
  const seen = new Set<string>();

  function visit(node: any) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }

    // A video renderer
    if (node.videoRenderer) {
      extractVideo(node.videoRenderer, videos, seen);
    }
    // Compact/related renderers
    if (node.compactVideoRenderer) {
      extractVideo(node.compactVideoRenderer, videos, seen, true);
    }
    if (node.playlistVideoRenderer) {
      extractVideo(node.playlistVideoRenderer, videos, seen);
    }

    // Recurse into common wrappers but avoid known big non-item subtrees.
    for (const key of Object.keys(node)) {
      if (key === "videoRenderer" || key === "compactVideoRenderer") continue;
      const val = node[key];
      if (val && typeof val === "object") {
        visit(val);
      }
    }
  }

  visit(data);

  return videos.slice(0, 30);
}

function extractVideo(
  r: any,
  out: RawVideo[],
  seen: Set<string>,
  compact = false
) {
  const videoId = r?.videoId;
  if (!videoId || seen.has(videoId)) return;
  seen.add(videoId);

  const title =
    r?.title?.runs?.map((t: any) => t.text).join("") ||
    r?.title?.simpleText ||
    "Untitled";

  const duration =
    r?.lengthText?.simpleText ||
    r?.lengthText?.accessibility?.accessibilityData?.label ||
    r?.lengthText?.runs?.map((t: any) => t.text).join("") ||
    "0:00";

  const thumb = (r?.thumbnail?.thumbnails ?? []).pop();
  const thumbnail =
    thumb?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const channel =
    r?.ownerText?.runs?.map((t: any) => t.text).join("") ||
    r?.longBylineText?.runs?.map((t: any) => t.text).join("") ||
    r?.shortBylineText?.runs?.map((t: any) => t.text).join("") ||
    undefined;

  out.push({ videoId, title, duration, thumbnail, channel });
}
