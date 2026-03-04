import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import AssignmentTimer from "./AssignmentTimer";
import { getToken, logout, getUserId } from "../utils/auth";
import swal from "sweetalert";
import "./AssignmentSolveQuestionPage.css";

export default function AssignmentSolveQuestionPage() {
  const { assignmentId, questionId } = useParams();
  const navigate = useNavigate();
  const studentId = getUserId(); // ✅ IMPORTANT

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const autoSubmittedRef = useRef(false);

  // ✅ STUDENT-SCOPED KEY
  const completedKey = `assignment_completed_questions_${assignmentId}_${studentId}`;

  /* ---------- MARK QUESTION COMPLETED ---------- */
  const markQuestionCompleted = useCallback(() => {
    const completed =
      JSON.parse(localStorage.getItem(completedKey)) || [];

    if (!completed.includes(questionId)) {
      completed.push(questionId);
      localStorage.setItem(
        completedKey,
        JSON.stringify(completed)
      );
    }
  }, [completedKey, questionId]);

  /* ---------- FULLSCREEN ENFORCEMENT ---------- */
  /* ---------- FULLSCREEN + VIOLATION DETECTION ---------- */
useEffect(() => {
  const forceKey = `assignment_force_submit_${assignmentId}`;

  const requestFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  requestFullscreen();

  const triggerViolation = () => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;

    // 🔥 Set flag so Solve page will submit
    localStorage.setItem(forceKey, "true");

    // Navigate back to Solve page
    navigate(`/assignments/solve/${assignmentId}`);
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      triggerViolation();
    }
  };

  const handleBlur = () => {
    triggerViolation();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      triggerViolation();
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  window.addEventListener("blur", handleBlur);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [assignmentId, navigate]);

  /* ---------- FETCH QUESTION ---------- */
  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/questions/${questionId}`,
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
        setQuestion(data);
      } catch {
        console.error("Failed to load question");
      }
    }

    fetchQuestion();
  }, [questionId, navigate]);

  /* ---------- SUBMIT ---------- */
  const submitAssignment = useCallback(async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        "https://tssplatform.onrender.com/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            language,
            code,
            questionId,
            assignmentId,
            studentId
          })
        }
      );

      const data = await res.json();
      setResult(data);

      // ✅ IF ALL TESTCASES PASSED
      if (data.passed === data.total) {
        markQuestionCompleted();

        swal({
          title: "Success!",
          text: "Question solved successfully!",
          icon: "success",
          buttons: false,
          timer: 3000
        });

        // ⏳ Redirect after 3 seconds
        setTimeout(() => {
          navigate(-1); // go back
        }, 3000);
      }

    } catch {
      setResult({ error: "Submission failed" });
    } finally {
      setLoading(false);
    }
  }, [
    language,
    code,
    questionId,
    assignmentId,
    studentId,
    markQuestionCompleted,
    navigate
  ]);
  /* ---------- AUTO SUBMIT ON LOAD (OPTIONAL FEATURE) ---------- */
  useEffect(() => {
    if (!question) return;
    if (!code.trim()) return;
    if (autoSubmittedRef.current) return;

    autoSubmittedRef.current = true;
    submitAssignment();
  }, [question, code, submitAssignment]);

  /* ---------- RUN ---------- */
  const runSample = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        "https://tssplatform.onrender.com/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            language,
            code,
            testcases: question.sampleTestcases
          })
        }
      );

      setResult(await res.json());
    } catch {
      setResult({ error: "Execution failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!question) {
    return <div className="assignment-loader">Loading question...</div>;
  }

  const failedCount =
    result && !result.results ? result.total - result.passed : 0;

  return (
    <div className="assignment-root">
      <div className="assignment-layout">
        {/* ---------- LEFT ---------- */}
        <div className="assignment-left">
          <div className="question-card">
            <div className="question-header">
              <h1>{question.title}</h1>
              <span
                className={`difficulty ${question.difficulty?.toLowerCase()}`}
              >
                {question.difficulty}
              </span>
            </div>

            <div
              className="question-description"
              dangerouslySetInnerHTML={{
                __html: question.description
              }}
            />

            <h3 className="section-title">Sample Testcases</h3>

            {question.sampleTestcases.map((tc, i) => (
              <div key={i} className="sample-box">
                <strong>Input</strong>
                <pre>{tc.input}</pre>
                <strong>Output</strong>
                <pre>{tc.output}</pre>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- RIGHT ---------- */}
        <div className="assignment-right">
          <div className="editor-header">
            <button
              className="btn ghost"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>

            <AssignmentTimer
              assignmentId={assignmentId}
              onTimeUp={() =>
                navigate(`/assignments/solve/${assignmentId}`)
              }
            />

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div className="editor-wrapper">
            <CodeEditor
              language={language}
              code={code}
              setCode={setCode}
            />
          </div>

          <div className="editor-actions">
            <button
              className="btn ghost"
              onClick={runSample}
              disabled={loading}
            >
              ▶ Run
            </button>
            <button
              className="btn primary"
              onClick={submitAssignment}
              disabled={loading}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* ---------- RESULT ---------- */}
      {result && (
        <div className="result-container">
          {result.results ? (
            <>
              <h3 className="result-title">Run Results</h3>
              <table className="result-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Input</th>
                    <th>Expected</th>
                    <th>Your Output</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((tc, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><pre>{tc.input}</pre></td>
                      <td><pre>{tc.expected}</pre></td>
                      <td><pre>{tc.actual}</pre></td>
                      <td>
                        <span
                          className={`status ${
                            tc.status === "AC" ? "ok" : "fail"
                          }`}
                        >
                          {tc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="submit-summary-text">
              <span className="passed">
                ✅ Passed:{" "}
                <strong>{result.passed}/{result.total}</strong>
              </span>
              <span className="failed">
                ❌ Failed:{" "}
                <strong>{failedCount}/{result.total}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
