"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/types";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
    {
    accessorKey: "accountStatus",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
