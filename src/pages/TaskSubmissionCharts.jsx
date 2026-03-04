import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import "./TaskSubmissionCharts.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function TaskSubmissionCharts({ data }) {
  const completed = data.filter(
    d => d.taskStatus?.toLowerCase() === "completed"
  ).length;

  const inProgress = data.filter(
    d => d.taskStatus?.toLowerCase() === "in-progress"
  ).length;

  const breached = data.filter(d => d.isBreached).length;

  const pieData = {
    labels: ["Completed", "In Progress", "Breached"],
    datasets: [
      {
        data: [completed, inProgress, breached],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderWidth: 1
      }
    ]
  };

  const barData = {
    labels: ["Completed", "In Progress", "Breached"],
    datasets: [
      {
        label: "Submissions",
        data: [completed, inProgress, breached],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderRadius: 6
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // 🔥 IMPORTANT
    plugins: {
      legend: {
        position: "bottom"
      }
    }
  };

  return (
    <div className="charts-row">
      {/* PIE */}
      <div className="chart-card">
        <h3 className="chart-title">Task Status Distribution</h3>
        <div className="chart-wrapper">
          <Pie data={pieData} options={commonOptions} />
        </div>
      </div>

      {/* BAR */}
      <div className="chart-card">
        <h3 className="chart-title">Task Status Count</h3>
        <div className="chart-wrapper">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // 🔥 IMPORTANT
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
