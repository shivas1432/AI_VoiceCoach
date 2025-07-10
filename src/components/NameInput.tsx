import React, { useState } from 'react';
import { User } from 'lucide-react';

interface NameInputProps {
  onSubmit: (name: string) => void;
}

export const NameInput: React.FC<NameInputProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
      onSubmit(name.trim());
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-50">
      <div className="relative max-w-md w-full">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
        
        {/* Main container */}
        <div 
          className="relative bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 transform transition-all duration-300 scale-100 hover:scale-105"
          style={{
            boxShadow: `
              inset 12px 12px 24px #1a1a1a,
              inset -12px -12px 24px #2a2a2a,
              0 0 40px rgba(59, 130, 246, 0.3),
              0 0 80px rgba(147, 51, 234, 0.2)
            `
          }}
        >
          <div className="text-center mb-8">
            {/* Icon with shining effect */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: 'linear-gradient(145deg, #1e40af, #3b82f6)',
                  boxShadow: `
                    8px 8px 16px #0f172a,
                    -8px -8px 16px #1e293b,
                    inset 0 0 20px rgba(59, 130, 246, 0.4),
                    0 0 40px rgba(59, 130, 246, 0.6)
                  `
                }}
              >
                <User className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              {/* Rotating shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-20 animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
            
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Welcome to AI English Tutor
            </h2>
            <p className="text-gray-300 text-lg">Let's start your personalized learning journey!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-blue-300 mb-3">
                What's your name?
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 text-white bg-gray-700 rounded-2xl border border-gray-600 focus:outline-none focus:ring-0 transition-all duration-300 text-lg"
                  style={{
                    boxShadow: `
                      inset 6px 6px 12px #1a1a1a,
                      inset -6px -6px 12px #2a2a2a
                    `,
                    background: 'linear-gradient(145deg, #374151, #4b5563)'
                  }}
                  placeholder="Enter your name"
                  required
                  disabled={isSubmitting}
                  onFocus={(e) => {
                    e.target.style.boxShadow = `
                      inset 6px 6px 12px #1a1a1a,
                      inset -6px -6px 12px #2a2a2a,
                      0 0 20px rgba(59, 130, 246, 0.4)
                    `;
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = `
                      inset 6px 6px 12px #1a1a1a,
                      inset -6px -6px 12px #2a2a2a
                    `;
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              style={{
                background: !name.trim() || isSubmitting 
                  ? 'linear-gradient(145deg, #374151, #4b5563)' 
                  : 'linear-gradient(145deg, #1e40af, #3b82f6)',
                boxShadow: !name.trim() || isSubmitting
                  ? '8px 8px 16px #0f172a, -8px -8px 16px #1e293b'
                  : `
                      8px 8px 16px #0f172a,
                      -8px -8px 16px #1e293b,
                      inset 0 0 20px rgba(59, 130, 246, 0.3),
                      0 0 30px rgba(59, 130, 246, 0.5)
                    `
              }}
            >
              {/* Shine animation overlay */}
              {name.trim() && !isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 -translate-x-full animate-pulse"></div>
              )}
              
              <span className="relative z-10">
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Getting Started...</span>
                  </div>
                ) : (
                  'Start Learning'
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Your name will be saved locally for a personalized experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};