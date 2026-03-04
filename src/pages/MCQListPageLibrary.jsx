import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import "./MCQListPageLibrary.css";

export default function MCQListPage() {
  const navigate = useNavigate();
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMCQs();
  }, []);

  const fetchMCQs = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/getAllMCQForAdmin`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to fetch MCQs");

      const data = await res.json();
      setMcqs(data);
    } catch (err) {
      setError("Unable to load MCQs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loader">Loading MCQs...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="mcq-page">
      <h1 className="mcq-title">MCQ Tests</h1>

      {mcqs.length === 0 ? (
        <p className="empty-text">No MCQs available</p>
      ) : (
        <div className="mcq-grid">
          {mcqs.map((mcq) => (
            <div
              key={mcq._id}
              className="mcq-card"
              onClick={() => navigate(`/mcqs/${mcq._id}`)}
            >
              <h2>{mcq.topic}</h2>

              <p className="category">
                📂 Category: <strong>{mcq.category}</strong>
              </p>

              <div className="mcq-meta">
                <span>❓ Questions: {mcq.questions.length}</span>
                <span>
                  🕒 Created:{" "}
                  {new Date(mcq.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
