import "./StudentTaskCharts.css";

export default function StudentTaskCharts({ taskStatusMap }) {
  const values = Object.values(taskStatusMap);

  const completed = values.filter(v => v === "completed").length;
  const inProgress = values.filter(v => v === "started").length;
  const notStarted = values.filter(v => v === "not_started").length;

  const total = completed + inProgress + notStarted || 1;

  const completedDeg = (completed / total) * 360;
  const inProgressDeg = (inProgress / total) * 360;

  return (
    <div className="task-charts">
      {/* ================= PIE ================= */}
      <div className="chart-card hover-card">
        <h4>Task Distribution</h4>

        <div className="pie-wrapper">
          <div
            className="pie-chart"
            style={{
              background: `
                conic-gradient(
                  #22c55e 0deg ${completedDeg}deg,
                  #3b82f6 ${completedDeg}deg ${completedDeg + inProgressDeg}deg,
                  #e5e7eb ${completedDeg + inProgressDeg}deg 360deg
                )
              `
            }}
          />

          <div className="pie-center">
            <b>{Math.round((completed / total) * 100)}%</b>
            <span>Completed</span>
          </div>
        </div>

        <div className="legend">
          <span className="legend-item green">
            <i className="dot green" /> Completed
          </span>
          <span className="legend-item blue">
            <i className="dot blue" /> In Progress
          </span>
          <span className="legend-item gray">
            <i className="dot gray" /> Not Started
          </span>
        </div>
      </div>

      {/* ================= STATUS COUNT ================= */}
      <div className="chart-card hover-card">
        <h4>Task Status Count</h4>

        <div className="status-list">
          <div className="status-row green">
            <span>Completed</span>
            <div className="status-bar">
              <div
                className="fill"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <b>{completed}</b>
          </div>

          <div className="status-row blue">
            <span>In Progress</span>
            <div className="status-bar">
              <div
                className="fill"
                style={{ width: `${(inProgress / total) * 100}%` }}
              />
            </div>
            <b>{inProgress}</b>
          </div>

          <div className="status-row gray">
            <span>Not Started</span>
            <div className="status-bar">
              <div
                className="fill"
                style={{ width: `${(notStarted / total) * 100}%` }}
              />
            </div>
            <b>{notStarted}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
