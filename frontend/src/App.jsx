import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

function App() {
  const [analysis, setAnalysis] = useState(null);

  if (analysis) {
    return <Dashboard data={analysis} onReset={() => setAnalysis(null)} />;
  }

  return <Home onAnalysisComplete={setAnalysis} />;
}

export default App;
