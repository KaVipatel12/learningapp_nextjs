// app/admin/courses/CourseApprovalTable.tsx
'use client';

import { useNotification } from '@/components/NotificationContext';
import Button from '@/components/ui/button';
import { Course } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import React from 'react';

interface CourseApprovalTableProps {
  courses: Course[];
  fetchPendingCourses: () => Promise<void>; 
}

const CourseApprovalTable = ({ courses , fetchPendingCourses } : CourseApprovalTableProps) => {

    const { showNotification } = useNotification();
  const router = useRouter();  

  const handleStatusChange = async (courseId: string , status : string ) => {
     try {
        const response = await fetch(`/api/admin/${courseId}/changestatus`, {
        method: 'PATCH',
        body: JSON.stringify({status , courseId}),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to update course', "error");
        return;
    } 
    
    showNotification('Status updated successfully', "success");
    await fetchPendingCourses(); 
    }catch {
        showNotification('Failed to update course status', "error");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Container with horizontal scrolling */}
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Course Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Educator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses?.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.educatorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.date ? course.date.toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs whitespace-normal">{course.description?.slice(0 , 200)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      onClick={() => handleStatusChange(course._id!, "approved")}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange(course._id! , "rejected")}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => router.push(`/course/${course._id}`)}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      Preview
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseApprovalTable;