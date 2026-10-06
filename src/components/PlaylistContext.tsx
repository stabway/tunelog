import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Playlist, PlaylistTrack } from "../types";

interface PlaylistCtx {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrack: (playlistId: string, track: PlaylistTrack) => void;
  removeTrack: (playlistId: string, index: number) => void;
}

const Ctx = createContext<PlaylistCtx | null>(null);
const STORAGE_KEY = "tunelog-playlists";

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = (name: string) =>
    setPlaylists((p) => [...p, { id: crypto.randomUUID(), name, tracks: [] }]);

  const deletePlaylist = (id: string) =>
    setPlaylists((p) => p.filter((pl) => pl.id !== id));

  const addTrack = (playlistId: string, track: PlaylistTrack) =>
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId &&
        !pl.tracks.some((t) => t.name === track.name && t.artist === track.artist)
          ? { ...pl, tracks: [...pl.tracks, track] }
          : pl
      )
    );

  const removeTrack = (playlistId: string, index: number) =>
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId ? { ...pl, tracks: pl.tracks.filter((_, i) => i !== index) } : pl
      )
    );

  return (
    <Ctx.Provider value={{ playlists, createPlaylist, deletePlaylist, addTrack, removeTrack }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlaylists must be used within PlaylistProvider");
  return ctx;
}
