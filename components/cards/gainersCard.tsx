"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

export default function GainersCard({
  data,
  symbolField,
  priceField,
  changeField,
}: {
  data: any[];
  symbolField: string;
  priceField: string;
  changeField: string;
}) {
  const sorted = [...data].sort(
    (a, b) => Number(b[changeField]) - Number(a[changeField])
  );

  return (
    <div className="space-y-3">
      {sorted.slice(0, 10).map((stock, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between rounded border p-3 hover:bg-muted/40 transition"
        >
          <div className="space-y-1">
            <div className="text-sm font-semibold">{stock[symbolField]}</div>
            <div className="text-xs text-muted-foreground">
              ${Number(stock[priceField]).toFixed(2)}
            </div>
          </div>

          <Badge className="text-xs px-2 py-1 bg-green-600/20 text-green-400">
            <ArrowUpRight className="w-3 h-3 inline mr-1" />
            {Number(stock[changeField]).toFixed(2)}%
          </Badge>
        </div>
      ))}
    </div>
  );
}
