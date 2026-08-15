import { UniqueId } from './unique-id.vo';
import { ValueObject } from './value-object.vo';

export class ExistingUuid extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ExistingUuid {
    return new ExistingUuid(UniqueId.create(value).value);
  }
}
