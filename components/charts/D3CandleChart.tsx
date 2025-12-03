"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
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
  const { ref, rect } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (!rect) return;

    const width = rect.width;
    const height = 300;

    const svg = d3
      .select(containerRef.current)
      .html("")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const parseX = (d: any) => new Date(d[xField]);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => parseX(d).toString()))
      .range([50, width - 20])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[lowField])!,
        d3.max(data, (d) => d[highField])!,
      ])
      .range([height - 20, 20]);

    // Draw candles
    svg
      .selectAll(".candle")
      .data(data)
      .enter()
      .append("g")
      .each(function (d) {
        const group = d3.select(this);
        const xCenter = x(parseX(d).toString())!;

        // Wick
        group
          .append("line")
          .attr("x1", xCenter)
          .attr("x2", xCenter)
          .attr("y1", y(d[highField]))
          .attr("y2", y(d[lowField]))
          .attr("stroke", "white");

        // Body
        group
          .append("rect")
          .attr("x", xCenter - x.bandwidth() / 2)
          .attr("width", x.bandwidth())
          .attr("y", y(Math.max(d[openField], d[closeField])))
          .attr("height", Math.abs(y(d[openField]) - y(d[closeField])))
          .attr("fill", d[closeField] >= d[openField] ? "#4ade80" : "#ef4444");
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height - 20})`)
      .call(d3.axisBottom(x).tickFormat((t) => d3.timeFormat("%m-%d")(new Date(t))));

    svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(y));
  }, [rect, data]);

  return <div ref={ref}><div ref={containerRef}></div></div>;
}
