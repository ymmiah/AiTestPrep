import React from 'react';
import { Message, Role } from '../types';
import { SparklesIcon } from './IconComponents';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white self-end rounded-br-none'
    : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-100 self-start rounded-bl-none';
  
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex w-full my-2 ${containerClasses}`}>
      <div className={`flex items-start gap-3 max-w-lg`}>
        {!isUser && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <SparklesIcon className="w-6 h-6" />
          </div>
        )}
        <div className={`px-4 py-3 rounded-2xl ${bubbleClasses} shadow-md`}>
          <p className="text-base">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;