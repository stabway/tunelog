import { useState } from "react";
import SearchBar from "./components/SearchBar";
import TopCharts from "./components/TopCharts";
import ArtistDetail from "./components/ArtistDetail";
import PlaylistPanel from "./components/PlaylistPanel";
import { AlbumCard, ArtistCard, TrackRow } from "./components/Cards";
import { searchAlbums, searchArtists, searchTracks } from "./api/lastfm";
import { PlaylistProvider } from "./context/PlaylistContext";
import type { Album, Artist, PlaylistTrack, SearchTab, Track } from "./types";

function AppInner() {
  const [view, setView] = useState<"home" | "playlists">("home");
  const [tab, setTab] = useState<SearchTab>("artist");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ artists: Artist[]; albums: Album[]; tracks: Track[] }>({
    artists: [], albums: [], tracks: [],
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [artistStack, setArtistStack] = useState<string[]>([]);
  const [pendingTrack, setPendingTrack] = useState<PlaylistTrack | null>(null);

  const selectedArtist = artistStack[artistStack.length - 1] ?? "";

  const openArtist = (name: string) => {
    if (!name) return;
    setArtistStack((s) => (s[s.length - 1] === name ? s : [...s, name]));
    window.scrollTo({ top: 0 });
  };

  const closeArtist = () => setArtistStack((s) => s.slice(0, -1));

  const handleSearch = async (q: string) => {
    setLoading(true);
    setError("");
    setArtistStack([]);
    setQuery(q);
    setSearched(true);
    try {
      if (tab === "artist") {
        const artists = await searchArtists(q);
        setResults((r) => ({ ...r, artists }));
      } else if (tab === "album") {
        const albums = await searchAlbums(q);
        setResults((r) => ({ ...r, albums }));
      } else {
        const tracks = await searchTracks(q);
        setResults((r) => ({ ...r, tracks }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>TuneLog</h1>
        <nav>
          <button className={view === "home" ? "tab active" : "tab"} onClick={() => setView("home")}>Каталог</button>
          <button className={view === "playlists" ? "tab active" : "tab"} onClick={() => setView("playlists")}>Плейлісти</button>
        </nav>
      </header>

      {view === "playlists" ? (
        <PlaylistPanel pendingTrack={pendingTrack} />
      ) : (
        <>
          <SearchBar tab={tab} onTabChange={setTab} onSearch={handleSearch} loading={loading} />

          {error && <p className="error">{error}</p>}
          {loading && <p className="muted">Шукаю... {tab}…</p>}

          {selectedArtist ? (
            <ArtistDetail
              name={selectedArtist}
              onBack={closeArtist}
              onArtistClick={openArtist}
              onAddTrack={setPendingTrack}
            />
          ) : (
            <>
              {searched && !loading && !error && (
                <section>
                  <h2>Результати по “{query}”</h2>
                  {tab === "artist" && (
                    <div className="grid">
                      {results.artists.map((a) => (
                        <ArtistCard key={a.name} artist={a} onClick={openArtist} />
                      ))}
                    </div>
                  )}
                  {tab === "album" && (
                    <div className="grid">
                      {results.albums.map((a) => (
                        <AlbumCard key={a.name + (typeof a.artist === "string" ? a.artist : a.artist?.name)} album={a} />
                      ))}
                    </div>
                  )}
                  {tab === "track" && (
                    <div className="track-list">
                      {results.tracks.map((t) => (
                        <TrackRow
                          key={t.name + (typeof t.artist === "string" ? t.artist : t.artist?.name)}
                          track={t}
                          onArtistClick={openArtist}
                          onAdd={setPendingTrack}
                        />
                      ))}
                    </div>
                  )}
                  {((tab === "artist" && !results.artists.length) ||
                    (tab === "album" && !results.albums.length) ||
                    (tab === "track" && !results.tracks.length)) && (
                    <p className="muted">Нічого не знайдено</p>
                  )}
                </section>
              )}

              {!searched && <TopCharts onArtistClick={openArtist} onAddTrack={setPendingTrack} />}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlaylistProvider>
      <AppInner />
    </PlaylistProvider>
  );
}
