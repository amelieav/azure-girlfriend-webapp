import { useEffect, useState } from "react";

function BoyfriendForecast({ cycleDay }) {
  const [sections, setSections] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      setError(null);
      console.log(`[BoyfriendFriendlySummary] Fetching sections for cycleDay: ${cycleDay}`);
      try {
        const sectionsToFetch = ["feeling", "help", "food", "avoid"];
        const results = {};

        for (const section of sectionsToFetch) {
          console.log(`[BoyfriendFriendlySummary] Fetching section: ${section}`);
          const res = await fetch(
            `/api/getBoyfriendForecast?cycleDay=${cycleDay}&section=${section}`
          );
          if (!res.ok) throw new Error(`Failed to fetch section: ${section}`);
          const data = await res.json();
          console.log(`[BoyfriendFriendlySummary] Data for ${section}:`, data);
          results[section] = data.result;
        }

        setSections(results);
        console.log(`[BoyfriendFriendlySummary] All sections loaded:`, results);
      } catch (err) {
        console.error("[BoyfriendFriendlySummary] ERROR:", err);
        setError("Failed to load boyfriend forecast.");
      } finally {
        setLoading(false);
      }
    };

    if (cycleDay) {
      fetchSections();
    }
  }, [cycleDay]);

  if (error) return <p>{error}</p>;

  return (
    <div className="boyfriend-forecast">
      <div className="mt-10 flex justify-center">
    </div>
    </div>
  );
}

export default BoyfriendForecast;
