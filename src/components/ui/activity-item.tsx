export const ActivityItem = ({
  action,
  user,
  time
}: {
  action: string
  user: string
  time: string
}) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-pink-50 transition-all duration-200 group">
    <div className="flex-shrink-0 mt-1">
      <div className="h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm group-hover:shadow-pink-glow group-hover:scale-125 transition-all duration-300"></div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-800">
        <span className="text-pink-700">{action}</span> by{' '}
        <span className="font-bold text-rose-600">{user}</span>
      </p>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <span>🕐</span> {time}
      </p>
    </div>
  </div>
)