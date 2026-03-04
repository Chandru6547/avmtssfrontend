import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../utils/auth";
import "./MCQLibrary.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function MCQListByCategory() {
  const { category } = useParams();
  // const navigate = useNavigate();

  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- ASSIGN MODAL STATE ---------- */
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMcq, setSelectedMcq] = useState(null);

  const [campuses, setCampuses] = useState([]);
  const [years, setYears] = useState([]);
  const [batches, setBatches] = useState([]);

  const [campus, setCampus] = useState("");
  const [year, setYear] = useState("");

  const [batchesSelected, setBatchesSelected] = useState([]);

  const [students, setStudents] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");

  /* ---------- VIEW MCQ MODAL ---------- */
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMcq, setViewMcq] = useState(null);

  /* ---------- FETCH MCQS ---------- */
  useEffect(() => {
    async function fetchMCQs() {
      try {
        const res = await fetch(`${API_BASE}/getAllMCQForAdmin`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setMcqs(data.filter(mcq => mcq.category === category));
      } catch {
        setError("Unable to load MCQs");
      } finally {
        setLoading(false);
      }
    }

    fetchMCQs();
  }, [category]);

  /* ---------- FETCH CAMPUSES ---------- */
  useEffect(() => {
    fetch(`${API_BASE}/campus/get`)
      .then(res => res.json())
      .then(setCampuses)
      .catch(() => setCampuses([]));
  }, []);

  /* ---------- FETCH YEARS ---------- */
  useEffect(() => {
    if (!campus) return;

    fetch(`${API_BASE}/year/get-by-campus?campus=${encodeURIComponent(campus)}`)
      .then(res => res.json())
      .then(data => {
        setYears(data);
        setYear("");
        setBatches([]);
        setBatchesSelected([]);
      });
  }, [campus]);

  /* ---------- FETCH BATCHES ---------- */
  useEffect(() => {
    if (!campus || !year) return;

    fetch(
      `${API_BASE}/batch/get-by-campus-year?campus=${encodeURIComponent(
        campus
      )}&year=${year}`
    )
      .then(res => res.json())
      .then(data => {
        setBatches(data);
        setBatchesSelected([]);
      });
  }, [campus, year]);

  /* ---------- FETCH STUDENTS (MULTI BATCH) ---------- */
  useEffect(() => {
    if (!campus || !year || batchesSelected.length === 0) {
      setStudents([]);
      return;
    }

    async function fetchStudents() {
      const allStudents = [];
      const emailSet = new Set();

      for (const batch of batchesSelected) {
        try {
          const res = await fetch(
            `${API_BASE}/api/students/students?college=${encodeURIComponent(
              campus
            )}&year=${year}&batch=${batch}`
          );

          const data = await res.json();

          data.forEach(s => {
            if (!emailSet.has(s.email)) {
              emailSet.add(s.email);
              allStudents.push(s);
            }
          });
        } catch {}
      }

      setStudents(allStudents);
    }

    fetchStudents();
  }, [campus, year, batchesSelected]);

  /* ---------- HANDLE ASSIGN ---------- */
  const handleAssignMcq = async () => {
    if (!selectedMcq || students.length === 0) return;

    setAssignLoading(true);
    setAssignMessage(`Assigning to ${students.length} students...`);

    let success = 0;
    let failed = 0;

    for (const student of students) {
      try {
        await fetch(`${API_BASE}/addMcq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: student.email,
            mcq: selectedMcq._id
          })
        });
        success++;
      } catch {
        failed++;
      }
    }

    setAssignMessage(`✅ Assigned: ${success}, ❌ Failed: ${failed}`);
    setAssignLoading(false);

    setTimeout(() => {
      setShowAssignModal(false);
      setCampus("");
      setYear("");
      setBatchesSelected([]);
      setStudents([]);
      setAssignMessage("");
    }, 2000);
  };

  const toggleBatch = (batch) => {
    setBatchesSelected(prev =>
      prev.includes(batch)
        ? prev.filter(b => b !== batch)
        : [...prev, batch]
    );
  };

  if (loading) return <div className="page-loader">Loading MCQs...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="mcq-page">
      <h1 className="mcq-title">{category} MCQs</h1>

      <div className="mcq-grid">
        {mcqs.map(mcq => (
          <div key={mcq._id} className="mcq-card test-card">
            <h2>{mcq.topic}</h2>
            <p className="category">📂 {mcq.category}</p>

            <div className="mcq-meta">
              <span>❓ {mcq.questions.length} Questions</span>
              <span>🕒 {new Date(mcq.createdAt).toLocaleDateString("en-IN")}</span>
            </div>

            <div className="mcq-card-actions">
              <button
                onClick={() => {
                  setViewMcq(mcq);
                  setShowViewModal(true);
                }}
              >
                View
              </button>

              <button
                onClick={() => {
                  setSelectedMcq(mcq);
                  setShowAssignModal(true);
                }}
              >
                📤 Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ASSIGN MODAL ================= */}
      {showAssignModal && (
        <div className="assign-modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="assign-modal" onClick={e => e.stopPropagation()}>
            <h2>Assign MCQ: {selectedMcq?.topic}</h2>

            <div className="assign-form">
              <div className="form-group">
                <label>College</label>
                <select value={campus} onChange={e => setCampus(e.target.value)}>
                  <option value="">Select College</option>
                  {campuses.map(c => (
                    <option key={c._id} value={c.Campusname || c.name}>
                      {c.college || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Year</label>
                <select value={year} onChange={e => setYear(e.target.value)} disabled={!campus}>
                  <option value="">Select Year</option>
                  {years.map(y => (
                    <option key={y._id} value={y.Year || y.year}>
                      {y.Year || y.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Batch</label>
                {batches.map(b => {
                  const batchName = b.Batchname || b.batch;
                  return (
                    <label key={b._id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <input
                        type="checkbox"
                        checked={batchesSelected.includes(batchName)}
                        onChange={() => toggleBatch(batchName)}
                      />
                      {batchName}
                    </label>
                  );
                })}
              </div>

              {students.length > 0 && (
                <div className="students-info">
                  👥 {students.length} students will receive this MCQ
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn-assign-submit"
                  onClick={handleAssignMcq}
                  disabled={assignLoading || batchesSelected.length === 0}
                >
                  {assignLoading ? "Assigning..." : "✓ Assign to Batch"}
                </button>
                <button className="btn-cancel" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
              </div>

              {assignMessage && <p className="assign-message">{assignMessage}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW MCQ MODAL ================= */}
      {showViewModal && viewMcq && (
        <div className="assign-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="assign-modal view-mcq-modal"
            onClick={e => e.stopPropagation()}
          >
            <h2>{viewMcq.topic} – Questions</h2>

            <div className="view-mcq-body">
              {viewMcq.questions.map((q, index) => (
                <div key={q._id} className="mcq-question-card">
                  <h4>Q{index + 1}. {q.question}</h4>

                  <ul className="mcq-options">
                    <li>A. {q.optionA}</li>
                    <li>B. {q.optionB}</li>
                    <li>C. {q.optionC}</li>
                    <li>D. {q.optionD}</li>
                  </ul>

                  <p className="mcq-answer">
                    ✅ Correct Answer: {q.correctOption}
                  </p>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
