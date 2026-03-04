import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HumanLoader from "../components/loaders/HumanLoader";
import "./CampusListPage.css";

export default function CampusListPage() {
  const [campuses, setCampuses] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* ---------- FETCH CAMPUSES (MIN 3s LOADER) ---------- */
  useEffect(() => {
    const fetchCampuses = async () => {
      const startTime = Date.now();
      setPageLoading(true);

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/campus/get`
        );

        if (!res.ok) throw new Error("Failed to fetch campuses");

        const data = await res.json();
        setCampuses(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load campuses");
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(3000 - elapsed, 0);
        setTimeout(() => setPageLoading(false), remaining);
      }
    };

    fetchCampuses();
  }, []);

  const handleCampusClick = (college) => {
    localStorage.setItem("selectedCampus", college);
    navigate("/years", { state: { campus: college } });
  };

  /* ---------- LOADER ---------- */
  if (pageLoading) {
    return <HumanLoader text="Loading campuses" />;
  }

  return (
    <div className="campus-page">
      <div className="campus-header">
        <h2>Select Campus</h2>
        <p>Choose your campus to continue</p>
      </div>

      {error && <p className="status error">{error}</p>}

      {!error && campuses.length === 0 && (
        <p className="status">No campuses available</p>
      )}

      <div className="campus-grid">
        {campuses.map(campus => (
          <div
            key={campus._id}
            className="campus-card"
            onClick={() => handleCampusClick(campus.college)}
          >
            <span className="campus-name">{campus.college}</span>
            <span className="campus-action">Select →</span>
          </div>
        ))}
      </div>
    </div>
  );
}
