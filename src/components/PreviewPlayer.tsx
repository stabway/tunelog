import { useEffect, useRef, useState } from "react";
import type { Preview } from "../api/preview";

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
  </svg>
);

export default function PreviewPlayer({ preview }: { preview: Preview }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(30); // previews are ~30s; real value arrives with metadata

  // make sure sound never keeps playing after leaving the track page
  useEffect(() => {
    const el = audioRef.current;
    return () => el?.pause();
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  };

  const seek = (value: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = value;
    setCurrent(value);
  };

  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;

  return (
    <div className="preview-player">
      <audio
        ref={audioRef}
        src={preview.previewUrl}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
      />

      {preview.artwork && <img className="preview-cover" src={preview.artwork} alt={preview.title} />}

      <div className="preview-meta">
        <strong>{preview.title}</strong>
        <span>{preview.artist}</span>
      </div>

      <button
        type="button"
        className="preview-play"
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play preview"}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      <span className="preview-time">{formatTime(current)}</span>
      <input
        type="range"
        className="preview-seek"
        min={0}
        max={duration}
        step={0.1}
        value={current}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="Seek"
      />
      <span className="preview-time">-{formatTime(duration - current)}</span>

      <a className="preview-link" href={preview.link} target="_blank" rel="noreferrer">
        Apple Music ↗
      </a>
    </div>
  );
}
