import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { Button } from './shared/Button';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface VoiceInputProps {
  onGenerate: (name: string) => void;
  isLoading: boolean;
}

// Helper functions for audio encoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


export const VoiceInput: React.FC<VoiceInputProps> = ({ onGenerate, isLoading }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const startListening = async () => {
    try {
      if (!process.env.API_KEY) throw new Error("API Key not found");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      setTranscript('');
      setIsListening(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // FIX: Cast window to any to support webkitAudioContext for older browsers
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;
      
      sessionPromiseRef.current = ai.live.connect({
        // FIX: Corrected model name from 'gemini-2.5-flash-native-audio-preview-09-2525' to 'gemini-2.5-flash-native-audio-preview-09-2025' as per guidelines.
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => prev + text);
            }
          },
          onerror: (e: ErrorEvent) => console.error('Live API Error:', e),
          onclose: (e: CloseEvent) => {},
        },
        // FIX: Added required 'responseModalities' config for Live API as per guidelines.
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

    } catch (error) {
      console.error('Failed to start listening:', error);
      setIsListening(false);
    }
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

  }, []);

  useEffect(() => {
    return () => {
      if(isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);


  const handleGenerate = () => {
    if (transcript.trim()) {
      onGenerate(transcript.trim());
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <div className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 min-h-[10rem] flex items-center justify-center">
        <p className="text-2xl font-light text-slate-700">{transcript || 'Say your name...'}</p>
      </div>
      <Button 
        onClick={isListening ? stopListening : startListening}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {isListening ? <StopIcon className="w-5 h-5 mr-2" /> : <MicIcon className="w-5 h-5 mr-2" />}
        {isListening ? 'Stop Listening' : 'Speak Your Name'}
      </Button>
      <Button 
        onClick={handleGenerate} 
        disabled={!transcript || isLoading}
        className="w-full"
      >
        <SparklesIcon className="w-5 h-5 mr-2" />
        Generate Artistic Signature
      </Button>
    </div>
  );
};