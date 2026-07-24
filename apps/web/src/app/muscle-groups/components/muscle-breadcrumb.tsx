import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type MuscleBreadcrumbProps = {
  muscleGroup?: string;
  muscleSlug?: string;
};

export function MuscleBreadcrumb(props: MuscleBreadcrumbProps) {
  const { muscleGroup, muscleSlug } = props;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <Link className="text-lg font-bold leading-none" href="/muscles">
                Muscle Groups
              </Link>
            }
          />
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <Link
                className="text-lg font-bold leading-none"
                href={`/muscles/${muscleGroup}`}
              >
                {muscleGroup}
              </Link>
            }
          />
        </BreadcrumbItem>

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-lg font-bold leading-none">
            {muscleSlug}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
