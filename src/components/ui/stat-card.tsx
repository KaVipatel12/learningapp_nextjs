// components/dashboard/stat-card.tsx
export const StatCard = ({
  icon,
  title,
  value,
  change
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  change: string
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-start">
    <div className="mr-4 text-pink-500">{icon}</div>
    <div>
      <p className="text-sm text-pink-600">{title}</p>
      <p className="text-2xl font-bold text-pink-800">{value}</p>
      <p className="text-xs text-pink-400">{change}</p>
    </div>
  </div>
)