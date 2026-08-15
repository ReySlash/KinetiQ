import { BadRequestException } from '@nestjs/common';

type PrismaUniqueConstraintMeta = {
  target?: string[];
  driverAdapterError?: {
    cause?: {
      constraint?: {
        fields?: string[];
      };
    };
  };
};

type PrismaUniqueConstraintError = {
  code?: string;
  meta?: PrismaUniqueConstraintMeta;
};

type PrismaUniqueConstraintOptions = {
  entityLabel: string;
  fieldMessages: Record<string, string | undefined>;
  defaultMessage?: string;
  resolveField?: (detectedField?: string) => string | undefined;
};

function isPrismaUniqueConstraintError(
  error: unknown,
): error is PrismaUniqueConstraintError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

function getUniqueConstraintField(
  error: PrismaUniqueConstraintError,
): string | undefined {
  return (
    error.meta?.target?.[0] ??
    error.meta?.driverAdapterError?.cause?.constraint?.fields?.[0]
  );
}

export function toPrismaUniqueConstraintBadRequest(
  error: unknown,
  options: PrismaUniqueConstraintOptions,
): BadRequestException | undefined {
  if (!isPrismaUniqueConstraintError(error)) {
    return undefined;
  }

  const detectedField = getUniqueConstraintField(error);
  const field = options.resolveField?.(detectedField) ?? detectedField;
  const message =
    (field ? options.fieldMessages[field] : undefined) ??
    options.defaultMessage ??
    `A ${options.entityLabel} with that value already exists`;

  return new BadRequestException({
    message,
    ...(field ? { field } : {}),
  });
}
