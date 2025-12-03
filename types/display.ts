export interface TableConfig {
  fields: string[];
  searchable: boolean;
  paginated: boolean;
}

export interface CardsConfig {
  type: "watchlist" | "gainers" | "performance" | "financial";
  fields: string[];
}

export interface ChartConfig {
  type: "line" | "area" | "bar" | "candle";
  xField: string;
  yField: string;
  interval: "1D" | "1W" | "1M";

  openField?: string;
  highField?: string;
  lowField?: string;
  closeField?: string;
}

export interface DisplayConfig {
  mode: "table" | "cards" | "chart";
  table?: TableConfig;
  cards?: CardsConfig;
  chart?: ChartConfig;
}
