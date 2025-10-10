import React, { useState } from 'react';
import { AcademicFeedback, AcademicSource } from '../../types';
import { getAcademicWritingFeedback, updateUserProfile, generateAcademicPrompts, generateThesisStatement, generateEssayOutline, findAcademicSources, paraphraseText, adjustTextTone } from '../../services/geminiService';
import { SparklesIcon, CheckCircleIcon, LightbulbIcon, PencilIcon, ArrowLeftIcon, ListBulletIcon, BeakerIcon, LinkIcon, BookOpenIcon, ChatBubbleIcon } from '../IconComponents';
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
             <div className="p-6 bg-rose-50 dark:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-700">
                <h3 className="text-xl font-bold text-rose-800 dark:text-rose-200 text-center">Request Denied</h3>
                <p className="whitespace-pre-wrap text-rose-700 dark:text-rose-300 mt-2">{feedback.overall_assessment}</p>
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

const AdvancedWritingToolkit: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [selectedTone, setSelectedTone] = useState('Formal');
    const [paraphraseResults, setParaphraseResults] = useState<string[]>([]);
    const [toneResult, setToneResult] = useState('');
    const [isParaphrasing, setIsParaphrasing] = useState(false);
    const [isAdjustingTone, setIsAdjustingTone] = useState(false);

    const handleParaphrase = async () => {
        if (!inputText.trim()) return;
        setIsParaphrasing(true);
        setParaphraseResults([]);
        setToneResult('');
        const results = await paraphraseText(inputText);
        setParaphraseResults(results);
        setIsParaphrasing(false);
    };

    const handleAdjustTone = async () => {
        if (!inputText.trim()) return;
        setIsAdjustingTone(true);
        setParaphraseResults([]);
        setToneResult('');
        const result = await adjustTextTone(inputText, selectedTone);
        setToneResult(result);
        setIsAdjustingTone(false);
    };

    const isLoading = isParaphrasing || isAdjustingTone;

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-indigo-500" />Advanced Writing Toolkit</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Refine your writing at the sentence level. Paste a short piece of text below to get started.</p>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                placeholder="Paste a sentence or short paragraph here..."
                className="w-full p-2 mt-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button onClick={handleParaphrase} disabled={isLoading || !inputText} className="select-none inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 text-sm font-semibold disabled:bg-indigo-300">
                    <BookOpenIcon className="w-4 h-4" />
                    {isParaphrasing ? 'Paraphrasing...' : 'Paraphrase'}
                </button>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        disabled={isLoading}
                        className="h-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100 text-sm"
                    >
                        <option>Formal</option>
                        <option>Persuasive</option>
                        <option>Concise</option>
                    </select>
                    <button onClick={handleAdjustTone} disabled={isLoading || !inputText} className="select-none inline-flex items-center gap-2 px-4 py-2 bg-slate-600 dark:bg-slate-600 text-white rounded-md hover:bg-slate-700 active:bg-slate-800 text-sm font-semibold disabled:bg-slate-400">
                        <ChatBubbleIcon className="w-4 h-4" />
                        {isAdjustingTone ? 'Adjusting...' : 'Adjust Tone'}
                    </button>
                </div>
            </div>

            {isLoading && <SkeletonLoader className="h-20 w-full mt-3 rounded-md" />}

            {paraphraseResults.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">Paraphrased Versions:</h4>
                    {paraphraseResults.map((result, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                            <p className="text-sm text-slate-800 dark:text-slate-100">{result}</p>
                        </div>
                    ))}
                </div>
            )}
            {toneResult && (
                <div className="mt-4 animate-fade-in">
                     <h4 className="font-semibold text-slate-700 dark:text-slate-200">{selectedTone} Version:</h4>
                     <div className="p-3 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                        <p className="text-sm text-slate-800 dark:text-slate-100">{toneResult}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const AcademicWritingHelper: React.FC = () => {
    const [step, setStep] = useState<'topic_selection' | 'writing_helper'>('topic_selection');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [isCustomTopic, setIsCustomTopic] = useState(false);
    
    const [prompts, setPrompts] = useState<string[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    
    const [thesis, setThesis] = useState('');
    const [isLoadingThesis, setIsLoadingThesis] = useState(false);
    
    const [outline, setOutline] = useState('');
    const [isLoadingOutline, setIsLoadingOutline] = useState(false);
    
    const [sources, setSources] = useState<AcademicSource[]>([]);
    const [isLoadingSources, setIsLoadingSources] = useState(false);
    
    const [inputText, setInputText] = useState('');
    const [feedback, setFeedback] = useState<AcademicFeedback | null>(null);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [error, setError] = useState('');

    const resetWritingState = () => {
        setPrompts([]);
        setSelectedPrompt(null);
        setThesis('');
        setOutline('');
        setSources([]);
        setInputText('');
        setFeedback(null);
    };

    const handleTopicSelect = (topic: string, isCustom = false) => {
        setSelectedTopic(topic);
        setIsCustomTopic(isCustom);
        setStep('writing_helper');
        resetWritingState();
    };
    
    const handleGeneratePrompts = async () => {
        if (!selectedTopic) return;
        setIsLoadingPrompts(true);
        resetWritingState();
        const result = await generateAcademicPrompts(selectedTopic);
        setPrompts(result);
        setIsLoadingPrompts(false);
    };

    const handleGenerateThesis = async (prompt: string) => {
        setSelectedPrompt(prompt);
        setIsLoadingThesis(true);
        setThesis('');
        const result = await generateThesisStatement(prompt);
        setThesis(result);
        setIsLoadingThesis(false);
    };

    const handleGenerateOutline = async () => {
        if (!selectedPrompt || !thesis) return;
        setIsLoadingOutline(true);
        setOutline('');
        const result = await generateEssayOutline(selectedPrompt, thesis);
        setOutline(result);
        setIsLoadingOutline(false);
    };

    const handleFindSources = async () => {
        if (!selectedTopic) return;
        setIsLoadingSources(true);
        setSources([]);
        const result = await findAcademicSources(selectedTopic);
        setSources(result);
        setIsLoadingSources(false);
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
                    Select a topic to get started with our advanced pre-writing toolkit and feedback analyzer.
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
                {/* Pre-Writing Toolkit */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white">1. Pre-Writing Toolkit</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Generate ideas, structure, and sources before you start writing.</p>
                     
                     <div className="mt-3">
                        <h4 className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200"><LightbulbIcon className="w-5 h-5"/>Essay Prompts</h4>
                        <button onClick={handleGeneratePrompts} disabled={isLoadingPrompts || !selectedTopic} className="mt-2 text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50">
                             {isLoadingPrompts ? 'Generating...' : 'Generate Essay Questions'}
                        </button>
                     </div>
                     
                     {isLoadingPrompts && <SkeletonLoader className="h-24 w-full mt-3 rounded-md" />}
                     {prompts.length > 0 && (
                        <div className="mt-2 space-y-3">
                            {prompts.map((prompt, i) => (
                                <div key={i} className={`p-3 bg-white dark:bg-slate-700 rounded-md border-2 ${selectedPrompt === prompt ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-600'}`}>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{prompt}</p>
                                    <button onClick={() => handleGenerateThesis(prompt)} disabled={isLoadingThesis} className="mt-2 text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50">
                                        {isLoadingThesis && selectedPrompt === prompt ? 'Thinking...' : 'Generate Thesis Statement'}
                                    </button>
                                </div>
                            ))}
                        </div>
                     )}

                    <div className="mt-3 space-y-4">
                        {/* Thesis Statement */}
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200"><BeakerIcon className="w-5 h-5"/>Thesis Statement</h4>
                            <textarea
                                value={thesis}
                                onChange={(e) => setThesis(e.target.value)}
                                rows={2}
                                placeholder={isLoadingThesis ? "Generating thesis..." : "Your thesis will appear here. It's the core argument of your essay."}
                                className="w-full p-2 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md"
                            />
                        </div>
                        {/* Outline */}
                        <div>
                             <h4 className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200"><ListBulletIcon className="w-5 h-5"/>Essay Outline</h4>
                             <button onClick={handleGenerateOutline} disabled={!thesis || isLoadingOutline} className="mt-2 text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50">
                                {isLoadingOutline ? 'Creating Outline...' : 'Create Outline from Thesis'}
                             </button>
                             {isLoadingOutline && <SkeletonLoader className="h-20 w-full mt-2 rounded-md" />}
                             {outline && <pre className="whitespace-pre-wrap font-sans text-sm mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md">{outline}</pre>}
                        </div>
                         {/* Research Assistant */}
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200"><LinkIcon className="w-5 h-5"/>Research Assistant</h4>
                            <button onClick={handleFindSources} disabled={isLoadingSources || !selectedTopic} className="mt-2 text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50">
                               {isLoadingSources ? 'Searching...' : 'Find Web Sources'}
                            </button>
                            {isLoadingSources && <SkeletonLoader className="h-16 w-full mt-2 rounded-md" />}
                            {sources.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {sources.map(source => (
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" key={source.uri} className="block p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <p className="font-semibold text-indigo-600 dark:text-indigo-400 truncate">{source.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{source.uri}</p>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Advanced Writing Toolkit */}
                <AdvancedWritingToolkit />

                {/* Feedback Analyzer */}
                <div>
                    <label htmlFor="assignment-text" className="block text-lg font-bold text-slate-800 dark:text-white mb-2">2. Write Your Draft & Get Feedback</label>
                    <textarea
                        id="assignment-text"
                        rows={12}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your complete assignment text here to get a full analysis..."
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
                        {isLoadingFeedback ? 'Analyzing...' : 'Analyze My Writing'}
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