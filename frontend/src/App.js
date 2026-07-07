import { useEffect, useState, useCallback } from "react";
import Onboarding from "@/pages/Onboarding";
import ExpeditionApp from "@/pages/ExpeditionApp";
import Reflection from "@/pages/Reflection";
import FinalSummary from "@/pages/FinalSummary";
import { loadState, saveState, resetState, DEFAULT_STATE } from "@/lib/expeditionStore";

function App() {
  const [state, setState] = useState(() => loadState());
  const [screen, setScreen] = useState("auto");

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (screen !== "auto") return;
    if (!state.onboarded || !state.intern_name) {
      setScreen("onboarding");
    } else {
      setScreen("app");
    }
  }, [state, screen]);

  const handleBegin = useCallback((name) => {
    setState((s) => ({ ...s, intern_name: name, onboarded: true }));
    setScreen("app");
  }, []);

  const handleOpenReflection = useCallback(() => {
    setScreen("reflection");
  }, []);

  const handleAdvanceDay = useCallback(() => {
    setState((s) => {
      // After Day 3 reflection, route to the Final Summary Card
      if (s.current_day >= 3) return s;
      return {
        ...s,
        current_day: s.current_day + 1,
        current_scene_index: 0,
      };
    });
    setScreen((prev) => {
      // If we were on Day 3 reflection, go to summary; else back to app for next day
      return state.current_day >= 3 ? "summary" : "app";
    });
  }, [state.current_day]);

  const handleStartOver = useCallback(() => {
    resetState();
    setState({ ...DEFAULT_STATE, variables: { ...DEFAULT_STATE.variables } });
    setScreen("onboarding");
  }, []);

  if (screen === "onboarding" || screen === "auto") {
    return <Onboarding onBegin={handleBegin} />;
  }

  if (screen === "summary") {
    return <FinalSummary state={state} onStartOver={handleStartOver} />;
  }

  if (screen === "reflection") {
    return (
      <Reflection
        state={state}
        setState={setState}
        onAdvanceDay={handleAdvanceDay}
      />
    );
  }

  return (
    <ExpeditionApp
      state={state}
      setState={setState}
      onReflect={handleOpenReflection}
    />
  );
}

export default App;
