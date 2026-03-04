import { useEffect, useState, useCallback } from "react";
import "./TaskSubmissions.css";
import TaskSubmissionDashboard from "./TaskSubmissionDashboard";
import TaskSubmissionCharts from "./TaskSubmissionCharts";

const API = process.env.REACT_APP_API_BASE_URL;

export default function TaskSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  /* FILTER STATES */
  const [search, setSearch] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [batch, setBatch] = useState("");

  /* DASHBOARD FILTER */
  const [dashboardFilter, setDashboardFilter] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/taskSubmission/all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setSubmissions(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= APPLY FILTERS ================= */
  const applyFilters = useCallback(() => {
    let data = [...submissions];

    if (college) {
      data = data.filter(s => s.studentCollege === college);
    }

    if (year) {
      data = data.filter(s => String(s.studentYear) === year);
    }

    if (batch) {
      data = data.filter(s => s.studentBatch === batch);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        s =>
          s.studentName?.toLowerCase().includes(q) ||
          s.taskName?.toLowerCase().includes(q) ||
          s.studentCollege?.toLowerCase().includes(q) ||
          s.studentBatch?.toLowerCase().includes(q)
      );
    }

    /* DASHBOARD FILTER */
    if (dashboardFilter === "completed") {
      data = data.filter(
        s => s.taskStatus?.toLowerCase() === "completed"
      );
    }

    if (dashboardFilter === "inprogress") {
      data = data.filter(
        s => s.taskStatus?.toLowerCase() === "in-progress"
      );
    }

    if (dashboardFilter === "breached") {
      data = data.filter(s => s.isBreached);
    }

    setFiltered(data);
  }, [
    submissions,
    college,
    year,
    batch,
    search,
    dashboardFilter
  ]);

  /* RUN FILTERS */
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  /* UNIQUE OPTIONS */
  const unique = key =>
    [...new Set(submissions.map(s => s[key]).filter(Boolean))];

  if (loading) {
    return <div className="loading">Loading submissions…</div>;
  }

  return (
    <div className="task-table-page">
      <h2>Task Submissions</h2>
      <p className="subtitle">All student task submissions & proofs</p>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search student / task / college..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={college} onChange={e => setCollege(e.target.value)}>
          <option value="">All Colleges</option>
          {unique("studentCollege").map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)}>
          <option value="">All Years</option>
          {unique("studentYear").map(y => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select value={batch} onChange={e => setBatch(e.target.value)}>
          <option value="">All Batches</option>
          {unique("studentBatch").map(b => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* DASHBOARD */}
      <TaskSubmissionDashboard
        data={filtered}
        activeFilter={dashboardFilter}
        onFilter={f =>
          setDashboardFilter(prev => (prev === f ? "" : f))
        }
      />

      {/* CHARTS */}
      <TaskSubmissionCharts data={filtered} />

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="submission-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>College</th>
              <th>Batch</th>
              <th>Year</th>
              <th>Task</th>
              <th>Status</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Time (min)</th>
              <th>Breach</th>
              <th>Proof</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="11" className="empty">
                  No submissions found
                </td>
              </tr>
            )}

            {filtered.map(s => (
              <tr key={s._id}>
                <td>{s.studentName}</td>
                <td>{s.studentCollege}</td>
                <td>{s.studentBatch}</td>
                <td>{s.studentYear}</td>
                <td>{s.taskName}</td>
                <td>
                  <span className={`status ${s.taskStatus}`}>
                    {s.taskStatus}
                  </span>
                </td>
                <td>{formatDate(s.startedOn)}</td>
                <td>{formatDate(s.completedOn)}</td>
                <td>{s.timeTakenToCompete}</td>
                <td>
                  <span className={`breach ${s.isBreached ? "yes" : "no"}`}>
                    {s.isBreached ? "YES" : "NO"}
                  </span>
                </td>
                <td>
                  {s.proof?.length > 0 ? (
                    <div className="proof-mini">
                      {s.proof.map((p, i) => (
                        <a
                          key={i}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src={p.url} alt="proof" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= UTIL ================= */
function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}
