
'use client';
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  Clock,
  CreditCard,
  DollarSign,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { collection, query, where } from "firebase/firestore";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AtProfitLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCollection, useFirebase } from "@/firebase";
import { Attendance, User } from "@/lib/types";
import { EmployeeQrCodeGenerator } from "@/components/dashboard/qr-code-generator";

export default function Dashboard() {
  const { firestore, user: authUser, isUserLoading } = useFirebase();

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('accountStatus', '==', 'Approved'));
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const attendanceQuery = useMemo(() => {
    if (!firestore) return null;
    // Potentially query for recent attendance across all users if needed
    // For simplicity, we'll keep using mock data for the recent attendance table for now
    return null;
  }, [firestore]);

  const { data: attendance, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);
  
  const { data: currentUserData } = useCollection<User>(
    useMemo(() => {
      if (!firestore || !authUser) return null;
      return query(collection(firestore, 'users'), where('uid', '==', authUser.uid));
    }, [firestore, authUser])
  );
  
  const currentUser = currentUserData?.[0];

  const totalSalary = useMemo(() => {
    return users?.reduce((acc, user) => acc + user.totalSalary, 0) || 0;
  }, [users]);
  
  const mockRecentAttendance: Attendance[] = [
    { id: 'att1', userId: 'emp002', userName: 'Liam Anderson', userAvatarUrl: 'https://picsum.photos/seed/3/100/100', date: '2024-07-29', checkInTime: '09:15', status: 'Late' },
    { id: 'att2', userId: 'emp004', userName: 'Noah Brown', userAvatarUrl: 'https://picsum.photos/seed/5/100/100', date: '2024-07-29', status: 'Absent' },
    { id: 'att3', userId: 'emp001', userName: 'Olivia Martin', userAvatarUrl: 'https://picsum.photos/seed/2/100/100', date: '2024-07-29', checkInTime: '08:55', status: 'Present' },
    { id: 'att4', userId: 'emp003', userName: 'Sophia Williams', userAvatarUrl: 'https://picsum.photos/seed/4/100/100', date: '2024-07-28', status: 'On Leave' },
];


  if (isUserLoading || usersLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AtProfitLogo className="h-6 w-6 text-primary" />
              <span className="font-headline">AtProfit HR</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/clock-in"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Clock className="h-4 w-4" />
                Clock In
              </Link>
              <Link
                href="/employees"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Employees
              </Link>
              <Link
                href="/attendance"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Activity className="h-4 w-4" />
                Attendance
              </Link>
              <Link
                href="/salary"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <DollarSign className="h-4 w-4" />
                Salary
              </Link>
               {currentUser?.role === 'Admin' && (
                  <Link
                    href="/applicants"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Users className="h-4 w-4" />
                    New Applicants
                  </Link>
                )}
            </nav>
          </div>
          <div className="mt-auto p-4">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
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
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <AtProfitLogo className="h-6 w-6 text-primary" />
                   <span className="font-headline">AtProfit HR</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/clock-in"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Clock className="h-5 w-5" />
                  Clock In
                </Link>
                <Link
                  href="/employees"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Employees
                </Link>
                <Link
                  href="/attendance"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Activity className="h-5 w-5" />
                  Attendance
                </Link>
                 <Link
                  href="/salary"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <DollarSign className="h-5 w-5" />
                  Salary
                </Link>
                {currentUser?.role === 'Admin' && (
                  <Link
                    href="/applicants"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    New Applicants
                  </Link>
                )}
                 <Link
                  href="/settings"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search here if needed */}
          </div>
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
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {/* Logic for this month's change can be added here */}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance Rate
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95.2%</div>
                <p className="text-xs text-muted-foreground">
                  -1.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Salary Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'DZD' }).format(totalSalary)}
                </div>
                <p className="text-xs text-muted-foreground">
                  July 2024
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Missed</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  -1 from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
             {currentUser?.role === 'Admin' && (
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle>Employee Clock-In Codes</CardTitle>
                  <CardDescription>
                    Generate a temporary, unique QR code for an employee to clock in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {users && users.map(employee => (
                    <div key={employee.uid} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={employee.avatarUrl} alt="Avatar" data-ai-hint="person face" />
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{employee.name}</div>
                      </div>
                      <EmployeeQrCodeGenerator employee={employee} />
                    </div>
                  ))}
                </CardContent>
              </Card>
             )}
            <Card className={currentUser?.role === 'Admin' ? "xl:col-span-2" : "xl:col-span-3"}>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Recent Attendance</CardTitle>
                  <CardDescription>
                    Recent check-ins, absences, and late arrivals.
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/attendance">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecentAttendance.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={item.userAvatarUrl} alt="Avatar" data-ai-hint="person face" />
                              <AvatarFallback>{item.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{item.userName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge 
                            variant={
                                item.status === 'Present' ? 'secondary' :
                                item.status === 'Late' ? 'outline' :
                                'destructive'
                            }
                            className="text-xs"
                           >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
