import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { AcademicCapIcon, SparklesIcon } from './IconComponents';

type Module = 'landing' | 'a2' | 'ielts';

interface LandingPageProps {
    onSelectModule: (module: Module) => void;
    theme: string;
    toggleTheme: () => void;
}

const ModuleCard: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <button 
        onClick={onClick}
        className="text-left bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group active:scale-[0.98] active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
    >
        <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div 
            className="w-full text-left p-6 bg-gray-50 dark:bg-slate-800/50 group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors duration-300"
        >
            <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:text-white dark:group-hover:text-white">
                Start Preparing &rarr;
            </span>
        </div>
    </button>
);


const LandingPage: React.FC<LandingPageProps> = ({ onSelectModule, theme, toggleTheme }) => {
    return (
        // Use h-full to ensure this container is constrained to the viewport height.
        <div className="h-full flex flex-col animate-fade-in">
            <header className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 z-10 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                 <div className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                    <SparklesIcon className="w-7 h-7" />
                    <span>AI Test Prep</span>
                </div>
                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
            </header>
            
            {/* This main element is now the primary scroll container. */}
            <main className="flex-1 overflow-y-auto">
                {/* This inner div ensures content is centered vertically and horizontally,
                    but will grow and push the parent to scroll if content is too large. */}
                <div className="flex items-center justify-center min-h-full p-4 py-8">
                    <div className="w-full max-w-4xl">
                        <div className="text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                                Your Personal AI Language Coach
                            </h1>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                Select an exam to begin your personalized preparation journey. Powered by cutting-edge AI to help you succeed.
                            </p>
                        </div>

                        <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ModuleCard
                                title="UK Spouse Visa A2 Test Prep"
                                description="An interactive simulator for the A2 English speaking test, with real-time feedback and gamified learning modules."
                                onClick={() => onSelectModule('a2')}
                            />
                            <ModuleCard
                                title="IELTS Exam Preparation"
                                description="Comprehensive tools and practice for all four sections of the IELTS Academic & General Training tests. (Coming Soon)"
                                onClick={() => onSelectModule('ielts')}
                            />
                        </div>
                    </div>
                </div>
            </main>
            
             <footer className="flex-shrink-0 p-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <p>&copy; 2024 AI Studio Builder.</p>
            </footer>
        </div>
    );
};

export default LandingPage;