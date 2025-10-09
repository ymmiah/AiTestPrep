import React, { useState } from 'react';
import { AcademicFeedback, WritingSuggestion } from '../../types';
import { getAcademicWritingFeedback, updateUserProfile } from '../../services/geminiService';
import { SparklesIcon, CheckCircleIcon, LightbulbIcon, PencilIcon } from '../IconComponents';
import SkeletonLoader from '../SkeletonLoader';

const AcademicWritingHelper: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [inputText, setInputText] = useState('');
    const [feedback, setFeedback] = useState<AcademicFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!topic.trim() || !inputText.trim()) {
            setError('Please provide both an assignment topic and your text.');
            return;
        }
        setError('');
        setIsLoading(true);
        setFeedback(null);

        try {
            const result = await getAcademicWritingFeedback(topic, inputText);
            setFeedback(result);
            if (!result.overall_assessment.includes("I cannot write your assignment for you.")) {
                await updateUserProfile(p => {
                    p.progress.academic.assignmentsChecked += 1;
                    return p;
                });
            }
        } catch (apiError) {
            if (apiError instanceof Error) {
                setError(`An error occurred: ${apiError.message}`);
            } else {
                setError('An unknown error occurred while generating feedback.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const ResultDisplay: React.FC<{ feedback: AcademicFeedback }> = ({ feedback }) => {
        const structuralFeedbackPoints = feedback.structural_feedback?.split('\n').filter(p => p.trim() !== '');
        const clarityFeedbackPoints = feedback.clarity_and_style_feedback?.split('\n').filter(p => p.trim() !== '');

        // Guardrail refusal message
        if (feedback.overall_assessment.includes("I cannot write your assignment for you.")) {
            return (
                 <div className="p-6 bg-rose-50 dark:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-700 text-center">
                    <h3 className="text-xl font-bold text-rose-800 dark:text-rose-200">Request Denied</h3>
                    <p className="text-rose-700 dark:text-rose-300 mt-2">{feedback.overall_assessment}</p>
                </div>
            )
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Overall Assessment</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{feedback.overall_assessment}</p>
                    </div>
                </div>

                {feedback.improvement_suggestions?.length > 0 && (
                     <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Improvement Suggestions</h3>
                        <div className="space-y-3">
                            {feedback.improvement_suggestions.map((s, i) => (
                                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Original Excerpt:</p>
                                    <p className="text-sm italic text-slate-600 dark:text-slate-300 border-l-4 border-slate-300 dark:border-slate-600 pl-2 my-1">"{s.original_excerpt}"</p>
                                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-2">Suggestion:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200">{s.suggestion_for_improvement}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                    {structuralFeedbackPoints?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Structural Feedback</h3>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <ul className="space-y-2">
                                    {structuralFeedbackPoints.map((point, index) => (
                                        <li key={index} className="flex items-start">
                                            <PencilIcon className="w-4 h-4 text-slate-500 mr-3 mt-1 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {clarityFeedbackPoints?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Clarity & Style Feedback</h3>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <ul className="space-y-2">
                                    {clarityFeedbackPoints.map((point, index) => (
                                        <li key={index} className="flex items-start">
                                            <LightbulbIcon className="w-4 h-4 text-slate-500 mr-3 mt-1 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {feedback.corrections?.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">British English Corrections</h3>
                        <div className="space-y-3">
                            {feedback.corrections.map((c, i) => (
                                <div key={i} className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                    <p className="text-sm">
                                        <span className="font-mono bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1 rounded line-through">{c.original_us}</span>
                                        <span className="mx-2">&rarr;</span>
                                        <span className="font-mono bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 rounded">{c.corrected_uk}</span>
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{c.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const LoadingSkeleton = () => (
         <div className="space-y-6">
            <div>
                <SkeletonLoader className="h-7 w-1/2 mb-3" />
                <SkeletonLoader className="h-40 w-full rounded-lg" />
            </div>
             <div>
                <SkeletonLoader className="h-7 w-1/3 mb-3" />
                <SkeletonLoader className="h-20 w-full rounded-lg" />
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assignment Writing Helper</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Enter your assignment topic and text below. Our AI tutor will analyze it and teach you how to improve, focusing on academic style and British English conventions.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="assignment-topic" className="block text-lg font-bold text-slate-800 dark:text-white mb-2">Assignment Topic or Question</label>
                        <input
                            id="assignment-topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., The impact of climate change on coastal cities"
                            className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                        />
                    </div>
                    <div>
                        <label htmlFor="assignment-text" className="block text-lg font-bold text-slate-800 dark:text-white mb-2">Your Text</label>
                        <textarea
                            id="assignment-text"
                            rows={12}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your assignment text here..."
                            className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                        />
                    </div>
                    {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
                    <div className="text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="select-none inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {isLoading ? 'Analyzing...' : 'Get Feedback'}
                        </button>
                    </div>
                </div>

                <div className="mt-10">
                    {isLoading && <LoadingSkeleton />}
                    {feedback && <ResultDisplay feedback={feedback} />}
                </div>

            </div>
        </div>
    );
};

export default AcademicWritingHelper;