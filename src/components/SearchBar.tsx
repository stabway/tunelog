import { useState } from "react";
import type { SearchTab } from "../types";

interface Props {
  tab: SearchTab;
  onTabChange: (t: SearchTab) => void;
  onSearch: (q: string) => void;
  loading: boolean;
}

export default function SearchBar({ tab, onTabChange, onSearch, loading }: Props) {
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) onSearch(q.trim());
  };

  return (
    <form className="search-bar" onSubmit={submit}>
      <div className="tabs">
        {(["artist", "album", "track"] as SearchTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "tab active" : "tab"}
            onClick={() => onTabChange(t)}
          >
            {t}s
          </button>
        ))}
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${tab}s…`}
      />
      <button type="submit" disabled={loading}>
        {loading ? "…" : "Search"}
      </button>
    </form>
  );
}
