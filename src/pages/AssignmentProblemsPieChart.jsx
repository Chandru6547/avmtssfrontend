import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import "./AssignmentProblemsPieChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AssignmentProblemsPieChart({ submissions }) {
  const [activeInfo, setActiveInfo] = useState(null);

  const pieData = useMemo(() => {
    if (!submissions || submissions.length === 0) return null;

    const totalStudents = submissions.length;

    const maxSolved = Math.max(
      ...submissions.map((s) => s.problemsSolved || 0),
      0
    );

    const distribution = {};

    for (let i = 0; i <= maxSolved; i++) {
      distribution[i] = 0;
    }

    submissions.forEach((s) => {
      const solved = s.problemsSolved || 0;
      distribution[solved]++;
    });

    const filteredEntries = Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => Number(b[0]) - Number(a[0]));

    const labels = filteredEntries.map(
      ([value]) => `${value} Solved`
    );

    const values = filteredEntries.map(([_, count]) => count);

    const colors = labels.map(
      (_, i) =>
        `hsl(${(i * 360) / labels.length}, 70%, 55%)`
    );

    return {
      totalStudents,
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
        },
      ],
    };
  }, [submissions]);

  if (!pieData) {
    return <p className="no-data">No data available</p>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "50%", // makes it donut style
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = (
              (value / pieData.totalStudents) *
              100
            ).toFixed(1);
            return `${context.label}: ${value} students (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1200,
    },
    onClick: (evt, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const label = pieData.labels[index];
        const value = pieData.datasets[0].data[index];
        setActiveInfo(`${label} → ${value} students`);
      }
    },
  };

  return (
    <div className="pie-card">
      <div className="pie-header">
        <h3>Assignment Problem Solved Distribution</h3>
        <span>Total Students: {pieData.totalStudents}</span>
      </div>

      <div className="pie-chart-container">
        <Pie data={pieData} options={options} />
      </div>

      {activeInfo && (
        <div className="pie-info-box">
          {activeInfo}
        </div>
      )}
    </div>
  );
}
