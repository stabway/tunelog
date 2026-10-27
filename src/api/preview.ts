export interface Preview {
  previewUrl: string;
  title: string;
  artist: string;
  artwork: string;
  link: string;
}

interface ItunesTrack {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const sameArtist = (a: string, b: string) => {
  const x = norm(a);
  const y = norm(b);
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};

function pickBest(results: ItunesTrack[], artist: string, name: string): ItunesTrack | null {
  const wanted = norm(name);
  const wantedRaw = name.toLowerCase().trim();
  let best: ItunesTrack | null = null;
  let bestScore = 0;

  for (const r of results) {
    if (!r.previewUrl || !r.trackName || !r.artistName) continue;
    if (!sameArtist(r.artistName, artist)) continue;

    const got = norm(r.trackName);
    let score = 0;
    if (r.trackName.toLowerCase().trim() === wantedRaw) score = 3;
    else if (got === wanted) score = 2;
    else if (got.includes(wanted) || wanted.includes(got)) score = 1;

    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}

async function fetchPreview(artist: string, name: string): Promise<Preview | null> {
  const qs = new URLSearchParams({
    term: `${artist} ${name}`,
    media: "music",
    entity: "song",
    limit: "10",
  });
  const res = await fetch(`https://itunes.apple.com/search?${qs}`);
  if (!res.ok) throw new Error(`iTunes error: ${res.status}`);
  const data = (await res.json()) as { results?: ItunesTrack[] };

  const hit = pickBest(data.results ?? [], artist, name);
  if (!hit?.previewUrl) return null;

  return {
    previewUrl: hit.previewUrl,
    title: hit.trackName ?? name,
    artist: hit.artistName ?? artist,
    artwork: (hit.artworkUrl100 ?? "").replace("100x100", "300x300"),
    link: hit.trackViewUrl ?? "https://music.apple.com",
  };
}

const cache = new Map<string, Promise<Preview | null>>();

export function getPreview(artist: string, name: string): Promise<Preview | null> {
  const key = `${artist}|||${name}`.toLowerCase();
  let p = cache.get(key);
  if (!p) {
    // a failed request resolves to null and is NOT cached, so it can be retried later
    p = fetchPreview(artist, name).catch(() => {
      cache.delete(key);
      return null;
    });
    cache.set(key, p);
  }
  return p;
}
