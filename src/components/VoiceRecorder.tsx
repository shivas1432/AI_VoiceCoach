import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

interface VoiceRecorderProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  disabled = false
}) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`relative w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/50'
        } ${
          disabled || isProcessing
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
        }`}
      >
        {isProcessing ? (
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : isRecording ? (
          <Square className="w-8 h-8 text-white mx-auto" />
        ) : (
          <Mic className="w-8 h-8 text-white mx-auto" />
        )}
        
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
        )}
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {isProcessing
            ? 'Processing...'
            : isRecording
            ? 'Recording... Click to stop'
            : 'Click to start speaking'}
        </p>
        
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>
    </div>
  );
};