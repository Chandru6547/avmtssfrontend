import { useEffect, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaRegCalendarAlt,
  FaUserPlus,
  FaTimes
} from "react-icons/fa";
import "./TaskTracker.css";

const API = process.env.REACT_APP_API_BASE_URL;

export default function TaskTracker() {
  /* ================= TASKS ================= */
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: ""
  });
  const [editingId, setEditingId] = useState(null);

  /* ================= ASSIGN MODAL ================= */
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTaskId, setAssignTaskId] = useState(null);

  /* ================= STUDENT FILTER ================= */
  const [campuses, setCampuses] = useState([]);
  const [years, setYears] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [campus, setCampus] = useState("");
  const [year, setYear] = useState("");
  const [batch, setBatch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  /* ================= UI ================= */
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);

  console.log(loading);
  
  /* ================= LOAD TASKS ================= */
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/task/getAllTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ================= LOAD CAMPUS ================= */
  useEffect(() => {
    fetch(`${API}/campus/get`)
      .then(res => res.json())
      .then(setCampuses);
  }, []);

  /* ================= LOAD YEARS ================= */
  useEffect(() => {
    if (!campus) return;
    fetch(`${API}/year/get-by-campus?campus=${encodeURIComponent(campus)}`)
      .then(res => res.json())
      .then(data => {
        setYears(data);
        setYear("");
        setBatch("");
        setStudents([]);
        setSelectedStudents([]);
      });
  }, [campus]);

  /* ================= LOAD BATCHES ================= */
  useEffect(() => {
    if (!campus || !year) return;
    fetch(
      `${API}/batch/get-by-campus-year?campus=${encodeURIComponent(
        campus
      )}&year=${year}`
    )
      .then(res => res.json())
      .then(setBatches);
  }, [campus, year]);

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    if (!campus || !year || !batch) return;

    fetch(
      `${API}/api/students/students?college=${encodeURIComponent(
        campus
      )}&year=${year}&batch=${batch}`
    )
      .then(res => res.json())
      .then(data => {
        setStudents(data || []);
        setSelectedStudents([]);
      });
  }, [campus, year, batch]);

  /* ================= CREATE / UPDATE TASK ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId
      ? `${API}/api/task/updateTask`
      : `${API}/api/task/addTask`;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingId ? { ...form, taskId: editingId } : form
      )
    });

    setForm({ title: "", description: "", dueDate: "" });
    setEditingId(null);
    setSaving(false);
    loadTasks();
  };

  /* ================= ASSIGN TASK ================= */
  const assignTaskToStudents = async () => {
    if (!assignTaskId || selectedStudents.length === 0) return;

    setAssigning(true);

    for (const student of selectedStudents) {
      await fetch(`${API}/api/addTaskToUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: student._id,
          taskId: assignTaskId
        })
      });
    }

    setAssigning(false);
    setShowAssignModal(false);
    setSelectedStudents([]);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await fetch(`${API}/api/task/deleteTask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: id })
    });

    loadTasks();
  };

  /* ================= SELECT ALL ================= */
  const allSelected =
    students.length > 0 &&
    selectedStudents.length === students.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students);
    }
  };

  const isOverdue = (date) =>
    new Date(date).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0);

  return (
    <div className="task-page">
      <div className="page-header">
        <h2>Task Tracker</h2>
        <p>Create, manage & assign tasks to students</p>
      </div>

      {/* ================= FORM ================= */}
      <form className="task-form glass" onSubmit={handleSubmit}>
        <input
          placeholder="Task title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          type="date"
          required
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />

        <input
          placeholder="Short description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button className="add-btn" disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update" : <> <FaPlus /> Add </>}
        </button>
      </form>

      {/* ================= TASK GRID ================= */}
      <div className="task-grid">
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`task-card ${isOverdue(task.dueDate) ? "overdue" : ""}`}
          >
            <h4>{task.title}</h4>

            <div className="date-row">
              <FaRegCalendarAlt />
              <span>{new Date(task.dueDate).toDateString()}</span>
            </div>

            <div className="task-actions">
              <button
                onClick={() => {
                  setAssignTaskId(task._id);
                  setShowAssignModal(true);
                }}
              >
                <FaUserPlus />
              </button>

              <button
                onClick={() => {
                  setEditingId(task._id);
                  setForm({
                    title: task.title,
                    description: task.description || "",
                    dueDate: task.dueDate?.substring(0, 10)
                  });
                }}
              >
                <FaEdit />
              </button>

              <button
                className="danger"
                onClick={() => handleDelete(task._id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ASSIGN MODAL ================= */}
      {showAssignModal && (
        <div className="modal-backdrop fade-in">
          <div className="modal large slide-up">
            <div className="modal-header">
              <div>
                <h3>Assign Task</h3>
                <p className="modal-subtitle">
                  Select academic details and students
                </p>
              </div>
              <FaTimes
                className="close-icon"
                onClick={() => setShowAssignModal(false)}
              />
            </div>

            <div className="modal-body">
              {/* STEP 1 */}
              <div className="step">
                <span className="step-badge">1</span>
                <h4>Academic Filter</h4>

                <div className="filter-grid">
                  <select value={campus} onChange={e => setCampus(e.target.value)}>
                    <option value="">College</option>
                    {campuses.map(c => (
                      <option key={c._id} value={c.Campusname || c.name}>
                        {c.college || c.name}
                      </option>
                    ))}
                  </select>

                  <select value={year} onChange={e => setYear(e.target.value)}>
                    <option value="">Year</option>
                    {years.map(y => (
                      <option key={y._id} value={y.Year || y.year}>
                        {y.Year || y.year}
                      </option>
                    ))}
                  </select>

                  <select value={batch} onChange={e => setBatch(e.target.value)}>
                    <option value="">Batch</option>
                    {batches.map(b => (
                      <option key={b._id} value={b.Batchname || b.batch}>
                        {b.Batchname || b.batch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="step">
                <div className="step-header">
                  <h4>Select Students</h4>
                  {students.length > 0 && (
                    <button
                      type="button"
                      className="assign-btn"
                      onClick={toggleSelectAll}
                    >
                      {allSelected ? "Clear All" : "Select All"}
                    </button>
                  )}
                </div>

                {students.length === 0 ? (
                  <p className="hint-text">No students loaded</p>
                ) : (
                  <div className="student-chip-grid">
                    {students.map(s => {
                      const selected = selectedStudents.some(
                        x => x._id === s._id
                      );
                      return (
                        <div
                          key={s._id}
                          className={`student-chip ${selected ? "active" : ""}`}
                          onClick={() =>
                            setSelectedStudents(prev =>
                              selected
                                ? prev.filter(x => x._id !== s._id)
                                : [...prev, s]
                            )
                          }
                        >
                          <span>{s.name}</span>
                          <small>{s.email}</small>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <span className="selected-count">
                {selectedStudents.length} selected
              </span>

              <button
                className="assign-btn"
                disabled={assigning || selectedStudents.length === 0}
                onClick={assignTaskToStudents}
              >
                {assigning ? "Assigning..." : "Assign Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
