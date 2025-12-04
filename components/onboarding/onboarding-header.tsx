"use client";

import { motion } from "motion/react";
import { useLocale } from "next-intl";
import { ONBOARDING_STEPS } from "@/lib/constants/onboarding-steps";
import { cn } from "@/lib/utils";

interface OnboardingHeaderProps {
  currentStep: number;
}

export function OnboardingHeader({ currentStep }: OnboardingHeaderProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const progressPercentage = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="h-16 px-8 lg:px-[23%] flex items-center justify-between">
        {/* Logo placeholder */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg" />
          <span className="text-2xl text-black">Lykr</span>
        </div>

        {/* Progress Steps */}
        <nav className="hidden md:flex items-center gap-6" dir={isRtl ? "rtl" : "ltr"}>
          {ONBOARDING_STEPS.map((step, index) => (
            <span
              key={step.route}
              className={cn(
                "text-sm",
                index === currentStep
                  ? "text-black font-medium"
                  : "text-gray-400"
              )}
            >
              {step.label}
            </span>
          ))}
        </nav>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 px-8 lg:px-[23%]">
        <div className="h-full bg-gray-200 relative" dir={isRtl ? "rtl" : "ltr"}>
          <motion.div
            className="absolute inset-y-0 start-0 bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>
    </header>
  );
}
