import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import "./AssignmentListPageLibrary.css";

export default function AssignmentListPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/assignments`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to fetch assignments");

      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      setError("Unable to load assignments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loader">Loading assignments...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="assignment-page">
      <h1 className="assignment-title">Assignments</h1>

      {assignments.length === 0 ? (
        <p className="empty-text">No assignments available</p>
      ) : (
        <div className="assignment-grid">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="assignment-card"
              onClick={() => navigate(`/assignments/${a._id}`)}
            >
              <h2>{a.name}</h2>
              <p className="desc">{a.description}</p>

              <div className="assignment-meta">
                <span>
                  📅 Due:{" "}
                  {new Date(a.dueDate).toLocaleDateString("en-IN")}
                </span>
                <span>🧩 Questions: {a.questions.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
