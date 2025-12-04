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
  if (!config || !data || !Array.isArray(data) || data.length === 0) return null;

  const sample = data[0];
  
  // Smart field detection for different chart types
  const x = config.xField ?? 
    Object.keys(sample).find(k => k === 'x' || k.includes('time') || k.includes('date')) ?? 
    Object.keys(sample)[0] ?? "x";
    
  const y = config.yField ?? 
    Object.keys(sample).find(k => k === 'close' || k === 'price' || k === 'value') ??
    Object.keys(sample)[1] ?? "y";

  if (config.type === "line") {
    return <D3LineChart data={data} xField={x} yField={y} />;
  }

  if (config.type === "area") {
    return <D3AreaChart data={data} xField={x} yField={y} />;
  }

  if (config.type === "candle") {
    // Enhanced OHLC field detection
    const xField = config.xField ?? 
      Object.keys(sample).find(k => k === 'x' || k.includes('time') || k.includes('date')) ?? 
      'x';
      
    const openField = config.openField ?? 
      Object.keys(sample).find(k => k === 'open' || k === 'o') ?? 'open';
      
    const highField = config.highField ?? 
      Object.keys(sample).find(k => k === 'high' || k === 'h') ?? 'high';
      
    const lowField = config.lowField ?? 
      Object.keys(sample).find(k => k === 'low' || k === 'l') ?? 'low';
      
    const closeField = config.closeField ?? 
      Object.keys(sample).find(k => k === 'close' || k === 'c') ?? 'close';

    return (
      <D3CandleChart
        data={data}
        xField={xField}
        openField={openField}
        highField={highField}
        lowField={lowField}
        closeField={closeField}
      />
    );
  }

  if (config.type === "bar") {
    return <div className="flex items-center justify-center h-32 text-gray-400">Bar chart not implemented yet</div>;
  }

  return <div className="flex items-center justify-center h-32 text-gray-400">Unknown chart type: {config.type}</div>;
}
