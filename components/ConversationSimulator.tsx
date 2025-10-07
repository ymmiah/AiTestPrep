import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, Feedback, GeminiResponse } from '../types';
import { getGeminiResponse, generateAnswerIdea, getImprovedAnswer, saveConversationHistory, clearConversationHistory, getUserProfile, updateUserProfile } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useNotification } from '../contexts/NotificationContext';
import MessageBubble from './MessageBubble';
import FeedbackCard from './FeedbackCard';
import PictureCard from './PictureCard';
import { MicrophoneIcon, StopIcon, LightbulbIcon, SparklesIcon, PencilIcon, DocumentArrowDownIcon, TrashIcon } from './IconComponents';

type Scenario = 'default' | 'coffee' | 'doctor' | 'picture' | 'directions';
type PanelViewType = 'feedback' | 'idea' | 'improvement';

const scenarioPrompts: { [key in Scenario]: string } = {
    default: "Hello! I'm your AI examiner for the A2 English test. Let's start with a few questions. What is your name?",
    coffee: "Hello! Welcome to the coffee shop. What would you like to order today?",
    doctor: "Good morning. I'm Dr. Smith. Please, have a seat. What seems to be the problem today?",
    picture: "Okay, let's practice picture description. Please look at the image and tell me what you see.",
    directions: "Excuse me, I'm a bit lost. Could you tell me how to get to the nearest supermarket?",
}

