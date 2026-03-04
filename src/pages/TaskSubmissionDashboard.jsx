import "./TaskSubmissionDashboard.css";

export default function TaskSubmissionDashboard({
  data,
  activeFilter,
  onFilter
}) {
  const total = data.length;

  const completed = data.filter(
    d => d.taskStatus?.toLowerCase() === "completed"
  ).length;

  const inProgress = data.filter(
    d => d.taskStatus?.toLowerCase() === "in-progress"
  ).length;

  const breached = data.filter(d => d.isBreached).length;

  const uniqueColleges = new Set(
    data.map(d => d.studentCollege).filter(Boolean)
  ).size;

  const uniqueStudents = new Set(
    data.map(d => d.studentName).filter(Boolean)
  ).size;

  const Card = ({ id, label, value, className }) => (
    <div
      className={`dash-card ${className} ${
        activeFilter === id ? "active" : ""
      }`}
      onClick={() => onFilter(id)}
    >
      <span>{label}</span>
      <h3>{value}</h3>
    </div>
  );

  return (
    <div className="submission-dashboard">
      <Card id="" label="Total Submissions" value={total} />
      <Card id="completed" label="Completed" value={completed} className="success" />
      <Card id="inprogress" label="In Progress" value={inProgress} className="warning" />
      <Card id="breached" label="Breached" value={breached} className="danger" />
      <Card id="colleges" label="Colleges" value={uniqueColleges} />
      <Card id="students" label="Students" value={uniqueStudents} />
    </div>
  );
}
