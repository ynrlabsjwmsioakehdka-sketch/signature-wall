import React, { useState } from 'react';
import { Button } from './shared/Button';
import { SparklesIcon } from './icons/SparklesIcon';

interface TextInputProps {
  onGenerate: (name: string) => void;
  isLoading: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onGenerate, isLoading }) => {
  const [name, setName] = useState('');

  const handleGenerate = () => {
    if (name.trim()) {
      onGenerate(name.trim());
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your full name"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
        disabled={isLoading}
        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
      />
      <Button 
        onClick={handleGenerate} 
        disabled={!name.trim() || isLoading}
        className="w-full"
      >
        <SparklesIcon className="w-5 h-5 mr-2" />
        Generate Artistic Signature
      </Button>
    </div>
  );
};
