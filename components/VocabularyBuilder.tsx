import React, { useState, useEffect } from 'react';
import { VocabularyWord, UserProfile } from '../types';
import { getVocabularyWords, updateUserProfile, getUserProfile } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import { CheckCircleIcon } from './IconComponents';

// Spaced Repetition System intervals in days
const srsIntervalsDays = [1, 3, 7, 14, 30, 90, 180];

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const VocabularyBuilder: React.FC = () => {
    const [allWords, setAllWords] = useState<VocabularyWord[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [studyDeck, setStudyDeck] = useState<VocabularyWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, new: 0 });

    const fetchAndBuildDeck = async () => {
        setIsLoading(true);
        const [fetchedWords, userProfile] = await Promise.all([getVocabularyWords(), getUserProfile()]);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const vocabProgress = userProfile.vocabularyProgress || {};
        
        const dueForReview: VocabularyWord[] = [];
        const newWords: VocabularyWord[] = [];

        fetchedWords.forEach(word => {
            const progress = vocabProgress[word.word];
            if (progress) {
                const nextReviewDate = new Date(progress.nextReviewDate);
                if (nextReviewDate <= today) {
                    dueForReview.push(word);
                }
            } else {
                newWords.push(word);
            }
        });

        setSessionStats({ reviewed: dueForReview.length, new: newWords.length });
        setAllWords(fetchedWords);
        setProfile(userProfile);
        setStudyDeck([...dueForReview, ...newWords]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAndBuildDeck();
    }, []);

    const handleAssessment = async (knewIt: boolean) => {
        if (!profile) return;
        
        const currentWord = studyDeck[currentIndex];
        const progress = profile.vocabularyProgress || {};
        const wordProgress = progress[currentWord.word] || { srsStage: 0 };
        
        let newSrsStage;
        if (knewIt) {
            newSrsStage = wordProgress.srsStage + 1;
        } else {
            // Reset progress to the first interval
            newSrsStage = 0; 
        }
        
        // Use the stage to get the interval, capping at the max defined interval
        const interval = srsIntervalsDays[Math.min(newSrsStage, srsIntervalsDays.length - 1)];
        const nextReviewDate = addDays(new Date(), interval);

        const updatedProfile = await updateUserProfile(p => ({
            ...p,
            vocabularyProgress: {
                ...p.vocabularyProgress,
                [currentWord.word]: {
                    srsStage: newSrsStage,
                    nextReviewDate: nextReviewDate.toISOString(),
                }
            }
        }));
        setProfile(updatedProfile);

        // Animate flip back and move to the next card
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 200);
    };

    const SkeletonCard = () => (
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 min-h-[50vh] flex flex-col items-center justify-center w-full">
            <SkeletonLoader className="h-8 w-3/4 mb-8" />
            <SkeletonLoader className="w-full max-w-md h-64 rounded-xl" />
            <div className="mt-8 flex items-center gap-4">
                <SkeletonLoader className="w-64 h-12" />
            </div>
        </div>
    );
    
    if (isLoading) {
        return <SkeletonCard />;
    }

    if (studyDeck.length === 0 || currentIndex >= studyDeck.length) {
        return (
            <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                 <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Done for Today!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">You've reviewed all your due cards. Come back tomorrow for more.</p>
                <button 
                    onClick={fetchAndBuildDeck}
                    className="mt-6 px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Start New Session
                </button>
            </div>
        );
    }
    
    const currentWord = studyDeck[currentIndex];

    return (
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <div className="text-center mb-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Vocabulary Practice</h2>
                <div className="flex justify-center gap-6 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Review Due: <span className="font-bold text-blue-500">{sessionStats.reviewed}</span></span>
                    <span>New Cards: <span className="font-bold text-green-500">{sessionStats.new}</span></span>
                </div>
            </div>

            <div className="w-full max-w-md h-64 perspective">
                <div 
                    className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                    {/* Front of Card */}
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-blue-500 text-white rounded-xl shadow-lg">
                        <h3 className="text-4xl font-bold">{currentWord.word}</h3>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-center p-6 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl shadow-lg">
                        <p className="font-semibold text-lg">{currentWord.definition}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 italic">"{currentWord.example}"</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 h-14 w-full max-w-md">
                {!isFlipped ? (
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="px-8 py-3 w-64 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Show Answer
                    </button>
                ) : (
                    <div className="flex items-center gap-4 animate-fade-in">
                        <button 
                            onClick={() => handleAssessment(false)}
                            className="px-6 py-3 w-32 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
                        >
                            Again
                        </button>
                        <button 
                            onClick={() => handleAssessment(true)}
                            className="px-6 py-3 w-32 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600"
                        >
                            Good
                        </button>
                    </div>
                )}
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 h-5">
                {isFlipped ? 'How well did you know this word?' : `Card ${currentIndex + 1} of ${studyDeck.length}`}
             </p>
        </div>
    );
};

export default VocabularyBuilder;