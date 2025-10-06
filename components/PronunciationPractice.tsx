import React, { useState, useEffect } from 'react';
import { PronunciationFeedback } from '../types';
import { generatePracticePhrase, getPronunciationFeedback } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicrophoneIcon, SparklesIcon, ExclamationTriangleIcon } from './IconComponents';
import SkeletonLoader from './SkeletonLoader';

const PronunciationPractice: React.FC = () => {
    const [targetPhrase, setTargetPhrase] = useState('');
    const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
    const [isLoadingPhrase, setIsLoadingPhrase] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userTranscript, setUserTranscript] = useState<string | null>(null);

    const { isListening, startListening, stopListening, error } = useSpeechRecognition(handleTranscript);

    const handleGeneratePhrase = async () => {
        setIsLoadingPhrase(true);
        setFeedback(null);
        setUserTranscript(null);
        const phrase = await generatePracticePhrase();
        setTargetPhrase(phrase);
        setIsLoadingPhrase(false);
    };

    useEffect(() => {
        handleGeneratePhrase();
    }, []);

    async function handleTranscript(transcript: string) {
        if (!transcript.trim()) return;
        setUserTranscript(transcript);
        setIsProcessing(true);
        setFeedback(null);
        const newFeedback = await getPronunciationFeedback(targetPhrase, transcript);
        setFeedback(newFeedback);
        setIsProcessing(false);
    }

    const renderFeedback = () => {
        if (!feedback) return null;

        return (
            <div className="w-full mt-8 animate-fade-in space-y-4">
                <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Overall Feedback</h3>
                    <p className="text-gray-700 dark:text-gray-300">{feedback.overallFeedback}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Word-by-Word Analysis</h3>
                     <div className="flex flex-wrap gap-2">
                        {feedback.wordAnalysis.map((word, index) => (
                            <div key={index} className={`p-2 rounded-md ${word.isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                <span className={`font-bold ${word.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>{word.word}</span>
                            </div>
                        ))}
                    </div>
                    <ul className="mt-4 space-y-3">
                        {feedback.wordAnalysis.filter(w => !w.isCorrect).map((word, index) => (
                            <li key={index} className="flex items-start">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-gray-800 dark:text-gray-100">{word.word}:</span>
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">{word.feedback}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg flex flex-col items-center">
            <div className="max-w-3xl w-full text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pronunciation Practice</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Practice saying the phrase below and get instant feedback.</p>

                <div className="mt-8 p-6 bg-blue-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-blue-200 dark:border-slate-700 min-h-[100px] flex items-center justify-center">
                    {isLoadingPhrase ? (
                        <SkeletonLoader className="h-8 w-3/4" />
                    ) : (
                        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{targetPhrase}</p>
                    )}
                </div>
                 <button
                    onClick={handleGeneratePhrase}
                    disabled={isLoadingPhrase || isListening || isProcessing}
                    className="select-none mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 active:bg-gray-300 dark:active:bg-slate-500 text-sm font-semibold transition disabled:opacity-50"
                >
                    <SparklesIcon className="w-4 h-4" />
                    Get New Phrase
                </button>


                <div className="mt-8">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoadingPhrase || isProcessing}
                        className={`select-none flex items-center justify-center mx-auto w-20 h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 active:scale-95
                        ${isListening 
                            ? 'bg-red-500 text-white focus:ring-red-300 animate-pulse' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
                        }
                        disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        aria-label={isListening ? 'Stop recording' : 'Start recording'}
                    >
                        <MicrophoneIcon className="w-9 h-9" />
                    </button>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 h-5 flex items-center justify-center">
                        {error ? <span className="text-red-500 font-medium">{error}</span> :
                        isListening ? 'Listening...' : 
                        isProcessing ? 'Analyzing your speech...' :
                        'Tap the microphone to speak'}
                    </p>
                </div>
                
                {userTranscript && (
                    <div className="mt-6 text-center p-3 bg-gray-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">We heard:</p>
                        <p className="italic text-gray-700 dark:text-gray-300">"{userTranscript}"</p>
                    </div>
                )}
                
                {isProcessing && (
                    <div className="mt-8 w-full">
                        <SkeletonLoader className="h-24 w-full rounded-lg" />
                    </div>
                )}
                
                {renderFeedback()}

            </div>
        </div>
    );
};

export default PronunciationPractice;