"use client";

import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { TableConfig } from "@/types/display";

interface WidgetTableProps {
  data: any[];
  config: TableConfig;
}

type SortDir = "asc" | "desc" | null;

export function WidgetTable({ data, config }: WidgetTableProps) {
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState<string | "all">("all");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fields = config.fields.length
    ? config.fields
    : data.length > 0
    ? Object.keys(data[0])
    : [];


  const filtered = useMemo(() => {
    if (!search.trim()) return data;

    const s = search.toLowerCase();

    return data.filter((row) => {
      const keysToCheck = filterField === "all" ? fields : [filterField];

      return keysToCheck.some((field) => {
        const value = row[field];

        if (value == null) return false;

        return String(value).toLowerCase().includes(s);
      });
    });
  }, [data, search, filterField, fields]);

  const sorted = useMemo(() => {
    if (!sortField || !sortDir) return filtered;

    return [...filtered].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];

      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === "asc" ? -1 : 1;
      if (vb == null) return sortDir === "asc" ? 1 : -1;

      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }

      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();

      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);


  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    if (!config.paginated) return sorted;
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, config.paginated, currentPage, pageSize]);

  const handleHeaderClick = (field: string) => {
    setPage(1);
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortField(null);
        setSortDir(null);
      } else {
        setSortDir("asc");
      }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: string) => {
    if (sortField !== field || !sortDir) return null;
    return sortDir === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-4">
      {(config.searchable || config.paginated) && (
        <div className="flex flex-wrap items-center gap-4 justify-between">
          {config.searchable && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search stocks..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-64"
              />
            </div>
          )}

          <div className="flex items-end gap-4 flex-wrap">
            {config.searchable && (
              <div className="flex flex-col gap-1">
                <Label>Filter field</Label>
                <Select
                  value={filterField}
                  onValueChange={(v) => {
                    setPage(1);
                    setFilterField(v as any);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All fields" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {fields.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.paginated && (
              <div className="flex flex-col gap-1">
                <Label>Rows per page</Label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPage(1);
                    setPageSize(Number(v));
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead
                  key={field}
                  className="cursor-pointer select-none"
                  onClick={() => handleHeaderClick(field)}
                >
                  <div className="flex items-center gap-1">
                    <span>{field}</span>
                    <span className="text-xs opacity-60">{sortIndicator(field)}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={fields.length} className="text-center text-sm text-muted-foreground">
                  No data found.
                </TableCell>
              </TableRow>
            )}

            {paginated.map((row, idx) => (
              <TableRow key={idx}>
                {fields.map((field) => {
                  const value = row[field];
                  let display: string;

                  if (value == null) display = "";
                  else if (typeof value === "object") display = JSON.stringify(value);
                  else display = String(value);

                  return <TableCell key={field}>{display}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {config.paginated && totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
