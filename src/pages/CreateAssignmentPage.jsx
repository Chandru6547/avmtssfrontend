import { useEffect, useState } from "react";
import swal from "sweetalert";
import { getToken, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "./CreateAssignmentPage.css";

export default function CreateAssignmentPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH QUESTIONS ---------------- */
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/questionsforadmin`,
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
        setQuestions(data || []);
      } catch (err) {
        swal("Error", "Failed to load questions", "error");
      }
    }

    fetchQuestions();
  }, [navigate]);

  /* ---------------- ADD QUESTION ---------------- */
  const addQuestion = (q) => {
    if (selectedQuestions.find((x) => x._id === q._id)) return;
    setSelectedQuestions([...selectedQuestions, q]);
  };

  /* ---------------- REMOVE QUESTION ---------------- */
  const removeQuestion = (id) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q._id !== id));
  };

  /* ---------------- CREATE ASSIGNMENT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !dueDate || selectedQuestions.length === 0) {
      return swal({
        title: "Missing Fields",
        text: "Please fill all fields and add at least one question.",
        icon: "warning",
        button: "OK"
      });
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            name,
            description,
            dueDate,
            questions: selectedQuestions.map((q) => q._id)
          })
        }
      );

      if (!res.ok) throw new Error();

      await swal({
        title: "Success 🎉",
        text: "Assignment created successfully.",
        icon: "success",
        button: "Go to Assignments"
      });

      navigate("/assignments");
    } catch (err) {
      swal({
        title: "Failed",
        text: "Unable to create assignment. Please try again.",
        icon: "error",
        button: "Retry"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.difficulty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="assignment-page">
      <h2 className="page-title">Create Assignment</h2>

      <form onSubmit={handleSubmit} className="assignment-card">
        {/* ---------- BASIC INFO ---------- */}
        <div className="form-grid">
          <div>
            <label>Assignment Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter assignment name"
            />
          </div>

          <div>
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <label>Description</label>
        <textarea
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description about the assignment"
        />

        {/* ---------- QUESTIONS ---------- */}
        <div className="question-section">
          <div className="question-box">
            <h4>All Questions</h4>

            <input
              className="search-box"
              placeholder="Search by title or difficulty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="question-list">
              {filteredQuestions.map((q) => (
                <div key={q._id} className="question-row">
                  <div>
                    <div className="q-title">{q.title}</div>
                    <span className={`badge ${q.difficulty.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="add-btn"
                    disabled={selectedQuestions.some(
                      (x) => x._id === q._id
                    )}
                    onClick={() => addQuestion(q)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="question-box">
            <h4>Added to Assignment</h4>

            <div className="question-list">
              {selectedQuestions.length === 0 && (
                <p className="empty">No questions added</p>
              )}

              {selectedQuestions.map((q) => (
                <div key={q._id} className="question-row">
                  <div className="q-title">{q.title}</div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeQuestion(q._id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- SUBMIT ---------- */}
        <div className="actions">
          <button className="primary-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
