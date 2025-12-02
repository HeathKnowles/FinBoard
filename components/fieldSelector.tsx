"use client";
import { useState, FC } from "react";
import { Label } from "@/components/ui/label";

interface FieldsSelectorProps {
  fields?: string[];
  onChange?: (selected: string[]) => void;
}

const FieldsSelector: FC<FieldsSelectorProps> = ({ fields = [], onChange }) => {
  const [availableFields, setAvailableFields] = useState<string[]>(fields);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const addField = (field: string) => {
    setSelectedFields((prev) => {
      const updated = [...prev, field];
      onChange?.(updated);
      return updated;
    });
    setAvailableFields((prev) => prev.filter((f) => f !== field));
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="border p-3 rounded-lg">
        <Label className="text-sm font-medium">Available Fields</Label>

        <div className="mt-2 flex flex-col gap-2">
          {availableFields.length === 0 && (
            <p className="text-xs text-muted-foreground">No fields left</p>
          )}

          {availableFields.map((field) => (
            <div
              key={field}
              className="flex items-center justify-between px-2 py-1 rounded bg-muted"
            >
              <span>{field}</span>
              <button
                onClick={() => addField(field)}
                className="px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border p-3 rounded-lg">
        <Label className="text-sm font-medium">Selected Fields</Label>

        <div className="mt-2 flex flex-col gap-2">
          {selectedFields.length === 0 && (
            <p className="text-xs text-muted-foreground">No fields selected</p>
          )}

          {selectedFields.map((field) => (
            <div key={field} className="px-2 py-1 rounded bg-primary/10">
              {field}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldsSelector;
