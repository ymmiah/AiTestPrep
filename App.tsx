
import React, { useState, useEffect } from 'react';
// FIX: The 'View' type is now imported from 'types.ts' to avoid circular dependencies.
import A2App from './A2App';
import { View } from './types';
import LandingPage from './components/LandingPage';
import IELTSPrep from './components/IELTSPrep';

type Module = 'landing' | 'a2' | 'ielts';
interface AppState {
    module: Module;
    initialView?: View;
}

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
    
    const [currentModule, setCurrentModule] = useState<AppState>({ module: 'landing' });

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
    
    const handleSelectModule = (module: Module, initialView?: View) => {
        setCurrentModule({ module, initialView });
    };

    const renderModule = () => {
        switch(currentModule.module) {
            case 'a2':
                return <A2App 
                            onGoBack={() => setCurrentModule({ module: 'landing' })} 
                            theme={theme} 
                            toggleTheme={toggleTheme} 
                            initialView={currentModule.initialView} 
                        />;
            case 'ielts':
                return <IELTSPrep onGoBack={() => setCurrentModule({ module: 'landing' })} theme={theme} toggleTheme={toggleTheme} />;
            case 'landing':
            default:
                return <LandingPage onSelectModule={handleSelectModule} theme={theme} toggleTheme={toggleTheme} />;
        }
    };

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans">
            {renderModule()}
        </div>
    );
};

export default App;