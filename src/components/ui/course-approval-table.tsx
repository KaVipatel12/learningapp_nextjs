// components/admin/course-approval-table.tsx
export const CourseApprovalTable = ({
  courses,
  onApprove,
  onReject
}: {
  courses: Course[]
  onApprove: (courseId: string) => void
  onReject: (courseId: string) => void
}) => (
  <table className="min-w-full divide-y divide-pink-200">
    <thead className="bg-pink-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Title</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Educator</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Actions</th>
      </tr>
    </thead>
    <tbody>
      {courses.map(course => (
        <tr key={course.id}>
          <td className="px-6 py-4">{course.title}</td>
          <td className="px-6 py-4">{course.educator}</td>
          <td className="px-6 py-4 space-x-2">
            <button 
              onClick={() => onApprove(course.id)}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
            >
              Approve
            </button>
            <button 
              onClick={() => onReject(course.id)}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Reject
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)