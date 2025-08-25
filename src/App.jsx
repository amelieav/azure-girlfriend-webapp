import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RecommendationCard from "./components/RecommendationCard";
import "./styles.css";

function App() {
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/getRecommendations?cycleDay=${cycleDay}`);
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "An unexpected error occurred.");
      }
    } catch (e) {
      setError("Failed to connect to backend.");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-light)",
        color: "var(--text-dark)",
        fontFamily: "var(--font-main)",
      }}
    >
      <Header />

      <main className="max-w-xl mx-auto p-4">
        <label className="block mb-4">
          <span className="font-medium">Cycle Day (1–28):</span>
          <input
            type="number"
            min="1"
            max="28"
            className="ml-2 p-1 border border-gray-300 rounded w-20"
            value={cycleDay}
            onChange={(e) => setCycleDay(Number(e.target.value))}
            style={{
              backgroundColor: "var(--card-light)",
              color: "var(--text-dark)",
              fontFamily: "var(--font-main)",
            }}
          />
        </label>

        <button
          className="font-semibold px-4 py-2 rounded transition"
          onClick={fetchAdvice}
          disabled={loading}
          style={{
            backgroundColor: "var(--text-dark)",
            color: "var(--bg-light)",
          }}
        >
          {loading ? "Thinking..." : "Get Recommendations"}
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {result && (
          <div className="mt-6 space-y-4">
            <RecommendationCard
              title="🩺 Feeling Today"
              content={result.feeling_today}
            />
            <RecommendationCard
              title="💞 Boyfriend Help"
              content={result.boyfriend_help}
            />
            <RecommendationCard
              title="🥗 Food Suggestions"
              content={result.food_suggestions}
            />
            <RecommendationCard
              title="🚫 Things to Avoid"
              content={result.things_to_avoid}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
