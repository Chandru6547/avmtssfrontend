import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import "./ViewStudentsByBatch.css";

const ITEMS_PER_PAGE = 9;

export default function ViewStudentsByBatch() {
  const location = useLocation();
  const navigate = useNavigate();

  const college =
    location.state?.college || localStorage.getItem("selectedCampus");
  const year =
    location.state?.year || localStorage.getItem("selectedYear");
  const batch =
    location.state?.batch || localStorage.getItem("selectedBatch");

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  /* ---------- SAFETY ---------- */
  useEffect(() => {
    if (!college || !year || !batch) navigate("/campuses");
  }, [college, year, batch, navigate]);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/students/students?college=${college}&year=${year}&batch=${batch}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` }
          }
        );

        if (res.status === 401 || res.status === 403) {
          logout();
          navigate("/login");
          return;
        }

        setStudents(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [college, year, batch, navigate]);

  /* ---------- SEARCH FILTER ---------- */
  const filteredStudents = useMemo(() => {
    setPage(1); // reset page on search
    return students.filter((s) =>
      `${s.name} ${s.email} ${s.regNo} ${s.phNo}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, page]);

  if (loading) return <div className="page-loader">Loading students…</div>;

  return (
    <div className="students-page">
      {/* ---------- HEADER ---------- */}
      <div className="page-header">
        <h2>👨‍🎓 Students</h2>
        <p>
          {college} · Year {year} · {batch}
        </p>
      </div>

      {/* ---------- STATS ---------- */}
      <div className="stats-row">
        <div className="stat-card">
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </div>
        <div className="stat-card">
          <span>Batch</span>
          <strong>{batch}</strong>
        </div>
        <div className="stat-card">
          <span>Year</span>
          <strong>{year}</strong>
        </div>
      </div>

      {/* ---------- SEARCH ---------- */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, reg no, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ---------- TABLE ---------- */}
      {paginatedStudents.length === 0 ? (
        <div className="empty-state">😕 No students found</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Reg No</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s, i) => (
                  <tr key={s._id}>
                    <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.regNo}</td>
                    <td>{s.phNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- PAGINATION ---------- */}
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ⬅ Prev
            </button>

            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
}
