import Link from "next/link";

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
            render={
              <Link
                className="text-lg font-bold leading-none"
                href="/muscle-groups"
              >
                Muscle Groups
              </Link>
            }
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <Link
                className="text-lg font-bold leading-none"
                href={muscleGroupSlug ? `/muscle-groups/${muscleGroupSlug}` : "/muscle-groups"}
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
