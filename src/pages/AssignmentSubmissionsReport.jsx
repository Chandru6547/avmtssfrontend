import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import { getToken } from "../utils/auth";
import AssignmentProblemsPieChart from "./AssignmentProblemsPieChart";
import "./AssignmentSubmissionsReport.css";

const API = process.env.REACT_APP_API_BASE_URL;

export default function AssignmentSubmissionsReport() {
  const { assignmentId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(
          `${API}/api/assignment-submissions/assignment/${assignmentId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  /* ================= FILTER VALUES ================= */
  const colleges = [
    ...new Set(submissions.map((s) => s.studentDetails?.college).filter(Boolean)),
  ];

  const batches = [
    ...new Set(submissions.map((s) => s.studentDetails?.batch).filter(Boolean)),
  ];

  const years = [
    ...new Set(submissions.map((s) => s.studentDetails?.year).filter(Boolean)),
  ];

  /* ================= FILTER LOGIC ================= */
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        s.studentDetails?.name?.toLowerCase().includes(searchLower) ||
        s.studentDetails?.email?.toLowerCase().includes(searchLower) ||
        s.studentDetails?.regNo?.toLowerCase().includes(searchLower);

      const matchesCollege =
        selectedCollege === "all" ||
        s.studentDetails?.college === selectedCollege;

      const matchesBatch =
        selectedBatch === "all" ||
        s.studentDetails?.batch === selectedBatch;

      const matchesYear =
        selectedYear === "all" ||
        s.studentDetails?.year === selectedYear;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "completed" && s.isCompleted) ||
        (selectedStatus === "incomplete" && !s.isCompleted);

      return (
        matchesSearch &&
        matchesCollege &&
        matchesBatch &&
        matchesYear &&
        matchesStatus
      );
    });
  }, [
    submissions,
    searchTerm,
    selectedCollege,
    selectedBatch,
    selectedYear,
    selectedStatus,
  ]);

  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = () => {
    if (!filteredSubmissions.length) {
      alert("No data to export");
      return;
    }

    const headers = [
      "S.No",
      "Student Name",
      "Email",
      "Reg No",
      "College",
      "Year",
      "Batch",
      "Problems Solved",
      "Status",
      "Submitted On",
    ];

    const rows = filteredSubmissions.map((s, index) => [
      index + 1,
      s.studentDetails?.name || "",
      s.studentDetails?.email || "",
      s.studentDetails?.regNo || "",
      s.studentDetails?.college || "",
      s.studentDetails?.year || "",
      s.studentDetails?.batch || "",
      s.problemsSolved ?? 0,
      s.isCompleted ? "Completed" : "Incomplete",
      s.createdAt
        ? new Date(s.createdAt).toLocaleDateString()
        : "",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((val) => `"${val}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `assignment_report_${assignmentId}.csv`;
    link.click();
  };

  /* ================= RESET FILTERS ================= */
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCollege("all");
    setSelectedBatch("all");
    setSelectedYear("all");
    setSelectedStatus("all");
  };

  const isFiltered =
    searchTerm ||
    selectedCollege !== "all" ||
    selectedBatch !== "all" ||
    selectedYear !== "all" ||
    selectedStatus !== "all";

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading Submissions...</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="assignment-submissions-report">
      {/* HEADER */}
      <div className="report-header">
        <div>
          <h2>Assignment Submissions</h2>
          <p className="subtitle">
            Dynamic distribution from 0 → Highest Problems Solved
          </p>
        </div>

        <div className="header-right">
          <div className="search-box-compact">
            <FaSearch />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <FaTimes />
              </button>
            )}
          </div>

          <button className="download-btn" onClick={downloadCSV}>
            <FaDownload /> Download CSV
          </button>

          <span className="count-badge">
            Showing: {filteredSubmissions.length} / {submissions.length}
          </span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-container">
        <div className="filters-header">
          <FaFilter /> Filters
          {isFiltered && (
            <button onClick={resetFilters}>Reset All</button>
          )}
        </div>

        <div className="filters-grid">
          <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}>
            <option value="all">All Colleges</option>
            {colleges.map((college) => (
              <option key={college}>{college}</option>
            ))}
          </select>

          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch}>{batch}</option>
            ))}
          </select>

          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>

          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="analytics-section">
        <h3>Problems Solved Distribution</h3>
        <div className="chart-container">
          <AssignmentProblemsPieChart submissions={filteredSubmissions} />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Reg No</th>
              <th>College</th>
              <th>Year</th>
              <th>Batch</th>
              <th>Solved</th>
              <th>Status</th>
              <th>Submitted On</th>
            </tr>
          </thead>

          <tbody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((s, index) => (
                <tr key={s._id}>
                  <td>{index + 1}</td>
                  <td>
                    <FaUser /> {s.studentDetails?.name}
                    <br />
                    <FaEnvelope /> {s.studentDetails?.email}
                  </td>
                  <td>{s.studentDetails?.regNo}</td>
                  <td>{s.studentDetails?.college}</td>
                  <td>{s.studentDetails?.year}</td>
                  <td>{s.studentDetails?.batch}</td>
                  <td>{s.problemsSolved}</td>
                  <td>
                    {s.isCompleted ? (
                      <span className="status completed">
                        <FaCheckCircle /> Completed
                      </span>
                    ) : (
                      <span className="status pending">
                        <FaTimesCircle /> Incomplete
                      </span>
                    )}
                  </td>
                  <td>
                    <FaCalendarAlt />{" "}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No submissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
