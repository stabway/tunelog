// Artist-photo fallbacks, extracted out of the SmartImage component
// Deezer was removed: api.deezer.com rejects browser requests via CORS,
// so that stage could never succeed and only wasted a request

export const LFM_STAR_ID = "2a96cbd8b46e442fc41c2b86b821562f";
export const LFM_STAR_IMG = `https://lastfm-img.freetls.fastly.net/i/u/174s/${LFM_STAR_ID}.png`;

/** true when the src is empty or Last.fm's star placeholder */
export function isLfmPlaceholder(src?: string): boolean {
  return !src || src.includes(LFM_STAR_ID);
}

async function fetchTadbThumb(artist: string): Promise<string | null> {
  const res = await fetch(
    `https://www.theaudiodb.com/api/v1/json/123/search.php?s=${encodeURIComponent(artist)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.artists?.[0]?.strArtistThumb ?? null;
}

async function fetchWikiImage(artist: string): Promise<string | null> {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.originalimage?.source ?? data?.thumbnail?.source ?? null;
}

const cache = new Map<string, Promise<string | null>>();

function cached(stage: "tadb" | "wiki", artist: string, fn: (a: string) => Promise<string | null>) {
  const key = `${stage}:${artist.toLowerCase()}`;
  if (!cache.has(key)) {
    cache.set(key, fn(artist).catch(() => null));
  }
  return cache.get(key)!;
}

export async function fetchArtistImage(artist: string): Promise<string | null> {
  return (
    (await cached("tadb", artist, fetchTadbThumb)) ??
    (await cached("wiki", artist, fetchWikiImage))
  );
}
