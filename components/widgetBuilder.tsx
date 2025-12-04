"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import FieldsSelector from "./fieldSelector";
import DisplayModeBuilder from "./displayModeBuilder";
import { humanizeKey } from "@/lib/autolabeller";
import { analyzeApiResponse, type AnalysisResult } from "@/lib/autoDetectDisplayMode";
import { useAppDispatch } from "@/store/hooks";
import { addWidget } from "@/store/widgetsSlice";
import type { DisplayConfig } from "@/types/display";

// Helper function to select fields based on analysis
function selectFieldsBasedOnAnalysis(analysis: AnalysisResult, allKeys: string[]): string[] {
  const { widgetType, tableColumns, chartFields } = analysis;

  if (widgetType === "table" && tableColumns.length > 0) {
    return tableColumns;
  }

  if ((widgetType === "line-chart" || widgetType === "area-chart" || widgetType === "candle-chart") && chartFields.length > 0) {
    return chartFields;
  }

  // For watchlist/gainers cards, try to find symbol, price, change fields
  if (widgetType === "watchlist" || widgetType === "gainers") {
    const symbolField = allKeys.find(k => k.toLowerCase().includes('symbol') || k.toLowerCase().includes('ticker')) ?? allKeys[0];
    const priceField = allKeys.find(k => k.toLowerCase().includes('price') || k.toLowerCase() === 'c' || k.toLowerCase() === 'close') ?? allKeys[1];
    const changeField = allKeys.find(k => k.toLowerCase().includes('change') || k.toLowerCase().includes('percent') || k.toLowerCase().includes('dp')) ?? allKeys[2];
    return [symbolField, priceField, changeField].filter(Boolean);
  }

  // For performance/financial cards, return all available keys
  if (widgetType === "performance" || widgetType === "financial") {
    return allKeys;
  }

  // Default: return all keys
  return allKeys;
}

// Helper function to generate display config based on analysis
function generateDisplayConfig(analysis: AnalysisResult, selectedFields: string[]): DisplayConfig | null {
  const { widgetType, chartFields, intervals } = analysis;

  // Table widget
  if (widgetType === "table") {
    return {
      mode: "table",
      table: {
        fields: selectedFields,
        searchable: true,
        paginated: true,
      },
    };
  }

  // Card widgets
  if (widgetType === "watchlist" || widgetType === "gainers" || widgetType === "performance" || widgetType === "financial") {
    return {
      mode: "cards",
      cards: {
        type: widgetType,
        fields: selectedFields,
      },
    };
  }

  // Chart widgets
  if (widgetType === "line-chart") {
    const xField = chartFields[0] || selectedFields[0] || "";
    const yField = chartFields[1] || selectedFields[1] || selectedFields[0] || "";
    const interval = (intervals === "1D" || intervals === "1W" || intervals === "1M") ? intervals : "1D";
    return {
      mode: "chart",
      chart: {
        type: "line",
        xField,
        yField,
        interval,
      },
    };
  }

  if (widgetType === "area-chart") {
    const xField = chartFields[0] || selectedFields[0] || "";
    const yField = chartFields[1] || selectedFields[1] || selectedFields[0] || "";
    const interval = (intervals === "1D" || intervals === "1W" || intervals === "1M") ? intervals : "1D";
    return {
      mode: "chart",
      chart: {
        type: "area",
        xField,
        yField,
        interval,
      },
    };
  }

  if (widgetType === "candle-chart") {
    const dateField = chartFields.find((f) => f.toLowerCase().includes("date") || f.toLowerCase().includes("time") || f.toLowerCase() === "t") || chartFields[0] || selectedFields[0] || "";
    const interval = (intervals === "1D" || intervals === "1W" || intervals === "1M") ? intervals : "1D";
    // Find OHLC fields from selected fields or chartFields
    const allFields = [...new Set([...selectedFields, ...chartFields])];
    const openField = allFields.find(f => f.toLowerCase() === 'o' || f.toLowerCase() === 'open') ?? "open";
    const highField = allFields.find(f => f.toLowerCase() === 'h' || f.toLowerCase() === 'high') ?? "high";
    const lowField = allFields.find(f => f.toLowerCase() === 'l' || f.toLowerCase() === 'low') ?? "low";
    const closeField = allFields.find(f => f.toLowerCase() === 'c' || f.toLowerCase() === 'close') ?? "close";
    
    return {
      mode: "chart",
      chart: {
        type: "candle",
        xField: dateField,
        yField: closeField,
        interval,
        openField,
        highField,
        lowField,
        closeField,
      },
    };
  }

  return null;
}

