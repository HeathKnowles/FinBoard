"use client";

export default function FinancialCard({
  data,
  fields,
}: {
  data: any[];
  fields: string[];
}) {
  const row = data[0];

  if (!row) return <div>No data</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map((f) => (
        <div
          key={f}
          className="flex items-center justify-between border rounded p-3 bg-gray-900/50"
        >
          <div className="text-sm font-medium text-gray-200 truncate">{f}</div>
          <div className="text-sm text-muted-foreground ml-4 text-right truncate max-w-[50%]">
            {typeof row[f] === "number"
              ? row[f].toLocaleString()
              : String(row[f])}
          </div>
        </div>
      ))}
    </div>
  );
}
