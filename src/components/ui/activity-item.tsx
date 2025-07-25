export const ActivityItem = ({
  action,
  user,
  time
}: {
  action: string
  user: string
  time: string
}) => (
  <div className="flex items-center py-2">
    <div className="h-2 w-2 rounded-full bg-pink-500 mr-3"></div>
    <div>
      <p className="text-sm">
        <span className="font-medium">{action}</span> by{' '}
        <span className="text-pink-600">{user}</span>
      </p>
      <p className="text-xs text-pink-400">{time}</p>
    </div>
  </div>
)