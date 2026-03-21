import type { ReactNode } from "react";

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Field, FieldError, FieldLabel } from "./field";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";

type Option = {
  label: string;
  value: string | number;
};

function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  prefix,
}: {
  name: Path<T>;
  control: Control<T>;
  label?: String;
  placeholder?: string;
  prefix?: ReactNode;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <div className="relative">
            {prefix && (
              <div className="text-muted-foreground pointer-events-none absolute top-5 right-0 left-5">
                {prefix}
              </div>
            )}
            <Input
              id={name}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              className={prefix ? "pl-11" : ""}
              {...field}
            />{" "}
          </div>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
}: {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          <Textarea
            id={name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            {...field}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select an option",
  disabled = false,
}: {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
            disabled={disabled}
          >
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { FormInput, FormTextarea, FormSelect };
