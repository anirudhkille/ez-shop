import { useEffect, useId, useRef } from "react";

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Loader2, MapPin } from "lucide-react";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

import { isMapboxEnabled } from "../api/mapbox-geocode";
import { useAddressAutocomplete } from "../hooks/use-address-autocomplete";

export type TResolvedAddressFields = {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type AddressAutocompleteInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  onSelectAddress: (address: TResolvedAddressFields) => void;
};

type ComboboxProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid: boolean;
  error?: { message?: string };
  label?: string;
  placeholder?: string;
  className?: string;
  onSelectAddress: (address: TResolvedAddressFields) => void;
};

function Combobox({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  error,
  label,
  placeholder,
  className,
  onSelectAddress,
}: ComboboxProps) {
  const {
    suggestions,
    isSearching,
    isResolving,
    activeIndex,
    setActiveIndex,
    isOpen,
    setIsOpen,
    resolveSuggestion,
  } = useAddressAutocomplete(value);

  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const showSuggestions = isOpen && suggestions.length > 0;
  const isBusy = isSearching || isResolving;

  const handleSelect = async (index: number) => {
    const suggestion = suggestions[index];
    if (!suggestion) return;

    try {
      onSelectAddress(await resolveSuggestion(suggestion));
    } catch {
      onSelectAddress({
        addressLine1: suggestion.primaryText,
        city: "",
        state: "",
        zipCode: "",
        country: "",
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!showSuggestions) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((activeIndex + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1
        );
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(suggestions.length - 1);
        break;
      case "Enter":
        if (activeIndex >= 0) {
          event.preventDefault();
          void handleSelect(activeIndex);
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <Field data-invalid={invalid}>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

      <div className="relative" ref={containerRef}>
        <Input
          id={id}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={invalid}
          aria-activedescendant={
            showSuggestions && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          className={cn("pr-10", className)}
        />

        {isBusy && (
          <Loader2
            aria-hidden
            className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
          />
        )}

        {showSuggestions && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Address suggestions"
            className="border-brand-border bg-card text-foreground absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.mapboxId}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => void handleSelect(index)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 px-3 py-2.5 text-sm",
                  index === activeIndex && "bg-brand-orange/10"
                )}
              >
                <MapPin
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    index === activeIndex
                      ? "text-brand-orange"
                      : "text-muted-foreground"
                  )}
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {suggestion.primaryText}
                  </span>
                  {suggestion.secondaryText && (
                    <span className="text-muted-foreground block truncate text-xs">
                      {suggestion.secondaryText}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isMapboxEnabled && isSearching && !showSuggestions && (
        <p className="text-muted-foreground text-xs">Searching…</p>
      )}

      {invalid && <FieldError errors={[error]} />}
    </Field>
  );
}

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
        <Combobox
          id={name}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={fieldState.invalid}
          error={fieldState.error}
          label={label}
          placeholder={placeholder}
          className={className}
          onSelectAddress={onSelectAddress}
        />
      )}
    />
  );
}

export { AddressAutocompleteInput };
