import React, { useState } from "react";
import characters from "../../data/characters.json";
import dms from "../../data/dms.json";
import { CharacterAvatar } from "./CharacterAvatar";
import { Lock } from "lucide-react";

export default function DMsScreen({ day = 1 }) {
  const order = ["arjun", "maya", "tenzin", "priya"];
  const [active, setActive] = useState(order[0]);
  const [visited, setVisited] = useState(() => new Set());
  const threads = day === 3 ? dms.day3 : day === 2 ? dms.day2 : dms.day1;
  const thread = threads[active] || [];
  const char = characters[active];

  React.useEffect(() => {
    // Mark newly opened thread as visited
    setVisited((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  // Reset per-character unread dots when the day changes
  React.useEffect(() => {
    setVisited(new Set([active]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  return (
    <div className="h-full min-h-0 flex flex-col md:flex-row" data-testid="dms-screen">
      {/* Thread list */}
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-[color:var(--granite-200)] bg-white/70">
        <div className="px-4 py-3 text-[11px] uppercase tracking-[0.22em] font-mono-tick text-[color:var(--granite-500)]">
          Direct Messages
        </div>
        <ul>
          {order.map((id) => {
            const c = characters[id];
            const last = threads[id]?.[threads[id].length - 1];
            const isActive = active === id;
            const unread = !visited.has(id) && (threads[id]?.length || 0) > 0;
            return (
              <li key={id}>
                <button
                  data-testid={`dm-thread-${id}`}
                  onClick={() => setActive(id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition ${
                    isActive
                      ? "bg-[color:var(--ice-50)] border-l-2 border-[color:var(--ice-500)]"
                      : "hover:bg-[color:var(--granite-50)] border-l-2 border-transparent"
                  }`}
                >
                  <div className="relative">
                    <CharacterAvatar character={c} size={36} />
                    {unread && (
                      <span
                        data-testid={`dm-unread-${id}`}
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[color:var(--amber-500)] ring-2 ring-white"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-display text-[color:var(--granite-900)]">
                      {c.short}
                    </div>
                    <div className="text-[11.5px] text-[color:var(--granite-500)] truncate">
                      {last?.text || "—"}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono-tick text-[color:var(--granite-500)] uppercase">
                    {last?.time}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Thread body */}
      <section className="flex-1 flex flex-col min-h-0 bg-[color:var(--ice-50)]/40">
        <div className="px-4 md:px-6 py-3 border-b border-[color:var(--granite-200)] bg-white/70 backdrop-blur flex items-center gap-3">
          <CharacterAvatar character={char} size={38} />
          <div className="leading-tight">
            <div className="font-display text-[color:var(--granite-900)]">{char.name}</div>
            <div className="text-[11px] uppercase font-mono-tick tracking-widest text-[color:var(--granite-500)]">
              {char.role}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-4 md:px-6 py-6 space-y-3">
          {thread.map((m, i) => (
            <div key={i} className="flex items-start gap-3 msg-in" data-testid={`dm-message-${active}-${i}`}>
              <CharacterAvatar character={char} size={32} />
              <div className="max-w-[85%]">
                <div className="rounded-2xl rounded-tl-sm bg-white border border-[color:var(--granite-200)] px-4 py-2.5 text-[14px] text-[color:var(--granite-900)] shadow-sm">
                  {m.text}
                </div>
                <div className="mt-1 text-[10px] font-mono-tick uppercase tracking-widest text-[color:var(--granite-500)]">
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 md:px-6 py-3 border-t border-[color:var(--granite-200)] bg-white/80 flex items-center gap-2 text-[11.5px] font-mono-tick uppercase tracking-widest text-[color:var(--granite-500)]">
          <Lock className="w-3.5 h-3.5" />
          Read only · direct replies unlock in Day 2
        </div>
      </section>
    </div>
  );
}
