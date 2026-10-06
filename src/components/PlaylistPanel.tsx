import { useState } from "react";
import { usePlaylists } from "../context/PlaylistContext";
import type { PlaylistTrack } from "../types";

export default function PlaylistPanel({ pendingTrack }: { pendingTrack: PlaylistTrack | null }) {
  const { playlists, createPlaylist, deletePlaylist, addTrack, removeTrack } = usePlaylists();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name.trim());
    setName("");
  };

  const effectiveTarget = target || playlists[0]?.id || "";

  return (
    <section>
      <h2>Playlists</h2>
      <form className="playlist-form" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New playlist name…" />
        <button type="submit">Create</button>
      </form>

      {pendingTrack && playlists.length > 0 && (
        <div className="pending">
          Add “{pendingTrack.name}” — {pendingTrack.artist} to:
          <select value={effectiveTarget} onChange={(e) => setTarget(e.target.value)}>
            {playlists.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => addTrack(effectiveTarget, pendingTrack)}>Add</button>
        </div>
      )}

      {playlists.length === 0 && <p className="muted">No playlists yet — create one above.</p>}

      {playlists.map((p) => (
        <div key={p.id} className="playlist">
          <div className="playlist-head">
            <strong>{p.name}</strong>
            <span className="muted">{p.tracks.length} tracks</span>
            <button className="link danger" onClick={() => deletePlaylist(p.id)}>delete</button>
          </div>
          {p.tracks.map((t, i) => (
            <div key={i} className="track-row">
              <div className="track-info">
                <strong>{t.name}</strong>
                <span className="muted">{t.artist}</span>
              </div>
              <button className="add-btn" onClick={() => removeTrack(p.id, i)}>×</button>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
