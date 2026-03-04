import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, logout, getUserId } from "../utils/auth";
import AssignmentTimer from "./AssignmentTimer";
import { clearAssignmentTimer } from "../utils/assignmentTimer";
import swal from "sweetalert";
import "./AssignmentSolvePage.css";

export default function AssignmentSolvePage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const studentId = getUserId();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  console.log(showModal);
  

  /* ---------- ENTER FULLSCREEN ---------- */
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen blocked", err);
    }
  };

  /* ---------- SUBMIT ASSIGNMENT ---------- */
  const submitAssignment = useCallback(
  async (reason = "manual") => {
    if (submitting || submitted) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/assignment-submissions/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            assignmentId,
            studentId,
            solvedQuestions: completedQuestions,
            isFinalSubmisison: true,
            submitReason: reason // 🔥 optional backend tracking
          })
        }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("Submit failed");

      clearAssignmentTimer(assignmentId, studentId);

      setSubmitted(true);

      /* ---------- DIFFERENT ALERT BASED ON REASON ---------- */
      let title = "Assignment Submitted";
      let text = "Your assignment has been submitted successfully.";
      let icon = "success";

      if (reason === "violation") {
        title = "Auto Submitted";
        text =
          "Your test was auto-submitted due to a fullscreen/tab violation.";
        icon = "warning";
      }

      if (reason === "timeout") {
        title = "Time Up";
        text = "Time is over. Your assignment has been submitted.";
        icon = "info";
      }

      swal({
        title,
        text,
        icon,
        button: "OK",
        closeOnClickOutside: false,
        closeOnEsc: false
      }).then(() => {
        navigate("/assignment-student");
      });

    } catch (err) {
      console.error(err);

      swal({
        title: "Submission Failed",
        text: "Something went wrong while submitting.",
        icon: "error",
        button: "OK"
      });
    } finally {
      setSubmitting(false);
    }
  },
  [
    assignmentId,
    studentId,
    completedQuestions,
    navigate,
    submitting,
    submitted
  ]
);

  /* ---------- FULLSCREEN AUTO SUBMIT ---------- */
  useEffect(() => {
    enterFullscreen();

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;

      if (!isNowFullscreen) {
        swal({
          title: "Fullscreen Exit Detected",
          text: "Exiting fullscreen is not allowed. The test will now be submitted.",
          icon: "warning",
          button: "OK",
          closeOnClickOutside: false,
          closeOnEsc: false
        }).then(() => {
          submitAssignment();
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [submitAssignment]);

  /* ---------- TAB SWITCH / FOCUS LOSS AUTO SUBMIT ---------- */
  useEffect(() => {
    const handleBlur = () => {
      swal({
        title: "Focus Lost",
        text: "Switching applications or minimizing is not allowed. The test will now be submitted.",
        icon: "warning",
        button: "OK",
        closeOnClickOutside: false,
        closeOnEsc: false
      }).then(() => {
        submitAssignment();
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        swal({
          title: "Tab Switch Detected",
          text: "Switching tabs is not allowed. The test will now be submitted.",
          icon: "warning",
          button: "OK",
          closeOnClickOutside: false,
          closeOnEsc: false
        }).then(() => {
          submitAssignment();
        });
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitAssignment]);

  /* ---------- FETCH ASSIGNMENT ---------- */
  useEffect(() => {
    async function fetchAssignment() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/assignments/${assignmentId}`,
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
        setAssignment(data);

        const key = `assignment_completed_questions_${assignmentId}_${studentId}`;
        setCompletedQuestions(
          JSON.parse(localStorage.getItem(key)) || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [assignmentId, studentId, navigate]);

  const goFullscreenAndNavigate = async (path) => {
    await enterFullscreen();
    navigate(path);
  };

  if (loading) {
    return <div className="assignment-loader">Loading assignment...</div>;
  }

  return (
    <div className="assignment-solve-page" ref={containerRef}>
      <div className="assignment-header">
        <div>
          <h2>{assignment.name}</h2>
          <p>{assignment.description}</p>
        </div>

        <div className="assignment-header-right">
          <AssignmentTimer
            assignmentId={assignmentId}
            onTimeUp={submitAssignment}
          />

          <span className="assignment-meta">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </span>

          <button
            className="end-test-btn"
            onClick={() => setShowModal(true)}
          >
            End Test
          </button>
        </div>
      </div>

      <div className="assignment-body">
        <div className="questions-section">
          <h3>Questions</h3>

          <div className="question-list">
            {assignment.questions.map((q, index) => {
              const completed = completedQuestions.includes(q._id);

              return (
                <div
                  key={q._id}
                  className={`question-card ${
                    completed ? "completed" : ""
                  }`}
                >
                  <span className="question-index">
                    Question {index + 1}
                  </span>

                  <div className="question-title">{q.title}</div>

                  <button
                    className="solve-btn"
                    disabled={completed}
                    onClick={() =>
                      goFullscreenAndNavigate(
                        `/assignments/solve/${assignmentId}/question/${q._id}`
                      )
                    }
                  >
                    {completed ? "Completed ✓" : "Solve →"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
