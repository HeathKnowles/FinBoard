import { XMLParser } from "fast-xml-parser";
import { flatter } from "./flatter";

const xmlParser = new XMLParser({ ignoreAttributes: false });

export function dataReshaper(input: any): string[] {
  try {
    if (input == null) return [];

    if (Array.isArray(input)) {
      if (input.length === 0) return [];

      if (input.some((item) => typeof item !== "object" || item === null)) {
        return [];
      }

      const flat = flatter(input[0] as object);

      return Object.keys(flat).filter(
        (key) => isNaN(Number(key)) && !key.startsWith("_")
      );
    }

    if (typeof input === "object") {
      const flat = flatter(input);

      return Object.keys(flat).filter(
        (key) => isNaN(Number(key)) && !key.startsWith("_")
      );
    }

    if (typeof input === "string") {
      const trimmed = input.trim();

      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        const xmlJson = xmlParser.parse(trimmed);
        const flat = flatter(xmlJson);
        return Object.keys(flat).filter(
          (key) => isNaN(Number(key)) && !key.startsWith("_")
        );
      }

      try {
        const json = JSON.parse(trimmed);

        return dataReshaper(json); 
      } catch {
        return ["text"];
      }
    }

    return ["value"];
  } catch {
    return [];
  }
}
