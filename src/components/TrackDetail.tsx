import { useEffect, useState } from "react";
import { getAlbumInfo, getSimilarTracks, getTrackInfo } from "../api/lastfm";
import { getLyrics } from "../api/lyrics";
import { getPreview, type Preview } from "../api/preview";
import type { Track, TrackInfo } from "../types";
import { TrackRow } from "./Cards";
import PreviewPlayer from "./PreviewPlayer";
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
  const [cover, setCover] = useState("");
  const [similar, setSimilar] = useState<Track[]>([]);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsDone, setLyricsDone] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");

  // reset stale state when the track changes (adjust-during-render pattern)
  const trackKey = `${artist}|||${name}`;
  const [prevKey, setPrevKey] = useState(trackKey);
  if (prevKey !== trackKey) {
    setPrevKey(trackKey);
    setInfo(null);
    setCover("");
    setSimilar([]);
    setLyrics(null);
    setLyricsDone(false);
    setPreview(null);
    setError("");
  }

  useEffect(() => {
    let cancelled = false;
    getPreview(artist, name).then((p) => {
      if (!cancelled) setPreview(p);
    });
    return () => { cancelled = true; };
  }, [artist, name]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [i, s, l] = await Promise.all([
          getTrackInfo(artist, name),
          getSimilarTracks(artist, name),
          getLyrics(artist, name).catch(() => null),
        ]);
        if (cancelled) return;
        setInfo(i);
        setSimilar(s);
        setLyrics(l);
        setLyricsDone(true);
        const albumTitle = typeof i.album === "string" ? i.album : i.album?.title;
        const albumArtist =
          typeof i.album === "object" && i.album?.artist
            ? i.album.artist
            : typeof i.artist === "string"
              ? i.artist
              : (i.artist?.name ?? artist);
        if (albumTitle) {
          const ai = await getAlbumInfo(albumArtist, albumTitle).catch(() => null);
          if (cancelled || !ai) return;
          setCover(ai.image?.find((im) => im.size === "large")?.["#text"] ?? "");
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
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
        <SmartImage className="artist-img" src={cover} alt={name} />
        <div>
          <h2>{info.name}</h2>
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

      {preview && <PreviewPlayer key={preview.previewUrl} preview={preview} />}

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
