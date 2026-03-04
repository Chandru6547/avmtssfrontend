import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { getToken } from "../utils/auth";
import "./AssignmentsReportAssignmentList.css";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE_URL;

export default function AssignmentsReportAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();


  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API}/api/assignments`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (daysLeft) => {
    if (daysLeft < 0) return "overdue";
    if (daysLeft <= 3) return "urgent";
    if (daysLeft <= 7) return "warning";
    return "active";
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading Assignments...</p>
      </div>
    );
  }

  const filteredAssignments = assignments.filter((a) => {
    if (filterStatus === "all") return true;
    const daysLeft = getDaysLeft(a.dueDate);
    return getStatusColor(daysLeft) === filterStatus;
  });

  return (
    <div className="assignments-report">
      {/* ---------- HEADER ---------- */}
      <div className="report-header">
        <div className="header-left">
          <h2>
            <FaClipboardList /> Assignments Report
          </h2>
          <p className="subtitle">Manage and monitor all assignments</p>
        </div>
        <span className="count-badge">Total: {assignments.length}</span>
      </div>

      {/* ---------- FILTERS ---------- */}
      <div className="filters-section">
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
          onClick={() => setFilterStatus("active")}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filterStatus === "warning" ? "active" : ""}`}
          onClick={() => setFilterStatus("warning")}
        >
          Due Soon
        </button>
        <button
          className={`filter-btn ${filterStatus === "urgent" ? "active" : ""}`}
          onClick={() => setFilterStatus("urgent")}
        >
          Urgent
        </button>
        <button
          className={`filter-btn ${filterStatus === "overdue" ? "active" : ""}`}
          onClick={() => setFilterStatus("overdue")}
        >
          Overdue
        </button>
      </div>

      {/* ---------- CARDS GRID ---------- */}
      <div className="cards-grid">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((a) => {
            const daysLeft = getDaysLeft(a.dueDate);
            const status = getStatusColor(daysLeft);

            return (
              <div
                key={a._id}
                className={`assignment-card ${status}`}
                onClick={() => navigate(`/admin/reports/assignments/${a._id}`)}
              >
                {/* Card Header */}
                <div className="card-header">
                  <h3 className="card-title">{a.name}</h3>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <p className="description">{a.description}</p>

                  <div className="card-info">
                    <div className="info-item">
                      <span className="info-label">Questions:</span>
                      <span className="info-value">
                        {a.questions?.length || 0}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Due Date:</span>
                      <span className="info-value">
                        <FaCalendarAlt />
                        {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="card-meta">
                    <div className="created-by">
                      <FaUser />
                      <div>
                        <span className="creator-name">
                          {a.createdBy ? a.createdBy.name : "Admin"}
                        </span>
                        {a.createdBy && (
                          <span className="creator-email">{a.createdBy.email}</span>
                        )}
                      </div>
                    </div>
                    <span className="created-date">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <button className="action-btn view" title="View">
                    <FaEye /> View
                  </button>
                  <button className="action-btn edit" title="Edit">
                    <FaEdit /> Edit
                  </button>
                  <button className="action-btn delete" title="Delete">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-data">
            <p>No assignments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
