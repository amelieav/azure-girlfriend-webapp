// App.jsx

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RecommendationCard from "./components/RecommendationCard";
import AmelieCycleForecast from "./components/AmelieCycleForecast";
import BoyfriendFriendlySummary from "./components/BoyfriendFriendlySummary";
import Switch from "react-switch";
import "./styles.css";

function App() {
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAmelie, setIsAmelie] = useState(
    () => localStorage.getItem("userRole") === "amelie"
  );
  const [privateNote, setPrivateNote] = useState("");
  const [forecastData, setForecastData] = useState({});
  const [bfSummary, setBfSummary] = useState({});

  useEffect(() => {
    localStorage.setItem("userRole", isAmelie ? "amelie" : "boyfriend");
  }, [isAmelie]);

  useEffect(() => {
    if (isAmelie && cycleDay) {
      fetch(`/api/getOverrideNote?cycleDay=${cycleDay}`)
        .then((res) => res.json())
        .then((data) => setPrivateNote(data.note || ""));
    }
  }, [isAmelie, cycleDay]);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const sectionsToFetch = ["feeling", "help", "food", "avoid"];
      const results = {};

      const fetchSection = async (section) => {
        const res = await fetch(
          `/api/getBoyfriendForecast?cycleDay=${cycleDay}&section=${section}`
        );
        if (!res.ok) throw new Error(`Failed to fetch section: ${section}`);
        const data = await res.json();
        results[section] = data.result || "Unavailable";
      };

      await Promise.all(sectionsToFetch.map(fetchSection));

      setResult({
        feeling_today: results.feeling,
        boyfriend_help: results.help,
        food_suggestions: results.food,
        things_to_avoid: results.avoid,
      });

      // ✅ Optionally fetch forecast data if not Amélie
      if (!isAmelie) {
        const [sleepRes, prodRes, nightRes, tipRes] = await Promise.all([
          fetch("/api/getSleepForecast"),
          fetch("/api/getProductivityForecast"),
          fetch("/api/getNightmareForecast"),
          fetch("/api/getNextDayForecast"),
        ]);

        const [sleep, prod, night, tip] = await Promise.all([
          sleepRes.json(),
          prodRes.json(),
          nightRes.json(),
          tipRes.json(),
        ]);

        const allDays = {};
        for (let i = 1; i <= 28; i++) {
          allDays[i] = {
            Sleep: sleep[i] || "-",
            Productivity: prod[i] || "-",
            Nightmares: night[i] || "-",
            Tip: tip[i] || "-",
          };
        }

        setForecastData(allDays);
        setBfSummary(allDays[cycleDay]);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to connect to backend.");
    }

    setLoading(false);
  };

  const saveNote = async () => {
    const res = await fetch("/api/setOverrideNote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cycleDay, note: privateNote }),
    });
    if (!res.ok) {
      alert("Failed to save note.");
    }
  };

  return (
    <>
      <Header />

      <div className="text-center my-4">
        <label className="inline-flex items-center space-x-2">
          <span className="text-sm font-medium">
            {isAmelie ? "Amélie 👩" : "Boyfriend 👦"}
          </span>
          <Switch
            onChange={() => setIsAmelie(!isAmelie)}
            checked={isAmelie}
            onColor="#ec4899"
            offColor="#60a5fa"
            uncheckedIcon={false}
            checkedIcon={false}
          />
        </label>
      </div>

      <main className="max-w-xl mx-auto p-4">
        {isAmelie && (
          <>
            <label className="block mb-4">
              <span className="font-medium">Corrected Cycle Day (1–28):</span>
              <input
                type="number"
                min="1"
                max="28"
                className="ml-2 p-1 border border-gray-300 rounded w-20"
                value={cycleDay}
                onChange={(e) => setCycleDay(Number(e.target.value))}
              />
            </label>

            <section className="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h2 className="font-semibold mb-2">
                🔒 Amélie's Private Note for Day {cycleDay}
              </h2>
              <textarea
                rows="3"
                className="w-full p-2 border border-gray-300 rounded"
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                onBlur={saveNote}
                placeholder="E.g. Feeling worse than usual today, or something to avoid."
              />
            </section>
          </>
        )}

        <button
          className="bg-pink-500 text-white font-semibold px-4 py-2 rounded hover:bg-pink-600"
          onClick={fetchAdvice}
          disabled={loading}
        >
          {loading ? "Thinking..." : "What is up with my girlfriend today?"}
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {result && (
          <div className="mt-6 space-y-4">
            <RecommendationCard
              title="🩺 Feeling Today"
              content={result.feeling_today}
            />
            <RecommendationCard
              title="💖 Boyfriend Help"
              content={result.boyfriend_help}
            />
            <RecommendationCard
              title="🥗 Food Suggestions"
              content={result.food_suggestions}
            />
            <RecommendationCard
              title="❌ Things to Avoid"
              content={result.things_to_avoid}
            />
          </div>
        )}

        {isAmelie ? (
          <AmelieCycleForecast data={forecastData} />
        ) : (
          <BoyfriendFriendlySummary
            day={cycleDay}
            summary={bfSummary?.Tip || "No tip today."}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

export default App;
