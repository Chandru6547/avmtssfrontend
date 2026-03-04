import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import "./AssignmentDetailPage.css";

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH ASSIGNMENT BY ID ---------------- */
  useEffect(() => {
    async function fetchAssignment() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/assignments/${id}`,
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

        if (!res.ok) {
          throw new Error("Failed to fetch assignment");
        }

        const data = await res.json();
        setAssignment(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load assignment");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [id, navigate]);

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return <div className="page-loader">Loading assignment...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!assignment) {
    return <div className="empty-state">Assignment not found</div>;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="assignment-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>{assignment.name}</h2>
      </div>

      <div className="detail-card">
        <div className="detail-row">
          <label>Description</label>
          <p>{assignment.description}</p>
        </div>

        <div className="detail-grid">
          <div>
            <label>Due Date</label>
            <p>{new Date(assignment.dueDate).toLocaleString()}</p>
          </div>

          <div>
            <label>Total Questions</label>
            <p>{assignment.questions?.length || 0}</p>
          </div>

          <div>
            <label>Created At</label>
            <p>{new Date(assignment.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <label>Last Updated</label>
            <p>{new Date(assignment.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="detail-row">
          <label>Questions</label>
          {assignment.questions && assignment.questions.length > 0 ? (
            <ul className="question-list">
              {assignment.questions.map((q, index) => (
                <li key={q._id || index}>
                  Question {index + 1} — {q.title || q}
                </li>
              ))}
            </ul>
          ) : (
            <p>No questions attached</p>
          )}
        </div>

        {assignment.createdBy && (
          <div className="detail-row">
            <label>Created By</label>
            <p>{assignment.createdBy.name || assignment.createdBy}</p>
          </div>
        )}
      </div>
    </div>
  );
}
