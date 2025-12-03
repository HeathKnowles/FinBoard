"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useResizeObserver } from "@/hooks/useResizeObserver";

export default function D3AreaChart({
  data,
  xField,
  yField,
}: {
  data: any[];
  xField: string;
  yField: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref, rect } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (!rect) return;

    const width = rect.width;
    const height = 260;

    const svg = d3
      .select(containerRef.current)
      .html("")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const parseX = (d: any) => new Date(d[xField]);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, parseX) as [Date, Date])
      .range([40, width - 20]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d[yField])!])
      .nice()
      .range([height - 20, 20]);

    const area = d3
      .area<any>()
      .x((d) => x(parseX(d)))
      .y0(y(0))
      .y1((d) => y(d[yField]))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "#4ade8055")
      .attr("stroke", "#4ade80")
      .attr("stroke-width", 2)
      .attr("d", area as any);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - 20})`)
      .call(d3.axisBottom(x).ticks(6));

    svg.append("g").attr("transform", "translate(40,0)").call(d3.axisLeft(y));
  }, [rect, data]);

  return <div ref={ref}><div ref={containerRef}></div></div>;
}
