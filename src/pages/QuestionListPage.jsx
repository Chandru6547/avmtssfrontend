import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, logout, getRole } from "../utils/auth";
import HumanLoader from "../components/loaders/HumanLoader";
import "./QuestionListPage.css";

export default function QuestionListPage() {
  const { categoryId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [solvedMap, setSolvedMap] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  const navigate = useNavigate();

  /* ---------- FETCH QUESTIONS + SOLVED STATUS ---------- */
  useEffect(() => {
    const fetchQuestions = async () => {
      const startTime = Date.now();
      setPageLoading(true);

      try {
        const res = await fetch(
          `https://tssplatform.onrender.com/questions?categoryId=${categoryId}`,
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
        setQuestions(data);

        // 🔥 Check solved status after questions
        await checkSolvedStatus(data);
      } catch (err) {
        console.error("Failed to fetch questions", err);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(2000 - elapsed, 0);

        setTimeout(() => setPageLoading(false), remaining);
      }
    };

    fetchQuestions();
  }, [categoryId, navigate]);

  /* ---------- CHECK SOLVED STATUS ---------- */
  const checkSolvedStatus = async (questions) => {
    const solvedStatus = {};

    await Promise.all(
      questions.map(async (q) => {
        try {
          const res = await fetch(
            `https://tssplatform.onrender.com/api/submissions/solved?questionId=${q._id}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`
              }
            }
          );

          if (res.ok) {
            const data = await res.json();
            solvedStatus[q._id] = data.solved;
          }
        } catch (err) {
          console.error("Solved check failed", err);
        }
      })
    );

    setSolvedMap(solvedStatus);
  };

  /* ---------- LOADER ---------- */
  if (pageLoading) {
    return (
      <HumanLoader
        loadingText="Preparing problems"
        successText="Ready to practice!"
        duration={2000}
      />
    );
  }

  return (
    <div className="ql-page">
      <div className="ql-container">

        {/* HEADER */}
        <div className="ql-header">
          <h1>Practice Problems</h1>
          <p>Solve problems from this category</p>
        </div>

        {/* GRID */}
        <div className="ql-grid">
          {questions.map((q) => {
            const isSolved = solvedMap[q._id];

            return (
              <div className="ql-card" key={q._id}>

                <div className="ql-card-top">
                  <h3 className="ql-title">{q.title}</h3>

                  <div className="ql-badges">
                    <span className={`ql-badge ${q.difficulty.toLowerCase()}`}>
                      {q.difficulty}
                    </span>

                    {isSolved && (
                      <span className="ql-badge solved">
                        ✔ Solved
                      </span>
                    )}
                  </div>
                </div>

                <div className="ql-card-footer">
                  {getRole() === "admin" && (
                    <button
                      className="ql-edit-btn"
                      onClick={() => navigate(`/admin/edit/${q._id}`)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  <button
                    className={`ql-solve-btn ${isSolved ? "solved-btn" : ""}`}
                    onClick={() => navigate(`/questions/${q._id}`)}
                  >
                    {isSolved ? "Solve Again →" : "Solve Problem →"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {questions.length === 0 && (
          <div className="ql-empty">
            <h3>No problems yet</h3>
            <p>Questions will appear here once added.</p>
          </div>
        )}

      </div>
    </div>
  );
}
