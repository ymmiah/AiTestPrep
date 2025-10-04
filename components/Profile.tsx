import React, { useState, useEffect } from 'react';
import { UserProfile, Badge } from '../types';
import { getUserProfile, updateUserName } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import { AcademicCapIcon, CardStackIcon, ChatBubbleIcon, SparklesIcon, PencilIcon, SoundWaveIcon, HeadphonesIcon } from './IconComponents';

const iconMap: { [key in Badge['icon']]: React.FC<{ className?: string }> } = {
    AcademicCapIcon,
    CardStackIcon,
    ChatBubbleIcon,
};

const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
    const Icon = iconMap[badge.icon];
    return (
        <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center text-white">
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <h4 className="font-bold text-gray-800 dark:text-white">{badge.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
            </div>
        </div>
    );
};

const ProfileStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-blue-500 text-white">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState('');

    const fetchProfile = async () => {
        setIsLoading(true);
        const data = await getUserProfile();
        setProfile(data);
        setEditingName(data.name);
        if (!data.name) {
            setIsEditing(true);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!profile || !editingName.trim()) return;
        setIsLoading(true);
        const updatedProfile = await updateUserName(editingName);
        setProfile(updatedProfile);
        setEditingName(updatedProfile.name);
        setIsEditing(false);
        setIsLoading(false);
    };

    const handleCancel = () => {
        if (!profile) return;
        setIsEditing(false);
        setEditingName(profile.name);
    }

    const SkeletonProfile = () => (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <SkeletonLoader className="h-24 w-24 mx-auto rounded-full mb-4" />
                    <SkeletonLoader className="h-8 w-1/3 mx-auto mb-2" />
                    <SkeletonLoader className="h-6 w-1/4 mx-auto" />
                </div>
                <div className="mb-10">
                     <SkeletonLoader className="h-7 w-1/3 mb-4" />
                     <div className="grid md:grid-cols-2 gap-4">
                        <SkeletonLoader className="h-20 rounded-lg" />
                        <SkeletonLoader className="h-20 rounded-lg" />
                     </div>
                </div>
                <div>
                    <SkeletonLoader className="h-7 w-1/4 mb-4" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <SkeletonLoader className="h-24 rounded-lg" />
                        <SkeletonLoader className="h-24 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading || !profile) {
        return <SkeletonProfile />;
    }
    
    const { progressStats } = profile;
    const learnedWordsCount = Object.keys(profile.vocabularyProgress || {}).length;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <img
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 shadow-lg"
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile.name || 'default-avatar'}`}
                        alt="User avatar"
                    />
                    <div className="relative group max-w-md mx-auto">
                        {isEditing ? (
                             <div className="flex flex-col items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-slate-800 text-center rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-xs"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold">Save</button>
                                    {profile.name && <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-md hover:bg-gray-300 text-sm font-semibold">Cancel</button>}
                                </div>
                                {!profile.name && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please set your name to save progress.</p>}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{profile.name}</h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    aria-label="Edit name"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                     {profile.referenceNumber && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Reference ID: <span className="font-mono bg-gray-100 dark:bg-slate-800 p-1 rounded-md">{profile.referenceNumber}</span></p>
                        </div>
                    )}

                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-full">
                         <SparklesIcon className="w-5 h-5"/>
                        <span className="font-bold text-lg">{profile.points}</span>
                        <span>Points</span>
                    </div>
                </div>

                 <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">My Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileStatCard title="Sessions Completed" value={progressStats.sessionsCompleted} icon={<ChatBubbleIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Vocabulary Learned" value={learnedWordsCount} icon={<CardStackIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Pronunciation" value={`${progressStats.avgPronunciationScore}%`} icon={<SoundWaveIcon className="w-5 h-5" />} />
                        <ProfileStatCard title="Avg. Listening Score" value={`${progressStats.listeningScore}%`} icon={<HeadphonesIcon className="w-5 h-5" />} />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">My Badges</h3>
                    {profile.badges.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.badges.map((badge) => (
                                <BadgeCard key={badge.id} badge={badge} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">You haven't earned any badges yet. Keep practicing!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;