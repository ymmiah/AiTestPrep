import React from 'react';
import { ChatBubbleIcon } from '../IconComponents';

const IELTSSpeaking: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="max-w-3xl mx-auto text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <ChatBubbleIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">IELTS Speaking Practice</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    This section is currently under development. Soon, you'll be able to simulate the three-part IELTS speaking test with an AI examiner and get detailed feedback.
                </p>
                 <div className="mt-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-gray-400">The full speaking module will be available here.</p>
                </div>
            </div>
        </div>
    );
};

export default IELTSSpeaking;