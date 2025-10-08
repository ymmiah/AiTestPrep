import React from 'react';
// FIX: The 'View' type is now imported from '../types' instead of '../A2App'.
import { View } from '../types';
import { HomeIcon, ChatBubbleIcon, CardStackIcon, HeadphonesIcon, AcademicCapIcon, CalendarDaysIcon, QuestionMarkCircleIcon, SparklesIcon, UserCircleIcon, TrophyIcon, ClipboardDocumentCheckIcon, SoundWaveIcon } from './IconComponents';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  viewName: View;
  label: string;
  icon: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
}> = ({ viewName, label, icon, activeView, setActiveView }) => {
  const isActive = activeView === viewName;
  const buttonClass = `
    flex items-center w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors duration-200 select-none
    ${isActive
      ? 'bg-indigo-600 text-white shadow-md'
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 active:bg-slate-300 dark:active:bg-slate-700'
    }
  `;

  return (
    <li>
      <button onClick={() => setActiveView(viewName)} className={buttonClass}>
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </button>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const mainNavItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { view: 'simulator', label: 'Conversation', icon: <ChatBubbleIcon className="w-5 h-5" /> },
    { view: 'mockTest', label: 'Mock Exam', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" /> },
    { view: 'topicPractice', label: 'Topic Practice', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
    { view: 'pronunciation', label: 'Pronunciation', icon: <SoundWaveIcon className="w-5 h-5" /> },
    { view: 'vocabulary', label: 'Vocabulary', icon: <CardStackIcon className="w-5 h-5" /> },
    { view: 'listening', label: 'Listening', icon: <HeadphonesIcon className="w-5 h-5" /> },
    { view: 'grammar', label: 'Grammar', icon: <AcademicCapIcon className="w-5 h-5" /> },
  ];

  const toolsNavItems = [
    { view: 'planner', label: 'Study Planner', icon: <CalendarDaysIcon className="w-5 h-5" /> },
  ];

  const profileNavItems = [
      { view: 'profile', label: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
      { view: 'leaderboard', label: 'Leaderboard', icon: <TrophyIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
            <SparklesIcon className="w-7 h-7" />
            <span>A2 Test Prep</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <ul className="space-y-2">
          {mainNavItems.map(item => (
            <NavItem
              key={item.view}
              viewName={item.view as View}
              label={item.label}
              icon={item.icon}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          ))}
        </ul>
        <div>
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gamification</h3>
            <ul className="mt-2 space-y-2">
                {profileNavItems.map(item => (
                    <NavItem
                    key={item.view}
                    viewName={item.view as View}
                    label={item.label}
                    icon={item.icon}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    />
                ))}
            </ul>
        </div>
         <div>
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</h3>
            <ul className="mt-2 space-y-2">
                {toolsNavItems.map(item => (
                    <NavItem
                    key={item.view}
                    viewName={item.view as View}
                    label={item.label}
                    icon={item.icon}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    />
                ))}
            </ul>
        </div>
      </nav>
      <footer className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <p>&copy; 2024 AI Studio Builder.</p>
      </footer>
    </aside>
  );
};

export default Sidebar;