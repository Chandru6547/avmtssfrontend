import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import "./MCQSubmissionReportPage.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function MCQSubmissionReportPage() {
  const { mcqId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [collegeFilter, setCollegeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  /* ================= FETCH SUBMISSIONS ================= */
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/api/mcq-submissions/mcq/${mcqId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      const data = await res.json();
      setSubmissions(data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [mcqId, navigate]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  /* ================= FILTER VALUES ================= */
  const colleges = useMemo(() => {
    const unique = new Set(submissions.map((s) => s.college));
    return ["All", ...unique];
  }, [submissions]);

  const years = useMemo(() => {
    const unique = new Set(submissions.map((s) => s.year));
    return ["All", ...unique];
  }, [submissions]);

  const batches = useMemo(() => {
    const unique = new Set(submissions.map((s) => s.batch));
    return ["All", ...unique];
  }, [submissions]);

  /* ================= FILTERED DATA ================= */
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const collegeMatch =
        collegeFilter === "All" || sub.college === collegeFilter;

      const yearMatch =
        yearFilter === "All" || sub.year === Number(yearFilter);

      const batchMatch =
        batchFilter === "All" || sub.batch === batchFilter;

      return collegeMatch && yearMatch && batchMatch;
    });
  }, [submissions, collegeFilter, yearFilter, batchFilter]);

  const calculatePercentage = (score, total) => {
    if (!total) return 0;
    return ((score / total) * 100).toFixed(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const headers = [
      "S.No",
      "Student Name",
      "Email",
      "College",
      "Year",
      "Batch",
      "Score",
      "Total Marks",
      "Percentage",
      "Tab Switch",
      "Submitted At"
    ];

    const rows = filteredSubmissions.map((sub, index) => [
      index + 1,
      sub.studentId?.name || "",
      sub.studentId?.email || "",
      sub.college,
      sub.year,
      sub.batch,
      sub.score,
      sub.totalMarks,
      calculatePercentage(sub.score, sub.totalMarks) + "%",
      sub.isTabSwitch ? "Yes" : "No",
      formatDate(sub.submittedAt)
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((value) => `"${value}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `MCQ_Report_${mcqId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= PIE DATA ================= */
  const percentageDistribution = useMemo(() => {
    const ranges = {
      "0-25%": 0,
      "26-50%": 0,
      "51-75%": 0,
      "76-100%": 0
    };

    filteredSubmissions.forEach((sub) => {
      if (!sub.totalMarks) return;
      const percent = (sub.score / sub.totalMarks) * 100;

      if (percent <= 25) ranges["0-25%"]++;
      else if (percent <= 50) ranges["26-50%"]++;
      else if (percent <= 75) ranges["51-75%"]++;
      else ranges["76-100%"]++;
    });

    return ranges;
  }, [filteredSubmissions]);

  const pieData = {
    labels: Object.keys(percentageDistribution),
    datasets: [
      {
        data: Object.values(percentageDistribution),
        backgroundColor: [
          "#ef4444",
          "#f59e0b",
          "#3b82f6",
          "#10b981"
        ]
      }
    ]
  };

  /* ================= BAR DATA ================= */
  const tenPercentDistribution = useMemo(() => {
    const ranges = {};

    for (let i = 0; i < 100; i += 10) {
      const start = i === 0 ? 0 : i + 1;
      const end = i + 10;
      const label = `${start}-${end}%`;
      ranges[label] = 0;
    }

    filteredSubmissions.forEach((sub) => {
      if (!sub.totalMarks) return;
      const percent = (sub.score / sub.totalMarks) * 100;
      const bucket = Math.min(Math.floor(percent / 10) * 10, 90);

      const start = bucket === 0 ? 0 : bucket + 1;
      const end = bucket + 10;
      const label = `${start}-${end}%`;

      ranges[label]++;
    });

    return ranges;
  }, [filteredSubmissions]);

  const barData = {
    labels: Object.keys(tenPercentDistribution),
    datasets: [
      {
        label: "Students",
        data: Object.values(tenPercentDistribution),
        backgroundColor: "#3b82f6"
      }
    ]
  };

  if (loading) {
    return <div className="submission-loading">Loading Report...</div>;
  }

  return (
    <div className="submission-container">
      <div className="submission-header">
        <h2>MCQ Submission Report</h2>

        <div className="header-actions">
          <button className="csv-btn" onClick={downloadCSV}>
            ⬇ Download CSV
          </button>

          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      <div className="submission-filters">
        <select
          value={collegeFilter}
          onChange={(e) => setCollegeFilter(e.target.value)}
        >
          {colleges.map((college, i) => (
            <option key={i} value={college}>
              {college}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          {years.map((year, i) => (
            <option key={i} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          {batches.map((batch, i) => (
            <option key={i} value={batch}>
              {batch}
            </option>
          ))}
        </select>
      </div>

      <div className="submission-stats">
        Total Submissions: <strong>{filteredSubmissions.length}</strong>
      </div>

      {filteredSubmissions.length > 0 && (
        <div className="submission-charts">
          <div className="chart-card">
            <h3>Quarter Distribution</h3>
            <div className="chart-fixed">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="chart-card">
            <h3>10% Range Distribution</h3>
            <div className="chart-fixed">
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      <div className="submission-table-wrapper">
        <table className="submission-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>College</th>
              <th>Year</th>
              <th>Batch</th>
              <th>Score</th>
              <th>Total</th>
              <th>%</th>
              <th>Tab Switch</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub, index) => (
              <tr key={sub._id}>
                <td>{index + 1}</td>
                <td>{sub.studentId?.name}</td>
                <td>{sub.studentId?.email}</td>
                <td>{sub.college}</td>
                <td>{sub.year}</td>
                <td>{sub.batch}</td>
                <td>{sub.score}</td>
                <td>{sub.totalMarks}</td>
                <td>
                  {calculatePercentage(sub.score, sub.totalMarks)}%
                </td>
                <td>{sub.isTabSwitch ? "Yes" : "No"}</td>
                <td>{formatDate(sub.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
