import React, { useState } from 'react';
import { AcademicFeedback } from '../../types';
import { getAcademicWritingFeedback, updateUserProfile, generateAcademicPrompts, generateStarterSentence } from '../../services/geminiService';
import { SparklesIcon, CheckCircleIcon, LightbulbIcon, PencilIcon, ArrowLeftIcon } from '../IconComponents';
import SkeletonLoader from '../SkeletonLoader';

const academicTopics = {
  "Information Technology": [
    "Cybersecurity", "Artificial Intelligence", "Machine Learning",
    "Cloud Computing (AWS/GCP)", "Data Science & Big Data", "Business Intelligence",
    "Network Engineering", "Software Development Methodologies", "Blockchain Technology"
  ],
  "Medicine & Healthcare": [
    "Dentistry", "Nursing Practice", "Public Health Policy",
    "Medical Ethics", "Pharmaceutical Science", "Cardiology",
    "Oncology", "Neuroscience", "Genetics"
  ],
  "Business & Finance": [
    "International Business", "Marketing Strategy", "Corporate Finance",
    "Entrepreneurship", "Supply Chain Management", "Human Resource Management",
    "E-commerce", "Financial Risk Management"
  ],
  "Humanities & Social Sciences": [
    "History", "Psychology", "Sociology",
    "Political Science", "Philosophy", "Literature",
    "Anthropology", "International Relations"
  ],
  "Engineering": [
    "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
    "Chemical Engineering", "Aerospace Engineering", "Biomedical Engineering"
  ],
  "Law": [
    "Criminal Law", "Corporate Law", "International Law",
    "Human Rights Law", "Environmental Law"
  ]
};

