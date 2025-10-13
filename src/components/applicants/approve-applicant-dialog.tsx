'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  rank: z.string().min(2, 'Rank is required.'),
  baseSalary: z.coerce.number().min(0, 'Salary must be a positive number.'),
  role: z.enum(['Admin', 'Employee']),
});

type ApproveApplicantDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  applicant: User;
};

export function ApproveApplicantDialog({
  isOpen,
  setIsOpen,
  applicant,
}: ApproveApplicantDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: applicant.rank !== 'N/A' ? applicant.rank : '',
      baseSalary: applicant.baseSalary,
      role: applicant.role,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    try {
      const applicantRef = doc(firestore, 'users', applicant.uid);
      await updateDoc(applicantRef, {
        ...values,
        accountStatus: 'Approved',
        totalSalary: values.baseSalary, // Initially total salary is base salary
      });

      toast({
        title: "Applicant Approved",
        description: `${applicant.name}'s account has been approved.`,
      });
      setIsOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Approving Applicant",
            description: error.message || "An unexpected error occurred.",
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Applicant: {applicant.name}</DialogTitle>
          <DialogDescription>
            Set the rank, salary, and role for this employee.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rank</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Junior Developer" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="baseSalary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Base Salary</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 5000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Employee">Employee</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit">Approve and Save</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
