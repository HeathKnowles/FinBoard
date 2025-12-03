"use client";

import { WidgetTable } from "./widgetTable";
import WidgetFinanceCard from "./widgetCard";
import WidgetChart from "./widgetChart";
import type { DisplayConfig } from "@/types/display";

interface WidgetRendererProps {
  config: DisplayConfig;
  data: any[];
}

export default function WidgetRenderer({ config, data }: WidgetRendererProps) {
  if (!config || !data) {
    return (
      <div className="text-xs text-muted-foreground p-2">
        No config or data provided
      </div>
    );
  }

  if (config.mode === "table" && config.table) {
    return (
      <WidgetTable
        data={data}
        config={config.table}
      />
    );
  }

  if (config.mode === "cards" && config.cards) {
    return (
      <WidgetFinanceCard
        data={data}
        config={config.cards}
      />
    );
  }

  if (config.mode === "chart" && config.chart) {
    return (
      <WidgetChart
        data={data}
        config={config.chart}
      />
    );
  }

  return (
    <div className="text-xs text-yellow-400">
      Unsupported widget mode
    </div>
  );
}
