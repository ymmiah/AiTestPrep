import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, FinalAssessment, TranscriptAnalysis, View } from '../types';
import { startMockTestSession, generateFinalAssessment, updateUserProfile, endMockTestSession, generateTestImage, generateTranscriptAnalysis, getUserProfile } from '../services/geminiService';
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
type TestPart = 'intro' | 'picture' | 'topic1' | 'topic2';
type TestStep = 'idle' | 'running' | 'results';

interface MockTestProps {
  setActiveView: (view: View) => void;
}

const MockTest: React.FC<MockTestProps> = ({ setActiveView }) => {
    const [testStep, setTestStep] = useState<TestStep>('idle');
    const [testPart, setTestPart] = useState<TestPart>('intro');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [finalAssessment, setFinalAssessment] = useState<FinalAssessment | null>(null);
    const [transcriptAnalysis, setTranscriptAnalysis] = useState<TranscriptAnalysis | null>(null);
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);


    const chatSessionRef = useRef<Chat | null>(null);
    const timerRef = useRef<number | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotification();
    const { isSpeaking, speak, cancel: cancelSpeech } = useTextToSpeech();
    const { isListening, startListening, stopListening, hasRecognitionSupport, error } = useSpeechRecognition(handleTranscript);

    useEffect(() => {
        const fetchDevMode = async () => {
            const profile = await getUserProfile();
            setIsDevMode(profile.isDeveloperMode || false);
        };
        fetchDevMode();
        
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

        setTestStep('results');
        setIsLoadingResults(true);
        setTranscriptAnalysis(null);
        setFinalAssessment(null);

        try {
            const [analysis, assessment] = await Promise.all([
                generateTranscriptAnalysis(messages, imageUrl),
                generateFinalAssessment(messages)
            ]);
            
            setTranscriptAnalysis(analysis);
            setFinalAssessment(assessment);

            const points = Math.round((assessment?.overallScore || 0) * 1.5);
            if (points > 0) {
                await updateUserProfile(profile => ({
                    ...profile,
                    points: profile.points + points,
                }));
                
                addNotification({
                    type: 'success',
                    title: 'Test Complete!',
                    message: `You earned ${points} points. Your results are ready.`,
                });
            } else {
                 addNotification({
                    type: 'info',
                    title: 'Test Complete!',
                    message: `Your results are ready to view.`,
                });
            }
        } catch (error) {
            console.error("Failed to get test results:", error);
            addNotification({
                type: 'info',
                title: 'Results Error',
                message: 'Could not generate the full results for your test.',
            });
        } finally {
            setIsLoadingResults(false);
        }

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
        setTranscriptAnalysis(null);
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
            
            // Part transition logic based on the strict transition phrases from the system prompt.
            if (modelText.includes("ask you for some directions")) {
                setTestPart('topic2');
            } else if (modelText.includes("Now, let's talk about")) {
                setTestPart('topic1');
            } else if (modelText.includes("we are going to look at a picture")) {
                setTestPart('picture');
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
    
    const handleRetakeTest = () => {
        setImageUrl(null);
        setTestStep('idle');
    };

    const handleBackToDashboard = () => {
        setActiveView('dashboard');
    };

    const isAiTurn = isProcessing || isSpeaking;
    
    const partTitles: { [key in TestPart]: string } = {
        intro: 'Part 1: Introduction',
        picture: 'Part 2: Picture Description',
        topic1: 'Part 3: Topic Discussion',
        topic2: 'Part 4: Directions Task',
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
                className="select-none mt-8 px-8 py-3 text-lg font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
            >
                Start Test
            </button>
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
                <div className="flex justify-center items-center gap-4">
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
                            className={`select-none flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 active:scale-95
                            ${isListening 
                                ? 'bg-red-500 text-white focus:ring-red-300 animate-pulse' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
                            }`}
                            aria-label={isListening ? 'Stop recording' : 'Start recording'}
                        >
                            <MicrophoneIcon className="w-8 h-8" />
                        </button>
                    )}
                    {isDevMode && !isAiTurn && !isListening && (
                        <button
                            onClick={() => handleTranscript('[DEV_SKIP]')}
                            className="select-none px-4 py-2 rounded-full font-bold bg-slate-500 text-white hover:bg-slate-600 active:bg-slate-700 shadow-lg text-sm"
                            aria-label="Developer Skip"
                        >
                            Skip
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
        case 'results':
            return <TranscriptReview
                messages={messages}
                analysis={transcriptAnalysis}
                assessment={finalAssessment}
                imageUrl={imageUrl}
                isLoading={isLoadingResults}
                onRetake={handleRetakeTest}
                onBackToDashboard={handleBackToDashboard}
            />;
        default:
            return renderIdleView();
    }
};

export default MockTest;
