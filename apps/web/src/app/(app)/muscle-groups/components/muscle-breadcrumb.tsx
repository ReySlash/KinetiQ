import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type MuscleBreadcrumbProps = {
  muscleGroup?: string;
  muscleGroupSlug?: string;
};

export function MuscleBreadcrumb(props: MuscleBreadcrumbProps) {
  const { muscleGroup, muscleGroupSlug } = props;
  return (
    <Breadcrumb>
      <BreadcrumbList className="min-w-0 flex-nowrap overflow-hidden">
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbLink
            className="min-w-0 truncate hover:text-primary"
            render={
              <Link
                className="inline-flex min-w-0 items-center gap-1 truncate text-lg font-bold leading-none text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
                href="/muscle-groups"
              >
                <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
                Muscle Groups
              </Link>
            }
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbLink
            className="min-w-0 truncate hover:text-primary"
            render={
              <Link
                className="inline-flex min-w-0 items-center gap-1 truncate text-lg font-bold leading-none text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
                href={
                  muscleGroupSlug
                    ? `/muscle-groups/${muscleGroupSlug}`
                    : "/muscle-groups"
                }
              >
                {muscleGroup ?? "Muscle Groups"}
              </Link>
            }
          />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
