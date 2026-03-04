import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./MCQReportPage.css";

export default function MCQReportPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { college, year, batch } = location.state || {};

  const [mcqs, setMcqs] = useState([]);
  const [report, setReport] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const [fromMark, setFromMark] = useState("");
  const [toMark, setToMark] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- FETCH MCQS ---------- */
  useEffect(() => {
    if (!college || !year || !batch) {
      navigate("/campuses");
      return;
    }

    const fetchAllMCQs = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/mcqs/getallmcq`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college, year, batch })
          }
        );

        if (!res.ok) throw new Error();
        setMcqs(await res.json());
      } catch {
        setError("Unable to load MCQs");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMCQs();
  }, [college, year, batch, navigate]);

  /* ---------- DROPDOWN ---------- */
  const dropdownOptions = useMemo(() => {
    return mcqs.map(mcq => ({
      label: `${mcq.category} - ${mcq.topic}`,
      value: mcq._id
    }));
  }, [mcqs]);

  /* ---------- FETCH REPORT ---------- */
  const handleSelectMCQ = async (mcqId) => {
    if (!mcqId) return;

    try {
      setLoading(true);
      setReport([]);
      setFromMark("");
      setToMark("");

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/mcq-submissions/getreporbytbatch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college, year, batch, mcqId })
        }
      );

      if (!res.ok) throw new Error();
      setReport(await res.json());
    } catch {
      setError("Unable to load MCQ report");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FILTERED REPORT ---------- */
  const filteredReport = useMemo(() => {
    if (!report.length) return [];

    const from = fromMark === "" ? -Infinity : Number(fromMark);
    const to = toMark === "" ? Infinity : Number(toMark);

    return report.filter(r => r.score >= from && r.score <= to);
  }, [report, fromMark, toMark]);

  /* ---------- SCORE DISTRIBUTION ---------- */
  const scoreDistribution = useMemo(() => {
    if (!filteredReport.length) return [];

    const total = filteredReport[0]?.totalMarks || 0;
    const map = {};

    filteredReport.forEach(r => {
      map[r.score] = (map[r.score] || 0) + 1;
    });

    return Array.from({ length: total + 1 }, (_, i) => ({
      score: total - i,
      count: map[total - i] || 0
    }));
  }, [filteredReport]);

  const maxCount = Math.max(...scoreDistribution.map(d => d.count), 1);

  /* ---------- DOWNLOAD EXCEL ---------- */
  const downloadExcel = () => {
    if (!filteredReport.length) return;

    const excelData = filteredReport.map((r, i) => ({
      "S.No": i + 1,
      "Student Name": r.student?.name || "Unknown",
      "Email": r.student?.email || "-",
      "Score": r.score,
      "Total Marks": r.totalMarks,
      "Attempted": r.studentAttemptedCount
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MCQ Report");

    XLSX.writeFile(
      wb,
      `${college}_Year${year}_${batch}_${filteredReport[0]?.mcqTopic}.xlsx`
    );
  };

  if (error) return <p className="status error">{error}</p>;

  return (
    <div className="mcq-report-page">
      {/* HEADER */}
      <div className="mcq-header">
        <div>
          <h2>MCQ Report</h2>
          <p>{college} · Year {year} · Batch {batch}</p>
        </div>

        <div className="header-actions">
          {report.length > 0 && (
            <div className="mark-filter header-filter">
              <input
                type="number"
                placeholder="From"
                value={fromMark}
                onChange={e => setFromMark(e.target.value)}
              />
              <span>–</span>
              <input
                type="number"
                placeholder="To"
                value={toMark}
                onChange={e => setToMark(e.target.value)}
              />
            </div>
          )}

          {filteredReport.length > 0 && (
            <>
              <button className="analysis-btn" onClick={() => setShowAnalysis(true)}>
                📊 Analysis
              </button>
              <button className="download-btn" onClick={downloadExcel}>
                ⬇ Download Excel
              </button>
            </>
          )}

          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <select defaultValue="" onChange={e => handleSelectMCQ(e.target.value)}>
          <option value="" disabled>Select Category - Topic</option>
          {dropdownOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading && <p className="status">Loading report…</p>}

      {/* TABLE */}
      {filteredReport.length > 0 && (
        <div className="mcq-card">
          <h4>Topic: {filteredReport[0].mcqTopic}</h4>

          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>Score</th>
                <th>Total</th>
                <th>Attempted</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((r, i) => (
                <tr key={r._id}>
                  <td>{i + 1}</td>
                  <td>{r.student?.name || "Unknown"}</td>
                  <td>{r.student?.email || "-"}</td>
                  <td>{r.score}</td>
                  <td>{r.totalMarks}</td>
                  <td>{r.studentAttemptedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && report.length > 0 && filteredReport.length === 0 && (
        <p className="status">No students in selected mark range</p>
      )}

      {/* ANALYSIS MODAL */}
      {showAnalysis && (
        <div className="modal-overlay">
          <div className="analysis-modal">
            <div className="modal-header">
              <h3>Score Analysis</h3>
              <button onClick={() => setShowAnalysis(false)}>✕</button>
            </div>

            <div className="modal-body">
              {scoreDistribution.map(d => (
                <div key={d.score} className="bar-row">
                  <span className="bar-label">{d.score}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="bar-count">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
