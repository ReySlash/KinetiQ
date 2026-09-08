import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardMetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="truncate text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <CardContent className="text-xs text-muted-foreground">
          {detail}
        </CardContent>
      ) : null}
    </Card>
  );
}
