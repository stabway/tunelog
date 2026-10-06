import { artistImage } from "../api/lastfm";
import type { Album, Artist, Track } from "../types";

const artistName = (a: string | { name?: string } | undefined) =>
  typeof a === "string" ? a : (a?.name ?? "Unknown");

export function ArtistCard({ artist, rank, onClick }: { artist: Artist; rank?: number; onClick?: (name: string) => void }) {
  const image = artistImage(artist);
  return (
    <div className="card" onClick={() => onClick?.(artist.name)}>
      {rank && <span className="rank">{rank}</span>}
      {image ? <img src={image} alt={artist.name} /> : <div className="no-img">🎤</div>}
      <div className="card-body">
        <strong>{artist.name}</strong>
        {artist.listeners && <span>{Number(artist.listeners).toLocaleString()} listeners</span>}
      </div>
    </div>
  );
}

export function AlbumCard({ album, onClick }: { album: Album; onClick?: (artist: string, album: string) => void }) {
  const image = album.image?.find((i) => i.size === "large")?.["#text"] ?? "";
  const name = artistName(album.artist);
  return (
    <div className="card" onClick={() => onClick?.(name, album.name)}>
      {image ? <img src={image} alt={album.name} /> : <div className="no-img">💿</div>}
      <div className="card-body">
        <strong>{album.name}</strong>
        <span>{name}</span>
      </div>
    </div>
  );
}

interface TrackRowProps {
  track: Track;
  rank?: number;
  onArtistClick?: (name: string) => void;
  onAdd?: (track: { name: string; artist: string }) => void;
}

export function TrackRow({ track, rank, onArtistClick, onAdd }: TrackRowProps) {
  const name = artistName(track.artist);
  return (
    <div className="track-row">
      {rank && <span className="rank">{rank}</span>}
      <div className="track-info">
        <strong>{track.name}</strong>
        <button className="link" onClick={() => onArtistClick?.(name)}>
          {name}
        </button>
      </div>
      {track.listeners && <span className="listeners">{Number(track.listeners).toLocaleString()}</span>}
      {onAdd && (
        <button className="add-btn" title="Add to playlist" onClick={() => onAdd({ name: track.name, artist: name })}>
          +
        </button>
      )}
    </div>
  );
}
