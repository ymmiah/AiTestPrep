import React, { useState, useEffect } from 'react';
import A2App from './A2App';
import LandingPage from './components/LandingPage';
import IELTSPrep from './components/IELTSPrep';

type Module = 'landing' | 'a2' | 'ielts';

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
    
    const [currentModule, setCurrentModule] = useState<Module>('landing');

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

    const renderModule = () => {
        switch(currentModule) {
            case 'a2':
                return <A2App onGoBack={() => setCurrentModule('landing')} />;
            case 'ielts':
                return <IELTSPrep onGoBack={() => setCurrentModule('landing')} theme={theme} toggleTheme={toggleTheme} />;
            case 'landing':
            default:
                return <LandingPage onSelectModule={setCurrentModule} theme={theme} toggleTheme={toggleTheme} />;
        }
    };

    return (
        <div className="h-full bg-slate-100 dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-sans">
            {renderModule()}
        </div>
    );
};

export default App;
