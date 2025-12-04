"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/onboarding/page-transition";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setBusinessInfo } from "@/lib/store/slices/onboardingSlice";

export default function BusinessInfoPage() {
  const dispatch = useAppDispatch();
  const storedBusinessInfo = useAppSelector((state) => state.onboarding.businessInfo);
  const [businessName, setBusinessName] = useState("");
  const router = useRouter();

  // Initialize from Redux state
  useEffect(() => {
    if (storedBusinessInfo.name) {
      setBusinessName(storedBusinessInfo.name);
    }
  }, [storedBusinessInfo.name]);

  const isValid = businessName.trim().length > 0;

  const handleContinue = () => {
    if (isValid) {
      dispatch(setBusinessInfo({ name: businessName.trim() }));
      router.push("/onboarding/website");
    }
  };

  return (
    <PageTransition>
      <div className="w-full max-w-lg mx-auto px-6">
        <h1 className="text-2xl font-normal text-neutral-950 mb-3">ما هو اسم عملك؟</h1>

        <p className="text-sm text-gray-500 mb-6">ساعدنا في تخصيص تجربتك من خلال إخبارنا عن عملك.</p>

        <div className="space-y-3">
          <Input
            type="text"
            placeholder="أدخل اسم عملك"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-12 bg-[#f3f3f5] border-transparent rounded-lg text-start"
          />

          <Button onClick={handleContinue} disabled={!isValid} className="w-full h-12 rounded-lg">
            متابعة
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
