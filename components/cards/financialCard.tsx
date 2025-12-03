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
    <div className="space-y-3">
      {fields.map((f) => (
        <div
          key={f}
          className="flex items-center justify-between border rounded p-3"
        >
          <div className="text-sm font-medium">{f}</div>
          <div className="text-sm text-muted-foreground">
            {typeof row[f] === "number"
              ? row[f].toLocaleString()
              : String(row[f])}
          </div>
        </div>
      ))}
    </div>
  );
}
