import { useEffect, useState } from "react";
import { getTopArtists, getTopArtistsByCountry, getTopTracks, getTopTracksByCountry } from "../api/lastfm";
import type { Artist, Track } from "../types";
import { ArtistCard, TrackRow } from "./Cards";

const COUNTRIES = ["Ukraine", "United States", "United Kingdom", "Germany", "Poland", "France", "Japan", "Brazil"];

interface Props {
  onArtistClick: (name: string) => void;
  onAddTrack: (track: { name: string; artist: string }) => void;
}

export default function TopCharts({ onArtistClick, onAddTrack }: Props) {
  const [mode, setMode] = useState<"global" | "country">("global");
  const [country, setCountry] = useState("Ukraine");
  const [tab, setTab] = useState<"artists" | "tracks">("artists");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const load = tab === "artists"
      ? mode === "global" ? getTopArtists(20) : getTopArtistsByCountry(country, 20)
      : mode === "global" ? getTopTracks(20) : getTopTracksByCountry(country, 20);
    load
      .then((data) => {
        if (cancelled) return;
        if (tab === "artists") setArtists(data as Artist[]);
        else setTracks(data as Track[]);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [mode, country, tab]);

  return (
    <section>
      <div className="section-head">
        <h2>Top charts</h2>
        <div className="tabs">
          <button className={mode === "global" ? "tab active" : "tab"} onClick={() => setMode("global")}>Global</button>
          <button className={mode === "country" ? "tab active" : "tab"} onClick={() => setMode("country")}>By country</button>
        </div>
        {mode === "country" && (
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        )}
        <div className="tabs">
          <button className={tab === "artists" ? "tab active" : "tab"} onClick={() => setTab("artists")}>Artists</button>
          <button className={tab === "tracks" ? "tab active" : "tab"} onClick={() => setTab("tracks")}>Tracks</button>
        </div>
      </div>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && tab === "artists" && (
        <div className="grid">
          {artists.map((a, i) => (
            <ArtistCard key={a.name} artist={a} rank={i + 1} onClick={onArtistClick} />
          ))}
        </div>
      )}
      {!loading && !error && tab === "tracks" && (
        <div className="track-list">
          {tracks.map((t, i) => (
            <TrackRow key={t.name + i} track={t} rank={i + 1} onArtistClick={onArtistClick} onAdd={onAddTrack} />
          ))}
        </div>
      )}
    </section>
  );
}
