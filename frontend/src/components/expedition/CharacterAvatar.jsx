import React from "react";

const ACCENT_CLASS = {
  arjun: "accent-arjun",
  maya: "accent-maya",
  tenzin: "accent-tenzin",
  priya: "accent-priya",
  system: "accent-system",
};

export function CharacterAvatar({ character, size = 40, ring = false }) {
  const cls = ACCENT_CLASS[character?.id || character] || "accent-system";
  const initials = character?.initials || "EX";
  return (
    <div
      data-testid={`avatar-${character?.id || character}`}
      className={`${cls} ${
        ring ? "ring-2 ring-white/40" : ""
      } text-white font-display font-semibold flex items-center justify-center rounded-full shadow-sm shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
