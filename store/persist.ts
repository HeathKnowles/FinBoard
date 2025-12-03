const PERSIST_KEY = "finboard_dashboard_state";

export const saveState = (state: any) => {
  try {
    const serialized = JSON.stringify({
      layout: state.layout,
      dashboard: state.dashboard,
      theme: state.theme,
      widgets: state.widgets,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(PERSIST_KEY, serialized);
    }
  } catch (err) {
    console.error("Error saving dashboard:", err);
  }
};

export const loadState = () => {
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
