import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout, getUserId } from "../utils/auth";
import HumanLoader from "../components/loaders/HumanLoader";
import "./MCQStudentPage.css";

export default function MCQStudentPage() {
  const [mcqs, setMcqs] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const studentId = getUserId();

  /* ---------- CHECK COMPLETED MCQS WITH SCORE ---------- */
  const checkCompletedMCQs = useCallback(
    async (mcqList) => {
      try {
        const requests = mcqList.map((mcq) =>
          fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/mcq-submissions/student/${studentId}/mcq/${mcq._id}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`
              }
            }
          )
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data) && data.length > 0) {
                const submission = data[0];

                return {
                  mcqId: mcq._id,
                  completed: true,
                  score: submission.score || 0,
                  total: submission.totalMarks || 0,
                  isTabSwitch: submission.isTabSwitch || false
                };
              }

              return {
                mcqId: mcq._id,
                completed: false,
                score: 0,
                total: 0,
                isTabSwitch: false
              };
            })
        );

        const results = await Promise.all(requests);
        const statusMap = {};

        results.forEach((r) => {
          statusMap[r.mcqId] = r;
        });

        setCompletedMap(statusMap);
      } catch (err) {
        console.error("Failed to check MCQ completion", err);
      }
    },
    [studentId]
  );

  /* ---------- FETCH MCQS (MIN 3s LOADER) ---------- */
  const fetchMCQs = useCallback(async () => {
    setPageLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/mcqs/mcqs-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ studentId })
        }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      const data = await res.json();
      const mcqList = Array.isArray(data) ? data : [];

      setMcqs(mcqList);
      await checkCompletedMCQs(mcqList);
    } catch (err) {
      console.error("Failed to load MCQs", err);
      setMcqs([]);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(3000 - elapsed, 0);
      setTimeout(() => setPageLoading(false), remaining);
    }
  }, [studentId, navigate, checkCompletedMCQs]);

  useEffect(() => {
    fetchMCQs();
  }, [fetchMCQs]);

  /* ---------- FILTER MCQS ---------- */
  const filteredMCQs = mcqs.filter((mcq) => {
    const searchLower = search.toLowerCase();
    return (
      mcq.topic?.toLowerCase().includes(searchLower) ||
      mcq.category?.toLowerCase().includes(searchLower)
    );
  });

  /* ---------- LOADER ---------- */
  if (pageLoading) {
    return (
      <HumanLoader
        loadingText="Preparing MCQ tests"
        successText="All set! Let’s begin"
        duration={2000}
      />
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="course-page">
      <div className="course-header">
        <div>
          <h2>Select MCQ Test</h2>
          <p>Choose a topic to start the MCQ assessment</p>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by topic or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredMCQs.length === 0 ? (
        <div className="empty-state">
          <p>No MCQ tests match your search.</p>
        </div>
      ) : (
        <div className="course-grid">
          {filteredMCQs.map((mcq) => {
            const submissionData = completedMap[mcq._id];
            const isCompleted = submissionData?.completed;

            const percentage =
              isCompleted && submissionData.total > 0
                ? Math.round(
                    (submissionData.score / submissionData.total) * 100
                  )
                : 0;

            return (
              <div key={mcq._id} className="course-card">
                <h3>{mcq.topic}</h3>

                <p className="mcq-meta">
                  {mcq.category} · {mcq.questions?.length || 0} Questions
                </p>

                {isCompleted && (
                  <>
                    <span className="completed-badge">Completed ✓</span>

                    {submissionData.isTabSwitch && (
                      <span className="tabswitch-badge">
                        Tab Switch Detected
                      </span>
                    )}

                    <div className="score-display">
                      <strong>{submissionData.score}</strong> /{" "}
                      {submissionData.total}
                      <span className="percentage">
                        {" "}
                        ({percentage}%)
                      </span>
                    </div>
                  </>
                )}

                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <button
                  className="course-btn"
                  disabled={isCompleted}
                  onClick={() => navigate(`/mcqs/test/${mcq._id}`)}
                >
                  {isCompleted ? "Completed ✓" : "Start Test →"}
                </button>
              </div>
            );
          })}

          {/* ---------- GHOST CARDS ---------- */}
          {Array.from({
            length: (3 - (filteredMCQs.length % 3)) % 3
          }).map((_, index) => (
            <div key={`ghost-${index}`} className="course-card ghost-card" />
          ))}
        </div>
      )}
    </div>
  );
}