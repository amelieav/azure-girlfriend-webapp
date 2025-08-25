import { useEffect, useState } from "react";

const AmelieForecast = ({ cycleDay }) => {
  const [sections, setSections] = useState({
    sleep: "",
    feels: "",
    productivity: "",
    food: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      setError(null);
      try {
        const sectionKeys = ["sleep", "feels", "productivity", "food"];
        const results = {};

        for (const section of sectionKeys) {
          const res = await fetch(
            `/api/getAmelieForecast?cycleDay=${cycleDay}&section=${section}`
          );
          if (!res.ok) throw new Error(`Failed on section: ${section}`);
          const data = await res.json();
          results[section] = data.result;
        }

        setSections(results);
      } catch (err) {
        console.error(err);
        setError("Failed to load Amélie’s forecast.");
      } finally {
        setLoading(false);
      }
    };

    if (cycleDay) {
      fetchSections();
    }
  }, [cycleDay]);

  if (error)
    return <div className="text-red-600 bg-red-100 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4 my-6">
      <h2 className="text-purple-700 font-semibold">
        🌤️ Forecast for Day {cycleDay}
      </h2>
    </div>
  );
};

const Section = ({ title, text }) => (
  <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
    <h3 className="text-purple-600 font-medium">{title}</h3>
    <p className="text-sm whitespace-pre-line">{text || "-"}</p>
  </div>
);

export default AmelieForecast;
