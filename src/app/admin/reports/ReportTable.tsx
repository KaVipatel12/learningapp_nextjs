'use client';

import Button from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { useNotification } from '@/components/NotificationContext';


const ReportTable = ({ items = [], type, setReportedComments, setReportedCourses, setRestrictedCourses }) => {
  const { showNotification } = useNotification();  
  const handleAction = async (action: string, reportId: string, item) => {
    try {
      let mainActionUrl = '';
      let method = 'POST';
      let body = {};
      let targetId = '';

      // Determine the target ID based on type
      if (type === 'course') {
        targetId = item.courseId?._id;
      } else if (type === 'comment') {
        targetId = item.commentId?._id;
      } else if (type === 'restrictedCourse') {
        targetId = item?._id;
      }

      // First API call - perform the main action
      switch (action) {
        case 'warn':
          mainActionUrl = '/api/admin/warn';
          body = { 
            targetId,
            type,
            userId: item.userId?._id // Include user ID for warning
          };
          break;
        case 'restrict':
          if (type === 'comment') {
            const chapterId = item.chapterId?._id; 
            mainActionUrl = `/api/course/${targetId}/chapters/${chapterId}/comment/deletecomment`;
            method = 'DELETE';
          } else {
            mainActionUrl = `/api/admin/${targetId}/changestatus`;
            body = { courseId: targetId, status: "restricted" };
            method = 'PATCH';
          }
          break;
        case 'unrestrict':
          mainActionUrl = `/api/admin/${targetId}/changestatus`;
          body = { courseId: targetId, status: "approved" }; // Changed from "restricted" to "published"
          method = 'PATCH';
          break;
        default:
          throw new Error('Invalid action');
      }

      // Perform main action
      const actionResponse = await fetch(mainActionUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(method !== 'DELETE' && { body: JSON.stringify(body) }),
      });

      if (!actionResponse.ok) {
        throw new Error('Main action failed');
      }

      // Second API call - delete the report (for all actions except unrestrict)
      if (action !== 'unrestrict') {
        const deleteReportResponse = await fetch(`/api/admin/report/reportaction`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reportId })
        });

        if (!deleteReportResponse.ok) {
          throw new Error('Failed to delete report');
        }
      }

      // Show success message
      showNotification(`Action ${action} completed successfully`, "success");

      // Update local state to remove the item
      const removeItem = (prevItems) => prevItems.filter(i => i._id !== reportId);

      if (type === 'course' && setReportedCourses) {
        setReportedCourses(removeItem);
      } else if (type === 'comment' && setReportedComments) {
        setReportedComments(removeItem);
      } else if (type === 'restrictedCourse' && setRestrictedCourses) {
        setRestrictedCourses(removeItem);
      }

    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      showNotification(`Failed to ${action}`, "error");
    }
  };

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile responsive container - only shows on small screens */}
      <div className="sm:hidden">
        {safeItems?.map((item) => (
          <div key={item?._id} className="p-4 border-b border-gray-200">
            {type === 'course' && (
              <>
                <div className="font-medium text-gray-900">Course: {item?.course}</div>
                <div className="text-gray-500">Reporter: {item?.reporter}</div>
              </>
            )}
            {type === 'comment' && (
              <>
                <div className="font-medium text-gray-900">Comment: {item?.comment}</div>
                <div className="text-gray-500">User: {item?.user}</div>
                <div className="text-gray-500">Reporter: {item?.reporter}</div>
              </>
            )}
            {type === 'restrictedCourse' && (
              <>
                <div className="font-medium text-gray-900">Course: {item?.course}</div>
                <div className="text-gray-500">Reason: {item?.reason}</div>
              </>
            )}
            <div className="mt-3 flex space-x-2">
              {type === 'restrictedCourse' ? (
                <Button
                  onClick={() => handleAction('unrestrict', item?._id , item)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1"
                >
                  Unrestrict
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => handleAction('warn', item?._id , item)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1"
                  >
                    Warn
                  </Button>
                  <Button 
                    onClick={() => handleAction('restrict', item?._id , item)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
                  >
                    {type === 'comment' ? 'Delete' : 'Restrict'}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table - only shows on medium screens and up */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50">
              <tr>
                {type === 'course' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Reporter</th>
                  </>
                )}
                {type === 'comment' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Reporter</th>
                  </>
                )}
                {type === 'restrictedCourse' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Course</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeItems?.map((item) => (
                <tr key={item?._id}>
                  {type === 'course' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"> <Link href={`/course/${item?.courseId?._id}/${item?.chapterId?._id}`}> {item?.courseId?.title} </Link></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item?.userId?.username}</td>
                    </>
                  )}
                  {type === 'comment' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs whitespace-normal">{item?.commentId?.comment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Link href={`/user/profile/${item?.commentId?.userId?._id}`}> {item?.commentId?.userId?.username} </Link></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Link href={`/user/profile/${item?.userId?._id}`}>{item?.userId?.username}</Link></td>
                    </>
                  )}
                  {type === 'restrictedCourse' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"><Link href={`/user/profile/${item?._id}`}>{item?.title}</Link></td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {type === 'restrictedCourse' ? (
                      <Button 
                        onClick={() => handleAction('unrestrict', item?._id, item)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Unrestrict
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleAction('warn', item?._id, item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          Warn
                        </Button>
                        <Button 
                          onClick={() => handleAction('restrict', item?._id, item)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          {type === 'comment' ? 'Delete' : 'Restrict'}
                        </Button>
                      </>
                    )}
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

export default ReportTable;