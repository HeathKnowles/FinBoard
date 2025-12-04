"use client";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { DisplayConfig } from "@/types/display";

type FieldInfo = { key: string; label?: string; sample?: any };

export default function DisplayModeBuilder({
  fields,
  value,
  onChange,
}: {
  fields: Array<string | FieldInfo>;
  value?: DisplayConfig | null;
  onChange: (config: DisplayConfig) => void;
}) {
  const [mode, setMode] = useState<DisplayConfig["mode"]>(value?.mode ?? "table");

  // Sync with external value changes
  useEffect(() => {
    if (value?.mode && value.mode !== mode) {
      setMode(value.mode);
    }
  }, [value?.mode]);

  const update = (partial: Partial<DisplayConfig>) =>
    onChange({
      mode,
      ...partial,
    } as DisplayConfig);

  const normalizedFields: FieldInfo[] = (fields || []).map((f) =>
    typeof f === "string" ? { key: f, label: f } : f
  );
  const fieldKeys = normalizedFields.map((f) => f.key);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MODE TOGGLE */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-200">Display Mode</Label>
        {/* Responsive toggle group that wraps on mobile */}
        <ToggleGroup
          type="single"
          variant="outline"
          value={mode}
          onValueChange={(v) => {
            if (!v) return;
            setMode(v as any);
            onChange({ mode: v } as DisplayConfig);
          }}
          className="flex flex-wrap gap-2 justify-start w-full"
        >
          <ToggleGroupItem value="table" className="flex-1 min-w-20 sm:flex-none">
            Table
          </ToggleGroupItem>
          <ToggleGroupItem value="cards" className="flex-1 min-w-20 sm:flex-none">
            Cards
          </ToggleGroupItem>
          <ToggleGroupItem value="chart" className="flex-1 min-w-20 sm:flex-none">
            Chart
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Separator className="bg-gray-700" />

      {/* TABLE MODE */}
      {mode === "table" && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-200">Table Options</Label>

          {/* Field Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-300">Main Field</Label>
            <Select
              onValueChange={(v) =>
                update({
                  table: {
                    fields: [v],
                    searchable: true,
                    paginated: true,
                  },
                })
              }
            >
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select main field" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {normalizedFields.map((f) => (
                  <SelectItem key={f.key} value={f.key} className="text-white">
                    {f.label ?? f.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700">
            <Label className="text-sm font-medium text-gray-200 cursor-pointer">
              Enable Search
            </Label>
            <Switch
              defaultChecked
              onCheckedChange={(checked) =>
                update({
                  table: {
                    fields: fieldKeys,
                    searchable: checked,
                    paginated: true,
                  },
                })
              }
            />
          </div>

          {/* Pagination Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700">
            <Label className="text-sm font-medium text-gray-200 cursor-pointer">
              Enable Pagination
            </Label>
            <Switch
              defaultChecked
              onCheckedChange={(checked) =>
                update({
                  table: {
                    fields: fieldKeys,
                    searchable: true,
                    paginated: checked,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* CARDS MODE */}
      {mode === "cards" && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-200">Cards View Type</Label>
          <Select
            value={value?.mode === "cards" ? value.cards?.type : undefined}
            onValueChange={(value) =>
              update({
                cards: {
                  type: value as any,
                  fields: fieldKeys,
                },
              })
            }
          >
            <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select finance card type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="watchlist" className="text-white">
                Watchlist
              </SelectItem>
              <SelectItem value="gainers" className="text-white">
                Gainers
              </SelectItem>
              <SelectItem value="performance" className="text-white">
                Performance
              </SelectItem>
              <SelectItem value="financial" className="text-white">
                Financial
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* CHART MODE */}
      {mode === "chart" && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-200">Chart Type</Label>
          <Select
            value={value?.mode === "chart" ? value.chart?.type : undefined}
            onValueChange={(value) =>
              update({
                chart: {
                  type: value as any,
                  xField: fieldKeys[0],
                  yField: fieldKeys[1] || fieldKeys[0],
                  interval: "1D",
                },
              })
            }
          >
            <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="line" className="text-white">
                Line
              </SelectItem>
              <SelectItem value="area" className="text-white">
                Area
              </SelectItem>
              <SelectItem value="bar" className="text-white">
                Bar
              </SelectItem>
              <SelectItem value="candle" className="text-white">
                Candle
              </SelectItem>
            </SelectContent>
          </Select>

          {/* X Axis Field */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-300">X Axis Field</Label>
            <Select
              onValueChange={(v) =>
                update({
                  chart: {
                    type: "line",
                    xField: v,
                    yField: fieldKeys[0],
                    interval: "1D",
                  },
                })
              }
            >
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select X field" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {normalizedFields.map((f) => (
                  <SelectItem key={f.key} value={f.key} className="text-white">
                    {f.label ?? f.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Y Axis Field */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-300">Y Axis Field</Label>
            <Select
              onValueChange={(v) =>
                update({
                  chart: {
                    type: "line",
                    xField: fieldKeys[0],
                    yField: v,
                    interval: "1D",
                  },
                })
              }
            >
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select Y field" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {normalizedFields.map((f) => (
                  <SelectItem key={f.key} value={f.key} className="text-white">
                    {f.label ?? f.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}