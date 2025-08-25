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

  // Helper: get cache key for current user, day, and role
  function getCacheKey(role, day) {
    return `forecastCache_${role}_${day}`;
  }

  // Helper: get today's 6am timestamp (UTC)
  function getToday6amTimestamp() {
    const now = new Date();
    const sixAM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      6,
      0,
      0,
      0
    );
    // If it's after 6am, use today; if before, use yesterday's 6am
    if (now < sixAM) sixAM.setDate(sixAM.getDate() - 1);
    return sixAM.getTime();
  }

  // Unified fetch/caching logic for both roles
  const fetchAndCacheForecast = async (role, day) => {
    setLoading(true);
    setError(null);
    setResult(null);
    const cacheKey = getCacheKey(role, day);
    const cacheRaw = localStorage.getItem(cacheKey);
    let cache = null;
    if (cacheRaw) {
      try {
        cache = JSON.parse(cacheRaw);
      } catch {}
    }
    const now = Date.now();
    const today6am = getToday6amTimestamp();
    if (cache && cache.timestamp >= today6am) {
      setResult(cache.result);
      setLoading(false);
      return;
    }
    try {
      if (role === "amelie") {
        const sectionKeys = ["sleep", "feels", "productivity", "food"];
        const results = {};
        for (const section of sectionKeys) {
          const res = await fetch(
            `/api/getAmelieForecast?cycleDay=${day}&section=${section}`
          );
          if (!res.ok) throw new Error(`Failed to fetch section: ${section}`);
          const data = await res.json();
          results[section] = data.result || "Unavailable";
        }
        const resultObj = {
          amelie_sleep: results.sleep,
          amelie_feels: results.feels,
          amelie_productivity: results.productivity,
          amelie_food: results.food,
        };
        setResult(resultObj);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: now, result: resultObj })
        );
      } else {
        const sectionsToFetch = ["feeling", "help", "food", "avoid"];
        const results = {};
        const fetchSection = async (section) => {
          const res = await fetch(
            `/api/getBoyfriendForecast?cycleDay=${day}&section=${section}`
          );
          if (!res.ok) throw new Error(`Failed to fetch section: ${section}`);
          const data = await res.json();
          results[section] = data.result || "Unavailable";
        };
        await Promise.all(sectionsToFetch.map(fetchSection));
        const resultObj = {
          feeling_today: results.feeling,
          boyfriend_help: results.help,
          food_suggestions: results.food,
          things_to_avoid: results.avoid,
        };
        setResult(resultObj);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: now, result: resultObj })
        );
      }
    } catch (e) {
      console.error(e);
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  };

  // Auto-fetch on mount, user toggle, or day change
  useEffect(() => {
    const role = isAmelie ? "amelie" : "boyfriend";
    fetchAndCacheForecast(role, cycleDay);
    // eslint-disable-next-line
  }, [isAmelie, cycleDay]);

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
        {/* Cycle day and disclaimer */}
        <div className="mb-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="text-lg font-semibold">
              Today is Cycle Day {cycleDay}
            </div>
            {isAmelie && (
              <input
                type="number"
                min="1"
                max="28"
                className="mt-1 p-1 border border-gray-300 rounded w-24 text-center"
                value={cycleDay}
                onChange={(e) => setCycleDay(Number(e.target.value))}
                style={{ fontSize: "1rem" }}
                aria-label="Adjust cycle day"
              />
            )}
            <div className="text-xs text-gray-500 italic">
              (This may be a day earlier or later depending on your tracking
              accuracy)
            </div>
          </div>
        </div>
        {isAmelie && (
          <>
          </>
        )}

        {/* Button removed: forecast is now auto-fetched and cached per user/day. */}

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {loading ? (
          <div className="text-center my-8 text-lg font-semibold">
            Thinking...
          </div>
        ) : result ? (
          <div className="mt-6 space-y-4">
            {isAmelie ? (
              <>
                <RecommendationCard
                  title="💤 Sleep & Nightmares"
                  content={result.amelie_sleep}
                />
                <RecommendationCard
                  title="🧠 Feelings & Physical State"
                  content={result.amelie_feels}
                />
                <RecommendationCard
                  title="⚡ Productivity & Energy"
                  content={result.amelie_productivity}
                />
                <RecommendationCard
                  title="🥗 Food Suggestions"
                  content={result.amelie_food}
                />
              </>
            ) : (
              <>
                <div className="mt-10 flex justify-center">
                  <img
                    src="/cycle-diagram.jpg"
                    alt="Menstrual cycle diagram"
                    className="max-w-3xs w-full rounded-lg shadow-md"
                  />
                </div>

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
              </>
            )}
          </div>
        ) : isAmelie ? (
          <AmelieCycleForecast cycleDay={cycleDay} />
        ) : (
          <BoyfriendFriendlySummary cycleDay={cycleDay} />
        )}
      </main>
      <Footer />
    </>
  );
}

export default App;
