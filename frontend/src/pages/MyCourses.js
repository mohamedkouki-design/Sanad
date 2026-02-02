// src/pages/MyCourses.js
// ============================================================
// My Courses Page (Student)
// Shows all courses the student is enrolled in,
// with their progress percentage on each.
// ============================================================

import { useState, useEffect } from "react";
import { enrollmentAPI, progressAPI } from "../api/services";
import CourseCard from "../components/CourseCard";

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // { courseId: percentage }
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get all enrollments
        const res = await enrollmentAPI.getMy();
        setEnrollments(res.data.enrollments);

        // 2. For each enrolled course, get progress
        const progPromises = res.data.enrollments.map(async (enrollment) => {
          const progRes = await progressAPI.getCourseProgress(enrollment.course.id);
          return {
            courseId: enrollment.course.id,
            percent: progRes.data.summary.percentComplete
          };
        });
        const results = await Promise.all(progPromises);
        const map = {};
        results.forEach((r) => { map[r.courseId] = r.percent; });
        setProgressMap(map);
      } catch (err) {
        console.error("Failed to fetch my courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading your courses...</p>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">You haven't enrolled in any courses yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Browse available courses and start learning!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.course.id}
                course={enrollment.course}
                enrolled={true}
                progress={progressMap[enrollment.course.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
