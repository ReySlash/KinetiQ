import { ValueObject } from './value-object.vo';

class TestValueObject extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}

describe('ValueObject', () => {
  it('exposes its immutable value', () => {
    const valueObject = new TestValueObject('value');

    expect(valueObject.value).toBe('value');
  });

  it('compares values', () => {
    const first = new TestValueObject('value');
    const second = new TestValueObject('value');
    const different = new TestValueObject('different');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(different)).toBe(false);
  });
});
