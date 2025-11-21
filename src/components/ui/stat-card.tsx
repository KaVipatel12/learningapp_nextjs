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
  <div className="bg-white rounded-2xl shadow-card p-6 flex items-start border border-pink-100 hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1 animate-fade-in">
    <div className="mr-5 p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-1">
        {value}
      </p>
      <p className="text-xs text-gray-500 font-medium">{change}</p>
    </div>
  </div>
)