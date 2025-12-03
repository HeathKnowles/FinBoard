"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import DashboardGrid from "@/components/dashboardGrid";
import { setLayout } from "@/store/widgetsSlice";
import { useWidgetAutoRefresh } from "@/hooks/useWidgetAutoRefresh";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const savedLayout = useAppSelector((state) => state.widgets.layout);

  useWidgetAutoRefresh();

  useEffect(() => {
    if (savedLayout?.length > 0) {
      dispatch(setLayout(savedLayout));
    }
  }, [savedLayout, dispatch]);

  return (
    <div className="min-h-screen p-4 bg-gray-950 text-white relative">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <DashboardGrid />

   </div>
  );
}
