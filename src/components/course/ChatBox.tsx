"use client"

import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: "John", text: "Has anyone completed the assignment?", time: "10:30 AM" },
    { id: 2, user: "You", text: "I'm working on it now", time: "10:32 AM" }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: "You",
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold">Course Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.user === "You" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-lg px-4 py-2 ${
              message.user === "You" 
                ? "bg-purple-100 text-purple-900" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {message.user !== "You" && (
                <p className="font-medium text-sm">{message.user}</p>
              )}
              <p>{message.text}</p>
              <p className="text-xs text-gray-500 mt-1">{message.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-purple-600 text-white rounded-md p-2 hover:bg-purple-700 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;