import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sortOptions, type SortKey } from "@/lib/filters";

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground sm:inline">
        Sort
      </span>
      <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
        <SelectTrigger
          aria-label="Sort products"
          className="h-10 w-[10.5rem] rounded-none border-border bg-card text-xs tracking-wide"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
