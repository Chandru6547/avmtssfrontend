import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, logout, getUserId } from "../utils/auth";
import swal from "sweetalert";
import "./MCQTestPage.css";

/* ================= SHUFFLE UTILITY ================= */
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function MCQTestPage() {
  const { mcqId } = useParams();
  const navigate = useNavigate();
  const userId = getUserId();

  const [mcq, setMcq] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);

  const totalTimerRef = useRef(null);
  const tabSwitchCountRef = useRef(0);

  const STORAGE_KEY = useRef(`mcq_${mcqId}_${userId}_answers`).current;
  const ORDER_KEY = useRef(`mcq_${mcqId}_${userId}_order`).current;

  /* ---------- SUBMIT TEST ---------- */
  const submitTest = useCallback(
    async (forced = false) => {
      if (submitting || !mcq) return;
      setSubmitting(true);

      try {
        const payload = mcq.questions.map((q) => ({
          questionId: q._id,
          selectedOption: answers[q._id] || null,
        }));

        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/mcq-submissions/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              mcqId,
              studentId: userId,
              answers: payload,
              forcedSubmit: forced,
            }),
          }
        );

        const data = await res.json();
        const finalScore =
          data?.submission?.score ?? data?.score ?? 0;

        setScore(finalScore);

        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ORDER_KEY);

        if (forced) {
          await swal({
            title: "Test Auto Submitted",
            text: "Your test was auto-submitted due to a policy violation.",
            icon: "warning",
            button: "OK",
            closeOnClickOutside: false,
            closeOnEsc: false,
          });
        } else {
          await swal({
            title: "Test Completed",
            text: `Your Score: ${finalScore} / ${mcq.questions.length}`,
            icon: "success",
            button: "Back to MCQs",
            closeOnClickOutside: false,
            closeOnEsc: false,
          });
        }

        navigate("/mcqs/student");
      } finally {
        exitFullscreenSafely();
      }
    },
    [mcqId, userId, answers, mcq, submitting, STORAGE_KEY, ORDER_KEY, navigate]
  );

   console.log(score);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (!started || !mcq) return;

    if (totalTimeLeft === 0) {
      setTotalTimeLeft(mcq.duration * 60);
      return;
    }

    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(totalTimerRef.current);
          submitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(totalTimerRef.current);
  }, [started, totalTimeLeft, mcq, submitTest]);

  /* ---------- FULLSCREEN ---------- */
  const enterFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  };

  const exitFullscreenSafely = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  /* ---------- FETCH MCQ ---------- */
  useEffect(() => {
    const fetchMCQ = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/mcqs/${mcqId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      const data = await res.json();

      const savedOrder = localStorage.getItem(ORDER_KEY);
      let finalQuestions;

      if (savedOrder) {
        const order = JSON.parse(savedOrder);
        finalQuestions = order
          .map((id) => data.questions.find((q) => q._id === id))
          .filter(Boolean);
      } else {
        finalQuestions = shuffleArray(data.questions);
        localStorage.setItem(
          ORDER_KEY,
          JSON.stringify(finalQuestions.map((q) => q._id))
        );
      }

      setMcq({ ...data, questions: finalQuestions });

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers(JSON.parse(saved));
    };

    fetchMCQ();
  }, [mcqId, navigate, STORAGE_KEY, ORDER_KEY]);

  /* ---------- TAB SWITCH DETECTION ---------- */
  useEffect(() => {
    if (!started) return;

    const handleViolation = async () => {
      tabSwitchCountRef.current += 1;

      if (tabSwitchCountRef.current === 2) {
        await swal({
          title: "Warning ⚠️",
          text: "Do not switch tabs again.",
          icon: "warning",
          button: "Continue Test",
        });
      }

      if (tabSwitchCountRef.current >= 3) {
        submitTest(true);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const onBlur = () => handleViolation();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [started, submitTest]);

  /* ---------- START TEST ---------- */
  const startTest = async () => {
    try {
      await enterFullscreen();
      setStarted(true);
    } catch {
      exitFullscreenSafely();
    }
  };

  if (!mcq) return null;

  if (!started) {
    return (
      <div className="start-screen">
        <h1>{mcq.title || "MCQ Test"}</h1>
        <ul className="rules">
          <li>Fullscreen mandatory</li>
          <li>Tab switching is monitored</li>
          <li>⏱️ Total Duration: {mcq.duration} minutes</li>
        </ul>
        <button className="start-btn" onClick={startTest}>
          Start Test
        </button>
      </div>
    );
  }

  const question = mcq.questions[index];
  const selected = answers[question._id];
  const progress = ((index + 1) / mcq.questions.length) * 100;

  const selectOption = (opt) => {
    if (selected) return;
    const updated = { ...answers, [question._id]: opt };
    setAnswers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="exam-wrapper">
      <div className="progress-bar">
        <div style={{ width: `${progress}%` }} />
      </div>

      <div className="total-time-top-right">
        ⏱️ {formatTime(totalTimeLeft)}
      </div>

      <div className="exam-container">
        <div className="question-panel">
          <h2>{question.question}</h2>
        </div>

        <div className="options-panel">
          {["A", "B", "C", "D"].map((opt) => (
            <div
              key={opt}
              className={`option-tile ${
                selected === opt ? "selected" : ""
              }`}
              onClick={() => selectOption(opt)}
            >
              <span className="opt-circle">{opt}</span>
              <span>{question[`option${opt}`]}</span>
            </div>
          ))}

          <div className="nav-buttons">
            {index < mcq.questions.length - 1 ? (
              <button
                disabled={!selected}
                onClick={() => setIndex((i) => i + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                className="submit"
                disabled={!selected || submitting}
                onClick={() => submitTest(false)}
              >
                Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
