import React, { useState, useEffect } from 'react';
import ConversationSimulator from './components/ConversationSimulator';
import StudyPlanCreator from './components/StudyPlanCreator';
import TopicPractice from './components/TopicPractice';
import VocabularyBuilder from './components/VocabularyBuilder';
import ListeningPractice from './components/ListeningPractice';
import Dashboard from './components/Dashboard';
import GrammarHub from './components/GrammarHub';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Leaderboard from './components/Leaderboard';
import MockTest from './components/MockTest';
import { View, Theme, Module, UserProfile } from './types';
import PronunciationPractice from './components/PronunciationPractice';
import ModuleLayout from './components/ModuleLayout';
import { getUserProfile } from './services/geminiService';
import { GitHubIcon } from './components/IconComponents';

interface A2AppProps {
  onGoBack: () => void;
  onNavigateToModule: (module: Module) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initialView?: View;
  userProfile: UserProfile | null;
  forceProfileRefetch: () => void;
}

const A2App: React.FC<A2AppProps> = ({ onGoBack, onNavigateToModule, theme, setTheme, initialView, userProfile, forceProfileRefetch }) => {
  const [activeView, setActiveView] = useState<View>(initialView || 'dashboard');
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
      const fetchDevMode = async () => {
          const profile = await getUserProfile();
          setIsDeveloperMode(profile.isDeveloperMode || false);
      };
      fetchDevMode();
  }, [userProfile]);
  
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} onNavigateToModule={onNavigateToModule} userProfile={userProfile} />;
      case 'simulator':
        return <ConversationSimulator />;
      case 'vocabulary':
        return <VocabularyBuilder />;
      case 'listening':
        return <ListeningPractice />;
      case 'grammar':
        return <GrammarHub />;
      case 'pronunciation':
        return <PronunciationPractice />;
       case 'mockTest':
        return <MockTest setActiveView={setActiveView} />;
      case 'planner':
        return <StudyPlanCreator />;
      case 'topicPractice':
        return <TopicPractice />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <Dashboard setActiveView={setActiveView} onNavigateToModule={onNavigateToModule} userProfile={userProfile} />;
    }
  };

  const viewTitles: { [key in View]: string } = {
    dashboard: 'Dashboard',
    simulator: 'Conversation Practice',
    vocabulary: 'Vocabulary Builder',
    listening: 'Listening Practice',
    grammar: 'Grammar Hub',
    pronunciation: 'Pronunciation Practice',
    mockTest: 'Mock A2 Exam',
    planner: 'Study Planner',
    topicPractice: 'Topic Practice',
    leaderboard: 'Leaderboard'
  };

  return (
      <div className="h-full bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans animate-fade-in">
        <div className="flex h-full">
          <Sidebar activeView={activeView} setActiveView={setActiveView} onNavigateToModule={onNavigateToModule} />
          
          <ModuleLayout
            title={viewTitles[activeView]}
            onGoBack={onGoBack}
            theme={theme}
            setTheme={setTheme}
          >
            <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
              {renderView()}
               <footer className="w-full mt-12 py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-4">
                    <a href="https://github.com/ymmiah/AiTestPrep" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                        <GitHubIcon className="w-4 h-4" />
                        <span>GitHub Repository</span>
                    </a>
                    <span>|</span>
                    <span>Last updated: October 20, 2025</span>
                </div>
                <p className="mt-2">&copy; 2025 Powered by Yasin Mohammed Miah.</p>
            </footer>
            </div>
          </ModuleLayout>
          
          <BottomNav activeView={activeView} setActiveView={setActiveView} onNavigateToModule={onNavigateToModule} />

          {isDeveloperMode && (
            <div className="fixed bottom-20 md:bottom-2 left-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded z-50 pointer-events-none">
                [DEV: {activeView}]
            </div>
          )}
        </div>
      </div>
  );
};

export default A2App;