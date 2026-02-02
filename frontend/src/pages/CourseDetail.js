// src/pages/CourseDetail.js
// ============================================================
// Course Detail Page
// Shows a single course with all its lessons.
// Students can see their progress per lesson and complete them.
// The AI Summary button calls OpenAI to summarize any lesson.
// ============================================================

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { courseAPI, enrollmentAPI, progressAPI, lessonAPI } from "../api/services";

const CourseDetail = () => {
  const { courseId }          = useParams();
  const { user }             = useAuth();
  const [course, setCourse]  = useState(null);
  const [lessons, setLessons]= useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState({}); // { lessonId: { isCompleted, xpEarned } }
  const [loading, setLoading]   = useState(true);
  const [summary, setSummary]   = useState({}); // { lessonId: summaryText }
  const [summaryLoading, setSummaryLoading] = useState(null); // lessonId currently loading

  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get course + its lessons
        const courseRes = await courseAPI.getById(courseId);
        setCourse(courseRes.data.course);
        setLessons(courseRes.data.course.lessons || []);

        // 2. Check enrollment (if student)
        if (user?.role === "student") {
          const enrollRes = await enrollmentAPI.getMy();
          const isEnrolled = enrollRes.data.enrollments.some((e) => e.course.id === courseId);
          setEnrolled(isEnrolled);

          // 3. Get progress (if enrolled)
          if (isEnrolled) {
            const progressRes = await progressAPI.getCourseProgress(courseId);
            const progressMap = {};
            progressRes.data.progress.forEach((p) => {
              progressMap[p.lessonId] = { isCompleted: p.isCompleted, xpEarned: p.xpEarned };
            });
            setProgress(progressMap);
          }
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user]);

  // Enroll in this course
  const handleEnroll = async () => {
    try {
      await enrollmentAPI.enroll({ courseId });
      setEnrolled(true);
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed.");
    }
  };

  // Complete a lesson
  const handleComplete = async (lessonId, xpReward) => {
    try {
      const res = await progressAPI.complete({ lessonId });
      setProgress((prev) => ({
        ...prev,
        [lessonId]: { isCompleted: true, xpEarned: xpReward }
      }));
      if (res.data.leveledUp) {
        alert(`🎉 Congratulations! You leveled up to Level ${res.data.level}!`);
      }
      if (res.data.courseCompleted) {
        alert("🏆 You completed this entire course! Amazing work!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete lesson.");
    }
  };

  // AI Summarize a lesson
  const handleSummarize = async (lessonId) => {
    if (summary[lessonId]) return; // already cached locally
    setSummaryLoading(lessonId);
    try {
      const res = await lessonAPI.summarize(courseId, lessonId);
      setSummary((prev) => ({ ...prev, [lessonId]: res.data.summary }));
    } catch (err) {
      alert("AI summarization failed. Please try again.");
    } finally {
      setSummaryLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  // Calculate overall progress
  const completedCount = Object.values(progress).filter((p) => p.isCompleted).length;
  const totalLessons   = lessons.length;
  const percentDone    = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/courses" className="text-indigo-200 text-sm hover:text-white transition">← Back to Courses</Link>
          <h1 className="text-3xl font-bold mt-2">{course.title}</h1>
          <p className="text-indigo-200 mt-1">{course.description || "No description available."}</p>
          <div className="flex gap-4 mt-3 text-sm text-indigo-200">
            <span>📚 {course.subject}</span>
            <span>🎓 Grade {course.gradeLevel}</span>
            <span>👨‍🏫 {course.teacher?.name}</span>
            <span>📝 {totalLessons} lessons</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Enrollment CTA */}
        {user?.role === "student" && !enrolled && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-indigo-800 font-semibold">Enroll to start learning</p>
              <p className="text-indigo-500 text-sm">Complete lessons to earn XP and level up!</p>
            </div>
            <button onClick={handleEnroll} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Enroll Now
            </button>
          </div>
        )}

        {/* Progress Bar (if enrolled) */}
        {enrolled && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Your Progress</span>
              <span>{completedCount} / {totalLessons} lessons ({percentDone}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${percentDone}%` }}></div>
            </div>
          </div>
        )}

        {/* Lessons List */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">Lessons</h2>
        <div className="flex flex-col gap-3">
          {lessons.map((lesson, idx) => {
            const isCompleted = progress[lesson.id]?.isCompleted || false;
            return (
              <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Lesson number + title */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"
                      }`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                    </div>

                    {/* Meta info */}
                    <div className="flex gap-3 mt-2 text-xs text-gray-400 ml-11">
                      <span>⏱ ~{lesson.estimatedMinutes} min</span>
                      <span>⭐ {lesson.xpReward} XP</span>
                      {isCompleted && <span className="text-green-500 font-semibold">Completed!</span>}
                    </div>

                    {/* AI Summary (if loaded) */}
                    {summary[lesson.id] && (
                      <div className="mt-3 ml-11 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-semibold mb-1">🤖 AI Summary</p>
                        <p className="text-sm text-purple-800">{summary[lesson.id]}</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {/* AI Summarize button */}
                    <button
                      onClick={() => handleSummarize(lesson.id)}
                      disabled={summaryLoading === lesson.id || !!summary[lesson.id]}
                      className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition"
                    >
                      {summaryLoading === lesson.id ? "⏳..." : summary[lesson.id] ? "✓ Summary" : "🤖 AI Summary"}
                    </button>

                    {/* Complete button (only if enrolled and not yet completed) */}
                    {enrolled && !isCompleted && (
                      <button
                        onClick={() => handleComplete(lesson.id, lesson.xpReward)}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
