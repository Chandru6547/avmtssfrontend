import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBolt,
  FaCode,
  FaBookReader,
  FaClipboardList,
  FaClipboardCheck,
  FaRobot,
  FaFileAlt,
  FaCalendarCheck,
  FaTrophy,
  FaTasks,
  FaTicketAlt,
  FaChartBar,
  FaChartPie,
  FaPoll,
  FaChartLine,
  FaPlusCircle,
  FaCloudUploadAlt,
  FaUserPlus,
  FaUserTie,
  FaUsers,
  FaProjectDiagram,
  FaSignOutAlt,
  FaLayerGroup
} from "react-icons/fa";

import { logout, isAuthenticated, getRole } from "../utils/auth";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname.startsWith(path) ? "active" : "";

  return (
    <aside className="navbar">
      {/* ---------- HEADER ---------- */}
      <div className="navbar-header">
        <span className="logo-icon">
          <FaBolt />
        </span>
        <span className="logo-text">TSS Student&apos;s Hub</span>
      </div>

      {/* ---------- MENU ---------- */}
      <nav className="navbar-menu">

        {/* ================= STAFF ================= */}
        {role === "staff" && (
          <Link
            to="/select-assessment"
            className={`nav-item ${isActive("/select-assessment")}`}
          >
            <FaChartPie />
            <span>View Report</span>
          </Link>
        )}

        {/* ================= STUDENT ================= */}
        {role === "student" && (
          <>
            <Link to="/" className={`nav-item ${isActive("/")}`}>
              <FaCode />
              <span>IDE</span>
            </Link>

            <Link to="/courses" className={`nav-item ${isActive("/courses")}`}>
              <FaBookReader />
              <span>Practice</span>
            </Link>

            <Link
              to="/mcqs/student"
              className={`nav-item ${isActive("/mcqs")}`}
            >
              <FaClipboardList />
              <span>MCQs</span>
            </Link>

            <Link
              to="/view-mcqs-answer"
              className={`nav-item ${isActive("/view-mcqs-answer")}`}
            >
              <FaClipboardCheck />
              <span>View MCQs Answer</span>
            </Link>

            <Link to="/comingsoon" className="nav-item">
              <FaRobot />
              <span>AI Interview</span>
            </Link>

            <Link to="/comingsoon" className="nav-item">
              <FaFileAlt />
              <span>AI Resume</span>
            </Link>

            <Link to="/comingsoon" className="nav-item">
              <FaCalendarCheck />
              <span>Meeting Scheduler</span>
            </Link>

            <Link to="/comingsoon" className="nav-item">
              <FaTrophy />
              <span>Contest</span>
            </Link>

            <Link
              to="/assignment-student"
              className={`nav-item ${isActive("/assignment-student")}`}
            >
              <FaTasks />
              <span>Assignments</span>
            </Link>

            <Link
              to="/raise-ticket"
              className={`nav-item ${isActive("/raise-ticket")}`}
            >
              <FaTicketAlt />
              <span>Raise a Ticket</span>
            </Link>

            <Link
              to="/student-tracker"
              className={`nav-item ${isActive("/student-tracker")}`}
            >
              <FaChartLine />
              <span>Student Tracker</span>
            </Link>
          </>
        )}

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <>
            <Link to="/" className={`nav-item ${isActive("/")}`}>
              <FaCode />
              <span>IDE</span>
            </Link>

            <Link to="/courses" className={`nav-item ${isActive("/courses")}`}>
              <FaBookReader />
              <span>Practice</span>
            </Link>

            <Link to="/mcqs" className={`nav-item ${isActive("/mcqs")}`}>
              <FaClipboardList />
              <span>MCQs</span>
            </Link>

            <Link
              to="/mcqs/create"
              className={`nav-item ${isActive("/mcqs/create")}`}
            >
              <FaPlusCircle />
              <span>Create MCQ</span>
            </Link>

            <Link
              to="/admin/upload"
              className={`nav-item ${isActive("/admin/upload")}`}
            >
              <FaCloudUploadAlt />
              <span>Upload Question</span>
            </Link>

            <Link
              to="/admin/reports"
              className={`nav-item ${isActive("/admin/reports")}`}
            >
              <FaChartPie />
              <span>Reports</span>
            </Link>

            <Link
              to="/admin/reports/assignments-list"
              className={`nav-item ${isActive("/admin/reports/assignments-list")}`}
            >
              <FaChartBar />
              <span>Assignments Report</span>
            </Link>

            <Link
              to="/admin/reports/mcq-list"
              className={`nav-item ${isActive("/admin/reports/mcq-list")}`}
            >
              <FaPoll />
              <span>MCQs Report</span>
            </Link>

            <Link
              to="/create-student"
              className={`nav-item ${isActive("/create-student")}`}
            >
              <FaUserPlus />
              <span>Student Creation</span>
            </Link>

            <Link
              to="/create-staff"
              className={`nav-item ${isActive("/create-staff")}`}
            >
              <FaUserTie />
              <span>Create Staff</span>
            </Link>

            <Link
              to="/manage-curriculam"
              className={`nav-item ${isActive("/manage-curriculam")}`}
            >
              <FaProjectDiagram />
              <span>Manage Curriculum</span>
            </Link>

            <Link
              to="/assignments/create"
              className={`nav-item ${isActive("/assignments/create")}`}
            >
              <FaTasks />
              <span>Create Assignments</span>
            </Link>

            <Link
              to="/assignments/viewall"
              className={`nav-item ${isActive("/assignments/viewall")}`}
            >
              <FaClipboardList />
              <span>View Assignments</span>
            </Link>

            <Link
              to="/view-students-campus"
              className={`nav-item ${isActive("/view-students-campus")}`}
            >
              <FaUsers />
              <span>View Students</span>
            </Link>

            <Link
              to="/view-task-submissions"
              className={`nav-item ${isActive("/view-task-submissions")}`}
            >
              <FaChartLine />
              <span>Task Reports</span>
            </Link>

            <Link
              to="/view-all-tickets"
              className={`nav-item ${isActive("/view-all-tickets")}`}
            >
              <FaTicketAlt />
              <span>View Tickets</span>
            </Link>

            <Link
              to="/tss-library-dashboard"
              className={`nav-item ${isActive("/tss-library-dashboard")}`}
            >
              <FaBookReader />
              <span>TSS Library</span>
            </Link>

            <Link
              to="/tss-curriculum-dashboard"
              className={`nav-item ${isActive("/tss-curriculum-dashboard")}`}
            >
              <FaLayerGroup />
              <span>TSS Curriculum</span>
            </Link>

            <Link
              to="/tss-tracker"
              className={`nav-item ${isActive("/tss-tracker")}`}
            >
              <FaChartLine />
              <span>TSS Tracker</span>
            </Link>
          </>
        )}
      </nav>

      {/* ---------- FOOTER ---------- */}
      <div className="navbar-footer">
        {isAuthenticated() && (
          <button className="nav-item logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
