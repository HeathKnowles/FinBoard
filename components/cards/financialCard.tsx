"use client";

export default function FinancialCard({
  data,
  fields,
}: {
  data: any[];
  fields: string[];
}) {
  if (!data || data.length === 0 || !fields || fields.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4 sm:p-6">
        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 opacity-50">💰</div>
        <div className="text-xs sm:text-sm">No financial data available</div>
      </div>
    );
  }

  const row = data[0];

  return (
    <div className="space-y-1.5 sm:space-y-2 max-h-60 sm:max-h-64 lg:max-h-72 overflow-y-auto">
      {fields.slice(0, 10).map((f) => {
        const value = row[f];
        const formattedValue = typeof value === "number" ? value.toString() : String(value);
        const isLargeNumber = typeof value === "number" && Math.abs(value) >= 1000000;
        
        return (
          <div
            key={f}
            className="flex flex-col xs:flex-row xs:items-center xs:justify-between border rounded p-2 sm:p-3 bg-gray-900/50 hover:bg-gray-800/50 transition-colors cursor-default"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="text-sm sm:text-base font-medium text-gray-200 truncate flex-1 min-w-0 mb-1 xs:mb-0" title={f}>
              {f.replace(/[_-]/g, ' ')}
            </div>
            <div 
              className={`text-right xs:ml-4 truncate font-mono ${
                isLargeNumber ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              } text-muted-foreground max-w-full xs:max-w-[60%]`} 
              title={formattedValue}
            >
              {formattedValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
