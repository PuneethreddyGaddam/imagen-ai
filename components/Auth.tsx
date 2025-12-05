
import React, { useState } from 'react';
import { Sparkles, Linkedin, Chrome, Lock } from 'lucide-react';
import { Button } from './Button';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState<'google' | 'linkedin' | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      const user = await authService.loginWithGoogle();
      onLogin(user);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  };

  const handleLinkedInLogin = async () => {
    setIsLoading('linkedin');
    try {
      const user = await authService.loginWithLinkedIn();
      onLogin(user);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px]"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[128px]"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in-up">
        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-inner">
             <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Imagen AI</h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Sign in to start creating professional-grade AI imagery with Gemini.
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="p-8 pt-0 space-y-4">
          
          <Button 
            onClick={handleGoogleLogin}
            disabled={!!isLoading}
            className="w-full py-6 bg-white hover:bg-gray-100 text-gray-900 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
             {isLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
             ) : (
               <>
                 <Chrome className="w-5 h-5 text-red-500" />
                 <span className="font-semibold">Continue with Google</span>
               </>
             )}
          </Button>

          <Button 
            onClick={handleLinkedInLogin}
            disabled={!!isLoading}
            className="w-full py-6 bg-[#0077b5] hover:bg-[#006396] text-white flex items-center justify-center gap-3"
          >
             {isLoading === 'linkedin' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
             ) : (
               <>
                <Linkedin className="w-5 h-5 fill-current" />
                <span className="font-semibold">Continue with LinkedIn</span>
               </>
             )}
          </Button>

          <div className="mt-6 flex items-center gap-2 justify-center text-[10px] text-slate-500">
            <Lock className="w-3 h-3" />
            <span>Secure Enterprise Authentication</span>
          </div>
        </div>
        
        <div className="bg-slate-950/50 border-t border-slate-800 p-4 text-center">
            <p className="text-[10px] text-slate-600">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
      </div>
    </div>
  );
};
