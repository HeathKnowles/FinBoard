"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateWidgetData } from "@/store/widgetsSlice";

export function useWidgetAutoRefresh() {
  const dispatch = useAppDispatch();
  const widgets = useAppSelector((state) => state.widgets.widgets);

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []; // ⭐ Correct type

    widgets.forEach((widget) => {
      if (!widget.refresh || !widget.apiUrl) return;

      const intervalMs = widget.refresh * 1000;

      const intervalId = setInterval(async () => {
        try {
          const res = await fetch("/api/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              url: widget.apiUrl,
              refreshInterval: widget.refresh,
              maxAge: widget.refresh * 60, // Keep data valid for 60x refresh interval
            }),
          });

          const json = await res.json();
          if (!json.success) return;

          const preparedData = Array.isArray(json.raw)
            ? json.raw
            : [json.raw];

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
        } catch (err) {
          console.error("Auto-refresh failed:", err);
        }
      }, intervalMs);

      intervals.push(intervalId);
    });

    return () => {
      intervals.forEach((id) => clearInterval(id));
    };
  }, [widgets, dispatch]);
}
