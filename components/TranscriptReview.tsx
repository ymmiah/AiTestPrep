import React from 'react';
import { Message, Role, TranscriptAnalysis } from '../types';
import { SparklesIcon, UserCircleIcon, PhotoIcon, ClipboardDocumentCheckIcon } from './IconComponents';
import SkeletonLoader from './SkeletonLoader';

interface TranscriptReviewProps {
    messages: Message[];
    analysis: TranscriptAnalysis | null;
    imageUrl: string | null;
    isLoading: boolean;
}

const TranscriptReview: React.FC<TranscriptReviewProps> = ({ messages, analysis, imageUrl, isLoading }) => {

    if (isLoading) {
        return (
            <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Analyzing Your Transcript...</h3>
                <div className="space-y-4">
                    <SkeletonLoader className="h-48 w-full rounded-lg" />
                    <SkeletonLoader className="h-24 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (!analysis) {
        return null;
    }

    const picPromptIndex = messages.findIndex(m => m.text.includes("describe what you see in the picture"));
    const picEndIndex = messages.findIndex(m => m.text.includes("Now, let's talk about something else."));
    const userPictureDescription = messages.slice(picPromptIndex > -1 ? picPromptIndex + 1 : 0, picEndIndex > -1 ? picEndIndex : messages.length).filter(m => m.role === Role.USER).map(m => m.text).join(' ');

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Detailed Test Analysis</h3>
            
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                    <PhotoIcon className="w-6 h-6 text-blue-500" />
                    Part 2: Picture Description Analysis
                </h4>

                {imageUrl && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">The picture you described:</p>
                        <img src={imageUrl} alt="Test picture" className="rounded-lg max-w-sm mx-auto shadow-md" />
                    </div>
                )}
                
                <div className="space-y-4">
                     {userPictureDescription && (
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                             <h5 className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1">
                                <UserCircleIcon className="w-4 h-4" /> Your Description
                             </h5>
                             <p className="text-sm text-blue-900 dark:text-blue-100 mt-1 italic">"{userPictureDescription}"</p>
                         </div>
                     )}

                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                        <h5 className="text-xs font-bold text-yellow-800 dark:text-yellow-200">Feedback on Your Performance</h5>
                        <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-1">{analysis.pictureDescriptionAnalysis.userPerformanceFeedback}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                        <h5 className="text-xs font-bold text-green-800 dark:text-green-200 flex items-center gap-1">
                            <SparklesIcon className="w-4 h-4"/> Model Answer
                        </h5>
                        <p className="text-sm text-green-900 dark:text-green-100 mt-1">{analysis.pictureDescriptionAnalysis.modelAnswer}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-500" />
                    Conversation Analysis
                </h4>
                <div className="space-y-4">
                    {analysis.conversationAnalysis.length > 0 ? (
                        analysis.conversationAnalysis.map((turn, index) => (
                            <div key={index} className="border-t border-gray-200 dark:border-slate-700 pt-3">
                                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 mb-2">
                                    <h5 className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1">
                                        <UserCircleIcon className="w-4 h-4" /> Your Answer
                                    </h5>
                                    <p className="text-sm text-blue-900 dark:text-blue-100 mt-1 italic">"{turn.userTurn}"</p>
                                </div>
                                
                                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 mb-2">
                                    <h5 className="text-xs font-bold text-yellow-800 dark:text-yellow-200">Feedback</h5>
                                    <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-1">{turn.feedback}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                                    <h5 className="text-xs font-bold text-green-800 dark:text-green-200 flex items-center gap-1">
                                        <SparklesIcon className="w-4 h-4"/> Suggestion
                                    </h5>
                                    <p className="text-sm text-green-900 dark:text-green-100 mt-1">{turn.suggestion}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No conversational turns to analyze.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranscriptReview;