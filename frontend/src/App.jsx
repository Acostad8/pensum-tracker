import { useEffect, useState } from "react";
import DashboardSkeleton from "./components/DashboardSkeleton";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import { clearAnalysis, loadAnalysis, saveAnalysis } from "./services/cache";
import { applyTheme, getInitialTheme, persistTheme } from "./services/theme";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loadedFromCache, setLoadedFromCache] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    const cached = loadAnalysis();
    if (cached) {
      setAnalysis(cached.data);
      setLoadedFromCache(cached.timestamp);
    }
  }, []);

  function handleAnalysisComplete(data) {
    saveAnalysis(data);
    setAnalysis(data);
    setLoadedFromCache(null);
    setLoading(false);
  }

  function handleReset() {
    clearAnalysis();
    setAnalysis(null);
    setLoadedFromCache(null);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  if (loading) return <DashboardSkeleton />;

  if (analysis) {
    return (
      <Dashboard
        data={analysis}
        onReset={handleReset}
        loadedFromCache={loadedFromCache}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Home
      onAnalysisComplete={handleAnalysisComplete}
      onLoadingChange={setLoading}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;
