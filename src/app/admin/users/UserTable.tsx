'use client';

import { useNotification } from '@/components/NotificationContext';
import Button from '@/components/ui/button';
import { UserData } from '@/context/userContext';
import Link from 'next/link';
import React from 'react';


const UserTable = ({ users = [], type, setUsers, setRestrictedUsers , fetchUsers }) => {

  const { showNotification } = useNotification();
  const handleAction = async (action: string, userId: string) => {
    try {
      let apiUrl = '';
      const method = 'PATCH';
      let body = {};

      switch (action) {
        case 'warn':
          apiUrl = `/api/admin/users/useractions`;
          body = { userId , status : 1, type : "warn" }
          break;
        case 'restrict':
          apiUrl = `/api/admin/users/useractions`;
          body = { userId , status : 1 }
          break;
          case 'unrestrict':
            apiUrl = `/api/admin/users/useractions`;
            body = { userId , status : 0 }
          break;
        default:
          throw new Error('Invalid action');
      }

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`${action} action failed`);
      }

      showNotification(`User ${action}ed successfully`, "success");
      await fetchUsers(); 
      // Update local state without refetching
      if (action === 'warn') {
        // Increment warning count
        if (setUsers) {
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user._id === userId 
                ? { ...user, warnings: (user.warnings || 0) + 1 } 
                : user
            )
          );
        }
      } else if (action === 'restrict') {
        // Move user to restricted list
        if (setUsers && setRestrictedUsers) {
          setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
          setRestrictedUsers(prevRestricted => {
            const userToRestrict = users.find((user : UserData) => user._id === userId);
            return userToRestrict 
              ? [...prevRestricted, { ...userToRestrict, restrictedSince: new Date().toISOString() }] 
              : prevRestricted;
          });
        }
      } else if (action === 'unrestrict') {
        // Move user back to normal list
        if (setUsers && setRestrictedUsers) {
          setRestrictedUsers(prevRestricted => prevRestricted.filter(user => user._id !== userId));
          setUsers(prevUsers => {
            const userToUnrestrict = users?.find((user : UserData) => user._id === userId);
            return userToUnrestrict 
              ? [...prevUsers, { ...userToUnrestrict, restrictedSince: undefined }] 
              : prevUsers;
          });
        }
      }

    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      showNotification(`Failed to ${action} user`, "error");
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile responsive container */}
      <div className="sm:hidden">
        {safeUsers?.map((user) => (
          <div key={user?._id} className="p-4 border-b border-gray-200">
            <Link href={`/user/profile/${user._id}`}> <div className="font-medium text-gray-900">Username: {user?.username}</div> </Link>
            <div className="text-gray-500">Email: {user?.email}</div>
            <div className="text-gray-500">Joined: {new Date(user?.date).toLocaleDateString()}</div>
            {type !== 'restricted' && (
              <div className="text-gray-500">Warnings: {user?.warnings || 0}</div>
            )}
            {type === 'restricted' && (
              <div className="text-gray-500">Restricted Since: {new Date(user?.restrictedSince).toLocaleDateString()}</div>
            )}

            <div className="mt-3 flex space-x-2">
              {type === 'restricted' ? (
                <Button
                  onClick={() => handleAction('unrestrict', user?._id)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1"
                >
                  Unrestrict
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => handleAction('warn', user?._id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1"
                  >
                    Warn
                  </Button>
                  <Button 
                    onClick={() => handleAction('restrict', user?._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
                  >
                    Restrict
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Joined</th>
                {type !== 'restricted' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Warnings</th>
                )}
                {type === 'restricted' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Restricted Since</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-pink-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeUsers?.map((user) => (
                <tr key={user?._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                   <Link href={`/user/profile/${user._id}`}> {user?.username} </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user?.date).toLocaleDateString()}
                  </td>
                  {type !== 'restricted' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.warnings || 0}
                    </td>
                  )}
                  {type === 'restricted' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user?.restrictedSince).toLocaleDateString()}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {type === 'restricted' ? (
                      <Button
                        onClick={() => handleAction('unrestrict', user?._id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Unrestrict
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleAction('warn', user?._id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          Warn
                        </Button>
                        <Button 
                          onClick={() => handleAction('restrict', user?._id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Restrict
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

export default UserTable;