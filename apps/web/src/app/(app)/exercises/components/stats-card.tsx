import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsTable from "./stats-table";

type StatsCardProps = {
  capabilities?: (number | string | null)[];
  demands?: (number | string | null)[];
};

export default function StatsCard(props: StatsCardProps) {
  const { capabilities, demands } = props;

  const capabilitiesHeaders = [
    "Hypertrophy Potential",
    "Maximal Strength Potential",
    "Power Development Potential",
    "Muscular Endurance Potential",
    "Stability Development Potential",
    "Typical Loadability",
    "Stretch Position Loading",
    "Shortened Position Loading",
  ];
  const demandsHeaders = [
    "Technical Demand",
    "Setup Complexity",
    "Stability Demand",
    "Systemic Fatigue Potential",
    "Local Fatigue Potential",
    "Recovery Cost Potential",
    "Grip Demand",
    "Axial Loading Potential",
  ];

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="Capabilities">
          <TabsList>
            <TabsTrigger value="Capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="Demands">Demands</TabsTrigger>
          </TabsList>
          <TabsContent value="Capabilities">
            <StatsTable
              headers={capabilitiesHeaders}
              values={capabilities ? Object.values(capabilities) : []}
              type="Capabilities"
            />
          </TabsContent>
          <TabsContent value="Demands">
            <StatsTable
              headers={demands ? demandsHeaders : []}
              values={demands ? Object.values(demands) : []}
              type="Demands"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
