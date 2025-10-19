import React from 'react';
import { B1View } from '../../B1Prep';
import { ChatBubbleIcon, SparklesIcon, ClipboardDocumentCheckIcon } from '../IconComponents';

interface B1SectionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    isWIP?: boolean;
}

const B1SectionCard: React.FC<B1SectionCardProps> = ({ title, description, icon, onClick, isWIP = false }) => (
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

interface B1DashboardProps {
    onSelectSection: (view: B1View) => void;
}

const B1Dashboard: React.FC<B1DashboardProps> = ({ onSelectSection }) => (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">GESE Grade 5 (B1) Exam Preparation</h2>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                Master the Topic and Conversation phases for your B1 speaking and listening test.
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <B1SectionCard 
                title="Topic Phase Practice"
                description="Prepare and practice your chosen topic. Get AI feedback on your structure, grammar, and vocabulary."
                icon={<SparklesIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('topic')}
            />
            <B1SectionCard 
                title="Conversation Phase"
                description="Practice conversations on the 6 official GESE Grade 5 topics with an AI examiner."
                icon={<ChatBubbleIcon className="w-6 h-6" />}
                onClick={() => onSelectSection('conversation')}
            />
            <div className="lg:col-span-2">
                <B1SectionCard 
                    title="Full Mock Test"
                    description="Simulate the complete 10-minute GESE Grade 5 test, including both the Topic and Conversation phases."
                    icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
                    onClick={() => onSelectSection('mockTest')}
                />
            </div>
        </div>
    </div>
);

export default B1Dashboard;