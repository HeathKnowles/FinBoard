const PERSIST_KEY = "finboard_dashboard_state";

export const saveState = (state: unknown) => {
  try {
    const s = state as any;

    const serialized = JSON.stringify({
      layout: s.layout,
      widgetConfigs: s.widgetConfigs,
      api: s.api,
      theme: s.theme,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(PERSIST_KEY, serialized);
    }
  } catch (err) {
    console.error("Error saving dashboard:", err);
  }
};

export const loadState = (): any | undefined => {
  try {
    if (typeof window === "undefined") return undefined;

    const serialized = localStorage.getItem(PERSIST_KEY);
    if (!serialized) return undefined;

    return JSON.parse(serialized);
  } catch (err) {
    console.error("Error loading dashboard:", err);
    return undefined;
  }
};
