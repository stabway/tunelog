// Lyrics via LRCLIB (https://lrclib.net) — free, no API key, CORS-enabled
// Last.fm removed lyrics from their API years ago, so this fills the gap

interface LrcLibResult {
  plainLyrics?: string;
  syncedLyrics?: string;
  instrumental?: boolean;
}

export async function getLyrics(artist: string, name: string): Promise<string | null> {
  const qs = new URLSearchParams({ artist_name: artist, track_name: name });
  try {
    // exact match first
    const res = await fetch(`https://lrclib.net/api/get?${qs}`);
    if (res.ok) {
      const data = (await res.json()) as LrcLibResult;
      if (data.instrumental) return "Instrumental";
      if (data.plainLyrics) return data.plainLyrics;
    }
    // fall back to search
    const res2 = await fetch(`https://lrclib.net/api/search?${qs}`);
    if (res2.ok) {
      const arr = (await res2.json()) as LrcLibResult[];
      const hit = arr?.find((t) => t?.plainLyrics || t?.instrumental);
      if (hit?.instrumental) return "Instrumental";
      if (hit?.plainLyrics) return hit.plainLyrics;
    }
  } catch {
    return null;
  }
  return null;
}
