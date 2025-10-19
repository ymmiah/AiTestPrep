import React, { useState } from 'react';
import { Theme } from './types';
import ModuleLayout from './components/ModuleLayout';
import B1Dashboard from './components/b1/B1Dashboard';
import B1TopicPractice from './components/b1/B1TopicPractice';
import B1ConversationPractice from './components/b1/B1ConversationPractice';
import B1MockTest from './components/b1/B1MockTest';
import { SparklesIcon } from './components/IconComponents';

interface B1PrepProps {
    onGoBack: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export type B1View = 'dashboard' | 'topic' | 'conversation' | 'mockTest';

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
   <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center">
             <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <SparklesIcon className="w-8 h-8 text-indigo-500" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
                This feature is currently under development and will be available soon. It will provide a dedicated practice environment for this part of the GESE Grade 5 test.
            </p>
        </div>
    </div>
);

const B1Prep: React.FC<B1PrepProps> = ({ onGoBack, theme, setTheme }) => {
    const [view, setView] = useState<B1View>('dashboard');

    const viewTitles: { [key in B1View]: string } = {
        dashboard: 'B1 GESE Grade 5',
        topic: 'Topic Phase Practice',
        conversation: 'Conversation Phase Practice',
        mockTest: 'B1 Mock Test',
    };

    const renderB1View = () => {
        switch(view) {
            case 'topic':
                return <B1TopicPractice />;
            case 'conversation':
                return <B1ConversationPractice />;
            case 'mockTest':
                return <B1MockTest setView={setView} />;
            case 'dashboard':
            default:
                return <B1Dashboard onSelectSection={setView} />;
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
                {renderB1View()}
            </div>
        </ModuleLayout>
    );
};

export default B1Prep;