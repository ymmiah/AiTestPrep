import React, { useState, useEffect, useRef } from 'react';
import { IELTSListeningExercise, IELTSListeningQuestion, IELTSListeningFormQuestion, IELTSListeningMCQ } from '../../types';
import { generateIELTSListeningExercise } from '../../services/geminiService';
import { HeadphonesIcon, SpeakerWaveIcon, CheckCircleIcon, SparklesIcon } from '../IconComponents';
import SkeletonLoader from '../SkeletonLoader';

type ExerciseState = 'loading' | 'ready' | 'playing' | 'finished' | 'results';

const IELTSListening: React.FC = () => {
    const [exercise, setExercise] = useState<IELTSListeningExercise | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [exerciseState, setExerciseState] = useState<ExerciseState>('loading');
    const [score, setScore] = useState(0);

    const timerRef = useRef<number | null>(null);

    const loadExercise = async () => {
        setExerciseState('loading');
        setScore(0);
        if (timerRef.current) clearTimeout(timerRef.current);
        
        const fetchedExercise = await generateIELTSListeningExercise();
        setExercise(fetchedExercise);
        setUserAnswers(new Array(fetchedExercise.questions.length).fill(''));
        setExerciseState('ready');
    };

    useEffect(() => {
        loadExercise();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handlePlay = () => {
        if (!exercise) return;
        setExerciseState('playing');
        timerRef.current = window.setTimeout(() => {
            setExerciseState('finished');
        }, exercise.audioDuration * 1000);
    };

    const handleAnswerChange = (index: number, value: string) => {
        if (exerciseState === 'results' || exerciseState === 'loading' || exerciseState === 'ready') return;
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
    };

    const checkAnswers = () => {
        if (!exercise) return;
        let correctCount = 0;
        exercise.questions.forEach((q, index) => {
            const userAnswer = userAnswers[index].trim().toLowerCase();
            const correctAnswer = q.correctAnswer.trim().toLowerCase();
            if (userAnswer === correctAnswer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setExerciseState('results');
    };
    
    if (exerciseState === 'loading') {
        return (
            <div className="max-w-3xl mx-auto">
                 <SkeletonLoader className="h-8 w-1/2 mx-auto mb-2" />
                 <SkeletonLoader className="h-5 w-3/4 mx-auto mb-8" />
                 <SkeletonLoader className="h-20 w-full mb-6" />
                 <div className="space-y-4">
                    <SkeletonLoader className="h-24 w-full" />
                    <SkeletonLoader className="h-12 w-full" />
                    <SkeletonLoader className="h-24 w-full" />
                 </div>
            </div>
        );
    }
    
    if (!exercise) return null;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <HeadphonesIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">IELTS Listening Practice</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Press play to start the audio. You can only listen once. Answer the questions as you listen. This exercise includes multiple choice and form completion questions.
                    </p>
                </div>
                
                {/* Mock Audio Player */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-4">
                    <button 
                        onClick={handlePlay} 
                        disabled={exerciseState !== 'ready'}
                        className="p-3 rounded-full bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 active:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
                    >
                        <SpeakerWaveIcon className="w-6 h-6" />
                    </button>
                    <div className="text-gray-600 dark:text-gray-400 font-semibold">
                        {exerciseState === 'playing' && 'Playing audio...'}
                        {exerciseState === 'finished' && 'Audio finished. Check your answers.'}
                        {exerciseState === 'results' && 'Exercise complete.'}
                        {exerciseState === 'ready' && 'Ready to play.'}
                    </div>
                </div>

                {/* Questions Form */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-center mb-6">{exercise.title}</h3>
                    <div className="space-y-6">
                        {exercise.questions.map((q, qIndex) => {
                            if (q.questionType === 'MCQ') {
                                const mcq = q as IELTSListeningMCQ;
                                return (
                                    <div key={mcq.questionNumber}>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{mcq.questionNumber}. {mcq.questionText}</p>
                                        <div className="mt-3 space-y-2">
                                            {mcq.options.map((option, oIndex) => {
                                                const isSelected = userAnswers[qIndex] === option;
                                                const isCorrect = mcq.correctAnswer === option;
                                                let optionClass = 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border-gray-300 dark:border-slate-600';
                                                
                                                if(exerciseState === 'results') {
                                                    if(isCorrect) {
                                                        optionClass = 'bg-green-100 dark:bg-green-900/50 border-green-500';
                                                    } else if (isSelected && !isCorrect) {
                                                        optionClass = 'bg-red-100 dark:bg-red-900/50 border-red-500';
                                                    }
                                                } else if (isSelected) {
                                                    optionClass = 'bg-blue-100 dark:bg-blue-900/50 border-blue-500';
                                                }
                                                
                                                return (
                                                    <button 
                                                        key={oIndex}
                                                        onClick={() => handleAnswerChange(qIndex, option)}
                                                        className={`select-none w-full text-left p-3 rounded-md border-2 transition-colors ${optionClass}`}
                                                        disabled={exerciseState === 'results' || exerciseState === 'loading' || exerciseState === 'ready'}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            } else {
                                const formQ = q as IELTSListeningFormQuestion;
                                const [before, after] = formQ.questionText.split('_____');
                                const isCorrect = exerciseState === 'results' && userAnswers[qIndex].trim().toLowerCase() === formQ.correctAnswer.trim().toLowerCase();
                                return (
                                     <div key={formQ.questionNumber} className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-slate-800 p-3 rounded-md">
                                        <span className="font-semibold">{formQ.questionNumber}.</span>
                                        <label htmlFor={`q-${formQ.questionNumber}`} className="text-gray-800 dark:text-gray-200">{before}</label>
                                        <input
                                            type="text"
                                            id={`q-${formQ.questionNumber}`}
                                            value={userAnswers[qIndex]}
                                            onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                            disabled={exerciseState === 'results' || exerciseState === 'loading' || exerciseState === 'ready'}
                                            className={`w-40 px-2 py-1 rounded-md border-2 bg-white dark:bg-slate-700 transition-colors ${
                                                exerciseState === 'results' 
                                                    ? (isCorrect ? 'border-green-500' : 'border-red-500')
                                                    : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                        />
                                        <span className="text-gray-800 dark:text-gray-200">{after}</span>
                                        {exerciseState === 'results' && !isCorrect && (
                                            <span className="text-sm font-bold text-green-600 dark:text-green-400">(Correct: {formQ.correctAnswer})</span>
                                        )}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

                {/* Results and Actions */}
                <div className="mt-8 text-center">
                    {exerciseState === 'results' ? (
                        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-800 dark:text-green-200 animate-fade-in">
                            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-6 h-6" />
                                Results
                            </h3>
                            <p className="mt-1 text-2xl">You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{exercise.questions.length}</span>.</p>
                             <button
                                onClick={loadExercise}
                                className="mt-4 select-none inline-flex items-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Try a New Exercise
                            </button>
                        </div>
                    ) : (
                         <button
                            onClick={checkAnswers}
                            disabled={exerciseState !== 'finished'}
                            className="select-none px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Check Answers
                        </button>
                    )}
                </div>
                 {exerciseState === 'results' && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-2">Conversation Transcript</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{exercise.script}</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default IELTSListening;