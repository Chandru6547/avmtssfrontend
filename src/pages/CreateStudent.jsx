import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import "./CreateStudent.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function CreateStudent() {

  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState([]);

  /* ---------------- FILE SELECT ---------------- */

  const handleFileChange = (e) => {

    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|csv)$/)) {
      setMessage("Please upload a valid Excel or CSV file.");
      return;
    }

    setFile(selectedFile);
    setMessage("");

    const reader = new FileReader();

    reader.onload = (event) => {

      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      setPreview(rows.slice(0, 5));

    };

    reader.readAsArrayBuffer(selectedFile);
  };

  /* ---------------- UPLOAD STUDENTS ---------------- */

  const handleSubmit = async () => {

    if (!file) {
      fileInputRef.current.click();
      setMessage("Please select a file before uploading.");
      return;
    }

    setLoading(true);
    setMessage("Uploading student records...");

    const reader = new FileReader();

    reader.onload = async (e) => {

      try {

        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!rows.length) {
          setMessage("Excel file is empty.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/bulkCreateStudentsWithMails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(rows)
        });

        const responseData = await res.json();

        if (res.ok) {
          setMessage(`${rows.length} student records uploaded successfully.`);
        } else {
          setMessage(responseData.message || "Upload failed.");
        }

      } catch (err) {
        console.error(err);
        setMessage("Server error occurred during upload.");
      }

      setLoading(false);
      setFile(null);
      setPreview([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="student-container">

      <h2>Bulk Student Upload</h2>

      <div className="upload-box">

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Students"}
        </button>

      </div>

      {preview.length > 0 && (

        <div className="preview-table">

          <h3>Preview (First 5 Records)</h3>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Year</th>
                <th>Batch</th>
                <th>Registration No</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>

              {preview.map((row, index) => (

                <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.college}</td>
                  <td>{row.year}</td>
                  <td>{row.batch}</td>
                  <td>{row.regNo}</td>
                  <td>{row.phNo}</td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {message && (
        <p className="message">{message}</p>
      )}

      <div className="excel-format">

        <h4>Excel File Format</h4>

        <p>The Excel file must contain the following columns:</p>

        <code>
          name | email | college | year | batch | regNo | phNo
        </code>

      </div>

    </div>
  );
}