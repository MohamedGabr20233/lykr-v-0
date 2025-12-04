"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Phone, PhoneOff, AlertCircle } from "lucide-react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PageTransition } from "@/components/onboarding/page-transition";
import { AIOrb } from "@/components/onboarding/ai-orb";
import { useAppSelector } from "@/lib/store/hooks";
import type { ConversationMessage } from "@/app/types/onboarding";

// Review steps for edit dialog
interface ReviewStepConfig {
  key: string;
  keywords: string[];
  label: string;
  editPath: string;
}

const REVIEW_STEPS: ReviewStepConfig[] = [
  { key: "business_name", keywords: ["اسم", "نشاط", "تجاري"], label: "اسم النشاط التجاري", editPath: "/onboarding/business-info" },
  { key: "website", keywords: ["موقع", "إلكتروني", "الموقع"], label: "الموقع الإلكتروني", editPath: "/onboarding/website" },
  { key: "social", keywords: ["تواصل", "اجتماعي", "لينكد", "فيسبوك", "تويتر"], label: "روابط التواصل الاجتماعي", editPath: "/onboarding/website" },
  { key: "competitors", keywords: ["منافس", "منافسين", "منافسون"], label: "المنافسين", editPath: "/onboarding/competitors" },
  { key: "interview", keywords: ["مقابلة", "صوتية", "إجابات"], label: "المقابلة الصوتية", editPath: "/onboarding/voice-interview" },
];

const QUICK_REPLIES = ["نعم، هذا صحيح", "أريد تعديل هذا"];

const MAX_VISIBLE_MESSAGES = 4;

