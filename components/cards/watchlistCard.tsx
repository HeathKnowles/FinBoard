"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function WatchlistCard({
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
  return (
    <div className="space-y-3">
      {data.map((stock, idx) => {
        const change = Number(stock[changeField]);
        const positive = change >= 0;

        return (
          <div
            key={idx}
            className="flex items-center justify-between rounded border p-3 hover:bg-muted/40 transition"
          >
            {/* Symbol & Price */}
            <div className="space-y-1">
              <div className="text-sm font-semibold">{stock[symbolField]}</div>
              <div className="text-xs text-muted-foreground">
                ${Number(stock[priceField]).toFixed(2)}
              </div>
            </div>

            {/* Change */}
            <Badge
              className={`text-xs px-2 py-1 ${
                positive
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              }`}
            >
              {positive ? (
                <ArrowUpRight className="w-3 h-3 inline mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 inline mr-1" />
              )}
              {change.toFixed(2)}%
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
