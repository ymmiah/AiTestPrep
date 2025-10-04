import React from 'react';
import { Feedback } from '../types';
import { CheckCircleIcon, LightbulbIcon, BookOpenIcon, SoundWaveIcon } from './IconComponents';

interface FeedbackCardProps {
  feedback: Feedback | null;
}

const FeedbackItem: React.FC<{ icon: React.ReactNode; title: string; text: string; color: string }> = ({ icon, title, text, color }) => {
    
    const renderContent = () => {
        // Handle bullet points for Grammar and Vocabulary
        if ((title === 'Grammar' || title === 'Vocabulary') && text.includes('\n')) {
            const points = text.split('\n').filter(p => p.trim() !== '');
            return (
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                    {points.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            );
        }
        
        // Handle special rendering for Pronunciation score
        if (title === 'Pronunciation') {
            const scoreMatch = text.match(/(\d{1,3})\s*\/\s*100/);
            if (scoreMatch) {
                const score = scoreMatch[1];
                const comment = text.replace(scoreMatch[0], '').trim().replace(/^[\.,\s]+/, '');
                return (
                    <div>
                        <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{score}</span>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">/100</span>
                        </div>
                        {comment && <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">{comment}</p>}
                    </div>
                );
            }
        }
        
        // Default rendering for Fluency or other text
        return <p className="text-gray-600 dark:text-gray-300 text-sm">{text}</p>;
    };

    return (
        <div className="flex items-start p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${color}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{title}</h4>
                {renderContent()}
            </div>
        </div>
    );
};

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-3">
            <FeedbackItem 
                icon={<CheckCircleIcon className="w-5 h-5 text-white" />}
                title="Grammar"
                text={feedback.grammar}
                color="bg-green-500"
            />
            <FeedbackItem 
                icon={<BookOpenIcon className="w-5 h-5 text-white" />}
                title="Vocabulary"
                text={feedback.vocabulary}
                color="bg-blue-500"
            />
            <FeedbackItem 
                icon={<LightbulbIcon className="w-5 h-5 text-white" />}
                title="Fluency"
                text={feedback.fluency}
                color="bg-purple-500"
            />
             <FeedbackItem 
                icon={<SoundWaveIcon className="w-5 h-5 text-white" />}
                title="Pronunciation"
                text={feedback.pronunciation}
                color="bg-orange-500"
            />
        </div>
    </div>
  );
};

export default FeedbackCard;