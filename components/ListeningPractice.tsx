import React, { useState, useEffect } from 'react';
import { ListeningExercise } from '../types';
import { getListeningExercise, updateUserProfile } from '../services/geminiService';
import { CheckCircleIcon } from './IconComponents';
import SkeletonLoader from './SkeletonLoader';

const ListeningPractice: React.FC = () => {
    const [exercise, setExercise] = useState<ListeningExercise | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchExercise = async () => {
            setIsLoading(true);
            const fetchedExercise = await getListeningExercise();
            setExercise(fetchedExercise);
            setUserAnswers(new Array(fetchedExercise.questions.length).fill(null));
            setIsLoading(false);
        };
        fetchExercise();
    }, []);

    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
        if (isSubmitted) return;
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };
    
    const handleSubmit = async () => {
        if (!exercise) return;

        const calculatedScore = userAnswers.reduce((acc, answer, index) => {
            return answer === exercise.questions[index].correctAnswerIndex ? acc + 1 : acc;
        }, 0);
        setScore(calculatedScore);
        setIsSubmitted(true);

        const scorePercentage = Math.round((calculatedScore / exercise.questions.length) * 100);

        await updateUserProfile(profile => {
            const { listeningScore } = profile.progress.a2;
            // Average the new score with the old one. Could be improved with a running average.
            if (listeningScore > 0) {
                 profile.progress.a2.listeningScore = Math.round((listeningScore + scorePercentage) / 2);
            } else {
                 profile.progress.a2.listeningScore = scorePercentage;
            }
            return profile;
        });
    };

    const SkeletonScreen = () => (
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
             <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <SkeletonLoader className="h-8 w-1/2 mx-auto mb-2" />
                    <SkeletonLoader className="h-5 w-3/4 mx-auto" />
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                     <SkeletonLoader className="h-6 w-1/3 mb-4" />
                     <SkeletonLoader className="h-12 w-full" />
                </div>
                <div className="mt-8 space-y-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i}>
                            <SkeletonLoader className="h-5 w-full mb-3" />
                            <div className="space-y-2">
                                <SkeletonLoader className="h-12 w-full" />
                                <SkeletonLoader className="h-12 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );

    if (isLoading) {
        return <SkeletonScreen />;
    }
    
    if (!exercise) return null;

    return (
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Listening Practice</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Listen to the audio and answer the questions below.</p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{exercise.title}</h3>
                    <div className="mt-4 p-4 bg-gray-200 dark:bg-slate-700 rounded-md text-center">
                        <p className="text-gray-600 dark:text-gray-400">(Mock Audio Player - Press play to listen)</p>
                        {/* In a real app, this would be an <audio> element */}
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    {exercise.questions.map((q, qIndex) => (
                        <div key={qIndex}>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{qIndex + 1}. {q.question}</p>
                            <div className="mt-3 space-y-2">
                                {q.options.map((option, oIndex) => {
                                    const isSelected = userAnswers[qIndex] === oIndex;
                                    const isCorrect = q.correctAnswerIndex === oIndex;
                                    let optionClass = 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border-gray-300 dark:border-slate-600';
                                    if(isSubmitted) {
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
                                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                            className={`select-none w-full text-left p-3 rounded-md border-2 transition-colors ${optionClass}`}
                                            disabled={isSubmitted}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    {!isSubmitted ? (
                        <button 
                            onClick={handleSubmit}
                            className="select-none px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                        >
                            Check Answers
                        </button>
                    ) : (
                        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-800 dark:text-green-200 animate-fade-in">
                            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-6 h-6" />
                                Exercise Complete!
                            </h3>
                            <p className="mt-1">You scored {score} out of {exercise.questions.length}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListeningPractice;