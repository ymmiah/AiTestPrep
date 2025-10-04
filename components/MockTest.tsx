import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, FinalAssessment } from '../types';
import { startMockTestSession, generateFinalAssessment, updateUserProfile, endMockTestSession, generateTestImage } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useNotification } from '../contexts/NotificationContext';
import MessageBubble from './MessageBubble';
import TranscriptReview from './TranscriptReview';
import PictureCard from './PictureCard';
import { MicrophoneIcon, StopIcon, ClipboardDocumentCheckIcon } from './IconComponents';
import { Chat } from '@google/genai';
import SkeletonLoader from './SkeletonLoader';

const TEST_DURATION_SECONDS = 420; // 7 minutes

const MockTest: React.FC = () => {
    const [testStep, setTestStep] = useState<'idle' | 'running' | 'finished'>('idle');
    const [testPart, setTestPart] = useState<'intro' | 'picture' | 'conversation'>('intro');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [finalAssessment, setFinalAssessment] = useState<FinalAssessment | null>(null);
    const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);

    const chatSessionRef = useRef<Chat | null>(null);
    const timerRef = useRef<number | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotification();
    const { isSpeaking, speak, cancel: cancelSpeech } = useTextToSpeech();
    const { isListening, startListening, stopListening, hasRecognitionSupport, error } = useSpeechRecognition(handleTranscript);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            cancelSpeech();
            endMockTestSession();
        };
    }, []);

     useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleFinishTest = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        stopListening();
        cancelSpeech();

        setTestStep('finished');
        setIsLoadingAssessment(true);

        const assessment = await generateFinalAssessment(messages);
        setFinalAssessment(assessment);
        setIsLoadingAssessment(false);

        const points = Math.round(assessment.overallScore * 1.5); // Award points based on score
        await updateUserProfile(profile => ({
            ...profile,
            points: profile.points + points,
        }));
        
        addNotification({
            type: 'success',
            title: 'Test Complete!',
            message: `You earned ${points} points for completing the exam.`,
        });

        endMockTestSession();
    };


    useEffect(() => {
        if (testStep === 'running' && timeLeft <= 0) {
            handleFinishTest();
        }
    }, [timeLeft, testStep]);

    const handleStartTest = async () => {
        setTestStep('running');
        setTestPart('intro');
        setIsImageLoading(true);
        setImageUrl(null);
        setTimeLeft(TEST_DURATION_SECONDS);
        setMessages([]);
        setFinalAssessment(null);
        setIsProcessing(true);

        // Generate image in the background, but don't show it yet
        generateTestImage().then(url => {
            setImageUrl(url);
            setIsImageLoading(false);
        });

        chatSessionRef.current = startMockTestSession();

        // Start timer
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        
        // Get the first message from the examiner
        const result = await chatSessionRef.current.sendMessage({ message: "Begin the test." });
        const firstMessage: Message = { role: Role.MODEL, text: result.text.trim() };
        
        setMessages([firstMessage]);
        speak(firstMessage.text);
        setIsProcessing(false);
    };

    async function handleTranscript(transcript: string) {
        if (transcript.trim() === '') return;
        
        const userMessage: Message = { role: Role.USER, text: transcript };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsProcessing(true);

        if (chatSessionRef.current) {
            const result = await chatSessionRef.current.sendMessage({ message: transcript });
            const modelText = result.text.trim();
            
            // Part transition logic
            if (modelText.includes("Now, let's look at a picture.")) {
                setTestPart('picture');
            } else if (modelText.includes("Now, let's talk about something different.")) {
                setTestPart('conversation');
            }

            if (modelText.toLowerCase().includes("that is the end of the test")) {
                const modelMessage: Message = { role: Role.MODEL, text: modelText };
                setMessages([...updatedMessages, modelMessage]);
                setIsProcessing(false);
                // Wait for the final message to be spoken before finishing the test.
                speak(modelText, handleFinishTest);
            } else {
                const modelMessage: Message = { role: Role.MODEL, text: modelText };
                setMessages([...updatedMessages, modelMessage]);
                speak(modelText);
                setIsProcessing(false);
            }
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isAiTurn = isProcessing || isSpeaking;
    
    const partTitles: { [key in typeof testPart]: string } = {
        intro: 'Part 1: Introduction',
        picture: 'Part 2: Picture Description',
        conversation: 'Part 3: Conversation',
    };

    const renderIdleView = () => (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg flex flex-col items-center justify-center text-center animate-fade-in h-full">
            <ClipboardDocumentCheckIcon className="w-16 h-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">A2 Speaking Mock Exam</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-lg">
                This is a timed, 7-minute simulation of the official A2 English speaking test. The test includes an introduction, a picture description, and a conversation phase. An image will be generated for you to describe.
            </p>
            <button
                onClick={handleStartTest}
                className="mt-8 px-8 py-3 text-lg font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
            >
                Start Test
            </button>
        </div>
    );
    
    const renderFinishedView = () => (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="max-w-3xl mx-auto">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Test Complete!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Here is your final assessment.</p>
                </div>
                {isLoadingAssessment ? (
                    <div className="text-center">
                        <SkeletonLoader className="h-8 w-1/2 mx-auto mb-4" />
                        <SkeletonLoader className="h-48 w-full" />
                    </div>
                ) : finalAssessment && (
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Overall Score</p>
                            <p className="text-5xl font-bold text-blue-600 dark:text-blue-300">{finalAssessment.overallScore}<span className="text-2xl">/100</span></p>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                             <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Strengths</h4>
                             <p className="text-gray-700 dark:text-gray-300">{finalAssessment.strengths}</p>
                        </div>

                         <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                             <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Areas for Improvement</h4>
                             <p className="text-gray-700 dark:text-gray-300">{finalAssessment.areasForImprovement}</p>
                        </div>
                        
                        <TranscriptReview messages={messages} />
                        
                        <button onClick={() => { setImageUrl(null); setTestStep('idle'); }} className="w-full mt-4 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                            Take Another Test
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRunningView = () => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
            <div className="flex-shrink-0 p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{partTitles[testPart]}</h3>
                <div className="px-3 py-1 text-lg font-mono font-bold bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-md tabular-nums">
                    {formatTime(timeLeft)}
                </div>
            </div>

            {testPart === 'picture' && <PictureCard imageUrl={imageUrl} isLoading={isImageLoading} />}

            <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 self-start shadow-md animate-pulse">
                            Examiner is speaking...
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 p-4 sm:p-5 bg-gray-100 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-center items-center">
                    {isAiTurn ? (
                        <button
                            disabled
                            className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-colors duration-300 ease-in-out shadow-lg bg-gray-400 text-white cursor-not-allowed"
                            aria-label="Wait for examiner to finish"
                        >
                            <StopIcon className="w-8 h-8" />
                        </button>
                    ) : (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4
                            ${isListening 
                                ? 'bg-red-500 text-white focus:ring-red-300 animate-pulse' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
                            }`}
                            aria-label={isListening ? 'Stop recording' : 'Start recording'}
                        >
                            <MicrophoneIcon className="w-8 h-8" />
                        </button>
                    )}
                </div>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 h-5 flex items-center justify-center">
                    {error ? <span className="text-red-500 font-medium">{error}</span> :
                    isListening ? 'Listening...' : 
                    isProcessing ? 'Waiting for examiner...' : 
                    isSpeaking ? 'Examiner is speaking...' :
                    'Tap the microphone to speak'}
                </p>
            </div>
        </div>
    );
    
    switch(testStep) {
        case 'idle':
            return renderIdleView();
        case 'running':
            return renderRunningView();
        case 'finished':
            return renderFinishedView();
        default:
            return renderIdleView();
    }
};

export default MockTest;