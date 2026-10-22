export interface LfmImage {
  size: string;
  "#text": string;
}

export interface Artist {
  name: string;
  mbid?: string;
  url?: string;
  image?: LfmImage[];
  listeners?: string;
  playcount?: string;
  match?: string;
}

export interface Album {
  name: string;
  artist?: string | { name: string };
  mbid?: string;
  url?: string;
  image?: LfmImage[];
  listeners?: string;
  playcount?: string;
}

export interface AlbumInfo {
  name: string;
  artist?: string | { name: string };
  mbid?: string;
  url?: string;
  image?: LfmImage[];
  listeners?: string;
  playcount?: string;
  tracks?: { track?: Track[] | Track };
  wiki?: { summary?: string; content?: string };
  tags?: { tag?: { name: string }[] };
}

export interface Track {
  name: string;
  artist?: string | { name: string };
  mbid?: string;
  url?: string;
  image?: LfmImage[];
  listeners?: string;
  playcount?: string;
  duration?: string;
}

export interface TrackInfo {
  name: string;
  artist?: string | { name: string };
  album?: string | { title?: string; artist?: string; mbid?: string; url?: string };
  mbid?: string;
  url?: string;
  image?: LfmImage[];
  duration?: string;
  listeners?: string;
  playcount?: string;
  wiki?: { summary?: string; content?: string };
  toptags?: { tag?: { name: string }[] };
}

export interface ArtistInfo {
  name: string;
  bio?: { summary?: string; content?: string };
  image?: LfmImage[];
  tags?: { tag?: { name: string }[] };
  stats?: { listeners?: string; playcount?: string };
  similar?: { artist?: Artist[] };
}

export interface PlaylistTrack {
  name: string;
  artist: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: PlaylistTrack[];
}

export type SearchTab = "artist" | "album" | "track";
