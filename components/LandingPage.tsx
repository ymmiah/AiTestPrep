import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { AcademicCapIcon, SparklesIcon, UserGroupIcon } from './IconComponents';

type Module = 'landing' | 'a2' | 'ielts';

interface LandingPageProps {
    onSelectModule: (module: Module) => void;
    theme: string;
    toggleTheme: () => void;
}

const ModuleCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="text-left bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group active:scale-[0.98] active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
    >
        <div className="p-8">
            <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        <div 
            className="w-full text-left p-6 bg-slate-50 dark:bg-slate-900/50 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 transition-colors duration-300"
        >
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-white dark:group-hover:text-white">
                Start Preparing &rarr;
            </span>
        </div>
    </button>
);


const LandingPage: React.FC<LandingPageProps> = ({ onSelectModule, theme, toggleTheme }) => {
    return (
        <div className="h-full flex flex-col animate-fade-in bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
            <header className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 z-10 bg-transparent">
                 <div className="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    <SparklesIcon className="w-7 h-7" />
                    <span>AI Test Prep</span>
                </div>
                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
            </header>
            
            <main className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-center min-h-full p-4 py-8">
                    <div className="w-full max-w-4xl">
                        <div className="text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Your Personal AI Language Coach
                            </h1>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                Select an exam to begin your personalized preparation journey. Powered by cutting-edge AI to help you succeed.
                            </p>
                        </div>

                        <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ModuleCard
                                title="UK Spouse Visa A2 Test Prep"
                                description="An interactive simulator for the A2 English speaking test, with real-time feedback and gamified learning modules."
                                icon={<UserGroupIcon className="w-8 h-8"/>}
                                onClick={() => onSelectModule('a2')}
                            />
                            <ModuleCard
                                title="IELTS Exam Preparation"
                                description="Comprehensive tools and practice for all four sections of the IELTS Academic & General Training tests."
                                icon={<AcademicCapIcon className="w-8 h-8"/>}
                                onClick={() => onSelectModule('ielts')}
                            />
                        </div>
                    </div>
                </div>
            </main>
            
             <footer className="flex-shrink-0 p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-transparent">
                <p>&copy; 2024 AI Studio Builder.</p>
            </footer>
        </div>
    );
};

export default LandingPage;