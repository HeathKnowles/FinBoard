"use client";

import { addWidget } from "@/store/layoutSlice";
import { useAppDispatch } from "@/store/hooks";
import DashboardGrid from "@/components/DashboardGrid";

export default function Page() {
  const dispatch = useAppDispatch();

  return (
    <div className="p-6">
      <button
        className="p-2 bg-blue-500 text-white rounded"
        onClick={() =>
          dispatch(
            addWidget({
              id: "widget-" + Date.now(),
              x: 0,
              y: 0,
              w: 3,
              h: 4,
              type: "card",
              configId: "cfg-" + Date.now(),
            })
          )
        }
      >
        Add Widget
      </button>

      <DashboardGrid />
    </div>
  );
}