export function WidgetBuilder() {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [refresh, setRefresh] = useState(60);

  const [loading, setLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [rawData, setRawData] = useState<any>(null);
  const [flattenedData, setFlattenedData] = useState<string[]>([]);
  const [labeledFields, setLabeledFields] = useState<{
    key: string;
    label: string;
    sample?: any;
  }[]>([]);

  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig | null>(null);
  const [suggestedWidget, setSuggestedWidget] = useState<string | null>(null);

  async function handleTest() {
    if (!apiUrl.trim()) {
      alert("Please enter an API URL");
      return;
    }

    setLoading(true);
    setTestSuccess(false);
    setSelectedFields([]);
    setDisplayConfig(null);

    try {
      const res = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: apiUrl, 
          refreshInterval: refresh,
          maxAge: refresh * 60, // Set maxAge to 60x refresh interval
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setRawData(json.raw);
      const keys = json.flattened.filter((key: string) => key && isNaN(Number(key)));
      setFlattenedData(keys);

      // Analyze API response to detect widget type
      const analysis = analyzeApiResponse(json.raw);
      setSuggestedWidget(analysis.widgetType);

      // Build labeled fields with a sample value from the first row
      const firstRow = Array.isArray(json.raw) ? json.raw[0] : json.raw;
      const labeled = keys.map((k: string) => {
        // support nested keys using dot notation
        const get = (obj: any, path: string) => {
          if (!obj) return undefined;
          return path.split(".").reduce((acc: any, part: string) => (acc == null ? undefined : acc[part]), obj);
        };

        return {
          key: k,
          label: humanizeKey(k),
          sample: get(firstRow, k),
        };
      });
      setLabeledFields(labeled);

      // Auto-select fields based on widget type and analysis
      const autoSelectedFields = selectFieldsBasedOnAnalysis(analysis, keys);
      setSelectedFields(autoSelectedFields);

      // Auto-generate display config based on analysis
      const autoConfig = generateDisplayConfig(analysis, autoSelectedFields);
      if (autoConfig) {
        setDisplayConfig(autoConfig);
      }

      setTestSuccess(true);
    } catch (error: any) {
      alert("Test failed: " + error.message);
      setTestSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  function handleAddWidget() {
    if (!testSuccess) {
      alert("Please test the API first.");
      return;
    }
    if (!selectedFields.length) {
      alert("Please select fields.");
      return;
    }
    if (!displayConfig) {
      alert("Please choose a display mode.");
      return;
    }

    const id = crypto.randomUUID();
    dispatch(
      addWidget({
        id,
        name: name || "New Widget",
        apiUrl,
        refresh,
        config: displayConfig,
        data: Array.isArray(rawData) ? rawData : [rawData],
        flattened: flattenedData,
      })
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white font-medium transition-colors">
          + Add Widget
        </Button>
      </DialogTrigger>
      {/* Improved responsive dialog with better max-width handling */}
      <DialogContent className="w-full max-w-4xl bg-gray-800 text-white border-gray-700 rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Add New Widget</DialogTitle>
        </DialogHeader>
        <Separator className="bg-gray-700" />

        {/* Form Section */}
        <div className="space-y-4 sm:space-y-5">
          {/* NAME */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-200">Widget Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Stock Widget, Crypto Widget..."
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {/* API + TEST */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-200">API URL</Label>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://finnhub.io/api/v1/quote?symbol=AAPL&token=..."
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 min-h-10"
              />
              <Button
                className="bg-green-500 hover:bg-green-600 text-white font-medium transition-colors w-full sm:w-auto whitespace-nowrap"
                type="button"
                onClick={handleTest}
                disabled={loading}
              >
                <Image src="/test.png" width={16} height={16} alt="Test" className="mr-2" />
                {loading ? "Testing..." : "Test"}
              </Button>
            </div>
          </div>

          {/* REFRESH */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-200">Refresh Interval (seconds)</Label>
            <Input
              type="number"
              min={5}
              value={refresh}
              onChange={(e) => setRefresh(Number(e.target.value))}
              className="bg-gray-700 border-gray-600 text-white focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {/* AFTER TEST SUCCESS */}
          {testSuccess && (
            <>
              <Separator className="bg-gray-700 my-4" />

              {/* SUGGESTED WIDGET TYPE */}
              {suggestedWidget && (
                <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/50">
                  <Label className="text-sm font-medium text-green-400">
                    💡 Suggested Widget: <span className="font-bold capitalize">{suggestedWidget.replace('-', ' ')}</span>
                  </Label>
                </div>
              )}

              {/* STEP 1 – SELECT FIELDS */}
              <FieldsSelector
                fields={labeledFields}
                onChange={(fields) => {
                  setSelectedFields(fields);
                  setDisplayConfig(null);
                }}
              />

              {/* STEP 2 – DISPLAY MODE */}
              {selectedFields.length > 0 && (
                <>
                  <Separator className="bg-gray-700 my-4" />
                  <Label className="text-sm font-medium text-gray-200 block">Display Mode</Label>
                  <DisplayModeBuilder
                    fields={labeledFields.filter((f) => selectedFields.includes(f.key))}
                    value={displayConfig}
                    onChange={(cfg) => setDisplayConfig(cfg)}
                  />
                </>
              )}
            </>
          )}
        </div>

        <Separator className="bg-gray-700 my-4" />
        {/* Responsive footer with better mobile layout */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <DialogClose asChild>
            <Button className="bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white font-medium transition-colors w-full sm:w-auto"
              type="button"
              onClick={handleAddWidget}
            >
              Add Widget
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}