import React from 'react';

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
  </svg>
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6z" />
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V3.5a.75.75 0 0 1 .75-.75zM8.5 6.5a.75.75 0 0 1 .53 1.28l-2.5 2.5a.75.75 0 0 1-1.06-1.06l2.5-2.5a.75.75 0 0 1 .53-.22zm7 0a.75.75 0 0 1 .53.22l2.5 2.5a.75.75 0 0 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 .53-1.28zM3.5 12.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5H3.5zm13.5 0a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5zM8.5 15.5a.75.75 0 0 1 .53.22l2.5 2.5a.75.75 0 0 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 .53-1.28zm7 0a.75.75 0 0 1 .53 1.28l-2.5 2.5a.75.75 0 1 1-1.06-1.06l2.5-2.5a.75.75 0 0 1 .53-.22zM12 16.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V17.5a.75.75 0 0 1 .75-.75z"/>
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.354 7.646a.5.5 0 0 0-.708-.708L11 12.293l-1.646-1.647a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l4-4z" clipRule="evenodd" />
    </svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 2.024.792 3.84 2.096 5.145.312.312.404.768.25 1.155A5.996 5.996 0 0 0 6 22a.75.75 0 0 0 .75.75h10.5a.75.75 0 0 0 .75-.75 5.996 5.996 0 0 0-1.154-3.955c-.154-.387-.062-.843.25-1.155C18.708 13.34 19.5 11.524 19.5 9.5A7.5 7.5 0 0 0 12 2zM9 22.75a3 3 0 0 0 6 0H9z" clipRule="evenodd" />
    </svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.5 3.75A2.25 2.25 0 0 0 8.25 6v12a2.25 2.25 0 0 0 2.25 2.25h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25h-8.25z" clipRule="evenodd" />
    </svg>
);

export const SoundWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M6 7.5a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 016 7.5zM9.75 6a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V6.75A.75.75 0 019.75 6zM13.5 4.5a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V5.25a.75.75 0 01.75-.75zM17.25 7.5a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75z" />
    </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm-4.5.75a.75.75 0 0 0 0-1.5H.75a.75.75 0 0 0 0 1.5h2.25ZM20.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H21a.75.75 0 0 1-.75-.75ZM15.836 17.664a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 S0 15.013l1.59 1.59a.75.75 0 0 0 1.06 1.061ZM6.34 8.164a.75.75 0 0 0-1.06-1.06L3.69 8.694a.75.75 0 0 0 1.06 1.06l1.59-1.59Zm11.32.001a.75.75 0 0 0-1.06 1.06l1.59 1.59a.75.75 0 0 0 1.06-1.06l-1.59-1.59ZM12 18.75a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V19.5a.75.75 0 0 1 .75-.75ZM7.06 17.664a.75.75 0 0 0-1.06-1.061L4.41 18.193a.75.75 0 1 0 1.06 1.06l1.59-1.59Z" />
  </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
  </svg>
);

export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.382.75.75 0 00-.676.928A49.409 49.409 0 0112 21.75c-2.43 0-4.817-.178-7.152-.52-1.978-.292-3.348-2.024-3.348-3.97v-6.02c0 1.946 1.37-3.678 3.348-3.97A48.901 48.901 0 018.524 6.25a.75.75 0 00-.676-.928A49.409 49.409 0 014.848 2.771z" clipRule="evenodd" />
    </svg>
);

export const CalendarDaysIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h13.5c.621 0 1.125-.504 1.125-1.125V7.875c0-.621-.504-1.125-1.125-1.125H5.25z" clipRule="evenodd" />
      <path d="M10.06 12.19a.75.75 0 10-1.06 1.06l1.25 1.25a.75.75 0 001.06 0l2.5-2.5a.75.75 0 10-1.06-1.06L10.5 12.94l-.44-.44-.439.439z" />
    </svg>
);

