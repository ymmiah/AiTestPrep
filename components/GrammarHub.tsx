import React, { useState } from 'react';
import CommonMistakes from './CommonMistakes';
import GrammarQuiz from './GrammarQuiz';

type GrammarView = 'mistakes' | 'quiz';

const GrammarHub: React.FC = () => {
    const [activeView, setActiveView] = useState<GrammarView>('mistakes');

    const tabButtonClass = (view: GrammarView) => `
        px-6 py-3 font-medium text-sm leading-5 rounded-md focus:outline-none transition-colors duration-200
        ${activeView === view
            ? 'bg-blue-600 text-white shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
        }
    `;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Grammar Hub</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Improve your accuracy by learning common mistakes and testing your knowledge.</p>
                </div>
                
                <div className="flex justify-center mb-8">
                    <div className="flex space-x-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button onClick={() => setActiveView('mistakes')} className={tabButtonClass('mistakes')}>
                            Common Mistakes
                        </button>
                        <button onClick={() => setActiveView('quiz')} className={tabButtonClass('quiz')}>
                            Grammar Quiz
                        </button>
                    </div>
                </div>

                <div>
                    {activeView === 'mistakes' && <CommonMistakes />}
                    {activeView === 'quiz' && <GrammarQuiz />}
                </div>
            </div>
        </div>
    );
};

export default GrammarHub;
