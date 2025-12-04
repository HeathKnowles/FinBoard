"use client";

import * as d3 from "d3";
import { useEffect, useRef, useCallback } from "react";
import { useResizeObserver } from "@/hooks/useResizeObserver";

export default function D3CandleChart({
  data,
  xField,
  openField,
  highField,
  lowField,
  closeField,
}: {
  data: any[];
  xField: string;
  openField: string;
  highField: string;
  lowField: string;
  closeField: string;
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

    const width = Math.max(300, rect.width);
    const height = Math.max(180, Math.round(width * 0.55));
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
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
      .scaleBand()
      .domain(data.map((d) => parseX(d).toString()))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[lowField]) ?? 0,
        d3.max(data, (d) => d[highField]) ?? 0,
      ])
      .nice()
      .range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll(".candle")
      .data(data)
      .enter()
      .append("g")
      .each(function (d) {
        const group = d3.select(this);
        const xCenter = x(parseX(d).toString())! + x.bandwidth() / 2;

        group
          .append("line")
          .attr("x1", xCenter)
          .attr("x2", xCenter)
          .attr("y1", y(d[highField]))
          .attr("y2", y(d[lowField]))
          .attr("stroke", "white");

        group
          .append("rect")
          .attr("x", xCenter - x.bandwidth() / 2)
          .attr("width", x.bandwidth())
          .attr("y", y(Math.max(d[openField], d[closeField])))
          .attr("height", Math.abs(y(d[openField]) - y(d[closeField])))
          .attr("fill", d[closeField] >= d[openField] ? "#4ade80" : "#ef4444");
      });

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(
      d3.axisBottom(x).tickFormat((t) => d3.timeFormat("%m-%d")(new Date(t)))
    );

    g.append("g").call(d3.axisLeft(y));
  }, [rect, data, xField, openField, highField, lowField, closeField]);

  return <div ref={combinedRef} />;
}
