import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WidgetLayout = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "table" | "card" | "chart";
  configId: string;
};

export interface LayoutState {
  widgets: Record<string, WidgetLayout>;
  order: string[];
}

const initialState: LayoutState = {
  widgets: {},
  order: [],
};

export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<WidgetLayout>) => {
      const widget = action.payload;
      state.widgets[widget.id] = widget;
      state.order.push(widget.id);
    },

    removeWidget: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.widgets[id];
      state.order = state.order.filter((wid) => wid !== id);
    },

    updateWidgetPosition: (
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) => {
      const { id, x, y } = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].x = x;
        state.widgets[id].y = y;
      }
    },

    updateWidgetSize: (
      state,
      action: PayloadAction<{ id: string; w: number; h: number }>
    ) => {
      const { id, w, h } = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].w = w;
        state.widgets[id].h = h;
      }
    },

    reorderWidgets: (state, action: PayloadAction<string[]>) => {
      state.order = action.payload;
    },
  },
});

export const {
  addWidget,
  removeWidget,
  updateWidgetPosition,
  updateWidgetSize,
  reorderWidgets,
} = layoutSlice.actions;

export default layoutSlice.reducer;
