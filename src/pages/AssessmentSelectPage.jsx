import { useNavigate } from "react-router-dom";
import "./AssessmentSelectPage.css";

export default function AssessmentSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="select-page">
      <h2>Select Assessment Type</h2>

      <div className="card-container">
        <div className="card" onClick={() => navigate("/staff/assignments")}>
          📘
          <h3>Assignments</h3>
        </div>

        <div className="card" onClick={() => navigate("/staff/mcqs")}>
          📝
          <h3>MCQs</h3>
        </div>
      </div>
    </div>
  );
}
