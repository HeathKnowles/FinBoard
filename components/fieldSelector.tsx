"use client";
import { useState, useEffect, useMemo, FC } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FieldInfo {
  key: string;
  label?: string;
  sample?: any;
}

interface FieldsSelectorProps {
  fields?: Array<string | FieldInfo>;
  onChange?: (selected: string[]) => void;
}

const FieldsSelector: FC<FieldsSelectorProps> = ({ fields = [], onChange }) => {
  const normalize = (f: string | FieldInfo): FieldInfo =>
    typeof f === "string" ? { key: f, label: f } : f;

  const allNormalized = useMemo(() => fields.map(normalize), [fields]);

  const [availableFields, setAvailableFields] = useState<FieldInfo[]>(allNormalized);
  const labelMap = useMemo(() => {
    const m: Record<string, string> = {};
    allNormalized.forEach((f) => (m[f.key] = f.label ?? f.key));
    return m;
  }, [allNormalized]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  useEffect(() => {
    setAvailableFields(fields.map(normalize));
    setSelectedFields([]);
  }, [fields]);

  const addField = (fieldKey: string) => {
    setSelectedFields((prev) => {
      const updated = [...prev, fieldKey];
      setTimeout(() => onChange?.(updated), 0);
      return updated;
    });
    setAvailableFields((prev) => prev.filter((f) => f.key !== fieldKey));
  };

  const removeField = (fieldKey: string) => {
    setSelectedFields((prev) => prev.filter((f) => f !== fieldKey));
    setAvailableFields((prev) =>
      [...prev, { key: fieldKey, label: labelMap[fieldKey] }].sort((a, b) => a.key.localeCompare(b.key))
    );
    onChange?.(selectedFields.filter((f) => f !== fieldKey));
  };

  return (
    <div>
      <Label className="text-sm font-medium text-gray-200 block mb-4">Select Fields</Label>
      {/* Responsive grid that stacks on mobile and shows 2 columns on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* AVAILABLE FIELDS */}
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-900">
          <Label className="text-sm font-semibold text-gray-300 block mb-3">
            Available Fields
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableFields.length === 0 && (
              <p className="text-xs text-gray-500 italic">No fields left</p>
            )}
            {availableFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:border-green-500 transition-colors group"
              >
                <span className="text-sm text-gray-200 truncate">{field.label ?? field.key}</span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => addField(field.key)}
                  className="ml-2 bg-green-500 hover:bg-green-600 text-white text-sm opacity-0 group-hover:opacity-100 shrink-0"
                >
                  +
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* SELECTED FIELDS */}
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-900">
          <Label className="text-sm font-semibold text-gray-300 block mb-3">
            Selected Fields
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFields.length === 0 && (
              <p className="text-xs text-gray-500 italic">No fields selected</p>
            )}
            {selectedFields.map((fieldKey) => (
              <div
                key={fieldKey}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-green-900/30 border border-green-700/50 hover:border-green-500 transition-colors group"
              >
                <span className="text-sm text-green-100 truncate">{labelMap[fieldKey] ?? fieldKey}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeField(fieldKey)}
                  className="ml-2 text-sm opacity-0 group-hover:opacity-100 shrink-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldsSelector;