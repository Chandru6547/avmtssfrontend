import { useEffect, useState } from "react";
import { debounce } from "lodash"; // Import lodash for debounce
import {
  getAllMCQForAdmin,
  getMCQsByCategory,
  getMCQsByTopic,
  deleteMCQ
} from "../api/mcq.api";
import "./MCQListPage.css";

export default function MCQListPage() {
  const [mcqs, setMcqs] = useState([]);
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const loadMCQs = async () => {
    setLoading(true);
    const data = await getAllMCQForAdmin();
    setMcqs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMCQs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this MCQ?")) return;
    await deleteMCQ(id);
    loadMCQs();
  };

  const debouncedFilterByCategory = debounce(async (value) => {
    if (!value.trim()) return;
    setLoading(true);
    setMcqs(await getMCQsByCategory(value));
    setLoading(false);
  }, 300);

  const debouncedFilterByTopic = debounce(async (value) => {
    if (!value.trim()) return;
    setLoading(true);
    setMcqs(await getMCQsByTopic(value));
    setLoading(false);
  }, 300);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    debouncedFilterByCategory(value);
  };

  const handleTopicChange = (e) => {
    const value = e.target.value;
    setTopic(value);
    debouncedFilterByTopic(value);
  };

  return (
    <div className="mcq-list-page">
      <div className="page-header">
        <h2>MCQ Bank</h2>
        <p>Browse, filter and manage multiple choice questions</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          placeholder="Filter by Category"
          value={category}
          onChange={handleCategoryChange}
        />
        <input
          placeholder="Filter by Topic"
          value={topic}
          onChange={handleTopicChange}
        />
        <button className="reset" onClick={loadMCQs}>Reset</button>
      </div>

      {/* Content */}
      {loading && <p className="status-text">Loading MCQs...</p>}

      {!loading && mcqs.length === 0 && (
        <p className="status-text">No MCQs found</p>
      )}

      {!loading && mcqs.map(mcq => (
        <div key={mcq._id} className={`mcq-card ${expandedId === mcq._id ? "expanded" : ""}`}>
          <div className="mcq-header">
            <div>
              <h3>{mcq.topic}</h3>
              <span className="tag">{mcq.category}</span>
              <span className="count">
                {mcq.questions.length} Questions
              </span>
            </div>

            <div className="mcq-actions">
              <button
                className="view"
                onClick={() =>
                  setExpandedId(
                    expandedId === mcq._id ? null : mcq._id
                  )
                }
              >
                {expandedId === mcq._id ? "Hide" : "View"}
              </button>

              <button
                className="delete"
                onClick={() => handleDelete(mcq._id)}
              >
                Delete
              </button>
            </div>
          </div>

          {expandedId === mcq._id && (
            <div className="mcq-questions">
              {mcq.questions.map((q, i) => (
                <div key={i} className="question-item">
                  <strong>Q{i + 1}.</strong> {q.question}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
