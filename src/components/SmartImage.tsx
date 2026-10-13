import { useEffect, useState } from "react";

const LFM_PLACEHOLDER_IDS = ["2a96cbd8b46e442fc41c2b86b821562f"];

function isLfmPlaceholder(src?: string): boolean {
  if (!src) return true;
  return LFM_PLACEHOLDER_IDS.some((id) => src.includes(id));
}


// TheAudioDB free test key is now "123" (the old "2" returns 404).
async function fetchTadbThumb(artist: string): Promise<string | null> {
  const res = await fetch(
    `https://www.theaudiodb.com/api/v1/json/123/search.php?s=${encodeURIComponent(artist)}`
  );
  const data = await res.json();
  return data?.artists?.[0]?.strArtistThumb ?? null;
}

async function fetchDeezerPicture(artist: string): Promise<string | null> {
  const res = await fetch(
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}&limit=1`
  );
  const data = await res.json();
  return data?.data?.[0]?.picture_big ?? data?.data?.[0]?.picture ?? null;
}

async function fetchWikiImage(artist: string): Promise<string | null> {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.originalimage?.source ?? data?.thumbnail?.source ?? null;
}

type Stage = "lfm" | "tadb" | "deezer" | "wiki" | "none";

const FALLBACKS: Partial<Record<Stage, (a: string) => Promise<string | null>>> = {
  tadb: fetchTadbThumb,
  deezer: fetchDeezerPicture,
  wiki: fetchWikiImage,
};

function nextStage(s: Stage): Stage {
  if (s === "lfm") return "tadb";
  if (s === "tadb") return "deezer";
  if (s === "deezer") return "wiki";
  return "none";
}

const fallbackCache = new Map<string, Promise<string | null>>();

function fetchFallback(stage: Stage, artist: string): Promise<string | null> {
  const key = `${stage}:${artist.toLowerCase()}`;
  if (!fallbackCache.has(key)) {
    fallbackCache.set(key, FALLBACKS[stage]!(artist).catch(() => null));
  }
  return fallbackCache.get(key)!;
}

interface Props {
  src?: string;
  artist?: string;
  alt: string;
  className?: string;
  emoji?: string;
}

export default function SmartImage({ src, artist, alt, className, emoji = "🎤" }: Props) {
  const [stage, setStage] = useState<Stage>(
    !isLfmPlaceholder(src) ? "lfm" : artist ? "tadb" : "none"
  );
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl("");
    setStage(!isLfmPlaceholder(src) ? "lfm" : artist ? "tadb" : "none");
  }, [src, artist]);

  useEffect(() => {
    if (stage === "lfm" || stage === "none" || !artist) return;
    let cancelled = false;
    fetchFallback(stage, artist).then((u) => {
      if (cancelled) return;
      if (u) setUrl(u);
      else setStage((s) => nextStage(s));
    });
    return () => {
      cancelled = true;
    };
  }, [stage, artist]);

  const current = stage === "lfm" ? src : url;

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
        setStage((s) => nextStage(s))
      }
    />
  );
}
