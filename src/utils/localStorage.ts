const USER_KEY = 'ai-english-tutor-user';
const MESSAGES_KEY = 'ai-english-tutor-messages';

export const localStorage = {
  getUser: (): { name: string; sessionId: string } | null => {
    try {
      const user = window.localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: { name: string; sessionId: string }): void => {
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },

  getMessages: (): any[] => {
    try {
      const messages = window.localStorage.getItem(MESSAGES_KEY);
      return messages ? JSON.parse(messages) : [];
    } catch {
      return [];
    }
  },

  setMessages: (messages: any[]): void => {
    try {
      window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  },

  clearAll: (): void => {
    try {
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.removeItem(MESSAGES_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};