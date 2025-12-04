import { XMLParser } from "fast-xml-parser";
import { flatter } from "./flatter";

const xmlParser = new XMLParser({ ignoreAttributes: false });

// Helper function to convert Alpha Vantage time series to array format
export function convertTimeSeriesData(data: any): any[] | null {
  // Check if this looks like Alpha Vantage time series data
  const timeSeriesKeys = ['Time Series (Daily)', 'Time Series (Weekly)', 'Time Series (Monthly)', 'Time Series (Intraday)', 'Time Series (1min)', 'Time Series (5min)'];
  
  for (const key of timeSeriesKeys) {
    if (data[key] && typeof data[key] === 'object') {
      const timeSeries = data[key];
      const converted = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        timestamp: new Date(date).getTime(),
        open: parseFloat(values['1. open'] || values.open || 0),
        high: parseFloat(values['2. high'] || values.high || 0),
        low: parseFloat(values['3. low'] || values.low || 0),
        close: parseFloat(values['4. close'] || values.close || 0),
        volume: parseInt(values['5. volume'] || values.volume || 0),
        ...values // Include original fields as well
      }));
      
      // Sort by date (newest first)
      return converted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }
  
  return null;
}

export function dataReshaper(input: any): string[] {
  try {
    if (input == null) return [];

    // Handle Alpha Vantage time series format
    const timeSeriesArray = convertTimeSeriesData(input);
    if (timeSeriesArray) {
      const flat = flatter(timeSeriesArray[0] as object);
      return Object.keys(flat).filter(
        (key) => isNaN(Number(key)) && !key.startsWith("_")
      );
    }

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
