import { type ReactNode } from "react";

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { cn } from "@/lib/utils";

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
  ...props
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

          <Input
            id={name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            {...field}
            {...props}
          />

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

function FormInputWithIcon<T extends FieldValues>({
  name,
  control,
  icon,
  position = "left",
  ...props
}: {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  icon: ReactNode;
  position?: "left" | "right";
} & React.ComponentProps<typeof FormInput<T>>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="relative">
            <div
              className={cn(
                "text-muted-foreground absolute top-1/2 -translate-y-1/2",
                position === "left" ? "left-4" : "right-4"
              )}
            >
              {icon}
            </div>

            <Input
              {...field}
              {...props}
              className={cn(
                position === "left" ? "pr-5 pl-11" : "pr-11",
                props.className
              )}
            />
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function FormLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <FieldLabel
      className="font-body text-muted-foreground text-xs font-semibold tracking-wider uppercase"
      htmlFor={htmlFor}
    >
      {children}
    </FieldLabel>
  );
}

export { FormInput, FormTextarea, FormSelect, FormInputWithIcon, FormLabel };
