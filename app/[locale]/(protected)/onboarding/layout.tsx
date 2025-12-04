"use client";

import { usePathname } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { ONBOARDING_STEPS } from "@/lib/constants/onboarding-steps";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentStepIndex = ONBOARDING_STEPS.findIndex((step) =>
    pathname.includes(step.route)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <OnboardingHeader currentStep={Math.max(0, currentStepIndex)} />

      <main className="flex-1 flex items-center justify-center overflow-hidden">
        {children}
      </main>
    </div>
  );
}
