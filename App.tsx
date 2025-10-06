import React, { useState, useEffect, useCallback } from 'react';
import ConversationSimulator from './components/ConversationSimulator';
import ThemeSwitcher from './components/ThemeSwitcher';
import StudyPlanCreator from './components/StudyPlanCreator';
import TopicGenerator from './components/TopicGenerator';
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
import { Notification, NotificationAction } from './types';
import PronunciationPractice from './components/PronunciationPractice';

export type View = 'dashboard' | 'simulator' | 'vocabulary' | 'listening' | 'grammar' | 'planner' | 'topics' | 'profile' | 'leaderboard' | 'mockTest' | 'pronunciation';

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme) return storedTheme;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });
  
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);

    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

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
        return <MockTest />;
      case 'planner':
        return <StudyPlanCreator />;
      case 'topics':
        return <TopicGenerator />;
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
    topics: 'Topic Generator',
    profile: 'My Profile',
    leaderboard: 'Leaderboard'
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      <div className="h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
        <NotificationContainer notifications={notifications} />
        <div className="flex h-full">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          
          <div className="flex-1 flex flex-col h-full">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 md:py-6 md:px-8 bg-white dark:bg-slate-900">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {viewTitles[activeView]}
                </h1>
              </div>
              <div className="flex items-center">
                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
              {renderView()}
            </main>
          </div>
          
          <BottomNav activeView={activeView} setActiveView={setActiveView} />
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default App;