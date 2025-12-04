"use client";

export default function PerformanceCard({
  data,
  fields,
}: {
  data: any[];
  fields: string[];
}) {
  if (!data || data.length === 0 || !fields || fields.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4 sm:p-6">
        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 opacity-50">📊</div>
        <div className="text-xs sm:text-sm">No performance data available</div>
      </div>
    );
  }

  const row = data[0];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 sm:max-h-64 lg:max-h-80 overflow-y-auto">
      {fields.slice(0, 12).map((f) => {
        const value = row[f];
        const formattedValue = typeof value === "number" ? value.toString() : String(value);
        const isLargeNumber = typeof value === "number" && Math.abs(value) >= 1000000;
        
        return (
          <div 
            key={f} 
            className="border rounded p-2 sm:p-3 bg-gray-900/50 hover:bg-gray-800/50 transition-colors cursor-default"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="text-xs sm:text-sm text-muted-foreground uppercase truncate leading-tight mb-1" title={f}>
              {f.replace(/[_-]/g, ' ')}
            </div>
            <div 
              className={`font-semibold truncate leading-tight ${
                isLargeNumber ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              } ${typeof value === 'number' ? 'font-mono' : ''}`} 
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
