import React, { useRef, useEffect, useState, useCallback } from 'react';

export const useSignaturePad = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const getContext = useCallback(() => {
    return canvasRef.current?.getContext('2d');
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawing(false);
    }
  }, [getContext]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      const ctx = getContext();
      if (ctx) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [getContext]);

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in event) { // Type guard for TouchEvent
      if (event.touches.length > 0) {
        return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
      }
    } else { // It's a MouseEvent
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    return null;
  };

  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const coords = getCoordinates(event);
    if (!coords) return;
    const ctx = getContext();
    if(ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        setIsDrawing(true);
        setHasDrawing(true);
    }
  }, [getContext]);

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    const coords = getCoordinates(event);
    if (!coords) return;
    const ctx = getContext();
    if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }
  }, [isDrawing, getContext]);

  const stopDrawing = useCallback(() => {
    const ctx = getContext();
    if(ctx) {
        ctx.closePath();
    }
    setIsDrawing(false);
  }, [getContext]);

  const toDataURL = () => {
    return canvasRef.current?.toDataURL('image/png');
  };

  return { canvasRef, clear, toDataURL, hasDrawing, startDrawing, draw, stopDrawing };
};
