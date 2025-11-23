import React from 'react';
import { 
  Bold, Italic, Heading1, Heading2, 
  Image as ImageIcon, Sparkles, Download, 
  Type, Eye, Columns, Printer, Wand2,
  Sun, Moon, Monitor, FolderOpen, ClipboardPaste, ScanText,
  BookTemplate, TerminalSquare, AlignJustify, Zap
} from 'lucide-react';
import { ViewMode, Theme, PreviewSettings } from '../types';

interface ToolbarProps {
  onFormat: (format: string) => void;
  onGenerateImage: () => void;
  onAIEdit: () => void;
  onAIImprove: () => void;
  onAIContinue: () => void;
  onExport: (type: 'md' | 'html' | 'pdf' | 'typst') => void;
  onOpenFile: () => void;
  onPaste: () => void;
  onImageToText: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  vimMode: boolean;
  setVimMode: (enabled: boolean) => void;
  previewSettings: PreviewSettings;
  setPreviewSettings: (settings: PreviewSettings) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onGenerateImage,
  onAIEdit,
  onAIImprove,
  onAIContinue,
  onExport,
  onOpenFile,
  onPaste,
  onImageToText,
  viewMode,
  setViewMode,
  theme,
  setTheme,
  vimMode,
  setVimMode,
  previewSettings,
  setPreviewSettings
}) => {
  const buttonBaseClass = "p-2 rounded-md transition-colors";
  const iconButtonClass = `${buttonBaseClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`;
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 flex items-center justify-between flex-wrap gap-2 sticky top-0 z-10 shadow-sm no-print transition-colors duration-200">
      <div className="flex items-center space-x-1 flex-wrap gap-y-1">
        
        {/* File Operations */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
          <button 
            onClick={onOpenFile} 
            className={iconButtonClass}
            title="Open Markdown File"
          >
            <FolderOpen size={18} />
          </button>
          <button 
            onClick={onPaste} 
            className={iconButtonClass}
            title="Paste Markdown"
          >
            <ClipboardPaste size={18} />
          </button>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-4">
          <button 
            onClick={() => onFormat('bold')} 
            className={iconButtonClass}
            title="Bold (**text**)"
          >
            <Bold size={18} />
          </button>
          <button 
            onClick={() => onFormat('italic')} 
            className={iconButtonClass}
            title="Italic (*text*)"
          >
            <Italic size={18} />
          </button>
          <button 
            onClick={() => onFormat('h1')} 
            className={iconButtonClass}
            title="Heading 1 (# Text)"
          >
            <Heading1 size={18} />
          </button>
          <button 
            onClick={() => onFormat('h2')} 
            className={iconButtonClass}
            title="Heading 2 (## Text)"
          >
            <Heading2 size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-2 border-l pl-4 border-gray-300 dark:border-gray-700 mr-4">
           <button 
            onClick={onGenerateImage}
            className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium"
          >
            <ImageIcon size={18} />
            <span className="hidden sm:inline">Gen Image</span>
          </button>

          <button 
            onClick={onImageToText}
            className="flex items-center space-x-2 px-3 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors font-medium"
            title="Extract text from an image"
          >
            <ScanText size={18} />
            <span className="hidden lg:inline">Scan Text</span>
          </button>
          
          <button 
            onClick={onAIImprove}
            className="flex items-center space-x-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors font-medium"
            title="Improve text (selected or all)"
          >
            <Zap size={18} />
            <span className="hidden lg:inline">Improve</span>
          </button>

          <button 
            onClick={onAIEdit}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors font-medium"
            title="Select text to rewrite with specific instructions"
          >
            <Sparkles size={18} />
            <span className="hidden lg:inline">Edit</span>
          </button>

          <button 
            onClick={onAIContinue}
            className="flex items-center space-x-2 px-3 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-md hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors font-medium"
            title="Continue writing from cursor"
          >
            <Wand2 size={18} />
            <span className="hidden lg:inline">Continue</span>
          </button>
        </div>

        {/* Typography Controls */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 px-2 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2" title="Preview Typography">
            <Type size={16} className="text-gray-500 dark:text-gray-400" />
            
            <select 
              value={previewSettings.fontFamily}
              onChange={(e) => setPreviewSettings({...previewSettings, fontFamily: e.target.value})}
              className="bg-transparent text-sm border-none focus:ring-0 w-20 cursor-pointer text-gray-700 dark:text-gray-200 outline-none font-medium"
            >
              <option value="Merriweather">Serif</option>
              <option value="Inter">Sans</option>
              <option value="ui-monospace">Mono</option>
            </select>

            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2"></div>

            <select
              value={previewSettings.fontSize}
              onChange={(e) => setPreviewSettings({...previewSettings, fontSize: Number(e.target.value)})}
              className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-gray-700 dark:text-gray-200 outline-none"
              title="Font Size"
            >
              {[12, 14, 16, 18, 20, 24, 28, 32].map(s => (
                  <option key={s} value={s}>{s}px</option>
              ))}
            </select>

            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2"></div>

            <AlignJustify size={14} className="text-gray-400" />
            <select
              value={previewSettings.lineHeight}
              onChange={(e) => setPreviewSettings({...previewSettings, lineHeight: Number(e.target.value)})}
              className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-gray-700 dark:text-gray-200 outline-none"
              title="Line Height (Interline)"
            >
              <option value={1.2}>1.2</option>
              <option value={1.4}>1.4</option>
              <option value={1.6}>1.6</option>
              <option value={1.8}>1.8</option>
              <option value={2.0}>2.0</option>
              <option value={2.5}>2.5</option>
            </select>
          </div>
        </div>

      </div>

      <div className="flex items-center space-x-3 mt-2 md:mt-0">
        
        {/* Vim Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
          <TerminalSquare size={16} className={vimMode ? "text-green-600 dark:text-green-400" : "text-gray-400"} />
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={vimMode} 
              onChange={(e) => setVimMode(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-300 hidden xl:inline">Vim</span>
          </label>
        </div>

        {/* Theme Toggle */}
        <div className="hidden lg:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
           <button 
            onClick={() => setTheme('light')}
            className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm text-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            title="Light Mode"
          >
            <Sun size={16} />
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            title="Dark Mode"
          >
            <Moon size={16} />
          </button>
          <button 
            onClick={() => setTheme('system')}
            className={`p-2 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            title="System Theme"
          >
            <Monitor size={16} />
          </button>
        </div>

        {/* View Mode Toggles */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => setViewMode(ViewMode.EDIT)}
            className={`p-2 rounded-md transition-all ${viewMode === ViewMode.EDIT ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            title="Editor Only"
          >
            <Type size={18} />
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={`p-2 rounded-md transition-all ${viewMode === ViewMode.SPLIT ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             title="Split View"
          >
            <Columns size={18} />
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`p-2 rounded-md transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             title="Preview Only"
          >
            <Eye size={18} />
          </button>
        </div>

        <div className="relative group">
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100 dark:border-gray-700 z-50">
            <button onClick={() => onExport('md')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Markdown (.md)</button>
            <button onClick={() => onExport('html')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">HTML (.html)</button>
            <button onClick={() => onExport('typst')} className="flex w-full items-center text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <BookTemplate size={14} className="mr-2" /> Typst Project (.zip)
            </button>
            <button onClick={() => onExport('pdf')} className="flex w-full items-center text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Printer size={14} className="mr-2"/> Print/PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};