import { useEffect, useState } from "react";
import { getArtistInfo, getArtistTopAlbums, getArtistTopTracks, getSimilarArtists } from "../api/lastfm";
import type { Album, Artist, ArtistInfo, Track } from "../types";
import { AlbumCard, ArtistCard, TrackRow } from "./Cards";
import SmartImage from "./SmartImage";

interface Props {
  name: string;
  onArtistClick: (name: string) => void;
  onAddTrack: (track: { name: string; artist: string }) => void;
}

export default function ArtistDetail({ name, onArtistClick, onAddTrack }: Props) {
  const [info, setInfo] = useState<ArtistInfo | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [similar, setSimilar] = useState<Artist[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setInfo(null);
    setError("");
    Promise.all([
      getArtistInfo(name),
      getArtistTopAlbums(name),
      getArtistTopTracks(name),
      getSimilarArtists(name),
    ])
      .then(([i, a, t, s]) => {
        if (cancelled) return;
        setInfo(i);
        setAlbums(a.filter((al) => al.name !== "(null)"));
        setTracks(t);
        setSimilar(s);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [name]);

  if (error) return <p className="error">{error}</p>;
  if (!info) return <p className="muted">Loading {name}…</p>;

  const bio = info.bio?.summary?.replace(/<a[^>]*>.*?<\/a>/g, "").trim() ?? "";

  return (
    <section>
      <button className="link" onClick={() => onArtistClick("")}>← Back</button>
      <div className="artist-head">
        <SmartImage
          className="artist-img"
          src={info.image?.find((i) => i.size === "large")?.["#text"]}
          artist={info.name}
          alt={info.name}
        />
        <div>
          <h2>{info.name}</h2>
          {info.tags?.tag && (
            <div className="tags">
              {info.tags.tag.map((t) => <span key={t.name} className="tag">{t.name}</span>)}
            </div>
          )}
          {info.stats && (
            <p className="muted">
              {Number(info.stats.listeners ?? 0).toLocaleString()} listeners ·{" "}
              {Number(info.stats.playcount ?? 0).toLocaleString()} plays
            </p>
          )}
        </div>
      </div>
      {bio && <p className="bio">{bio}</p>}

      <h3>Top tracks</h3>
      <div className="track-list">
        {tracks.map((t) => (
          <TrackRow key={t.name} track={t} onArtistClick={() => {}} onAdd={onAddTrack} />
        ))}
      </div>

      <h3>Top albums</h3>
      <div className="grid">
        {albums.map((a) => <AlbumCard key={a.name} album={a} />)}
      </div>

      <h3>Similar artists</h3>
      <div className="grid">
        {similar.map((a) => (
          <ArtistCard key={a.name} artist={a} onClick={onArtistClick} />
        ))}
      </div>
    </section>
  );
}