export default function ConfirmationPage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStepConfig, setEditStepConfig] = useState<ReviewStepConfig | null>(null);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>("");
  const messageIdRef = useRef(0);
  const router = useRouter();

  // Get onboarding data from Redux
  const onboardingData = useAppSelector((state) => state.onboarding);

  const getNextMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  }, []);

  // Detect which step is being discussed based on the last assistant message
  const detectCurrentStep = useCallback((assistantMessage: string): ReviewStepConfig | null => {
    for (const step of REVIEW_STEPS) {
      if (step.keywords.some((keyword) => assistantMessage.includes(keyword))) {
        return step;
      }
    }
    return null;
  }, []);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsConnecting(false);
      setIsCallActive(true);
      setError(null);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsCallActive(false);
      setIsConnecting(false);
      setMessages([]);
      messageIdRef.current = 0;
      setLastAssistantMessage("");
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      if (message.message) {
        const newMessage: ConversationMessage = {
          id: getNextMessageId(),
          role: message.source === "user" ? "user" : "assistant",
          content: message.message,
        };
        setMessages((prev) => [...prev, newMessage]);

        // Track last assistant message for edit detection
        if (message.source !== "user") {
          setLastAssistantMessage(message.message);
        }
      }
    },
    onError: (err) => {
      console.error("ElevenLabs error:", err);
      setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
      setIsCallActive(false);
      setIsConnecting(false);
    },
  });

  // Build dynamic variables for the agent
  const buildDynamicVariables = useCallback(() => {
    const { businessInfo, website, competitors, voiceInterview } = onboardingData;

    // Social links
    const socialLinks = [];
    if (website.linkedin) socialLinks.push(`لينكد إن: ${website.linkedin}`);
    if (website.facebook) socialLinks.push(`فيسبوك: ${website.facebook}`);
    if (website.twitter) socialLinks.push(`تويتر: ${website.twitter}`);
    if (website.youtube) socialLinks.push(`يوتيوب: ${website.youtube}`);

    // Competitors
    const competitorsText = competitors.filter((c) => c.trim()).join("، ");

    // Voice interview
    const completedInterviews = voiceInterview.filter((q) => q.status === "completed" && q.transcript);
    let interviewText = "";
    if (completedInterviews.length > 0) {
      interviewText = completedInterviews.map((q, i) => `${i + 1}. ${q.text}: "${q.transcript}"`).join(" | ");
    }

    return {
      business_name: businessInfo.name || "غير محدد",
      website_url: website.url || "غير محدد",
      social_links: socialLinks.length > 0 ? socialLinks.join("، ") : "غير محددة",
      competitors: competitorsText || "غير محددين",
      interview_answers: interviewText || "لم تكتمل",
    };
  }, [onboardingData]);

  const handleStartCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const dynamicVariables = buildDynamicVariables();

      console.log("Starting call with variables:", dynamicVariables);

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        dynamicVariables: dynamicVariables,
      });
    } catch (err: unknown) {
      const error = err as { reason?: string; message?: string };
      console.error("Error starting call:", error.reason || error.message || err);
      setError("فشل بدء المكالمة. تأكد من إذن الميكروفون.");
      setIsConnecting(false);
    }
  };

  const handleEndCall = async () => {
    setIsCallActive(false);
    setMessages([]);
    messageIdRef.current = 0;
    setLastAssistantMessage("");

    try {
      if (conversation.status === "connected") {
        await conversation.endSession();
      }
    } catch (err) {
      console.log("Session ended");
    }
  };

  // Handle edit request - detect which step based on last assistant message
  const handleEditRequest = useCallback(() => {
    const step = detectCurrentStep(lastAssistantMessage);
    if (step) {
      setEditStepConfig(step);
      setShowEditDialog(true);
    }
  }, [lastAssistantMessage, detectCurrentStep]);

  const handleEditConfirm = () => {
    if (editStepConfig) {
      handleEndCall();
      router.push(editStepConfig.editPath);
    }
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setEditStepConfig(null);
  };

  const handleQuickReply = useCallback(
    (reply: string) => {
      if (!isCallActive || conversation.status !== "connected") return;

      // Check if this is an edit request
      if (reply.includes("تعديل")) {
        handleEditRequest();
        return;
      }

      // Add user message to chat
      const userMessage: ConversationMessage = {
        id: getNextMessageId(),
        role: "user",
        content: reply,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send message to ElevenLabs
      try {
        conversation.sendUserMessage(reply);
      } catch (err) {
        console.log("Could not send message");
      }
    },
    [isCallActive, getNextMessageId, conversation, handleEditRequest]
  );

  const handleBack = () => {
    router.push("/onboarding/voice-interview");
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const shouldScroll = messages.length > MAX_VISIBLE_MESSAGES;
  const isSpeaking = conversation.isSpeaking;

  return (
    <PageTransition>
      <div className="w-full max-w-3xl mx-auto px-6 flex flex-col h-[calc(100vh-140px)]">
        {/* Content */}
        <div className="flex-1 text-center pt-4">
          <h1 className="text-2xl font-normal text-neutral-950 mb-2">وكيل الذكاء الاصطناعي الصوتي</h1>

          <p className="text-sm text-gray-500 mb-6">دع مساعدنا الذكي يؤكد تفاصيلك معك</p>

          {/* AI Orb */}
          <div className="flex justify-center mb-6">
            <AIOrb isActive={isCallActive && isSpeaking} size={160} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Call Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={isCallActive ? handleEndCall : handleStartCall}
              disabled={isConnecting}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isConnecting ? "bg-gray-400 cursor-not-allowed" : isCallActive ? "bg-[#f87171] hover:bg-[#ef4444]" : "bg-[#22c55e] hover:bg-[#16a34a]"
              }`}
            >
              {isConnecting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isCallActive ? (
                <PhoneOff className="w-6 h-6 text-white" />
              ) : (
                <Phone className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Connection Status */}
          {isConnecting && <p className="text-sm text-gray-500 mb-4">جاري الاتصال...</p>}

          {/* Chat Messages */}
          <AnimatePresence>
            {isCallActive && messages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#f9fafb] border border-gray-100 rounded-2xl p-4 mb-4">
                <div className={`space-y-3 ${shouldScroll ? "max-h-32 overflow-y-auto" : ""}`}>
                  {messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${message.role === "user" ? "bg-[#e5e7eb] text-neutral-950" : "bg-[#f87171] text-white"}`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Replies */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      disabled={isSpeaking}
                      className={`px-4 py-2 text-sm border border-gray-300 rounded-full transition-colors ${
                        isSpeaking ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-neutral-950"
                      }`}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex gap-3 py-4">
          <Button variant="outline" onClick={handleBack} className="h-12 px-8 rounded-lg">
            رجوع
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="h-12 px-8 rounded-lg">
            تخطي
          </Button>
          <Button onClick={handleComplete} className="flex-1 h-12 rounded-lg">
            إكمال
          </Button>
        </div>
      </div>

      {/* Edit Confirmation Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل البيانات</DialogTitle>
            <DialogDescription>هل تريد الانتقال لتعديل {editStepConfig?.label}؟ سيتم إنهاء المكالمة الحالية.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleEditCancel}>
              إلغاء
            </Button>
            <Button onClick={handleEditConfirm}>نعم، تعديل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
