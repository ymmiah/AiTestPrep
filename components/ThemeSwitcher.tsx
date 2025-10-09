import React from 'react';
import { Theme } from '../types';
import { SunIcon, MoonIcon } from './IconComponents';

interface ThemeSwitcherProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
    const handleThemeChange = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('oceanic');
        } else {
            setTheme('light');
        }
    };

    const getNextThemeIcon = () => {
        if (theme === 'light') {
            // Currently light, next is dark
            return <MoonIcon className="w-5 h-5" />;
        } else if (theme === 'dark') {
            // Currently dark, next is oceanic
            return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.25a.75.75 0 01.75.75v.512c1.02.233 1.96.63 2.805 1.154a.75.75 0 01.44 1.226l-.372.645a.75.75 0 01-1.226-.442A6.964 6.964 0 0012.75 5.25v-.512a.75.75 0 01-.75-.75zM12 21.75a.75.75 0 01-.75-.75v-.512a7.01 7.01 0 00-2.805-1.154.75.75 0 01-.44-1.226l.372-.645a.75.75 0 011.226.442A5.51 5.51 0 0111.25 19.5v.512a.75.75 0 01.75.75zM4.62 6.202a.75.75 0 011.06 0l.373.373a.75.75 0 01-1.06 1.06l-.373-.373a.75.75 0 010-1.06zM17.938 16.878a.75.75 0 011.06 0l.373.373a.75.75 0 01-1.06 1.06l-.373-.373a.75.75 0 010-1.06zM21.75 12a.75.75 0 01-.75.75h-.512a7.01 7.01 0 01-1.154 2.805.75.75 0 01-1.226.44l-.645-.372a.75.75 0 01.44-1.226A5.51 5.51 0 0019.5 12.75h.512a.75.75 0 01.75-.75zM2.25 12a.75.75 0 01.75-.75h.512c.233-1.02.63-1.96 1.154-2.805a.75.75 0 011.226-.44l.645.372a.75.75 0 01-.44 1.226A5.51 5.51 0 004.5 11.25H3a.75.75 0 01-.75.75z" /></svg>;
        } else {
            // Currently oceanic, next is light
            return <SunIcon className="w-5 h-5" />;
        }
    };

    const getAriaLabel = () => {
        if (theme === 'light') return 'Switch to Midnight theme';
        if (theme === 'dark') return 'Switch to Oceanic theme';
        return 'Switch to Default theme';
    };

    return (
        <button
            onClick={handleThemeChange}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-all duration-200 active:scale-90"
            aria-label={getAriaLabel()}
        >
            {getNextThemeIcon()}
        </button>
    );
};

export default ThemeSwitcher;
