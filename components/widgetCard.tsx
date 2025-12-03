"use client";

import { CardsConfig } from "@/types/display";
import WatchlistCard from "./cards/watchlistCard";
import GainersCard from "./cards/gainersCard";
import PerformanceCard from "./cards/perfCard";
import FinancialCard from "./cards/financialCard";

export default function WidgetFinanceCard({
  config,
  data,
}: {
  config: CardsConfig;
  data: any[];
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data</div>;
  }

  const fields = config.fields;

  switch (config.type) {
    case "watchlist":
      return (
        <WatchlistCard
          data={data}
          symbolField={fields[0] ?? "symbol"}
          priceField={fields[1] ?? "price"}
          changeField={fields[2] ?? "change"}
        />
      );

    case "gainers":
      return (
        <GainersCard
          data={data}
          symbolField={fields[0] ?? "symbol"}
          priceField={fields[1] ?? "price"}
          changeField={fields[2] ?? "change"}
        />
      );

    case "performance":
      return <PerformanceCard data={data} fields={fields} />;

    case "financial":
      return <FinancialCard data={data} fields={fields} />;

    default:
      return <div>Unsupported card type</div>;
  }
}
