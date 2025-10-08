import React, { useState } from 'react';
import { AnswerAnalysis, TopicQA } from '../types';
import { analyzeUserAnswer, generatePersonalizedTopicQa } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { SunIcon, HeartIcon, MapPinIcon, UserGroupIcon, ShoppingBagIcon, CalendarDaysIcon, MicrophoneIcon, SparklesIcon, CheckCircleIcon, LightbulbIcon } from './IconComponents';

interface TopicModule {
  topic: string;
  icon: React.FC<{ className?: string }>;
  isPersonalized: boolean;
  promptText?: string;
  inputPlaceholder?: string;
  questions?: TopicQA[];
}

const practiceModules: TopicModule[] = [
  {
    topic: 'Directions',
    icon: MapPinIcon,
    isPersonalized: true,
    promptText: 'Want more practice? Enter a real place near you (e.g., "the post office", "Sainsbury\'s") to get custom AI questions.',
    inputPlaceholder: 'e.g., the local park',
    questions: [
      { question: "How do you get to the nearest grocery shop from your home?", answer: "When I come out from my home, I take a right. Then I go a few hundred yards and take another right. After a two-minute walk, I cross the road, and the grocery shop is right there." },
      { question: "Can you tell me how to get to the pharmacy?", answer: "The pharmacy is in the same walking direction. I follow the same path, but I don't need to cross the road. It is on my right-hand side, just before the traffic lights." },
      { question: "How do you travel to the city centre?", answer: "To go to the city centre, I walk to the bus stop near my house. It takes about five minutes. I take the number 12 bus, and it goes directly to the city centre. The journey takes about twenty minutes." },
      { question: "Is there a park near your house? How do you get there?", answer: "Yes, there is a lovely park nearby. I turn left from my front door and walk straight for about ten minutes. I pass a school on my left, and the park entrance is just after that. It's very easy to find." }
    ]
  },
  {
    topic: 'Weather',
    icon: SunIcon,
    isPersonalized: false,
    questions: [
        { question: 'What is the weather like today?', answer: 'It is sunny and warm today. There isn\'t a cloud in the sky. It is a beautiful day.' },
        { question: 'What is your favourite type of weather?', answer: 'I like when it is warm and sunny because I can go outside and enjoy a walk in the park. I do not like the rain very much.' }
    ]
  },
  {
    topic: 'Hobbies',
    icon: HeartIcon,
    isPersonalized: false,
    questions: [
        { question: 'What do you do in your free time?', answer: 'In my free time, I enjoy reading books and listening to music. It is very relaxing. Sometimes, I also go for a walk if the weather is nice.' },
        { question: 'Do you play any sports?', answer: 'I don\'t play sports regularly, but I like to swim in the summer. There is a public swimming pool not far from my home that I like to visit.' }
    ]
  },
  {
    topic: 'Family',
    icon: UserGroupIcon,
    isPersonalized: false,
    questions: [
        { question: 'Can you tell me about your family?', answer: 'Yes, of course. I have a small family. It is just my husband and me. We live together in a flat. My parents live in another city, but we visit them often.' },
        { question: 'What do you like to do with your family?', answer: 'I like to cook with my husband on the weekends. We also enjoy watching movies together. When we visit my parents, we often go for a walk.' }
    ]
  },
  {
    topic: 'Food',
    icon: ShoppingBagIcon,
    isPersonalized: false,
    questions: [
        { question: 'What is your favourite food?', answer: 'My favourite food is pizza. I especially like it with cheese and tomato. I often eat it on Friday evenings with my family.' },
        { question: 'Do you like cooking?', answer: 'Yes, I enjoy cooking. I usually cook dinner every day. My favourite thing to make is pasta with a vegetable sauce.' }
    ]
  },
  {
    topic: 'Daily Routine',
    icon: CalendarDaysIcon,
    isPersonalized: false,
    questions: [
        { question: 'What do you usually do in the morning?', answer: 'In the morning, I usually wake up at 7 AM. I have a shower, get dressed, and then I have breakfast. I usually have toast and a cup of tea.' },
        { question: 'What time do you usually go to bed?', answer: 'I usually go to bed at about 11 PM. Before I go to sleep, I like to read a book for about 30 minutes. It helps me to relax.' }
    ]
  }
];

