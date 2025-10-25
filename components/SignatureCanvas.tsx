
import React from 'react';
import { useSignaturePad } from '../hooks/useSignaturePad';
import { Button } from './shared/Button';
import { TrashIcon } from './icons/TrashIcon';

interface SignatureCanvasProps {
  onSign: (dataUrl: string) => void;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSign }) => {
  const { canvasRef, clear, toDataURL, hasDrawing, startDrawing, draw, stopDrawing } = useSignaturePad();

  const handleAdd = () => {
    const dataUrl = toDataURL();
    if (dataUrl) {
      onSign(dataUrl);
      clear();
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full">
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
      <div className="flex gap-4">
        <Button variant="secondary" onClick={clear} disabled={!hasDrawing}>
          <TrashIcon className="w-5 h-5 mr-2" />
          Clear
        </Button>
        <Button onClick={handleAdd} disabled={!hasDrawing}>
          Add Handwritten Signature to Wall
        </Button>
      </div>
    </div>
  );
};
