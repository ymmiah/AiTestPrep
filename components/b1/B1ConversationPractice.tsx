import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../../services/geminiService';
import { Message, Role, Feedback } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import MessageBubble from '../MessageBubble';
import FeedbackCard from '../FeedbackCard';
import { MicrophoneIcon, StopIcon, SparklesIcon, CalendarDaysIcon, TicketIcon, HomeIcon, MusicIcon, FilmIcon, GiftIcon as SpecialOccasionIcon } from '../IconComponents';

const b1Topics = [
    { name: 'Festivals', icon: CalendarDaysIcon, scenario: 'b1-festivals', preview: ["What's an important festival in your country?", "How do people celebrate it?", "What did you do during the last festival?"] },
    { name: 'Means of Transport', icon: TicketIcon, scenario: 'b1-transport', preview: ["How do you usually travel to work or school?", "What's public transport like in your town?", "What are the advantages of travelling by train?"] },
    { name: 'Special Occasions', icon: SpecialOccasionIcon, scenario: 'b1-occasions', preview: ["Tell me about a special occasion in your family.", "How do you celebrate birthdays in your country?", "Describe a wedding you have been to."] },
    { name: 'Entertainment', icon: FilmIcon, scenario: 'b1-entertainment', preview: ["What do you do for entertainment?", "Do you prefer watching films at home or at the cinema?", "Tell me about a good film you've seen recently."] },
    { name: 'Music', icon: MusicIcon, scenario: 'b1-music', preview: ["What kind of music do you like?", "Do you play a musical instrument?", "Have you ever been to a live concert?"] },
    { name: 'Recent Personal Experiences', icon: HomeIcon, scenario: 'b1-experiences', preview: ["Tell me something interesting you've done recently.", "What did you do last weekend?", "Describe a recent trip you took."] }
];

interface Topic {
    name: string;
    icon: React.FC<{className?: string}>;
    scenario: string;
    preview: string[];
}

const B1ConversationPractice: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { isSpeaking, speak, cancel: cancelSpeech } = useTextToSpeech();
    const { isListening, startListening, stopListening, error } = useSpeechRecognition(handleTranscript);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSelectTopic = async (topic: Topic) => {
        setSelectedTopic(topic);
        setIsProcessing(true);
        setFeedback(null);
        setShowFeedback(false);
        
        const firstResponse = await getGeminiResponse(`Start a B1 GESE Grade 5 conversation about ${topic.name}.`, topic.scenario);
        const firstMessage: Message = { role: Role.MODEL, text: firstResponse.response };
        setMessages([firstMessage]);
        speak(firstMessage.text);
        setIsProcessing(false);
    };

    async function handleTranscript(transcript: string) {
        if (!transcript.trim() || !selectedTopic) return;
        
        const userMessage: Message = { role: Role.USER, text: transcript };
        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        setFeedback(null);
        setShowFeedback(false);

        const geminiData = await getGeminiResponse(transcript, selectedTopic.scenario);
        
        setFeedback(geminiData.feedback);
        setShowFeedback(false);
        const modelMessage: Message = { role: Role.MODEL, text: geminiData.response };
        setMessages(prev => [...prev, modelMessage]);
        speak(modelMessage.text);
        setIsProcessing(false);
    }
    
    const isAiTurn = isProcessing || isSpeaking;

    const handleStartListening = () => {
        cancelSpeech();
        setShowFeedback(false);
        startListening();
    };

    if (!selectedTopic) {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Conversation Phase Practice</h2>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                        Choose one of the official GESE Grade 5 topics to start a conversation with the AI examiner.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {b1Topics.map(topic => {
                        const Icon = topic.icon;
                        return (
                             <div key={topic.name} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                                <div className="flex items-center mb-3">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mr-4">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{topic.name}</h3>
                                </div>
                                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <p className="font-semibold mb-1">Example questions:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {topic.preview.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                </div>
                                <div className="flex-grow flex items-end mt-4">
                                     <button onClick={() => handleSelectTopic(topic)} className="w-full select-none mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 text-sm font-semibold">
                                        Practice this Topic
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[80vh] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
            <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Conversation: {selectedTopic.name}</h3>
                    <button onClick={() => setSelectedTopic(null)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Change Topic
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

export default B1ConversationPractice;