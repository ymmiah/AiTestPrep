import React, { useState, useEffect } from 'react';
import { CommonMistake } from '../types';
import { getCommonMistakes } from '../services/geminiService';
import { ExclamationTriangleIcon, CheckCircleIcon } from './IconComponents';
import SkeletonLoader from './SkeletonLoader';

const CommonMistakes: React.FC = () => {
    const [mistakes, setMistakes] = useState<CommonMistake[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMistakes = async () => {
            setIsLoading(true);
            const fetchedMistakes = await getCommonMistakes();
            setMistakes(fetchedMistakes);
            setIsLoading(false);
        };
        fetchMistakes();
    }, []);

    const Skeleton = () => (
         <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                    <SkeletonLoader className="h-5 w-3/4 mb-2" />
                    <SkeletonLoader className="h-5 w-2/3 mb-4" />
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                        <SkeletonLoader className="h-4 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );

    if (isLoading) {
        return <Skeleton />;
    }

    return (
        <div className="animate-fade-in">
            <div className="space-y-6">
                {mistakes.map((mistake, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="font-mono text-sm line-through">{mistake.incorrect}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-green-600 dark:text-green-400">
                                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="font-mono text-sm">{mistake.correct}</p>
                        </div>
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{mistake.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommonMistakes;
