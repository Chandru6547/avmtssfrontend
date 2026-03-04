import { useEffect, useState } from "react";
import swal from "sweetalert";
import { getToken, getUserId, getEmail } from "../utils/auth";
import HumanLoader from "../components/loaders/HumanLoader";
import "./ViewMcqsAnswer.css";

export default function ViewMcqsAnswer() {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [submission, setSubmission] = useState(null);
  const [blurred, setBlurred] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const studentId = getUserId();
  const email = getEmail();

  /* ---------- FETCH MCQS (MIN 3s LOADER) ---------- */
  useEffect(() => {
    async function fetchMcqs() {
      const startTime = Date.now();
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/mcqs/getMcqsDetailForStudent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ studentId })
          }
        );

        const data = await res.json();
        setMcqs(data || []);
      } catch (err) {
        swal("Error", "Failed to load MCQs", "error");
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(3000 - elapsed, 0);
        setTimeout(() => setLoading(false), remaining);
      }
    }

    fetchMcqs();
  }, [studentId]);

  /* ---------- TAB SWITCH BLUR ---------- */
  useEffect(() => {
    const handler = () => setBlurred(document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  /* ---------- LOCK SCROLL ---------- */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  /* ---------- OPEN MCQ ---------- */
  const openMcq = async (mcq) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/mcq-submissions/getSubmissionForStudentAndMcq`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ studentId, mcqId: mcq._id })
        }
      );

      const submissions = await res.json();

      if (!submissions || !submissions.length) {
        return swal({
          title: "Not Attempted",
          text: "You have not attempted this MCQ yet.",
          icon: "warning",
          button: "OK"
        });
      }

      const last = submissions[0];

      // 🔥 FIXED: 24 HOURS CHECK
      const hoursPassed =
        (Date.now() - new Date(last.submittedAt)) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        const remainingHours = Math.ceil(24 - hoursPassed);

        return swal({
          title: "Answers Locked 🔒",
          text: `Answers will unlock after 24 hours.\n\nPlease wait ${remainingHours} more hour(s).`,
          icon: "info",
          button: "OK",
          closeOnClickOutside: false
        });
      }

      setSubmission(last);
      setQuestions(mcq.questions || []);
      setIndex(0);
      setShowExplanation(false);
      setOpen(true);
    } catch (err) {
      swal("Error", "Unable to load MCQ answers", "error");
    }
  };

  /* ---------- LOADER ---------- */
  if (loading) {
    return (
      <HumanLoader
        loadingText="Preparing answer review"
        successText="Ready to review!"
        duration={2000}
      />
    );
  }

  const q = questions[index];
  const studentAnswer = submission?.answers?.[q?._id];
  const progress = questions.length
    ? ((index + 1) / questions.length) * 100
    : 0;

  return (
    <div className="mcq-page">
      {/* ---------- HEADER ---------- */}
      <div className="page-header">
        <div>
          <h2>MCQ Answer Review</h2>
          <p>Review your submitted MCQs with explanations</p>
        </div>

        <div className="header-stats">
          <div>
            <strong>{mcqs.length}</strong>
            <span>MCQs</span>
          </div>
          <div>
            <strong>
              {mcqs.reduce((a, b) => a + b.questions.length, 0)}
            </strong>
            <span>Questions</span>
          </div>
        </div>
      </div>

      {/* ---------- GRID ---------- */}
      <div className="mcq-grid">
        {mcqs.map((mcq) => (
          <div
            key={mcq._id}
            className="mcq-card"
            onClick={() => openMcq(mcq)}
          >
            <div className="card-top">
              <span className="badge">MCQ</span>
              <span className="chip">{mcq.category}</span>
            </div>

            <h3>{mcq.topic}</h3>
            <p className="meta">📝 {mcq.questions.length} Questions</p>
            <button>Review Answers →</button>
          </div>
        ))}
      </div>

      {/* ---------- MODAL ---------- */}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div
            className={`modal animated ${blurred ? "blurred" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="watermark">{email}</div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="progress-text">
              Question {index + 1} of {questions.length}
            </p>

            <p className="progress-percent">
              {Math.round(progress)}% completed
            </p>

            <h3 className="question">{q?.question}</h3>

            <ul className="options">
              {["A", "B", "C", "D"].map((opt) => {
                const key = `option${opt}`;
                const correct = q.correctOption === opt;
                const selected = studentAnswer === opt;

                return (
                  <li
                    key={opt}
                    className={`option
                      ${correct ? "correct" : ""}
                      ${selected && !correct ? "wrong" : ""}
                    `}
                  >
                    <b>{opt}.</b> {q[key]}
                    {correct && <span className="tag success">Correct</span>}
                    {selected && <span className="tag info">Your Answer</span>}
                  </li>
                );
              })}
            </ul>

            {!showExplanation ? (
              <button
                className="reveal"
                onClick={() => setShowExplanation(true)}
              >
                Reveal Explanation
              </button>
            ) : (
              <div className="explanation animated-fade">
                {q.explanation}
              </div>
            )}

            <div className="modal-actions">
              <button
                disabled={index === 0}
                onClick={() => {
                  setIndex(index - 1);
                  setShowExplanation(false);
                }}
              >
                ← Previous
              </button>

              <button
                disabled={index === questions.length - 1}
                onClick={() => {
                  setIndex(index + 1);
                  setShowExplanation(false);
                }}
              >
                Next →
              </button>

              <button className="close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
