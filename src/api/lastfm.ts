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
