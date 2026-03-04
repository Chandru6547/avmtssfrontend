import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout, getUserId } from "../utils/auth";
import "./StaffMCQList.css";

export default function StaffMCQList() {
  const [mcqs, setMcqs] = useState([]);
  const [staff, setStaff] = useState(null); // ✅ FIX
  const navigate = useNavigate();
  const userId = getUserId();

  useEffect(() => {
    async function fetchMCQs() {
      try {
        const staffRes = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/getStaffById/${userId}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );

        if (!staffRes.ok) {
          logout();
          navigate("/login");
          return;
        }

        const staffData = await staffRes.json();
        setStaff(staffData); // ✅ store in state

        const mcqDetails = await Promise.all(
          staffData.mcqs.map((id) =>
            fetch(
              `${process.env.REACT_APP_API_BASE_URL}/api/mcqs/${id}`,
              { headers: { Authorization: `Bearer ${getToken()}` } }
            ).then((res) => res.json())
          )
        );

        setMcqs(mcqDetails);
      } catch (err) {
        console.error("Failed to fetch MCQs", err);
      }
    }

    fetchMCQs();
  }, [userId, navigate]);

  // ✅ Prevent render until staff is loaded
  if (!staff) {
    return <div className="loading">Loading MCQs...</div>;
  }

  return (
    <div className="mcq-page">
      <div className="page-header">
        <h2>📝 My MCQs</h2>
        <p>Review MCQ tests and student performance</p>
      </div>

      <div className="mcq-grid">
        {mcqs.map((m) => (
          <div
            key={m._id}
            className="mcq-card"
            onClick={() =>
              navigate("/staff/mcq-report", {
                state: {
                  mcqId: m._id,
                  college: staff.college // ✅ SAFE NOW
                }
              })
            }
          >
            <div className="card-header">
              <h3>{m.topic}</h3>
              <span className="badge mcq">MCQ</span>
            </div>

            <p className="category">{m.category}</p>

            <div className="meta">
              <div>❓ {m.questions?.length || 0} Questions</div>
              <div>⏱ Timed Test</div>
            </div>

            <div className="card-footer">
              <button className="view-btn">View Report →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
