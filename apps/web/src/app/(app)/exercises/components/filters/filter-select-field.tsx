"use client";

import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterSelectFieldProps<TValue extends string> = {
  label: string;
  options: readonly { label: string; value: TValue }[];
  value: TValue;
  onValueChange: (value: TValue) => void;
};

export function FilterSelectField<TValue extends string>(
  props: FilterSelectFieldProps<TValue>,
) {
  const { label, options, value, onValueChange } = props;

  function handleValueChange(nextValue: TValue | null) {
    if (nextValue === null) {
      return;
    }

    onValueChange(nextValue);
  }

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
