"use client";

import * as d3 from "d3";
import { useEffect, useRef, useCallback } from "react";
import { useResizeObserver } from "@/hooks/useResizeObserver";

export default function D3LineChart({
  data,
  xField,
  yField,
}: {
  data: any[];
  xField: string;
  yField: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref: measureRef, rect } = useResizeObserver<HTMLDivElement>();

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      measureRef(node);
    },
    [measureRef]
  );

  useEffect(() => {
    if (!rect || !containerRef.current) return;

    const width = Math.max(200, rect.width);
    const height = Math.max(150, Math.round(width * 0.45));
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(containerRef.current)
      .html("") 
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .style("width", "100%")
      .style("height", "auto");

    const sample = data[0]?.[xField];
    const isDateX = typeof sample === "string" || sample instanceof Date;
    const parseX = isDateX ? (d: any) => new Date(d[xField]) : (d: any) => +d[xField];

    let x: any;
    let bottomAxis: any;

    if (isDateX) {
      const extent = d3.extent(data, (d: any) => new Date(d[xField]));
      const start = extent[0] ?? new Date();
      const end = extent[1] ?? start;
      x = d3.scaleTime().domain([start, end] as [Date, Date]).range([0, innerWidth]);
      bottomAxis = d3.axisBottom<Date>(x).ticks(6).tickFormat(d3.timeFormat("%m-%d") as any);
    } else {
      const extent = d3.extent(data, (d: any) => +d[xField]);
      const start = (extent[0] ?? 0) as number;
      const end = (extent[1] ?? start) as number;
      x = d3.scaleLinear().domain([start, end] as [number, number]).range([0, innerWidth]);
      bottomAxis = d3.axisBottom<number>(x).ticks(6);
    }

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(0, d3.max(data, (d) => +d[yField]) ?? 0)])
      .nice()
      .range([innerHeight, 0]);

    const lineGen = d3
      .line<any>()
      .x((d) => x(parseX(d)))
      .y((d) => y(+d[yField]))
      .curve(d3.curveMonotoneX);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4ade80")
      .attr("stroke-width", 2)
      .attr("d", lineGen as any);

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(bottomAxis as any);

    g.append("g").call(d3.axisLeft(y));
  }, [rect, data, xField, yField]);

  return <div ref={combinedRef} />;
}
