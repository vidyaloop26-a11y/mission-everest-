import React from "react";
import feed from "../../data/feed.json";
import { AlertTriangle, Route, HeartPulse, Package, Users, Flag } from "lucide-react";

const CATEGORY_META = {
  "Weather Alert": { icon: AlertTriangle, tint: "text-sky-700 bg-sky-50 border-sky-200" },
  "Route Update": { icon: Route, tint: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  "Health Advisory": { icon: HeartPulse, tint: "text-rose-700 bg-rose-50 border-rose-200" },
  "Supply Report": { icon: Package, tint: "text-amber-800 bg-amber-50 border-amber-200" },
  "Team Status": { icon: Users, tint: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "Summit Bulletin": { icon: Flag, tint: "text-violet-700 bg-violet-50 border-violet-200" },
};

const PRIORITY_META = {
  HIGH: "text-white bg-rose-600 border-rose-700",
  MEDIUM: "text-white bg-amber-500 border-amber-600",
  LOW: "text-white bg-emerald-600 border-emerald-700",
};

export default function FeedScreen({ day = 1 }) {
  const items = day === 3 ? feed.day3 : day === 2 ? feed.day2 : feed.day1;
  return (
    <div className="h-full min-h-0 overflow-y-auto scroll-thin px-4 md:px-6 py-6" data-testid="feed-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg text-[color:var(--granite-900)]">
            Weather &amp; Route Feed
          </h2>
          <div className="text-[11px] uppercase font-mono-tick tracking-[0.22em] text-[color:var(--granite-500)]">
            Live basecamp intelligence · read only
          </div>
        </div>
        <div className="text-[11px] font-mono-tick text-[color:var(--ice-700)] uppercase tracking-widest">
          Day {day}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const meta = CATEGORY_META[item.category] || CATEGORY_META["Team Status"];
          const Icon = meta.icon;
          return (
            <article
              key={item.id}
              data-testid={`feed-item-${item.id}`}
              className="rounded-2xl border border-[color:var(--granite-200)] bg-white p-4 md:p-5 shadow-[0_10px_30px_-25px_rgba(14,21,32,0.35)]"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${meta.tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10.5px] font-mono-tick tracking-widest uppercase ${meta.tint}`}>
                      {item.category}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10.5px] font-mono-tick tracking-widest ${PRIORITY_META[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[10.5px] font-mono-tick uppercase tracking-widest text-[color:var(--granite-500)] ml-auto">
                      {item.timestamp}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-[15.5px] text-[color:var(--granite-900)] leading-snug">
                    {item.headline}
                  </h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[color:var(--granite-500)]">
                    {item.detail}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
