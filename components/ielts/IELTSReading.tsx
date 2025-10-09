import React, { useState, useEffect } from 'react';
import { IELTSReadingExercise, IELTSReadingQuestion } from '../../types';
import { generateIELTSReadingExercise, updateUserProfile } from '../../services/geminiService';
import SkeletonLoader from '../SkeletonLoader';
import { BookOpenIcon, CheckCircleIcon, SparklesIcon } from '../IconComponents';

const IELTSReading: React.FC = () => {
    const [exercise, setExercise] = useState<IELTSReadingExercise | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const loadExercise = async () => {
        setIsLoading(true);
        setIsSubmitted(false);
        setScore(0);
        const fetchedExercise = await generateIELTSReadingExercise();
        setExercise(fetchedExercise);
        setUserAnswers(new Array(fetchedExercise.questions.length).fill(''));
        setIsLoading(false);
    };

    useEffect(() => {
        loadExercise();
    }, []);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        if (isSubmitted) return;
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = answer;
        setUserAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (!exercise) return;
        let correctCount = 0;
        exercise.questions.forEach((q, index) => {
            if (userAnswers[index].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setIsSubmitted(true);

        const scorePercentage = Math.round((correctCount / exercise.questions.length) * 100);
        await updateUserProfile(p => {
            const ielts = p.progress.ielts;
            const newCount = ielts.readingExercisesCompleted + 1;
            const newAvg = ((ielts.avgReadingScore * ielts.readingExercisesCompleted) + scorePercentage) / newCount;
            p.progress.ielts.readingExercisesCompleted = newCount;
            p.progress.ielts.avgReadingScore = Math.round(newAvg);
            return p;
        });
    };

    const renderQuestion = (q: IELTSReadingQuestion, index: number) => {
        const questionNumber = index + 1;
        
        switch (q.questionType) {
            case 'MCQ':
                return (
                    <div key={index}>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{questionNumber}. {q.questionText}</p>
                        <div className="mt-3 space-y-2">
                            {q.options.map((option, oIndex) => {
                                const isSelected = userAnswers[index] === option;
                                const isCorrect = q.correctAnswer === option;
                                let optionClass = 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 border-slate-300 dark:border-slate-600';
                                if (isSubmitted) {
                                    if (isCorrect) optionClass = 'bg-teal-100 dark:bg-teal-900/50 border-teal-500';
                                    else if (isSelected) optionClass = 'bg-rose-100 dark:bg-rose-900/50 border-rose-500';
                                } else if (isSelected) {
                                    optionClass = 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500';
                                }
                                return (
                                    <button key={oIndex} onClick={() => handleAnswerChange(index, option)} className={`select-none w-full text-left p-3 rounded-md border-2 transition-colors ${optionClass}`} disabled={isSubmitted}>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'TFNG':
                const options = ['TRUE', 'FALSE', 'NOT GIVEN'];
                return (
                    <div key={index}>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{questionNumber}. {q.statement}</p>
                        <div className="mt-3 flex space-x-2">
                            {options.map(option => {
                                const isSelected = userAnswers[index] === option;
                                const isCorrect = q.correctAnswer === option;
                                let buttonClass = 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600';
                                if (isSubmitted) {
                                    if (isCorrect) buttonClass = 'bg-teal-100 dark:bg-teal-900/50 border-teal-500 text-teal-800 dark:text-teal-200';
                                    else if (isSelected) buttonClass = 'bg-rose-100 dark:bg-rose-900/50 border-rose-500 text-rose-800 dark:text-rose-200';
                                } else if (isSelected) {
                                    buttonClass = 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 text-indigo-800 dark:text-indigo-200';
                                }
                                return (
                                    <button key={option} onClick={() => handleAnswerChange(index, option)} className={`flex-1 select-none text-center p-2 rounded-md border-2 font-semibold transition-colors ${buttonClass}`} disabled={isSubmitted}>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6 md:p-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                 <SkeletonLoader className="h-8 w-1/2 mx-auto mb-2" />
                 <SkeletonLoader className="h-5 w-3/4 mx-auto mb-8" />
                 <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                         <SkeletonLoader className="h-6 w-3/4 mb-4" />
                         <SkeletonLoader className="h-96 w-full" />
                    </div>
                     <div>
                         <SkeletonLoader className="h-6 w-1/2 mb-4" />
                         <SkeletonLoader className="h-32 w-full mb-4" />
                         <SkeletonLoader className="h-32 w-full" />
                    </div>
                 </div>
            </div>
        );
    }
    
    if (!exercise) return null;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                 <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <BookOpenIcon className="w-8 h-8 text-indigo-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{exercise.title}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Read the passage and answer the questions that follow.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Passage */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Reading Passage</h3>
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-h-[80vh] overflow-y-auto pr-2 text-slate-700 dark:text-slate-300">
                            <p className="whitespace-pre-wrap">{exercise.passage}</p>
                        </div>
                    </div>
                    {/* Questions */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Questions</h3>
                        <div className="space-y-6">
                            {exercise.questions.map(renderQuestion)}
                        </div>
                         <div className="mt-8 text-center">
                            {!isSubmitted ? (
                                <button onClick={handleSubmit} className="select-none px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                                    Check Answers
                                </button>
                            ) : (
                                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-800 dark:text-indigo-200 animate-fade-in">
                                    <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                                        <CheckCircleIcon className="w-6 h-6" />
                                        Results
                                    </h3>
                                    <p className="mt-1 text-2xl">You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{exercise.questions.length}</span>.</p>
                                    <button onClick={loadExercise} className="mt-4 select-none inline-flex items-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800">
                                        <SparklesIcon className="w-4 h-4" />
                                        Try a New Exercise
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IELTSReading;