
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Attendance, User } from "@/lib/types";
import { useCollection, useFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function AttendancePage() {
  const { firestore, user: authUser, isUserLoading } = useFirebase();

  // Fetch all approved users for the dropdown
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('accountStatus', '==', 'Approved'));
  }, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  // Fetch current user's role
  const { data: currentUserData } = useCollection<User>(
    useMemo(() => {
      if (!firestore || !authUser) return null;
      return query(collection(firestore, 'users'), where('uid', '==', authUser.uid));
    }, [firestore, authUser])
  );
  const currentUser = currentUserData?.[0];

  // State for the selected user in the dropdown
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Determine which user to display attendance for
  const displayUserId = useMemo(() => {
    if (currentUser?.role === 'Admin') {
      return selectedUserId; // Admin can select any user
    }
    return authUser?.uid; // Employee can only see their own
  }, [currentUser, selectedUserId, authUser]);

  const selectedUser = useMemo(() => {
    return users?.find(u => u.uid === displayUserId) || null;
  }, [users, displayUserId]);

  // Fetch attendance for the selected user
  const attendanceQuery = useMemo(() => {
    if (!firestore || !displayUserId) return null;
    return collection(firestore, 'users', displayUserId, 'attendance');
  }, [firestore, displayUserId]);
  
  const { data: attendanceData, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);
  
  // Set default selected user for admin
  if (currentUser?.role === 'Admin' && !selectedUserId && users && users.length > 0) {
      setSelectedUserId(users[0].uid);
  }

  if (isUserLoading || usersLoading || (displayUserId && attendanceLoading)) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
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
              {currentUser?.role === 'Admin' && (
                <Link
                  href="/employees"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  Employees
                </Link>
              )}
              <Link
                href="/attendance"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
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
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
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
                {currentUser?.role === 'Admin' && (
                  <Link
                    href="/employees"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    Employees
                  </Link>
                )}
                <Link
                  href="/attendance"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
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
                <CardTitle>Attendance Calendar</CardTitle>
                <CardDescription>
                   {currentUser?.role === 'Admin' ? 'View employee attendance in a calendar format.' : 'View your attendance in a calendar format.'}
                </CardDescription>
              </div>
              {currentUser?.role === 'Admin' && (
                <div className="w-[200px]">
                  <Select onValueChange={setSelectedUserId} value={selectedUserId || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map(user => (
                        <SelectItem key={user.uid} value={user.uid}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                 <AttendanceCalendar attendance={attendanceData || []} workDays={selectedUser.workDays}/>
              ) : (
                <p>Please select an employee to view their attendance.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

