import type { Metadata } from "next";

import { FeatureComingSoon } from "@/app/(app)/_components/feature-coming-soon";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProgressPage() {
  return (
    <FeatureComingSoon
      title="Progress"
      subtitle="See how your training is building over time."
      description="Progress will turn your completed workouts into clear, explainable trends so you can understand what is changing without guessing."
      icon="progress"
    />
  );
}
