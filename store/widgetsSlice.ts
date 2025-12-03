import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Layout } from "react-grid-layout";

interface Widget {
  id: string;
  type: string;
  data?: any;
}

export interface WidgetsState {
  layout: Layout[];
  widgets: Widget[];
}

const initialState: WidgetsState = {
  layout: [],
  widgets: [],
};

export const widgetsSlice = createSlice({
  name: "widgets",
  initialState,
  reducers: {
    addWidget: (
      state,
      action: PayloadAction<{ id: string; w?: number; h?: number }>
    ) => {
      const { id, w = 4, h = 4 } = action.payload;

      state.widgets.push({ id, type: "generic" });

      state.layout.push({
        i: id,
        x: 0,
        y: Infinity,
        w,
        h,
      });
    },

    removeWidget: (state, action: PayloadAction<string>) => {
      const id = action.payload;

      state.widgets = state.widgets.filter((w) => w.id !== id);
      state.layout = state.layout.filter((l) => l.i !== id);
    },

    updateLayout: (state, action: PayloadAction<Layout[]>) => {
      state.layout = action.payload;
    },
  },
});

export const { addWidget, removeWidget, updateLayout } = widgetsSlice.actions;
export default widgetsSlice.reducer;
