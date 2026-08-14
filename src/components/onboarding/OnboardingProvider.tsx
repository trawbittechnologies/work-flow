"use client";

import { useState, useEffect } from "react";
import { OnboardingWizard } from "./OnboardingWizard";

interface OnboardingProviderProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    onboardingComplete: boolean;
  };
}

export function OnboardingProvider({ children, user }: OnboardingProviderProps) {
  const [showWizard, setShowWizard] = useState(!user.onboardingComplete);

  // Re-check if user prop changes (e.g. after server refresh)
  useEffect(() => {
    setShowWizard(!user.onboardingComplete);
  }, [user.onboardingComplete]);

  function handleComplete() {
    setShowWizard(false);
    // Soft reload to refresh session/user state
    window.location.reload();
  }

  return (
    <>
      {showWizard && (
        <OnboardingWizard
          userId={user.id}
          userName={user.name}
          userEmail={user.email}
          onComplete={handleComplete}
        />
      )}
      {children}
    </>
  );
}
