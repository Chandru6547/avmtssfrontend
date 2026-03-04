import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Chart } from "chart.js/auto";
import * as XLSX from "xlsx";
import "./ViewAssignmentReport.css";

export default function ViewAssignmentReport() {
  const location = useLocation();
  const navigate = useNavigate();

  const college =
    location.state?.college || localStorage.getItem("selectedCampus");
  const year =
    location.state?.year || localStorage.getItem("selectedYear");
  const batch =
    location.state?.batch || localStorage.getItem("selectedBatch");

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  /* ---------- SAFETY ---------- */
  useEffect(() => {
    if (!college || !year || !batch) navigate("/campuses");
  }, [college, year, batch, navigate]);

  /* ---------- FETCH ASSIGNMENTS ---------- */
  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/assignments`
        );
        setAssignments(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  /* ---------- FETCH SUBMISSIONS ---------- */
  const fetchSubmissions = async assignment => {
    setSelectedAssignment(assignment);
    setSubmissions([]);

    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/api/assignment-submissions/getReportByBatch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment._id,
          college,
          year,
          batch
        })
      }
    );

    setSubmissions(await res.json());
  };

  /* ---------- ANALYSIS GRAPH (BAR + AVERAGE LINE) ---------- */
  useEffect(() => {
    if (!showAnalysis || !submissions.length) return;

    const distribution = {};

    submissions.forEach(s => {
      distribution[s.problemsSolved] =
        (distribution[s.problemsSolved] || 0) + 1;
    });

    // const avgSolved = totalSolved / submissions.length;
// 
    const labels = Object.keys(distribution)
      .map(Number)
      .sort((a, b) => a - b);

    const barData = labels.map(l => distribution[l]);
    // const avgLine = labels.map(() => avgSolved);

    chartInstance.current?.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: labels.map(l => `${l} Questions`),
        datasets: [
          {
            type: "bar",
            label: "Number of Students",
            data: barData,
            backgroundColor: "#0d6efd"
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }, [showAnalysis, submissions]);

  /* ---------- EXPORT EXCEL (.xlsx) ---------- */
  const downloadExcel = () => {
    if (!submissions.length || !selectedAssignment) return;

    /* ---- Sheet 1: Student Data ---- */
    const studentSheetData = submissions.map(s => ({
      "Student Name": s.studentName,
      "Roll No": s.rollNo,
      "Problems Solved": s.problemsSolved
    }));

    /* ---- Sheet 2: Analysis Data ---- */
    const distribution = {};
    let totalSolved = 0;

    submissions.forEach(s => {
      distribution[s.problemsSolved] =
        (distribution[s.problemsSolved] || 0) + 1;
      totalSolved += s.problemsSolved;
    });

    const avgSolved = totalSolved / submissions.length;

    const analysisSheetData = Object.keys(distribution)
      .map(Number)
      .sort((a, b) => a - b)
      .map(k => ({
        "Problems Solved": k,
        "Number of Students": distribution[k],
        "Average Solved": avgSolved
      }));

    /* ---- Workbook ---- */
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(studentSheetData);
    const ws2 = XLSX.utils.json_to_sheet(analysisSheetData);

    XLSX.utils.book_append_sheet(wb, ws1, "Student Report");
    XLSX.utils.book_append_sheet(wb, ws2, "Analysis Data");

    XLSX.writeFile(
      wb,
      `${selectedAssignment.name}_${batch}_Assignment_Report.xlsx`
    );
  };

  if (loading) return <p className="status">Loading assignments...</p>;

  return (
    <div className="assignment-report-page">
      {/* ---------- HEADER ---------- */}
      <div className="page-header">
        <div>
          <h2>Assignment Reports</h2>
          <p>
            {college} · Year {year} · Batch {batch}
          </p>
        </div>

        <div className="header-right">
          <select
            value={selectedAssignment?._id || ""}
            onChange={e => {
              const a = assignments.find(x => x._id === e.target.value);
              if (a) fetchSubmissions(a);
            }}
          >
            <option value="">-- Select Assignment --</option>
            {assignments.map(a => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>

          <button disabled={!submissions.length} onClick={downloadExcel}>
            ⬇ Download Excel
          </button>

          <button
            className="analysis-btn"
            disabled={!submissions.length}
            onClick={() => setShowAnalysis(true)}
          >
            📊 Analysis
          </button>
        </div>
      </div>

      {/* ---------- TABLE ---------- */}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Roll No</th>
            <th>Solved</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, i) => (
            <tr key={s._id}>
              <td>{i + 1}</td>
              <td>{s.studentName}</td>
              <td>{s.rollNo}</td>
              <td>{s.problemsSolved}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------- ANALYSIS MODAL ---------- */}
      {showAnalysis && (
        <div className="modal-overlay" onClick={() => setShowAnalysis(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Assignment Performance Analysis</h3>
            <p className="analysis-sub">
              Students vs Problems Solved (with Average)
            </p>

            <canvas ref={chartRef}></canvas>

            <button className="close-btn" onClick={() => setShowAnalysis(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
