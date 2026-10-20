import { useEffect, useState } from "react";
import { getSimilarTracks, getTrackInfo } from "../api/lastfm";
import { getLyrics } from "../api/lyrics";
import type { Track, TrackInfo } from "../types";
import { TrackRow } from "./Cards";
import SmartImage from "./SmartImage";

interface Props {
  name: string;
  artist: string;
  onBack: () => void;
  onArtistClick: (name: string) => void;
  onTrackClick: (name: string, artist: string) => void;
  onAddTrack: (track: { name: string; artist: string }) => void;
}

function formatDuration(ms: number) {
  if (!ms || !isFinite(ms)) return "";
  const sec = Math.round(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export default function TrackDetail({ name, artist, onBack, onArtistClick, onTrackClick, onAddTrack }: Props) {
  const [info, setInfo] = useState<TrackInfo | null>(null);
  const [similar, setSimilar] = useState<Track[]>([]);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsDone, setLyricsDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setInfo(null);
    setSimilar([]);
    setLyrics(null);
    setLyricsDone(false);
    setError("");
    Promise.all([
      getTrackInfo(artist, name),
      getSimilarTracks(artist, name),
      getLyrics(artist, name).catch(() => null),
    ])
      .then(([i, s, l]) => {
        if (cancelled) return;
        setInfo(i);
        setSimilar(s);
        setLyrics(l);
        setLyricsDone(true);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [artist, name]);

  if (error) return <p className="error">{error}</p>;
  if (!info) return <p className="muted">Loading {name}…</p>;

  const artistName = typeof info.artist === "string" ? info.artist : (info.artist?.name ?? artist);
  const albumName = typeof info.album === "string" ? info.album : info.album?.title;
  const desc = info.wiki?.summary?.replace(/<a[^>]*>.*?<\/a>/g, "").trim() ?? "";
  const duration = formatDuration(Number(info.duration));

  return (
    <section>
      <button className="link" onClick={onBack}>← Back</button>
      <div className="artist-head">
        <SmartImage
          className="artist-img"
          src={info.image?.find((i) => i.size === "large")?.["#text"]}
          artist={artistName}
          alt={name}
        />
        <div>
          <h2 className="artist-title">{info.name}</h2>
          <button className="album-artist" onClick={() => onArtistClick(artistName)}>{artistName}</button>
          {info.toptags?.tag && (
            <div className="tags">
              {info.toptags.tag.map((t) => <span key={t.name} className="tag">{t.name}</span>)}
            </div>
          )}
          {(duration || info.listeners || info.playcount || albumName) && (
            <p className="muted">
              {duration && <>{duration} · </>}
              {info.listeners && <>{Number(info.listeners).toLocaleString()} listeners</>}
              {info.listeners && info.playcount && " · "}
              {info.playcount && <>{Number(info.playcount).toLocaleString()} plays</>}
              {albumName && <> · from the album “{albumName}”</>}
            </p>
          )}
        </div>
      </div>

      <h3>Lyrics</h3>
      {lyrics ? (
        <div className="lyrics">{lyrics}</div>
      ) : (
        <p className="muted">{lyricsDone ? "Lyrics not available for this track." : "Loading lyrics…"}</p>
      )}

      {desc && (
        <>
          <h3>About</h3>
          <p className="bio">{desc}</p>
        </>
      )}

      <h3>Similar tracks</h3>
      {similar.length ? (
        <div className="track-list">
          {similar.map((t, i) => (
            <TrackRow
              key={t.name + i}
              track={t}
              onArtistClick={onArtistClick}
              onTrackClick={(tr) => onTrackClick(tr.name, tr.artist)}
              onAdd={onAddTrack}
            />
          ))}
        </div>
      ) : (
        <p className="muted">No similar tracks found.</p>
      )}
    </section>
  );
}
