import { Message } from '../types';

export class AIService {
  private apiKey: string | null = null;

  constructor() {
    // Get Gemini API key from environment variables
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    console.log('Gemini API Key loaded:', this.apiKey ? 'Yes (length: ' + this.apiKey.length + ')' : 'No');
  }

  public async generateResponse(
    messages: Message[],
    userName: string
  ): Promise<{ response: string; feedback?: string }> {
    
    if (!this.apiKey) {
      console.log('No Gemini API key - using mock response');
      return this.generateMockResponse(messages, userName);
    }

    try {
      console.log('Making Gemini API request...');
      
      // Build the conversation history for Gemini
      const conversationText = this.buildConversationPrompt(messages, userName);
      
      // Retry logic for overloaded servers
      let response: Response;
      let retries = 0;
      const maxRetries = 2;
      
      do {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: conversationText
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 150,
            }
          })
        });
        
        // If successful or not a 503 error, break the loop
        if (response.ok || response.status !== 503) {
          break;
        }
        
        retries++;
        if (retries <= maxRetries) {
          console.log(`Gemini overloaded, retrying in ${retries * 2} seconds... (attempt ${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, retries * 2000)); // Wait 2s, then 4s
        }
      } while (retries <= maxRetries);

      console.log('Gemini API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API Error Details:', errorData);
        throw new Error(`Gemini API Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Gemini API Success!', data);
      
      // Extract response from Gemini's response format
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I had trouble understanding that.';
      
      return {
        response: aiResponse,
        feedback: this.generateFeedback(messages[messages.length - 1]?.text)
      };
      
    } catch (error) {
      console.error('AI service error:', error);
      console.log('Falling back to mock response due to error');
      return this.generateMockResponse(messages, userName);
    }
  }

  private buildConversationPrompt(messages: Message[], userName: string): string {
    const systemPrompt = `You are Emma, a friendly English tutor. The student's name is ${userName}. 
    Provide gentle corrections, encouragement, and help improve their English.
    Keep responses conversational and under 100 words. Be supportive and positive.
    
    Conversation history:`;
    
    const conversationHistory = messages.map(msg => 
      `${msg.sender === 'user' ? userName : 'Emma'}: ${msg.text}`
    ).join('\n');
    
    return `${systemPrompt}\n${conversationHistory}\n\nEmma:`;
  }

  private generateMockResponse(messages: Message[], userName: string): { response: string; feedback?: string } {
    const lastMessage = messages[messages.length - 1];
    const responses = [
      `That's great, ${userName}! I love how you expressed that. Let's practice some more.`,
      `Nice work, ${userName}! Your pronunciation is getting better. Try speaking a bit slower.`,
      `Excellent, ${userName}! I can see you're making progress. What would you like to talk about next?`,
      `Good job, ${userName}! Remember to use past tense when talking about yesterday.`,
      `Well done, ${userName}! Your vocabulary is expanding nicely. Keep practicing!`
    ];

    const feedback = this.generateFeedback(lastMessage?.text);
        
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      feedback
    };
  }

  private generateFeedback(text: string): string {
    if (!text) return '';
        
    const feedbackOptions = [
      'Great pronunciation! Try to speak with more confidence.',
      'Good use of vocabulary. Remember to pause between sentences.',
      'Nice sentence structure. Keep practicing your intonation.',
      'Excellent! Try to use more descriptive words next time.',
      'Well done! Focus on speaking clearly and slowly.'
    ];

    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }
}