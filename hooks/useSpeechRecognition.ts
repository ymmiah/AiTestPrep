import { useState, useCallback, useRef, useEffect } from 'react';

// FIX: Add type definitions for the Web Speech API, which are not included in standard TypeScript DOM typings.
// This resolves errors related to 'SpeechRecognition' and 'webkitSpeechRecognition' not being found on the window object,
// and defines the 'SpeechRecognition' type for use with useRef and event handlers.
interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;
const hasRecognitionSupport = !!SpeechRecognitionAPI;

export const useSpeechRecognition = (
  onTranscriptReady: (transcript: string) => void
): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startListening = useCallback(() => {
    if (isListening || !hasRecognitionSupport) {
      return;
    }
    
    setError(null); // Reset error on a new attempt

    const recognition = new SpeechRecognitionAPI!();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-GB'; // Specific language for the UK A2 test

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = `An error occurred (${event.error}). Please try again.`;
      if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'network') {
        errorMessage = 'A network error occurred. Please check your connection and try again.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try speaking again.';
      }
      setError(errorMessage);
      // 'onend' will be called automatically by the API after an error, which handles cleanup.
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscriptReady(transcript);
      if (recognitionRef.current) {
        recognitionRef.current.stop(); // Stop listening once a result is received
      }
    };

    recognition.start();
  }, [isListening, onTranscriptReady]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  return {
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error,
  };
};