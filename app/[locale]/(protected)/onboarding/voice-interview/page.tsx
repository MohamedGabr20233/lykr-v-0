"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { RotateCcw, Check, Mic, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/onboarding/page-transition";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setVoiceInterview } from "@/lib/store/slices/onboardingSlice";
import type { VoiceInterviewQuestion } from "@/app/types/onboarding";
import { store } from "@/lib/store";

interface LocalQuestion extends VoiceInterviewQuestion {
  audioBlob?: Blob;
}

const INITIAL_QUESTIONS: LocalQuestion[] = [
  { id: 1, text: "ما هي المشكلة الرئيسية التي يحلها منتجك أو خدمتك؟", status: "current" },
  { id: 2, text: "من هو عميلك المثالي؟", status: "pending" },
  { id: 3, text: "ما الذي يميزك عن المنافسين؟", status: "pending" },
  { id: 4, text: "ما هي أهدافك للأشهر الستة القادمة؟", status: "pending" },
];

const MAX_RECORDING_TIME = 180; // 3 minutes

// Pre-generated waveform bar values (generated once at module load)
const WAVEFORM_BARS = Array.from({ length: 50 }).map((_, i) => ({
  id: i,
  duration: 0.4 + (((i * 7) % 10) / 10) * 0.4,
  maxHeight: 20 + ((i * 13) % 100),
  delay: i * 0.015,
}));

