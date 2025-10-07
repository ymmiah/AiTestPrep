import React, { useState } from 'react';
import { Message, Role, TranscriptAnalysis, FinalAssessment } from '../types';
import { SparklesIcon, UserCircleIcon, PhotoIcon, ClipboardDocumentCheckIcon } from './IconComponents';
import SkeletonLoader from './SkeletonLoader';

interface TranscriptReviewProps {
    messages: Message[];
    analysis: TranscriptAnalysis | null;
    assessment: FinalAssessment | null;
    imageUrl: string | null;
    isLoading: boolean;
    onRetake: () => void;
    onBackToDashboard: () => void;
}

const ScoreCard: React.FC<{ score: number }> = ({ score }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-in-out"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800 dark:text-white">{score}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ 100</span>
            </div>
        </div>
    );
};


const TranscriptReview: React.FC<TranscriptReviewProps> = ({ messages, analysis, assessment, imageUrl, isLoading, onRetake, onBackToDashboard }) => {
    type Tab = 'feedback' | 'transcript';
    const [activeTab, setActiveTab] = useState<Tab>('feedback');
    
    const tabButtonClass = (tab: Tab) => `
        px-6 py-3 font-medium text-sm leading-5 rounded-md focus:outline-none transition-colors duration-200
        ${activeTab === tab
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }
    `;

    if (isLoading) {
        return (
           <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
               <div className="w-full max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Generating Your Results...</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">This may take a moment. We're analyzing your entire performance.</p>
                    <div className="mt-8 space-y-4">
                       <SkeletonLoader className="h-48 w-48 rounded-full mx-auto" />
                       <SkeletonLoader className="h-24 w-full rounded-lg" />
                       <SkeletonLoader className="h-48 w-full rounded-lg" />
                    </div>
               </div>
           </div>
       );
   }
   
    if (!assessment || !analysis) {
        return (
             <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-rose-500">Error Generating Results</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">We couldn't generate your test results at this time. Please try again.</p>
                <button onClick={onRetake} className="mt-6 select-none px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Take Another Test
                </button>
            </div>
        );
    }
    
    const picPromptIndex = messages.findIndex(m => m.text.includes("describe what you see in the picture"));
    const picEndIndex = messages.findIndex(m => m.text.includes("Now, let's talk about something else."));
    const userPictureDescription = messages.slice(picPromptIndex > -1 ? picPromptIndex + 1 : 0, picEndIndex > -1 ? picEndIndex : messages.length).filter(m => m.role === Role.USER).map(m => m.text).join(' ');


    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="w-full max-w-3xl mx-auto">
                 <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Your Mock Test Results</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Here's a complete breakdown of your performance.</p>
                </div>

                <div className="flex justify-center my-8">
                    <ScoreCard score={assessment.overallScore} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                         <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Strengths</h4>
                         <p className="text-slate-700 dark:text-slate-300">{assessment.strengths}</p>
                    </div>
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                         <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Areas for Improvement</h4>
                         <p className="text-slate-700 dark:text-slate-300">{assessment.areasForImprovement}</p>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button onClick={() => setActiveTab('feedback')} className={tabButtonClass('feedback')}>Detailed Feedback</button>
                        <button onClick={() => setActiveTab('transcript')} className={tabButtonClass('transcript')}>Full Transcript</button>
                    </div>
                </div>

                {activeTab === 'feedback' && (
                    <div className="animate-fade-in">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                                <PhotoIcon className="w-6 h-6 text-indigo-500" />
                                Part 2: Picture Description Analysis
                            </h4>
                            {imageUrl && (
                                <div className="mb-4">
                                    <img src={imageUrl} alt="Test picture" className="rounded-lg max-w-sm mx-auto shadow-md" />
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                    <h5 className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1">Your Description</h5>
                                    <p className="text-sm text-blue-900 dark:text-blue-100 mt-1 italic">"{userPictureDescription || 'You did not describe the picture.'}"</p>
                                </div>
                                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                                    <h5 className="text-xs font-bold text-yellow-800 dark:text-yellow-200">Feedback</h5>
                                    <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-1">{analysis.pictureDescriptionAnalysis.userPerformanceFeedback}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                                    <h5 className="text-xs font-bold text-green-800 dark:text-green-200 flex items-center gap-1">Model Answer</h5>
                                    <p className="text-sm text-green-900 dark:text-green-100 mt-1">{analysis.pictureDescriptionAnalysis.modelAnswer}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                                <ClipboardDocumentCheckIcon className="w-6 h-6 text-indigo-500" />
                                Conversation Turn-by-Turn Analysis
                            </h4>
                            <div className="space-y-4">
                                {analysis.conversationAnalysis.map((turn, index) => (
                                    <div key={index} className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 mb-2">
                                            <h5 className="text-xs font-bold text-blue-800 dark:text-blue-200">Your Answer</h5>
                                            <p className="text-sm text-blue-900 dark:text-blue-100 mt-1 italic">"{turn.userTurn}"</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 mb-2">
                                            <h5 className="text-xs font-bold text-yellow-800 dark:text-yellow-200">Feedback</h5>
                                            <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-1">{turn.feedback}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                                            <h5 className="text-xs font-bold text-green-800 dark:text-green-200">Suggestion</h5>
                                            <p className="text-sm text-green-900 dark:text-green-100 mt-1">{turn.suggestion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transcript' && (
                    <div className="animate-fade-in bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-h-[60vh] overflow-y-auto">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Full Test Transcript</h4>
                        <div className="space-y-3">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === Role.MODEL && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"><SparklesIcon className="w-5 h-5"/></div>}
                                    <div className={`px-3 py-2 rounded-lg max-w-md ${msg.role === Role.USER ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    {msg.role === Role.USER && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200"><UserCircleIcon className="w-5 h-5"/></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={onBackToDashboard} className="select-none w-full px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                        Back to Dashboard
                    </button>
                    <button onClick={onRetake} className="select-none w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        Take Another Test
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TranscriptReview;
