import React, { useState, useEffect } from 'react';
import { IELTSSpeakingScript, IELTSSpeakingFeedback } from '../../types';
import { generateIELTSSpeakingScript, getIELTSSpeakingFeedback, updateUserProfile } from '../../services/geminiService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import SkeletonLoader from '../SkeletonLoader';
import { ChatBubbleIcon, MicrophoneIcon, SparklesIcon, StopIcon } from '../IconComponents';

type SpeakingState = 'loading' | 'ready' | 'recording' | 'processing' | 'feedback';

const ScoreDisplay: React.FC<{ title: string; score: number; feedback: string }> = ({ title, score, feedback }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
            <span className="px-2 py-0.5 text-sm font-bold bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded-full">{score.toFixed(1)}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(score / 9) * 100}%` }}></div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{feedback}</p>
    </div>
);

const IELTSSpeaking: React.FC = () => {
    const [state, setState] = useState<SpeakingState>('loading');
    const [script, setScript] = useState<IELTSSpeakingScript | null>(null);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState<IELTSSpeakingFeedback | null>(null);

    const { isListening, startListening, stopListening, error } = useSpeechRecognition(setTranscript);

    const loadScript = async () => {
        setState('loading');
        setTranscript('');
        setFeedback(null);
        const fetchedScript = await generateIELTSSpeakingScript();
        setScript(fetchedScript);
        setState('ready');
    };

    useEffect(() => {
        loadScript();
    }, []);

    const handleGetFeedback = async () => {
        if (!transcript) return;
        setState('processing');
        const result = await getIELTSSpeakingFeedback(transcript, script!);
        setFeedback(result);
        setState('feedback');

        await updateUserProfile(p => {
            const ielts = p.progress.ielts;
            const newCount = ielts.speakingSessionsCompleted + 1;
            const newAvg = ((ielts.avgSpeakingBand * ielts.speakingSessionsCompleted) + result.overallBand) / newCount;
            p.progress.ielts.speakingSessionsCompleted = newCount;
            p.progress.ielts.avgSpeakingBand = parseFloat(newAvg.toFixed(1));
            return p;
        });
    };

    useEffect(() => {
        if (!isListening && transcript && state === 'recording') {
            handleGetFeedback();
        }
    }, [isListening, transcript]);

    if (state === 'loading' || !script) {
        return (
             <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                 <SkeletonLoader className="h-8 w-1/2 mx-auto mb-2" />
                 <SkeletonLoader className="h-5 w-3/4 mx-auto mb-8" />
                 <SkeletonLoader className="h-64 w-full" />
             </div>
        );
    }
    
    if (state === 'feedback' && feedback) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in max-w-3xl mx-auto">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Your Speaking Assessment</h2>
                 </div>
                 <div className="space-y-6">
                    <div className="text-center p-6 bg-indigo-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Overall Band Score</p>
                        <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-300">{feedback.overallBand.toFixed(1)}</p>
                    </div>
                    <ScoreDisplay title="Fluency & Coherence" {...feedback.fluencyAndCoherence} />
                    <ScoreDisplay title="Lexical Resource" {...feedback.lexicalResource} />
                    <ScoreDisplay title="Grammar Range & Accuracy" {...feedback.grammaticalRangeAndAccuracy} />
                    <ScoreDisplay title="Pronunciation" {...feedback.pronunciation} />
                     <div className="bg-teal-50 dark:bg-teal-900/50 p-4 rounded-lg border border-teal-200 dark:border-teal-700">
                        <h4 className="font-bold text-teal-800 dark:text-teal-200">Suggested Improvements</h4>
                        <p className="text-sm text-teal-700 dark:text-teal-300 mt-2 whitespace-pre-wrap">{feedback.suggestedImprovements}</p>
                    </div>
                </div>
                <div className="mt-8 text-center">
                     <button onClick={loadScript} className="select-none inline-flex items-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800">
                        <SparklesIcon className="w-4 h-4" />
                        Try a New Test
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                 <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <ChatBubbleIcon className="w-8 h-8 text-indigo-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">IELTS Speaking Practice</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                       Read through the questions for all three parts. When you are ready, press the microphone button to record your full response in one go.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Part 1 */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Part 1: Introduction</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                            {script.part1Questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                    {/* Part 2 */}
                    <div className="bg-amber-50 dark:bg-amber-900/50 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                        <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200">Part 2: Cue Card</h3>
                        <p className="font-semibold text-slate-800 dark:text-white mt-2">{script.part2CueCard.topic}</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                            {script.part2CueCard.points.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    </div>
                     {/* Part 3 */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Part 3: Discussion</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                            {script.part3Questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                </div>

                 <div className="mt-8 text-center">
                     <button
                        onClick={() => {
                            if (isListening) {
                                stopListening();
                            } else {
                                setState('recording');
                                startListening();
                            }
                        }}
                        className={`select-none flex items-center justify-center mx-auto w-24 h-24 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 active:scale-95
                        ${isListening 
                            ? 'bg-rose-500 text-white focus:ring-rose-300 animate-pulse' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300'
                        }`}
                        aria-label={isListening ? 'Stop recording' : 'Start recording'}
                    >
                        {isListening ? <StopIcon className="w-10 h-10"/> : <MicrophoneIcon className="w-12 h-12" />}
                    </button>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 h-5 flex items-center justify-center">
                        {error ? <span className="text-rose-500 font-medium">{error}</span> :
                        state === 'recording' ? 'Recording... Press stop when finished.' : 
                        state === 'processing' ? 'Analyzing your response...' :
                        'Press the button to start recording your response.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IELTSSpeaking;