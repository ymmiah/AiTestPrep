import React, { useState, useEffect } from 'react';
import { UserProfile, Badge, ApiConfig, AiProvider } from '../types';
import { getUserProfile, updateUserName, getApiConfig, saveApiConfig } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import { AcademicCapIcon, CardStackIcon, ChatBubbleIcon, SparklesIcon, PencilIcon, SoundWaveIcon, HeadphonesIcon, KeyIcon, EyeIcon, EyeSlashIcon } from './IconComponents';

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


const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState('');
    
    // State for the new API configuration UI
    const [selectedProvider, setSelectedProvider] = useState<AiProvider>('gemini');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isKeyVisible, setIsKeyVisible] = useState(false);

    const fetchProfileData = async () => {
        setIsLoading(true);
        const [profileData, configData] = await Promise.all([getUserProfile(), getApiConfig()]);
        
        setProfile(profileData);
        setEditingName(profileData.name);
        if (!profileData.name) {
            setIsEditingName(true);
        }

        setApiConfig(configData);
        setSelectedProvider(configData.provider);
        setApiKeyInput(configData.keys[configData.provider] || '');

        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleSaveName = async () => {
        if (!profile || !editingName.trim()) return;
        setIsLoading(true);
        const updatedProfile = await updateUserName(editingName);
        setProfile(updatedProfile);
        setEditingName(updatedProfile.name);
        setIsEditingName(false);
        setIsLoading(false);
    };

    const handleCancelName = () => {
        if (!profile) return;
        setIsEditingName(false);
        setEditingName(profile.name);
    }
    
    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvider = e.target.value as AiProvider;
        setSelectedProvider(newProvider);
        setApiKeyInput(apiConfig?.keys[newProvider] || '');
    };

    const handleSaveApiKey = () => {
        if (!apiConfig) return;

        const newConfig: ApiConfig = {
            provider: selectedProvider,
            keys: {
                ...apiConfig.keys,
                [selectedProvider]: apiKeyInput.trim(),
            }
        };
        saveApiConfig(newConfig); // This will save and reload the page
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

    if (isLoading || !profile || !apiConfig) {
        return <SkeletonProfile />;
    }
    
    const { progressStats } = profile;
    const learnedWordsCount = Object.keys(profile.vocabularyProgress || {}).length;
    const providerNames: { [key in AiProvider]: string } = {
        gemini: 'Google Gemini',
        openai: 'OpenAI',
        anthropic: 'Anthropic'
    };


    return (
        <div className="space-y-8 animate-fade-in">
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
                                    <button onClick={handleSaveName} className="select-none px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 text-sm font-semibold">Save</button>
                                    {profile.name && <button onClick={handleCancelName} className="select-none px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 active:bg-slate-400 text-sm font-semibold">Cancel</button>}
                                </div>
                                {!profile.name && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please set your name to save progress.</p>}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileStatCard title="Sessions Completed" value={progressStats.sessionsCompleted} icon={<ChatBubbleIcon className="w-5 h-5" />} />
                    <ProfileStatCard title="Vocabulary Learned" value={learnedWordsCount} icon={<CardStackIcon className="w-5 h-5" />} />
                    <ProfileStatCard title="Avg. Pronunciation" value={`${progressStats.avgPronunciationScore}%`} icon={<SoundWaveIcon className="w-5 h-5" />} />
                    <ProfileStatCard title="Avg. Listening Score" value={`${progressStats.listeningScore}%`} icon={<HeadphonesIcon className="w-5 h-5" />} />
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
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <KeyIcon className="w-6 h-6" />
                    AI Model Configuration
                </h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="ai-provider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            AI Provider
                        </label>
                        <select
                            id="ai-provider"
                            value={selectedProvider}
                            onChange={handleProviderChange}
                            className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="gemini">Google Gemini</option>
                            <option value="openai" disabled>OpenAI (Coming Soon)</option>
                            <option value="anthropic" disabled>Anthropic (Coming Soon)</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Note: This application is currently optimized for Google Gemini. Support for other providers is in development.
                        </p>
                    </div>
                     <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                           Your {providerNames[selectedProvider]} API Key
                        </label>
                        <div className="relative mt-1">
                            <input
                                type={isKeyVisible ? 'text' : 'password'}
                                id="api-key"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder={`Enter your ${providerNames[selectedProvider]} key`}
                                className="w-full px-3 py-2 pr-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={() => setIsKeyVisible(!isKeyVisible)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                aria-label={isKeyVisible ? "Hide API key" : "Show API key"}
                            >
                                {isKeyVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleSaveApiKey}
                            className="select-none w-full sm:w-auto px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 text-sm font-semibold disabled:bg-teal-300"
                            disabled={!apiKeyInput.trim()}
                        >
                            Save & Reload
                        </button>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Your key is stored securely in your browser's local storage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;