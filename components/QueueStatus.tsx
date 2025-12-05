import React from 'react';
import { QueueItem } from '../types';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';

interface QueueStatusProps {
  queue: QueueItem[];
  isProcessing: boolean;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ queue, isProcessing }) => {
  if (queue.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Clock className="w-4 h-4 text-slate-400" />}
          Processing Queue ({queue.length})
        </h3>
      </div>
      <div className="max-h-60 overflow-y-auto p-2 space-y-2">
        {queue.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg text-xs">
            <span className="font-mono text-slate-500 w-4">{index + 1}.</span>
            <div className="flex-1 truncate">
              <span className="text-slate-300">{item.prompt}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
              index === 0 && isProcessing 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                : 'bg-slate-600 text-slate-400'
            }`}>
              {index === 0 && isProcessing ? 'Generating' : 'Queued'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};