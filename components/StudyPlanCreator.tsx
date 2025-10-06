import React, { useState } from 'react';
import { StudyPlan } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import { CheckCircleIcon } from './IconComponents';
import SkeletonLoader from './SkeletonLoader';

const StudyPlanCreator: React.FC = () => {
    const [testDate, setTestDate] = useState('');
    const [availability, setAvailability] = useState('');
    const [plan, setPlan] = useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testDate || !availability) {
            setError('Please fill in both your test date and weekly availability.');
            return;
        }
        setError('');
        setIsLoading(true);
        setPlan(null);

        const generatedPlan = await generateStudyPlan(testDate, availability);
        
        setPlan(generatedPlan);
        setIsLoading(false);
    };

    const PlanSkeleton = () => (
        <div className="mt-10 space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <SkeletonLoader className="h-6 w-3/4 mb-4" />
                <SkeletonLoader className="h-4 w-full mb-2" />
                <SkeletonLoader className="h-4 w-full mb-2" />
                <SkeletonLoader className="h-4 w-5/6" />
            </div>
            <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <SkeletonLoader className="h-6 w-3/4 mb-4" />
                <SkeletonLoader className="h-4 w-full mb-2" />
                <SkeletonLoader className="h-4 w-5/6" />
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Your Personalized Study Plan</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Tell us your schedule, and we'll generate a custom plan to get you ready.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="test-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Test Date</label>
                            <input 
                                type="date"
                                id="test-date"
                                value={testDate}
                                onChange={(e) => setTestDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Hours per Week</label>
                            <input 
                                type="text"
                                id="availability"
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                                placeholder="e.g., 5 hours"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    <div className="mt-6 text-center">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="select-none inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                        >
                            {isLoading ? 'Generating Plan...' : 'Generate My Plan'}
                        </button>
                    </div>
                </form>

                {isLoading && <PlanSkeleton />}

                {plan && (
                    <div className="mt-10 animate-fade-in">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-6">Your Custom Study Plan</h3>
                        <div className="space-y-6">
                            {Object.entries(plan).map(([week, details]) => {
                                const weekDetails = details as { title: string; tasks: string[] };
                                return (
                                <div key={week} className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                                    <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">{weekDetails.title}</h4>
                                    <ul className="space-y-2">
                                        {weekDetails.tasks.map((task, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">{task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyPlanCreator;