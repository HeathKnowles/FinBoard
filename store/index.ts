import { configureStore, combineReducers } from "@reduxjs/toolkit";
import layoutReducer from "@/store/layoutSlice"
import dashboardReducer from "./dashboardSlice";
import themeReducer from "./themeSlice";
import { loadState, saveState } from "./persist";

let preloadedState: any = undefined;

if (typeof window !== "undefined") {
  preloadedState = loadState();
}

const rootReducer = combineReducers({
  layout: layoutReducer,
  dashboard: dashboardReducer,
  theme: themeReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    saveState(store.getState());
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
