import React, { useState, useEffect, useCallback } from 'react';
import A2App from './A2App';
import { View, Theme, Module, UserProfile, Notification, NotificationAction } from './types';
import LandingPage from './components/LandingPage';
import IELTSPrep from './components/IELTSPrep';
import AcademicPrep from './AcademicPrep';
import B1Prep from './B1Prep';
import { getUserProfile, updateUserProfile } from './services/geminiService';
import Profile from './components/Profile';
import ModuleLayout from './components/ModuleLayout';
import { NotificationContext } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import SkeletonLoader from './components/SkeletonLoader';
import { GitHubIcon } from './components/IconComponents';

interface AppState {
    module: Module;
    initialView?: View;
}

const App: React.FC = () => {
    const [theme, setThemeState] = useState<Theme>('light');
    const [currentModule, setCurrentModule] = useState<AppState>({ module: 'landing' });
    
    // Centralized User Profile State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileVersion, setProfileVersion] = useState(0);
    const forceProfileRefetch = () => setProfileVersion(v => v + 1);
    
    // Centralized Notification State
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load user profile and theme
    useEffect(() => {
        const loadUserData = async () => {
            setIsLoadingProfile(true);
            try {
                const profile = await getUserProfile();
                setUserProfile(profile);
                const storedTheme = (localStorage.getItem('theme') as Theme) || profile.theme || 'light';
                setThemeState(storedTheme);
            } catch {
                const storedTheme = (localStorage.getItem('theme') as Theme) || 'light';
                setThemeState(storedTheme);
                 // In case of error, set a default profile to avoid app crash
                setUserProfile({
                    name: '', points: 0, badges: [], referenceNumber: null, theme: 'light',
                    progress: { a2: {} as any, ielts: {} as any, academic: {} as any, b1: {} as any }
                });
            } finally {
                setIsLoadingProfile(false);
            }
        };
        loadUserData();
    }, [profileVersion]);

    // Effect to apply theme classes to the document
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'theme-oceanic');
        
        // The 'light' class is not needed; the absence of 'dark' defaults to light mode.
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'oceanic') {
            root.classList.add('dark', 'theme-oceanic');
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        if (userProfile) {
            updateUserProfile(p => ({...p, theme: newTheme}));
        }
    };
    
    const handleSelectModule = (module: Module, initialView?: View) => {
        setCurrentModule({ module, initialView });
    };

    // Notification Logic
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((
        notification: Omit<Notification, 'id' | 'action'> & { action?: Omit<NotificationAction, 'onClick'> }
    ) => {
        const id = Date.now().toString() + Math.random().toString();
        
        let actionWithHandler: NotificationAction | undefined;
        if (notification.action) {
          actionWithHandler = {
            ...notification.action,
            onClick: () => {
              setCurrentModule({ module: 'profile' });
              removeNotification(id);
            }
          };
        }

        setNotifications(prev => [...prev, { ...notification, id, action: actionWithHandler }]);
    }, [removeNotification]);


    const renderModule = () => {
        if (isLoadingProfile) {
            return (
                 <div className="flex items-center justify-center h-full">
                    <div className="w-full max-w-sm space-y-4">
                        <SkeletonLoader className="h-10 w-full" />
                        <SkeletonLoader className="h-32 w-full" />
                        <SkeletonLoader className="h-32 w-full" />
                    </div>
                </div>
            )
        }

        switch(currentModule.module) {
            case 'a2':
                return <A2App 
                            onGoBack={() => setCurrentModule({ module: 'landing' })} 
                            onNavigateToModule={(module: Module) => setCurrentModule({ module })}
                            theme={theme} 
                            setTheme={setTheme} 
                            initialView={currentModule.initialView}
                            userProfile={userProfile}
                            forceProfileRefetch={forceProfileRefetch}
                        />;
            case 'b1':
                return <B1Prep 
                            onGoBack={() => setCurrentModule({ module: 'landing' })} 
                            theme={theme} 
                            setTheme={setTheme} 
                        />;
            case 'ielts':
                return <IELTSPrep 
                            onGoBack={() => setCurrentModule({ module: 'landing' })} 
                            theme={theme} 
                            setTheme={setTheme} 
                            onSelectModule={handleSelectModule} 
                        />;
            case 'academic':
                return <AcademicPrep 
                            onGoBack={() => setCurrentModule({ module: 'landing' })} 
                            theme={theme} 
                            setTheme={setTheme} 
                        />;
            case 'profile':
                 return (
                    <ModuleLayout title="My Profile" onGoBack={() => setCurrentModule({ module: 'landing' })} theme={theme} setTheme={setTheme}>
                       <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
                            <Profile 
                                theme={theme} 
                                setTheme={setTheme}
                                userProfile={userProfile}
                                forceProfileRefetch={forceProfileRefetch}
                             />
                             <footer className="w-full mt-12 py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-center gap-4">
                                    <a href="https://github.com/ymmiah/AiTestPrep" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                                        <GitHubIcon className="w-4 h-4" />
                                        <span>GitHub Repository</span>
                                    </a>
                                    <span>|</span>
                                    <span>Last updated: October 20, 2025</span>
                                </div>
                                <p className="mt-2">&copy; 2025 Powered by Yasin Mohammed Miah.</p>
                            </footer>
                        </div>
                    </ModuleLayout>
                );
            case 'landing':
            default:
                return <LandingPage 
                            onSelectModule={handleSelectModule} 
                            theme={theme} 
                            setTheme={setTheme}
                            userProfile={userProfile} 
                        />;
        }
    };

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            <div className="h-full bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans">
                <NotificationContainer notifications={notifications} />
                {renderModule()}
            </div>
        </NotificationContext.Provider>
    );
};

export default App;