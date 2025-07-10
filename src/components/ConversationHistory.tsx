import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';

interface ConversationHistoryProps {
  messages: Message[];
  userName: string;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  userName
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Ready to start practicing?</p>
          <p className="text-sm mt-2">Click the microphone to begin your conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white text-gray-800 shadow-md'
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 mt-0.5" />
                ) : (
                  <Bot className="w-5 h-5 mt-0.5 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium opacity-75">
                    {message.sender === 'user' ? userName : 'Emma (AI Tutor)'}
                  </span>
                  <span className="text-xs opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.feedback && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Tip:</strong> {message.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};