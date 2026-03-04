import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import {
  FaUserPlus,
  FaUserTie,
  FaTimes
} from "react-icons/fa";
import "./StaffManagementPage.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function StaffManagementPage() {
  const [staffs, setStaffs] = useState([]);
  const [campuses, setCampuses] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- FETCH STAFFS ---------- */
  const fetchStaffs = async () => {
    const res = await fetch(`${API_BASE}/api/getAllStaffs`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setStaffs(data || []);
  };

  /* ---------- FETCH CAMPUSES ---------- */
  const fetchCampuses = async () => {
    const res = await fetch(`${API_BASE}/campus/get`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setCampuses(data || []);
  };

  useEffect(() => {
    fetchStaffs();
    fetchCampuses();
  }, []);

  /* ---------- CREATE STAFF ---------- */
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !college) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/admin/create-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ email, college })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        setSuccess("Staff created successfully");
        setEmail("");
        setCollege("");
        fetchStaffs();
        setTimeout(() => setShowCreateModal(false), 800);
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-page">
      {/* HEADER */}
      <div className="staff-header">
        <h2>Staff Management</h2>
        <button onClick={() => setShowCreateModal(true)}>
          <FaUserPlus /> Create Staff
        </button>
      </div>

      {/* STAFF LIST */}
      <div className="staff-grid">
        {staffs.map((staff) => (
          <div
            key={staff._id}
            className="staff-card"
            onClick={() => {
              setSelectedStaff(staff);
              setShowDetailModal(true);
            }}
          >
            <FaUserTie className="staff-icon" />
            <h4>{staff.email}</h4>
            <p>{staff.college}</p>
          </div>
        ))}
      </div>

        {/* ---------- CREATE STAFF MODAL ---------- */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="create-staff-modal">
              <div className="modal-top">
                <h3>Create Staff</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateStaff}>
                {/* EMAIL */}
                <div className="form-field">
                  <span className="field-icon">📧</span>
                  <input
                    type="email"
                    placeholder="Staff Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* COLLEGE */}
                <div className="form-field">
                  <span className="field-icon">🏫</span>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  >
                    <option value="">Select College</option>
                    {campuses.map((c) => (
                      <option key={c._id} value={c.college}>
                        {c.college}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <div className="form-error">{error}</div>}
                {success && <div className="form-success">{success}</div>}

                <button className="primary-btn" disabled={loading}>
                  {loading ? "Creating..." : "Create Staff"}
                </button>
              </form>
            </div>
          </div>
        )}

      {/* ---------- STAFF DETAIL MODAL ---------- */}
      {showDetailModal && selectedStaff && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Staff Details</h3>
              <FaTimes onClick={() => setShowDetailModal(false)} />
            </div>

            <div className="detail-row">
              <strong>Email:</strong> {selectedStaff.email}
            </div>
            <div className="detail-row">
              <strong>College:</strong> {selectedStaff.college}
            </div>
            <div className="detail-row">
              <strong>Role:</strong> {selectedStaff.role}
            </div>
            <div className="detail-row">
              <strong>Created At:</strong>{" "}
              {new Date(selectedStaff.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
