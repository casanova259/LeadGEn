"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

export function FormSelect({
  name,
  defaultValue,
  value: controlledValue,
  onValueChange,
  placeholder,
  options,
  required,
  disabled,
}: {
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  placeholder?: string;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <>
      <input type="hidden" name={name} value={currentValue} required={required} />
      <Select value={currentValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}