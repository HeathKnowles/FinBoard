import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CreditCard, Table, ChartColumn } from "lucide-react"

export function DisplayMode({raw, flattened}: {raw: any; flattened: any}) {
  return (
    <ToggleGroup type="multiple" variant="outline" spacing={1} size="sm">
      <ToggleGroupItem 
        value="card"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-red-500"
      >
        <CreditCard />
        Card
      </ToggleGroupItem>

      <ToggleGroupItem 
        value="table"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-blue-500"
      >
        <Table />
        Table
      </ToggleGroupItem>

      <ToggleGroupItem 
        value="chart"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-green-500"
      >
        <ChartColumn />
        Chart
      </ToggleGroupItem>
    </ToggleGroup>
  )
}