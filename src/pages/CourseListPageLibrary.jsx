import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import "./CourseListPageLibrary.css";
export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/courses`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to fetch courses");

      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError("Unable to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loader">Loading courses...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="course-page">
      <h1 className="course-title">Available Courses</h1>

      {courses.length === 0 ? (
        <p className="empty-text">No courses available</p>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <h2>{course.name}</h2>
              <p>{course.description || "No description provided"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
