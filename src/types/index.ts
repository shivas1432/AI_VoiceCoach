export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  feedback?: string;
}

export interface User {
  name: string;
  sessionId: string;
}

export interface ConversationState {
  messages: Message[];
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  error: string | null;
}