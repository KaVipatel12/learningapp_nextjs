import React from 'react';
import { FaUsers, FaBook, FaDollarSign, FaFlag } from 'react-icons/fa';

const AdminDashboard = async () => {
  // Fetch stats from your API
  const stats = {
    totalUsers: 1243,
    totalCourses: 287,
    totalRevenue: 12500,
    totalReports: 42,
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-pink-700 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FaUsers className="text-pink-500" size={24} />}
          title="Total Users"
          value={stats.totalUsers}
          change="+12% from last month"
        />
        <StatCard 
          icon={<FaBook className="text-pink-500" size={24} />}
          title="Total Courses"
          value={stats.totalCourses}
          change="+5 new this week"
        />
        <StatCard 
          icon={<FaDollarSign className="text-pink-500" size={24} />}
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+8% from last month"
        />
        <StatCard 
          icon={<FaFlag className="text-pink-500" size={24} />}
          title="Active Reports"
          value={stats.totalReports}
          change="3 new today"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-pink-700 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem 
            action="New course submitted"
            user="John Doe"
            time="2 hours ago"
          />
          <ActivityItem 
            action="User restricted"
            user="Sarah Smith"
            time="5 hours ago"
          />
          <ActivityItem 
            action="Comment reported"
            user="Mike Johnson"
            time="1 day ago"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, change }: { icon: React.ReactNode, title: string, value: string | number, change: string }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
    <div className="mr-4">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-pink-600">{value}</p>
      <p className="text-xs text-gray-400">{change}</p>
    </div>
  </div>
);

const ActivityItem = ({ action, user, time }: { action: string, user: string, time: string }) => (
  <div className="flex items-center ">
    <div className="h-2 w-2 rounded-full bg-pink-500 mr-3"></div>
    <div>
      <p className="text-sm">
        <span className="font-medium">{action}</span> by <span className="text-pink-600">{user}</span>
      </p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  </div>
);

export default AdminDashboard;