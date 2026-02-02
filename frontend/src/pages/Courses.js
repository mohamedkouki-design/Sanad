// src/pages/Courses.js
// ============================================================
// Courses Browse Page
// Lists ALL published courses. If the user is a logged-in student,
// they can enroll directly from here.
// ============================================================

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/AuthContext";
import { courseAPI, enrollmentAPI } from "../api/services";
import CourseCard from "../components/CourseCard";

const Courses = () => {
  const { user }              = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState(new Set()); // Set of courseIds the user is enrolled in
  const [loading, setLoading] = useState(true);

  // Fetch all published courses + user's enrollments (if logged in)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await courseAPI.getAll();
        setCourses(coursesRes.data.courses);

        // If user is a student, also fetch their enrollments to show "Enrolled" badges
        if (user && user.role === "student") {
          const enrollRes = await enrollmentAPI.getMy();
          const enrolledIds = enrollRes.data.enrollments.map((e) => e.course.id);
          setEnrolled(new Set(enrolledIds));
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Handle enrollment
  const handleEnroll = async (courseId) => {
    try {
      await enrollmentAPI.enroll({ courseId });
      setEnrolled((prev) => new Set([...prev, courseId]));
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">All Courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse and enroll in courses across all subjects
          </p>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No courses available yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              {user?.role === "teacher"
                ? "You can create courses from your Dashboard."
                : "Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={enrolled.has(course.id)}
                onEnroll={
                  user?.role === "student" && !enrolled.has(course.id)
                    ? () => handleEnroll(course.id)
                    : null
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
