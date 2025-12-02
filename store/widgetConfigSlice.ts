import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WidgetConfig = {
  id: string;
  apiUrl: string;
  method: "GET" | "POST";
  selectedFields: string[];
  refreshInterval: number;
  displayType: "table" | "card" | "chart";
  format?: Record<string, string>; 
};

export interface WidgetConfigState {
  configs: Record<string, WidgetConfig>;
}

const initialState: WidgetConfigState = {
  configs: {},
};

export const widgetConfigSlice = createSlice({
  name: "widgetConfigs",
  initialState,
  reducers: {
    createWidgetConfig: (state, action: PayloadAction<WidgetConfig>) => {
      const config = action.payload;
      state.configs[config.id] = config;
    },

    updateWidgetConfig: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<WidgetConfig>;
      }>
    ) => {
      const { id, updates } = action.payload;
      if (state.configs[id]) {
        state.configs[id] = { ...state.configs[id], ...updates };
      }
    },

    deleteWidgetConfig: (state, action: PayloadAction<string>) => {
      delete state.configs[action.payload];
    },
  },
});

export const {
  createWidgetConfig,
  updateWidgetConfig,
  deleteWidgetConfig,
} = widgetConfigSlice.actions;

export default widgetConfigSlice.reducer;
