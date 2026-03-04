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
import "./MCQReportPageStaff.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MCQReportPageStaff() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { mcqId, college } = state || {};

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- FILTER STATES ---------- */
  const [searchText, setSearchText] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [showAnalysis, setShowAnalysis] = useState(false);

  /* ---------- FETCH REPORT ---------- */
  useEffect(() => {
    if (!mcqId || !college) {
      navigate(-1);
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/mcq-submissions/getSubmissionByCollegeAndMcq`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ mcqId, college })
          }
        );

        const data = await res.json();
        setReport(data || []);
      } catch (err) {
        console.error("Failed to fetch MCQ report", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [mcqId, college, navigate]);

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

      const nameMatch =
        r.studentId?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        r.studentId?.email
          ?.toLowerCase()
          .includes(searchText.toLowerCase());

      return batchMatch && nameMatch;
    });
  }, [report, selectedBatch, searchText]);

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const total = filteredReport.length;
    const avgScore =
      total === 0
        ? 0
        : (
            filteredReport.reduce((s, r) => s + (r.score || 0), 0) / total
          ).toFixed(1);

    const tabSwitchCount = filteredReport.filter(r => r.isTabSwitch).length;

    return { total, avgScore, tabSwitchCount };
  }, [filteredReport]);

  /* ---------- PIE CHART ---------- */
  const pieData = useMemo(() => {
    const buckets = {
      low: 0,
      mid: 0,
      high: 0
    };

    filteredReport.forEach(r => {
      const percent = (r.score / r.totalMarks) * 100;
      if (percent < 40) buckets.low++;
      else if (percent <= 70) buckets.mid++;
      else buckets.high++;
    });

    return {
      labels: ["< 40%", "40–70%", "> 70%"],
      datasets: [
        {
          data: [buckets.low, buckets.mid, buckets.high],
          backgroundColor: ["#fee2e2", "#fde68a", "#bbf7d0"]
        }
      ]
    };
  }, [filteredReport]);

  /* ---------- DOWNLOAD ---------- */
  const downloadExcel = () => {
    const rows = filteredReport.map(r => ({
      Name: r.studentId?.name,
      Email: r.studentId?.email,
      Batch: r.batch,
      Year: r.year,
      College: r.college,
      Score: r.score,
      TotalMarks: r.totalMarks,
      TabSwitch: r.isTabSwitch ? "Yes" : "No",
      SubmittedAt: new Date(r.submittedAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MCQ Report");
    XLSX.writeFile(wb, "MCQ_Report.xlsx");
  };

  return (
    <div className="mcq-report-page">
      {/* HEADER */}
      <div className="report-header">
        <h2>📊 MCQ Performance Report</h2>
        <p>College-wise MCQ test performance</p>
      </div>

      {/* SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Total Students</h4>
          <p>{summary.total}</p>
        </div>
        <div className="summary-card info">
          <h4>Avg Score</h4>
          <p>{summary.avgScore}</p>
        </div>
        <div className="summary-card warning">
          <h4>Tab Switches</h4>
          <p>{summary.tabSwitchCount}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <select
          value={selectedBatch}
          onChange={e => setSelectedBatch(e.target.value)}
        >
          {batches.map(b => (
            <option key={b}>{b}</option>
          ))}
        </select>

        <div className="filter-right">
          <input
            placeholder="🔍 Search name / email"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <button onClick={downloadExcel}>⬇ Download</button>
        </div>
      </div>

      {/* ANALYSIS TOGGLE */}
      <div className="analysis-toggle">
        <button onClick={() => setShowAnalysis(p => !p)}>
          {showAnalysis ? "❌ Hide Analysis" : "📊 Show Analysis"}
        </button>
      </div>

      {/* ANALYSIS */}
      {showAnalysis && (
        <div className="analysis-card">
          <h3>📈 Score Distribution</h3>
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
                <th>Name</th>
                <th>Email</th>
                <th>Year</th>
                <th>Batch</th>
                <th>Score</th>
                <th>Total</th>
                <th>Tab Switch</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((r, i) => (
                <tr key={i}>
                  <td>{r.studentId?.name}</td>
                  <td>{r.studentId?.email}</td>
                  <td>{r.year}</td>
                  <td>{r.batch}</td>
                  <td>{r.score}</td>
                  <td>{r.totalMarks}</td>
                  <td>
                    <span className={`tab-switch ${r.isTabSwitch ? "yes" : "no"}`}>
                      {r.isTabSwitch ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>{new Date(r.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
