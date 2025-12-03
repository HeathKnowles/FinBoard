"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
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
  const { ref, rect } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (!rect) return;

    const width = rect.width;
    const height = 260;

    const svg = d3
      .select(containerRef.current)
      .html("") // clear old
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // parse x as date OR number
    const parseX =
      typeof data[0][xField] === "string"
        ? (d: any) => new Date(d[xField])
        : (d: any) => d[xField];

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, parseX) as [Date, Date])
      .range([40, width - 20]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d[yField])!])
      .nice()
      .range([height - 20, 20]);

    const lineGen = d3
      .line<any>()
      .x((d) => x(parseX(d)))
      .y((d) => y(d[yField]))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4ade80")
      .attr("stroke-width", 2)
      .attr("d", lineGen as any);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - 20})`)
      .call(d3.axisBottom(x).ticks(6));

    svg.append("g").attr("transform", "translate(40,0)").call(d3.axisLeft(y));
  }, [rect, data]);

  return <div ref={ref}><div ref={containerRef}></div></div>;
}
