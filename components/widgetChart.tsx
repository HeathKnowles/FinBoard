"use client";

import type { ChartConfig } from "@/types/display";

import D3LineChart from "@/components/charts/D3LineChart";
import D3AreaChart from "@/components/charts/D3AreaChart";
import D3CandleChart from "@/components/charts/D3CandleChart";

interface WidgetChartProps {
  config: ChartConfig;
  data: any[];
}

export default function WidgetChart({ config, data }: WidgetChartProps) {
  if (!config || !data) return null;

  const x = config.xField ?? Object.keys(data[0] || {})[0] ?? "x";
  const y = config.yField ?? Object.keys(data[0] || {})[1] ?? "y";

  if (config.type === "line") {
    return <D3LineChart data={data} xField={x} yField={y} />;
  }

  if (config.type === "area") {
    return <D3AreaChart data={data} xField={x} yField={y} />;
  }

  if (config.type === "candle") {
    return (
      <D3CandleChart
        data={data}
        xField={x}
        openField={config.openField ?? "open"}
        highField={config.highField ?? "high"}
        lowField={config.lowField ?? "low"}
        closeField={config.closeField ?? "close"}
      />
    );
  }

  if (config.type === "bar") {
    return <div>Bar chart not implemented yet</div>;
  }

  return null;
}
