import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyStory, VocabularyChallenge, StoryChunk, UserProfile } from '../types';
import { generateVocabularyStory, updateUserProfile, getUserProfile } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import { CheckCircleIcon, SparklesIcon } from './IconComponents';
import { useNotification } from '../contexts/NotificationContext';

// Spaced Repetition System intervals in days
const srsIntervalsDays = [1, 3, 7, 14, 30, 90, 180];

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

type GameState = 'loading' | 'playing' | 'reviewing' | 'finished';

const VocabularyBuilder: React.FC = () => {
    const [story, setStory] = useState<VocabularyStory | null>(null);
    const [gameState, setGameState] = useState<GameState>('loading');
    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const { addNotification } = useNotification();

    const challenges = useMemo(() => {
        if (!story) return [];
        return story.chunks.filter(chunk => typeof chunk !== 'string') as { challenge: VocabularyChallenge }[];
    }, [story]);

    const startNewSession = async () => {
        setGameState('loading');
        setUserAnswers([]);
        setCurrentChallengeIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        const [fetchedStory, errorMessage] = await generateVocabularyStory();

        if (errorMessage) {
            addNotification({
                type: 'info',
                title: 'Using Default Story',
                message: errorMessage,
            });
        }

        setStory(fetchedStory);
        setGameState('playing');
    };

    useEffect(() => {
        startNewSession();
    }, []);

    const handleOptionSelect = async (option: string) => {
        if (selectedOption) return; // Prevent multiple clicks

        const currentChallenge = challenges[currentChallengeIndex].challenge;
        setSelectedOption(option);

        const correct = option === currentChallenge.word;
        setIsCorrect(correct);

        if (correct) {
            // Update SRS in the background
            const interval = srsIntervalsDays[0]; // First successful answer
            const nextReviewDate = addDays(new Date(), interval);
            await updateUserProfile(p => ({
                ...p,
                vocabularyProgress: {
                    ...p.vocabularyProgress,
                    [currentChallenge.word]: {
                        srsStage: 1, // Start at stage 1
                        nextReviewDate: nextReviewDate.toISOString(),
                    }
                }
            }));

            // Proceed to next question after a delay
            setTimeout(() => {
                setUserAnswers(prev => [...prev, currentChallenge.word]);
                setCurrentChallengeIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsCorrect(null);
                if (currentChallengeIndex + 1 >= challenges.length) {
                    setGameState('reviewing');
                }
            }, 1500);
        }
    };
    
    const renderStory = () => {
        if (!story) return null;
        
        let challengeCounter = -1;
        return (
            <p className="text-lg/relaxed text-gray-700 dark:text-gray-300">
                {story.chunks.map((chunk, index) => {
                    if (typeof chunk === 'string') {
                        return <span key={index}>{chunk}</span>;
                    }
                    challengeCounter++;
                    if (challengeCounter < currentChallengeIndex) {
                        return <strong key={index} className="text-blue-600 dark:text-blue-400 font-semibold animate-fade-in">{chunk.challenge.word}</strong>
                    }
                    if (challengeCounter === currentChallengeIndex) {
                        return <span key={index} className="inline-block w-24 h-6 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse mx-1"></span>
                    }
                    return null;
                })}
            </p>
        );
    };

    const LoadingView = () => (
        <div className="w-full max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Word Weaver</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Weaving a new story for you to complete...</p>
            <SkeletonLoader className="h-6 w-3/4 mx-auto mb-4" />
            <SkeletonLoader className="h-32 w-full mx-auto mb-6" />
            <div className="grid grid-cols-2 gap-4">
                <SkeletonLoader className="h-14 w-full rounded-lg" />
                <SkeletonLoader className="h-14 w-full rounded-lg" />
            </div>
        </div>
    );
    
    const FinishedView = () => (
        <div className="w-full max-w-2xl text-center animate-fade-in">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Story Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Excellent work! You've learned new words by completing the story.</p>
            <button
                onClick={startNewSession}
                className="select-none px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
            >
                Start a New Story
            </button>
        </div>
    );

    const ReviewView = () => (
        <div className="w-full max-w-2xl text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Story Complete!</h2>
             <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">Here are the words you learned in this story.</p>
             <div className="space-y-4 text-left">
                {challenges.map(({ challenge }) => (
                     <div key={challenge.word} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{challenge.word}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-1">{challenge.pronunciation} ({challenge.type})</p>
                        <p className="text-gray-700 dark:text-gray-300">{challenge.definition}</p>
                     </div>
                ))}
             </div>
             <button
                onClick={() => setGameState('finished')}
                className="select-none mt-8 px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 active:bg-green-800"
             >
                Continue
             </button>
        </div>
    );

    const PlayingView = () => {
        if (!story) return null;

        // FIX: Add a guard to prevent accessing an out-of-bounds index, which causes a crash.
        // This can happen briefly during the state transition from the last question to the review screen.
        if (currentChallengeIndex >= challenges.length) {
            return null;
        }

        const currentChallenge = challenges[currentChallengeIndex].challenge;
        const options = useMemo(() => shuffleArray([...currentChallenge.distractors, currentChallenge.word]), [currentChallenge]);

        return (
            <div className="w-full max-w-2xl animate-fade-in">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{story.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Choose the correct word to complete the story.</p>
                </div>

                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 my-6">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(currentChallengeIndex / challenges.length) * 100}%` }}></div>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 mb-6 min-h-[120px]">
                    {renderStory()}
                </div>
                
                <p className="text-center font-semibold text-gray-800 dark:text-white mb-4">Which word fits best?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {options.map(option => {
                         const isSelected = selectedOption === option;
                         const isTheCorrectAnswer = option === currentChallenge.word;
                         let buttonClass = 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border-gray-300 dark:border-slate-600';

                         if (isSelected) {
                            buttonClass = isCorrect 
                                ? 'bg-green-500 border-green-700 text-white' 
                                : 'bg-red-500 border-red-700 text-white';
                         } else if (selectedOption && isTheCorrectAnswer) {
                            buttonClass = 'bg-green-200 dark:bg-green-900/50 border-green-500';
                         }

                        return (
                             <button 
                                key={option}
                                onClick={() => handleOptionSelect(option)}
                                disabled={!!selectedOption}
                                className={`select-none w-full text-center p-4 rounded-lg border-2 font-semibold text-lg transition-all duration-300 ${buttonClass}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                
                {selectedOption && (
                     <div className="mt-4 p-4 rounded-lg text-center animate-fade-in bg-gray-100 dark:bg-slate-800">
                        {isCorrect ? (
                             <p className="font-semibold text-green-700 dark:text-green-300">Correct! <strong className="text-green-800 dark:text-green-200">{currentChallenge.word}</strong> means: "{currentChallenge.definition}"</p>
                        ) : (
                            <p className="font-semibold text-red-700 dark:text-red-300">Not quite. Try another option!</p>
                        )}
                     </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[70vh]">
            {gameState === 'loading' && <LoadingView />}
            {gameState === 'playing' && <PlayingView />}
            {gameState === 'reviewing' && <ReviewView />}
            {gameState === 'finished' && <FinishedView />}
        </div>
    );
};

export default VocabularyBuilder;