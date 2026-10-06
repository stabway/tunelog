import { useEffect, useState } from "react";

// ---- TheAudioDB fallback (free test key "2", no signup needed) ----
const tadbCache = new Map<string, string | null>();

async function fetchArtistThumb(artist: string): Promise<string | null> {
  const key = artist.toLowerCase();
  if (tadbCache.has(key)) return tadbCache.get(key)!;
  try {
    const res = await fetch(
      `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(artist)}`
    );
    const data = await res.json();
    const thumb: string | null = data?.artists?.[0]?.strArtistThumb ?? null;
    tadbCache.set(key, thumb);
    return thumb;
  } catch {
    tadbCache.set(key, null);
    return null;
  }
}

interface Props {
  /** URL from Last.fm (may be empty or dead) */
  src?: string;
  /** Artist name — used to fetch a fallback photo from TheAudioDB */
  artist?: string;
  alt: string;
  className?: string;
  emoji?: string;
}

/**
 * Image with a graceful fallback chain:
 *   last.fm image → TheAudioDB artist photo → placeholder tile
 */
export default function SmartImage({ src, artist, alt, className, emoji = "🎤" }: Props) {
  const [stage, setStage] = useState<"lfm" | "tadb" | "none">(
    src ? "lfm" : artist ? "tadb" : "none"
  );
  const [tadbUrl, setTadbUrl] = useState("");

  useEffect(() => {
    setTadbUrl("");
    setStage(src ? "lfm" : artist ? "tadb" : "none");
  }, [src, artist]);

  useEffect(() => {
    if (stage !== "tadb" || !artist) return;
    let cancelled = false;
    fetchArtistThumb(artist).then((u) => {
      if (cancelled) return;
      if (u) setTadbUrl(u);
      else setStage("none");
    });
    return () => {
      cancelled = true;
    };
  }, [stage, artist]);

  const current = stage === "lfm" ? src : stage === "tadb" ? tadbUrl : "";

  if (!current) {
    return <div className={className ? `${className} no-img` : "no-img"}>{emoji}</div>;
  }

  return (
    <img
      className={className}
      src={current}
      alt={alt}
      loading="lazy"
      onError={() =>
        // dead last.fm link → try TheAudioDB; dead fallback → placeholder
        setStage((s) => (s === "lfm" && artist ? "tadb" : "none"))
      }
    />
  );
}
