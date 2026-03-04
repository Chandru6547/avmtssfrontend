import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout, getUserId } from "../utils/auth";
import { initAssignmentTimer } from "../utils/assignmentTimer";
import HumanLoader from "../components/loaders/HumanLoader";
import "./AssignmentStudentPage.css";

export default function AssignmentStudentPage() {
  const [assignments, setAssignments] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  const navigate = useNavigate();
  const studentId = getUserId();

  /* ---------- CHECK IF EXPIRED ---------- */
  const isExpired = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  /* ---------- CHECK COMPLETED ASSIGNMENTS ---------- */
  const checkCompletedAssignments = useCallback(
    async (assignmentList) => {
      try {
        const requests = assignmentList.map((a) =>
          fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/assignment-submissions/assignment/${a._id}/student/${studentId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`
              }
            }
          )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => ({
              assignmentId: a._id,
              completed: data?.isCompleted === true
            }))
        );

        const results = await Promise.all(requests);
        const statusMap = {};

        results.forEach((r) => {
          statusMap[r.assignmentId] = r.completed;
        });

        setCompletedMap(statusMap);
      } catch (err) {
        console.error("Failed to check assignment completion", err);
      }
    },
    [studentId]
  );

  /* ---------- FETCH ASSIGNMENTS (MIN LOADER 3s) ---------- */
  const fetchAssignments = useCallback(async () => {
    setPageLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/get-assignments-for-student`,
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
      const list = Array.isArray(data) ? data : [];

      setAssignments(list);
      await checkCompletedAssignments(list);
    } catch (err) {
      console.error("Failed to load assignments", err);
      setAssignments([]);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(3000 - elapsed, 0);
      setTimeout(() => setPageLoading(false), remaining);
    }
  }, [studentId, navigate, checkCompletedAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  /* ---------- START ASSIGNMENT ---------- */
  const startAssignment = async (assignmentId) => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed", err);
    }

    initAssignmentTimer(assignmentId);
    navigate(`/assignments/solve/${assignmentId}`);
  };

  /* ---------- COMMON LOADER ---------- */
  if (pageLoading) {
    return (
      <HumanLoader
        loadingText="Preparing assignments"
        successText="Ready to start!"
        duration={2000}
      />
    );
  }

  /* ---------- FORCE 3 CARDS ---------- */
  const MAX_CARDS = 3;
  const displayAssignments = [
    ...assignments,
    ...Array(Math.max(0, MAX_CARDS - assignments.length)).fill(null)
  ];

  /* ---------- UI ---------- */
  return (
    <div className="course-page">
      <div className="course-header">
        <h2>Select Assignment</h2>
        <p>Choose an assignment to start solving</p>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <p>No assignments assigned yet.</p>
        </div>
      ) : (
        <div className="course-grid fixed-3">
          {displayAssignments.map((a, index) =>
            a ? (
              <div
                key={a._id}
                className={`course-card ${
                  isExpired(a.dueDate) ? "expired-card" : ""
                }`}
              >
                <h3>{a.name}</h3>

                <p className="mcq-meta">
                  Due: {new Date(a.dueDate).toLocaleDateString()} ·{" "}
                  {a.questions?.length || 0} Questions
                </p>

                {/* Completed Badge */}
                {completedMap[a._id] && (
                  <span className="completed-badge">Completed</span>
                )}

                {/* Expired Badge */}
                {isExpired(a.dueDate) && !completedMap[a._id] && (
                  <span className="expired-badge">Expired</span>
                )}

                <button
                  className="course-btn"
                  disabled={
                    completedMap[a._id] || isExpired(a.dueDate)
                  }
                  onClick={() => startAssignment(a._id)}
                >
                  {completedMap[a._id]
                    ? "Completed ✓"
                    : isExpired(a.dueDate)
                    ? "Expired ⛔"
                    : "Start Assignment →"}
                </button>
              </div>
            ) : (
              /* -------- GHOST CARD -------- */
              <div key={`ghost-${index}`} className="course-card ghost">
                <div className="ghost-line title" />
                <div className="ghost-line text" />
                <div className="ghost-btn" />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}