import { useState } from "react";
import type { AppType } from "@design-brief/core";

export interface Brief {
  /** Free-text label (e.g. "admin dashboard") — shown back to the user. */
  appType: string;
  /** Structured family that drives which directions are seeded. */
  appFamily: AppType;
  audience: string;
  personality: string[];
}

const APP_FAMILIES: { value: AppType; label: string }[] = [
  { value: "marketing", label: "Marketing / landing" },
  { value: "commerce", label: "E-commerce" },
  { value: "content", label: "Content / blog" },
  { value: "docs", label: "Docs / knowledge base" },
  { value: "app", label: "Web app" },
  { value: "dashboard", label: "Dashboard / admin" },
  { value: "mobile", label: "Mobile app" },
  { value: "portfolio", label: "Portfolio" },
  { value: "brand", label: "Agency / brand" },
];

const SUGGESTED = [
  "precise",
  "dense",
  "technical",
  "friendly",
  "approachable",
  "rounded",
  "clean",
  "calm",
  "modern",
  "refined",
  "spacious",
  "typographic",
  "bold",
  "raw",
  "high-contrast",
];

export function BriefForm({ onSubmit }: { onSubmit: (b: Brief) => void }) {
  const [appType, setAppType] = useState("admin dashboard");
  const [appFamily, setAppFamily] = useState<AppType>("dashboard");
  const [audience, setAudience] = useState("power users");
  const [picked, setPicked] = useState<string[]>(["precise", "dense"]);

  function toggle(word: string) {
    setPicked((p) => (p.includes(word) ? p.filter((w) => w !== word) : [...p, word]));
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Describe your interface</h1>
        <p className="text-neutral-500 mt-1">
          A few words. We seed coherent directions from the preset library — no AI, instant, free.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">App type</span>
        <input
          value={appType}
          onChange={(e) => setAppType(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Category</span>
        <select
          value={appFamily}
          onChange={(e) => setAppFamily(e.target.value as AppType)}
          className="w-full border border-neutral-300 rounded px-3 py-2 bg-white"
        >
          {APP_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-neutral-400">Steers which directions are seeded.</span>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Audience</span>
        <input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2"
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium">Personality</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => toggle(w)}
              className={`text-sm px-3 py-1 rounded-full border transition ${
                picked.includes(w)
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit({ appType, appFamily, audience, personality: picked })}
        className="bg-neutral-900 text-white rounded px-4 py-2 font-medium hover:bg-neutral-800"
      >
        Show directions →
      </button>
    </div>
  );
}
