import React from 'react';
import { GeneratedImage } from '../types';
import { Download, AlertTriangle, Maximize2 } from 'lucide-react';

interface ImageCardProps {
  image: GeneratedImage;
  onView: (img: GeneratedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onView }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (image.status === 'completed' && image.imageUrl) {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `imagen-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div 
      className="group relative aspect-square bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg"
      onClick={() => onView(image)}
    >
      {image.status === 'completed' ? (
        <img 
          src={image.imageUrl} 
          alt={image.prompt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : image.status === 'failed' ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-red-400">
          <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Generation Failed</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full bg-slate-800 animate-pulse">
           <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
           <span className="text-xs text-indigo-300 font-medium">Creating...</span>
        </div>
      )}

      {/* Overlay Actions */}
      {image.status === 'completed' && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <p className="text-xs text-white line-clamp-2 mb-2 font-medium">{image.prompt}</p>
          <div className="flex gap-2">
             <button 
              onClick={handleDownload}
              className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" /> Save
            </button>
            <button className="bg-indigo-600/80 hover:bg-indigo-600 text-white p-1.5 rounded-md backdrop-blur-sm">
               <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};