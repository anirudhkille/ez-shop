import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";

import {
  AddressAutocompleteCombobox,
  type TResolvedAddressFields,
} from "./address-autocomplete-combobox";

export type { TResolvedAddressFields };

type AddressAutocompleteInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  onSelectAddress: (address: TResolvedAddressFields) => void;
};

function AddressAutocompleteInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  className,
  onSelectAddress,
}: AddressAutocompleteInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

          <AddressAutocompleteCombobox
            id={name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            invalid={fieldState.invalid}
            placeholder={placeholder}
            className={className}
            onSelectAddress={onSelectAddress}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { AddressAutocompleteInput };
