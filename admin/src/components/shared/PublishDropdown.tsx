import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";

interface PublishDropdownProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function PublishDropdown({
  value,
  onChange,
}: PublishDropdownProps) {
  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue === "true");
  };

  return (
    <div className="space-y-1.5">
      <Label>Publish</Label>
      <Select
        onValueChange={handleSelectChange}
        value={value ? "true" : "false"}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a pusblish" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {[
              { label: "Publish", value: "true" },
              { label: "Unpublish", value: "false" },
            ].map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
