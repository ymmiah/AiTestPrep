import React, { useState, useEffect } from 'react';
import { UserProfile, Badge, Theme } from '../types';
import { updateUserName, updateUserProfile } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import { AcademicCapIcon, CardStackIcon, ChatBubbleIcon, SparklesIcon, PencilIcon, SoundWaveIcon, HeadphonesIcon, BookOpenIcon, ArrowLeftIcon } from './IconComponents';
import { useNotification } from '../contexts/NotificationContext';

const iconMap: { [key in Badge['icon']]: React.FC<{ className?: string }> } = {
    AcademicCapIcon,
    CardStackIcon,
    ChatBubbleIcon,
};

const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
    const Icon = iconMap[badge.icon];
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-400 dark:bg-amber-500 rounded-full flex items-center justify-center text-white">
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{badge.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{badge.description}</p>
            </div>
        </div>
    );
};

const ProfileStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-indigo-500 text-white">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

interface ProfileProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userProfile: UserProfile | null;
  forceProfileRefetch: () => void;
  onGoBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ theme, setTheme, userProfile: profile, forceProfileRefetch, onGoBack }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [isDevMode, setIsDevMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        if (profile) {
            setEditingName(profile.name);
            setIsDevMode(profile.isDeveloperMode || false);
        }
    }, [profile]);

    const handleSaveName = async () => {
        if (!editingName.trim()) return;
        setIsSaving(true);
        await updateUserName(editingName);
        forceProfileRefetch(); // Trigger global profile reload
        setIsEditingName(false);
        setIsSaving(false);
        addNotification({
            type: 'success',
            title: 'Profile Updated!',
            message: 'Your name has been saved successfully.',
        });
    };

    const handleCancelName = () => {
        if (!profile) return;
        setIsEditingName(false);
        setEditingName(profile.name);
    }

    const handleDevModeToggle = async (enabled: boolean) => {
        setIsDevMode(enabled);
        await updateUserProfile(p => ({
            ...p,
            isDeveloperMode: enabled,
        }));
    };

    const SkeletonProfile = () => (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <SkeletonLoader className="h-24 w-24 mx-auto rounded-full mb-4" />
                    <SkeletonLoader className="h-8 w-1/3 mx-auto mb-2" />
                    <SkeletonLoader className="h-6 w-1/4 mx-auto" />
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                 <SkeletonLoader className="h-7 w-1/3 mb-4" />
                 <div className="grid md:grid-cols-2 gap-4">
                    <SkeletonLoader className="h-20 rounded-lg" />
                    <SkeletonLoader className="h-20 rounded-lg" />
                 </div>
            </div>
        </div>
    );

    if (!profile) {
        return <SkeletonProfile />;
    }
    
    // New User Onboarding View
    if (!profile.name) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Set Up Your Profile</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Please enter your name to personalize your experience and track your progress.</p>
                <div className="flex flex-col items-center gap-2 mt-6 max-w-xs mx-auto">
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full text-center px-4 py-2 text-lg bg-slate-100 dark:bg-slate-800 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <button 
                        onClick={handleSaveName} 
                        disabled={isSaving || !editingName.trim()}
                        className="w-full select-none mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 text-base font-semibold disabled:bg-indigo-300"
                    >
                        {isSaving ? 'Saving...' : 'Save Name'}
                    </button>
                </div>
            </div>
        )
    }
    
    const { progress } = profile;
    const learnedWordsCount = Object.keys(profile.vocabularyProgress || {}).length;

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex items-center gap-4">
                 <button 
                    onClick={onGoBack} 
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 active:bg-slate-300 dark:active:bg-slate-700 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
            </header>

             <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <img
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-500 shadow-lg"
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile.name || 'default-avatar'}`}
                        alt="User avatar"
                    />
                    <div className="relative group max-w-md mx-auto">
                        {isEditingName ? (
                             <div className="flex flex-col items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 text-center rounded-md focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-xs"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={handleSaveName} disabled={isSaving} className="select-none px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 text-sm font-semibold disabled:bg-teal-300">{isSaving ? '...' : 'Save'}</button>
                                    {profile.name && <button onClick={handleCancelName} className="select-none px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 active:bg-slate-400 text-sm font-semibold">Cancel</button>}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    aria-label="Edit name"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                     {profile.referenceNumber && (
                        <div className="mt-3">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Reference ID: <span className="font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded-md">{profile.referenceNumber}</span></p>
                        </div>
                    )}

                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-full">
                         <SparklesIcon className="w-5 h-5"/>
                        <span className="font-bold text-lg">{profile.points}</span>
                        <span>Points</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">My Progress</h3>
                
                {/* A2 Progress */}
                <div className="mt-4">
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">A2 Test Progress</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileStatCard title="Sessions Completed" value={progress.a2.sessionsCompleted} icon={<ChatBubbleIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Vocabulary Learned" value={learnedWordsCount} icon={<CardStackIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Pronunciation" value={`${progress.a2.avgPronunciationScore}%`} icon={<SoundWaveIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Listening Score" value={`${progress.a2.listeningScore}%`} icon={<HeadphonesIcon className="w-5 h-5" />} />
                    </div>
                </div>

                {/* IELTS Progress */}
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">IELTS Progress</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ProfileStatCard title="Writing Tasks" value={progress.ielts.writingTasksCompleted} icon={<PencilIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Writing Band" value={progress.ielts.avgWritingBand.toFixed(1)} icon={<SparklesIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Speaking Sessions" value={progress.ielts.speakingSessionsCompleted} icon={<ChatBubbleIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Speaking Band" value={progress.ielts.avgSpeakingBand.toFixed(1)} icon={<SparklesIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Listening" value={`${progress.ielts.listeningExercisesCompleted} tasks`} icon={<HeadphonesIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Listening" value={`${progress.ielts.avgListeningScore}%`} icon={<SparklesIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Reading" value={`${progress.ielts.readingExercisesCompleted} tasks`} icon={<BookOpenIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Reading" value={`${progress.ielts.avgReadingScore}%`} icon={<SparklesIcon className="w-5 h-5" />} />
                    </div>
                </div>
                
                {/* Academic Progress */}
                <div className="mt-6">
                     <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">Academic Writing</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileStatCard title="Assignments Checked" value={progress.academic.assignmentsChecked} icon={<AcademicCapIcon className="w-5 h-5" />} />
                     </div>
                </div>
            </div>


            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">My Badges</h3>
                {profile.badges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.badges.map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} />
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-600 dark:text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">You haven't earned any badges yet. Keep practicing!</p>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Developer Settings
                </h3>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">Enable Developer Mode</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Show raw API responses in the app.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleDevModeToggle(!isDevMode)}
                        className={`${
                            isDevMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                        role="switch"
                        aria-checked={isDevMode}
                    >
                        <span
                            aria-hidden="true"
                            className={`${
                                isDevMode ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;