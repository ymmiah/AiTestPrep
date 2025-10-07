import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/geminiService';
import { UserProfile } from '../types';
// FIX: The 'View' type is now imported from '../types' instead of '../A2App'.
import { View } from '../types';
import SkeletonLoader from './SkeletonLoader';
import { ChatBubbleIcon, SoundWaveIcon, CardStackIcon, HeadphonesIcon, SparklesIcon, ClipboardDocumentCheckIcon } from './IconComponents';

interface DashboardProps {
  setActiveView: (view: View) => void;
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

const QuickLink: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <button
        onClick={onClick}
        className="select-none bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md active:bg-slate-100 dark:active:bg-slate-700 active:shadow-sm transition-all w-full"
    >
        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{description}</p>
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const userData = await getUserProfile();
            setUser(userData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const SkeletonDashboard = () => (
        <div className="space-y-8">
            <div>
                <SkeletonLoader className="h-8 w-3/4 mb-2" />
                <SkeletonLoader className="h-5 w-1/2" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SkeletonLoader className="h-28 rounded-xl" />
                <SkeletonLoader className="h-28 rounded-xl" />
                <SkeletonLoader className="h-28 rounded-xl" />
                <SkeletonLoader className="h-28 rounded-xl" />
            </div>
            <div>
                 <SkeletonLoader className="h-7 w-1/4 mb-4" />
                 <div className="grid md:grid-cols-2 gap-4">
                    <SkeletonLoader className="h-24 rounded-lg" />
                    <SkeletonLoader className="h-24 rounded-lg" />
                 </div>
            </div>
        </div>
    );

    if (isLoading || !user) {
        return <SkeletonDashboard />;
    }
    
    const stats = user.progressStats;
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
                        : <>Please visit your <button onClick={() => setActiveView('profile')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none">profile</button> to set your name and start your journey.</>
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
                        <QuickLink title="Start Conversation Practice" description="Talk with the AI examiner." onClick={() => setActiveView('simulator')} />
                        <QuickLink title="Take a Mock Exam" description="Simulate the full 7-minute test." onClick={() => setActiveView('mockTest')} />
                        <QuickLink title="Practice Pronunciation" description="Get feedback on specific phrases." onClick={() => setActiveView('pronunciation')} />
                        <QuickLink title="Learn New Words" description="Review your vocabulary flashcards." onClick={() => setActiveView('vocabulary')} />
                        <QuickLink title="Test Your Grammar" description="Take a quick quiz." onClick={() => setActiveView('grammar')} />
                        <QuickLink title="Practice Listening" description="Complete a listening exercise." onClick={() => setActiveView('listening')} />
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