"use client";

export default function PerformanceCard({
  data,
  fields,
}: {
  data: any[];
  fields: string[];
}) {
  const row = data[0];

  if (!row) return <div>No data</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f} className="border rounded p-3">
          <div className="text-xs text-muted-foreground uppercase">{f}</div>
          <div className="text-lg font-semibold mt-1">
            {typeof row[f] === "number"
              ? row[f].toLocaleString()
              : String(row[f])}
          </div>
        </div>
      ))}
    </div>
  );
}
