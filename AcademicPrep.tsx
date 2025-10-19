import React from 'react';
import ModuleLayout from './components/ModuleLayout';
import AcademicWritingHelper from './components/academic/AcademicWritingHelper';
import { Theme } from './types';
import { GitHubIcon } from './components/IconComponents';

interface AcademicPrepProps {
  onGoBack: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AcademicPrep: React.FC<AcademicPrepProps> = ({ onGoBack, theme, setTheme }) => {
  return (
    <ModuleLayout
      title="Academic Learning"
      onGoBack={onGoBack}
      theme={theme}
      setTheme={setTheme}
    >
      <div className="p-4 md:p-8">
        <AcademicWritingHelper />
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
  );
};

export default AcademicPrep;