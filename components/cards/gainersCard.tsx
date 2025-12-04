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
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4 sm:p-6">
        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 opacity-50">📈</div>
        <div className="text-xs sm:text-sm">No gainers data available</div>
      </div>
    );
  }

  const sorted = [...data].sort(
    (a, b) => Number(b[changeField]) - Number(a[changeField])
  );

  return (
    <div className="space-y-1.5 max-h-60 sm:max-h-64 lg:max-h-72 overflow-y-auto">
      {sorted.slice(0, 10).map((stock, idx) => (
        <div
          key={idx}
          className="flex flex-col xs:flex-row xs:items-center xs:justify-between rounded border p-2 sm:p-3 hover:bg-muted/40 transition-colors cursor-default bg-gray-900/30"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="flex-1 min-w-0 mb-2 xs:mb-0">
            <div className="flex items-center justify-between xs:justify-start">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-muted-foreground font-mono bg-gray-800 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                <span className="text-sm sm:text-base font-semibold text-gray-200 truncate">{stock[symbolField]}</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-mono xs:hidden">
                ${Number(stock[priceField]).toFixed(2)}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground ml-8 xs:ml-0 xs:mt-1 hidden xs:block">
              ${Number(stock[priceField]).toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end xs:justify-start">
            <Badge className="text-xs sm:text-sm px-2 py-1 bg-green-600/20 text-green-400 border-green-500/30 whitespace-nowrap font-medium">
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              {Number(stock[changeField]).toFixed(2)}%
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
