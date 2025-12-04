"use client";

import * as d3 from "d3";
import { useEffect, useRef, useCallback } from "react";
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

    const parseX = (d: any) => new Date(d[xField]);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, parseX) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(0, d3.max(data, (d) => +d[yField]) ?? 0)])
      .nice()
      .range([innerHeight, 0]);

    const area = d3
      .area<any>()
      .x((d) => x(parseX(d)))
      .y0(y(0))
      .y1((d) => y(+d[yField]))
      .curve(d3.curveMonotoneX);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("path")
      .datum(data)
      .attr("fill", "#4ade8055")
      .attr("stroke", "#4ade80")
      .attr("stroke-width", 2)
      .attr("d", area as any);

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(6));

    g.append("g").call(d3.axisLeft(y));
  }, [rect, data, xField, yField]);

  return <div ref={combinedRef} />;
}
