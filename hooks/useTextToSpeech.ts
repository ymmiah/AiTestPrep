import { useState, useCallback, useEffect, useRef } from 'react';

// For better error event typing, as this is not always standard in the default TS DOM lib.
interface SpeechSynthesisErrorEvent extends Event {
  readonly charIndex: number;
  readonly elapsedTime: number;
  readonly name: string;
  readonly error: string;
}

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, onEndCallback?: () => void) => void;
  cancel: () => void;
  hasSpeechSupport: boolean;
}

const hasSpeechSupport = typeof window !== 'undefined' && 'speechSynthesis' in window;

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices when they are ready. Voices are often loaded asynchronously.
  useEffect(() => {
    if (hasSpeechSupport) {
        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        }
    }
  }, []);

  const cancel = useCallback(() => {
    if (hasSpeechSupport && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // Manually set state because onend is not guaranteed to fire when cancel() is called.
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, onEndCallback?: () => void) => {
    if (!hasSpeechSupport || !text.trim()) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // A safety cancel before speaking to clear any previous utterances in the queue.
    cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Keep a reference to the utterance to prevent it from being garbage collected prematurely.
    utteranceRef.current = utterance;

    // Find a specific 'en-GB' voice for consistency, as required by the A2 test.
    // Prefer Google voices as they are often higher quality.
    const ukVoice = voices.find(voice => voice.lang === 'en-GB' && voice.name.includes('Google'));
    const fallbackUkVoice = voices.find(voice => voice.lang === 'en-GB');

    if (ukVoice) {
      utterance.voice = ukVoice;
    } else if (fallbackUkVoice) {
      // Fallback to setting lang if no specific voice is found
      utterance.lang = 'en-GB';
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (event) => {
      const synthesisErrorEvent = event as SpeechSynthesisErrorEvent;
      // An 'interrupted' error is expected when the user speaks or stops the conversation.
      // We don't want to log this as an error in the console.
      if (synthesisErrorEvent.error === 'interrupted') {
        setIsSpeaking(false);
        utteranceRef.current = null;
        if (onEndCallback) onEndCallback();
        return; 
      }
      
      console.error('SpeechSynthesisUtterance error:', synthesisErrorEvent.error, 'for text:', `"${text}"`);
      setIsSpeaking(false);
      utteranceRef.current = null;
      if (onEndCallback) onEndCallback();
    };
    
    window.speechSynthesis.speak(utterance);

  }, [cancel, voices]);

  // Cleanup on unmount to prevent memory leaks.
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { isSpeaking, speak, cancel, hasSpeechSupport };
};