const QuestionPractice: React.FC<{ qa: TopicQA; }> = ({ qa }) => {
    const { question, answer: exampleAnswer } = qa;
    const [userTranscript, setUserTranscript] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showExample, setShowExample] = useState(false);
    
    const { isListening, startListening, stopListening, error } = useSpeechRecognition((transcript) => {
        setUserTranscript(transcript);
        setAnalysis(null);
    });

    const handleGetFeedback = async () => {
        if (!userTranscript) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        const result = await analyzeUserAnswer(question, userTranscript, exampleAnswer);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{question}</p>
            
            <div className="mt-3">
                <button onClick={() => setShowExample(!showExample)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {showExample ? 'Hide' : 'Show'} Example Answer
                </button>
                {showExample && (
                    <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md animate-fade-in">
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{exampleAnswer}"</p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-4">
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`select-none flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ease-in-out shadow-md focus:outline-none focus:ring-4 active:scale-95
                    ${isListening 
                        ? 'bg-rose-500 text-white focus:ring-rose-300 animate-pulse' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300'
                    }`}
                >
                    <MicrophoneIcon className="w-7 h-7" />
                </button>
                <div className="flex-1 text-sm text-slate-500 dark:text-slate-400">
                    {error && <p className="text-rose-500 font-medium">{error}</p>}
                    {isListening && <p>Listening... Tap the microphone to stop.</p>}
                    {userTranscript && !isListening && (
                         <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <p className="font-medium text-slate-500 dark:text-slate-400">You said:</p>
                            <p className="italic text-slate-700 dark:text-slate-300">"{userTranscript}"</p>
                        </div>
                    )}
                </div>
            </div>

            {userTranscript && !isListening && (
                <div className="mt-4">
                    <button 
                        onClick={handleGetFeedback} 
                        disabled={isAnalyzing}
                        className="w-full select-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 text-sm font-semibold disabled:bg-teal-300"
                    >
                         <SparklesIcon className="w-4 h-4" />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze My Answer'}
                    </button>
                </div>
            )}

            {analysis && (
                <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2"><LightbulbIcon className="w-4 h-4" />Feedback</h4>
                        <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-1">{analysis.feedback}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="font-bold text-sm text-green-800 dark:text-green-200 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4" />Suggestion</h4>
                        <p className="text-sm text-green-900 dark:text-green-100 mt-1">{analysis.suggestion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const PersonalizedPracticeGenerator: React.FC<{ module: TopicModule }> = ({ module }) => {
    const [userInput, setUserInput] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState<TopicQA[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) {
            setError('Please enter a place or topic.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedQuestions(null);
        const qas = await generatePersonalizedTopicQa(module.topic, userInput);
        setGeneratedQuestions(qas);
        setIsLoading(false);
    };

    const handleReset = () => {
        setUserInput('');
        setGeneratedQuestions(null);
        setError('');
    };
    
    // The container for this component has a top border and padding
    const containerClasses = "p-4 border-t border-slate-200 dark:border-slate-700";

    if (isLoading) {
         return (
             <div className={`${containerClasses} text-center`}>
                <p className="text-slate-600 dark:text-slate-400">Generating personalized questions for you...</p>
             </div>
         );
    }

    if (generatedQuestions) {
        return (
            <div className={`${containerClasses} space-y-4 animate-fade-in`}>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing personalized questions for: <strong className="text-slate-800 dark:text-slate-200">{userInput}</strong>
                </p>
                {generatedQuestions.map((qa, index) => (
                    <QuestionPractice key={index} qa={qa} />
                ))}
                <button
                    onClick={handleReset}
                    className="w-full mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    Practice with a different topic
                </button>
            </div>
        );
    }
    
    return (
        <div className={containerClasses}>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{module.promptText}</h4>
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                 <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={module.inputPlaceholder}
                    className="flex-grow w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="select-none inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 text-sm font-semibold disabled:bg-indigo-300"
                >
                    {isLoading ? '...' : 'Generate'}
                </button>
            </form>
            {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

const TopicPractice: React.FC = () => {
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    const handleToggleTopic = (topic: string) => {
        setExpandedTopic(prev => (prev === topic ? null : topic));
    };
    
    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Topic Practice</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Practice common A2 topics. See an example, record your answer, and get instant AI feedback.</p>
                </div>

                <div className="space-y-4">
                    {practiceModules.map(module => {
                        const Icon = module.icon;
                        const isExpanded = expandedTopic === module.topic;
                        return (
                            <div key={module.topic} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <button 
                                    onClick={() => handleToggleTopic(module.topic)}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{module.topic}</h3>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {isExpanded && (
                                    <div className="animate-fade-in">
                                        {/* Render pre-loaded questions if they exist */}
                                        {module.questions && module.questions.length > 0 && (
                                            <div className="px-4 pt-4 pb-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                                {module.questions.map((q, index) => (
                                                    <QuestionPractice key={index} qa={q} />
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Render personalized generator if the module is personalized. 
                                            The generator includes its own top border, which acts as a separator.
                                        */}
                                        {module.isPersonalized && (
                                            <PersonalizedPracticeGenerator module={module} />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TopicPractice;