import React, { useState, useCallback, useEffect } from 'react';
import ConversationSimulator from './components/ConversationSimulator';
import StudyPlanCreator from './components/StudyPlanCreator';
import TopicPractice from './components/TopicPractice';
import VocabularyBuilder from './components/VocabularyBuilder';
import ListeningPractice from './components/ListeningPractice';
import Dashboard from './components/Dashboard';
import GrammarHub from './components/GrammarHub';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import MockTest from './components/MockTest';
import NotificationContainer from './components/NotificationContainer';
import { NotificationContext } from './contexts/NotificationContext';
// FIX: Moved View type to types.ts and import it here.
import { Notification, NotificationAction, View } from './types';
import PronunciationPractice from './components/PronunciationPractice';
import ModuleLayout from './components/ModuleLayout';
import { getUserProfile } from './services/geminiService';

// FIX: Moved View type to types.ts to be shared across components.

interface A2AppProps {
  onGoBack: () => void;
  theme: string;
  toggleTheme: () => void;
  initialView?: View;
}

const A2App: React.FC<A2AppProps> = ({ onGoBack, theme, toggleTheme, initialView }) => {
  const [activeView, setActiveView] = useState<View>(initialView || 'dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
      const fetchDevMode = async () => {
          const profile = await getUserProfile();
          setIsDeveloperMode(profile.isDeveloperMode || false);
      };
      fetchDevMode();
  }, [activeView]); // Re-check when view changes, e.g., after visiting profile

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'action'> & { action?: Omit<NotificationAction, 'onClick'> }
  ) => {
    const id = Date.now().toString() + Math.random().toString();
    
    let actionWithHandler: NotificationAction | undefined;
    if (notification.action) {
      actionWithHandler = {
        ...notification.action,
        onClick: () => {
          setActiveView('profile');
          removeNotification(id);
        }
      };
    }

    setNotifications(prev => [...prev, { ...notification, id, action: actionWithHandler }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'simulator':
        return <ConversationSimulator />;
      case 'vocabulary':
        return <VocabularyBuilder />;
      case 'listening':
        return <ListeningPractice />;
      case 'grammar':
        return <GrammarHub />;
      case 'pronunciation':
        return <PronunciationPractice />;
       case 'mockTest':
        return <MockTest setActiveView={setActiveView} />;
      case 'planner':
        return <StudyPlanCreator />;
      case 'topicPractice':
        return <TopicPractice />;
      case 'profile':
        return <Profile />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  const viewTitles: { [key in View]: string } = {
    dashboard: 'Dashboard',
    simulator: 'Conversation Practice',
    vocabulary: 'Vocabulary Builder',
    listening: 'Listening Practice',
    grammar: 'Grammar Hub',
    pronunciation: 'Pronunciation Practice',
    mockTest: 'Mock A2 Exam',
    planner: 'Study Planner',
    topicPractice: 'Topic Practice',
    profile: 'My Profile',
    leaderboard: 'Leaderboard'
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      <div className="h-full bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans animate-fade-in">
        <NotificationContainer notifications={notifications} />
        <div className="flex h-full">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          
          <ModuleLayout
            title={viewTitles[activeView]}
            onGoBack={onGoBack}
            theme={theme}
            toggleTheme={toggleTheme}
          >
            <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
              {renderView()}
            </div>
          </ModuleLayout>
          
          <BottomNav activeView={activeView} setActiveView={setActiveView} />

          {isDeveloperMode && (
            <div className="fixed bottom-20 md:bottom-2 left-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded z-50 pointer-events-none">
                [DEV: {activeView}]
            </div>
          )}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default A2App;