const ConversationSimulator: React.FC = () => {
  const [scenario, setScenario] = useState<Scenario>('default');
  const [messages, setMessages] = useState<Message[]>([
    { role: Role.MODEL, text: scenarioPrompts.default },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [panelView, setPanelView] = useState<PanelViewType | null>(null);
  const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [improvedAnswer, setImprovedAnswer] = useState<string | null>(null);
  const [isGeneratingImprovement, setIsGeneratingImprovement] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [rawResponseJson, setRawResponseJson] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isCancelledRef = useRef(false);
  const { addNotification } = useNotification();
  const { isSpeaking, speak, cancel: cancelSpeech } = useTextToSpeech();

  const { isListening, startListening, stopListening, hasRecognitionSupport, error } = useSpeechRecognition(handleTranscript);

  useEffect(() => {
    const checkHistoryAndSettings = async () => {
        stopListening();
        cancelSpeech();
        setMessages([{ role: Role.MODEL, text: scenarioPrompts[scenario] }]);
        setFeedback(null);
        setPanelView(null);
        setRawResponseJson(null);

        const profile = await getUserProfile();
        const history = profile.conversationHistory?.[scenario];
        setHasHistory(!!history && history.length > 0);
        setIsDevMode(profile.isDeveloperMode || false);
    };
    checkHistoryAndSettings();
  }, [scenario]);

  async function handleTranscript(transcript: string) {
    if (transcript.trim() === '') return;
    
    isCancelledRef.current = false;
    const userMessage: Message = { role: Role.USER, text: transcript };
    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    setIsProcessing(true);
    setFeedback(null);
    setRawResponseJson(null);
    if (panelView === 'idea' || panelView === 'improvement') {
        setPanelView(null);
    }

    const geminiData = await getGeminiResponse(transcript, scenario);
    
    if (isCancelledRef.current) return;
    
    const { response, feedback: newFeedback, pointsAwarded, rawJson }: GeminiResponse = geminiData;

    if (rawJson) {
      setRawResponseJson(rawJson);
    }


    // Save points and update progress stats to the user's profile
    if (pointsAwarded) {
      const scoreMatch = newFeedback.pronunciation.match(/(\d{1,3})\s*\/\s*100/);
      const pronunciationScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

      await updateUserProfile(profile => {
        profile.points += pointsAwarded;
        profile.progressStats.sessionsCompleted += 1;

        if (pronunciationScore !== null) {
            const { avgPronunciationScore } = profile.progressStats;
            const sessionCount = profile.progressStats.sessionsCompleted;
            // Using a weighted average formula: new_avg = (old_avg * (n-1) + new_score) / n
            const oldTotalScore = avgPronunciationScore * (sessionCount - 1);
            profile.progressStats.avgPronunciationScore = Math.round((oldTotalScore + pronunciationScore) / sessionCount);
        }
        return profile;
      });
    }

    const modelMessage: Message = { role: Role.MODEL, text: response };
    const finalMessages = [...messagesWithUser, modelMessage];
    setMessages(finalMessages);
    setFeedback(newFeedback);
    
    await saveConversationHistory(scenario, finalMessages);
    setHasHistory(true);

    setIsProcessing(false);
    speak(response);

    if (pointsAwarded && transcript !== '[DEV_SKIP]') {
        addNotification({
            type: 'success',
            title: 'Points Earned!',
            message: `You've earned ${pointsAwarded} points for your response.`,
        });
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartListening = () => {
      cancelSpeech();
      startListening();
  };

  const handleStopConversation = () => {
    isCancelledRef.current = true;
    cancelSpeech();
    setIsProcessing(false);
    if (isListening) {
        stopListening();
    }
    addNotification({
        type: 'info',
        title: 'Conversation Stopped',
        message: 'The AI has been stopped. Tap the microphone to speak again.',
    });
  };

  const handleGenerateIdea = async () => {
    const lastModelMessage = messages.filter(m => m.role === Role.MODEL).pop();
    if (!lastModelMessage) return;

    setIsGeneratingIdea(true);
    setPanelView('idea');
    setGeneratedIdea("Generating a helpful idea for you...");
    const idea = await generateAnswerIdea(lastModelMessage.text);
    setGeneratedIdea(idea);
    addNotification({
        type: 'info',
        title: 'Idea Generated!',
        message: 'A suggestion has been created for you.',
    });
    setIsGeneratingIdea(false);
  };

  const handleImproveAnswer = async () => {
    const lastUserMessage = messages.filter(m => m.role === Role.USER).pop();
    if (!lastUserMessage) return;

    const lastUserMessageIndex = messages.findLastIndex(m => m.role === Role.USER);
    const previousModelMessage = messages[lastUserMessageIndex - 1];

    if (!previousModelMessage || previousModelMessage.role !== Role.MODEL) return;
    
    setIsGeneratingImprovement(true);
    setPanelView('improvement');
    setImprovedAnswer("Crafting an improved version of your answer...");
    const suggestion = await getImprovedAnswer(lastUserMessage.text, previousModelMessage.text);
    setImprovedAnswer(suggestion);
     addNotification({
        type: 'info',
        title: 'Suggestion Ready!',
        message: 'An improved version of your answer is available.',
    });
    setIsGeneratingImprovement(false);
  };

  const handleLoadConversation = async () => {
    const profile = await getUserProfile();
    const history = profile.conversationHistory?.[scenario];
    if (history && history.length > 0) {
        setMessages(history);
        addNotification({
            type: 'info',
            title: 'Conversation Loaded',
            message: `Your previous chat for this scenario has been loaded.`,
        });
    }
  };

  const handleClearHistory = async () => {
      if (window.confirm("Are you sure you want to delete this conversation history? This cannot be undone.")) {
        await clearConversationHistory(scenario);
        setHasHistory(false);
        setMessages([{ role: Role.MODEL, text: scenarioPrompts[scenario] }]);
        addNotification({
            type: 'success',
            title: 'History Cleared',
            message: `Your chat history for this scenario has been deleted.`,
        });
      }
  };

  const isAiTurn = isProcessing || isSpeaking;

  if (!hasRecognitionSupport) {
    return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Speech Recognition Not Supported</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
                Sorry, your browser does not support the Web Speech API. Please try using a recent version of Google Chrome.
            </p>
        </div>
    );
  }

  const getPanelTitle = () => {
    switch(panelView) {
        case 'feedback': return 'Detailed Feedback';
        case 'idea': return 'Generated Idea';
        case 'improvement': return 'Suggested Answer';
        default: return '';
    }
  };

  const PanelContent: React.FC = () => {
    switch(panelView) {
        case 'feedback':
            return <FeedbackCard feedback={feedback} />;
        case 'idea':
            return <p className="text-slate-700 dark:text-slate-300 p-4">{generatedIdea}</p>;
        case 'improvement':
            return <p className="text-slate-700 dark:text-slate-300 p-4">{improvedAnswer}</p>;
        default:
            return null;
    }
  };

  const showFeedbackControls = feedback && !isProcessing && !isSpeaking && !isListening;
  const sideButtonStyle = "select-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed scale-100 hover:scale-105 active:scale-95";


  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1">
                <label htmlFor="scenario" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Choose a Scenario
                </label>
                <select
                    id="scenario"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value as Scenario)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                    disabled={isAiTurn || isListening}
                >
                    <option value="default">General Q&A</option>
                    <option value="picture">Picture Description</option>
                    <option value="coffee">Ordering Coffee</option>
                    <option value="doctor">At the Doctor's</option>
                    <option value="directions">Asking for Directions</option>
                </select>
            </div>
            {hasHistory && (
                <div className="flex-shrink-0 flex items-center gap-2 animate-fade-in">
                    <button
                        onClick={handleLoadConversation}
                        disabled={isAiTurn || isListening}
                        className="select-none flex items-center justify-center gap-2 px-3 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 active:bg-indigo-300 dark:active:bg-indigo-800 text-sm font-semibold transition-colors disabled:opacity-50"
                        title="Resume previous chat for this scenario"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Load Chat</span>
                    </button>
                     <button
                        onClick={handleClearHistory}
                        disabled={isAiTurn || isListening}
                        className="select-none flex items-center justify-center gap-2 p-2 h-10 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 rounded-md hover:bg-rose-200 dark:hover:bg-rose-900 active:bg-rose-300 dark:active:bg-rose-800 text-sm font-semibold transition-colors disabled:opacity-50"
                        title="Delete chat history for this scenario"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
          </div>
      </div>
      
      {scenario === 'picture' && <PictureCard />}

      <div
        ref={chatContainerRef}
        className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto"
      >
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isProcessing && (
            <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 self-start shadow-md animate-pulse">
                   AI is thinking...
                </div>
            </div>
        )}
      </div>

      {isDevMode && rawResponseJson && (
        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <details>
                <summary className="font-semibold text-sm cursor-pointer text-slate-600 dark:text-slate-400">
                    Developer Info: Raw API Response
                </summary>
                <pre className="mt-2 p-3 bg-slate-200 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 rounded-md overflow-x-auto">
                    <code>{JSON.stringify(JSON.parse(rawResponseJson), null, 2)}</code>
                </pre>
            </details>
        </div>
       )}

      {panelView && (
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 shadow-inner border-t border-slate-200 dark:border-slate-800 animate-slide-up">
                <div className="p-4 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{getPanelTitle()}</h3>
                         <button 
                            onClick={() => setPanelView(null)} 
                            className="select-none px-4 py-2 font-semibold text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400 dark:active:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                        >
                             Done
                        </button>
                    </div>
                    <PanelContent />
                </div>
            </div>
         )}

      <div className="flex-shrink-0 p-4 sm:p-5 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
            <div className="flex justify-center">
                {showFeedbackControls ? (
                    <button
                        onClick={handleImproveAnswer}
                        disabled={isGeneratingImprovement}
                        className={`${sideButtonStyle} bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-400`}
                        aria-label="Improve my answer"
                    >
                        <PencilIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Improve</span>
                    </button>
                ) : (
                    <button
                        onClick={handleGenerateIdea}
                        disabled={isAiTurn || isListening || isGeneratingIdea}
                        className={`${sideButtonStyle} bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-400`}
                        aria-label="Generate an idea"
                    >
                        <LightbulbIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Get Idea</span>
                    </button>
                )}
            </div>

            <div className="flex justify-center items-center gap-4">
                {isAiTurn ? (
                    <button
                        onClick={handleStopConversation}
                        className="select-none flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-colors duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 bg-rose-500 text-white focus:ring-rose-300 hover:bg-rose-600"
                        aria-label="Stop conversation"
                    >
                        <StopIcon className="w-8 h-8" />
                    </button>
                ) : (
                    <button
                        onClick={isListening ? stopListening : handleStartListening}
                        className={`select-none flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 active:scale-95
                        ${isListening 
                            ? 'bg-rose-500 text-white focus:ring-rose-300 animate-pulse' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300'
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

            <div className="flex justify-center">
                {showFeedbackControls && (
                    <button
                        onClick={() => setPanelView('feedback')}
                        className={`${sideButtonStyle} bg-amber-400 text-amber-900 hover:bg-amber-500 focus:ring-amber-300`}
                        aria-label="Show feedback for last response"
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
             isProcessing ? 'Processing your response...' : 
             isSpeaking ? 'AI is speaking...' :
             'Tap the microphone to speak'}
        </p>
      </div>
    </div>
  );
};

export default ConversationSimulator;