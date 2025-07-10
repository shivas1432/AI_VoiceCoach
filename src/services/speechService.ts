// Type declarations for Speech APIs
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new() => SpeechRecognitionInterface;
    webkitSpeechRecognition: new() => SpeechRecognitionInterface;
  }
}

export class SpeechService {
  private recognition: SpeechRecognitionInterface | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.isSupported = true;
      }
    }
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public isSpeechSupported(): boolean {
    return this.isSupported && this.synthesis !== null;
  }

  public startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0][0].transcript;
        resolve(result);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        this.currentUtterance = null;
        // Don't reject for 'interrupted' errors - they're normal when stopping speech
        if (event.error === 'interrupted') {
          console.log('Speech was interrupted (normal)');
          resolve(); // Resolve instead of reject
        } else {
          console.error('Speech synthesis error:', event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }
}