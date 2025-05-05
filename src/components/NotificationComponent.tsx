'use client';

import React from 'react';
import { useNotification } from './NotificationContext';

const NotificationComponent = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`mb-2 px-4 py-2 rounded-md text-white shadow-md max-w-sm text-center transition-all 
              transform duration-300 ease-in-out animate-fadeIn 
              ${
                notification.type === 'success'
                  ? 'bg-black bg-opacity-80'
                  : notification.type === 'error'
                  ? 'bg-black bg-opacity-80'
                  : 'bg-black bg-opacity-80'
              }`}
          onClick={() => removeNotification(notification.id)}
          role="alert"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;