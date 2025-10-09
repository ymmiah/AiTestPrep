
import React from 'react';
// FIX: The 'View' type is now imported from '../types' instead of '../A2App'.
import { View, Module } from '../types';
// FIX: Replaced SoundWaveIcon with QuestionMarkCircleIcon to add the "Topic Practice" link.
import { HomeIcon, ChatBubbleIcon, CardStackIcon, UserCircleIcon, ClipboardDocumentCheckIcon, QuestionMarkCircleIcon } from './IconComponents';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onNavigateToModule: (module: Module) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const buttonClass = `
    flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 focus:outline-none select-none active:bg-slate-100 dark:active:bg-slate-800
    ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300'}
  `;

  return (
    <button onClick={onClick} className={buttonClass}>
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, onNavigateToModule }) => {
  // FIX: Replaced "Pronounce" with "Topics" to make the Topic Practice module accessible from the main mobile navigation.
  const navItems = [
    { type: 'view', key: 'dashboard', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
    { type: 'view', key: 'simulator', label: 'Speak', icon: <ChatBubbleIcon className="w-6 h-6" /> },
    { type: 'view', key: 'mockTest', label: 'Test', icon: <ClipboardDocumentCheckIcon className="w-6 h-6" /> },
    { type: 'view', key: 'topicPractice', label: 'Topics', icon: <QuestionMarkCircleIcon className="w-6 h-6" /> },
    { type: 'view', key: 'vocabulary', label: 'Words', icon: <CardStackIcon className="w-6 h-6" /> },
    { type: 'module', key: 'profile', label: 'Profile', icon: <UserCircleIcon className="w-6 h-6" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 shadow-t-lg">
      <div className="flex justify-around">
        {navItems.map(item => (
          <NavItem
            key={item.key}
            label={item.label}
            icon={item.icon}
            isActive={item.type === 'view' && activeView === item.key}
            onClick={() => {
                if (item.type === 'module') {
                    onNavigateToModule(item.key as Module);
                } else {
                    setActiveView(item.key as View);
                }
            }}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;