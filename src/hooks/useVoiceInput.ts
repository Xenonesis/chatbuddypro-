import { useState, useEffect, useCallback, useRef } from 'react';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';
// Import only the type, not the actual hook
import type { SpeechRecognition as SpeechRecognitionType } from 'react-speech-recognition';

// Define types without relying on direct imports
interface UseVoiceInputOptions {
  onTranscriptChange?: (transcript: string) => void;
  continuousMode?: boolean;
  language?: string;
}

interface UseVoiceInputResult {
  isListening: boolean;
  toggleListening: () => Promise<void>;
  stopListening: () => void;
  transcript: string;
  interimTranscript: string;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  microphoneAvailable: boolean;
  micPermissionDenied: boolean;
  noSpeechDetected: boolean;
  requestMicrophonePermission: () => Promise<boolean>;
}

/**
 * A custom hook for handling voice input in the application
 * 
 * @param options Configuration options for the voice input
 * @returns Voice input state and controls
 */
export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const { onTranscriptChange } = options;
  const { settings } = useModelSettings();
  const { voiceInputSettings } = settings;
  
  // Use provided props or fallback to context settings
  const continuousMode = options.continuousMode !== undefined 
    ? options.continuousMode 
    : voiceInputSettings.continuous;
    
  const language = options.language || voiceInputSettings.language || 'en-US';

  // States for managing speech recognition
  const [isLoaded, setIsLoaded] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [browserSupport, setBrowserSupport] = useState(true);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [noSpeechDetected, setNoSpeechDetected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to store the module instances
  const SpeechRecognitionRef = useRef<any>(null);
  const recognitionInstanceRef = useRef<any>(null);
  // Add a ref to track language changes to prevent infinite loops
  const currentLanguageRef = useRef<string>(language);
  
  // Set up recognition handlers function - with NO dependencies on initRecognition
  const setupRecognitionHandlers = useCallback((recognition: any) => {
    if (!recognition) return;
    
    // Set a shorter recognition timeout - helps with "no-speech" errors
    // Chrome's default is around 8 seconds which is too long
    // Setting it to 5 seconds instead
    if ('speechRecognitionTimeout' in recognition) {
      (recognition as any).speechRecognitionTimeout = 5000;
    }
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setNoSpeechDetected(false);
      
      // Set a timeout to restart recognition if no speech is detected
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to auto-restart if no speech detected for a while
      timeoutRef.current = setTimeout(() => {
        if (isListening && recognitionInstanceRef.current) {
          console.log('Auto-restarting speech recognition due to inactivity');
          try {
            // Stop and restart to reset the recognition
            recognitionInstanceRef.current.stop();
            // Short delay before restarting
            setTimeout(() => {
              if (recognitionInstanceRef.current && continuousMode) {
                recognitionInstanceRef.current.start();
              }
            }, 300);
          } catch (error) {
            console.error('Error during auto-restart:', error);
          }
        }
      }, 8000);
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Auto-restart if it ended due to no-speech and we haven't already stopped intentionally
      if (noSpeechDetected && continuousMode && recognitionInstanceRef.current) {
        console.log('Attempting to restart after no-speech');
        setTimeout(() => {
          try {
            if (recognitionInstanceRef.current && continuousMode) {
              recognitionInstanceRef.current.start();
            }
          } catch (error) {
            console.error('Error restarting after no-speech:', error);
            // If restart fails, recreate the instance
            recognitionInstanceRef.current = null;
            // Safely try to initialize without causing loops
            initRecognitionSafe();
          }
        }, 500);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        setMicPermissionDenied(true);
        setMicrophoneAvailable(false);
        setIsListening(false);
      } 
      else if (event.error === 'no-speech') {
        // This is not a critical error, just a notification that no speech was detected
        setNoSpeechDetected(true);
        console.log('No speech detected. Please try speaking again or click the mic button to restart.');
        
        // Auto-end when no speech is detected
        if (recognition.onend) {
          try {
            recognition.stop();
          } catch (error) {
            console.error('Error stopping after no-speech:', error);
          }
        }
      }
      else if (event.error === 'aborted' || event.error === 'network') {
        // Network or abort errors might be temporary, try to restart
        console.log('Recognition aborted or network issue, attempting to restart');
        setIsListening(false);
        
        setTimeout(() => {
          try {
            if (recognitionInstanceRef.current && continuousMode) {
              recognitionInstanceRef.current.start();
            }
          } catch (restartError) {
            console.error('Error restarting after abort/network error:', restartError);
          }
        }, 1000);
      }
      else {
        console.error('Other speech recognition error:', event.error);
        // For other errors, don't try to auto-recover to avoid infinite loops
        setIsListening(false);
      }
    };
    
    recognition.onresult = (event: any) => {
      // Reset the no-speech state since we got results
      setNoSpeechDetected(false);
      
      // Reset the auto-restart timeout since we got speech
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        
        // Set a new timeout for continued listening
        timeoutRef.current = setTimeout(() => {
          if (isListening && recognitionInstanceRef.current) {
            console.log('Auto-restarting speech recognition due to inactivity');
            try {
              recognitionInstanceRef.current.stop();
              setTimeout(() => {
                if (recognitionInstanceRef.current && continuousMode) {
                  recognitionInstanceRef.current.start();
                }
              }, 300);
            } catch (error) {
              console.error('Error during auto-restart after result:', error);
            }
          }
        }, 8000);
      }
      
      try {
        const current = event.resultIndex;
        const interim = event.results[current][0].transcript;
        
        console.log('Speech result received:', {
          index: current,
          transcript: interim,
          isFinal: event.results[current].isFinal,
          confidence: event.results[current][0].confidence
        });
        
        // Always call onTranscriptChange, even for interim results
        if (onTranscriptChange) {
          onTranscriptChange(interim);
        }
        
        if (event.results[current].isFinal) {
          console.log('Got final transcript:', interim);
          setTranscript(interim);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
          // Update transcript with interim results too for immediate feedback
          setTranscript(interim);
        }
      } catch (processError) {
        console.error('Error processing speech result:', processError);
      }
    };
  }, [continuousMode, isListening, noSpeechDetected, onTranscriptChange]);

  // Safe initialization function to avoid circular dependencies
  const initRecognitionSafe = useCallback(() => {
    if (!browserSupport) {
      console.log('Speech recognition not supported');
      return;
    }
    
    try {
      // Create SpeechRecognition instance if it doesn't exist
      if (!recognitionInstanceRef.current) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionInstanceRef.current = new SpeechRecognition();
        
        if (recognitionInstanceRef.current) {
          console.log(`Creating speech recognition with language: ${language}`);
          recognitionInstanceRef.current.continuous = continuousMode;
          recognitionInstanceRef.current.interimResults = true;
          recognitionInstanceRef.current.maxAlternatives = 1;
          recognitionInstanceRef.current.lang = language;
          // Update current language ref to prevent unnecessary recreations
          currentLanguageRef.current = language;
          
          // Set up handlers
          setupRecognitionHandlers(recognitionInstanceRef.current);
        }
      } else {
        // Update existing instance settings
        console.log(`Updating speech recognition language to: ${language}`);
        recognitionInstanceRef.current.continuous = continuousMode;
        recognitionInstanceRef.current.lang = language;
        // Update current language ref
        currentLanguageRef.current = language;
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setBrowserSupport(false);
    }
  }, [browserSupport, continuousMode, language, setupRecognitionHandlers]);
  
  // Use a reference to prevent circular dependencies
  const initRecognition = useCallback(() => {
    initRecognitionSafe();
  }, [initRecognitionSafe]);

  // Check for Web Speech API support
  useEffect(() => {
    // Check browser support for Web Speech API
    const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
    const hasSpeechRecognition = 'SpeechRecognition' in window;
    
    const hasSpeechSupport = hasWebkitSpeechRecognition || hasSpeechRecognition;
    
    setBrowserSupport(hasSpeechSupport);
    
    if (hasSpeechSupport) {
      // Initialize recognition immediately
      initRecognitionSafe();
      setIsLoaded(true);
    }
    
    return () => {
      // Clean up recognition if it exists
      if (recognitionInstanceRef.current && isListening) {
        try {
          recognitionInstanceRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
      
      // Clear any timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [initRecognitionSafe, isListening]);

  // Update recognition settings when they change
  useEffect(() => {
    if (recognitionInstanceRef.current) {
      console.log(`Updating recognition settings - language: ${language}, continuous: ${continuousMode}`);
      recognitionInstanceRef.current.continuous = continuousMode;
      recognitionInstanceRef.current.lang = language;
      // Update current language ref
      currentLanguageRef.current = language;
    }
  }, [continuousMode, language]);

  // Check for language change without causing infinite loops
  useEffect(() => {
    // Only re-initialize if language changed and different from current instance
    if (language !== currentLanguageRef.current && recognitionInstanceRef.current && !isListening) {
      console.log(`Language changed from ${currentLanguageRef.current} to ${language}, recreating instance`);
      try {
        // Clean up existing instance
        recognitionInstanceRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      // Reset the instance
      recognitionInstanceRef.current = null;
      // Initialize with new language
      initRecognitionSafe();
    }
  }, [language, initRecognitionSafe, isListening]);
  
  // Helper function to start recognition
  const startRecognition = useCallback(async () => {
    // Reset no speech state
    setNoSpeechDetected(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Check if language has changed since last initialization
    if (recognitionInstanceRef.current && recognitionInstanceRef.current.lang !== language) {
      console.log(`Language mismatch (${recognitionInstanceRef.current.lang} vs ${language}), recreating instance`);
      try {
        recognitionInstanceRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      recognitionInstanceRef.current = null;
    }
    
    // Create instance if it doesn't exist
    if (!recognitionInstanceRef.current) {
      console.log('No recognition instance found, initializing');
      initRecognitionSafe();
    } else if (recognitionInstanceRef.current.lang !== language) {
      // Double-check language is correct
      console.log(`Updating recognition language to: ${language}`);
      recognitionInstanceRef.current.lang = language;
      currentLanguageRef.current = language;
    }
    
    if (recognitionInstanceRef.current) {
      try {
        // Check for microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
        
        // Reset permission denied flag if previously set
        if (micPermissionDenied) {
          setMicPermissionDenied(false);
          setMicrophoneAvailable(true);
        }
        
        // Mark that we've tried to get permissions
        setHasTried(true);
        
        // Reset transcript
        setTranscript('');
        setInterimTranscript('');
        
        try {
          // Start recognition with error handling
          recognitionInstanceRef.current.start();
          console.log('Speech recognition started successfully');
        } catch (recognitionError) {
          console.error('Error starting speech recognition:', recognitionError);
          
          // If there's an error starting, try recreating the instance
          if (recognitionError instanceof DOMException && recognitionError.name === 'InvalidStateError') {
            // Recognition might be already running, try to stop it first
            try {
              recognitionInstanceRef.current.stop();
              console.log('Stopped existing recognition instance');
              // Wait a moment and try again
              setTimeout(() => {
                if (recognitionInstanceRef.current) {
                  try {
                    recognitionInstanceRef.current.start();
                    console.log('Restarted recognition after stop');
                  } catch (error) {
                    console.error('Failed to restart recognition after stop:', error);
                    setIsListening(false);
                  }
                }
              }, 300);
            } catch (stopError) {
              console.error('Error stopping speech recognition:', stopError);
              // Create a new instance as last resort
              recognitionInstanceRef.current = null;
              initRecognitionSafe();
              
              // Give a little time for the new instance to initialize
              setTimeout(() => {
                if (recognitionInstanceRef.current) {
                  try {
                    recognitionInstanceRef.current.start();
                    console.log('Started with new recognition instance');
                  } catch (finalError) {
                    console.error('Failed to start with new recognition instance:', finalError);
                    setIsListening(false);
                  }
                }
              }, 300);
            }
          } else {
            // For other errors, set listening to false
            setIsListening(false);
          }
        }
      } catch (err) {
        console.error('Microphone permission denied or error occurred:', err);
        setMicPermissionDenied(true);
        setMicrophoneAvailable(false);
        setHasTried(true);
        setIsListening(false);
      }
    } else {
      console.error('Speech recognition not available');
      setIsListening(false);
    }
  }, [micPermissionDenied, initRecognitionSafe, language]);
  
  // Helper function to stop recognition
  const stopRecognition = useCallback(() => {
    if (recognitionInstanceRef.current) {
      try {
        if (isListening) {
          recognitionInstanceRef.current.stop();
          console.log('Speech recognition stopped successfully');
        }
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        // If we can't stop it normally, force recognition to reset
        recognitionInstanceRef.current = null;
        setIsListening(false);
      }
    }
  }, [isListening]);
  
  // Toggle listening state
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopRecognition();
    } else {
      await startRecognition();
    }
  }, [isListening, startRecognition, stopRecognition]);
  
  // Reset transcript function
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);
  
  // Stop listening if the feature is disabled in settings
  useEffect(() => {
    if (!continuousMode && isListening) {
      stopRecognition();
    }
  }, [continuousMode, isListening, stopRecognition]);
  
  // Request microphone permissions explicitly
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // If we get here, permission was granted
      setMicrophoneAvailable(true);
      setMicPermissionDenied(false);
      
      // Clean up the stream
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setMicrophoneAvailable(false);
      setMicPermissionDenied(true);
      return false;
    }
  }, []);
  
  return {
    isListening,
    toggleListening,
    stopListening: stopRecognition,
    transcript,
    interimTranscript,
    resetTranscript,
    browserSupportsSpeechRecognition: browserSupport,
    microphoneAvailable: microphoneAvailable || !hasTried,
    micPermissionDenied,
    noSpeechDetected,
    requestMicrophonePermission
  };
} 