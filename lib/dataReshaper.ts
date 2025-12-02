import { XMLParser } from "fast-xml-parser";
import { flatter } from "./flatter";

const xmlParser = new XMLParser({ ignoreAttributes: false });

export function dataReshaper(input: any): string[] {
  try {
    if (input == null) return [];

    if (typeof input === "object") {
      const flat = flatter(input);
      return Object.keys(flat);
    }

    if (typeof input === "string") {
      const trimmed = input.trim();

      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        const xmlJson = xmlParser.parse(trimmed);
        const flat = flatter(xmlJson);
        return Object.keys(flat);
      }

      try {
        const json = JSON.parse(trimmed);
        if (typeof json === "object" && json !== null) {
          const flat = flatter(json);
          return Object.keys(flat);
        }
      } catch {
        // Not JSON — ignore
      }

      return ["text"];
    }

    // number, boolean, etc.
    return ["value"];

  } catch {
    return [];
  }
}
