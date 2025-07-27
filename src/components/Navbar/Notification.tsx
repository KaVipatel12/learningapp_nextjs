'use client';
import { Bell, Loader2, Check, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function NotificationDropdown({ user }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Fetch notifications every 5 minutes
    const interval = setInterval(() => {
      if (user) {
        fetchNotifications();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    console.log("fetching");
    try {
      const response = await fetch('/api/notification/fetchnotification');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.msg);
        setUnreadCount(data?.msg?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId) => {
    console.log(notificationId);
    try {
      const response = await fetch(`/api/notification/deletenotification/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(notifications.filter(n => n._id !== notificationId));
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        className="text-rose-800 hover:text-rose-600 transition relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {notificationsOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="py-1 max-h-96 overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-100 bg-pink-50 text-sm font-medium text-rose-800 flex items-center justify-between">
              <span>Notifications</span>
              <button
                onClick={handleRefresh}
                className={`text-rose-600 hover:text-rose-800 transition ${refreshing ? 'animate-spin' : ''}`}
                disabled={refreshing}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            {loadingNotifications ? (
              <div className="px-4 py-4 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
              </div>
            ) : notifications?.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500 text-center">
                No new notifications
              </div>
            ) : (
              notifications?.map((notification) => (
                <div key={notification._id} className="border-b border-gray-100 last:border-b-0 group relative">
                  <div className="flex items-start">
                    {notification.link ? (
                      <Link 
                        href={notification.link}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 transition flex-1"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        {notification.message}
                      </Link>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-700 flex-1">
                        {notification.message}
                      </div>
                    )}
                  </div>
                  {/* Tick button positioned below and always visible on mobile */}
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="absolute bottom-1 right-2 px-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition text-rose-600 hover:text-rose-800"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}