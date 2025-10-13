"use client"

import { MoreHorizontal } from "lucide-react"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { User } from "@/lib/types"
import { ApproveApplicantDialog } from "./approve-applicant-dialog"
import { useFirebase } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"


interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const applicant = row.original as User;

  const handleReject = async () => {
      if (!firestore) return;
      try {
        const applicantRef = doc(firestore, 'users', applicant.uid);
        await updateDoc(applicantRef, {
            accountStatus: 'Rejected'
        });
        toast({
            title: "Applicant Rejected",
            description: `${applicant.name}'s account has been rejected.`,
        });
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Error Rejecting Applicant",
              description: error.message || "An unexpected error occurred.",
          });
      }
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => setIsApproveDialogOpen(true)}>Approve</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleReject} className="text-destructive">
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <ApproveApplicantDialog
        isOpen={isApproveDialogOpen}
        setIsOpen={setIsApproveDialogOpen}
        applicant={applicant}
    />
    </>
  )
}
