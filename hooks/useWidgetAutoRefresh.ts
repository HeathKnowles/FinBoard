"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateWidgetData } from "@/store/widgetsSlice";

export function useWidgetAutoRefresh() {
  const dispatch = useAppDispatch();
  const widgets = useAppSelector((state) => state.widgets.widgets);

  useEffect(() => {
    const urlGroups = widgets.reduce((acc, widget) => {
      if (!widget.refresh || !widget.apiUrl) return acc;
      
      if (!acc[widget.apiUrl]) {
        acc[widget.apiUrl] = {
          widgets: [],
          refreshInterval: widget.refresh
        };
      }
      
      acc[widget.apiUrl].widgets.push(widget);
      acc[widget.apiUrl].refreshInterval = Math.min(
        acc[widget.apiUrl].refreshInterval,
        widget.refresh
      );
      
      return acc;
    }, {} as Record<string, { widgets: typeof widgets, refreshInterval: number }>);

    const intervals: NodeJS.Timeout[] = [];

    Object.entries(urlGroups).forEach(([url, group]) => {
      const intervalMs = group.refreshInterval * 1000;

      const intervalId = setInterval(async () => {
        try {
          const res = await fetch("/api/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              url: url,
              refreshInterval: group.refreshInterval,
              maxAge: group.refreshInterval * 60,
            }),
          });

          const json = await res.json();
          if (!json.success) return;

          const preparedData = Array.isArray(json.raw)
            ? json.raw
            : [json.raw];

          group.widgets.forEach((widget) => {
            dispatch(
              updateWidgetData({
                id: widget.id,
                data: preparedData,
                flattened: json.flattened,
                cached: json.cached,
                stale: json.stale,
                fromFallback: json.fromFallback,
              })
            );
          });
        } catch (err) {
          console.error(`Auto-refresh failed for ${url}:`, err);
        }
      }, intervalMs);

      intervals.push(intervalId);
    });

    return () => {
      intervals.forEach((id) => clearInterval(id));
    };
  }, [widgets.length, dispatch]);
}
