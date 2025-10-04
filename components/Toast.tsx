import React, { useEffect } from 'react';
import { Notification } from '../types';
import { CheckCircleIcon, TrophyIcon, SparklesIcon, XMarkIcon } from './IconComponents';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <SparklesIcon className="w-6 h-6 text-green-500" />,
  info: <CheckCircleIcon className="w-6 h-6 text-blue-500" />,
  achievement: <TrophyIcon className="w-6 h-6 text-yellow-500" />,
};

const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 6000); // 6 seconds auto-dismiss

    return () => {
      clearTimeout(timer);
    };
  }, [notification.id, onDismiss]);

  return (
    <div className="w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in-right">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[notification.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{notification.title}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
            {notification.action && (
                <div className="mt-3">
                    <button
                        onClick={notification.action.onClick}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500"
                    >
                        {notification.action.label}
                    </button>
                </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(notification.id)}
              className="inline-flex text-gray-400 dark:text-gray-500 rounded-md hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
