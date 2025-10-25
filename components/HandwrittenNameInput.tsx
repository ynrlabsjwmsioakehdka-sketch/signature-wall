import React, { useState } from 'react';
import { useSignaturePad } from '../hooks/useSignaturePad';
import { recognizeHandwriting } from '../services/geminiService';
import { Button } from './shared/Button';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Spinner } from './shared/Spinner';
import { AspectRatio } from '../types';

interface HandwrittenNameInputProps {
  onGenerate: (name: string, aspectRatio: AspectRatio) => void;
  isLoading: boolean;
}

export const HandwrittenNameInput: React.FC<HandwrittenNameInputProps> = ({ onGenerate, isLoading }) => {
  const { canvasRef, clear, toDataURL, hasDrawing, startDrawing, draw, stopDrawing } = useSignaturePad();
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleGenerate = async () => {
    const dataUrl = toDataURL();
    if (!dataUrl) return;

    setIsRecognizing(true);
    try {
      const name = await recognizeHandwriting(dataUrl);
      if (name) {
        onGenerate(name, aspectRatio);
        clear();
      } else {
        alert("Could not recognize a name from the drawing. Please try writing more clearly.");
      }
    } catch (error) {
      console.error("Handwriting recognition failed:", error);
      alert("Handwriting recognition failed. Please try again.");
    } finally {
      setIsRecognizing(false);
    }
  };
  
  const isDisabled = !hasDrawing || isLoading || isRecognizing;

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {isRecognizing && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Spinner text="Recognizing your handwriting..." /></div>}
      <canvas
        ref={canvasRef}
        className="w-full h-48 md:h-64 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button variant="secondary" onClick={clear} disabled={isDisabled}>
          <TrashIcon className="w-5 h-5 mr-2" />
          Clear
        </Button>
        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          className="block w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isDisabled}
        >
          <option value="1:1">1:1</option>
          <option value="16:9">16:9</option>
          <option value="9:16">9:16</option>
          <option value="4:3">4:3</option>
          <option value="3:4">3:4</option>
        </select>
      </div>
       <Button onClick={handleGenerate} disabled={isDisabled} className="w-full">
         <SparklesIcon className="w-5 h-5 mr-2" />
         Generate from Handwriting
       </Button>
    </div>
  );
};