import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import { TrophyIcon } from './IconComponents';

const Leaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const data = await getLeaderboard();
            setLeaderboard(data);
            setIsLoading(false);
        };
        fetchLeaderboard();
    }, []);

    const SkeletonLeaderboard = () => (
         <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <SkeletonLoader className="h-8 w-1/2 mx-auto mb-2" />
                    <SkeletonLoader className="h-5 w-3/4 mx-auto" />
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <SkeletonLoader key={i} className="h-16 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <SkeletonLeaderboard />;
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">See how you rank among other learners!</p>
                </div>

                <div className="space-y-3">
                    {leaderboard.map((entry) => (
                        <div
                            key={entry.rank}
                            className={`flex items-center p-4 rounded-lg border-2 ${
                                entry.isCurrentUser
                                ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-500 shadow-md'
                                : 'bg-gray-50 dark:bg-slate-800/50 border-transparent'
                            }`}
                        >
                            <div className="flex items-center w-12 font-bold text-lg text-gray-500 dark:text-gray-400">
                               <span>#{entry.rank}</span>
                               {entry.rank <= 3 && <TrophyIcon className={`w-5 h-5 ml-1 ${
                                   entry.rank === 1 ? 'text-yellow-400' :
                                   entry.rank === 2 ? 'text-gray-400' :
                                   'text-yellow-600'
                               }`} />}
                            </div>
                            <div className="flex items-center flex-1">
                                <img
                                    className="w-10 h-10 rounded-full mr-4"
                                    src={`https://api.dicebear.com/8.x/initials/svg?seed=${entry.name}`}
                                    alt={`${entry.name}'s avatar`}
                                />
                                <span className={`font-medium ${entry.isCurrentUser ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-100'}`}>{entry.name}</span>
                            </div>
                            <div className="font-bold text-lg text-gray-700 dark:text-gray-200">
                                {entry.points} pts
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;