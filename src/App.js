import Navbar from "./components/Navbar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import CampusListPage from "./pages/CampusListPage";
import YearsListPage from "./pages/YearsListPage";
import CompilerPage from "./pages/CompilerPage";
import CourseListPage from "./pages/CourseListPage";
import CategoryListPage from "./pages/CategoryListPage";
import QuestionListPage from "./pages/QuestionListPage";
import SolveQuestionPage from "./pages/SolveQuestionPage";
import QuestionUploadPage from "./pages/QuestionUploadPage";
import LoginPage from "./pages/LoginPage";
import CreateAdminPage from "./pages/CreateAdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BatchListPage from "./pages/BatchListPage";
import SubmissionListPage from "./pages/SubmissionListPage";
import MCQListPage from "./pages/MCQListPage";
import MCQCreatePage from "./pages/MCQCreatePage";
import MCQStudentPage from "./pages/MCQStudentPage";
import MCQTestPage from "./pages/MCQTestPage";
import ComingSoon from "./pages/ComingSoon";
import MCQReportPage from "./pages/MCQReportPage";
import CreateStudent from "./pages/CreateStudent";
import AssignCourseOrMcq from "./pages/AssignCourseOrMcq";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import AssignmentListPage from "./pages/AssignmentListPage";
import AssignmentStudentPage from "./pages/AssignmentStudentPage";
import AssignmentSolvePage from "./pages/AssignmentSolvePage";
import AssignmentSolveQuestionPage from "./pages/AssignmentSolveQuestionPage";
import ViewStudentCampusListPage from "./pages/ViewStudentCampusListPage";
import ViewStudentYearListPage from "./pages/ViewStudentYearListpage";
import ViewStudentBatchListPage from "./pages/ViewStudentBatchListPage";
import ViewStudentsByBatch from "./pages/ViewStudentsByBatch";
import StudentTickets from "./pages/StudentTickets";
import AdminTickets from "./pages/AdminTickets";
import DashboardPage from "./pages/DashboardPage";
import CourseListPageLibrary from "./pages/CourseListPageLibrary";
import AssignmentListPageLibrary from "./pages/AssignmentListPageLibrary";
import MCQListPageLibrary from "./pages/MCQListPageLibrary";
import ViewAssignmentReport from "./pages/ViewAssignmentReport";
import ViewMcqsAnswer from "./pages/ViewMcqsAnswer";
import MCQCategoryPage from "./pages/MCQCategoryPage";
import MCQListByCategory from "./pages/MCQListByCategory";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AssignmentDetailPage from "./pages/AssignmentDetailPage";
import AssessmentSelectPage from "./pages/AssessmentSelectPage";
import StaffAssignmentList from "./pages/StaffAssignmentList";
import StaffMCQList from "./pages/StaffMCQList";
import AssignmentReportPage from "./pages/AssignmentReportPage";
import MCQReportPageStaff from "./pages/MCQReportPageStaff";
import CreateStaffPage from "./pages/StaffManagementPage";
import TSSCurriculumDashboard from "./pages/TSSCurriculumDashboard";
import TaskTracker from "./pages/TaskTracker";
import StudentTaskTracker from "./pages/StudentTaskTracker"
import TaskSubmissions from "./pages/TaskSubmissions";
import AssignmentsReportAssignmentList from "./pages/AssignmentsReportAssignmentList";
import AssignmentSubmissionsReport from "./pages/AssignmentSubmissionsReport";
import ReportMCQListPage from "./pages/ReportMCQListPage";
import MCQSubmissionReportPage from "./pages/MCQSubmissionReportPage";
import "./App.css";
import { getRole } from "./utils/auth";

