import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  
  const { user, token, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Fetch initial notifications
    fetchNotifications();

    // Setup Socket.IO
    const socket = io('http://localhost:5000');
    
    // Join user's room
    socket.emit('join', user.id);

    // Listen for new notifications
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Optional: Show a browser notification or toast here
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.notifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: token }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: token }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'error': return <AlertTriangle size={16} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm transform translate-x-1 -translate-y-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex gap-3 relative group ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 pr-6">
                      <h4 className={`text-sm ${!notification.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {!notification.is_read && (
                      <span className="absolute right-4 top-6 w-2 h-2 bg-blue-500 rounded-full group-hover:hidden"></span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
