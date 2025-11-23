export enum ViewMode {
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT'
}

export type Theme = 'light' | 'dark' | 'system';

export interface AIState {
  isGenerating: boolean;
  error: string | null;
}

export interface ImageGenerationConfig {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '3:4' | '4:3';
}

export interface TextEditConfig {
  selection: string;
  instruction: string;
}

export interface PreviewSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}