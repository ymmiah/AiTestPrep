import React, { createContext, useContext } from 'react';
// FIX: Import `NotificationAction` to correctly type the `addNotification` function.
import { Notification, NotificationAction } from '../types';

interface NotificationContextType {
  // FIX: Updated the type to match the implementation in App.tsx. Callers should not provide
  // an `onClick` handler for actions, as it's added centrally. This fixes the type error
  // in components that call `addNotification` with an action, such as GrammarQuiz.tsx.
  addNotification: (notification: Omit<Notification, 'id' | 'action'> & { action?: Omit<NotificationAction, 'onClick'> }) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
