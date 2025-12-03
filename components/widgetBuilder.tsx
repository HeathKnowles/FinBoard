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
import { useAppDispatch } from "@/store/hooks";
import { addWidget } from "@/store/widgetsSlice";
import type { DisplayConfig } from "@/types/display";

export function WidgetBuilder() {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [refresh, setRefresh] = useState(60);

  const [loading, setLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [rawData, setRawData] = useState<any>(null);
  const [flattenedData, setFlattenedData] = useState<string[]>([]);

  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig | null>(null);

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
        body: JSON.stringify({ url: apiUrl }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setRawData(json.raw);
      setFlattenedData(
        json.flattened.filter(
          (key: string) => key && isNaN(Number(key))
        )
      );
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
      {/* <CHANGE> Improved responsive dialog with better max-width handling */}
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

              {/* STEP 1 – SELECT FIELDS */}
              <FieldsSelector
                fields={flattenedData}
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
                    fields={selectedFields}
                    onChange={(cfg) => setDisplayConfig(cfg)}
                  />
                </>
              )}
            </>
          )}
        </div>

        <Separator className="bg-gray-700 my-4" />
        {/* <CHANGE> Responsive footer with better mobile layout */}
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