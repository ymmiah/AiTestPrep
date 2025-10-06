import React from 'react';
import { View } from '../A2App';
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
      ? 'bg-blue-500 text-white shadow'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 active:bg-gray-300 dark:active:bg-slate-600'
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
    { view: 'pronunciation', label: 'Pronunciation', icon: <SoundWaveIcon className="w-5 h-5" /> },
    { view: 'vocabulary', label: 'Vocabulary', icon: <CardStackIcon className="w-5 h-5" /> },
    { view: 'listening', label: 'Listening', icon: <HeadphonesIcon className="w-5 h-5" /> },
    { view: 'grammar', label: 'Grammar', icon: <AcademicCapIcon className="w-5 h-5" /> },
  ];

  const toolsNavItems = [
    { view: 'planner', label: 'Planner', icon: <CalendarDaysIcon className="w-5 h-5" /> },
    { view: 'topics', label: 'Topics', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
  ];

  const profileNavItems = [
      { view: 'profile', label: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
      { view: 'leaderboard', label: 'Leaderboard', icon: <TrophyIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800">
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
            <SparklesIcon className="w-7 h-7" />
            <span>A2 Test Prep</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-6">
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
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gamification</h3>
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
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
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
      <footer className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-800">
        <p>&copy; 2024 AI Studio Builder.</p>
      </footer>
    </aside>
  );
};

export default Sidebar;