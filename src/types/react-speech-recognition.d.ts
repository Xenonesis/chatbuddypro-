declare module 'react-speech-recognition' {
  export interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: () => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    start: () => void;
    stop: () => void;
    abort: () => void;
  }

  export interface SpeechRecognitionErrorEvent {
    error: string;
    message?: string;
  }

  export interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  export interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
  }

  export interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
  }

  export interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  export interface RecognitionOptions {
    continuous?: boolean;
    language?: string;
    interimResults?: boolean;
    maxAlternatives?: number;
  }

  export interface SpeechRecognitionHook {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
    resetTranscript: () => void;
    startListening: (options?: RecognitionOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
  }

  export default function useSpeechRecognition(): SpeechRecognitionHook;
} 