function RoleBasedHome() {
  const role = getRole();
  if (role === "staff") {
    return <Navigate to="/select-assessment" replace />;
  }
  return <CompilerPage />;
}

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {hideNavbar ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="app-layout">
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* ✅ Compiler (Admin + Student) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleBasedHome />
                  </ProtectedRoute>
                }
              />

              {/* ✅ Practice (Admin + Student) */}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={["admin", "student"]}>
                    <CourseListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/view-mcqs-answer"
                element={
                  <ProtectedRoute allowedRoles={["admin", "student"]}>
                    <ViewMcqsAnswer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/categories"
                element={
                  <ProtectedRoute allowedRoles={["admin", "student"]}>
                    <CategoryListPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/assignments/:id" element={<AssignmentDetailPage />} />

              <Route
                path="/categories/:categoryId"
                element={
                  <ProtectedRoute allowedRoles={["admin", "student"]}>
                    <QuestionListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/questions/:id"
                element={
                  <ProtectedRoute allowedRoles={["admin", "student"]}>
                    <SolveQuestionPage />
                  </ProtectedRoute>
                }
              />

              {/* 🔒 Admin Only */}
              <Route
                path="/admin/upload"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <QuestionUploadPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/edit/:questionId"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <QuestionUploadPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assignments/create"
                element={
                  <ProtectedRoute>
                    <CreateAssignmentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                  path="/assignments/solve/:assignmentId/question/:questionId"
                  element={
                    <ProtectedRoute>
                      <AssignmentSolveQuestionPage />
                    </ProtectedRoute>
                  }
                />

              <Route
                path="/mcqs/test/:mcqId"
                element={
                  <ProtectedRoute>
                    <MCQTestPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/create"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CreateAdminPage />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/mcqs" element={
                <ProtectedRoute>
                  <MCQListPage />
                </ProtectedRoute>
              } />

              <Route path="/mcqs/create" element={
                <ProtectedRoute>
                  <MCQCreatePage />
                </ProtectedRoute>
              } />
              
              <Route path="/mcqs/student" element={
                <ProtectedRoute>
                  <MCQStudentPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/reports" element={<CampusListPage />} />
              <Route path="/years" element={<YearsListPage />} />
              <Route path="/submissions" element={<SubmissionListPage />} />
              <Route path="/batches" element={<BatchListPage />} />
               <Route path="/comingsoon" element={<ComingSoon />} />
               <Route path="/report/mcqs" element={<MCQReportPage />} />
                <Route path="/create-student" element={<CreateStudent />} />
                <Route path="/manage-curriculam" element={<AssignCourseOrMcq />} />
                <Route path="/tss-library-dashboard" element={<DashboardPage  />} />
                <Route path="/courses-library" element={<CourseListPageLibrary />} />
                <Route path="/assignments-library" element={<AssignmentListPageLibrary />} />
                <Route path="/mcqs-library" element={<MCQListPageLibrary />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/mcqs-list-all" element={<MCQCategoryPage />} />
              <Route path="/mcqs/category/:category" element={<MCQListByCategory />} /> 
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/select-assessment" element={<AssessmentSelectPage />} />
              <Route path="/staff/assignments" element={<StaffAssignmentList />} />
              <Route path="/staff/mcqs" element={<StaffMCQList />} />
              <Route path="/staff/assignment-report" element={<AssignmentReportPage />} />
              <Route path="/staff/mcq-report" element={<MCQReportPageStaff />} />
              <Route path="/create-staff" element={<CreateStaffPage />} />
              <Route path="/tss-curriculum-dashboard" element={<TSSCurriculumDashboard />} />
              <Route 
                path="/admin/reports/mcq-list" 
                element={<ReportMCQListPage />} 
                />

                <Route
                  path="/admin/reports/mcq/:mcqId"
                  element={<MCQSubmissionReportPage />}
                />

              <Route
                path="/assignments/viewall" 
                element={
                  <ProtectedRoute>
                    <AssignmentListPage /> 
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignment-student"
                element={
                  <ProtectedRoute>
                    <AssignmentStudentPage />
                  </ProtectedRoute>
                }
              />
              <Route
              path="/assignments/solve/:assignmentId"
              element={
                <ProtectedRoute>
                  <AssignmentSolvePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-students-campus"
              element={
                <ProtectedRoute>
                  <ViewStudentCampusListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-students-year"
              element={
                <ProtectedRoute>
                  <ViewStudentYearListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-students-batches"
              element={
                <ProtectedRoute>
                  <ViewStudentBatchListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-students-batches-students"
              element={
                <ProtectedRoute>
                  <ViewStudentsByBatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/raise-ticket"
              element={
                <ProtectedRoute>
                  <StudentTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-all-tickets"
              element={
                <ProtectedRoute>
                  <AdminTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports/assignments/:assignmentId"
              element={<AssignmentSubmissionsReport />}
            />
            <Route
              path="/student-tracker"
              element={
                <ProtectedRoute>
                  <StudentTaskTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tss-tracker"
              element={
                <ProtectedRoute>
                  <TaskTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-task-submissions"
              element={
                <ProtectedRoute>
                  <TaskSubmissions />
                </ProtectedRoute>
              }
            />
            
            <Route
                path="/view-assignment-report"
                element={<ViewAssignmentReport />}
              />

              <Route
                path="/admin/reports/assignments-list"
                element={<AssignmentsReportAssignmentList />}
              />
            </Routes>
          </main>
        </div>
      )}
    </>
  );
}
