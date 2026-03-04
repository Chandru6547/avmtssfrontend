import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./CreateStudent.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function CreateStudent() {
  const [campuses, setCampuses] = useState([]);
  const [years, setYears] = useState([]);
  const [batches, setBatches] = useState([]);

  const [campus, setCampus] = useState("");
  const [year, setYear] = useState("");
  const [batch, setBatch] = useState("");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------------- FETCH CAMPUSES ---------------- */
  useEffect(() => {
    fetch(`${API_BASE}/campus/get`)
      .then(res => res.json())
      .then(setCampuses);
  }, []);

  /* ---------------- FETCH YEARS ---------------- */
  useEffect(() => {
    if (!campus) return;

    fetch(`${API_BASE}/year/get-by-campus?campus=${encodeURIComponent(campus)}`)
      .then(res => res.json())
      .then(data => {
        setYears(data);
        setBatches([]);
        setYear("");
        setBatch("");
      });
  }, [campus]);

  /* ---------------- FETCH BATCHES ---------------- */
  useEffect(() => {
    if (!campus || !year) return;

    fetch(
      `${API_BASE}/batch/get-by-campus-year?campus=${encodeURIComponent(
        campus
      )}&year=${year}`
    )
      .then(res => res.json())
      .then(data => {
        setBatches(data);
        setBatch("");
      });
  }, [campus, year]);

  /* ---------------- SUBMIT BULK STUDENTS ---------------- */
  const handleSubmit = async () => {
    if (!file) {
      setMessage("❌ Please upload an Excel file");
      return;
    }

    setLoading(true);
    setMessage("Uploading students...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      for (const row of rows) {
        if (!row.email || !row.password) continue;

        const payload = {
          name: row.name || "",
          email: row.email,
          password: row.password,
          regNo: row.regNo || "",
          phNo: row.phNo || "",
          college: campus,
          year: Number(year),
          batch: batch,
          role: "student",
          course: [],
          mcqs: []
        };

        try {
          await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } catch {}
      }

      setMessage("✅ Students uploaded successfully");
      setLoading(false);
      setFile(null);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="student-container">
      <h2>Bulk Student Upload</h2>

      {/* ---------- SELECTION SECTION ---------- */}
      <div className="student-form">
        <select value={campus} onChange={e => setCampus(e.target.value)} required>
          <option value="">Select College</option>
          {campuses.map(c => (
            <option key={c._id} value={c.college || c.name}>
              {c.Campusname || c.college}
            </option>
          ))}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)} disabled={!campus}>
          <option value="">Select Year</option>
          {years.map(y => (
            <option key={y._id} value={y.Year || y.year}>
              {y.Year || y.year}
            </option>
          ))}
        </select>

        <select value={batch} onChange={e => setBatch(e.target.value)} disabled={!year}>
          <option value="">Select Batch</option>
          {batches.map(b => (
            <option key={b._id} value={b.Batchname || b.batch}>
              {b.Batchname || b.batch}
            </option>
          ))}
        </select>

        {/* ---------- FILE UPLOAD ---------- */}
        <input
          type="file"
          accept=".xlsx,.csv"
          disabled={!campus || !year || !batch}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button disabled={loading || !file} onClick={handleSubmit}>
          {loading ? "Uploading..." : "Submit Students"}
        </button>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
