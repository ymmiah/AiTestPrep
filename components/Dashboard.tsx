
import React from 'react';
import { UserProfile, Module } from '../types';
// FIX: The 'View' type is now imported from '../types' instead of '../A2App'.
import { View } from '../types';
import SkeletonLoader from './SkeletonLoader';
import { 
    ChatBubbleIcon, 
    SoundWaveIcon, 
    CardStackIcon, 
    HeadphonesIcon, 
    SparklesIcon, 
    ClipboardDocumentCheckIcon,
    QuestionMarkCircleIcon,
    AcademicCapIcon,
    CalendarDaysIcon
} from './IconComponents';

interface DashboardProps {
  setActiveView: (view: View) => void;
  onNavigateToModule: (module: Module) => void;
  userProfile: UserProfile | null;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm flex items-center border border-slate-200 dark:border-slate-800">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const QuickLink: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="select-none bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md active:bg-slate-100 dark:active:bg-slate-700 active:shadow-sm transition-all w-full flex items-start gap-4"
    >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">{title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{description}</p>
        </div>
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ setActiveView, onNavigateToModule, userProfile: user }) => {
    if (!user) {
        return (
             <div className="space-y-8">
                <div>
                    <SkeletonLoader className="h-8 w-3/4 mb-2" />
                    <SkeletonLoader className="h-5 w-1/2" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SkeletonLoader className="h-28 rounded-xl" />
                    <SkeletonLoader className="h-28 rounded-xl" />
                </div>
            </div>
        );
    }
    
    const stats = user.progress.a2;
    const learnedWordsCount = Object.keys(user.vocabularyProgress || {}).length;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                    {user.name ? `Welcome Back, ${user.name}!` : 'Welcome to A2 Test Prep!'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {user.name 
                        ? "Here's a summary of your progress. Keep up the great work!" 
                        : <>Please visit your <button onClick={() => onNavigateToModule('profile')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none">profile</button> to set your name and start your journey.</>
                    }
                </p>
            </div>

            {user.name && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="My Points" value={user.points} icon={<SparklesIcon className="w-6 h-6 text-white" />} color="bg-amber-500" />
                    <StatCard title="Avg. Pronunciation" value={`${stats.avgPronunciationScore}%`} icon={<SoundWaveIcon className="w-6 h-6 text-white" />} color="bg-rose-500" />
                    <StatCard title="Vocabulary Learned" value={learnedWordsCount} icon={<CardStackIcon className="w-6 h-6 text-white" />} color="bg-purple-500" />
                    <StatCard title="Listening Score" value={`${stats.listeningScore}%`} icon={<HeadphonesIcon className="w-6 h-6 text-white" />} color="bg-teal-500" />
                </div>
            )}
            
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quick Start</h3>
                {user.name ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <QuickLink title="Start Conversation" description="Talk with the AI examiner in various scenarios." icon={<ChatBubbleIcon className="w-6 h-6" />} onClick={() => setActiveView('simulator')} />
                        <QuickLink title="Take a Mock Exam" description="Simulate the full 7-minute test." icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />} onClick={() => setActiveView('mockTest')} />
                        <QuickLink title="Practice a Topic" description="Get AI feedback on common questions." icon={<QuestionMarkCircleIcon className="w-6 h-6" />} onClick={() => setActiveView('topicPractice')} />
                        <QuickLink title="Practice Pronunciation" description="Get feedback on specific phrases." icon={<SoundWaveIcon className="w-6 h-6" />} onClick={() => setActiveView('pronunciation')} />
                        <QuickLink title="Learn New Words" description="Build your vocabulary interactively." icon={<CardStackIcon className="w-6 h-6" />} onClick={() => setActiveView('vocabulary')} />
                        <QuickLink title="Test Your Grammar" description="Take a quick quiz on common mistakes." icon={<AcademicCapIcon className="w-6 h-6" />} onClick={() => setActiveView('grammar')} />
                        <QuickLink title="Practice Listening" description="Complete a listening exercise." icon={<HeadphonesIcon className="w-6 h-6" />} onClick={() => setActiveView('listening')} />
                        <QuickLink title="Plan Your Study" description="Generate a personalized study schedule." icon={<CalendarDaysIcon className="w-6 h-6" />} onClick={() => setActiveView('planner')} />
                    </div>
                ) : (
                     <div className="bg-slate-100 dark:bg-slate-800/50 p-5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center">
                        <p className="text-slate-600 dark:text-slate-400">Set your name in your profile to unlock practice activities.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
