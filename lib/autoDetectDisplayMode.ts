import { humanizeKey } from "./autolabeller";

export interface AnalysisResult {
  widgetType: string;
  schema: Array<{ key: string; label: string; sample: any }>;
  chartFields: string[];
  tableColumns: string[];
  intervals: string | null;
  symbol: string | null;
}

export function analyzeApiResponse(data: any): AnalysisResult {
  const type = detectWidgetType(data);
  const chartFieldsData = detectChartFields(data);
  const tableColumnsData = Array.isArray(data) ? detectTableColumns(data) : [];
  const cardType = detectFinanceCardType(data);
  const intervals = detectInterval(data);
  const symbol = detectSymbol(data);

  return {
    widgetType: cardType || type, 
    schema: buildSchema(data),
    chartFields: chartFieldsData.map((f: any) => f.key || f),
    tableColumns: tableColumnsData.map((c: any) => c.key || c),
    intervals,
    symbol,
  };
}


export function detectWidgetType(data: any): string {
  if (!data) return "finance-card";

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    return "table";
  }

  const isCandle =
    data.o &&
    Array.isArray(data.o) &&
    data.h &&
    Array.isArray(data.h) &&
    data.l &&
    Array.isArray(data.l) &&
    data.c &&
    Array.isArray(data.c);
  if (isCandle) return "candle-chart";

  const arrayFields = Object.values(data).filter((v) => Array.isArray(v));
  const hasTimestamps = arrayFields.find(
    (a: any) => Array.isArray(a) && a.length > 0 && a.every((n: any) => typeof n === "number" && n > 1000000000)
  );
  if (hasTimestamps) return "line-chart";

  if (looksLikeQuote(data)) return "finance-card";

  return "info-card";
}


export function detectFinanceCardType(data: any): string | null {
  if (!data || typeof data !== "object") return null;

  if (data.symbol && data.c) return "watchlist";

  if ((data.dp || data.percentChange) && (data.dp > 0 || data.percentChange > 0)) return "gainers";

  const performanceKeys = ["marketCap", "peRatio", "roe", "eps", "beta", "pe"];
  if (performanceKeys.some((k) => k in data)) return "performance";

  if (looksLikeQuote(data)) return "financial";

  return null;
}

function looksLikeQuote(data: any): boolean {
  if (!data || typeof data !== "object") return false;

  const quoteKeys = ["c", "o", "h", "l", "pc", "d", "dp", "price", "open", "close", "high", "low"];
  const matchCount = quoteKeys.filter((k) => k in data).length;

  return matchCount >= 3;
}

export function detectTableColumns(arrayData: any[]) {
  if (!Array.isArray(arrayData) || arrayData.length === 0) return [];

  const sample = arrayData[0];
  if (typeof sample !== "object" || sample === null) return [];

  return Object.keys(sample).map((key) => ({
    key,
    label: humanizeKey(key),
    type: typeof sample[key],
    isNumeric: typeof sample[key] === "number",
  }));
}

export function detectChartFields(data: any) {
  if (!data || typeof data !== "object") return [];

  const fields: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0 && value.every((n) => typeof n === "number")) {
      fields.push({
        key,
        label: humanizeKey(key),
        type: key.toLowerCase(),
      });
    }
  }
  return fields;
}

export function detectInterval(data: any): string | null {
  if (!data) return null;

  if (data.s === "ok" && data.t) return "intraday";

  const intervalKeys = ["1h", "1d", "1w", "1mo", "5min", "daily", "weekly", "monthly"];
  const dataKeys = Object.keys(data).map((k) => k.toLowerCase());

  for (const key of dataKeys) {
    if (key.includes("day") || key.includes("1d")) return "daily";
    if (key.includes("week") || key.includes("1w")) return "weekly";
    if (key.includes("month") || key.includes("1mo")) return "monthly";
    if (key.includes("min") || key.includes("hour") || key.includes("1h")) return "intraday";
  }

  if (data.interval) {
    const interval = String(data.interval).toLowerCase();
    if (interval.includes("d")) return "daily";
    if (interval.includes("w")) return "weekly";
    if (interval.includes("m") && !interval.includes("min")) return "monthly";
    if (interval.includes("min") || interval.includes("h")) return "intraday";
  }

  return "unknown";
}

export function detectSymbol(data: any): string | null {
  const keys = ["symbol", "ticker", "displaySymbol", "code", "stockSymbol"];

  if (!data) return null;
  for (const k of keys) {
    if (k in data && typeof data[k] === "string") return data[k];
  }

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    for (const k of keys) {
      if (k in data[0] && typeof data[0][k] === "string") return data[0][k];
    }
  }

  return null;
}

export function buildSchema(data: any) {
  if (!data || typeof data !== "object") return [];

  const keys = Array.isArray(data) ? (data.length > 0 ? Object.keys(data[0]) : []) : Object.keys(data);

  return keys.map((k) => {
    const value = Array.isArray(data) ? data[0]?.[k] : data[k];
    return {
      key: k,
      label: humanizeKey(k),
      sample: Array.isArray(value) ? value[0] : value,
      type: Array.isArray(value) ? "array" : typeof value,
    };
  });
}
