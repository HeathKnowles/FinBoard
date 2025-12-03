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
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { DisplayMode } from "./displayMode";
import FieldsSelector from "./fieldSelector";

export function WidgetBuilder() {
  const [testSuccess, setTestSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rawData, setRawData] = useState<any>(null);
  const [flattenedData, setFlattenedData] = useState<any>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  async function handleTest() {
    const form = new FormData(document.querySelector("form")!);
    const apiUrl = form.get("apiurl");

    if (!apiUrl) {
      alert("Please enter an API URL");
      return;
    }

    setLoading(true);
    setTestSuccess(false);

    try {
      const res = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: apiUrl,
          method: "GET",
          headers: {},
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      // Save data
      setRawData(json.raw);
      setFlattenedData(json.flattened);
      setSelectedFields([]);

      setTestSuccess(true);
    } catch (err: any) {
      alert("Test failed: " + err.message);
      setTestSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-green-500">
            + Add Widget
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-100vh bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Add New Widget</DialogTitle>
          </DialogHeader>

          <Separator />

          <div className="grid gap-2">
            <Label htmlFor="wtname">Widget Name</Label>
            <Input id="wtname" name="wtname" />
          </div>

          <div className="grid gap-2 mt-2">
            <Label htmlFor="apiurl">API URL</Label>
            <div className="flex justify-between items-center gap-2">
              <Input id="apiurl" name="apiurl" />

              <Button
                className="bg-green-500"
                type="button"
                onClick={handleTest}
              >
                <Image src="/test.png" width={25} height={25} alt="Test" />
                {loading ? "Testing..." : "Test"}
              </Button>
            </div>
          </div>

          <div className="grid gap-2 mt-2">
            <Label htmlFor="refint">Refresh Interval (seconds)</Label>
            <Input id="refint" name="refint" />
          </div>

    
          {testSuccess && (
            <>
              <Separator className="my-4" />

              <div className="grid gap-3">
                <Label>Select Fields to Display</Label>
                <Label htmlFor="dymode">Display Mode</Label>
                <DisplayMode raw={rawData} flattened={flattenedData} />
              </div>

              {/* SEARCH FIELD */}
              <div className="grid gap-2 mt-3">
                <Label>Search Field</Label>
                <Input id="srchfld" />

                <div className="flex items-center space-x-2">
                  <Checkbox id="array" />
                  <Label htmlFor="array">Show arrays only (for table views)</Label>
                </div>
              </div>

              <FieldsSelector
                fields={flattenedData ? Object.keys(flattenedData) : []}
                onChange={(sel) => setSelectedFields(sel)}
              />
            </>
          )}

          <Separator className="my-4" />

          <DialogFooter className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button className="bg-gray-500">Cancel</Button>
            </DialogClose>

            <Button className="bg-green-500">
              Add Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
