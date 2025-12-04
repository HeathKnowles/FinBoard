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

import { useRealTimeConnection } from "@/hooks/useRealTimeWidget";

const getCacheManager = () => import("@/lib/cacheManager").then(mod => mod.cacheManager);

const RealTimeWidgetWrapper = dynamic(() => import("@/components/realTimeWidgetWrapper"), {
  loading: () => <></>,
  ssr: false,
});

const WidgetHeader = memo(function WidgetHeader({ 
  widget, 
  onConfig, 
  onRefresh, 
  onRemove,
  isConnected
}: { 
  widget: any; 
  onConfig: () => void; 
  onRefresh: () => void; 
  onRemove: () => void; 
  isConnected: boolean;
}) {
  return (
    <div className="widget-header p-2 bg-gray-800 flex justify-between items-center cursor-move select-none" style={{ position: 'relative' }}>
      <span className="font-semibold">{widget.name}</span>

      <div 
        className="flex items-center gap-3 react-grid-layout-no-drag" 
        style={{ 
          pointerEvents: 'auto', 
          position: 'relative', 
          zIndex: 10,
          isolation: 'isolate'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Real-time status indicator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isConnected
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-700/50'
                  : 'bg-gray-900/30 text-gray-400 border border-gray-700/50'
              }`}>
                {isConnected ? '🔴' : '⚫'}
              </span>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              {isConnected ? 'Real-time updates active' : 'Real-time updates offline'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
              Updated at: {new Date(widget.lastUpdated).toISOString().split('T')[1].split('.')[0]}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="text-xs px-2 pointer-events-auto select-none"
                style={{ touchAction: 'manipulation' }}
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
          onClick={(e) => {
            e.stopPropagation();
            onConfig();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="pointer-events-auto select-none"
          style={{ touchAction: 'manipulation' }}
        >
          ⚙
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="pointer-events-auto select-none min-w-8 h-8"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          aria-label="Delete widget"
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
  const { isConnected } = useRealTimeConnection();

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

  const [deleteConfirmWidget, setDeleteConfirmWidget] = useState<string | null>(null);

  const removeWidgetHandler = useCallback((widgetId: string) => {
    setDeleteConfirmWidget(widgetId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirmWidget) {
      dispatch(removeWidget(deleteConfirmWidget));
      setDeleteConfirmWidget(null);
    }
  }, [deleteConfirmWidget, dispatch]);

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
                className="border rounded bg-gray-900 text-white overflow-hidden will-change-transform relative" // Hardware acceleration + relative for real-time indicator
              >
                <RealTimeWidgetWrapper widget={widget}>
                  <WidgetHeader
                    widget={widget}
                    onConfig={() => openConfig(widget)}
                    onRefresh={() => forceRefreshWidget(widget)}
                    onRemove={() => removeWidgetHandler(widget.id)}
                    isConnected={isConnected}
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
                </RealTimeWidgetWrapper>
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmWidget && (
        <Dialog
          open={!!deleteConfirmWidget}
          onOpenChange={() => setDeleteConfirmWidget(null)}
        >
          <DialogContent className="bg-gray-900 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete Widget</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-300">
                Are you sure you want to remove this widget? This action cannot be undone.
              </p>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmWidget(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Widget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});

export default DashboardGrid;
