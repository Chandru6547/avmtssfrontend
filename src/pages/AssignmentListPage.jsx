import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import "./AssignmentListPage.css";

export default function AssignmentListPage() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/assignments`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );

        if (res.status === 401 || res.status === 403) {
          logout();
          navigate("/login");
          return;
        }

        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [navigate]);

  if (loading) {
    return <div className="page-loader">Loading assignments…</div>;
  }

  return (
    <div className="assignment-list-page">
      {/* ---------- HEADER ---------- */}
      <div className="page-header">
        <div>
          <h2>Assignments</h2>
          <p className="subtitle">
            Create, manage and review assignments for students
          </p>
        </div>

        <button
          className="primary-btn-create-assignment"
          onClick={() => navigate("/assignments/create")}
        >
          + Create Assignment
        </button>
      </div>

      {/* ---------- EMPTY ---------- */}
      {assignments.length === 0 ? (
        <div className="empty-state">
          <h3>No Assignments Yet</h3>
          <p>Start by creating your first assignment.</p>
          <button
            className="primary-btn"
            onClick={() => navigate("/assignments/create")}
          >
            Create Assignment
          </button>
        </div>
      ) : (
        /* ---------- GRID ---------- */
        <div className="assignment-grid">
          {assignments.map((a) => {
            const dueDate = new Date(a.dueDate);
            const isOverdue = dueDate < new Date();

            return (
              <div key={a._id} className="assignment-card">
                <div className="card-top">
                  <h3>{a.name}</h3>
                  <span
                    className={`status ${
                      isOverdue ? "overdue" : "active"
                    }`}
                  >
                    {isOverdue ? "Overdue" : "Upcoming"}
                  </span>
                </div>

                <div className="card-info">
                  <div>
                    <label>Due Date</label>
                    <span>{dueDate.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <label>Questions</label>
                    <span>{a.questions?.length || 0}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="outline-btn"
                    onClick={() =>
                      navigate(`/assignments/${a._id}`)
                    }
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
