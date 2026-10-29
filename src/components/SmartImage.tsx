import { useEffect, useState } from "react";
import { fetchArtistImage, isLfmPlaceholder, LFM_STAR_IMG } from "../api/images";

type Stage = "lfm" | "fallback" | "none";

interface Props {
  src?: string;
  artist?: string;
  alt: string;
  className?: string;
}

export default function SmartImage({ src, artist, alt, className }: Props) {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>(
    !isLfmPlaceholder(src) ? "lfm" : artist ? "fallback" : "none"
  );

  useEffect(() => {
    setUrl("");
    setStage(!isLfmPlaceholder(src) ? "lfm" : artist ? "fallback" : "none");
  }, [src, artist]);

  useEffect(() => {
    if (stage !== "fallback" || !artist) return;
    let cancelled = false;
    fetchArtistImage(artist).then((u) => {
      if (cancelled) return;
      if (u) setUrl(u);
      else setStage("none");
    });
    return () => {
      cancelled = true;
    };
  }, [stage, artist]);

  const current = stage === "lfm" ? src : url;

  if (!current) {
    return <img className={className} src={LFM_STAR_IMG} alt={alt} loading="lazy" />;
  }

  return (
    <img
      className={className}
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => setStage((s) => (s === "lfm" ? "fallback" : "none"))}
    />
  );
}
