import { flatten } from "flat";

export function flatter(obj: any): Record<string, any> {
  try {
    if (obj === null || typeof obj !== "object") return {};
    return flatten(obj as Record<string, any>) as Record<string, any>;
  } catch {
    return {};
  }
}
