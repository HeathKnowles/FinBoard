"use client";

import { memo, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import type { DisplayConfig } from "@/types/display";

const WidgetTable = dynamic(() => import("./widgetTable").then(mod => ({ default: mod.WidgetTable })), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse flex items-center justify-center text-gray-400">Loading table...</div>,
  ssr: false,
});

const WidgetFinanceCard = dynamic(() => import("./widgetCard"), {
  loading: () => <div className="h-24 bg-gray-700 rounded animate-pulse flex items-center justify-center text-gray-400">Loading cards...</div>,
  ssr: false,
});

const WidgetChart = dynamic(() => import("./widgetChart"), {
  loading: () => <div className="h-48 bg-gray-700 rounded animate-pulse flex items-center justify-center text-gray-400">Loading chart...</div>,
  ssr: false,
});

interface WidgetRendererProps {
  config: DisplayConfig;
  data: any[];
}

const WidgetRenderer = memo(function WidgetRenderer({ config, data }: WidgetRendererProps) {
  if (!config) {
    return (
      <div className="text-xs text-muted-foreground p-2 text-center">
        No configuration provided
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-muted-foreground p-4 text-center">
        <div className="mb-2">📊</div>
        <div>No data available</div>
      </div>
    );
  }

  if (config.mode === "table" && config.table) {
    return (
      <Suspense fallback={<div className="h-32 bg-gray-700 rounded animate-pulse" />}>
        <WidgetTable
          data={data}
          config={config.table}
        />
      </Suspense>
    );
  }

  if (config.mode === "cards" && config.cards) {
    return (
      <Suspense fallback={<div className="h-24 bg-gray-700 rounded animate-pulse" />}>
        <WidgetFinanceCard
          data={data}
          config={config.cards}
        />
      </Suspense>
    );
  }

  if (config.mode === "chart" && config.chart) {
    return (
      <Suspense fallback={<div className="h-48 bg-gray-700 rounded animate-pulse" />}>
        <WidgetChart
          data={data}
          config={config.chart}
        />
      </Suspense>
    );
  }

  return (
    <div className="text-xs text-yellow-400 p-4 text-center">
      <div className="mb-2">⚠️</div>
      <div>Unsupported widget mode: {config.mode}</div>
    </div>
  );
});

export default WidgetRenderer;
