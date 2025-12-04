"use client";

import { useEffect, Suspense, startTransition } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import dynamic from "next/dynamic";
import { setLayout } from "@/store/widgetsSlice";
import { useWidgetAutoRefresh } from "@/hooks/useWidgetAutoRefresh";

const DashboardGrid = dynamic(() => import("@/components/dashboardGrid"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
      ))}
    </div>
  ),
  ssr: false, 
});

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const savedLayout = useAppSelector((state) => state.widgets.layout);

  useWidgetAutoRefresh();

  useEffect(() => {
    if (savedLayout?.length > 0) {

      startTransition(() => {
        dispatch(setLayout(savedLayout));
      });
    }
  }, [savedLayout, dispatch]);

  return (
    <div className="min-h-screen p-4 bg-gray-950 text-white relative">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading widget {i + 1}...</div>
            </div>
          ))}
        </div>
      }>
        <DashboardGrid />
      </Suspense>
    </div>
  );
}
