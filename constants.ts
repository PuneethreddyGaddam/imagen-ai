
import { ModelType, AspectRatio } from './types';

export const ASPECT_RATIOS = [
  { id: AspectRatio.SQUARE, label: 'Square (1:1)', width: 1024, height: 1024 },
  { id: AspectRatio.PORTRAIT, label: 'Portrait (3:4)', width: 768, height: 1024 },
  { id: AspectRatio.LANDSCAPE, label: 'Landscape (16:9)', width: 1024, height: 576 },
];

export const DEFAULT_MODEL = ModelType.GEMINI_FLASH_IMAGE;

export const MAX_QUEUE_SIZE = 5;
export const DEBOUNCE_TIME_MS = 500;
