import React, { useState } from 'react';
import { HeadphonesIcon, BookOpenIcon, PencilIcon, ChatBubbleIcon, ClipboardDocumentCheckIcon, AcademicCapIcon, GitHubIcon } from './IconComponents';
import ModuleLayout from './ModuleLayout';

import IELTSListening from './ielts/IELTSListening';
import IELTSReading from './ielts/IELTSReading';
import IELTSWriting from './ielts/IELTSWriting';
import IELTSSpeaking from './ielts/IELTSSpeaking';
import IELTSMockTest from './ielts/IELTSMockTest';
import { Theme } from '../types';

type Module = 'landing' | 'a2' | 'ielts' | 'academic';

interface IELTSPrepProps {
    onGoBack: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onSelectModule: (module: Module) => void;
}

type IELTSView = 'dashboard' | 'listening' | 'reading' | 'writing' | 'speaking' | 'mockTest';

const IELTSSectionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; isWIP?: boolean }> = ({ title, description, icon, onClick, isWIP = false }) => (
    <button 
        onClick={onClick}
        disabled={isWIP}
        className="text-left bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 relative group border border-slate-200 dark:border-slate-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm"
    >
        {isWIP && (
            <div className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
                Coming Soon
            </div>
        )}
        <div className="flex items-center mb-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mr-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
         <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline mt-4 block">
            Start Practicing &rarr;
        </span>
    </button>
);


const IELTSDashboard: React.FC<{ onSelectSection: (view: IELTSView) => void; onSelectModule: (module: 'academic') => void }> = ({ onSelectSection, onSelectModule }) => (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Prepare for All Sections of the IELTS Test</h2>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                Select a section below to begin your AI-powered practice.
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <IELTSSectionCard 
                title="Writing"
                description="Get AI-powered feedback on your essays for both Task 1 and Task 2, helping you improve structure, vocabulary, and grammar."
                icon={<PencilIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('writing')}
            />
            <IELTSSectionCard 
                title="Listening"
                description="Practice with a variety of audio clips and question types to improve your comprehension and score."
                icon={<HeadphonesIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('listening')}
            />
             <IELTSSectionCard 
                title="Reading"
                description="Tackle authentic texts with targeted exercises to boost your reading speed and accuracy."
                icon={<BookOpenIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('reading')}
            />
             <IELTSSectionCard 
                title="Speaking"
                description="Simulate the three-part IELTS speaking test with an AI examiner and receive detailed feedback."
                icon={<ChatBubbleIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('speaking')}
            />
            <IELTSSectionCard 
                title="Academic Writing Helper"
                description="Get AI assistance with your academic essays, focusing on structure, tone, and British English conventions."
                icon={<AcademicCapIcon className="w-6 h-6" />}
                onClick={() => onSelectModule('academic')}
            />
             <IELTSSectionCard 
                title="Full Mock Test"
                description="Experience a full, timed IELTS simulation covering all four sections to test your readiness."
                icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('mockTest')}
                isWIP={true}
            />
        </div>
    </div>
);


const IELTSPrep: React.FC<IELTSPrepProps> = ({ onGoBack, theme, setTheme, onSelectModule }) => {
    const [view, setView] = useState<IELTSView>('dashboard');

    const viewTitles: { [key in IELTSView]: string } = {
        dashboard: 'IELTS Preparation',
        writing: 'IELTS Writing Practice',
        listening: 'IELTS Listening Practice',
        reading: 'IELTS Reading Practice',
        speaking: 'IELTS Speaking Practice',
        mockTest: 'IELTS Mock Test',
    };

    const renderIELTSView = () => {
        switch(view) {
            case 'writing':
                return <IELTSWriting />;
            case 'listening':
                return <IELTSListening />;
            case 'reading':
                return <IELTSReading />;
            case 'speaking':
                return <IELTSSpeaking />;
            case 'mockTest':
                return <IELTSMockTest />;
            case 'dashboard':
            default:
                return <IELTSDashboard onSelectSection={setView} onSelectModule={onSelectModule} />;
        }
    };

    return (
        <ModuleLayout
            title={viewTitles[view]}
            onGoBack={view === 'dashboard' ? onGoBack : () => setView('dashboard')}
            theme={theme}
            setTheme={setTheme}
        >
            <div className="p-4 md:p-8">
                {renderIELTSView()}
                 <footer className="w-full mt-12 py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-4">
                        <a href="https://github.com/Yasin-M-Miah/ai-language-test-prep-platform" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
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
};

export default IELTSPrep;