export default function VoiceInterviewPage() {
  const dispatch = useAppDispatch();
  const storedVoiceInterview = useAppSelector((state) => state.onboarding.voiceInterview);

  console.log(store.getState().onboarding);

  const [questions, setQuestions] = useState<LocalQuestion[]>(INITIAL_QUESTIONS);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [previewTranscript, setPreviewTranscript] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // Initialize from Redux state
  useEffect(() => {
    if (storedVoiceInterview.length > 0) {
      // Map stored questions to local questions (without audioBlob since we can't store that)
      const localQuestions: LocalQuestion[] = storedVoiceInterview.map((q) => ({
        ...q,
      }));
      setQuestions(localQuestions);
    }
  }, [storedVoiceInterview]);

  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      // Determine file extension from MIME type
      const ext = audioBlob.type.includes("mp4") ? "mp4" : audioBlob.type.includes("ogg") ? "ogg" : "webm";
      formData.append("audio", audioBlob, `recording.${ext}`);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Transcription error:", error);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  const currentQuestion = questions.find((q) => q.status === "current");
  const allCompleted = questions.every((q) => q.status === "completed");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request audio with specific constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      // Try different MIME types for best compatibility
      const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
      const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";

      console.log("Using MIME type:", mimeType);

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Use the recorder's actual MIME type
        const actualMimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        console.log("Recording stopped. Blob size:", audioBlob.size, "Type:", actualMimeType);
        stream.getTracks().forEach((track) => track.stop());

        setQuestions((prev) => prev.map((q) => (q.status === "current" ? { ...q, audioBlob } : q)));

        // Auto-transcribe after recording stops
        const transcript = await transcribeAudio(audioBlob);
        if (transcript) {
          setPreviewTranscript(transcript);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      let time = 0;
      timerRef.current = setInterval(() => {
        time += 1;
        setRecordingTime(time);

        if (time >= MAX_RECORDING_TIME) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const restartRecording = async () => {
    stopRecording();
    setRecordingTime(0);
    setPreviewTranscript(null);
    setIsEditing(false);
    setQuestions((prev) => prev.map((q) => (q.status === "current" ? { ...q, audioBlob: undefined } : q)));
    // Immediately start a new recording
    await startRecording();
  };

  const confirmAndProceed = () => {
    // Save the transcript and move to next question
    setQuestions((prev) => {
      const currentIndex = prev.findIndex((q) => q.status === "current");
      return prev.map((q, index) => {
        if (q.status === "current") {
          return { ...q, status: "completed", transcript: previewTranscript || undefined };
        }
        if (index === currentIndex + 1 && q.status === "pending") {
          return { ...q, status: "current" };
        }
        return q;
      });
    });

    // Reset for next question
    setPreviewTranscript(null);
    setIsEditing(false);
    setRecordingTime(0);
  };

  const handleBack = () => {
    router.push("/onboarding/competitors");
  };

  const handleSkip = () => {
    // Save current questions state to Redux before skipping
    const questionsForRedux = questions.map(({ audioBlob, ...rest }) => rest);
    dispatch(setVoiceInterview(questionsForRedux));
    router.push("/onboarding/confirmation");
  };

  const handleContinue = () => {
    // Save questions to Redux (without audioBlob since it can't be serialized)
    const questionsForRedux = questions.map(({ audioBlob, ...rest }) => rest);
    dispatch(setVoiceInterview(questionsForRedux));
    router.push("/onboarding/confirmation");
  };

  // Only allow finish if current question has an audioBlob (recording was saved)
  const hasRecording = Boolean(currentQuestion?.audioBlob);

  // Use pre-generated waveform bars to avoid impure Math.random() during render
  const waveformBars = WAVEFORM_BARS;

  return (
    <PageTransition>
      <div className="w-full max-w-6xl mx-auto px-6">
        <h1 className="text-2xl font-normal text-neutral-950 mb-3">المقابلة الصوتية</h1>

        <p className="text-sm text-gray-500 mb-6">أجب على الأسئلة التالية بصوتك لمساعدتنا على فهم عملك بشكل أفضل - اختياري ولكنه يساعدنا على فهمك بشكل أفضل.</p>

        <div className="flex gap-20">
          {/* Questions List */}
          <div className="w-[340px] shrink-0">
            <p className="text-sm text-neutral-950 mb-4">الأسئلة:</p>
            <div className="space-y-3">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg transition-colors ${
                    question.status === "completed" ? "bg-green-50 border border-green-200" : question.status === "current" ? "bg-gray-50 border border-black" : "border border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 ${question.status === "completed" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}
                    >
                      {question.status === "completed" ? <Check className="w-4 h-4" /> : question.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${question.status === "completed" ? "text-green-700" : question.status === "current" ? "text-neutral-950" : "text-gray-500"}`}>{question.text}</p>
                      {question.status === "completed" && question.transcript && <p className="text-xs text-gray-500 mt-2 bg-white/50 p-2 rounded break-all">{question.transcript}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recording Area */}
          <div className="flex-1">
            {!allCompleted ? (
              <div className="space-y-4">
                {/* Waveform Container */}
                <div className="bg-white rounded-xl border border-gray-100 p-8">
                  <div className="flex items-center justify-center gap-1 h-32">
                    {waveformBars.map((bar) => (
                      <motion.div
                        key={bar.id}
                        className={`w-1.5 rounded-full ${isRecording ? "bg-[#ff2056]" : "bg-gray-300"}`}
                        animate={
                          isRecording
                            ? {
                                height: [20, bar.maxHeight, 20],
                              }
                            : { height: 20 }
                        }
                        transition={
                          isRecording
                            ? {
                                duration: bar.duration,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: bar.delay,
                              }
                            : { duration: 0.3 }
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center gap-4">
                  {/* Restart/Mic/Stop Button */}
                  <button
                    onClick={isRecording ? stopRecording : hasRecording ? restartRecording : startRecording}
                    disabled={isTranscribing}
                    className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-colors ${
                      isRecording ? "border-red-200 bg-red-50 hover:bg-red-100" : "border-gray-200 bg-white hover:bg-gray-50"
                    } ${isTranscribing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isRecording ? (
                      <div className="w-4 h-4 bg-red-500 rounded-sm" />
                    ) : hasRecording ? (
                      <RotateCcw className="w-[18px] h-[18px] text-gray-600" />
                    ) : (
                      <Mic className="w-[18px] h-[18px] text-gray-600" />
                    )}
                  </button>

                  {/* Timer */}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
                    <span className="text-sm text-gray-500">{formatTime(MAX_RECORDING_TIME)}</span>
                  </div>
                </div>

                {/* Transcript Preview Section */}
                {(isTranscribing || previewTranscript) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-neutral-950">النص المحول:</p>
                      {previewTranscript && !isTranscribing && (
                        <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Pencil className="w-3 h-3" />
                          {isEditing ? "إلغاء التعديل" : "تعديل"}
                        </button>
                      )}
                    </div>

                    {isTranscribing ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-500 ms-3">جاري تحويل الصوت إلى نص...</span>
                      </div>
                    ) : isEditing ? (
                      <textarea
                        value={previewTranscript || ""}
                        onChange={(e) => setPreviewTranscript(e.target.value)}
                        className="w-full h-24 p-3 text-sm border border-gray-200 rounded-lg bg-[#f3f3f5] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        dir="auto"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 bg-[#f3f3f5] p-3 rounded-lg break-words whitespace-pre-wrap" dir="auto">
                        {previewTranscript}
                      </p>
                    )}

                    {previewTranscript && !isTranscribing && (
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={restartRecording} className="h-10 px-4 rounded-lg">
                          إعادة التسجيل
                        </Button>
                        <Button onClick={confirmAndProceed} className="flex-1 h-10 rounded-lg">
                          تأكيد والمتابعة
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2b7fff] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-medium">i</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-[#101828] font-medium">اقرأ هذا النص للحصول على أفضل النتائج</p>
                      <p className="text-sm text-gray-500">{currentQuestion?.text}</p>
                      <p className="text-xs text-gray-400">انقر على أيقونة الميكروفون لبدء تسجيل إجابتك. يمكنك إعادة التسجيل إذا لزم الأمر.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-medium text-neutral-950 mb-2">تم الانتهاء من المقابلة</h2>
                <p className="text-sm text-gray-500">شكراً لك! لقد أكملت جميع الأسئلة بنجاح.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={handleBack} className="h-12 px-8 rounded-lg">
            رجوع
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="h-12 px-8 rounded-lg">
            تخطي
          </Button>
          <Button onClick={handleContinue} disabled={!allCompleted} className="flex-1 h-12 rounded-lg">
            التالي
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
