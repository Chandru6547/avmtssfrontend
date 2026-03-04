import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BatchListPage.css";

export default function BatchListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get data from navigation OR localStorage (refresh-safe)
  const campus =
    location.state?.campus || localStorage.getItem("selectedCampus");
  const year =
    location.state?.year || localStorage.getItem("selectedYear");

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- FETCH BATCHES ---------- */
  useEffect(() => {
    if (!campus || !year) {
      navigate("/campuses");
      return;
    }

    const fetchBatches = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/batch/get-by-campus-year?campus=${encodeURIComponent(
            campus
          )}&year=${year}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch batches");
        }

        const data = await res.json();
        setBatches(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load batches");
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [campus, year, navigate]);

  /* ---------- BATCH CLICK ---------- */
  const handleBatchClick = (batchName) => {
    if (!batchName) return;

    // ✅ Store for refresh safety
    localStorage.setItem("selectedBatch", batchName);

    // ✅ Navigate to submissions page
    navigate("/submissions", {
      state: {
        college: campus,
        year,
        batch: batchName
      }
    });
  };

  /* ---------- UI STATES ---------- */
  if (loading) return <p className="status">Loading batches...</p>;
  if (error) return <p className="status error">{error}</p>;

  return (
    <div className="batch-page">
      <h2>{campus}</h2>
      <h3>Year {year} - Select Batch</h3>

      {batches.length === 0 ? (
        <p className="status">No batches found</p>
      ) : (
        <div className="batch-grid">
          {batches.map(batch => (
            <div
              key={batch._id}
              className="batch-card clickable"
              onClick={() => handleBatchClick(batch.batch)}
            >
              {batch.batch}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
