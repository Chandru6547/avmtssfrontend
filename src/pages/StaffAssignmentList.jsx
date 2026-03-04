import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUserId } from "../utils/auth";
import "./StaffAssignmentList.css";

export default function StaffAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [staff, setStaff] = useState(null); // ✅ store staff
  const navigate = useNavigate();
  const userId = getUserId();

  useEffect(() => {
    async function fetchAssignments() {
      try {
        // 1️⃣ Get staff
        const staffRes = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/getStaffById/${userId}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );

        const staffData = await staffRes.json();
        setStaff(staffData); // ✅ save staff

        // 2️⃣ Get assignments assigned to staff
        const assignmentDetails = await Promise.all(
          staffData.assignments.map((id) =>
            fetch(
              `${process.env.REACT_APP_API_BASE_URL}/api/assignments/${id}`,
              { headers: { Authorization: `Bearer ${getToken()}` } }
            ).then((res) => res.json())
          )
        );

        setAssignments(assignmentDetails);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      }
    }

    fetchAssignments();
  }, [userId]);

  // ✅ Prevent rendering until staff is loaded
  if (!staff) {
    return <div className="state-text">Loading assignments...</div>;
  }

  return (
    <div className="assignment-page">
      <div className="page-header">
        <h2>📘 My Assignments</h2>
        <p>View and analyze assignment performance</p>
      </div>

      <div className="assignment-grid">
        {assignments.map((a) => (
          <div
            key={a._id}
            className="assignment-card"
            onClick={() =>
              navigate(
                `/staff/assignment-report`, // ✅ recommended URL param
                {
                  state: { college: staff.college, assignmentId: a._id } // ✅ college from staff
                }
              )
            }
          >
            <div className="card-header">
              <h3>{a.name}</h3>
              <span className="badge">ACTIVE</span>
            </div>

            <p className="description">{a.description}</p>

            <div className="meta">
              <div>
                📅 <span>{new Date(a.dueDate).toDateString()}</span>
              </div>
              <div>
                🧠 <span>{a.questions.length} Questions</span>
              </div>
            </div>

            <div className="card-footer">
              <span className="difficulty easy">Easy</span>
              <button className="view-btn">View Report →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
