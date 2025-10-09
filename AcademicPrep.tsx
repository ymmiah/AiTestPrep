import React from 'react';
import ModuleLayout from './components/ModuleLayout';
import AcademicWritingHelper from './components/academic/AcademicWritingHelper';
import { Theme } from './types';

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
    >
      <div className="p-4 md:p-8">
        <AcademicWritingHelper />
      </div>
    </ModuleLayout>
  );
};

export default AcademicPrep;