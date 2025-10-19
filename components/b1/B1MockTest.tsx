import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, B1FinalAssessment } from '../../types';
import { generateB1FinalAssessment, updateUserProfile } from '../../services/geminiService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useNotification } from '../../contexts/NotificationContext';
import MessageBubble from '../MessageBubble';
import { MicrophoneIcon, StopIcon, SparklesIcon, ClipboardDocumentCheckIcon, UserCircleIcon } from '../IconComponents';
import { GoogleGenAI, Chat } from '@google/genai';
import SkeletonLoader from '../SkeletonLoader';
import { B1View } from '../../B1Prep';

const TEST_DURATION_SECONDS = 600; // 10 minutes
type TestStep = 'setup' | 'running' | 'results';
type TestPhase = 'topic' | 'conversation';

const getApiKey = (): string => {
    if (process.env.API_KEY) { return process.env.API_KEY; }
    const message = "Gemini API Key not found.";
    alert(message);
    throw new Error(message);
};

interface B1MockTestProps {
  setView: (view: B1View) => void;
}

const B1MockTest: React.FC<B1MockTestProps> = ({ setView }) => {
    const [step, setStep] = useState<TestStep>('setup');
    const [testPhase, setTestPhase] = useState<TestPhase>('topic');
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [finalAssessment, setFinalAssessment] = useState<B1FinalAssessment | null>(null);
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    
    // Setup state
    const [topicTitle, setTopicTitle] = useState('');
    const [topicPoints, setTopicPoints] = useState('');

    const chatSessionRef = useRef<Chat | null>(null);
    const timerRef = useRef<number | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotification();
    const { isSpeaking, speak, cancel: cancelSpeech } = useTextToSpeech();
    const { isListening, startListening, stopListening, error } = useSpeechRecognition(handleTranscript);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            cancelSpeech();
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

        setStep('results');
        setIsLoadingResults(true);
        setFinalAssessment(null);

        try {
            const assessment = await generateB1FinalAssessment(messages, topicTitle, topicPoints);
            setFinalAssessment(assessment);
            
            const points = assessment.overallOutcome === 'Fail' ? 50 : (assessment.overallOutcome === 'Pass' ? 100 : 150);

            await updateUserProfile(profile => {
                profile.points += points;
                profile.progress.b1.mockTestsCompleted += 1;
                const currentAvg = profile.progress.b1.avgScore;
                const newCount = profile.progress.b1.sessionsCompleted + 1; // Count mock test as a session
                const newAvg = ((currentAvg * profile.progress.b1.sessionsCompleted) + (points / 1.5)) / newCount;

                profile.progress.b1.sessionsCompleted = newCount;
                profile.progress.b1.avgScore = Math.round(newAvg);
                return profile;
            });
            
            addNotification({
                type: 'success',
                title: 'Test Complete!',
                message: `You earned ${points} points. Your results are ready.`,
            });
        } catch (error) {
            console.error("Failed to get B1 test results:", error);
            addNotification({ type: 'info', title: 'Results Error', message: 'Could not generate the full results for your test.' });
        } finally {
            setIsLoadingResults(false);
        }
    };

    useEffect(() => {
        if (step === 'running' && timeLeft <= 0) {
            handleFinishTest();
        }
    }, [timeLeft, step]);

    const handleStartTest = async () => {
        if (!topicTitle.trim() || !topicPoints.trim()) return;

        setStep('running');
        setTestPhase('topic');
        setTimeLeft(TEST_DURATION_SECONDS);
        setMessages([]);
        setFinalAssessment(null);
        setIsProcessing(true);

        const systemInstruction = `You are a professional, friendly, and patient examiner for the Trinity GESE Grade 5 (B1) speaking test. Your tone should be encouraging and calm. You will conduct a complete, structured, 10-minute mock test.
CRITICAL INSTRUCTIONS:
- You MUST ask questions ONE AT A TIME and always wait for the user to respond before continuing.
- Do NOT provide any feedback during the test. Only respond as an examiner.
- After approximately 5 minutes, you MUST transition from the Topic Phase to the Conversation Phase.
- In the Conversation Phase, you MUST discuss TWO subjects from the official list.
- After 10 minutes (or when the test is complete), you MUST end with the exact phrase: "That is the end of the test. Thank you."

**User's Prepared Topic:**
- Title: "${topicTitle}"
- Points: ${topicPoints.split('\n').join(', ')}

**Test Structure:**
1.  **Topic Phase (up to 5 minutes):**
    - Start the test with EXACTLY: "Okay, you've chosen to talk about '${topicTitle}'. Please tell me about it." Wait for the user's response.
    - Ask open-ended questions based on the user's topic points to encourage them to talk for about 5 minutes.
    - After about 5 minutes, your NEXT response must ONLY be the transition phrase: "Thank you. Now, let's move on to the conversation phase."

2.  **Conversation Phase (up to 5 minutes):**
    - After the user acknowledges the transition, choose TWO subjects from this list: Festivals, Means of transport, Special occasions, Entertainment, Music, Recent personal experiences.
    - Start the first conversation with a phrase like "Let's talk about [Subject 1]."
    - Ask 2-3 questions about the first subject.
    - Then transition to the second subject with a phrase like "Okay, thank you. Now I'd like to talk about [Subject 2]."
    - Ask 2-3 questions about the second subject.
    - Once the 10-minute mark is near or the conversation is finished, your NEXT response MUST ONLY be: "That is the end of the test. Thank you."`;
        
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        timerRef.current = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        
        const result = await chatSessionRef.current.sendMessage({ message: "Begin the test." });
        const firstMessage: Message = { role: Role.MODEL, text: result.text.trim() };
        
        setMessages([firstMessage]);
        speak(firstMessage.text);
        setIsProcessing(false);
    };

    async function handleTranscript(transcript: string) {
        if (!transcript.trim()) return;
        
        const userMessage: Message = { role: Role.USER, text: transcript };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsProcessing(true);

        if (chatSessionRef.current) {
            const result = await chatSessionRef.current.sendMessage({ message: transcript });
            const modelText = result.text.trim();
            
            if (modelText.includes("Now, let's move on to the conversation phase.")) {
                setTestPhase('conversation');
            }

            if (modelText.toLowerCase().includes("that is the end of the test")) {
                const modelMessage: Message = { role: Role.MODEL, text: modelText };
                setMessages([...updatedMessages, modelMessage]);
                setIsProcessing(false);
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

    const renderSetupView = () => (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">B1 Mock Test Setup</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Prepare your topic and key points below. The timed 10-minute test will begin once you start the session.
                </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                {/* Same form as B1TopicPractice */}
                <div>
                    <label htmlFor="topic-title" className="block text-lg font-bold text-slate-800 dark:text-white">Your Topic Title</label>
                    <input id="topic-title" type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} placeholder="e.g., My Favourite Hobby: Photography" className="mt-2 w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
                </div>
                <div>
                    <label htmlFor="topic-points" className="block text-lg font-bold text-slate-800 dark:text-white">Your Key Points</label>
                    <textarea id="topic-points" rows={5} value={topicPoints} onChange={(e) => setTopicPoints(e.target.value)} placeholder={"e.g.,\n- Why I started photography\n- The type of camera I use\n- What I like to take pictures of (nature, people)\n- My favourite photo"} className="mt-2 w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
                </div>
                <div className="text-center pt-4">
                    <button onClick={handleStartTest} disabled={!topicTitle.trim() || !topicPoints.trim()} className="select-none inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:focus:ring-offset-slate-900">
                        <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        Start Test
                    </button>
                </div>
            </div>
        </div>
    );
    
    const renderRunningView = () => (
         <div className="flex flex-col h-[80vh] bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
            <div className="flex-shrink-0 p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {testPhase === 'topic' ? 'Topic Phase' : 'Conversation Phase'}
                </h3>
                <div className={`px-3 py-1 text-lg font-mono font-bold rounded-md tabular-nums ${timeLeft < 60 ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => <MessageBubble key={index} message={msg} /> )}
                {isProcessing && <div className="text-slate-500 dark:text-slate-400">Thinking...</div>}
            </div>
            <div className="flex-shrink-0 p-4 sm:p-5 bg-gray-100 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-center">
                    <button onClick={isListening ? stopListening : startListening} disabled={isAiTurn} className={`select-none flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 active:scale-95 ${isListening ? 'bg-rose-500 text-white focus:ring-rose-300 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300'} disabled:bg-slate-400 disabled:cursor-not-allowed`}>
                        {isAiTurn ? <StopIcon className="w-8 h-8" /> : <MicrophoneIcon className="w-8 h-8" />}
                    </button>
                </div>
                 <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 h-5 flex items-center justify-center">
                    {error ? <span className="text-rose-500 font-medium">{error}</span> : isListening ? 'Listening...' : isAiTurn ? 'Examiner is speaking...' : 'Tap the microphone to speak'}
                </p>
            </div>
        </div>
    );
    
    const renderResultsView = () => (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
             <div className="w-full max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">B1 Mock Test Results</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Here's a breakdown of your performance.</p>
                </div>
                {isLoadingResults ? <SkeletonLoader className="h-64 w-full" /> : !finalAssessment ? <p>Could not load assessment.</p> : (
                    <div className="space-y-6">
                         <div className={`text-center p-6 rounded-lg border ${finalAssessment.overallOutcome === 'Fail' ? 'bg-rose-50 dark:bg-rose-900/50 border-rose-200 dark:border-rose-700' : 'bg-teal-50 dark:bg-teal-900/50 border-teal-200 dark:border-teal-700'}`}>
                            <p className={`text-sm font-medium ${finalAssessment.overallOutcome === 'Fail' ? 'text-rose-800 dark:text-rose-200' : 'text-teal-800 dark:text-teal-200'}`}>Overall Outcome</p>
                            <p className={`text-4xl font-bold ${finalAssessment.overallOutcome === 'Fail' ? 'text-rose-600 dark:text-rose-300' : 'text-teal-600 dark:text-teal-300'}`}>{finalAssessment.overallOutcome}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-800 dark:text-white">Examiner's Summary</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{finalAssessment.overallFeedback}</p>
                        </div>
                         <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white">Communicative Effectiveness</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{finalAssessment.communicativeEffectiveness}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white">Language Control</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{finalAssessment.languageControl}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white">Pronunciation & Fluency</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{finalAssessment.pronunciationAndFluency}</p>
                            </div>
                        </div>
                        <details className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <summary className="font-semibold cursor-pointer">View Full Transcript</summary>
                            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex items-start gap-2 ${msg.role === Role.USER ? 'justify-end' : ''}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === Role.USER ? 'bg-slate-300 dark:bg-slate-600' : 'bg-indigo-500'}`}>
                                            {msg.role === Role.USER ? <UserCircleIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5 text-white"/>}
                                        </div>
                                        <div className={`px-3 py-2 rounded-lg text-sm max-w-sm ${msg.role === Role.USER ? 'bg-slate-200 dark:bg-slate-700' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>{msg.text}</div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setView('dashboard')} className="select-none w-full px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                        Back to B1 Dashboard
                    </button>
                    <button onClick={() => setStep('setup')} className="select-none w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        Take Another Test
                    </button>
                </div>
             </div>
        </div>
    );

    switch(step) {
        case 'setup': return renderSetupView();
        case 'running': return renderRunningView();
        case 'results': return renderResultsView();
        default: return renderSetupView();
    }
};

export default B1MockTest;