export const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.882 0-1.473.823-1.473 1.838 0 .934.624 1.626 1.438 1.849.54.153.852.336.852.766 0 .391-.333.634-.78.634-.584 0-.84-.42-.84-.997a.75.75 0 00-1.5 0c0 1.153.967 1.997 2.34 1.997 1.453 0 2.288-.863 2.288-2.028 0-1.02-.6-1.667-1.452-1.88-1.06-.266-1.176-.612-1.176-.934 0-.328.278-.58.747-.58.522 0 .747.32.747.84a.75.75 0 001.5 0c0-1.123-.882-2.17-2.34-2.17zM12 15.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

export const CardStackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.75 2.25a.75.75 0 00-1.5 0v.172c-1.006.073-1.93.313-2.784.697a.75.75 0 00-.466 1.052l.142.383c.125.337.47.535.81.465 1.05-.213 2.158-.213 3.208 0 .34.07.685-.128.81-.465l.142-.383a.75.75 0 00-.466-1.052A11.952 11.952 0 0012.75 2.422V2.25z" />
        <path fillRule="evenodd" d="M4.5 6.75A.75.75 0 015.25 6h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 11.25A.75.75 0 015.25 10.5h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM5.25 15a.75.75 0 000 1.5h13.5a.75.75 0 000-1.5H5.25zM4.5 19.5A.75.75 0 015.25 18h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const HeadphonesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.25 12a.75.75 0 000 1.5h.75v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5H9v-1.5a.75.75 0 00-1.5 0v1.5H6.75a4.5 4.5 0 014.5-4.5h.75a.75.75 0 000-1.5H12a6 6 0 00-6 6v.75A.75.75 0 006.75 12H8.25zm6.22-6.22a.75.75 0 011.06 0l2.25 2.25a.75.75 0 01-1.06 1.06L15 7.06l-1.72 1.72a.75.75 0 01-1.06-1.06l2.25-2.25z" clipRule="evenodd" />
      <path d="M14.25 12a.75.75 0 01.75-.75h.75a4.5 4.5 0 014.5 4.5v.75a.75.75 0 01-1.5 0V16.5a3 3 0 00-3-3h-.75a.75.75 0 01-.75-.75z" />
    </svg>
);

export const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
);

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v6.101A2.25 2.25 0 0117.25 22h-2.25a.75.75 0 01-.75-.75V16.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v4.75a.75.75 0 01-.75.75h-2.25A2.25 2.25 0 013.75 19.75v-6.101c.02-.03.044-.058.07-.084L12 5.432z" />
    </svg>
);

export const AcademicCapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.375 8.098a3 3 0 015.25 0l3.375 5.846a3 3 0 01-5.25 0L3.375 8.098zM15.375 8.098a3 3 0 015.25 0l3.375 5.846a3 3 0 01-5.25 0l-3.375-5.846z" />
      <path fillRule="evenodd" d="M10.875 18.75a1.875 1.875 0 013.75 0h-3.75zM2.25 3.75A2.25 2.25 0 014.5 1.5h15A2.25 2.25 0 0121.75 3.75v15.75c0 .548-.223 1.054-.586 1.414l-2.25 2.25a.75.75 0 01-1.06 0l-2.25-2.25A2.25 2.25 0 0115 19.5V18h-6v1.5a2.25 2.25 0 01-.586 1.414l-2.25 2.25a.75.75 0 01-1.06 0l-2.25-2.25A2.25 2.25 0 012.25 19.5V3.75z" clipRule="evenodd" />
    </svg>
);

export const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12A2.25 2.25 0 0120.25 20.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06l2.755-2.754a.75.75 0 011.06 0l3.078 3.077a.75.75 0 001.06 0l1.92-1.921a.75.75 0 011.06 0l2.575 2.575a.75.75 0 001.06 0l2.09-2.091a.75.75 0 00-1.06-1.06l-2.09 2.09-2.575-2.575a.75.75 0 00-1.06 0l-1.92 1.92a.75.75 0 01-1.06 0l-3.078-3.077a.75.75 0 00-1.06 0L3 16.061zM15 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
    </svg>
);

