import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/common/Input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (row: T) => React.ReactNode;
  mobileLabel?: string; // Optional custom label for mobile view
  hideOnMobile?: boolean; // Hide this column on mobile card view
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  mobileCardRender?: (row: T, index: number) => React.ReactNode; // Custom mobile card renderer
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onSearch,
  searchPlaceholder = "Search...",
  emptyMessage = "No data available",
  mobileCardRender,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(row);
    }
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as any;
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  // Default mobile card renderer
  const renderMobileCard = (row: T, index: number) => {
    if (mobileCardRender) {
      return mobileCardRender(row, index);
    }

    return (
      <Card key={row._id || row.id || index} className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          {columns.filter(col => !col.hideOnMobile).map((column, colIndex) => (
            <div key={colIndex} className="flex justify-between items-start gap-3">
              <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                {column.mobileLabel || column.header}:
              </span>
              <div className="text-sm text-right flex-1">
                {getCellValue(row, column)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {onSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-11 md:h-10"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && data.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {data.map((row, index) => renderMobileCard(row, index))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index} className="whitespace-nowrap">
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={row._id || row.id || rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {getCellValue(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="min-h-touch-sm min-w-touch-sm"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <span className="text-sm px-2">
              <span className="hidden sm:inline">Page </span>
              {pagination.page}
              <span className="hidden sm:inline"> of {totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="min-h-touch-sm min-w-touch-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

