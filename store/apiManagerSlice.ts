import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ApiCache {
  timestamp: number;
  data: any;
}

export interface ApiManagerState {
  apiKeys: Record<string, string>;
  cache: Record<string, ApiCache>;
  errors: Record<string, string>;
}

const initialState: ApiManagerState = {
  apiKeys: {},
  cache: {},
  errors: {},
};

export const apiManagerSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    setApiKey: (
      state,
      action: PayloadAction<{ provider: string; key: string }>
    ) => {
      const { provider, key } = action.payload;
      state.apiKeys[provider] = key;
    },

    cacheApiResponse: (
      state,
      action: PayloadAction<{ url: string; data: any }>
    ) => {
      const { url, data } = action.payload;
      state.cache[url] = { timestamp: Date.now(), data };
    },

    setApiError: (
      state,
      action: PayloadAction<{ url: string; error: string }>
    ) => {
      const { url, error } = action.payload;
      state.errors[url] = error;
    },
  },
});

export const { setApiKey, cacheApiResponse, setApiError } =
  apiManagerSlice.actions;

export default apiManagerSlice.reducer;
