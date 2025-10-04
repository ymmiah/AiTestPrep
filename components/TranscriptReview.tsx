import React, { useState } from 'react';
import { Message, Role } from '../types';
import { getImprovedAnswer } from '../services/geminiService';
import { SparklesIcon, UserCircleIcon } from './IconComponents';

interface TranscriptReviewProps {
    messages: Message[];
}

const TranscriptReview: React.FC<TranscriptReviewProps> = ({ messages }) => {
    const [improvedAnswers, setImprovedAnswers] = useState<{ [key: number]: string }>({});
    const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});

    const handleImprovement = async (userMessageIndex: number) => {
        const userMessage = messages[userMessageIndex];
        const previousModelMessage = messages[userMessageIndex - 1];

        if (!userMessage || userMessage.role !== Role.USER || !previousModelMessage || previousModelMessage.role !== Role.MODEL) {
            return;
        }

        setIsLoading(prev => ({ ...prev, [userMessageIndex]: true }));
        
        const improved = await getImprovedAnswer(userMessage.text, previousModelMessage.text);
        
        setImprovedAnswers(prev => ({ ...prev, [userMessageIndex]: improved }));
        setIsLoading(prev => ({ ...prev, [userMessageIndex]: false }));
    };

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Transcript Review</h3>
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((message, index) => {
                        const isUser = message.role === Role.USER;
                        return (
                            <div key={index}>
                                <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                                     <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${isUser ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                        {isUser ? <UserCircleIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg max-w-md ${isUser ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-white dark:bg-slate-700'}`}>
                                        <p className="text-sm text-gray-800 dark:text-gray-100">{message.text}</p>
                                    </div>
                                </div>
                                {isUser && (
                                    <div className="flex justify-end mt-1 mr-11">
                                        {isLoading[index] ? (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Getting suggestion...</span>
                                        ) : improvedAnswers[index] ? (
                                            <div className="mt-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/50 w-full max-w-md ml-auto animate-fade-in">
                                                <h5 className="text-xs font-bold text-green-800 dark:text-green-200 flex items-center gap-1"><SparklesIcon className="w-3 h-3"/> Suggested Improvement</h5>
                                                <p className="text-sm text-green-900 dark:text-green-100 mt-1">{improvedAnswers[index]}</p>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleImprovement(index)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                                Get Improvement
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TranscriptReview;