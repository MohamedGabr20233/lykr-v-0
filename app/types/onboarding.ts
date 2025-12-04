// Business Information
export interface BusinessInfo {
  name: string;
}

// Website and Social Media
export interface WebsiteInfo {
  url: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

// Document metadata (we don't store actual files in Redux)
export interface DocumentInfo {
  name: string;
  size: number;
}

// Voice Interview Question
export interface VoiceInterviewQuestion {
  id: number;
  text: string;
  status: "pending" | "current" | "completed";
  transcript?: string;
}

// Complete Onboarding State
export interface OnboardingState {
  businessInfo: BusinessInfo;
  website: WebsiteInfo;
  documents: DocumentInfo[];
  competitors: string[];
  voiceInterview: VoiceInterviewQuestion[];
}

// ElevenLabs Conversation Message
export interface ConversationMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
}
