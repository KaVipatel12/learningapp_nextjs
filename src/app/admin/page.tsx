"use client"

import React, { useEffect, useState } from 'react';
import { FaUsers, FaBook, FaDollarSign, FaFlag } from 'react-icons/fa';

export default function AdminDashboard(){

     const [ totalUsers , setTotalUsers ] = useState<number>(0); 
     const [ totalCourses , setTotalCourses ] = useState<number>(0); 
     const [ totalReports , setTotalReports ] = useState<number>(0); 
     const [ totalRevenue , setTotalRevenue ] = useState<number>(0); 

       const fetchStats = async  () => {
         try{
             const response = await fetch(`/api/admin/fetchstats`);
             const data = await response.json(); 
             if(response.ok){
                 setTotalUsers(data.totalUsers)
                 setTotalCourses(data.totalCourses)
                 setTotalReports(data.totalReports)
                 setTotalRevenue(120)
             }
         }catch {
           console.log("There is some error")
         }
       }
   
       useEffect(() => {
         fetchStats(); 
       }, [])
 
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<FaUsers className="text-pink-500" size={28} />}
          title="Total Users"
          value={totalUsers}
          change="+12% from last month"
        />
        <StatCard 
          icon={<FaBook className="text-rose-500" size={28} />}
          title="Total Courses"
          value={totalCourses}
          change="+5 new this week"
        />
        <StatCard 
          icon={<FaDollarSign className="text-fuchsia-500" size={28} />}
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+8% from last month"
        />
        <StatCard 
          icon={<FaFlag className="text-amber-500" size={28} />}
          title="Active Reports"
          value={totalReports}
          change="3 new today"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-pink-100 p-8 hover:shadow-card-hover transition-all duration-300">
        <h3 className="text-2xl font-bold text-pink-700 mb-6 flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
          Recent Activity
        </h3>
        <div className="space-y-5">
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
  <div className="bg-white rounded-2xl shadow-card p-6 flex items-start border border-pink-100 hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1">
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
);

const ActivityItem = ({ action, user, time }: { action: string, user: string, time: string }) => (
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
);
