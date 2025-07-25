import { UserData } from "@/context/userContext"

export const UserTable = ({
  users,
  onRestrict
}: {
  users : UserData[]
  onRestrict: (userId: string) => void
}) => (
  <table className="min-w-full divide-y divide-pink-200">
    <thead className="bg-pink-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Name</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Email</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase">Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <button 
              onClick={() => onRestrict(user.id)}
              className="text-sm bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700"
            >
              Restrict
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)