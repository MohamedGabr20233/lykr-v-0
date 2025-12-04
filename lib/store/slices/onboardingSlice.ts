import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { OnboardingState, BusinessInfo, WebsiteInfo, DocumentInfo, VoiceInterviewQuestion } from "@/app/types/onboarding";

const INITIAL_QUESTIONS: VoiceInterviewQuestion[] = [
  { id: 1, text: "ما هي المشكلة الرئيسية التي يحلها منتجك أو خدمتك؟", status: "current" },
  { id: 2, text: "من هو عميلك المثالي؟", status: "pending" },
  { id: 3, text: "ما الذي يميزك عن المنافسين؟", status: "pending" },
  { id: 4, text: "ما هي أهدافك للأشهر الستة القادمة؟", status: "pending" },
];

const initialState: OnboardingState = {
  businessInfo: {
    name: "",
  },
  website: {
    url: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    youtube: "",
  },
  documents: [],
  competitors: [""],
  voiceInterview: INITIAL_QUESTIONS,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    // Business Info
    setBusinessInfo: (state, action: PayloadAction<BusinessInfo>) => {
      state.businessInfo = action.payload;
    },

    // Website Info
    setWebsiteInfo: (state, action: PayloadAction<WebsiteInfo>) => {
      state.website = action.payload;
    },

    // Documents
    setDocuments: (state, action: PayloadAction<DocumentInfo[]>) => {
      state.documents = action.payload;
    },
    addDocument: (state, action: PayloadAction<DocumentInfo>) => {
      state.documents.push(action.payload);
    },
    removeDocument: (state, action: PayloadAction<number>) => {
      state.documents.splice(action.payload, 1);
    },

    // Competitors
    setCompetitors: (state, action: PayloadAction<string[]>) => {
      state.competitors = action.payload;
    },

    // Voice Interview
    setVoiceInterview: (state, action: PayloadAction<VoiceInterviewQuestion[]>) => {
      state.voiceInterview = action.payload;
    },
    updateQuestionTranscript: (state, action: PayloadAction<{ id: number; transcript: string }>) => {
      const question = state.voiceInterview.find((q) => q.id === action.payload.id);
      if (question) {
        question.transcript = action.payload.transcript;
        question.status = "completed";
      }
    },

    // Reset all onboarding data
    resetOnboarding: () => initialState,

    // Hydrate state from storage
    hydrateState: (state, action: PayloadAction<OnboardingState>) => {
      return action.payload;
    },
  },
});

export const { setBusinessInfo, setWebsiteInfo, setDocuments, addDocument, removeDocument, setCompetitors, setVoiceInterview, updateQuestionTranscript, resetOnboarding, hydrateState } = onboardingSlice.actions;

export default onboardingSlice.reducer;
