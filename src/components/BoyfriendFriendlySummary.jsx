import { useEffect, useState } from "react";

function BoyfriendForecast({ cycleDay }) {
  const [sections, setSections] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      setError(null);
      try {
        const sectionsToFetch = ["feeling", "help", "food", "avoid"];
        const results = {};

        for (const section of sectionsToFetch) {
          const res = await fetch(
            `/api/getBoyfriendForecast?cycleDay=${cycleDay}&section=${section}`
          );
          if (!res.ok) throw new Error(`Failed to fetch section: ${section}`);
          const data = await res.json();
          results[section] = data.result;
        }

        setSections(results);
      } catch (err) {
        console.error(err);
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
