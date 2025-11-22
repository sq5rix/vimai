import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Toolbar } from './components/Toolbar';
import { ImageGenModal, TextEditModal } from './components/Modals';
import { ViewMode, Theme } from './types';
import { generateImage, editText, continueWriting, imageToText } from './services/gemini';
import { generateTypstZip } from './services/typst';
import { Loader2 } from 'lucide-react';

// Sample initial content
const INITIAL_CONTENT = `# The Lost City of Aethelgard

It was a dark and stormy night when **Elara** first saw the glimmer of the spire.

## Chapter 1: The Arrival

The wind howled through the canyon, carrying with it the scent of ozone and ancient dust. Elara pulled her cloak tighter, her mechanical arm whirring softly as she adjusted the grip on her staff.

> "To find the city is to lose oneself," the old oracle had warned.

She hadn't listened. She never did.

![Ancient Ruins](https://picsum.photos/800/400)

The path ahead was treacherous, lined with the statues of forgotten kings.

`;

const App: React.FC = () => {
  const [content, setContent] = useState<string>(INITIAL_CONTENT);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [theme, setTheme] = useState<Theme>('system');
  
  // Modal States
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  
  // AI Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editor Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgToTextRef = useRef<HTMLInputElement>(null);

  // --- Theme Handling ---
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = theme === 'dark' || (theme === 'system' && isSystemDark);
      
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Apply immediately
    applyTheme();

    // Listen for system changes if theme is system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // --- Helpers for Text Manipulation ---

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    
    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    
    // Use functional update to ensure we don't lose updates
    setContent(newText);
    
    // Restore cursor position after render
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return '';
    return content.substring(textarea.selectionStart, textarea.selectionEnd);
  };

  const replaceSelection = (newText: string) => {
    insertAtCursor(newText);
  };

  // --- Handlers ---

  const handleFormat = (type: string) => {
    let wrap = '';
    let block = '';
    
    switch (type) {
      case 'bold': wrap = '**'; break;
      case 'italic': wrap = '*'; break;
      case 'h1': block = '# '; break;
      case 'h2': block = '## '; break;
    }

    if (wrap) {
      const selection = getSelection();
      replaceSelection(`${wrap}${selection}${wrap}`);
    } else if (block) {
      // For blocks, we typically want to insert at start of line. 
      // Simplified here: just insert at cursor or replace selection.
      insertAtCursor(block);
    }
  };

  const handleGenerateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '3:4' | '4:3') => {
    setIsProcessing(true);
    setStatusMessage("Generating Image... this may take a few seconds.");
    try {
      const base64 = await generateImage(prompt, aspectRatio);
      const markdownImage = `\n![${prompt}](${base64})\n`;
      insertAtCursor(markdownImage);
      setIsImgModalOpen(false);
    } catch (e) {
      alert("Failed to generate image. Please check your API key or try again.");
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleAIEdit = async (instruction: string) => {
    const selection = getSelection();
    if (!selection) return;

    setIsProcessing(true);
    setStatusMessage("Rewriting text...");
    try {
      const rewritten = await editText(selection, instruction);
      replaceSelection(rewritten);
      setIsTextModalOpen(false);
    } catch (e) {
      alert("Failed to rewrite text.");
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleAIContinue = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Grab text up to cursor
    const textUpToCursor = content.substring(0, textarea.selectionEnd);
    
    setIsProcessing(true);
    setStatusMessage("Continuing your story...");
    try {
      const newText = await continueWriting(textUpToCursor);
      insertAtCursor(newText);
    } catch (e) {
      alert("Failed to continue writing.");
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleExport = async (type: 'md' | 'html' | 'pdf' | 'typst') => {
    if (type === 'pdf') {
      window.print();
      return;
    }

    const filename = "ebook";
    let blob: Blob | null = null;
    let downloadName = `${filename}.${type}`;

    if (type === 'md') {
      blob = new Blob([content], { type: 'text/markdown' });
    } else if (type === 'html') {
      // Basic wrapper for valid HTML export
      const htmlContent = document.getElementById('preview-content')?.innerHTML || "";
      const data = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ebook Export</title>
          <style>body { font-family: serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; } img { max-width: 100%; }</style>
        </head>
        <body>${htmlContent}</body>
        </html>
      `;
      blob = new Blob([data], { type: 'text/html' });
    } else if (type === 'typst') {
      setIsProcessing(true);
      setStatusMessage("Generating Typst project zip...");
      try {
        blob = await generateTypstZip(content);
        downloadName = `${filename}_typst.zip`;
      } catch (err) {
        console.error(err);
        alert("Failed to create Typst zip.");
        setIsProcessing(false);
        setStatusMessage(null);
        return;
      } finally {
        setIsProcessing(false);
        setStatusMessage(null);
      }
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
        alert("Clipboard API not supported");
        return;
      }
      const text = await navigator.clipboard.readText();
      insertAtCursor(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert("Failed to paste. Please allow clipboard permissions.");
    }
  };

  const handleImageToTextClick = () => {
    imgToTextRef.current?.click();
  };

  const onImgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage("Extracting text from image...");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        
        try {
          const text = await imageToText(base64Data, mimeType);
          insertAtCursor(text);
        } catch (aiError) {
          console.error(aiError);
          alert("Failed to extract text from image.");
        } finally {
          setIsProcessing(false);
          setStatusMessage(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
       console.error(err);
       setIsProcessing(false);
       setStatusMessage(null);
    }
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        className="hidden" 
        accept=".md,.txt,.markdown" 
      />
      <input 
        type="file" 
        ref={imgToTextRef} 
        onChange={onImgFileChange} 
        className="hidden" 
        accept="image/*" 
      />

      <Toolbar 
        onFormat={handleFormat}
        onGenerateImage={() => setIsImgModalOpen(true)}
        onAIEdit={() => {
           if (getSelection().trim().length === 0) {
             alert("Please select some text to edit first.");
             return;
           }
           setIsTextModalOpen(true);
        }}
        onAIContinue={handleAIContinue}
        onExport={handleExport}
        onOpenFile={handleOpenFile}
        onPaste={handlePaste}
        onImageToText={handleImageToTextClick}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex-1 overflow-hidden relative flex">
        
        {/* Editor Pane */}
        {(viewMode === ViewMode.EDIT || viewMode === ViewMode.SPLIT) && (
          <div className={`h-full ${viewMode === ViewMode.SPLIT ? 'w-1/2 border-r border-gray-200 dark:border-gray-800' : 'w-full'} flex flex-col no-print transition-all duration-200`}>
             <div className="bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 px-4 py-1 font-mono border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider transition-colors">Markdown Source</div>
            <textarea
              ref={textareaRef}
              className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 transition-colors"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Start writing your masterpiece..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === ViewMode.PREVIEW || viewMode === ViewMode.SPLIT) && (
          <div 
            id="preview-pane"
            className={`h-full ${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white dark:bg-gray-900 transition-colors duration-200`}
          >
            {viewMode === ViewMode.SPLIT && (
              <div className="bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 px-4 py-1 font-mono border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider no-print transition-colors">Preview</div>
            )}
            <div className="max-w-3xl mx-auto p-8 lg:p-12 min-h-full">
              <article id="preview-content" className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none font-serif prose-headings:font-sans prose-headings:font-bold prose-img:rounded-xl prose-img:shadow-md transition-colors">
                <ReactMarkdown>{content}</ReactMarkdown>
              </article>
            </div>
          </div>
        )}

        {/* Status Overlay */}
        {isProcessing && (
           <div className="absolute bottom-6 right-6 bg-gray-900/90 dark:bg-gray-700/95 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-bounce-in border border-gray-700 dark:border-gray-600">
             <Loader2 className="animate-spin text-indigo-400 dark:text-indigo-300" size={20} />
             <span className="font-medium">{statusMessage || "Processing..."}</span>
           </div>
        )}
      </div>

      <ImageGenModal 
        isOpen={isImgModalOpen} 
        onClose={() => !isProcessing && setIsImgModalOpen(false)}
        onGenerate={handleGenerateImage}
        isGenerating={isProcessing}
      />

      <TextEditModal
        isOpen={isTextModalOpen}
        onClose={() => !isProcessing && setIsTextModalOpen(false)}
        onConfirm={handleAIEdit}
        selectedText={getSelection()}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default App;