export const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.5 2.25a.75.75 0 00-1.5 0v1.125c-.324.04-.64.103-.953.187a.75.75 0 00-.5 1.341 5.23 5.23 0 01-1.1 4.545 6.73 6.73 0 01-3.4 2.298.75.75 0 00-.513 1.334 25.093 25.093 0 003.1 3.298.75.75 0 001.25-.783 23.59 23.59 0 01-.5-3.606 5.23 5.23 0 015.652-4.108.75.75 0 00.584-1.258 6.73 6.73 0 01-.64-6.353.75.75 0 00-1.112-.638c-.136.05-.278.093-.42.132V2.25z" />
      <path d="M7.5 2.25a.75.75 0 011.5 0v1.125c.324.04.64.103.953.187a.75.75 0 01.5 1.341 5.23 5.23 0 001.1 4.545 6.73 6.73 0 003.4 2.298.75.75 0 01.513 1.334 25.093 25.093 0 01-3.1 3.298.75.75 0 01-1.25-.783 23.59 23.59 0 00.5-3.606 5.23 5.23 0 00-5.652-4.108.75.75 0 01-.584-1.258 6.73 6.73 0 00.64-6.353.75.75 0 011.112-.638c.136.05.278.093.42.132V2.25z" />
      <path fillRule="evenodd" d="M12 21.75a2.25 2.25 0 00-2.24-2.223 2.25 2.25 0 00-2.25 2.25c0 .546.197 1.05.53 1.451a.75.75 0 001.21-.863A.75.75 0 019.75 21.75h.008a.75.75 0 01.75.75 2.25 2.25 0 004.5 0 .75.75 0 01.75-.75h.008a.75.75 0 01.522.214.75.75 0 001.21.863 2.25 2.25 0 00.53-1.451 2.25 2.25 0 00-2.25-2.25 2.25 2.25 0 00-2.24 2.223zM12 15.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
      <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
    </svg>
);

export const DocumentArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3H5.625zM12.75 12.75a.75.75 0 00-1.5 0v2.56l-1.06-1.06a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l2.25-2.25a.75.75 0 10-1.06-1.06l-1.06 1.06v-2.56z" clipRule="evenodd" />
      <path d="M14.25 6a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 00.75-.75z" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.722H5.93a.75.75 0 01-.749-.722L4.176 6.662l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9zM5.25 6.375a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V7.125a.75.75 0 01.75-.75zM8.25 6.375a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V7.125a.75.75 0 01.75-.75zm3 0a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V7.125a.75.75 0 01.75-.75zm3 0a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V7.125a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

export const ClipboardDocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.5 3.75a.75.75 0 00-1.5 0V4.5a.75.75 0 001.5 0V3.75z" />
        <path fillRule="evenodd" d="M4.5 3.75A.75.75 0 003 4.5v15A.75.75 0 004.5 21h15a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75h-15zm9.566 8.01a.75.75 0 00-1.06-1.061l-3.001 3.002-1.468-1.467a.75.75 0 10-1.06 1.06l2 2a.75.75 0 001.06 0l3.53-3.53z" clipRule="evenodd" />
        <path d="M10.5 1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V1.5zM15 1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V1.5z" />
    </svg>
);

export const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 6.375a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 10.125a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM5.25 13.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H5.25z" />
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

export const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.75 1.5a3 3 0 013 3v1.5a3 3 0 01-3 3h-1.5a3 3 0 01-3-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v1.5a3 3 0 003 3h1.5a3 3 0 003-3v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 01-4.5 4.5H6a4.5 4.5 0 01-4.5-4.5V6A4.5 4.5 0 016 1.5h1.5a4.5 4.5 0 014.5 4.5v.75a.75.75 0 001.5 0V6a3 3 0 00-3-3h-1.5zM7.5 15a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017.5 15zm0 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 010-1.113zM12.001 19.5c3.314 0 6.22-2.12 7.553-5.25a.75.75 0 000-.5c-1.333-3.13-4.24-5.25-7.555-5.25c-3.31 0-6.22 2.12-7.553 5.25a.75.75 0 000 .5c1.333 3.13 4.24 5.25 7.555 5.25z" clipRule="evenodd" />
    </svg>
);

