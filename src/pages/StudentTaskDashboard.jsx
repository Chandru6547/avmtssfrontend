import {
  FaTasks,
  FaPauseCircle,
  FaSpinner,
  FaCheckCircle
} from "react-icons/fa";
import "./StudentTaskDashboard.css";

export default function StudentTaskDashboard({
  tasks,
  taskStatusMap,
  onFilter
}) {
  const total = tasks.length;
  const completed = Object.values(taskStatusMap).filter(
    s => s === "completed"
  ).length;
  const inProgress = Object.values(taskStatusMap).filter(
    s => s === "started"
  ).length;
  const notStarted = total - completed - inProgress;

  return (
    <div className="task-dashboard">
      <DashboardCard
        title="Total Tasks"
        count={total}
        icon={<FaTasks />}
        type="primary"
        onClick={() => onFilter("all")}
      />

      <DashboardCard
        title="Not Started"
        count={notStarted}
        icon={<FaPauseCircle />}
        type="warning"
        onClick={() => onFilter("not_started")}
      />

      <DashboardCard
        title="In Progress"
        count={inProgress}
        icon={<FaSpinner />}
        type="info"
        spin
        onClick={() => onFilter("started")}
      />

      <DashboardCard
        title="Completed"
        count={completed}
        icon={<FaCheckCircle />}
        type="success"
        onClick={() => onFilter("completed")}
      />
    </div>
  );
}

/* ---------- CARD COMPONENT ---------- */
function DashboardCard({ title, count, icon, type, spin, onClick }) {
  return (
    <div className={`dashboard-card ${type}`} onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="count">{count}</h3>
        <p>{title}</p>
      </div>

      {spin && <div className="spinner-overlay" />}
    </div>
  );
}
