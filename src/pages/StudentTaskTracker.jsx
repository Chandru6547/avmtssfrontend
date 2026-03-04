import { useEffect, useState, useCallback, useMemo } from "react";
import swal from "sweetalert";
import StudentTaskDashboard from "./StudentTaskDashboard";
import StudentTaskCharts from "./StudentTaskCharts";
import {
  FaRegCalendarAlt,
  FaPlay,
  FaUpload,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaEye
} from "react-icons/fa";
import "./StudentTaskTracker.css";

const API = process.env.REACT_APP_API_BASE_URL;
const CLOUD_NAME = "dmdzi18ww";
const UPLOAD_PRESET = "tssplatformtasksubmission";

export default function StudentTaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofImages, setProofImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [taskStatusMap, setTaskStatusMap] = useState({});
  const [filter, setFilter] = useState("all"); // 👈 dashboard filter
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dueAsc");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  const studentId = localStorage.getItem("userId");

  /* ================= LOAD TASKS ================= */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/user/getTasksForStudent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: studentId })
      });
      const data = await res.json();
      setTasks(data || []);
    } catch {
      swal("Error", "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  /* ================= LOAD STATUS PER TASK ================= */
  const loadTaskStatus = useCallback(
    async (taskId) => {
      const res = await fetch(
        `${API}/api/taskSubmission/getSubmissionByStudentAndTask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, taskId })
        }
      );
      const data = await res.json();
      return data[0]?.taskStatus || "not_started";
    },
    [studentId]
  );

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* ================= FETCH STATUS AFTER TASK LOAD ================= */
  useEffect(() => {
    if (!tasks.length) return;

    (async () => {
      const statusObj = {};
      for (const task of tasks) {
        statusObj[task._id] = await loadTaskStatus(task._id);
      }
      setTaskStatusMap(statusObj);
    })();
  }, [tasks, loadTaskStatus]);

  /* ================= START TASK ================= */
  const startTask = async (task) => {
    try {
      const res = await fetch(`${API}/api/task/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, taskId: task._id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      swal("Started!", "Task started successfully", "success");

      setTaskStatusMap((prev) => ({
        ...prev,
        [task._id]: "started"
      }));
    } catch (err) {
      swal("Error", err.message, "error");
    }
  };

  /* ================= CLOUDINARY UPLOAD ================= */
  const uploadProofImages = async (files) => {
    setUploading(true);
    const uploaded = [];

    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: form }
        );
        const data = await res.json();
        uploaded.push({ url: data.secure_url });
      }
      setProofImages(uploaded);
    } catch {
      swal("Error", "Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  /* ================= COMPLETE TASK ================= */
  const completeTask = async () => {
    try {
      const res = await fetch(`${API}/api/task/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          taskId: selectedTask._id,
          proof: proofImages
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      swal("Completed!", "Task submitted successfully", "success");

      setTaskStatusMap((prev) => ({
        ...prev,
        [selectedTask._id]: "completed"
      }));

      setSelectedTask(null);
      setProofImages([]);
    } catch (err) {
      swal("Error", err.message, "error");
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      return swal("Error", "Task name is required", "error");
    }

    try {
      const res = await fetch(`${API}/api/own-task/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          taskName: newTaskName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      swal("Success", "Task created successfully", "success");
      setShowAddTaskModal(false);
      setNewTaskName("");
      loadTasks(); // Reload tasks to include the new one
    } catch (err) {
      swal("Error", err.message, "error");
    }
  };

  const filteredTasks = useMemo(() => {
    let list = tasks.slice();

    if (filter !== "all") {
      list = list.filter((task) => taskStatusMap[task._id] === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "dueAsc") {
      list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === "dueDesc") {
      list.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    } else if (sortBy === "status") {
      list.sort((a, b) => {
        const s = (id) => (taskStatusMap[id] === undefined ? 2 : taskStatusMap[id] === "completed" ? 1 : 0);
        return s(b._id) - s(a._id);
      });
    }

    return list;
  }, [tasks, taskStatusMap, filter, search, sortBy]);

  const renderStatus = (taskId) => {
    const status = taskStatusMap[taskId];
    if (status === "started")
      return <span className="status inprogress">IN PROGRESS</span>;
    if (status === "completed")
      return <span className="status completed">COMPLETED</span>;
    return <span className="status notstarted">NOT STARTED</span>;
  };

  /* ================= ACTION BUTTONS ================= */
  const renderAction = (task) => {
    const status = taskStatusMap[task._id];

    return (
      <div className="action-buttons">
        <button className="btn view" onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}>
          <FaEye /> View
        </button>

        {status === "not_started" && (
          <button className="btn start" onClick={(e) => { e.stopPropagation(); startTask(task); }}>
            <FaPlay /> Start
          </button>
        )}

        {status === "started" && (
          <button
            className="btn complete"
            onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
          >
            <FaCheckCircle /> Complete
          </button>
        )}

        {status === "completed" && (
          <button className="btn done" disabled>
            ✔ Completed
          </button>
        )}
      </div>
    );
  };

  const closeLightbox = () => setLightboxImage(null);

  return (
    <div className="student-task-page">
      <div className="student-header">
        <h2>My Assigned Tasks</h2>
        <p>Track, complete, and submit your assigned work</p>
    </div>

      <div className="controls">
        <div className="search-wrap">
          <input
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="controls-right">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueAsc">Due Soonest</option>
            <option value="dueDesc">Due Latest</option>
            <option value="status">By Status</option>
          </select>

          <div className="filter-chips">
            {[
              { key: "all", label: "All" },
              { key: "not_started", label: "Not Started" },
              { key: "started", label: "In Progress" },
              { key: "completed", label: "Completed" }
            ].map((c) => (
              <button key={c.key} className={`chip ${filter === c.key ? "active" : ""}`} onClick={() => setFilter(c.key)}>{c.label}</button>
            ))}
          </div>
        </div>
      </div>


      {/* ===== DASHBOARD (CLICK TO FILTER) ===== */}
      <StudentTaskDashboard
        tasks={tasks}
        taskStatusMap={taskStatusMap}
        onFilter={setFilter}
      />

      {/* ===== CHARTS ===== */}
      <StudentTaskCharts taskStatusMap={taskStatusMap} />

      <div className="add-task-wrapper">
        <button className="btn add-task" onClick={() => setShowAddTaskModal(true)}>
          + Add Task
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <FaSpinner className="spin" /> Loading...
        </div>
      ) : (
        <div className="task-table-wrapper">
          {/* Task Table */}
          <table className="task-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Task</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, i) => (
                <tr key={task._id} onClick={() => setSelectedTask(task)}>
                  <td>{i + 1}</td>
                  <td className="title">
                    <div className="task-title">{task.title}</div>
                    <div className="task-sub">{task.shortDescription || task.description?.slice(0, 80)}</div>
                    <div className="task-progress">
                      {(() => {
                        const due = new Date(task.dueDate);
                        const now = new Date();
                        const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                        const totalWindow = 14;
                        const pct = daysLeft <= 0 ? 100 : Math.max(5, Math.min(100, Math.round(((totalWindow - Math.min(totalWindow, daysLeft)) / totalWindow) * 100)));
                        return (
                          <div className="progress-wrap">
                            <div className="progress-bar" style={{ width: pct + "%" }} />
                            <small className={daysLeft < 0 ? "overdue" : ""}>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</small>
                          </div>
                        );
                      })()}
                    </div>
                  </td>

                  <td>
                    <div className={
                      new Date(task.dueDate) < new Date() && taskStatusMap[task._id] !== "completed"
                        ? "due overdue"
                        : "due"
                    }>
                      <FaRegCalendarAlt /> {new Date(task.dueDate).toDateString()}
                    </div>
                  </td>
                  <td>{renderStatus(task._id)}</td>
                  <td>{renderAction(task)}</td>
                </tr>
              ))}

              {!filteredTasks.length && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Button */}
      

      {/* ===== VIEW / COMPLETE MODAL ===== */}
      {selectedTask && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedTask.title}</h3>
              <FaTimes onClick={() => setSelectedTask(null)} />
            </div>

            <div className="modal-body">
              <p>{selectedTask.description}</p>
              <div className="meta-row">
                <strong>Due:</strong> {new Date(selectedTask.dueDate).toDateString()} &nbsp; • &nbsp;
                <strong>Status:</strong> {taskStatusMap[selectedTask._id] || "not started"}
              </div>

              {taskStatusMap[selectedTask._id] === "started" && (
                <>
                  <label className="upload-box">
                    <FaUpload /> Upload Proof
                    <input
                      type="file"
                      multiple
                      onChange={(e) => uploadProofImages(e.target.files)}
                    />
                  </label>

                  {uploading && <p>Uploading...</p>}

                  {/* Proof Image Preview */}
                  <div className="preview-grid">
                    {proofImages.map((p, i) => (
                      <img
                        key={i}
                        src={p.url}
                        alt="proof"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(p.url);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {taskStatusMap[selectedTask._id] === "started" && (
              <div className="modal-footer">
                <button
                  className="btn submit"
                  disabled={!proofImages.length}
                  onClick={completeTask}
                >
                  Submit Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox-backdrop" onClick={closeLightbox}>
          <img
            src={lightboxImage}
            alt="Proof Preview"
            className="lightbox-image"
          />
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Task</h3>
              <FaTimes onClick={() => setShowAddTaskModal(false)} />
            </div>

            <div className="modal-body">
              <input
                type="text"
                placeholder="Enter task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button className="btn submit" onClick={handleAddTask}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
