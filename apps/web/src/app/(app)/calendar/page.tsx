import type { Metadata } from "next";

import { FeatureComingSoon } from "@/app/(app)/_components/feature-coming-soon";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CalendarPage() {
  return (
    <FeatureComingSoon
      title="Calendar"
      subtitle="Plan your training around your life."
      description="Calendar will help you place workouts on real dates, keep your schedule visible, and make changes when life gets in the way."
      icon="calendar"
    />
  );
}
