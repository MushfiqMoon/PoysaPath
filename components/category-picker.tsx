import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";

type CategoryPickerProps = {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
};

export function CategoryPicker({
  categories,
  value,
  onChange,
  id = "category",
}: CategoryPickerProps) {
  return (
    <div>
      <Label htmlFor={id}>Category</Label>
      <select
        id={id}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <option value="" disabled>
          Pick a category
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon ? `${c.icon} ` : ""}
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
