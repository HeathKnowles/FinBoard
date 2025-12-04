"use client";

import { useEffect, Suspense, startTransition } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import dynamic from "next/dynamic";
import { setLayout } from "@/store/widgetsSlice";
import { useWidgetAutoRefresh } from "@/hooks/useWidgetAutoRefresh";

const DashboardGrid = dynamic(() => import("@/components/DashboardGrid"), {
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
    <div className="bg-gray-950 text-white">
      <div className="p-2 sm:p-4 lg:p-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">Dashboard</h1>
      </div>

      <Suspense fallback={
        <div className="p-2 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 sm:h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-gray-400 text-sm sm:text-base">Loading widget {i + 1}...</div>
              </div>
            ))}
          </div>
        </div>
      }>
        <DashboardGrid />
      </Suspense>
    </div>
  );
}