export const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
      <path d="M15.75 12c0 .18-.013.357-.037.53l-1.66-1.66A3.75 3.75 0 0012 9.75c-.18 0-.357.013-.53.037l-1.66-1.66A3.75 3.75 0 0112 7.5c2.071 0 3.75 1.679 3.75 3.75zM9.062 15.151a3.733 3.733 0 01-1.562-1.562l-1.66-1.66A3.75 3.75 0 007.5 12c0-2.071 1.679-3.75 3.75-3.75.532 0 1.036.11 1.508.313l-1.66 1.66a3.733 3.733 0 01-1.562 1.562z" />
      <path d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c1.355 0 2.662.27 3.882.755l-1.42 1.42A3.734 3.734 0 0012.001 6c-3.31 0-6.22 2.12-7.553 5.25a.75.75 0 000 .5c.29.682.658 1.323 1.099 1.908l-1.42 1.42A11.217 11.217 0 011.323 12.553a.75.75 0 010-1.113z" />
    </svg>
);

export const SpeakerWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.672 3.672 3.672 9.63 0 13.302a.75.75 0 11-1.06-1.06c3.102-3.102 3.102-8.142 0-11.244a.75.75 0 010-1.06z" />
      <path d="M16.464 7.226a.75.75 0 011.06 0c2.122 2.121 2.122 5.565 0 7.686a.75.75 0 11-1.06-1.06c1.552-1.552 1.552-4.074 0-5.626a.75.75 0 010-1.06z" />
    </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
    </svg>
);

export const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.54 22.351l.07.07a1.5 1.5 0 002.121-2.121l-.07-.07L12 21.086l-1.64-1.64a1.5 1.5 0 00-2.12 2.121l.07.07L11.54 22.35zM12 2.25a6.75 6.75 0 00-6.75 6.75c0 3.52 3.11 9.22 6.16 12.31a.75.75 0 001.18 0C15.64 18.22 18.75 12.52 18.75 9A6.75 6.75 0 0012 2.25zM12 12a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

export const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.597 15.248 15.248 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.74 0 3.41.81 4.5 2.088A5.995 5.995 0 0116.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.11-3.75 8.862a15.248 15.248 0 01-4.244 3.17 15.247 15.247 0 01-1.383.597l-.022.012-.007.003h-.001z" />
    </svg>
);

export const ShoppingBagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.762.724-1.865 1.679l-1.263 12A1.875 1.875 0 002.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3z" clipRule="evenodd" />
    </svg>
);

export const ListBulletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const BeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-2.25a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5zm0-2.25a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-2.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
    </svg>
);

export const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.25 9.75a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" />
      <path fillRule="evenodd" d="M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6zm1.5 3.75a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zm.75 4.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const TicketIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-2.25 2.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 00-1.06 0l-2.25 2.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 00-1.06 0L4.5 9.75a.75.75 0 01-1.06 0L1.5 8.67z" />
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l2.25 2.25a.75.75 0 011.06 0l2.25-2.25a.75.75 0 001.06 0l2.25 2.25a.75.75 0 011.06 0l2.25-2.25a.75.75 0 001.06 0l2.25 2.25a.75.75 0 011.06 0L22.5 6.908z" />
    </svg>
);

export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.298-.083.465a7.48 7.48 0 003.358 3.358c.167.081.364.052.465-.083l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
    </svg>
);

// New icons for B1 Conversation Topics
export const MusicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.25a.75.75 0 01.75.75v11.256A4.5 4.5 0 1111.25 12v-9a.75.75 0 01.75-.75z" />
    </svg>
);

export const FilmIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15z" />
        <path d="M6.75 9.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75z" />
    </svg>
);

// Alias GiftIcon for SpecialOccasionIcon
export const GiftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75V19.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V5.25z" />
        <path d="M12 4.5a.75.75 0 01.75.75v14.25a.75.75 0 01-1.5 0V5.25a.75.75 0 01.75-.75zM8.25 12a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" />
    </svg>
);

export const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.36-2.43-.97-2.43-.97-.36-.91-.88-1.15-.88-1.15-.72-.49.05-.48.05-.48.8.05 1.22.82 1.22.82.71 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8a8 8 0 0 0-8-8z" />
    </svg>
);