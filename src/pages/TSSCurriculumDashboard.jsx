import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import "./TSSCurriculumDashboard.css";

const API = process.env.REACT_APP_API_BASE_URL;

export default function TSSCurriculumDashboard() {
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH CURRICULUMS ---------- */
  useEffect(() => {
    fetch(`${API}/api/curriculum/getAllCurriculums`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(setCurriculums)
      .catch(console.error);
  }, []);

  /* ---------- ESC CLOSE ---------- */
  useEffect(() => {
    const closeOnEsc = e => e.key === "Escape" && setSelectedCurriculum(null);
    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, []);

  /* ---------- LOAD TAB DATA ---------- */
  const loadTabData = async (type) => {
    if (!selectedCurriculum) return;

    setActiveTab(type);
    setLoading(true);
    setItems([]);

    try {
        let data = [];

        /* ---------- COURSES ---------- */
        if (type === "courses") {
            const res = await fetch(`${API}/courses/assigned`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                courseIds: selectedCurriculum.course
            })
            });

            const allCourses = await res.json();

            // ✅ FILTER BY CURRICULUM COURSE IDS
            data = allCourses.filter(course =>
            selectedCurriculum.course.includes(course._id)
            );
        }

        /* ---------- ASSIGNMENTS ---------- */
        if (type === "assignments") {
            const res = await fetch(`${API}/api/assignments`, {
            headers: { Authorization: `Bearer ${getToken()}` }
            });

            const allAssignments = await res.json();

            data = allAssignments.filter(a =>
            selectedCurriculum.assignments.includes(a._id)
            );
        }

        /* ---------- MCQS ---------- */
        if (type === "mcqs") {
            const res = await fetch(`${API}/api/mcqs/getallmcq`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            }
            });

            const allMcqs = await res.json();

            data = allMcqs.filter(m =>
            selectedCurriculum.mcqs.includes(m._id)
            );
        }

        setItems(data);
        } catch (err) {
        console.error("Failed to load tab data", err);
        } finally {
        setLoading(false);
        }
  };

  return (
    <div className="curriculum-page">
      <h2 className="page-title">TSS Curriculum Dashboard</h2>

      {/* ---------- CARDS ---------- */}
      <div className="curriculum-grid">
        {curriculums.map(c => (
          <div
            key={c._id}
            className="curriculum-card"
            onClick={() => {
              setSelectedCurriculum(c);
              setActiveTab("");
              setItems([]);
            }}
          >
            <h3>{c.college}</h3>
            <p>Courses: {c.course.length}</p>
            <p>Assignments: {c.assignments.length}</p>
            <p>MCQs: {c.mcqs.length}</p>
          </div>
        ))}
      </div>

      {/* ---------- MODAL ---------- */}
      {selectedCurriculum && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCurriculum(null)}
        >
          <div className="modal modal-animate" onClick={e => e.stopPropagation()}>
            {/* ---------- HEADER ---------- */}
            <div className="modal-header">
              <div>
                <h3 className="college-name">
                  {selectedCurriculum.college}
                </h3>
                <span className="sub-title">
                  Year {selectedCurriculum.year} · {selectedCurriculum.batch}
                </span>
              </div>

              <button
                className="close-btn"
                onClick={() => setSelectedCurriculum(null)}
              >
                ✕
              </button>
            </div>

            {/* ---------- TABS ---------- */}
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
                onClick={() => loadTabData("courses")}
              >
                📘 Courses
                <span>{selectedCurriculum.course.length}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
                onClick={() => loadTabData("assignments")}
              >
                📝 Assignments
                <span>{selectedCurriculum.assignments.length}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === "mcqs" ? "active" : ""}`}
                onClick={() => loadTabData("mcqs")}
              >
                🧠 MCQs
                <span>{selectedCurriculum.mcqs.length}</span>
              </button>
            </div>

            {/* ---------- CONTENT ---------- */}
            <div className="tab-content">
              {loading && <p className="loading">Loading...</p>}

              {!loading && activeTab && items.length === 0 && (
                <p className="empty">No {activeTab} available</p>
              )}

              {!loading &&
                items.map(item => (
                  <div key={item._id} className="item-row">
                    {activeTab === "courses" && item.name}
                    {activeTab === "assignments" && item.name}
                    {activeTab === "mcqs" && item.topic}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
