// components/admin/report-table.tsx
export const ReportTable = ({
  reports,
  onAction
}: {
  reports: Report[]
  onAction: (action: string, reportId: string) => void
}) => (
  <table className="min-w-full divide-y divide-pink-200">
    <thead className="bg-pink-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Content</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Reporter</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Actions</th>
      </tr>
    </thead>
    <tbody>
      {reports.map(report => (
        <tr key={report.id}>
          <td className="px-6 py-4">{report.content}</td>
          <td className="px-6 py-4">{report.reporter}</td>
          <td className="px-6 py-4 space-x-2">
            <button 
              onClick={() => onAction('warn', report.id)}
              className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
            >
              Warn
            </button>
            <button 
              onClick={() => onAction('delete', report.id)}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)