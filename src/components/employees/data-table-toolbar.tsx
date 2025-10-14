"use client"

import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  t: (key: string) => string
}

export function DataTableToolbar<TData>({
  table,
  t
}: DataTableToolbarProps<TData>) {

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Search is now in the header */}
      </div>
      <Button>{t('employees.addEmployee')}</Button>
    </div>
  )
}
