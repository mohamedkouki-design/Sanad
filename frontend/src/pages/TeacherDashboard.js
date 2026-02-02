// src/pages/TeacherDashboard.js
// ============================================================
// Teacher Dashboard
// Teachers can:
//   - See all their created courses
//   - Create a new course
//   - Add lessons to a course
//   - View enrolled students for each course
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI, lessonAPI, enrollmentAPI } from "../api/services";

const TeacherDashboard = () => {
  const [courses, setCourses]          = useState([]);
  const [loading, setLoading]          = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(null); // courseId
  const [roster, setRoster]            = useState(null);      // { courseId, students[] }

  // Form states
  const [courseForm, setCourseForm] = useState({ title: "", description: "", subject: "Mathematics", gradeLevel: 6 });
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", order: 1, xpReward: 10 });

  // Fetch teacher's courses
  useEffect(() => {
    // We use getAll but the teacher sees all published; for a real app we'd have a /my-courses teacher endpoint
    // For now, we fetch all and the teacher manages their own
    courseAPI.getAll()
      .then((res) => setCourses(res.data.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // Create a course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await courseAPI.create(courseForm);
      setCourses((prev) => [res.data.course, ...prev]);
      setCourseForm({ title: "", description: "", subject: "Mathematics", gradeLevel: 6 });
      setShowCourseForm(false);
      alert("✅ Course created!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create course.");
    }
  };

  // Add a lesson to a course
  const handleAddLesson = async (e, courseId) => {
    e.preventDefault();
    try {
      await lessonAPI.create(courseId, lessonForm);
      setLessonForm({ title: "", content: "", order: 1, xpReward: 10 });
      setShowLessonForm(null);
      alert("✅ Lesson added!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add lesson.");
    }
  };

  // Publish / unpublish a course
  const handleTogglePublish = async (course) => {
    try {
      await courseAPI.update(course.id, { isPublished: !course.isPublished });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: !c.isPublished } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  // View roster (enrolled students)
  const handleViewRoster = async (courseId) => {
    try {
      const res = await enrollmentAPI.getCourseRoster(courseId);
      setRoster({ courseId, students: res.data.enrollments });
    } catch (err) {
      alert("Failed to load roster.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your courses and lessons</p>
          </div>
          <button
            onClick={() => setShowCourseForm(!showCourseForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
          >
            {showCourseForm ? "Cancel" : "+ New Course"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Create Course Form */}
        {showCourseForm && (
          <form onSubmit={handleCreateCourse} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Create New Course</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Title</label>
                <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Subject</label>
                <select value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1">
                  {["Mathematics", "Science", "French", "Arabic", "History", "Geography"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <input value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Grade Level (1-12)</label>
                <input type="number" min={1} max={12} value={courseForm.gradeLevel}
                  onChange={(e) => setCourseForm({ ...courseForm, gradeLevel: parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <button type="submit" className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
              Create Course
            </button>
          </form>
        )}

        {/* Courses List */}
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading your courses...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{course.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${course.isPublished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{course.subject} · Grade {course.gradeLevel}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleTogglePublish(course)}
                      className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition">
                      {course.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => handleViewRoster(course.id)}
                      className="text-xs border border-indigo-200 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-50 transition">
                      👥 Roster
                    </button>
                    <button onClick={() => setShowLessonForm(showLessonForm === course.id ? null : course.id)}
                      className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-200 transition">
                      + Lesson
                    </button>
                  </div>
                </div>

                {/* Add Lesson Form */}
                {showLessonForm === course.id && (
                  <form onSubmit={(e) => handleAddLesson(e, course.id)} className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Lesson Title</label>
                        <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Order</label>
                        <input type="number" min={1} value={lessonForm.order}
                          onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">XP Reward</label>
                        <input type="number" min={1} value={lessonForm.xpReward}
                          onChange={(e) => setLessonForm({ ...lessonForm, xpReward: parseInt(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs text-gray-500">Content</label>
                      <textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} required rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 resize-none" />
                    </div>
                    <button type="submit" className="mt-2 bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition">
                      Add Lesson
                    </button>
                  </form>
                )}
              </div>
            ))}

            {courses.length === 0 && (
              <p className="text-gray-400 text-center py-12">
                No courses yet. Click "+ New Course" to get started!
              </p>
            )}
          </div>
        )}

        {/* Roster Modal */}
        {roster && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Enrolled Students</h3>
                <button onClick={() => setRoster(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              {roster.students.length === 0 ? (
                <p className="text-gray-400 text-sm">No students enrolled yet.</p>
              ) : (
                <ul className="space-y-2">
                  {roster.students.map((e) => (
                    <li key={e.student.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{e.student.name}</p>
                        <p className="text-xs text-gray-400">{e.student.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-indigo-600 font-semibold">Lv.{e.student.level} · {e.student.xp} XP</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
