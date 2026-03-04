import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Student Dashboard</h1>

      <div className="dashboard-cards">
        {/* ASSIGNMENTS
        <div
          className="dashboard-card"
          onClick={() => navigate("/assignments-library")}
        >
          <div className="card-icon">📝</div>
          <h2>Assignments</h2>
          <p>Practice coding & problem-solving assignments</p>
        </div>

        {/* COURSES */}
        {/* <div
          className="dashboard-card"
          onClick={() => navigate("/courses-library")}
        >
          <div className="card-icon">🎓</div>
          <h2>Courses</h2>
          <p>Access structured learning courses</p>
        </div> */} 

        {/* MCQS */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/mcqs-list-all")}
        >
          <div className="card-icon">❓</div>
          <h2>MCQs</h2>
          <p>Test your knowledge with MCQ exams</p>
        </div>
      </div>
    </div>
  );
}
