import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { getToken } from "../utils/auth";
import "./AssignmentReportPage.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AssignmentReportPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { assignmentId, college } = state || {};

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- FILTER STATES ---------- */
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);

  /* ---------- FETCH REPORT ---------- */
  useEffect(() => {
    if (!assignmentId || !college) {
      navigate(-1);
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/assignment-submissions/getSubmissionByCollegeAndAssignment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ assignmentId, college })
          }
        );

        const data = await res.json();
        setReport(data || []);
      } catch (err) {
        console.error("Failed to fetch assignment report", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [assignmentId, college, navigate]);

  /* ---------- UNIQUE BATCHES ---------- */
  const batches = useMemo(() => {
    const set = new Set(report.map(r => r.batch));
    return ["ALL", ...Array.from(set)];
  }, [report]);

  /* ---------- FILTERED DATA ---------- */
  const filteredReport = useMemo(() => {
    return report.filter(r => {
      const batchMatch =
        selectedBatch === "ALL" || r.batch === selectedBatch;

      const nameMatch = r.studentName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

      return batchMatch && nameMatch;
    });
  }, [report, selectedBatch, searchText]);

  /* ---------- SUMMARY METRICS ---------- */
  const summary = useMemo(() => {
    const total = filteredReport.length;
    const completed = filteredReport.filter(r => r.isCompleted).length;
    const pending = total - completed;

    const avgSolved =
      total === 0
        ? 0
        : (
            filteredReport.reduce(
              (sum, r) => sum + (r.problemsSolved || 0),
              0
            ) / total
          ).toFixed(1);

    return { total, completed, pending, avgSolved };
  }, [filteredReport]);

  /* ---------- PIE CHART DATA ---------- */
  const pieData = useMemo(() => {
    const buckets = {
      zero: 0,
      oneToTwo: 0,
      threeToFive: 0,
      sixPlus: 0
    };

    filteredReport.forEach(r => {
      const solved = r.problemsSolved || 0;

      if (solved === 0) buckets.zero++;
      else if (solved <= 2) buckets.oneToTwo++;
      else if (solved <= 5) buckets.threeToFive++;
      else buckets.sixPlus++;
    });

    return {
      labels: [
        "0 Solved",
        "1–2 Solved",
        "3–5 Solved",
        "6+ Solved"
      ],
      datasets: [
        {
          data: [
            buckets.zero,
            buckets.oneToTwo,
            buckets.threeToFive,
            buckets.sixPlus
          ],
          backgroundColor: [
            "#fee2e2",
            "#fde68a",
            "#bfdbfe",
            "#bbf7d0"
          ],
          borderWidth: 1
        }
      ]
    };
  }, [filteredReport]);

  /* ---------- DOWNLOAD EXCEL ---------- */
  const downloadExcel = () => {
    const rows = filteredReport.map(r => ({
      StudentName: r.studentName,
      Batch: r.batch,
      Status: r.isCompleted ? "Completed" : "Pending",
      ProblemsSolved: r.problemsSolved,
      TotalSolvedQuestions: r.solvedQuestions?.length || 0,
      SubmittedAt: new Date(r.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assignment Report");

    XLSX.writeFile(workbook, "Assignment_Report.xlsx");
  };

  return (
    <div className="assignment-report-page">
      {/* HEADER */}
      <div className="report-header">
        <h2>📊 Assignment Performance Report</h2>
        <p>College-wise student assignment submissions</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Total Students</h4>
          <p>{summary.total}</p>
        </div>
        <div className="summary-card success">
          <h4>Completed</h4>
          <p>{summary.completed}</p>
        </div>
        <div className="summary-card warning">
          <h4>Pending</h4>
          <p>{summary.pending}</p>
        </div>
        <div className="summary-card info">
          <h4>Avg Problems Solved</h4>
          <p>{summary.avgSolved}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <select
          value={selectedBatch}
          onChange={e => setSelectedBatch(e.target.value)}
        >
          {batches.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <div className="filter-right">
          <input
            type="text"
            placeholder="🔍 Search student name"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <button onClick={downloadExcel}>⬇ Download</button>
        </div>
      </div>

      {/* ANALYSIS TOGGLE */}
      <div className="analysis-toggle">
        <button onClick={() => setShowAnalysis(prev => !prev)}>
          {showAnalysis ? "❌ Hide Analysis" : "📊 Show Analysis"}
        </button>
      </div>

      {/* PIE CHART */}
      {showAnalysis && (
        <div className="analysis-card">
          <h3>📈 Question Solving Analysis</h3>
          <p>Students grouped by number of problems solved</p>
          <div className="chart-wrapper">
            <Pie data={pieData} />
          </div>
        </div>
      )}

      {/* STATES */}
      {loading && <div className="loading">Loading report...</div>}
      {!loading && filteredReport.length === 0 && (
        <div className="empty-state">No submissions found</div>
      )}

      {/* TABLE */}
      {!loading && filteredReport.length > 0 && (
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Problems Solved</th>
                <th>Total Solved Questions</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((r, i) => (
                <tr key={r._id || i}>
                  <td>{r.studentName}</td>
                  <td>{r.batch}</td>
                  <td>
                    <span className={`status ${r.isCompleted ? "completed" : "pending"}`}>
                      {r.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td><span className="score">{r.problemsSolved}</span></td>
                  <td>{r.solvedQuestions?.length || 0}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
