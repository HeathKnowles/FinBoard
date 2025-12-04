"use client";

import { useState, useMemo, useCallback, lazy, Suspense, memo, startTransition } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import dynamic from "next/dynamic";
import { removeWidget, updateWidgetConfig, updateWidgetData } from "@/store/widgetsSlice";
import { timeAgo } from "@/lib/timeAgo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

// Lazy load heavy components
const WidgetRenderer = dynamic(() => import("@/components/widgetRenderer"), {
  loading: () => <div className="h-full bg-gray-800 rounded animate-pulse flex items-center justify-center text-gray-400">Loading widget...</div>,
  ssr: false,
});

const GridLayout = dynamic(() => import("react-grid-layout"), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">Loading layout...</div>,
  ssr: false,
});

const DisplayModeBuilder = dynamic(() => import("@/components/displayModeBuilder"), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse" />,
  ssr: false,
});

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const getCacheManager = () => import("@/lib/cacheManager").then(mod => mod.cacheManager);

const WidgetHeader = memo(function WidgetHeader({ 
  widget, 
  onConfig, 
  onRefresh, 
  onRemove 
}: { 
  widget: any; 
  onConfig: () => void; 
  onRefresh: () => void; 
  onRemove: () => void; 
}) {
  return (
    <div className="widget-header p-2 bg-gray-800 flex justify-between items-center cursor-move select-none">
      <span className="font-semibold">{widget.name}</span>

      <div className="flex items-center gap-3">
        {(widget.cached || widget.stale || widget.fromFallback) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  widget.fromFallback 
                    ? 'bg-orange-900/30 text-orange-400 border border-orange-700/50' 
                    : widget.stale 
                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
                    : 'bg-green-900/30 text-green-400 border border-green-700/50'
                }`}>
                  {widget.fromFallback ? '⚠' : widget.stale ? '📄' : '⚡'}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {widget.fromFallback 
                  ? 'Using fallback data (API unavailable)' 
                  : widget.stale 
                  ? 'Data is stale (cached)' 
                  : widget.cached
                  ? 'Fresh cached data'
                  : 'Live data'
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={onRefresh}
                className="text-xs px-2"
              >
                🔄
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Force refresh (bypass cache)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          size="sm"
          variant="secondary"
          onClick={onConfig}
        >
          ⚙
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={onRemove}
        >
          ✕
        </Button>
      </div>
    </div>
  );
});

const DashboardGrid = memo(function DashboardGrid() {
  const dispatch = useAppDispatch();
  const widgets = useAppSelector((state) => state.widgets.widgets);

  const [editingWidget, setEditingWidget] = useState<any>(null);
  const [tempConfig, setTempConfig] = useState<any>(null);

  const layout = useMemo(() => 
    widgets.map((w, index) => ({
      i: w.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 4,
      w: 4,
      h: 5,
    })), [widgets]
  );

  const openConfig = useCallback((widget: any) => {
    startTransition(() => {
      setEditingWidget(widget);
      setTempConfig(widget.config);
    });
  }, []);

  const saveConfig = useCallback(() => {
    if (!editingWidget || !tempConfig) return;
    startTransition(() => {
      dispatch(updateWidgetConfig({ id: editingWidget.id, config: tempConfig }));
      setEditingWidget(null);
    });
  }, [editingWidget, tempConfig, dispatch]);

  const forceRefreshWidget = useCallback(async (widget: any) => {
    try {
      const cacheManagerModule = await getCacheManager();
      const result = await cacheManagerModule.forceRefreshWidget(widget.apiUrl, widget.refresh);
      
      const preparedData = Array.isArray(result.raw) ? result.raw : [result.raw];
      
      startTransition(() => {
        dispatch(updateWidgetData({
          id: widget.id,
          data: preparedData,
          flattened: result.flattened,
          cached: result.cached,
          stale: result.stale,
          fromFallback: result.fromFallback,
        }));
      });
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  }, [dispatch]);

  const removeWidgetHandler = useCallback((widgetId: string) => {
    startTransition(() => {
      dispatch(removeWidget(widgetId));
    });
  }, [dispatch]);

  if (widgets.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-400 text-lg mb-4">No widgets yet</div>
        <div className="text-sm text-gray-500">Add your first widget to get started</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: widgets.length }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        }>
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={30}
            width={1200}
            draggableHandle=".widget-header"
            useCSSTransforms={true} 
            preventCollision={true}
            compactType="vertical"
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="border rounded bg-gray-900 text-white overflow-hidden will-change-transform" // Hardware acceleration
              >
                <WidgetHeader
                  widget={widget}
                  onConfig={() => openConfig(widget)}
                  onRefresh={() => forceRefreshWidget(widget)}
                  onRemove={() => removeWidgetHandler(widget.id)}
                />

                <div className="p-3">
                  <Suspense fallback={
                    <div className="h-32 bg-gray-800 rounded animate-pulse flex items-center justify-center">
                      <div className="text-gray-400 text-sm">Loading widget data...</div>
                    </div>
                  }>
                    <WidgetRenderer
                      config={widget.config}
                      data={widget.data}
                    />
                  </Suspense>
                </div>
              </div>
            ))}
          </GridLayout>
        </Suspense>
      </div>

      {editingWidget && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center">Loading...</div>}>
          <Dialog
            open={!!editingWidget}
            onOpenChange={() => setEditingWidget(null)}
          >
            <DialogContent className="bg-gray-900 text-white max-w-xl">
              <DialogHeader>
                <DialogTitle>Edit Widget Configuration</DialogTitle>
              </DialogHeader>

              <Suspense fallback={<div className="h-32 bg-gray-700 rounded animate-pulse" />}>
                <DisplayModeBuilder
                  fields={Object.keys(editingWidget.flattened || {})}
                  value={tempConfig}
                  onChange={(cfg) => setTempConfig(cfg)}
                />
              </Suspense>

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
        </Suspense>
      )}
    </>
  );
});

export default DashboardGrid;
