import React, { useState, useEffect } from 'react';
import { Signature } from '../types';
import { generateWallBackground } from '../services/geminiService';
import { Spinner } from './shared/Spinner';

interface SignatureWallProps {
  signatures: Signature[];
  customBackgroundUrl?: string | null;
}

interface PositionedSignature extends Signature {
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

export const SignatureWall: React.FC<SignatureWallProps> = ({ signatures, customBackgroundUrl }) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [positionedSignatures, setPositionedSignatures] = useState<PositionedSignature[]>([]);

  useEffect(() => {
    const setupBackground = async () => {
      setIsLoading(true);
      try {
        if (customBackgroundUrl) {
          setBackgroundUrl(customBackgroundUrl);
        } else {
          const url = await generateWallBackground();
          setBackgroundUrl(url);
        }
      } catch (error) {
        console.error("Failed to setup background:", error);
      } finally {
        setIsLoading(false);
      }
    };
    setupBackground();
  }, [customBackgroundUrl]);
  
  useEffect(() => {
    const newSignatures = signatures.filter(s => !positionedSignatures.some(ps => ps.id === s.id));
    
    if (newSignatures.length > 0) {
      const newPositioned = newSignatures.map(s => ({
        ...s,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        rotation: Math.random() * 20 - 10,
        delay: positionedSignatures.length * 100
      }));
      setPositionedSignatures(prev => [...prev, ...newPositioned]);
    }
  }, [signatures, positionedSignatures]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Spinner text="Curating the vibe..." size="lg" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full min-h-screen overflow-hidden bg-slate-200"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {positionedSignatures.map((sig) => (
        <div
          key={sig.id}
          className="absolute transform transition-all duration-1000 ease-out animate-fade-in"
          style={{
            left: `${sig.x}%`,
            top: `${sig.y}%`,
            transform: `translate(-50%, -50%) rotate(${sig.rotation}deg)`,
            transitionDelay: `${sig.delay}ms`,
          }}
        >
          <img
            src={sig.src}
            alt={sig.alt}
            className="w-48 h-auto object-contain bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-2xl"
          />
        </div>
      ))}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.5) translate(-50%, -50%); }
          to { opacity: 1; transform: scale(1) translate(-50%, -50%); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};