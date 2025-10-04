import React from 'react';
import { Notification } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import Toast from './Toast';

interface NotificationContainerProps {
    notifications: Notification[];
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications }) => {
    const { removeNotification } = useNotification();
    
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <Toast
                        key={notification.id}
                        notification={notification}
                        onDismiss={removeNotification}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationContainer;