const ResultDisplay: React.FC<{ feedback: AcademicFeedback }> = ({ feedback }) => {
    const structuralFeedbackPoints = feedback.structural_feedback?.split('\n').filter(p => p.trim() !== '');
    const clarityFeedbackPoints = feedback.clarity_and_style_feedback?.split('\n').filter(p => p.trim() !== '');

    if (feedback.overall_assessment.includes("I cannot write your assignment for you.")) {
        return (
             <div className="p-6 bg-rose-50 dark:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-700 text-center">
                <h3 className="text-xl font-bold text-rose-800 dark:text-rose-200">Request Denied</h3>
                <p className="text-rose-700 dark:text-rose-300 mt-2">{feedback.overall_assessment}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Overall Assessment</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{feedback.overall_assessment}</p>
                </div>
            </div>

            {feedback.improvement_suggestions?.length > 0 && (
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Improvement Suggestions</h3>
                    <div className="space-y-3">
                        {feedback.improvement_suggestions.map((s, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Original Excerpt:</p>
                                <p className="text-sm italic text-slate-600 dark:text-slate-300 border-l-4 border-slate-300 dark:border-slate-600 pl-2 my-1">"{s.original_excerpt}"</p>
                                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-2">Suggestion:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-200">{s.suggestion_for_improvement}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
                {structuralFeedbackPoints?.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Structural Feedback</h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <ul className="space-y-2">
                                {structuralFeedbackPoints.map((point, index) => (
                                    <li key={index} className="flex items-start">
                                        <PencilIcon className="w-4 h-4 text-slate-500 mr-3 mt-1 flex-shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-300">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {clarityFeedbackPoints?.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Clarity & Style Feedback</h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <ul className="space-y-2">
                                {clarityFeedbackPoints.map((point, index) => (
                                    <li key={index} className="flex items-start">
                                        <LightbulbIcon className="w-4 h-4 text-slate-500 mr-3 mt-1 flex-shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-300">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {feedback.corrections?.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">British English Corrections</h3>
                    <div className="space-y-3">
                        {feedback.corrections.map((c, i) => (
                            <div key={i} className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <p className="text-sm">
                                    <span className="font-mono bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1 rounded line-through">{c.original_us}</span>
                                    <span className="mx-2">&rarr;</span>
                                    <span className="font-mono bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 rounded">{c.corrected_uk}</span>
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{c.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const LoadingSkeleton = () => (
     <div className="space-y-6">
        <div>
            <SkeletonLoader className="h-7 w-1/2 mb-3" />
            <SkeletonLoader className="h-40 w-full rounded-lg" />
        </div>
         <div>
            <SkeletonLoader className="h-7 w-1/3 mb-3" />
            <SkeletonLoader className="h-20 w-full rounded-lg" />
        </div>
    </div>
);

const AcademicWritingHelper: React.FC = () => {
    const [step, setStep] = useState<'topic_selection' | 'writing_helper'>('topic_selection');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [isCustomTopic, setIsCustomTopic] = useState(false);
    
    const [prompts, setPrompts] = useState<string[]>([]);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    
    const [starterSentences, setStarterSentences] = useState<{ [prompt: string]: string }>({});
    const [isLoadingStarter, setIsLoadingStarter] = useState<string | null>(null);

    const [inputText, setInputText] = useState('');
    const [feedback, setFeedback] = useState<AcademicFeedback | null>(null);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [error, setError] = useState('');

    const handleTopicSelect = (topic: string, isCustom = false) => {
        setSelectedTopic(topic);
        setIsCustomTopic(isCustom);
        setStep('writing_helper');
        setPrompts([]);
        setStarterSentences({});
        setInputText('');
        setFeedback(null);
    };
    
    const handleGeneratePrompts = async () => {
        if (!selectedTopic) return;
        setIsLoadingPrompts(true);
        setPrompts([]);
        setStarterSentences({});
        const result = await generateAcademicPrompts(selectedTopic);
        setPrompts(result);
        setIsLoadingPrompts(false);
    };

    const handleGetStarterSentence = async (prompt: string) => {
        setIsLoadingStarter(prompt);
        const sentence = await generateStarterSentence(prompt);
        setStarterSentences(prev => ({ ...prev, [prompt]: sentence }));
        setIsLoadingStarter(null);
    };

    const handleGetFeedback = async () => {
        if (!selectedTopic.trim() || !inputText.trim()) {
            setError('Please provide both an assignment topic and your text.');
            return;
        }
        setError('');
        setIsLoadingFeedback(true);
        setFeedback(null);

        try {
            const result = await getAcademicWritingFeedback(selectedTopic, inputText);
            setFeedback(result);
            if (!result.overall_assessment.includes("I cannot write your assignment for you.")) {
                await updateUserProfile(p => {
                    p.progress.academic.assignmentsChecked += 1;
                    return p;
                });
            }
        } catch (apiError) {
            if (apiError instanceof Error) {
                setError(`An error occurred: ${apiError.message}`);
            } else {
                setError('An unknown error occurred while generating feedback.');
            }
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    const renderTopicSelection = () => (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assignment Writing Helper</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Select a topic to get started. Our AI tutor will help you with writing prompts and feedback.
                </p>
            </div>
            <div className="space-y-6">
                {Object.entries(academicTopics).map(([category, topics]) => (
                    <div key={category} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-indigo-600 dark:text-indigo-400">{category}</h3>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {topics.map(topic => (
                                <button key={topic} onClick={() => handleTopicSelect(topic)} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-full transition-colors">
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="text-center">
                    <button onClick={() => handleTopicSelect('', true)} className="font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors">
                        Or, use a custom topic &rarr;
                    </button>
                </div>
            </div>
        </div>
    );

    const renderWritingHelper = () => (
        <div className="animate-fade-in">
            <div className="mb-8">
                 <button onClick={() => setStep('topic_selection')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-500 mb-4">
                     <ArrowLeftIcon className="w-4 h-4" />
                     Back to Topic Selection
                 </button>
                 {isCustomTopic ? (
                     <div>
                        <label htmlFor="custom-topic" className="block text-lg font-bold text-slate-800 dark:text-white mb-2">Your Custom Topic</label>
                        <input
                            id="custom-topic"
                            type="text"
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            placeholder="e.g., The history of ancient Rome"
                            className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                        />
                     </div>
                 ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Topic: {selectedTopic}</h2>
                    </div>
                 )}
            </div>
            
            <div className="space-y-6">
                {/* Prompt Generation */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white">Writing Prompts & Ideas</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Stuck? Generate some specific essay questions for your topic.</p>
                     <div className="mt-3">
                        <button onClick={handleGeneratePrompts} disabled={isLoadingPrompts || !selectedTopic} className="select-none inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 text-sm font-semibold disabled:bg-indigo-300">
                             <SparklesIcon className="w-4 h-4"/>
                             {isLoadingPrompts ? 'Generating...' : 'Generate Prompts'}
                        </button>
                     </div>
                     {isLoadingPrompts && <SkeletonLoader className="h-24 w-full mt-3 rounded-md" />}
                     {prompts.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {prompts.map((prompt, i) => (
                                <div key={i} className="p-3 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{prompt}</p>
                                    {starterSentences[prompt] ? (
                                        <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/50 rounded text-sm text-teal-800 dark:text-teal-200 border-l-4 border-teal-500">
                                            <strong>Starter:</strong> <em>{starterSentences[prompt]}</em>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleGetStarterSentence(prompt)} disabled={!!isLoadingStarter} className="mt-2 text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50">
                                            {isLoadingStarter === prompt ? 'Thinking...' : 'Get a Starter Sentence'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                     )}
                </div>

                {/* Main Writing Area */}
                <div>
                    <label htmlFor="assignment-text" className="block text-lg font-bold text-slate-800 dark:text-white mb-2">Your Text</label>
                    <textarea
                        id="assignment-text"
                        rows={12}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your assignment text here..."
                        className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                    />
                </div>
                {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
                <div className="text-center">
                    <button
                        onClick={handleGetFeedback}
                        disabled={isLoadingFeedback}
                        className="select-none inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-teal-300"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        {isLoadingFeedback ? 'Analyzing...' : 'Get Feedback'}
                    </button>
                </div>
            </div>

            <div className="mt-10">
                {isLoadingFeedback && <LoadingSkeleton />}
                {feedback && <ResultDisplay feedback={feedback} />}
            </div>
        </div>
    );


    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto">
                {step === 'topic_selection' ? renderTopicSelection() : renderWritingHelper()}
            </div>
        </div>
    );
};

export default AcademicWritingHelper;
