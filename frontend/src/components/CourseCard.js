// src/components/CourseCard.js
// ============================================================
// CourseCard Component
// Displays a single course as a card.
// Props:
//   - course   → the course object from the API
//   - enrolled → boolean, whether the current user is enrolled
//   - onEnroll → callback when "Enroll" is clicked
//   - progress → number (0-100), completion percentage
// ============================================================

import { Link } from "react-router-dom";

const CourseCard = ({ course, enrolled, onEnroll, progress = 0 }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Color banner based on subject */}
      <div className={`h-3 ${getSubjectColor(course.subject)}`}></div>

      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wide">{course.subject}</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Grade {course.gradeLevel}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">{course.title}</h3>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
        )}

        {/* Teacher info */}
        <p className="text-xs text-gray-400 mb-3">
          By {course.teacher?.name || "Unknown"}
        </p>

        {/* Progress bar (only if enrolled) */}
        {enrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action: Enroll or View */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/courses/${course.id}`}
            className="flex-1 text-center text-sm text-indigo-600 font-semibold border border-indigo-200 rounded-lg py-1.5 hover:bg-indigo-50 transition"
          >
            View
          </Link>
          {!enrolled && onEnroll && (
            <button
              onClick={onEnroll}
              className="flex-1 text-center text-sm bg-indigo-600 text-white font-semibold rounded-lg py-1.5 hover:bg-indigo-700 transition"
            >
              Enroll
            </button>
          )}
          {enrolled && (
            <span className="flex-1 text-center text-sm text-green-600 font-semibold border border-green-200 rounded-lg py-1.5">
              ✓ Enrolled
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper: returns a Tailwind color class based on the subject
const getSubjectColor = (subject) => {
  const colors = {
    Mathematics: "bg-blue-500",
    Science:     "bg-green-500",
    French:      "bg-purple-500",
    Arabic:      "bg-orange-500",
    History:     "bg-red-500",
    Geography:   "bg-teal-500",
  };
  return colors[subject] || "bg-indigo-500";
};

export default CourseCard;
