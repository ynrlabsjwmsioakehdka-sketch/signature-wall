import React, { useState } from 'react';
import { Signature } from './types';
import { SignatureCanvas } from './components/SignatureCanvas';
import { VoiceInput } from './components/VoiceInput';
import { TextInput } from './components/TextInput';
import { SignatureWall } from './components/SignatureWall';
import { generateArtisticSignature, editImage } from './services/geminiService';
import { Spinner } from './components/shared/Spinner';
import { Button } from './components/shared/Button';
import { EditIcon } from './components/icons/EditIcon';
import { TrashIcon } from './components/icons/TrashIcon';

type Mode = 'write' | 'speak' | 'type';

const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);


const App: React.FC = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [mode, setMode] = useState<Mode>('write');
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [showWall, setShowWall] = useState(false);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);

  const handleAddSignature = (src: string, alt: string) => {
    setSignatures((prev) => [...prev, { id: Date.now().toString(), src, alt }]);
    setCurrentSignature(null);
    setShowWall(true);
  };
  
  const handleGenerate = async (name: string) => {
    setIsLoading(true);
    setLoadingText(`Generating signature for "${name}"...`);
    try {
      const result = await generateArtisticSignature(name, '1:1');
      setCurrentSignature(result);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate signature. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleEdit = async () => {
    if (!currentSignature || !editPrompt) return;
    setIsLoading(true);
    setLoadingText('Applying AI edits...');
    try {
        const result = await editImage(currentSignature, 'image/png', editPrompt);
        setCurrentSignature(result);
        setEditPrompt('');
    } catch (error) {
        console.error('Editing failed:', error);
        alert('Failed to edit signature. Please try again.');
    } finally {
        setIsLoading(false);
        setLoadingText('');
    }
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomBackgroundUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderInputSection = () => (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">AI Signature Wall</h1>
        <p className="mt-2 text-lg text-gray-600">Create your mark. Join the conference.</p>
      </div>

      <div className="w-full bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setMode('write')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'write' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Handwrite Signature
          </button>
          <button
            onClick={() => setMode('speak')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'speak' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Speak Your Name
          </button>
          <button
            onClick={() => setMode('type')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'type' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Type Name
          </button>
        </div>
        
        {isLoading ? (
          <div className="min-h-[250px] flex items-center justify-center">
            <Spinner text={loadingText} size="lg" />
          </div>
        ) : (
          <div className="relative">
            {!currentSignature && mode === 'write' && <SignatureCanvas onSign={(dataUrl) => handleAddSignature(dataUrl, 'Handwritten signature')} />}
            {!currentSignature && mode === 'speak' && <VoiceInput onGenerate={handleGenerate} isLoading={isLoading}/>}
            {!currentSignature && mode === 'type' && <TextInput onGenerate={handleGenerate} isLoading={isLoading}/>}

            {currentSignature && (
              <div className="flex flex-col items-center gap-4 animate-fade-in-fast">
                <h3 className="text-lg font-medium text-gray-700">Your Generated Signature:</h3>
                <img src={currentSignature} alt="Generated Signature" className="max-w-full h-auto max-h-64 rounded-lg shadow-md border" />
                 <div className="w-full flex flex-col gap-2">
                    <div className="relative">
                       <input
                           type="text"
                           value={editPrompt}
                           onChange={(e) => setEditPrompt(e.target.value)}
                           placeholder="e.g., 'Add a retro filter' or 'Make it neon'"
                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                           disabled={isLoading}
                       />
                       <EditIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                     <Button onClick={handleEdit} disabled={!editPrompt || isLoading}>
                        Edit with AI
                     </Button>
                 </div>
                 <div className="flex gap-4 w-full">
                   <Button variant="secondary" onClick={() => setCurrentSignature(null)} className="w-full">
                     <TrashIcon className="w-5 h-5 mr-2" />
                     Discard
                   </Button>
                   <Button onClick={() => handleAddSignature(currentSignature, 'AI generated signature')} className="w-full">
                     Add to Wall
                   </Button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full p-4 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 gap-4">
          <div className="flex items-center gap-3">
              {customBackgroundUrl ? (
                  <img src={customBackgroundUrl} alt="Background Preview" className="w-16 h-9 object-cover rounded shadow-sm"/>
              ) : (
                  <div className="w-16 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-400 border">
                      <ImageIcon className="w-6 h-6"/>
                  </div>
              )}
              <p className="text-sm text-gray-600 font-medium">Custom Wall Background</p>
          </div>
          <div className="flex items-center gap-2">
              {customBackgroundUrl && (
                  <Button variant="danger" onClick={() => setCustomBackgroundUrl(null)} className="!px-3 !py-1.5 text-xs">
                      Remove
                  </Button>
              )}
              <Button variant="secondary" onClick={() => document.getElementById('background-upload')?.click()} className="!px-3 !py-1.5 text-xs">
                  Upload Image
              </Button>
              <input
                  type="file"
                  id="background-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
              />
          </div>
      </div>

      <Button onClick={() => setShowWall(true)} disabled={signatures.length === 0} variant="secondary">
        View Signature Wall ({signatures.length})
      </Button>
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      {showWall ? (
        <div className="relative">
          <SignatureWall signatures={signatures} customBackgroundUrl={customBackgroundUrl} />
          <Button
            onClick={() => setShowWall(false)}
            className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm"
          >
            ← Back to Creation
          </Button>
        </div>
      ) : (
        renderInputSection()
      )}
    </main>
  );
};

export default App;