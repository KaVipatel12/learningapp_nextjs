'use client';

import Button from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { useNotification } from '@/components/NotificationContext';
import { Loader2 } from 'lucide-react';


const ReportTable = ({
  items = [],
  type,
  setReportedComments,
  setReportedCourses,
  setRestrictedCourses,
  loading = false
}) => {
  const { showNotification } = useNotification();
  const [processing, setProcessing] = React.useState<string | null>(null);

const handleAction = async (action: string, reportId: string, item) => {
  setProcessing(reportId);
  try {
    let mainActionUrl = '';
    let method = 'POST';
    let body = {};
    let targetId = '';
    let commentId = '';

    // Determine the target ID based on type
    if (type === 'course') {
      targetId = item.courseId?._id || '';
    } else if (type === 'comment') {
      targetId = item.courseId?._id || '';
      commentId = item.commentId?._id || '';
    } else if (type === 'restrictedCourse') {
      targetId = item._id || '';
    }

    if (action === 'warn') {
      //  Only hit reportaction API with status: "warn"
      const warnResponse = await fetch(`/api/admin/report/reportaction`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId, status: "warn" }) // Send status "warn"
      });

      if (!warnResponse.ok) {
        throw new Error('Failed to send warning');
      }

      showNotification("Warning sent successfully", "success");

    } else {
      //  First API - delete report (not for warn)
      const deleteReportResponse = await fetch(`/api/admin/report/reportaction`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId })
      });

      if (!deleteReportResponse.ok) {
        throw new Error('Failed to update report status');
      }

      //  Then perform the main action
      switch (action) {
        case 'restrict':
          if (type === 'comment') {
            const chapterId = item.chapterId;
            mainActionUrl = `/api/course/${targetId}/chapters/${chapterId}/comment/deletecomment/${commentId}`;
            method = 'DELETE';
          } else {
            mainActionUrl = `/api/admin/${targetId}/changestatus`;
            body = { courseId: targetId, status: "restricted" };
            method = 'PATCH';
          }
          break;
        case 'unrestrict':
          mainActionUrl = `/api/admin/${targetId}/changestatus`;
          body = { courseId: targetId, status: "approved" };
          method = 'PATCH';
          break;
        default:
          throw new Error('Invalid action');
      }

      const actionResponse = await fetch(mainActionUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(method !== 'DELETE' && { body: JSON.stringify(body) }),
      });

      if (!actionResponse.ok) {
        throw new Error('Action failed');
      }
      showNotification(`Action ${action} completed successfully`, "success");
    }

    //  Update local state
    const removeItem = (prevItems) => prevItems.filter(i => i._id !== reportId);

    if (type === 'course' && setReportedCourses) {
      setReportedCourses(removeItem(items));
    } else if (type === 'comment' && setReportedComments) {
      setReportedComments(removeItem(items));
    } else if (type === 'restrictedCourse' && setRestrictedCourses) {
      setRestrictedCourses(removeItem(items));
    }

  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    showNotification(`Failed to ${action}: ${error.message}`, "error");
  } finally {
    setProcessing(null);
  }
};


  const getItemData = (item) => {
    switch (type) {
      case 'course':
        return {
          title: item?.courseId?.title || 'Untitled Course',
          reporter: item?.reporterId?.username || 'Unknown',
          reporterId: item?.reporterId?._id,
          courseId: item?.courseId?._id,
          chapterId: item?.chapterId,
          reason: item?.description || 'No reason provided'
        };
      case 'comment':
        return {
          content: item?.commentId?.comment || '[Comment removed]',
          user: item?.commentId?.userId?.username || 'Unknown',
          userId: item?.commentId?.userId?._id,
          reporter: item?.reporterId?.username || 'Unknown',
          reporterId: item?.reporterId?._id,
          reason: item?.description || 'No reason provided'
        };
      case 'restrictedCourse':
        return {
          title: item?.title || 'Untitled Course',
          educator: item?.educator?.username || 'Unknown',
          educatorId: item?.educator?._id,
          reason: item?.description || 'No reason provided',
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No {type === 'restrictedCourse' ? 'restricted courses' : `${type} reports`} found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile responsive view */}
      <div className="sm:hidden divide-y divide-gray-200">
        {items.map((item) => {
          const data = getItemData(item);
          const isProcessing = processing === item._id;
          
          return (
            <div key={item._id} className="p-4">
              {type === 'course' && (
                <>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Course:</span>
                    <Link 
                      href={data.chapterId ? `/course/${data.courseId}/${data.chapterId}` :`/course/${data.courseId}`}
                      className="ml-1 text-gray-900 hover:text-pink-700"
                    >
                      {data.title}
                    </Link>
                  </div>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Reporter:</span>
                    <Link
                      href={`/user/profile/${data.reporterId}`}
                      className="ml-1 text-gray-700 hover:text-pink-700"
                    >
                      {data.reporter}
                    </Link>
                  </div>
                  <div className="mb-3">
                    <span className="text-pink-600 font-medium">Reason:</span>
                    <span className="ml-1 text-gray-700">{data.reason}</span>
                  </div>
                </>
              )}
              
              {type === 'comment' && (
                <>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Comment:</span>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">
                      {data.content}
                    </p>
                  </div>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Author:</span>
                    <Link
                      href={`/user/profile/${data.userId}`}
                      className="ml-1 text-gray-700 hover:text-pink-700"
                    >
                      {data.user}
                    </Link>
                  </div>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Reporter:</span>
                    <Link
                      href={`/user/profile/${data.reporterId}`}
                      className="ml-1 text-gray-700 hover:text-pink-700"
                    >
                      {data.reporter}
                    </Link>
                  </div>
                  <div className="mb-3">
                    <span className="text-pink-600 font-medium">Reason:</span>
                    <span className="ml-1 text-gray-700">{data.reason}</span>
                  </div>
                </>
              )}
              
              {type === 'restrictedCourse' && (
                <>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Course:</span>
                  <Link href={data._id}> <span className="ml-1 text-gray-900">{data.title}</span> </Link>
                  </div>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Educator:</span>
                    <Link
                      href={`/user/profile/${data.educatorId}`}
                      className="ml-1 text-gray-700 hover:text-pink-700"
                    >
                      {data.educator}
                    </Link>
                  </div>
                  <div className="mb-2">
                    <span className="text-pink-600 font-medium">Reason:</span>
                    <span className="ml-1 text-gray-700">{data.reason}</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-pink-600 font-medium">Restricted On:</span>
                  </div>
                </>
              )}
              
              <div className="flex flex-wrap gap-2">
                {type === 'restrictedCourse' ? (
                  <Button
                    onClick={() => handleAction('unrestrict', item._id, item)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Unrestrict'
                    )}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => handleAction('warn', item._id, item)}
                      disabled={isProcessing}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Warn'
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleAction('restrict', item._id, item)}
                      disabled={isProcessing}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : type === 'comment' ? (
                        'Delete'
                      ) : (
                        'Restrict'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-50">
            <tr>
              {type === 'course' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Reason</th>
                </>
              )}
              {type === 'comment' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Reason</th>
                </>
              )}
              {type === 'restrictedCourse' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Educator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Reason</th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-pink-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const data = getItemData(item);
              const isProcessing = processing === item._id;
              
              return (
                <tr key={item._id}>
                  {type === 'course' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={data.chapterId ? `/course/${data.courseId}/${data.chapterId}` :`/course/${data.courseId}`}
                          className="text-gray-900 hover:text-pink-700 font-medium"
                        >
                          {data.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/user/profile/${data.reporterId}`}
                          className="text-gray-700 hover:text-pink-700"
                        >
                          {data.reporter}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {data.reason}
                      </td>
                    </>
                  )}
                  
                  {type === 'comment' && (
                    <>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-700 bg-gray-50 p-2 rounded">
                          {data.content}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/user/profile/${data.userId}`}
                          className="text-gray-700 hover:text-pink-700"
                        >
                          {data.user}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/user/profile/${data.reporterId}`}
                          className="text-gray-700 hover:text-pink-700"
                        >
                          {data.reporter}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {data.reason}
                      </td>
                    </>
                  )}
                  
                  {type === 'restrictedCourse' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {data.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/user/profile/${data.educatorId}`}
                          className="text-gray-700 hover:text-pink-700"
                        >
                          {data.educator}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {data.reason}
                      </td>
                    </>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {type === 'restrictedCourse' ? (
                      <Button
                        onClick={() => handleAction('unrestrict', item._id, item)}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Unrestrict'
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleAction('warn', item._id, item)}
                          disabled={isProcessing}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Warn'
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleAction('restrict', item._id, item)}
                          disabled={isProcessing}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : type === 'comment' ? (
                            'Delete'
                          ) : (
                            'Restrict'
                          )}
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;