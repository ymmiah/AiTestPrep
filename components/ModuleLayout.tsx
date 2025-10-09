import React from 'react';
import { ArrowLeftIcon } from './IconComponents';
import { Theme } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

interface ModuleLayoutProps {
    title: string;
    onGoBack: () => void;
    children: React.ReactNode;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ModuleLayout: React.FC<ModuleLayoutProps> = ({ title, onGoBack, children, theme, setTheme }) => {
    return (
        <div className="flex-1 flex flex-col h-full">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800/80 md:py-6 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onGoBack} 
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 active:bg-slate-300 dark:active:bg-slate-700 transition-colors"
                        aria-label="Back"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {title}
                    </h1>
                </div>
                <ThemeSwitcher theme={theme} setTheme={setTheme} />
            </header>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default ModuleLayout;