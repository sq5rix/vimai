import React, { useState } from 'react';
import { X, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

// --- Image Gen Modal ---

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, aspectRatio: '1:1' | '16:9' | '3:4' | '4:3') => void;
  isGenerating: boolean;
}

export const ImageGenModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState<'1:1' | '16:9' | '3:4' | '4:3'>('1:1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <ImageIcon className="mr-2 text-indigo-600 dark:text-indigo-400" /> Generate Image
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt</label>
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aspect Ratio</label>
            <div className="grid grid-cols-4 gap-2">
              {(['1:1', '16:9', '4:3', '3:4'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setAspect(r)}
                  className={`py-2 px-1 text-sm rounded border transition-colors ${
                    aspect === r 
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-medium' 
                      : 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={!prompt.trim() || isGenerating}
            onClick={() => onGenerate(prompt, aspect)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={18} />}
            {isGenerating ? 'Dreaming...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- AI Text Edit Modal ---

interface TextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (instruction: string) => void;
  selectedText: string;
  isProcessing: boolean;
}

export const TextEditModal: React.FC<TextEditModalProps> = ({ isOpen, onClose, onConfirm, selectedText, isProcessing }) => {
  const [instruction, setInstruction] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <Sparkles className="mr-2 text-purple-600 dark:text-purple-400" /> AI Edit
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 max-h-32 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 italic scrollbar-thin">
          "{selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText}"
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instruction</label>
            <input 
              type="text"
              value={instruction} 
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Fix grammar, make it funnier, summarize..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />
          </div>

          <div className="flex gap-2 flex-wrap">
             {['Fix Grammar', 'Make it concise', 'Expand', 'Professional Tone'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setInstruction(s)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full transition-colors border border-transparent dark:border-gray-600"
                >
                  {s}
                </button>
             ))}
          </div>

          <button 
            disabled={!instruction.trim() || isProcessing}
            onClick={() => onConfirm(instruction)}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : 'Rewrite'}
          </button>
        </div>
      </div>
    </div>
  );
};