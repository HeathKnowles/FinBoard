"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import WidgetRenderer from "@/components/widgetRenderer";
import GridLayout from "react-grid-layout";
import { removeWidget, updateWidgetConfig } from "@/store/widgetsSlice";
import DisplayModeBuilder from "@/components/displayModeBuilder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { timeAgo } from "@/lib/timeAgo";
import { Button } from "@/components/ui/button";

import "react-grid-layout/css/styles.css";

export default function DashboardGrid() {
  const dispatch = useAppDispatch();
  const widgets = useAppSelector((state) => state.widgets.widgets);

  const [editingWidget, setEditingWidget] = useState<any>(null);
  const [tempConfig, setTempConfig] = useState<any>(null);

  const layout = widgets.map((w, index) => ({
    i: w.id,
    x: (index % 3) * 4,
    y: Math.floor(index / 3) * 4,
    w: 4,
    h: 5,
  }));

  function openConfig(widget: any) {
    setEditingWidget(widget);
    setTempConfig(widget.config);
  }

  function saveConfig() {
    if (!editingWidget || !tempConfig) return;
    dispatch(updateWidgetConfig({ id: editingWidget.id, config: tempConfig }));
    setEditingWidget(null);
  }

  return (
    <>
      <div className="p-4">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={1200}
          draggableHandle=".widget-header"
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="border rounded bg-gray-900 text-white overflow-hidden"
            >
              <div className="widget-header p-2 bg-gray-800 flex justify-between items-center cursor-move select-none">
                <span className="font-semibold">{widget.name}</span>

                <div className="flex items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs text-gray-400">
                          {timeAgo(widget.lastUpdated)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        Updated at: {new Date(widget.lastUpdated).toLocaleTimeString()}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openConfig(widget)}
                  >
                    ⚙
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => dispatch(removeWidget(widget.id))}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-3">
                <WidgetRenderer
                  config={widget.config}
                  data={widget.data}
                />
              </div>
            </div>
          ))}
        </GridLayout>
      </div>

      <Dialog
        open={!!editingWidget}
        onOpenChange={() => setEditingWidget(null)}
      >
        <DialogContent className="bg-gray-900 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Widget Configuration</DialogTitle>
          </DialogHeader>

          {editingWidget && (
            <DisplayModeBuilder
              fields={Object.keys(editingWidget.flattened)}
              onChange={(cfg) => setTempConfig(cfg)}
            />
          )}

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setEditingWidget(null)}
            >
              Cancel
            </Button>
            <Button className="bg-green-600" onClick={saveConfig}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
