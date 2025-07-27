"use client"

import { useCallback, useEffect, useState } from 'react';
import { Send, MessageSquare, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useNotification } from '../NotificationContext';
import { useUser } from '@/context/userContext';
import LoadingSpinner from '../LoadingSpinner';
import ReportToggle from './ReportButton';

interface Message {
  id: string | number;
  _id?: string;
  user: string;
  username?: string;
  text: string;
  time: string;
  updatedAt?: string;
  userId?: string;
  courseId?: string;
  isOwner?: boolean;
  isEducator?: boolean;
}

interface ChatBoxProps {
  isOwner?: boolean;
  courseOwnerId?: string;
}

const ChatBox = ({ isOwner = false, courseOwnerId }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showNotification } = useNotification();
  const [commentLoading, setCommentLoading] = useState(true);
  const { courseId, chapterId } = useParams(); 
  const { user } = useUser();

  const transformCommentToMessage = useCallback((comment): Message => {
    const isCurrentUser = user && comment.userId && comment.userId._id === user._id;
    const isCommenterEducator = comment.userId?.role === 'educator';
    const isCourseOwner = user?._id === courseOwnerId;
      
    return {
      id: comment._id,
      _id: comment._id,
      user: isCurrentUser ? "You" : comment.userId?.username || 'Educator',
      username: comment.userId?.username,
      text: comment.comment,
      time: new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: comment.updatedAt 
        ? new Date(comment.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : undefined,
      userId: comment.userId?._id,
      courseId: comment.courseId?._id,
      isOwner: isCourseOwner,
      isEducator: isCommenterEducator
    };
  }, [user, courseOwnerId]);

  const fetchComments = useCallback(async () => {
    setCommentLoading(true);
    try {
      const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}/comment`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      if (data.comments) {
        console.log(data.comments)
        const transformedMessages = data.comments.map(transformCommentToMessage);
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      showNotification("Failed to fetch comments", "error");
    } finally {
      setCommentLoading(false);
    }
  }, [courseId, chapterId, transformCommentToMessage, showNotification]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const tempId = Date.now();
      const optimisticMessage: Message = {
        id: tempId,
        user: "You",
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: user?._id,
        isEducator: user?.role === 'educator'
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');

      const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}/comment/addcomment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      const data = await response.json();
      if (data.comment) {
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== tempId),
          transformCommentToMessage(data.comment)
        ]);
      }

      showNotification("Comment submitted successfully", "success");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      showNotification(
        error instanceof Error ? error.message : "Failed to submit comment", 
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingId(message.id);
    setEditText(message.text);
  };

  const handleUpdateMessage = async () => {
    if (!editText.trim() || !editingId) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}/comment/editcomment/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: editText
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      setMessages(prev => prev.map(msg => 
        msg.id === editingId ? { 
          ...msg, 
          text: editText,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : msg
      ));
      setEditingId(null);
      showNotification("Comment updated successfully", "success");
    } catch (error) {
      console.error("Error updating message:", error);
      showNotification("Failed to update comment", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMessage = async (messageId: string | number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}/comment/deletecomment/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      showNotification("Comment deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting message:", error);
      showNotification("Failed to delete comment", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = (message: Message) => {
    return user && message.userId === user._id;
  };
  
  const canDelete = (message: Message) => {
    return isOwner || 
           (user && message.userId === user._id) || 
           user?.role === 'admin';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] flex flex-col">
      <div className="p-4 border-b border-gray-200 items-center gap-2 flex justify-between">
        <div className='flex justify-center items-center gap-2'>
          <MessageSquare className="h-5 text-purple-600" />
          <h3 className="font-semibold">Course Chat</h3>
        </div>
        <button 
          className="px-4 py-1 text-white bg-pink-600 rounded flex items-center gap-1 hover:bg-pink-700 transition-colors disabled:opacity-50" 
          onClick={fetchComments}
          disabled={commentLoading}
        >
          <RefreshCw className={`h-4 w-4 ${commentLoading ? 'animate-spin' : ''}`} /> 
          Refresh
        </button>
      </div>

      {commentLoading ? (
        <LoadingSpinner height={"h-[400px]"} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map(message => (
                <div key={message.id} className={`flex ${message.user === "You" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-lg px-4 py-2 relative group ${
                    message.user === "You" 
                      ? "bg-purple-100 text-purple-900" 
                      : message.isEducator 
                        ? "bg-blue-50 border border-blue-200 text-blue-900" 
                        : "bg-gray-100 text-gray-800"
                  }`}>
                    {message.user !== "You" && (
                      <p className="font-medium text-sm">
                        {message.user}
                        {message.isEducator && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Educator
                          </span>
                        )}
                        {message.isOwner && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Owner
                          </span>
                        )}
                      </p>
                    )}
                    
                    {editingId === message.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          disabled={isUpdating}
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                            disabled={isUpdating}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleUpdateMessage}
                            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 flex items-center gap-1 disabled:opacity-50"
                            disabled={isUpdating || !editText.trim()}
                          >
                            {isUpdating ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Updating...
                              </>
                            ) : 'Update'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="pr-12">
                          <p>{message.text}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <span>{message.time}</span>
                            {message.updatedAt && message.updatedAt !== message.time && (
                              <>
                                <span>•</span>
                                <span className="italic">edited {message.updatedAt}</span>
                              </>
                            )}
                          </div>
                        </div>

                    <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 flex gap-1 transition-opacity">
                      {canEdit(message) && (
                        <button 
                          onClick={() => handleEditMessage(message)}
                          className="text-gray-500 hover:text-purple-600 p-1 bg-white bg-opacity-70 rounded"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      )}
                      {canDelete(message) && (
                        <button 
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-gray-500 hover:text-red-600 p-1 bg-white bg-opacity-70 rounded disabled:opacity-50"
                          disabled={isDeleting}
                          title="Delete"
                        >
                          {isDeleting ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      )}
                      {/* Add Report Button */}
                      {message.user !== "You" && (
                        <ReportToggle
                          commentId={message.id.toString()}
                          chapterId={chapterId}
                          userId={message.userId}
                          courseId={courseId} 
                          type="comment"
                          buttonProps={{
                            className: "text-gray-500 hover:text-red-500 p-1 bg-white bg-opacity-70 rounded",
                            title: "Report"
                          }}
                        />
                      )}
                    </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                disabled={isSubmitting}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSubmitting || !newMessage.trim()}
                className={`bg-purple-600 text-white rounded-md p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  !isSubmitting && newMessage.trim() ? 'hover:bg-purple-700' : ''
                }`}
              >
                {isSubmitting ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </> 
      )}
    </div>
  );
};

export default ChatBox;