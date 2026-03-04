import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { getToken, logout, getUserId } from "../utils/auth";
import "./SolveQuestionPage.css";
import HumanLoader from "../components/loaders/HumanLoader";

export default function SolveQuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= HELPER (ADDED) ================= */
  const getPredefinedCodeForLanguage = (question, lang) => {
    if (!question?.predefinedCode) return "";
    const found = question.predefinedCode.find(p => p.language === lang);
    return found ? found.code : "";
  };

  /* ---------------- FETCH QUESTION ---------------- */
  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(
          `https://tssplatform.onrender.com/questions/${id}`,
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

        const resu = await res.json();
        setQuestion(resu);
      } catch (err) {
        console.error("Failed to load question", err);
      }
    }

    fetchQuestion();
  }, [id, navigate]);

  /* ========== LOAD PREDEFINED CODE ON QUESTION LOAD (ADDED) ========== */
  useEffect(() => {
    if (!question) return;

    if (question.isPredefinedOnly) {
      const starterCode = getPredefinedCodeForLanguage(question, language);
      setCode(starterCode);
    }
  }, [question, language]);

  /* ========== SWITCH PREDEFINED CODE ON LANGUAGE CHANGE (ADDED) ========== */
  useEffect(() => {
    if (!question) return;

    if (question.isPredefinedOnly) {
      const starterCode = getPredefinedCodeForLanguage(question, language);
      setCode(starterCode);
    }
  }, [question, language]);

  /* ---------------- RUN SAMPLE ---------------- */
  const runSample = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`https://tssplatform.onrender.com/run`, {
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
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      setResult(await res.json());
    } catch {
      setResult({ error: "Execution failed" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const submitHidden = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`https://tssplatform.onrender.com/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          language,
          code,
          questionId: id,
          studentId: getUserId()
        })
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      setResult(await res.json());
    } catch {
      setResult({ error: "Submission failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!question) {
    return (
      <HumanLoader
        loadingText="Preparing your problem"
        successText="Ready to practice!"
        duration={2000}
      />
    );
  }

  return (
    <div className="compiler-root">
      <div className="solve-layout">

        {/* LEFT PANEL */}
        <div className="solve-left">
          <div className="question-panel">

            <div className="question-header">
              <h1>{question.title}</h1>
              <span className={`difficulty ${question.difficulty?.toLowerCase()}`}>
                {question.difficulty}
              </span>
            </div>

            <div
              className="question-description"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            <h3 className="section-heading">Sample Testcases</h3>

            <div className="sample-list">
              {question.sampleTestcases.map((tc, i) => (
                <div key={i} className="sample-card">
                  <div className="sample-title">Testcase {i + 1}</div>
                  <div className="sample-row">
                    <strong>Input</strong>
                    <pre>{tc.input}</pre>
                  </div>
                  <div className="sample-row">
                    <strong>Output</strong>
                    <pre>{tc.output}</pre>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="solve-right">
          <div className="editor-shell">

            <div className="editor-top-bar">
              <div className="language-selector">
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
            </div>

            <CodeEditor
              language={language}
              code={code}
              setCode={setCode}
            />

            <div className="action-bar">
              <button onClick={runSample} disabled={loading}>
                ▶ Run
              </button>
              <button
                className="submit"
                onClick={submitHidden}
                disabled={loading}
              >
                🚀 Submit
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* RESULT */}
      {result && (
        <div className="result-panel">

          <div className="result-summary">
            <div className="summary-left">
              <span
                className={`summary-verdict ${
                  result.verdict === "AC" ? "ok" : "fail"
                }`}
              >
                {result.verdict === "AC" ? "✔ Accepted" : "✖ Wrong Answer"}
              </span>

              <span className="summary-count">
                {result.passed} / {result.total} testcases passed
              </span>
            </div>

            {result.submissionId && (
              <span className="summary-tag">Submission saved</span>
            )}
          </div>

          {result.submissionId === null && result.results && (
            <div className="testcase-list">
              {result.results.map((tc, i) => {
                const isError =
                  tc.status !== "PASS" &&
                  (tc.actual?.includes("error") ||
                    tc.actual?.includes("Error") ||
                    tc.actual?.includes("Exception") ||
                    tc.actual?.includes("In function"));

                return (
                  <div key={i}>

                    {!isError && (
                      <div
                        className={`testcase-card ${
                          tc.status === "PASS" ? "tc-pass" : "tc-fail"
                        }`}
                      >
                        <div className="tc-header">
                          <span>Testcase #{i + 1}</span>
                          <span className="tc-status">{tc.status}</span>
                        </div>

                        <div className="tc-row">
                          <label>Input</label>
                          <pre>{tc.input}</pre>
                        </div>

                        <div className="tc-row">
                          <label>Expected</label>
                          <pre>{tc.expected}</pre>
                        </div>

                        <div className="tc-row">
                          <label>Your Output</label>
                          <pre>{tc.actual}</pre>
                        </div>
                      </div>
                    )}

                    {isError && (
                      <div className="error-card">
                        <div className="error-header">
                          🚨 Error in Testcase #{i + 1}
                          <span className="error-tag">{tc.status}</span>
                        </div>
                        <pre className="error-output">{tc.actual}</pre>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
