
import { User } from '../types';

/**
 * Simulates OAuth flows for demo purposes.
 * In a real application, this would redirect to Google/LinkedIn OAuth endpoints.
 */
export const authService = {
  
  loginWithGoogle: async (): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      email: 'demo.user@gmail.com',
      name: 'Demo User',
      provider: 'google',
      isAuthenticated: true
    };
  },

  loginWithLinkedIn: async (): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      email: 'user.professional@linkedin.com',
      name: 'Professional User',
      provider: 'linkedin',
      isAuthenticated: true
    };
  }
};
