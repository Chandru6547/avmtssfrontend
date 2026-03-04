import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./YearsListPage.css";

export default function YearsListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const campus =
    location.state?.campus || localStorage.getItem("selectedCampus");

  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campus) {
      navigate("/campuses");
      return;
    }

    fetch(
      `https://tssplatform.onrender.com/year/get-by-campus?campus=${encodeURIComponent(
        campus
      )}`
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch years");
        return res.json();
      })
      .then(data => {
        setYears(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Unable to load years");
        setLoading(false);
      });
  }, [campus, navigate]);

  const handleYearClick = (year) => {
    // ✅ store for refresh safety
    localStorage.setItem("selectedYear", year);

    navigate("/view-students-batches", {
      state: {
        campus,
        year
      }
    });
  };

  if (loading) return <p className="status">Loading years...</p>;
  if (error) return <p className="status error">{error}</p>;

  return (
    <div className="year-page">
      <h2>{campus}</h2>
      <h3>Select Year</h3>

      <div className="year-grid">
        {years.map(y => (
          <div
            key={y._id}
            className="year-card clickable"
            onClick={() => handleYearClick(y.Year)}
          >
            Year {y.Year}
          </div>
        ))}
      </div>
    </div>
  );
}
