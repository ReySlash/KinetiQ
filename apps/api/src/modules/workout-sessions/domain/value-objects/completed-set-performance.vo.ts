import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';

export type LoadUnitValue = 'KG' | 'LB';

const KG_PER_LB_NUMERATOR = 45_359_237n; // 45359237 / 100000000 = 0.45359237 (conversion from lb to kg)
const KG_PER_LB_SCALE = 100_000_000n; // 100000000 (denominator for conversion)
const KILOGRAM_CENTS = 100n; // 100 (cents in a kilogram)
const MAX_KILOGRAM_CENTS = 9_999_999n; // 9999999 (maximum kilogram cents)

// Parses a non-negative decimal string into a numerator and scale for precise arithmetic.
function parseNonNegativeDecimal(value: string): {
  numerator: bigint;
  scale: bigint;
} {
  const normalized = value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(normalized)) {
    throw new WorkoutSessionValidationError(
      'Completed set load must be a non-negative decimal value.',
    );
  }

  const [whole, fraction = ''] = normalized.split('.');
  return {
    numerator: BigInt(`${whole}${fraction}`),
    scale: 10n ** BigInt(fraction.length),
  };
}

// Divides two bigints and rounds half-up (ceiling when exactly halfway).
function divideAndRoundHalfUp(numerator: bigint, denominator: bigint): bigint {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  return remainder * 2n >= denominator ? quotient + 1n : quotient;
}

// Formats a bigint value as a decimal string with exactly two decimal places.
function formatCents(value: bigint): string {
  const whole = value / KILOGRAM_CENTS;
  const cents = (value % KILOGRAM_CENTS).toString().padStart(2, '0');
  return `${whole}.${cents}`;
}

// Represents the unit of measurement for exercise load (KG or LB).
export class LoadUnit extends ValueObject<LoadUnitValue> {
  private constructor(value: LoadUnitValue) {
    super(value);
  }

  static create(value: string): LoadUnit {
    if (value !== 'KG' && value !== 'LB') {
      throw new WorkoutSessionValidationError(
        'Completed set load unit must be KG or LB.',
      );
    }
    return new LoadUnit(value);
  }
}

// Represents the canonical load value in kilograms, stored as cents (1/100 kg) for precision.
export class CanonicalLoad extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(
    enteredLoad: string,
    enteredUnit: LoadUnitValue,
  ): CanonicalLoad {
    if (enteredUnit !== 'KG' && enteredUnit !== 'LB') {
      throw new WorkoutSessionValidationError(
        'Completed set load unit must be KG or LB.',
      );
    }
    const parsed = parseNonNegativeDecimal(enteredLoad);
    const numerator =
      // Convert to kilograms first, then to cents (1/100 kg)
      enteredUnit === 'LB'
        ? parsed.numerator * KG_PER_LB_NUMERATOR * KILOGRAM_CENTS
        : parsed.numerator * KILOGRAM_CENTS;
    const denominator =
      // Adjust scale to match the conversion
      enteredUnit === 'LB' ? parsed.scale * KG_PER_LB_SCALE : parsed.scale;
    const kilogramCents = divideAndRoundHalfUp(numerator, denominator);

    // Check if the result exceeds the maximum supported kilogram value
    if (kilogramCents > MAX_KILOGRAM_CENTS) {
      throw new WorkoutSessionValidationError(
        'Completed set load exceeds the supported kilogram range.',
      );
    }

    return new CanonicalLoad(formatCents(kilogramCents));
  }
}

// Represents the number of repetitions completed in a set.
export class CompletedSetRepetitions extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): CompletedSetRepetitions {
    if (!Number.isInteger(value) || value < 0 || value > 1000) {
      throw new WorkoutSessionValidationError(
        'Completed set repetitions must be an integer between 0 and 1000.',
      );
    }
    return new CompletedSetRepetitions(value);
  }
}

// Represents the repetitions in reserve (RIR) for a set, indicating how many reps
// could be performed before failure. Values range from 0 (max effort) to 10 (very easy).
export class RepetitionsInReserve extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): RepetitionsInReserve {
    if (!Number.isInteger(value) || value < 0 || value > 10) {
      throw new WorkoutSessionValidationError(
        'Completed set RIR must be an integer between 0 and 10.',
      );
    }
    return new RepetitionsInReserve(value);
  }
}
