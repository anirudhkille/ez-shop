import { Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./field";
import { Input } from "./input";

function FormInput({
  name,
  control,
  label,
  placeholder,
}: {
  name: string;
  control: any;
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
          <Input
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

export { FormInput };
