import React from 'react';
import { ClipboardDocumentCheckIcon } from '../IconComponents';

const IELTSMockTest: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="max-w-3xl mx-auto text-center">
                 <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">IELTS Full Mock Test</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    This section is currently under development. Soon, you'll be able to take a full, timed mock test covering all four sections to test your skills and time management.
                </p>
                 <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">The full mock test module will be available here.</p>
                </div>
            </div>
        </div>
    );
};

export default IELTSMockTest;