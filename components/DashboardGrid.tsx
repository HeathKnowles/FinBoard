"use client";

import GridLayout, { Layout } from "react-grid-layout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateWidgetPosition,
  updateWidgetSize,
} from "@/store/layoutSlice";

export default function DashboardGrid() {
  const dispatch = useAppDispatch();
  const widgets = useAppSelector((state) => state.layout.widgets);
  const order = useAppSelector((state) => state.layout.order);

  const layout: Layout[] = order.map((id) => {
    const w = widgets[id];

    return {
      i: w.id,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
    };
  });

  const onLayoutChange = (updatedLayout: Layout[]) => {
    updatedLayout.forEach((item) => {
      dispatch(
        updateWidgetPosition({
          id: item.i,
          x: item.x,
          y: item.y,
        })
      );

      dispatch(
        updateWidgetSize({
          id: item.i,
          w: item.w,
          h: item.h,
        })
      );
    });
  };

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
    >
      {order.map((id) => {
        const widget = widgets[id];
        return (
          <div key={id} className="bg-zinc-800 text-white rounded-md p-2">
            <div className="drag-handle cursor-move font-semibold mb-2">
              :: Drag
            </div>

            <div>
              <p>Widget: {widget.id}</p>
              <p>Type: {widget.type}</p>
            </div>
          </div>
        );
      })}
    </GridLayout>
  );
}
