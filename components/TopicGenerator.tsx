import React, { useState } from 'react';
import { TopicQA } from '../types';
import { generateTopicsAndQuestions } from '../services/geminiService';
import { SparklesIcon } from './IconComponents';
import SkeletonLoader from './SkeletonLoader';

const TopicGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [qas, setQas] = useState<TopicQA[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic to generate questions and answers.');
            return;
        }
        setError('');
        setIsLoading(true);
        setQas(null);

        const generatedQAs = await generateTopicsAndQuestions(topic);
        
        setQas(generatedQAs);
        setIsLoading(false);
    };

    const QASkeleton = () => (
        <div className="mt-10 space-y-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                    <SkeletonLoader className="h-5 w-1/2 mb-3" />
                    <SkeletonLoader className="h-4 w-full" />
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-3">
                        <SkeletonLoader className="h-5 w-1/3 mb-2" />
                        <SkeletonLoader className="h-4 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Topics & Q&A Generator</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Enter a topic to get common questions and example answers.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                            type="text"
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Family, Hobbies, Food"
                            className="flex-grow w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                            required
                        />
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                        >
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                     {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </form>

                {isLoading && <QASkeleton />}

                {qas && (
                    <div className="mt-10 animate-fade-in">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-6">Generated Q&A for "{topic}"</h3>
                        <div className="space-y-6">
                            {qas.map((qa, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                                    <div className="mb-3">
                                        <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">Question:</p>
                                        <p className="text-gray-800 dark:text-gray-100">{qa.question}</p>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                                         <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
                                            <SparklesIcon className="w-4 h-4" />
                                            Example Answer:
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1">{qa.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicGenerator;
