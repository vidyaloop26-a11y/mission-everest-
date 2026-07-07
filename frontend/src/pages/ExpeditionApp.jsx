import React, { useState, useEffect, useMemo } from "react";
import ChatScreen from "../components/expedition/ChatScreen";
import FeedScreen from "../components/expedition/FeedScreen";
import DMsScreen from "../components/expedition/DMsScreen";
import day1 from "../data/day1.json";
import day2 from "../data/day2.json";
import day3 from "../data/day3.json";
import feed from "../data/feed.json";
import { Mountain, MessageSquare, Newspaper, Mail, ArrowRight } from "lucide-react";

const DAYS = { 1: day1, 2: day2, 3: day3 };

const TABS = [
  { id: "chat", label: "Expedition Chat", icon: MessageSquare },
  { id: "feed", label: "Weather & Route", icon: Newspaper },
  { id: "dms", label: "DMs", icon: Mail },
];

export default function ExpeditionApp({ state, setState, onReflect }) {
  const [tab, setTab] = useState("chat");
  const dayData = DAYS[state.current_day] || day1;
  const dayComplete = state.current_scene_index >= dayData.scenes.length;

  const [dmsVisited, setDmsVisited] = useState(false);
  const [feedVisited, setFeedVisited] = useState(false);
  useEffect(() => {
    if (tab === "dms") setDmsVisited(true);
    if (tab === "feed") setFeedVisited(true);
  }, [tab]);

  // Reset visited flags when day changes so the unread dot returns
  useEffect(() => {
    setDmsVisited(false);
    setFeedVisited(false);
    setTab("chat");
  }, [state.current_day]);

  const feedItemsForDay =
    state.current_day === 3 ? feed.day3 : state.current_day === 2 ? feed.day2 : feed.day1;
  const feedUnread = !feedVisited && feedItemsForDay.length > 0;
  const dmsUnread = !dmsVisited;

  const currentSceneMeta = useMemo(() => {
    const scene =
      dayData.scenes[Math.min(state.current_scene_index, dayData.scenes.length - 1)];
    return scene;
  }, [state.current_scene_index, dayData.scenes]);

  return (
    <div className="min-h-screen w-full bg-[color:var(--ice-50)] grain relative">
      <div className="relative z-10 max-w-5xl mx-auto min-h-screen flex flex-col">
        <header className="mountain-band text-white px-4 md:px-6 py-4 md:py-5 rounded-b-2xl shadow-[0_25px_60px_-40px_rgba(14,21,32,0.6)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-[color:var(--amber-500)]" />
            </div>
            <div className="flex-1 leading-tight">
              <div className="font-display text-lg md:text-xl">Mission Everest</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-mono-tick">
                Day {state.current_day} · {dayData.day_title}
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-[11px] font-mono-tick uppercase tracking-widest text-white/50">
                Coordinator
              </div>
              <div className="text-sm font-display" data-testid="header-intern-name">
                {state.intern_name || "—"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-mono-tick uppercase tracking-widest text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {dayComplete
                ? `Day ${state.current_day} complete · awaiting reflection`
                : `Scene ${currentSceneMeta.id} · ${currentSceneMeta.title}`}
            </div>
            {dayComplete && (
              <button
                onClick={onReflect}
                data-testid="open-reflection-btn"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--amber-500)] hover:bg-[color:var(--amber-600)] text-white text-sm font-display px-4 py-2 transition"
              >
                Day {state.current_day} Reflection
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        <nav className="px-2 md:px-4 pt-3">
          <div className="flex gap-1 bg-white border border-[color:var(--granite-200)] rounded-2xl p-1 shadow-sm">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              const unread =
                (t.id === "feed" && feedUnread) || (t.id === "dms" && dmsUnread);
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`tab-${t.id}`}
                  className={`relative flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[13px] font-display transition ${
                    active
                      ? "bg-[color:var(--granite-900)] text-white shadow"
                      : "text-[color:var(--granite-800)] hover:bg-[color:var(--ice-50)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                  {unread && !active && (
                    <span
                      className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[color:var(--amber-500)]"
                      data-testid={`unread-dot-${t.id}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 min-h-0 px-2 md:px-4 py-3">
          <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-15rem)] bg-white rounded-2xl border border-[color:var(--granite-200)] overflow-hidden shadow-[0_25px_60px_-40px_rgba(14,21,32,0.35)]">
            {tab === "chat" && (
              <ChatScreen key={state.current_day} state={state} setState={setState} />
            )}
            {tab === "feed" && <FeedScreen day={state.current_day} />}
            {tab === "dms" && <DMsScreen day={state.current_day} />}
          </div>
        </main>

        <footer className="text-center text-[11px] font-mono-tick uppercase tracking-[0.22em] text-[color:var(--granite-500)] py-3">
          Vidyaloop Learning &amp; Innovation Labs · Mission Everest · Stage {state.current_day}
        </footer>
      </div>
    </div>
  );
}
