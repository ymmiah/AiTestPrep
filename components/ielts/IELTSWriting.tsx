import React, { useState, useEffect, useMemo } from 'react';
import { generateIELTSWritingPrompt, getIELTSWritingFeedback, generateIELTSModelAnswer } from '../../services/geminiService';
import { IELTSWritingFeedback } from '../../types';
import SkeletonLoader from '../SkeletonLoader';
import { SparklesIcon, DocumentArrowDownIcon } from '../IconComponents';

type WritingTask = 'Task 1' | 'Task 2';

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
    const percentage = (score / 9) * 100;
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const FeedbackDisplay: React.FC<{ feedback: IELTSWritingFeedback; onGetModelAnswer: () => void; modelAnswer: string | null; isLoadingModelAnswer: boolean; }> = ({ feedback, onGetModelAnswer, modelAnswer, isLoadingModelAnswer }) => {
    const criteria = [
        { title: 'Task Achievement', data: feedback.taskAchievement },
        { title: 'Coherence & Cohesion', data: feedback.coherenceAndCohesion },
        { title: 'Lexical Resource', data: feedback.lexicalResource },
        { title: 'Grammar Range & Accuracy', data: feedback.grammaticalRangeAndAccuracy },
    ];

    const renderImprovements = () => {
        const points = feedback.suggestedImprovements.split('\n').filter(p => p.trim() !== '');
        return (
            <ul className="list-disc list-inside space-y-1">
                {points.map((point, index) => <li key={index}>{point}</li>)}
            </ul>
        );
    };

    return (
        <div className="mt-8 animate-fade-in space-y-6">
            <div className="text-center p-6 bg-indigo-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Overall Band Score</p>
                <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-300">{feedback.overallBand.toFixed(1)}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {criteria.map(c => (
                    <div key={c.title} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-baseline mb-2">
                            <h4 className="font-bold text-slate-800 dark:text-white">{c.title}</h4>
                            <span className="px-2 py-0.5 text-sm font-bold bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded-full">{c.data.score.toFixed(1)}</span>
                        </div>
                        <ScoreBar score={c.data.score} />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{c.data.feedback}</p>
                    </div>
                ))}
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/50 p-4 rounded-lg border border-teal-200 dark:border-teal-700">
                <h4 className="font-bold text-teal-800 dark:text-teal-200">Suggested Improvements</h4>
                <div className="text-sm text-teal-700 dark:text-teal-300 mt-2">{renderImprovements()}</div>
            </div>
            
            {!modelAnswer && (
                 <div className="text-center">
                    <button 
                        onClick={onGetModelAnswer}
                        disabled={isLoadingModelAnswer}
                        className="select-none inline-flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-300"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        {isLoadingModelAnswer ? 'Generating...' : 'Show Model Answer (Band 8+)'}
                    </button>
                 </div>
            )}
           
            {modelAnswer && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white">Model Answer</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap mt-2">{modelAnswer}</p>
                </div>
            )}
        </div>
    );
};

