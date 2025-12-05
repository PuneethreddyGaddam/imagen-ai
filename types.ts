
export enum ModelType {
  GEMINI_FLASH_IMAGE = 'gemini-2.5-flash-image',
  GEMINI_PRO_IMAGE = 'gemini-3-pro-image-preview'
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '16:9',
  WIDE = '16:9'
}

export interface GenerationRequest {
  id: string;
  prompt: string;
  model: ModelType;
  aspectRatio: AspectRatio;
  timestamp: number;
}

export interface GeneratedImage extends GenerationRequest {
  imageUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface QueueItem extends GenerationRequest {
  status: 'queued' | 'processing';
}

export interface User {
  email: string;
  name: string;
  provider: 'google' | 'linkedin';
  isAuthenticated: boolean;
}
