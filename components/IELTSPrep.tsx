import React, { useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { ArrowLeftIcon, HeadphonesIcon, BookOpenIcon, PencilIcon, ChatBubbleIcon, ClipboardDocumentCheckIcon } from './IconComponents';

import IELTSListening from './ielts/IELTSListening';
import IELTSReading from './ielts/IELTSReading';
import IELTSWriting from './ielts/IELTSWriting';
import IELTSSpeaking from './ielts/IELTSSpeaking';
import IELTSMockTest from './ielts/IELTSMockTest';

interface IELTSPrepProps {
    onGoBack: () => void;
    theme: string;
    toggleTheme: () => void;
}

type IELTSView = 'dashboard' | 'listening' | 'reading' | 'writing' | 'speaking' | 'mockTest';

const IELTSSectionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; isWIP?: boolean }> = ({ title, description, icon, onClick, isWIP = false }) => (
    <button 
        onClick={onClick}
        className="text-left bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 relative group"
    >
        {isWIP && (
            <div className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full">
                WIP
            </div>
        )}
        <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
         <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline mt-4 block">
            Start Practicing &rarr;
        </span>
    </button>
);


const IELTSDashboard: React.FC<{ onSelectSection: (view: IELTSView) => void }> = ({ onSelectSection }) => (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Prepare for All Sections of the IELTS Test</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
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
                isWIP={true}
            />
             <IELTSSectionCard 
                title="Speaking"
                description="Simulate the three-part IELTS speaking test with an AI examiner and receive detailed feedback."
                icon={<ChatBubbleIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('speaking')}
                isWIP={true}
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


const IELTSPrep: React.FC<IELTSPrepProps> = ({ onGoBack, theme, toggleTheme }) => {
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
                return <IELTSDashboard onSelectSection={setView} />;
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 md:py-6 md:px-8 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={view === 'dashboard' ? onGoBack : () => setView('dashboard')} 
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-slate-600 transition-colors"
                        aria-label="Back"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {viewTitles[view]}
                    </h1>
                </div>
                <div className="flex items-center">
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {renderIELTSView()}
            </main>
        </div>
    );
};

export default IELTSPrep;