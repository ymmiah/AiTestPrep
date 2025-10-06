import React from 'react';
import { View } from '../A2App';
import { HomeIcon, ChatBubbleIcon, CardStackIcon, UserCircleIcon, ClipboardDocumentCheckIcon, SoundWaveIcon } from './IconComponents';

interface BottomNavProps {
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
    flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 focus:outline-none select-none active:bg-gray-100 dark:active:bg-slate-800
    ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300'}
  `;

  return (
    <button onClick={() => setActiveView(viewName)} className={buttonClass}>
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { view: 'dashboard', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
    { view: 'simulator', label: 'Speak', icon: <ChatBubbleIcon className="w-6 h-6" /> },
    { view: 'mockTest', label: 'Test', icon: <ClipboardDocumentCheckIcon className="w-6 h-6" /> },
    { view: 'pronunciation', label: 'Pronounce', icon: <SoundWaveIcon className="w-6 h-6" /> },
    { view: 'vocabulary', label: 'Words', icon: <CardStackIcon className="w-6 h-6" /> },
    { view: 'profile', label: 'Profile', icon: <UserCircleIcon className="w-6 h-6" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-t-lg">
      <div className="flex justify-around">
        {navItems.map(item => (
          <NavItem
            key={item.view}
            viewName={item.view as View}
            label={item.label}
            icon={item.icon}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;