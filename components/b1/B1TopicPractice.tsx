import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { Message, Role, Feedback } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import MessageBubble from '../MessageBubble';
import FeedbackCard from '../FeedbackCard';
import { MicrophoneIcon, StopIcon, SparklesIcon, PencilIcon } from '../IconComponents';

const getApiKey = (): string => {
    if (process.env.API_KEY) { return process.env.API_KEY; }
    const message = "Gemini API Key not found.";
    alert(message);
    throw new Error(message);
};

const B1TopicPractice: React.FC = () => {
    const [step, setStep] = useState<'setup' | 'practice'>('setup');
    const [topicTitle, setTopicTitle] = useState('');
    const [topicPoints, setTopicPoints] = useState('');
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const chatSessionRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { isSpeaking, speak, cancel: cancelSpeech } = useTextToSpeech();
    const { isListening, startListening, stopListening, error } = useSpeechRecognition(handleTranscript);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleStartPractice = async () => {
        if (!topicTitle.trim() || !topicPoints.trim()) return;
        
        setStep('practice');
        setIsProcessing(true);
        setFeedback(null);
        setShowFeedback(false);

        const systemInstruction = `You are a friendly but professional examiner for the Trinity GESE Grade 5 (B1 level) English test. The user has prepared a topic to discuss. Your task is to engage them in a conversation about THEIR topic. Ask open-ended questions to encourage them to expand on their points. Do not introduce new topics. Let the user lead the conversation. After each user response, provide B1-level feedback on their grammar, vocabulary, fluency, and pronunciation in the specified JSON format.
        
User's Topic Title: "${topicTitle}"
User's Key Points:
- ${topicPoints.split('\n').join('\n- ')}

Start the conversation by saying something like, "Okay, you've chosen to talk about [Topic Title]. Please tell me about it."`;

        const feedbackSchema = {
            type: Type.OBJECT,
            properties: {
                grammar: { type: Type.STRING, description: "Provide B1-level grammar feedback." },
                vocabulary: { type: Type.STRING, description: "Provide B1-level vocabulary feedback." },
                fluency: { type: Type.STRING, description: "Provide feedback on fluency and coherence." },
                pronunciation: { type: Type.STRING, description: "Provide an estimated pronunciation score out of 100." }
            },
            required: ["grammar", "vocabulary", "fluency", "pronunciation"]
        };
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                response: { type: Type.STRING, description: "A natural, conversational response that asks a follow-up question about the user's topic." },
                feedback: feedbackSchema,
            },
            required: ["response", "feedback"]
        };

        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const result = await chatSessionRef.current.sendMessage({ message: "Start the conversation." });
        const jsonString = result.text.trim();
        const parsedResponse = JSON.parse(jsonString) as { response: string, feedback: Feedback };
        
        const firstMessage: Message = { role: Role.MODEL, text: parsedResponse.response };
        setMessages([firstMessage]);
        speak(firstMessage.text);
        setIsProcessing(false);
    };

    async function handleTranscript(transcript: string) {
        if (!transcript.trim()) return;
        
        const userMessage: Message = { role: Role.USER, text: transcript };
        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        setFeedback(null);
        setShowFeedback(false);

        if (chatSessionRef.current) {
            const result = await chatSessionRef.current.sendMessage({ message: transcript });
            const jsonString = result.text.trim();
            const parsedResponse = JSON.parse(jsonString) as { response: string, feedback: Feedback };
            
            setFeedback(parsedResponse.feedback);
            setShowFeedback(false);
            const modelMessage: Message = { role: Role.MODEL, text: parsedResponse.response };
            setMessages(prev => [...prev, modelMessage]);
            speak(modelMessage.text);
        }
        setIsProcessing(false);
    }
    
    const isAiTurn = isProcessing || isSpeaking;
    
    const handleStartListening = () => {
        cancelSpeech();
        setShowFeedback(false);
        startListening();
    };

    if (step === 'setup') {
        return (
            <div className="max-w-3xl mx-auto animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Topic Phase Preparation</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Prepare your topic and key points below. When you're ready, the AI examiner will start a conversation with you based on your notes.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                        <label htmlFor="topic-title" className="block text-lg font-bold text-slate-800 dark:text-white">Your Topic Title</label>
                        <input
                            id="topic-title"
                            type="text"
                            value={topicTitle}
                            onChange={(e) => setTopicTitle(e.target.value)}
                            placeholder="e.g., My Favourite Hobby: Photography"
                            className="mt-2 w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                        />
                    </div>
                    <div>
                        <label htmlFor="topic-points" className="block text-lg font-bold text-slate-800 dark:text-white">Your Key Points</label>
                        <textarea
                            id="topic-points"
                            rows={5}
                            value={topicPoints}
                            onChange={(e) => setTopicPoints(e.target.value)}
                            placeholder={"e.g.,\n- Why I started photography\n- The type of camera I use\n- What I like to take pictures of (nature, people)\n- My favourite photo"}
                            className="mt-2 w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                        />
                    </div>
                    <div className="text-center pt-4">
                        <button
                            onClick={handleStartPractice}
                            disabled={!topicTitle.trim() || !topicPoints.trim()}
                            className="select-none inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Start Practice Session
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[80vh] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
            <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Topic: {topicTitle}</h3>
                    <button onClick={() => setStep('setup')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        <PencilIcon className="w-4 h-4" />
                        Edit Topic
                    </button>
                </div>
            </div>
            <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => ( <MessageBubble key={index} message={msg} /> ))}
                {isProcessing && <div className="text-slate-500 dark:text-slate-400">Thinking...</div>}
            </div>
            
            {showFeedback && feedback && (
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 shadow-inner border-t border-slate-200 dark:border-slate-800 animate-slide-up">
                    <div className="max-w-4xl mx-auto max-h-[45vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-50 dark:bg-slate-800/50 z-10 p-4 pb-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detailed Feedback</h3>
                            <button 
                                onClick={() => setShowFeedback(false)} 
                                className="select-none flex-shrink-0 px-4 py-2 font-semibold text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400 dark:active:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            >
                                 Done
                            </button>
                        </div>
                        <div className="p-4">
                            <FeedbackCard feedback={feedback} />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-shrink-0 p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
                     <div className="flex justify-center">
                        {/* Left placeholder */}
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={isListening ? stopListening : handleStartListening}
                            disabled={isAiTurn}
                            className={`select-none flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 active:scale-95
                            ${isListening ? 'bg-rose-500 text-white focus:ring-rose-300 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300'}
                            disabled:bg-slate-400 disabled:cursor-not-allowed`}
                        >
                            {isAiTurn ? <StopIcon className="w-8 h-8" /> : <MicrophoneIcon className="w-8 h-8" />}
                        </button>
                    </div>
                    <div className="flex justify-center">
                        {feedback && !isAiTurn && !isListening && (
                            <button
                                onClick={() => setShowFeedback(true)}
                                className="select-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-amber-400 text-amber-900 hover:bg-amber-500 focus:ring-amber-300"
                                aria-label="Show feedback"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Feedback</span>
                            </button>
                        )}
                    </div>
                </div>
                 <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 h-5 flex items-center justify-center">
                    {error ? <span className="text-rose-500 font-medium">{error}</span> :
                    isListening ? 'Listening...' : 
                    isProcessing ? 'Processing...' : 
                    isSpeaking ? 'Examiner is speaking...' :
                    'Tap to speak'}
                </p>
            </div>
        </div>
    );
};

export default B1TopicPractice;