const IELTSWriting: React.FC = () => {
    const [task, setTask] = useState<WritingTask>('Task 2');
    const [prompt, setPrompt] = useState<string>('');
    const [essay, setEssay] = useState<string>('');
    const [wordCount, setWordCount] = useState(0);
    const [feedback, setFeedback] = useState<IELTSWritingFeedback | null>(null);
    const [modelAnswer, setModelAnswer] = useState<string | null>(null);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [isLoadingModelAnswer, setIsLoadingModelAnswer] = useState(false);
    
    // Timer state
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = React.useRef<number | null>(null);

    useEffect(() => {
        if (essay) {
            const words = essay.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length);
        } else {
            setWordCount(0);
        }
    }, [essay]);
    
    useEffect(() => {
        if (isTimerRunning && timer > 0) {
            timerRef.current = window.setTimeout(() => setTimer(t => t - 1), 1000);
        } else if (timer <= 0 && isTimerRunning) {
            setIsTimerRunning(false);
            // Optionally, auto-submit or notify the user
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isTimerRunning, timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        setTimer(task === 'Task 1' ? 20 * 60 : 60 * 60);
        setIsTimerRunning(true);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimer(0);
        if(timerRef.current) clearTimeout(timerRef.current);
    }

    const loadNewPrompt = async (selectedTask: WritingTask) => {
        setIsLoadingPrompt(true);
        setFeedback(null);
        setEssay('');
        setModelAnswer(null);
        resetTimer();
        const newPrompt = await generateIELTSWritingPrompt(selectedTask);
        setPrompt(newPrompt);
        setIsLoadingPrompt(false);
    };

    useEffect(() => {
        loadNewPrompt(task);
    }, [task]);

    const handleGetFeedback = async () => {
        if (!essay.trim()) return;
        setIsGettingFeedback(true);
        setFeedback(null);
        setModelAnswer(null);
        const result = await getIELTSWritingFeedback(prompt, essay, task);
        setFeedback(result);
        setIsGettingFeedback(false);
    };

    const handleGetModelAnswer = async () => {
        setIsLoadingModelAnswer(true);
        const answer = await generateIELTSModelAnswer(prompt, task);
        setModelAnswer(answer);
        setIsLoadingModelAnswer(false);
    }

    const tabButtonClass = (selected: boolean) => `
        px-6 py-3 font-medium text-sm leading-5 rounded-md focus:outline-none transition-colors duration-200
        ${selected
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }
    `;

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="flex justify-center mb-6">
                <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button onClick={() => setTask('Task 1')} className={tabButtonClass(task === 'Task 1')}>Task 1</button>
                    <button onClick={() => setTask('Task 2')} className={tabButtonClass(task === 'Task 2')}>Task 2</button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 lg:gap-8">
                {/* Left Column: Prompt & Essay */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Your Writing Prompt</h3>
                        <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg min-h-[80px] flex items-center">
                            {isLoadingPrompt ? <SkeletonLoader className="h-5 w-full" /> : <p className="text-slate-700 dark:text-slate-300">{prompt}</p>}
                        </div>
                        <button
                            onClick={() => loadNewPrompt(task)}
                            disabled={isLoadingPrompt || isGettingFeedback}
                            className="select-none mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold transition disabled:opacity-50"
                        >
                            <SparklesIcon className="w-3 h-3" />
                            Get New Prompt
                        </button>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="essay-input" className="block text-lg font-bold text-slate-800 dark:text-white">Your Essay</label>
                             {!isTimerRunning && timer === 0 ? (
                                <button onClick={startTimer} className="text-sm font-semibold text-indigo-600 hover:underline">Start Timer</button>
                             ) : (
                                <div className="flex items-center gap-2">
                                     <span className={`font-mono font-bold text-lg ${timer < 60 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>{formatTime(timer)}</span>
                                     <button onClick={resetTimer} className="text-sm font-semibold text-slate-500 hover:underline">Reset</button>
                                </div>
                             )}
                        </div>
                        <textarea
                            id="essay-input"
                            rows={18}
                            value={essay}
                            onChange={(e) => setEssay(e.target.value)}
                            placeholder={task === 'Task 1' ? 'Write at least 150 words...' : 'Write at least 250 words...'}
                            className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                            disabled={isGettingFeedback}
                        />
                         <div className="text-right text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                           Word Count: <span className={`font-bold ${wordCount < (task === 'Task 1' ? 150 : 250) ? 'text-rose-500' : 'text-teal-600'}`}>{wordCount}</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleGetFeedback}
                            disabled={isGettingFeedback || !essay.trim()}
                            className="select-none w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                        >
                            {isGettingFeedback ? 'Analyzing...' : 'Get Feedback'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Feedback */}
                <div className="mt-8 lg:mt-0">
                    {isGettingFeedback && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                             <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Generating Your Feedback...</h3>
                                <p className="text-slate-500">This may take a moment.</p>
                             </div>
                            <SkeletonLoader className="h-16 w-full rounded-lg" />
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <SkeletonLoader className="h-32 w-full rounded-lg" />
                                <SkeletonLoader className="h-32 w-full rounded-lg" />
                                <SkeletonLoader className="h-32 w-full rounded-lg" />
                                <SkeletonLoader className="h-32 w-full rounded-lg" />
                            </div>
                        </div>
                    )}
                    {feedback && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                             <h3 className="text-xl text-center font-bold text-slate-800 dark:text-white mb-4">Your Detailed Assessment</h3>
                            <FeedbackDisplay 
                                feedback={feedback} 
                                onGetModelAnswer={handleGetModelAnswer}
                                modelAnswer={modelAnswer}
                                isLoadingModelAnswer={isLoadingModelAnswer}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IELTSWriting;