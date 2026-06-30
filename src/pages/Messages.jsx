import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';
import { Mail, CheckCircle, Trash2, MailOpen, Clock, Reply, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Messages = () => {
  const { token } = useSelector(state => state.auth);
  const config = {
    headers: { Authorization: token }
  };
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [messageToReply, setMessageToReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact-messages`, config);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const handleNewMessage = (newMessage) => {
      console.log('Received new message via socket:', newMessage);
      setMessages(prev => [newMessage, ...prev]);
      toast.success('New contact message received');
    };

    socket.on('new_contact_message', handleNewMessage);

    return () => {
      socket.off('new_contact_message', handleNewMessage);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/contact-messages/${id}/read`, {}, config);
      if (response.data.success) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, status: 'read' } : msg
        ));
        toast.success('Message marked as read');
      }
    } catch (error) {
      toast.error('Failed to mark message as read');
    }
  };

  const handleDelete = (id) => {
    setMessageToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/contact-messages/${messageToDelete}`, config);
      if (response.data.success) {
        setMessages(messages.filter(msg => msg.id !== messageToDelete));
        toast.success('Message deleted');
      }
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleReply = (message) => {
    setMessageToReply(message);
    setReplyText('');
    setReplyModalOpen(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    
    setReplying(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/contact-messages/${messageToReply.id}/reply`, {
        replyText,
        email: messageToReply.email,
        subject: messageToReply.subject
      }, config);
      
      if (response.data.success) {
        toast.success('Reply sent successfully');
        setMessages(messages.map(msg => 
          msg.id === messageToReply.id ? { ...msg, status: 'read' } : msg
        ));
        setReplyModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredMessages = messages.filter(msg => {
    const msgDate = new Date(msg.created_at);
    const now = new Date();
    
    if (timeFilter === 'Today') {
      return msgDate.toDateString() === now.toDateString();
    } else if (timeFilter === 'This Week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return msgDate >= startOfWeek;
    } else if (timeFilter === 'This Month') {
      return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
    } else if (timeFilter === 'Custom' && customDateRange.start && customDateRange.end) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);
      end.setHours(23, 59, 59, 999);
      return msgDate >= start && msgDate <= end;
    }
    
    return true;
  });

  return (
    <div className="p-6 bg-slate-50 dark:bg-gray-900 min-h-screen w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="h-6 w-6 text-blue-600" />
              Contact Messages
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage messages from the Contact Us page.</p>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="flex p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm min-w-max">
              {['All Time', 'Today', 'This Week', 'This Month', 'Custom'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                    timeFilter === filter 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {timeFilter === 'Custom' && (
              <div className="flex items-center gap-3 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <input 
                  type="date" 
                  value={customDateRange.start}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-4 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">TO</span>
                <input 
                  type="date" 
                  value={customDateRange.end}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-4 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
            <MailOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No messages yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">When visitors send messages, they will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 transition-all duration-200 ${
                  message.status === 'unread' 
                    ? 'border-l-4 border-l-blue-500 border-gray-100 dark:border-gray-700' 
                    : 'border-gray-100 dark:border-gray-700 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {message.subject || 'No Subject'}
                      {message.status === 'unread' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          New
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">{message.name}</span>
                      <span className="text-gray-400">•</span>
                      <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">{message.email}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    {new Date(message.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm border border-slate-100 dark:border-gray-700">
                  {message.message}
                </div>

                <div className="flex flex-wrap justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleReply(message)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                  {message.status === 'unread' && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Message
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && messageToReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Reply className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Reply to {messageToReply.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {messageToReply.email}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Original Message:</div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">
                  "{messageToReply.message}"
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all resize-none"
                  rows="5"
                  placeholder="Type your reply here..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setReplyModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={replying}
                >
                  Cancel
                </button>
                <button
                  onClick={submitReply}
                  disabled={replying}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70"
                >
                  {replying ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
