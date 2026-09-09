import { PageHeader } from "@/components/page-header";
import { getDashboardFirstName } from "./dashboard-state";

export function DashboardHeader({ name }: { name: string }) {
  const firstName = getDashboardFirstName(name);

  return (
    <PageHeader subtitle="Track, analyze, and improve every session.">
      <h1 className="truncate text-xl font-bold leading-none md:text-2xl">
        Welcome back{firstName ? `, ${firstName}` : ""}
      </h1>
    </PageHeader>
  );
}
