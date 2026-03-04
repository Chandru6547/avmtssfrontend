import { useEffect, useState } from "react";
import "./AssignCourseOrMcq.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function AssignCourseOrMcq() {
  /* ---------- MASTER DATA ---------- */
  const [campuses, setCampuses] = useState([]);
  const [years, setYears] = useState([]);
  const [batches, setBatches] = useState([]);

  /* ---------- SELECTION ---------- */
  const [campus, setCampus] = useState("");
  const [year, setYear] = useState("");
  const [selectedBatches, setSelectedBatches] = useState([]);

  /* ---------- MODE ---------- */
  const [mode, setMode] = useState("assign"); // assign | remove

  /* ---------- ASSIGN TYPE ---------- */
  const [assignType, setAssignType] = useState("");
  const [courses, setCourses] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  /* ---------- STUDENTS ---------- */
  const [students, setStudents] = useState([]);

  /* ---------- UI ---------- */
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------- FETCH CAMPUSES ---------- */
  useEffect(() => {
    fetch(`${API_BASE}/campus/get`)
      .then(res => res.json())
      .then(setCampuses);
  }, []);

  /* ---------- FETCH YEARS ---------- */
  useEffect(() => {
    if (!campus) return;
    fetch(`${API_BASE}/year/get-by-campus?campus=${encodeURIComponent(campus)}`)
      .then(res => res.json())
      .then(data => {
        setYears(data);
        setYear("");
        setSelectedBatches([]);
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
      .then(setBatches);
  }, [campus, year]);

  /* ---------- FETCH STUDENTS ---------- */
  useEffect(() => {
    if (!campus || !year || selectedBatches.length === 0) return;

    const load = async () => {
      let all = [];
      for (const batch of selectedBatches) {
        const res = await fetch(
          `${API_BASE}/api/students/students?college=${encodeURIComponent(
            campus
          )}&year=${year}&batch=${batch}`
        );
        const data = await res.json();
        all.push(...data);
      }
      setStudents(
        Array.from(new Map(all.map(s => [s.email, s])).values())
      );
    };
    load();
  }, [campus, year, selectedBatches]);

  /* ---------- FETCH ITEMS ---------- */
  useEffect(() => {
    setSelectedItem("");

    if (assignType === "course") {
      fetch(`${API_BASE}/courses/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      })
        .then(res => res.json())
        .then(setCourses);
    }

    if (assignType === "mcq") {
      fetch(`${API_BASE}/getAllMCQForAdmin`)
        .then(res => res.json())
        .then(setMcqs);
    }

    if (assignType === "assignment") {
      fetch(`${API_BASE}/api/assignments`)
        .then(res => res.json())
        .then(setAssignments);
    }
  }, [assignType]);

  /* ---------- ASSIGN / REMOVE ---------- */
  const handleSubmit = async () => {
    if (!assignType || !selectedItem) {
      setMessage("❌ Select type and item");
      return;
    }

    if (students.length === 0) {
      setMessage("❌ No students found");
      return;
    }

    setLoading(true);
    setMessage(`${mode === "assign" ? "Assigning" : "Removing"}...`);

    let endpoint = "";
    let payload = null;

    if (assignType === "course") {
      endpoint = mode === "assign" ? "/addCourse" : "/removeCourse";
      payload = email => ({ email, course: selectedItem });
    }

    if (assignType === "mcq") {
      endpoint = mode === "assign" ? "/addMcq" : "/removeMcq";
      payload = email => ({ email, mcq: selectedItem });
    }

    if (assignType === "assignment") {
      endpoint =
        mode === "assign"
          ? "/addAssignmentToUser"
          : "/removeAssignmentFromUser";
      payload = email => ({ email, assignmentId: selectedItem });
    }

    for (const s of students) {
      await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(s.email))
      });
    }

    setMessage(`✅ ${mode === "assign" ? "Assigned" : "Removed"} successfully`);
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <div className="assign-card">
  <h2 className="card-title">
    {mode === "assign" ? "Assign Resources" : "Remove Resources"}
  </h2>
  <p className="card-subtitle">
    Assign or remove courses, MCQs, or assignments for selected students
  </p>

  <div className="tab-pills">
    <button
      className={mode === "assign" ? "active" : ""}
      onClick={() => setMode("assign")}
    >
      Assign
    </button>
    <button
      className={mode === "remove" ? "active" : ""}
      onClick={() => setMode("remove")}
    >
      Remove
    </button>
  </div>

  {/* ---------- ACADEMIC FILTER ---------- */}
  <div className="section">
    <h4 className="section-title">Academic Filter</h4>

    <div className="form-grid">
      <div className="field">
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

      <div className="field">
        <label>Year</label>
        <select value={year} onChange={e => setYear(e.target.value)}>
          <option value="">Select Year</option>
          {years.map(y => (
            <option key={y._id} value={y.Year || y.year}>
              {y.Year || y.year}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>

  {/* ---------- BATCH SELECTION ---------- */}
  {batches.length > 0 && (
    <div className="section">
      <h4 className="section-title">Select Batches</h4>
      <div className="batch-grid">
        {batches.map(b => {
          const val = b.Batchname || b.batch;
          return (
            <label
              key={b._id}
              className={`batch-pill ${
                selectedBatches.includes(val) ? "active" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selectedBatches.includes(val)}
                onChange={e =>
                  setSelectedBatches(p =>
                    e.target.checked
                      ? [...p, val]
                      : p.filter(x => x !== val)
                  )
                }
              />
              {val}
            </label>
          );
        })}
      </div>
    </div>
  )}

  {/* ---------- RESOURCE SELECTION ---------- */}
  <div className="section">
    <h4 className="section-title">Resource</h4>

    <div className="field">
      <label>Type</label>
      <select value={assignType} onChange={e => setAssignType(e.target.value)}>
        <option value="">Select Type</option>
        <option value="course">Course</option>
        <option value="mcq">MCQ</option>
        <option value="assignment">Assignment</option>
      </select>
    </div>

    {assignType === "course" && (
      <div className="field">
        <label>Course</label>
        <select onChange={e => setSelectedItem(e.target.value)}>
          <option value="">Select Course</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    )}

    {assignType === "mcq" && (
      <div className="field">
        <label>MCQ</label>
        <select onChange={e => setSelectedItem(e.target.value)}>
          <option value="">Select MCQ</option>
          {mcqs.map(m => (
            <option key={m._id} value={m._id}>
              {m.topic}
            </option>
          ))}
        </select>
      </div>
    )}

    {assignType === "assignment" && (
      <div className="field">
        <label>Assignment</label>
        <select onChange={e => setSelectedItem(e.target.value)}>
          <option value="">Select Assignment</option>
          {assignments.map(a => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>

  <button
    className="primary-btn"
    onClick={handleSubmit}
    disabled={loading}
  >
    {loading
      ? "Processing..."
      : mode === "assign"
      ? "Assign Resource"
      : "Remove Resource"}
  </button>

  {message && (
    <div className={`message-box ${message.startsWith("✅") ? "success" : "error"}`}>
      {message}
    </div>
  )}
</div>

    </div>
  );
}
