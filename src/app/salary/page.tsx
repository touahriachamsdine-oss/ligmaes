
'use client';
import Link from "next/link";
import {
  Activity,
  CircleUser,
  Clock,
  DollarSign,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AtProfitLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useFirebase, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { useMemo, useState } from "react";
import { collection, query, where, doc } from "firebase/firestore";
import { User, Setting, Salary } from "@/lib/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { generateAbsenceNotification, AbsenceNotificationInput, AbsenceNotificationOutput } from "@/ai/flows/generate-absence-notifications";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mockSalaryData } from "@/lib/data";

export default function SalaryPage() {
    const { firestore, user: authUser, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const [notification, setNotification] = useState<AbsenceNotificationOutput | null>(null);
    const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: currentUserData } = useCollection<User>(useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return query(collection(firestore, 'users'), where('uid', '==', authUser.uid));
    }, [firestore, authUser]));
    const currentUser = currentUserData?.[0];

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !currentUser || currentUser?.role !== 'Admin') return null;
        return query(collection(firestore, 'users'), where('accountStatus', '==', 'Approved'));
    }, [firestore, currentUser]);
    const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const displayUserId = useMemo(() => {
        if (currentUser?.role === 'Admin') {
            // If admin and no one is selected, default to their own view or first user
            return selectedUserId || users?.[0]?.uid;
        }
        return authUser?.uid;
    }, [currentUser, selectedUserId, authUser, users]);

    const { data: selectedUser, isLoading: selectedUserLoading } = useDoc<User>(useMemoFirebase(() => {
        if (!firestore || !displayUserId) return null;
        return doc(firestore, 'users', displayUserId);
    }, [firestore, displayUserId]));
    
    const settingsRef = useMemoFirebase(() => {
      if (!firestore || !authUser) return null; // Wait for user
      return doc(firestore, 'settings', 'global')
    }, [firestore, authUser]);
    const { data: settings } = useDoc<Setting>(settingsRef);

    const handleGenerateNotification = async () => {
      if (!selectedUser || !settings) return;
      
      const deductionAmount = selectedUser.baseSalary * (settings.payCutRate / 100) * selectedUser.daysAbsent;

      const input: AbsenceNotificationInput = {
        employeeName: selectedUser.name,
        daysAbsent: selectedUser.daysAbsent,
        payCutRate: settings.payCutRate,
        deductionAmount: deductionAmount,
      };

      setIsGenerating(true);
      try {
        const result = await generateAbsenceNotification(input);
        setNotification(result);
        setIsNotificationDialogOpen(true);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate notification.'});
      } finally {
        setIsGenerating(false);
      }
    };


    const chartConfig = {
        baseSalary: { label: "Base Salary", color: "hsl(var(--chart-1))" },
        deductions: { label: "Deductions", color: "hsl(var(--chart-2))" },
        netSalary: { label: "Net Salary", color: "hsl(var(--chart-3))" },
    };

    // Set default selection for admin
    if (currentUser?.role === 'Admin' && !selectedUserId && users && users.length > 0) {
      setSelectedUserId(users[0].uid);
    }

    if (isUserLoading || !currentUser || (currentUser.role === 'Admin' && usersLoading) || (displayUserId && selectedUserLoading)) {
      return <div className="flex h-screen w-full items-center justify-center">Loading...</div>
    }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AtProfitLogo className="h-6 w-6 text-primary" />
              <span className="font-headline">Solminder</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Users className="h-4 w-4" />
                Dashboard
              </Link>
               <Link href="/clock-in" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Clock className="h-4 w-4" />
                Clock In
              </Link>
              {currentUser?.role === 'Admin' && (
                <Link href="/employees" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                  <Users className="h-4 w-4" />
                  Employees
                </Link>
              )}
              <Link href="/attendance" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Activity className="h-4 w-4" />
                Attendance
              </Link>
              <Link href="/salary" className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary">
                <DollarSign className="h-4 w-4" />
                Salary
              </Link>
               {currentUser?.role === 'Admin' && (
                  <Link href="/applicants" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                    <Users className="h-4 w-4" />
                    New Applicants
                  </Link>
                )}
            </nav>
          </div>
          <div className="mt-auto p-4">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Settings className="h-4 w-4" />
                Settings
                </Link>
             </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                  <AtProfitLogo className="h-6 w-6 text-primary" />
                   <span className="font-headline">Solminder</span>
                </Link>
                <Link href="/dashboard" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Users className="h-5 w-5" />
                  Dashboard
                </Link>
                 <Link href="/clock-in" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Clock className="h-5 w-5" />
                  Clock In
                </Link>
                 {currentUser?.role === 'Admin' && (
                  <Link href="/employees" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                    <Users className="h-5 w-5" />
                    Employees
                  </Link>
                 )}
                <Link href="/attendance" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Activity className="h-5 w-5" />
                  Attendance
                </Link>
                 <Link href="/salary" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground">
                  <DollarSign className="h-5 w-5" />
                  Salary
                </Link>
                {currentUser?.role === 'Admin' && (
                  <Link href="/applicants" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                    <Users className="h-5 w-5" />
                    New Applicants
                  </Link>
                )}
                 <Link href="/settings" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/login">Logout</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Salary Overview</CardTitle>
                        <CardDescription>
                            {currentUser?.role === 'Admin' ? "Review employee salary information." : "A summary of your salary for the past 6 months."}
                        </CardDescription>
                    </div>
                     {currentUser?.role === 'Admin' && (
                        <div className="flex gap-2">
                           <Select onValueChange={setSelectedUserId} value={selectedUserId || ''}>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select Employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {users?.map(user => (
                                <SelectItem key={user.uid} value={user.uid}>{user.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button onClick={handleGenerateNotification} disabled={isGenerating || !selectedUser || selectedUser.daysAbsent === 0}>
                            {isGenerating ? 'Generating...' : 'Notify Absences'}
                          </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockSalaryData}>
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'DZD' }).format(value)} />
                                <Tooltip content={<ChartTooltipContent formatter={(value, name, props) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'DZD' }).format(value as number), props.dataKey as string]} />} />
                                <Legend />
                                <Bar dataKey="baseSalary" fill="var(--color-baseSalary)" radius={4} />
                                <Bar dataKey="deductions" fill="var(--color-deductions)" radius={4} />
                                <Bar dataKey="netSalary" fill="var(--color-netSalary)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </main>
         <AlertDialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Absence Notification for {selectedUser?.name}</AlertDialogTitle>
              <AlertDialogDescription>
                This is the generated notification message. You can copy it or send it directly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 text-sm bg-muted/50 p-4 rounded-md">
              {notification?.notificationText}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (notification?.notificationText) {
                  navigator.clipboard.writeText(notification.notificationText);
                  toast({ title: "Copied!", description: "Notification copied to clipboard."});
                }
                setIsNotificationDialogOpen(false);
              }}>Copy Text</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
