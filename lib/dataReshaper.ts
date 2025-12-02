import { flatten } from "flat";

export function dataReshaper(data: any): string[] {
    if(typeof data !== "object" || data == null) {
        return [];
    }
    const flat = flatten(data as Record<string, any>);
    return Object.keys(data);
}