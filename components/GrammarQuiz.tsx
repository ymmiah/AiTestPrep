import React, { useState, useEffect } from 'react';
import { GrammarQuiz } from '../types';
import { getGrammarQuiz, updateUserProfile, BADGES } from '../services/geminiService';
import { useNotification } from '../contexts/NotificationContext';
import SkeletonLoader from './SkeletonLoader';
import { CheckCircleIcon, ExclamationTriangleIcon } from './IconComponents';

const GrammarQuiz: React.FC = () => {
    const [quiz, setQuiz] = useState<GrammarQuiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [showResult, setShowResult] = useState(false);
    const { addNotification } = useNotification();

    const loadQuiz = async () => {
        setIsLoading(true);
        const fetchedQuiz = await getGrammarQuiz();
        setQuiz(fetchedQuiz);
        setUserAnswers(new Array(fetchedQuiz.questions.length).fill(null));
        setCurrentQuestionIndex(0);
        setShowResult(false);
        setIsLoading(false);
    };

    useEffect(() => {
        loadQuiz();
    }, []);

    const handleAnswer = (optionIndex: number) => {
        if (userAnswers[currentQuestionIndex] !== null) return; // Prevent changing answer
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };
    
    const handleNext = async () => {
        if (currentQuestionIndex < quiz!.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowResult(true);
            const score = userAnswers.filter((answer, index) => answer === quiz?.questions[index].correctAnswerIndex).length;
            const pointsAwarded = score * 10;
            const isPerfectScore = score === quiz!.questions.length;

            await updateUserProfile(profile => {
                profile.points += pointsAwarded;
                if (isPerfectScore) {
                    const grammarBadge = BADGES.GRAMMAR_GURU;
                    // Add badge only if the user doesn't already have it
                    if (!profile.badges.find(b => b.id === grammarBadge.id)) {
                        profile.badges.push(grammarBadge);
                    }
                }
                return profile;
            });

            addNotification({
                type: 'success',
                title: 'Quiz Complete!',
                message: `You scored ${score}/${quiz!.questions.length} and earned ${pointsAwarded} points.`,
            });

            if (isPerfectScore) {
                 addNotification({
                    type: 'achievement',
                    title: 'New Badge Unlocked!',
                    message: 'You earned the "Grammar Guru" badge for a perfect score.',
                    action: { label: 'View Profile' }
                });
            }
        }
    };

    if (isLoading || !quiz) {
        return (
            <div className="space-y-4">
                <SkeletonLoader className="h-6 w-3/4" />
                <SkeletonLoader className="h-12 w-full" />
                <SkeletonLoader className="h-12 w-full" />
                <SkeletonLoader className="h-10 w-1/3 mt-4" />
            </div>
        );
    }
    
    const score = userAnswers.filter((answer, index) => answer === quiz?.questions[index].correctAnswerIndex).length;

    if (showResult) {
        return (
             <div className="text-center p-6 bg-gray-50 dark:bg-slate-800/50 rounded-lg animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Quiz Complete!</h3>
                <p className="text-2xl font-bold my-4 text-blue-600 dark:text-blue-400">
                    Your score: {score} / {quiz.questions.length}
                </p>
                <button
                    onClick={loadQuiz}
                    className="select-none px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                >
                    Try Another Quiz
                </button>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];

    return (
        <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">{quiz.title}</h3>
            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {currentQuestionIndex + 1}. {currentQuestion.question}
                </p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = userAnswer === index;
                        const isCorrect = currentQuestion.correctAnswerIndex === index;
                        let optionClass = 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border-gray-300 dark:border-slate-600';
                        if(userAnswer !== null) {
                            if(isCorrect) {
                                optionClass = 'bg-green-100 dark:bg-green-900/50 border-green-500';
                            } else if (isSelected) {
                                optionClass = 'bg-red-100 dark:bg-red-900/50 border-red-500';
                            }
                        }
                        
                        return (
                            <button key={index} onClick={() => handleAnswer(index)} disabled={userAnswer !== null} className={`select-none w-full text-left p-3 rounded-md border-2 transition-colors ${optionClass}`}>
                                {option}
                            </button>
                        );
                    })}
                </div>
                 {userAnswer !== null && (
                    <div className={`mt-4 p-3 rounded-lg animate-fade-in ${userAnswer === currentQuestion.correctAnswerIndex ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                         <p className="font-semibold flex items-center gap-2">
                             {userAnswer === currentQuestion.correctAnswerIndex ? <CheckCircleIcon className="w-5 h-5"/> : <ExclamationTriangleIcon className="w-5 h-5"/>}
                             {userAnswer === currentQuestion.correctAnswerIndex ? 'Correct!' : 'Incorrect.'}
                        </p>
                        <p className="text-sm mt-1">{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>
            <div className="mt-6 text-right">
                <button onClick={handleNext} disabled={userAnswer === null} className="select-none px-6 py-2 text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed">
                    {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default GrammarQuiz;