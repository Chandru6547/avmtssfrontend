import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import "./ReportMCQListPage.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function ReportMCQListPage() {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortType, setSortType] = useState("latest");

  const navigate = useNavigate();

  /* ================= FETCH MCQs ================= */
  const fetchMCQs = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/mcqs/getallmcq`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      const data = await res.json();
      setMcqs(data || []);
    } catch (error) {
      console.error("Error fetching MCQs:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMCQs();
  }, [fetchMCQs]);

  /* ================= CATEGORY LIST ================= */
  const categories = useMemo(() => {
    const unique = new Set(mcqs.map((m) => m.category));
    return ["All", ...unique];
  }, [mcqs]);

  /* ================= FILTER + SORT ================= */
  const filteredMCQs = useMemo(() => {
    let filtered = mcqs.filter((mcq) =>
      mcq.topic?.toLowerCase().includes(search.toLowerCase())
    );

    if (categoryFilter !== "All") {
      filtered = filtered.filter(
        (mcq) => mcq.category === categoryFilter
      );
    }

    if (sortType === "az") {
      filtered.sort((a, b) => a.topic.localeCompare(b.topic));
    } else if (sortType === "za") {
      filtered.sort((a, b) => b.topic.localeCompare(a.topic));
    } else if (sortType === "questions") {
      filtered.sort(
        (a, b) => (b.questions?.length || 0) - (a.questions?.length || 0)
      );
    } else {
      filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return filtered;
  }, [mcqs, search, categoryFilter, sortType]);

  if (loading) {
    return <div className="report-loading">Loading MCQ Reports...</div>;
  }

  return (
    <div className="report-container">

      {/* HEADER */}
      <div className="report-header">
        <h2 className="report-title">MCQ Reports Dashboard</h2>
      </div>

      {/* CONTROLS */}
      <div className="report-controls">

        {/* SEARCH INPUT (Fixes setSearch warning) */}
        <input
          type="text"
          placeholder="Search by topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="report-search"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="report-select"
        >
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="report-select"
        >
          <option value="latest">Latest</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="questions">Most Questions</option>
        </select>
      </div>

      {/* GRID */}
      <div className="report-grid">
        {filteredMCQs.length === 0 ? (
          <div className="report-empty">No matching MCQs found</div>
        ) : (
          filteredMCQs.map((mcq) => (
            <div
              key={mcq._id}
              className="report-card"
              onClick={() =>
                navigate(`/admin/reports/mcq/${mcq._id}`)
              }
            >
              <h3 className="report-topic">{mcq.topic}</h3>
              <p className="report-category">{mcq.category}</p>
              <div className="report-badge">
                {mcq.questions?.length || 0} Questions
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
