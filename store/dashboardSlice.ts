import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DashboardState {
  lastSaved: number | null;
  imported: boolean;
}

const initialState: DashboardState = {
  lastSaved: null,
  imported: false,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    saveDashboard: (state) => {
      state.lastSaved = Date.now();
    },

    setImported: (state, action: PayloadAction<boolean>) => {
      state.imported = action.payload;
    },

    resetDashboardMeta: () => initialState,

    importDashboard: (state, _action: PayloadAction<unknown>) => {
      state.lastSaved = Date.now();
      state.imported = true;
    },

    loadDashboard: (state) => state,
  },
});

export const {
  saveDashboard,
  setImported,
  resetDashboardMeta,
  importDashboard,
  loadDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
