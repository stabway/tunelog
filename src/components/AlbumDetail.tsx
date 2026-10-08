import { useEffect, useState } from "react";
import { getAlbumInfo, getSimilarAlbums } from "../api/lastfm";
import type { Album, AlbumInfo, Track } from "../types";
import { AlbumCard, TrackRow } from "./Cards";
import SmartImage from "./SmartImage";

interface Props {
  artist: string;
  album: string;
  onBack: () => void;
  onArtistClick: (name: string) => void;
  onAlbumClick: (artist: string, album: string) => void;
  onAddTrack: (track: { name: string; artist: string }) => void;
}

export default function AlbumDetail({ artist, album, onBack, onArtistClick, onAlbumClick, onAddTrack }: Props) {
  const [info, setInfo] = useState<AlbumInfo | null>(null);
  const [similar, setSimilar] = useState<Album[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setInfo(null);
    setSimilar([]);
    setError("");
    Promise.all([getAlbumInfo(artist, album), getSimilarAlbums(artist, album)])
      .then(([i, s]) => {
        if (cancelled) return;
        setInfo(i);
        setSimilar(s);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [artist, album]);

  if (error) return <p className="error">{error}</p>;
  if (!info) return <p className="muted">Loading {album}…</p>;

  const artistName = typeof info.artist === "string" ? info.artist : (info.artist?.name ?? artist);
  const rawTracks = info.tracks?.track;
  const tracks: Track[] = Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [];
  const desc = info.wiki?.summary?.replace(/<a[^>]*>.*?<\/a>/g, "").trim() ?? "";

  return (
    <section>
      <button className="link" onClick={onBack}>← Back</button>
      <div className="artist-head">
        <SmartImage
          className="artist-img"
          src={info.image?.find((i) => i.size === "large")?.["#text"]}
          artist={info.name}
          alt={info.name}
        />
        <div>
          <h2>{info.name}</h2>
          <button className="link" onClick={() => onArtistClick(artistName)}>{artistName}</button>
          {info.tags?.tag && (
            <div className="tags">
              {info.tags.tag.map((t) => <span key={t.name} className="tag">{t.name}</span>)}
            </div>
          )}
          {info.listeners && info.playcount && (
            <p className="muted">
              {Number(info.listeners).toLocaleString()} listeners ·{" "}
              {Number(info.playcount).toLocaleString()} plays
            </p>
          )}
        </div>
      </div>

      <h3>About</h3>
      {desc ? <p className="bio">{desc}</p> : <p className="muted">No description available for this album.</p>}

      <h3>Tracklist</h3>
      {tracks.length ? (
        <div className="track-list">
          {tracks.map((t, i) => (
            <TrackRow
              key={t.name + i}
              track={{ ...t, artist: t.artist ?? artistName }}
              rank={i + 1}
              onArtistClick={onArtistClick}
              onAdd={onAddTrack}
            />
          ))}
        </div>
      ) : (
        <p className="muted">No tracklist available for this album.</p>
      )}

      <h3>Similar albums</h3>
      {similar.length ? (
        <div className="grid">
          {similar.map((a) => {
            const aArtist = typeof a.artist === "string" ? a.artist : (a.artist?.name ?? "");
            return <AlbumCard key={aArtist + a.name} album={a} onClick={onAlbumClick} />;
          })}
        </div>
      ) : (
        <p className="muted">No similar albums found.</p>
      )}
    </section>
  );
}
