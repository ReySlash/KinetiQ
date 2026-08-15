"use client";

import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsBarChartSection from "./stats-bar-chart-section";

type StatsBarChartProps = {
  capabilities?: (number | string | null)[];
  demands?: (number | string | null)[];
};

type StatGroup = "Capabilities" | "Demands";

const statHeaders: Record<StatGroup, string[]> = {
  Capabilities: [
    "Hypertrophy",
    "Max Strength",
    "Power",
    "Muscular Endurance",
    "Stability",
    "Loadability",
    "Stretch Loading",
    "Shortened Loading",
  ],
  Demands: [
    "Technical Demand",
    "Setup Complexity",
    "Stability Demand",
    "Systemic Fatigue",
    "Local Fatigue",
    "Recovery Cost",
    "Grip Demand",
    "Axial Loading",
  ],
};

export default function StatsBarChart({
  capabilities,
  demands,
}: StatsBarChartProps) {
  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="Capabilities">
          <TabsList>
            <TabsTrigger value="Capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="Demands">Demands</TabsTrigger>
          </TabsList>
          <TabsContent value="Capabilities">
            <CardDescription className="mb-2">
              Editorial ratings of what this exercise may help develop.
            </CardDescription>
            <StatsBarChartSection
              headers={statHeaders.Capabilities.slice(0, -1)}
              values={capabilities}
            />
          </TabsContent>
          <TabsContent value="Demands">
            <CardDescription className="mb-2">
              Editorial ratings of the demands this exercise typically involves.
            </CardDescription>
            <StatsBarChartSection
              headers={statHeaders.Demands.slice(0, -1)}
              values={demands}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
