"use client";

import { Responsive, WidthProvider } from "react-grid-layout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateLayout, removeWidget } from "@/store/widgetsSlice";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardGrid() {
  const dispatch = useAppDispatch();
  const layout = useAppSelector((s) => s.widgets.layout);
  const widgets = useAppSelector((s) => s.widgets.widgets);

  return (
    <div className="p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        rowHeight={30}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={(current) => {
          dispatch(updateLayout(current));
        }}
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="border bg-gray-900 text-white rounded-md shadow-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-2 bg-gray-700">
              <span className="font-semibold widget-drag-handle cursor-move">
                Widget {widget.id}
              </span>

              <button
                onClick={() => dispatch(removeWidget(widget.id))}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>

            <div className="p-3">
              <pre className="text-xs opacity-70">
                {JSON.stringify(widget.data || {}, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
