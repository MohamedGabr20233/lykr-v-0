"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/onboarding/page-transition";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCompetitors } from "@/lib/store/slices/onboardingSlice";

export default function CompetitorsPage() {
  const dispatch = useAppDispatch();
  const storedCompetitors = useAppSelector((state) => state.onboarding.competitors);

  const [competitors, setCompetitorsState] = useState<string[]>([""]);
  const router = useRouter();

  // Initialize from Redux state
  useEffect(() => {
    if (storedCompetitors.length > 0 && storedCompetitors.some((c) => c.trim().length > 0)) {
      setCompetitorsState(storedCompetitors);
    }
  }, [storedCompetitors]);

  const handleBack = () => {
    router.push("/onboarding/documents");
  };

  const handleContinue = () => {
    // Filter out empty competitors before saving
    const validCompetitors = competitors.filter((c) => c.trim().length > 0);
    dispatch(setCompetitors(validCompetitors));
    router.push("/onboarding/voice-interview");
  };

  const addCompetitor = () => {
    setCompetitorsState((prev) => [...prev, ""]);
  };

  const updateCompetitor = (index: number, value: string) => {
    setCompetitorsState((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitorsState((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const hasAtLeastOneCompetitor = competitors.some((c) => c.trim().length > 0);

  return (
    <PageTransition>
      <div className="w-full max-w-lg mx-auto px-6">
        <h1 className="text-2xl font-normal text-neutral-950 mb-3">من هم منافسوك؟</h1>

        <p className="text-sm text-gray-500 mb-6">أضف مواقع المنافسين لمساعدتنا في تحليل موقعك في السوق.</p>

        <div className="space-y-3">
          {/* Competitor Inputs */}
          {competitors.map((competitor, index) => (
            <div key={index} className="relative">
              <Input
                type="url"
                placeholder="رابط موقع المنافس"
                value={competitor}
                onChange={(e) => updateCompetitor(index, e.target.value)}
                className="h-12 bg-[#f3f3f5] border-transparent rounded-lg text-start pe-10"
              />
              {competitors.length > 1 && (
                <button onClick={() => removeCompetitor(index)} className="absolute end-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}

          {/* Add Another Button */}
          <Button variant="outline" onClick={addCompetitor} className="w-full h-12 rounded-lg border-gray-300">
            + إضافة منافس آخر
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleBack} className="h-12 px-6 rounded-lg">
              رجوع
            </Button>
            <Button onClick={handleContinue} disabled={!hasAtLeastOneCompetitor} className="flex-1 h-12 rounded-lg">
              متابعة
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
