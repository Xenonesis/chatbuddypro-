import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';
import { 
  Mic, MicOff, Check, AlertCircle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

export default function VoiceInputSettings() {
  const { settings, toggleVoiceInput, toggleContinuousListening } = useModelSettings();
  const { voiceInputSettings } = settings;

  const [testResult, setTestResult] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioDataArray = useRef<Uint8Array | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // Check browser support for speech recognition
  const [browserSupport, setBrowserSupport] = useState<boolean>(true);
  const [microphoneStatus, setMicrophoneStatus] = useState<'unavailable' | 'ready' | 'active' | 'denied'>('ready');
  
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  
  // Use the voice input hook for testing
  const { 
    isListening, 
    toggleListening, 
    stopListening,
    transcript, 
    interimTranscript,
    browserSupportsSpeechRecognition, 
    microphoneAvailable,
    micPermissionDenied,
    noSpeechDetected
  } = useVoiceInput({
    onTranscriptChange: (text) => {
      // Update live transcript in real-time
      console.log("Transcript changed:", text);
      setLiveTranscript(text || '');
      
      if (text) {
        // Only update final result when we have a decent-length transcript
        // or when we've been idle for a while
        if (text.length > 10) {
          setTestResult(text);
          setTestStatus('success');
        }
      }
    }
  });
  
  // Debug transcripts
  useEffect(() => {
    console.log("Live transcript updated:", liveTranscript);
  }, [liveTranscript]);

  // Effect to update test result when transcript changes
  useEffect(() => {
    if (transcript && isListening) {
      setTestResult(transcript);
      if (transcript.length > 3) {
        setTestStatus('success');
      }
    }
  }, [transcript, isListening]);
  
  // Handle audio visualization
  const startAudioVisualization = async () => {
    try {
      // Check if AudioContext is supported
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('AudioContext not supported in this browser');
        setMicrophoneStatus('unavailable');
        return;
      }
      
      if (!audioContext.current) {
        try {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (err) {
          console.error('Failed to create AudioContext:', err);
          setMicrophoneStatus('unavailable');
          return;
        }
      }
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia not supported in this browser');
        setMicrophoneStatus('unavailable');
        return;
      }
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Make sure we have tracks in the stream
      if (!stream || !stream.getAudioTracks().length) {
        console.warn('No audio tracks found in media stream');
        setMicrophoneStatus('unavailable');
        return;
      }
      
      setMicrophoneStatus('active');
      
      // Set up audio analyzer
      if (audioContext.current) {
        try {
          analyser.current = audioContext.current.createAnalyser();
          analyser.current.fftSize = 256;
          
          microphone.current = audioContext.current.createMediaStreamSource(stream);
          microphone.current.connect(analyser.current);
          
          const bufferLength = analyser.current.frequencyBinCount;
          audioDataArray.current = new Uint8Array(bufferLength);
          
          // Start visualization loop
          visualizeAudio();
          
          // For debugging - set a baseline audio level even if no sound
          // This helps verify the visualization is working
          setAudioLevel(5);
        } catch (err) {
          console.error('Error setting up audio analyzer:', err);
          setMicrophoneStatus('unavailable');
        }
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setMicrophoneStatus('denied');
      } else {
        setMicrophoneStatus('unavailable');
      }
    }
  };
  
  const stopAudioVisualization = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    // Disconnect and clean up audio nodes
    if (microphone.current) {
      microphone.current.disconnect();
      microphone.current = null;
    }
    
    // Close audio context
    if (audioContext.current) {
      if (audioContext.current.state !== 'closed') {
        audioContext.current.close().catch(err => {
          console.error('Error closing AudioContext:', err);
        });
      }
      audioContext.current = null;
    }
    
    setMicrophoneStatus('ready');
    setAudioLevel(0);
  };
  
  const visualizeAudio = () => {
    if (!analyser.current || !audioDataArray.current) return;
    
    try {
      analyser.current.getByteFrequencyData(audioDataArray.current);
      
      // Calculate average volume level (0-100)
      const average = Array.from(audioDataArray.current).reduce((sum, value) => sum + value, 0) / 
                      audioDataArray.current.length;
      
      // Scale to 0-100 for easier use with a minimum of 5 for better visualization
      const scaledAverage = Math.min(100, Math.max(5, average * 2.0));
      setAudioLevel(scaledAverage);
      
      // Continue the visualization loop
      animationFrameId.current = requestAnimationFrame(visualizeAudio);
    } catch (err) {
      console.error('Error in audio visualization:', err);
      // Don't stop completely, try again
      animationFrameId.current = requestAnimationFrame(visualizeAudio);
    }
  };
  
  useEffect(() => {
    // Simple check for browser support
    setBrowserSupport(
      'webkitSpeechRecognition' in window || 
      'SpeechRecognition' in window
    );
    
    return () => {
      // Clean up audio visualization when component unmounts
      stopAudioVisualization();
    };
  }, []);
  
  // Start/stop audio visualization when listening state changes
  useEffect(() => {
    if (isListening) {
      startAudioVisualization();
    } else {
      stopAudioVisualization();
      
      // If we have a test result, keep showing success state
      if (testStatus !== 'success') {
        setTestStatus('idle');
      }
    }
  }, [isListening]);

  const handleTestMicrophone = async () => {
    if (testStatus === 'testing') {
      stopListening();
      stopAudioVisualization();
      setTestStatus('idle');
      setLiveTranscript('');
      return;
    }
    
    setTestStatus('testing');
    setTestResult(null);
    setLiveTranscript('');
    
    try {
      // First try to initialize audio visualization separately
      // This allows us to visualize microphone even if speech recognition fails
      await startAudioVisualization();
      
      // Then try to activate speech recognition
      await toggleListening();
      
      // Set a timeout to automatically stop the test after 10 seconds if no speech detected
      setTimeout(() => {
        if (isListening && !testResult) {
          stopListening();
          stopAudioVisualization();
          setTestStatus('error');
          setTestResult('No speech detected. Please try again or check your microphone.');
        }
      }, 10000);
    } catch (error) {
      console.error('Error testing microphone:', error);
      setTestStatus('error');
      
      // More specific error messages
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setTestResult('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (!browserSupportsSpeechRecognition) {
        setTestResult('Speech recognition not supported in this browser. Please try Chrome, Edge, or Safari.');
      } else {
        setTestResult('An error occurred while testing your microphone. Please try again.');
      }
      
      // Stop audio visualization if there was an error
      stopAudioVisualization();
    }
  };

  return (
    <Card className="border dark:border-slate-700">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Mic className="h-5 w-5 text-red-500" />
          Voice Input Settings
        </CardTitle>
        <CardDescription>
          Configure voice recognition and speech-to-text options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Voice Input */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium" htmlFor="voice-input-toggle">
              Voice Input
            </Label>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Use your microphone to dictate messages
            </p>
          </div>
          <Switch
            id="voice-input-toggle"
            checked={voiceInputSettings.enabled}
            onCheckedChange={toggleVoiceInput}
            disabled={!browserSupport}
          />
        </div>
        
        {/* Test microphone section with visual feedback */}
        {voiceInputSettings.enabled && browserSupport && (
          <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              Test Your Microphone
              {microphoneStatus === 'denied' && (
                <span className="ml-2 text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Microphone access denied
                </span>
              )}
              {microphoneStatus === 'unavailable' && (
                <span className="ml-2 text-xs text-amber-500 flex items-center">
                  <MicOff className="h-3 w-3 mr-1" />
                  Microphone unavailable
                </span>
              )}
            </h4>
            
            <div className="flex flex-col gap-3">
              {/* Microphone level visualizer */}
              <div className="relative h-8 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                <div 
                  className={cn(
                    "absolute h-full transition-all duration-100 rounded-md",
                    testStatus === 'error' ? "bg-red-500" : // Red for not working
                    testStatus === 'success' ? "bg-green-500" : // Green for working
                    audioLevel > 70 ? "bg-green-500" : 
                    audioLevel > 40 ? "bg-blue-500" : 
                    audioLevel > 10 ? "bg-slate-400" : 
                    "bg-slate-300 dark:bg-slate-700"
                  )}
                  style={{ 
                    width: `${testStatus === 'error' ? 100 : testStatus === 'success' ? 100 : Math.max(audioLevel, isListening ? 5 : 0)}%`,
                    opacity: testStatus === 'error' || testStatus === 'success' ? 0.7 : 1
                  }}
                />
                
                {/* Simplified animation that should work in more browsers */}
                {isListening && testStatus === 'testing' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-1 items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i}
                          className="w-0.5 h-4 bg-white dark:bg-slate-200 rounded-full animate-pulse"
                          style={{ 
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: `${0.8 + (i % 3) * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center px-3">
                  {testStatus === 'testing' && (
                    <p className="text-xs font-medium z-10 text-slate-700 dark:text-white">
                      {audioLevel > 5 ? 'Microphone active - speak now' : 'Waiting for audio...'}
                    </p>
                  )}
                  {testStatus === 'error' && (
                    <p className="text-xs font-medium z-10 text-white">
                      <MicOff className="h-3 w-3 inline-block mr-1" />
                      Microphone not working
                    </p>
                  )}
                  {testStatus === 'success' && (
                    <p className="text-xs font-medium z-10 text-white">
                      <Check className="h-3 w-3 inline-block mr-1" />
                      Microphone working properly
                    </p>
                  )}
                </div>
              </div>
              
              {/* Live transcript display - add color status indicators */}
              {isListening && testStatus === 'testing' && (
                <div className={cn(
                  "mt-1 mb-1 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md relative",
                  liveTranscript ? "border-green-200 dark:border-green-700" : "border-slate-200 dark:border-slate-700" 
                )}>
                  <p className={cn(
                    "text-xs absolute top-1 left-2",
                    liveTranscript ? "text-green-500" : "text-slate-400"
                  )}>
                    {liveTranscript ? (
                      <>
                        <Check className="h-3 w-3 inline-block mr-1" />
                        Speech detected:
                      </>
                    ) : (
                      'Speaking:'
                    )}
                  </p>
                  <p className="text-sm pt-4 pb-1 min-h-[40px] break-words">
                    {liveTranscript ? (
                      <span className="font-medium">{liveTranscript}</span>
                    ) : (
                      <span className="text-slate-400 italic">Waiting for speech...</span>
                    )}
                    <span className="inline-block ml-1 animate-pulse">▋</span>
                  </p>
                </div>
              )}
              
              {/* Status message section - Update styling for clearer status indication */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {testStatus === 'success' && testResult && (
                    <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      <span>Microphone working: "<span className="font-medium">{testResult}</span>"</span>
                    </div>
                  )}
                  {testStatus === 'error' && testResult && (
                    <div className="flex items-center text-xs text-red-600 dark:text-red-400 font-medium">
                      <MicOff className="h-3.5 w-3.5 mr-1.5" />
                      <span>{testResult}</span>
                    </div>
                  )}
                  {testStatus === 'idle' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click the button to test if your microphone works
                    </p>
                  )}
                </div>
                <Button 
                  size="sm"
                  disabled={!browserSupport || microphoneStatus === 'denied'}
                  onClick={handleTestMicrophone}
                  className={cn(
                    "ml-2",
                    testStatus === 'testing' ? "bg-red-500 hover:bg-red-600" : 
                    testStatus === 'success' ? "bg-green-500 hover:bg-green-600" :
                    testStatus === 'error' ? "bg-red-500 hover:bg-red-600" : ""
                  )}
                >
                  {testStatus === 'testing' ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 mr-1.5" />
                      Stop Test
                    </>
                  ) : testStatus === 'success' ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Test Again
                    </>
                  ) : testStatus === 'error' ? (
                    <>
                      <Mic className="h-3.5 w-3.5 mr-1.5" />
                      Try Again
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 mr-1.5" />
                      Test Microphone
                    </>
                  )}
                </Button>
              </div>
              
              {testStatus === 'success' && testResult && (
                <div className="text-xs text-green-600 dark:text-green-400 italic">
                  Your microphone is working! If the text isn't accurate, try speaking more clearly.
                </div>
              )}
            </div>
          </div>
        )}
        
        {!browserSupport && (
          <div className="p-2 bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-900 rounded-md">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your browser doesn't support speech recognition. Please try Chrome, Edge, or Safari.
            </p>
          </div>
        )}
        
        {/* Continuous Listening Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <Label className="text-sm font-medium" htmlFor="continuous-listening-toggle">
              Continuous Listening
            </Label>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Keep listening until manually stopped
            </p>
          </div>
          <Switch
            id="continuous-listening-toggle"
            checked={voiceInputSettings.continuous}
            onCheckedChange={toggleContinuousListening}
            disabled={!voiceInputSettings.enabled || !browserSupport}
          />
        </div>
        
        {/* Tips */}
        <div className="pt-2 px-3 py-3 bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-900 rounded-md mt-4">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Tips for best results:</h4>
          <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
            <li>Speak clearly and at a moderate pace</li>
            <li>Minimize background noise</li>
            <li>Say "period" or "comma" for punctuation</li>
            <li>Say "new line" to start a new paragraph</li>
            <li>Speak closer to your microphone if possible</li>
            <li>If recognition stops frequently, try shorter phrases</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}