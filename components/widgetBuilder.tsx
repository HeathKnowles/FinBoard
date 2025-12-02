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
          <div className="grid gap-2">
            <Label htmlFor="apiurl">API Url</Label>
            <div className="flex justify-between items-center gap-2">
              <Input id="apiurl" name="apiurl" />
              <Button className="bg-green-500">
                <Image src="/test.png" width={25} height={25} alt="Test" />
                Test
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="refint">Refresh Interval (seconds)</Label>
            <Input id="refint" name="refint" />
          </div>
          <div className="grid gap-3">
            <Label>Select Fields to Display</Label>
            <Label htmlFor="dymode">Display Mode</Label>
            <DisplayMode />
          </div>
          <div className="grid gap-2">
            <Label>Search Field</Label>
            <Input id="srchfld" />
            <div className="flex items-center space-x-2">
              <Checkbox id="array" />
              <Label htmlFor="array">Show arrays only (for table views)</Label>
            </div>
          </div>
          <FieldsSelector />
          <Separator />
          <div className="flex items-center justify-end gap-2">
            <Button className="bg-gray-500">Cancel</Button>
            <Button className="bg-green-500">Add Widget</Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}

