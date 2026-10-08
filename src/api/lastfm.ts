const API_KEY = "35c9ea17cc47a3668034997808f5a840";
const BASE = "https://ws.audioscrobbler.com/2.0/";

async function lfm(params: Record<string, string>) {
  const qs = new URLSearchParams({
    api_key: API_KEY,
    format: "json",
    ...params,
  });
  const res = await fetch(`${BASE}?${qs}`);
  if (!res.ok) throw new Error(`Last.fm error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.message ?? "Last.fm API error");
  return data;
}


// ---- search ----
export async function searchArtists(q: string, limit = 20) {
  const d = await lfm({ method: "artist.search", artist: q, limit: String(limit) });
  return (d.results?.artistmatches?.artist ?? []) as import("../types").Artist[];
}

export async function searchAlbums(q: string, limit = 20) {
  const d = await lfm({ method: "album.search", album: q, limit: String(limit) });
  return (d.results?.albummatches?.album ?? []) as import("../types").Album[];
}

export async function searchTracks(q: string, limit = 20) {
  const d = await lfm({ method: "track.search", track: q, limit: String(limit) });
  return (d.results?.trackmatches?.track ?? []) as import("../types").Track[];
}

// ---- charts ----
export async function getTopArtists(limit = 30) {
  const d = await lfm({ method: "chart.gettopartists", limit: String(limit) });
  return (d.artists?.artist ?? []) as import("../types").Artist[];
}

export async function getTopTracks(limit = 30) {
  const d = await lfm({ method: "chart.gettoptracks", limit: String(limit) });
  return (d.tracks?.track ?? []) as import("../types").Track[];
}

export async function getTopArtistsByCountry(country: string, limit = 30) {
  const d = await lfm({ method: "geo.gettopartists", country, limit: String(limit) });
  return (d.topartists?.artist ?? []) as import("../types").Artist[];
}

export async function getTopTracksByCountry(country: string, limit = 30) {
  const d = await lfm({ method: "geo.gettoptracks", country, limit: String(limit) });
  return (d.toptracks?.track ?? []) as import("../types").Track[];
}

// ---- artist detail ----
export async function getArtistInfo(name: string) {
  const d = await lfm({ method: "artist.getinfo", artist: name });
  return d.artist as import("../types").ArtistInfo;
}

export async function getSimilarArtists(name: string, limit = 12) {
  const d = await lfm({ method: "artist.getsimilar", artist: name, limit: String(limit) });
  return (d.similarartists?.artist ?? []) as import("../types").Artist[];
}

export async function getArtistTopAlbums(name: string, limit = 12) {
  const d = await lfm({ method: "artist.gettopalbums", artist: name, limit: String(limit) });
  return (d.topalbums?.album ?? []) as import("../types").Album[];
}

export async function getArtistTopTracks(name: string, limit = 12) {
  const d = await lfm({ method: "artist.gettoptracks", artist: name, limit: String(limit) });
  return (d.toptracks?.track ?? []) as import("../types").Track[];
}

// ---- album detail ----
export async function getAlbumInfo(artist: string, album: string) {
  const d = await lfm({ method: "album.getinfo", artist, album });
  return d.album as import("../types").AlbumInfo;
}

export async function getAlbumTopTags(artist: string, album: string, limit = 3) {
  const d = await lfm({ method: "album.gettoptags", artist, album });
  const tags = (d.toptags?.tag ?? []) as { name: string; count?: string }[];
  return tags
    .slice()
    .sort((a, b) => Number(b.count ?? 0) - Number(a.count ?? 0))
    .slice(0, limit)
    .map((t) => t.name);
}

export async function getTopAlbumsByTag(tag: string, limit = 20) {
  const d = await lfm({ method: "tag.gettopalbums", tag, limit: String(limit) });
  return (d.albums?.album ?? []) as import("../types").Album[];
}

// NOTE: Last.fm has no album.getsimilar endpoint, so "similar albums" are
// approximated: take the album's top tags, pull each tag's top albums,
// then merge and rank by tag weight + chart position.
export async function getSimilarAlbums(artist: string, album: string, limit = 12) {
  const tags = await getAlbumTopTags(artist, album, 3);
  const lists = await Promise.all(
    tags.map((t) => getTopAlbumsByTag(t, 20).catch(() => [] as import("../types").Album[]))
  );
  const scored = new Map<string, { album: import("../types").Album; score: number }>();
  lists.forEach((list, i) => {
    list.forEach((a, idx) => {
      const aArtist = typeof a.artist === "string" ? a.artist : a.artist?.name;
      if (!aArtist) return;
      if (aArtist.toLowerCase() === artist.toLowerCase() && a.name.toLowerCase() === album.toLowerCase()) return;
      const key = `${aArtist}|||${a.name}`.toLowerCase();
      const score = (3 - i) * 100 + (20 - idx); // earlier tag weighs more, higher chart rank is better
      const entry = scored.get(key);
      if (entry) entry.score += score;
      else scored.set(key, { album: a, score });
    });
  });
  return [...scored.values()]
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((e) => e.album);
}
