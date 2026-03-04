import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SubmissionListPage.css";

export default function SubmissionListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const college =
    location.state?.college || localStorage.getItem("selectedCampus");
  const year =
    location.state?.year || localStorage.getItem("selectedYear");
  const batch =
    location.state?.batch || localStorage.getItem("selectedBatch");

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!college || !year || !batch) {
      navigate("/campuses");
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(
          "https://tssplatform.onrender.com/getSubmissionsByBatch",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college, year, batch })
          }
        );

        if (!res.ok) throw new Error("Failed to fetch submissions");
        setSubmissions(await res.json());
      } catch (err) {
        console.error(err);
        setError("Unable to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [college, year, batch, navigate]);

  /* ---------------- GROUP BY STUDENT ---------------- */
  const students = useMemo(() => {
    const map = {};
    submissions.forEach(sub => {
      if (!map[sub.studentId]) {
        map[sub.studentId] = {
          studentId: sub.studentId,
          name: sub.student?.name || "Unknown",
          email: sub.student?.email || "-",
          solvedCount: sub.studentSolvedCount || 0
        };
      }
    });
    return Object.values(map);
  }, [submissions]);

  /* ---------------- SOLVED QUESTIONS ---------------- */
  const solvedQuestions = useMemo(() => {
    if (!selectedStudent) return [];

    const map = {};
    submissions.forEach(sub => {
      if (
        sub.studentId === selectedStudent.studentId &&
        sub.verdict === "AC"
      ) {
        map[sub.questionId] = {
          questionTitle: sub.questionTitle,
          submission: sub
        };
      }
    });

    return Object.values(map);
  }, [selectedStudent, submissions]);

  /* ---------------- DOWNLOAD CSV ---------------- */
  const downloadExcel = () => {
    if (students.length === 0) return;

    const headers = ["Student Name", "Email", "Solved Count"];

    const rows = students.map(s => [
      s.name,
      s.email,
      s.solvedCount
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row =>
        row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${college}_${batch}_Solved_Report.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ---------------- UI STATES ---------------- */
  if (loading) return <p className="status">Loading report…</p>;
  if (error) return <p className="status error">{error}</p>;

  return (
    <div className="submission-page">
      {/* HEADER */}
      <div className="submission-header">
        <div>
          <h2>{college}</h2>
          <div className="meta">
            <span>Year {year}</span>
            <span>Batch {batch}</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="download-btn" onClick={downloadExcel}>
            ⬇ Download Excel
          </button>

          <button
            className="mcq-report-btn"
            onClick={() =>
              navigate("/report/mcqs", {
                state: { college, year, batch }
              })
            }
          >
            View MCQs Report
          </button>

          <button
            className="assignment-report-btn"
            onClick={() =>
              navigate("/view-assignment-report", {
                state: { college, year, batch }
              })
            }
          >
            View Assignment Report
          </button>
        </div>

      </div>

      {/* STUDENT TABLE */}
      <div className="submission-table-wrapper">
        <table className="submission-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Email</th>
              <th>Solved</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu, index) => (
              <tr
                key={stu.studentId}
                className="clickable-row"
                onClick={() => setSelectedStudent(stu)}
              >
                <td>{index + 1}</td>
                <td className="student-name-cell">{stu.name}</td>
                <td className="student-email-cell">{stu.email}</td>
                <td>
                  <span className="solved-badge">{stu.solvedCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- STUDENT MODAL ---------------- */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedStudent.name}</h3>
                <p>{selectedStudent.email}</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <h4>Solved Questions</h4>

              {solvedQuestions.length === 0 ? (
                <p className="status">No solved questions</p>
              ) : (
                <ul className="question-list">
                  {solvedQuestions.map((q, i) => (
                    <li
                      key={i}
                      className="clickable-question"
                      onClick={() => setSelectedSubmission(q.submission)}
                    >
                      <span className="q-index">{i + 1}</span>
                      <span className="q-title">{q.questionTitle}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CODE MODAL ---------------- */}
      {selectedSubmission && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="modal-box large"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>{selectedSubmission.questionTitle}</h3>
                <p>
                  {selectedSubmission.language.toUpperCase()} ·{" "}
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </button>
            </div>

            <pre className="code-view">{selectedSubmission.code}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
