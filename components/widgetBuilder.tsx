"use client";
import { useState, memo, Suspense, startTransition, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch } from "@/store/hooks";
import { addWidget } from "@/store/widgetsSlice";
import type { DisplayConfig } from "@/types/display";
import { URLParameterEditor } from "./urlParameterEditor";

const FieldsSelector = dynamic(() => import("./fieldSelector"), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse" />,
  ssr: false,
});

const DisplayModeBuilder = dynamic(() => import("./displayModeBuilder"), {
  loading: () => <div className="h-40 bg-gray-700 rounded animate-pulse" />,
  ssr: false,
});

// Import dialog components directly to ensure proper accessibility
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { analyzeApiResponse, type AnalysisResult } from "@/lib/autoDetectDisplayMode";
import { humanizeKey } from "@/lib/autolabeller";

function selectFieldsBasedOnAnalysis(analysis: AnalysisResult, allKeys: string[]): string[] {
  const { widgetType, tableColumns, chartFields } = analysis;

  if (widgetType === "table" && tableColumns.length > 0) {
    return tableColumns;
  }

  if ((widgetType === "line-chart" || widgetType === "area-chart" || widgetType === "candle-chart") && chartFields.length > 0) {
    return chartFields;
  }

  if (widgetType === "watchlist" || widgetType === "gainers") {
    const symbolField = allKeys.find(k => k.toLowerCase().includes('symbol') || k.toLowerCase().includes('ticker')) ?? allKeys[0];
    const priceField = allKeys.find(k => k.toLowerCase().includes('price') || k.toLowerCase() === 'c' || k.toLowerCase() === 'close') ?? allKeys[1];
    const changeField = allKeys.find(k => k.toLowerCase().includes('change') || k.toLowerCase().includes('percent') || k.toLowerCase().includes('dp')) ?? allKeys[2];
    return [symbolField, priceField, changeField].filter(Boolean);
  }

  if (widgetType === "performance" || widgetType === "financial") {
    return allKeys;
  }

  return allKeys;
}

function generateDisplayConfig(analysis: AnalysisResult, selectedFields: string[]): DisplayConfig | null {
  const { widgetType, chartFields, intervals } = analysis;

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

  if (widgetType === "watchlist" || widgetType === "gainers" || widgetType === "performance" || widgetType === "financial") {
    return {
      mode: "cards",
      cards: {
        type: widgetType,
        fields: selectedFields,
      },
    };
  }

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

const WidgetBuilder = memo(function WidgetBuilder() {
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
  const [notification, setNotification] = useState<{type: 'error' | 'warning' | 'info'; title: string; message: string} | null>(null);

  const handleTest = useCallback(async () => {
    if (!apiUrl.trim()) {
      setNotification({
        type: 'warning',
        title: 'Missing API URL',
        message: 'Please enter an API URL to test the connection.'
      });
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
          maxAge: refresh * 60,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setRawData(json.raw);
      const keys = json.flattened.filter((key: string) => key && isNaN(Number(key)));
      setFlattenedData(keys);

      const analysis = analyzeApiResponse(json.raw);
      setSuggestedWidget(analysis.widgetType);

      const firstRow = Array.isArray(json.raw) ? json.raw[0] : json.raw;
      const labeled = keys.map((k: string) => {
        
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

      const autoSelectedFields = selectFieldsBasedOnAnalysis(analysis, keys);
      setSelectedFields(autoSelectedFields);

      const autoConfig = generateDisplayConfig(analysis, autoSelectedFields);
      if (autoConfig) {
        setDisplayConfig(autoConfig);
      }

      setTestSuccess(true);
    } catch (error: any) {
      setNotification({
        type: 'error',
        title: 'API Test Failed',
        message: error.message || 'Failed to connect to the API. Please check the URL and try again.'
      });
      setTestSuccess(false);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, refresh]);

  const handleAddWidget = useCallback(() => {
    if (!testSuccess) {
      setNotification({
        type: 'warning',
        title: 'API Not Tested',
        message: 'Please test the API connection before adding the widget.'
      });
      return;
    }
    if (!selectedFields.length) {
      setNotification({
        type: 'warning',
        title: 'No Fields Selected',
        message: 'Please select at least one field to display in the widget.'
      });
      return;
    }
    if (!displayConfig) {
      setNotification({
        type: 'warning',
        title: 'No Display Mode',
        message: 'Please choose how you want to display the widget data.'
      });
      return;
    }

    const id = crypto.randomUUID();
    startTransition(() => {
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
    });
  }, [testSuccess, selectedFields, displayConfig, dispatch, name, apiUrl, refresh, rawData, flattenedData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white font-medium transition-colors text-sm sm:text-base px-2 sm:px-4 py-2 whitespace-nowrap">
          <span className="hidden sm:inline">+ Add Widget</span>
          <span className="sm:hidden">+ Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl bg-gray-800 text-white border-gray-700 rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto z-100">
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

          {/* API URL EDITOR */}
          <URLParameterEditor
            value={apiUrl}
            onChange={setApiUrl}
            placeholder="https://finnhub.io/api/v1/quote?symbol=AAPL&token=..."
            onTest={handleTest}
            testLoading={loading}
          />

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

        <Separator className="bg-gray-600 my-4" />
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

      {/* Notification Dialog */}
      {notification && (
        <Dialog open={!!notification} onOpenChange={() => setNotification(null)}>
          <DialogContent className="bg-gray-900 text-white max-w-md border-gray-700">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 ${
                notification.type === 'error' ? 'text-red-400' : 
                notification.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {notification.type === 'error' ? '❌' : notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                {notification.title}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-300">{notification.message}</p>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setNotification(null)}
                className={`${
                  notification.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                  notification.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
});

export { WidgetBuilder };