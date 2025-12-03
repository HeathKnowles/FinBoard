import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DisplayConfig } from "@/types/display";

export interface Widget {
  id: string;
  name: string;
  apiUrl: string;
  refresh: number;
  config: DisplayConfig;
  data: any[];            
  flattened?: any;     
  lastUpdated: number;
}

interface WidgetsState {
  widgets: Widget[];
  layout: any[];
}

const initialState: WidgetsState = {
  widgets: [],
  layout: [],
};

export const widgetsSlice = createSlice({
  name: "widgets",
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<Omit<Widget, "lastUpdated">>) => {
      state.widgets.push({
        ...action.payload,
        lastUpdated: Date.now(),
      });
    },

    updateWidgetData: (
      state,
      action: PayloadAction<{ id: string; data: any[]; flattened: any }>
    ) => {
      const widget = state.widgets.find((w) => w.id === action.payload.id);
      if (widget) {
        widget.data = action.payload.data;
        widget.flattened = action.payload.flattened;
        widget.lastUpdated = Date.now();
      }
    },

    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter((w) => w.id !== action.payload)
    },

    updateWidgetConfig: (
      state,
      action: PayloadAction<{id: string; config:DisplayConfig}>
    ) => {
      const w = state.widgets.find((x) => x.id === action.payload.id);
      if (w) w.config = action.payload.config;
    },
    setLayout: (state, action: PayloadAction<any[]>) => {
      state.layout = action.payload;
    },
    resetLayout: (state) => {
      state.layout = [];
    },
  },
});

export const { 
  addWidget,
  removeWidget,
  updateWidgetData,
  updateWidgetConfig,
  setLayout,
  resetLayout } = widgetsSlice.actions;
export default widgetsSlice.reducer;
