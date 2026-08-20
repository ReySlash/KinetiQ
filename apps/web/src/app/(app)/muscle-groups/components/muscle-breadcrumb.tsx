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
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="hover:text-primary"
            render={
              <Link
                className="inline-flex items-center gap-1 text-lg font-bold leading-none text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
                href="/muscle-groups"
              >
                <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
                Muscle Groups
              </Link>
            }
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            className="hover:text-primary"
            render={
              <Link
                className="inline-flex items-center gap-1 text-lg font-bold leading-none text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
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
