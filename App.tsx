
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import { Wand2, Image as ImageIcon, Settings2, AlertCircle, History, Sparkles, AlertTriangle, LogOut, Zap, Crown } from 'lucide-react';
import { Button } from './components/Button';
import { QueueStatus } from './components/QueueStatus';
import { ImageCard } from './components/ImageCard';
import { Auth } from './components/Auth';
import { AspectRatio, GenerationRequest, GeneratedImage, QueueItem, User, ModelType } from './types';
import { ASPECT_RATIOS, MAX_QUEUE_SIZE, DEBOUNCE_TIME_MS, DEFAULT_MODEL } from './constants';
// STRICT RELATIVE IMPORT: Switched to Gemini Service
import { generateImageWithGemini, retryOperation } from './services/geminiService';

// Validation Schema
const promptSchema = z.object({
  prompt: z.string().min(3, "Prompt is too short").max(1000, "Prompt exceeds 1000 characters"),
  aspectRatio: z.nativeEnum(AspectRatio),
  model: z.nativeEnum(ModelType).optional(),
});

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [selectedModel, setSelectedModel] = useState<ModelType>(DEFAULT_MODEL);
  
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<GeneratedImage | null>(null);

  // Rate limiting / Debounce reference
  const lastRequestTime = useRef<number>(0);

  // Check for session in local storage (optional persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('imagen_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('imagen_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('imagen_user');
    setHistory([]);
    setQueue([]);
    setHeroImage(null);
  };

  // Process Queue Effect
  useEffect(() => {
    const processNext = async () => {
      if (queue.length === 0 || isProcessing) return;

      const currentItem = queue[0];
      setIsProcessing(true);
      setError(null);

      // Create a placeholder in history
      const tempImage: GeneratedImage = {
        ...currentItem,
        imageUrl: '',
        status: 'processing'
      };

      setHistory(prev => [tempImage, ...prev]);
      setHeroImage(tempImage);

      try {
        // Gemini Generation with retry
        const base64Image = await retryOperation(() => 
          generateImageWithGemini({
            prompt: currentItem.prompt,
            model: currentItem.model,
            aspectRatio: currentItem.aspectRatio
          })
        );

        // Update History with Success
        setHistory(prev => prev.map(img => 
          img.id === currentItem.id 
            ? { ...img, imageUrl: base64Image, status: 'completed' } 
            : img
        ));
        
        // Update Hero
        setHeroImage({ ...currentItem, imageUrl: base64Image, status: 'completed' });

      } catch (err: any) {
        // Update History with Failure
        setHistory(prev => prev.map(img => 
          img.id === currentItem.id 
            ? { ...img, status: 'failed', error: err.message } 
            : img
        ));
        setHeroImage({ ...currentItem, imageUrl: '', status: 'failed', error: err.message });
      } finally {
        // Remove from Queue
        setQueue(prev => prev.slice(1));
        setIsProcessing(false);
      }
    };

    processNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, isProcessing]);

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rate Limiting Check
    const now = Date.now();
    if (now - lastRequestTime.current < DEBOUNCE_TIME_MS) {
      setError("Please wait a moment before sending another request.");
      return;
    }

    // Queue Size Check
    if (queue.length >= MAX_QUEUE_SIZE) {
      setError(`Queue is full (${MAX_QUEUE_SIZE}). Please wait for jobs to finish.`);
      return;
    }

    // Validation
    const result = promptSchema.safeParse({
      prompt,
      aspectRatio: selectedRatio,
      model: selectedModel
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    // Add to Queue
    const newRequest: QueueItem = {
      id: crypto.randomUUID(),
      prompt: result.data.prompt,
      model: result.data.model || DEFAULT_MODEL,
      aspectRatio: result.data.aspectRatio,
      timestamp: Date.now(),
      status: 'queued'
    };

    setQueue(prev => [...prev, newRequest]);
    setPrompt(''); // Clear input
    lastRequestTime.current = Date.now();
  };

  const clearHistory = useCallback(() => {
    if (confirm("Are you sure you want to clear your gallery?")) {
      setHistory([]);
      setHeroImage(null);
    }
  }, []);

  // Guard Clause for Authentication
  if (!user || !user.isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Controls */}
      <aside className="w-full md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-y-auto z-10 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              Imagen AI
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {user.provider === 'google' ? 'Google Account' : 'LinkedIn Account'}
            </p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Model</label>
              <div className="flex gap-2">
                 <button
                  type="button"
                  onClick={() => setSelectedModel(ModelType.GEMINI_FLASH_IMAGE)}
                  className={`flex-1 p-3 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    selectedModel === ModelType.GEMINI_FLASH_IMAGE
                      ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700/80'
                  }`}
                 >
                   <Zap className="w-4 h-4" />
                   Gemini Flash
                 </button>
                 <button
                  type="button"
                  onClick={() => setSelectedModel(ModelType.GEMINI_PRO_IMAGE)}
                  className={`flex-1 p-3 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    selectedModel === ModelType.GEMINI_PRO_IMAGE
                      ? 'bg-purple-900/30 border-purple-500 text-purple-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700/80'
                  }`}
                 >
                   <Crown className="w-4 h-4" />
                   Gemini Pro
                 </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cyberpunk street market in Tokyo, neon lights, rain reflections..."
                className="w-full bg-slate-800 border-slate-700 text-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-32 placeholder:text-slate-600"
              />
            </div>

            {/* Size / Aspect Ratio Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      selectedRatio === ratio.id 
                        ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`border-2 border-current rounded-sm mb-2 opacity-50 ${
                       ratio.id === AspectRatio.SQUARE ? 'w-5 h-5' : 
                       ratio.id === AspectRatio.PORTRAIT ? 'w-4 h-6' : 'w-6 h-4'
                    }`} />
                    <span className="text-[10px] font-medium">{ratio.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-4 text-sm uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500" 
              isLoading={isProcessing && queue.length > 0}
              icon={<Wand2 className="w-4 h-4" />}
            >
              {queue.length > 0 ? 'Add to Queue' : 'Generate Image'}
            </Button>
          </form>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1">
             Powered by Google Gemini <Sparkles className="w-2 h-2" />
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-slate-400" />
              Gallery
            </h2>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-700">
              {history.length} items
            </span>
          </div>
          <Button variant="ghost" onClick={clearHistory} disabled={history.length === 0} className="text-xs">
            <History className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Hero / Latest Image */}
          {heroImage && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Latest Result</h3>
              <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl p-2 border border-slate-700/50 shadow-2xl">
                <div className={`relative w-full overflow-hidden rounded-xl bg-black ${heroImage.aspectRatio === AspectRatio.LANDSCAPE ? 'aspect-video' : heroImage.aspectRatio === AspectRatio.PORTRAIT ? 'aspect-[3/4]' : 'aspect-square'}`}>
                   {heroImage.status === 'completed' ? (
                     <img src={heroImage.imageUrl} alt={heroImage.prompt} className="w-full h-full object-contain" />
                   ) : heroImage.status === 'failed' ? (
                     <div className="w-full h-full flex flex-col items-center justify-center text-red-400 bg-slate-900">
                       <AlertTriangle className="w-12 h-12 mb-4" />
                       <p>Generation Failed</p>
                       <p className="text-xs mt-2 text-red-500/70">{heroImage.error}</p>
                     </div>
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-indigo-400">
                       <div className="relative">
                         <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                         <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-300 animate-pulse" />
                       </div>
                       <p className="mt-6 text-sm tracking-wider animate-pulse">Gemini is creating...</p>
                     </div>
                   )}
                </div>
                <div className="p-4 flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 font-light leading-relaxed">"{heroImage.prompt}"</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500 font-mono">
                      <span>{new Date(heroImage.timestamp).toLocaleTimeString()}</span>
                      <span className="flex items-center gap-1">
                         {heroImage.model === ModelType.GEMINI_PRO_IMAGE ? <Crown className="w-3 h-3 text-purple-400"/> : <Zap className="w-3 h-3 text-indigo-400"/>}
                         {heroImage.model}
                      </span>
                      <span>{heroImage.aspectRatio}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Gallery */}
          {history.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">History</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {history.map((img) => (
                  <ImageCard key={img.id} image={img} onView={setHeroImage} />
                ))}
              </div>
            </div>
          )}

          {history.length === 0 && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 pb-32">
              <Settings2 className="w-24 h-24 mb-6 stroke-1" />
              <p className="text-xl font-light">Create with Google Gemini</p>
              <p className="text-sm mt-2">Enter a prompt and select a model to begin</p>
            </div>
          )}
        </div>

        {/* Queue Overlay */}
        <QueueStatus queue={queue} isProcessing={isProcessing} />

      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[128px]"></div>
      </div>
    </div>
  );
};

export default App;
