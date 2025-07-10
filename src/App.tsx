import React, { useState, useEffect } from 'react';
import { NameInput } from './components/NameInput';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ConversationHistory } from './components/ConversationHistory';
import { SpeechService } from './services/speechService';
import { AIService } from './services/aiService';
import { localStorage } from './utils/localStorage';
import { Message, User, ConversationState } from './types';
import { LogOut, Volume2, VolumeX } from 'lucide-react';

const speechService = new SpeechService();
const aiService = new AIService();

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<ConversationState>({
    messages: [],
    isRecording: false,
    isProcessing: false,
    isSpeaking: false,
    error: null
  });
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getUser();
    const savedMessages = localStorage.getMessages();
    
    if (savedUser) {
      setUser(savedUser);
      setConversation(prev => ({
        ...prev,
        messages: savedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  }, []);

  const handleNameSubmit = (name: string) => {
    const newUser = {
      name,
      sessionId: Date.now().toString()
    };
    
    setUser(newUser);
    localStorage.setUser(newUser);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: `Hi ${name}! I'm Emma, your AI English tutor. I'm here to help you practice speaking English fluently. Let's have a conversation! What would you like to talk about today?`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    const newMessages = [welcomeMessage];
    setConversation(prev => ({ ...prev, messages: newMessages }));
    localStorage.setMessages(newMessages);
    
    if (isSpeechEnabled) {
      speechService.speak(welcomeMessage.text);
    }
  };

  const handleStartRecording = async () => {
    if (!speechService.isSpeechSupported()) {
      setConversation(prev => ({
        ...prev,
        error: 'Speech recognition is not supported in your browser'
      }));
      return;
    }

    setConversation(prev => ({
      ...prev,
      isRecording: true,
      error: null
    }));

    try {
      const text = await speechService.startListening();
      await handleUserMessage(text);
    } catch (error) {
      setConversation(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to record speech'
      }));
    } finally {
      setConversation(prev => ({
        ...prev,
        isRecording: false
      }));
    }
  };

  const handleStopRecording = () => {
    speechService.stopListening();
    setConversation(prev => ({
      ...prev,
      isRecording: false
    }));
  };

  const handleUserMessage = async (text: string) => {
    if (!user || !text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...conversation.messages, userMessage];
    setConversation(prev => ({
      ...prev,
      messages: updatedMessages,
      isProcessing: true
    }));

    try {
      const { response, feedback } = await aiService.generateResponse(
        updatedMessages,
        user.name
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        feedback
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setConversation(prev => ({
        ...prev,
        messages: finalMessages,
        isProcessing: false
      }));

      localStorage.setMessages(finalMessages);

      if (isSpeechEnabled) {
        setConversation(prev => ({ ...prev, isSpeaking: true }));
        try {
          await speechService.speak(response);
        } catch (error) {
          console.error('Speech synthesis error:', error);
        }
        setConversation(prev => ({ ...prev, isSpeaking: false }));
      }
    } catch (error) {
      setConversation(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      }));
    }
  };

  const handleLogout = () => {
    speechService.stopSpeaking();
    localStorage.clearAll();
    setUser(null);
    setConversation({
      messages: [],
      isRecording: false,
      isProcessing: false,
      isSpeaking: false,
      error: null
    });
  };

  const toggleSpeech = () => {
    if (isSpeechEnabled && conversation.isSpeaking) {
      speechService.stopSpeaking();
      setConversation(prev => ({ ...prev, isSpeaking: false }));
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  if (!user) {
    return <NameInput onSubmit={handleNameSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-6 mb-6" 
             style={{
               boxShadow: 'inset 8px 8px 16px #1a1a1a, inset -8px -8px 16px #2a2a2a, 0 4px 20px rgba(59, 130, 246, 0.3)'
             }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hi {user.name}! 👋
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                Let's practice English together with AI assistance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSpeech}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  isSpeechEnabled
                    ? 'text-blue-400 shadow-lg border border-blue-500/50'
                    : 'text-gray-500 shadow-lg border border-gray-600'
                }`}
                style={{
                  background: isSpeechEnabled 
                    ? 'linear-gradient(145deg, #1e3a8a, #3b82f6)' 
                    : 'linear-gradient(145deg, #374151, #4b5563)',
                  boxShadow: isSpeechEnabled
                    ? '6px 6px 12px #0f172a, -6px -6px 12px #1e293b, inset 0 0 20px rgba(59, 130, 246, 0.2)'
                    : '6px 6px 12px #0f172a, -6px -6px 12px #1e293b'
                }}
                title={isSpeechEnabled ? 'Disable speech' : 'Enable speech'}
              >
                {isSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-5 py-3 text-gray-300 hover:text-red-400 rounded-2xl transition-all duration-300 border border-gray-600"
                style={{
                  background: 'linear-gradient(145deg, #374151, #4b5563)',
                  boxShadow: '6px 6px 12px #0f172a, -6px -6px 12px #1e293b'
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 bg-gray-800 rounded-3xl shadow-xl border border-gray-700 overflow-hidden flex flex-col"
             style={{
               boxShadow: 'inset 8px 8px 16px #1a1a1a, inset -8px -8px 16px #2a2a2a, 0 8px 32px rgba(0, 0, 0, 0.5)'
             }}>
          <ConversationHistory messages={conversation.messages} userName={user.name} />
          
          {/* Voice Recorder */}
          <div className="p-8 border-t border-gray-700">
            <VoiceRecorder
              isRecording={conversation.isRecording}
              isProcessing={conversation.isProcessing}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              disabled={conversation.isSpeaking}
            />
            
            {conversation.error && (
              <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 rounded-2xl"
                   style={{
                     boxShadow: 'inset 4px 4px 8px rgba(220, 38, 38, 0.1), inset -4px -4px 8px rgba(239, 68, 68, 0.1)'
                   }}>
                <p className="text-sm text-red-300 text-center">{conversation.error}</p>
              </div>
            )}
            
            {conversation.isSpeaking && (
              <div className="mt-6 p-4 bg-blue-900/50 border border-blue-500/50 rounded-2xl"
                   style={{
                     boxShadow: 'inset 4px 4px 8px rgba(29, 78, 216, 0.1), inset -4px -4px 8px rgba(59, 130, 246, 0.1)'
                   }}>
                <p className="text-sm text-blue-300 text-center flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span>🔊 Emma is speaking...</span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;