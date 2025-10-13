
'use client';
import Link from "next/link";
import {
  Activity,
  CircleUser,
  DollarSign,
  Menu,
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
import { mockRecentAttendance, mockUsers } from "@/lib/data";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/lib/types";

export default function AttendancePage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(mockUsers[0]);

  const attendanceData = [...mockRecentAttendance, 
    { id: 'att5', userId: 'emp005', userName: 'Isabella Jones', userAvatarUrl: 'https://picsum.photos/seed/6/100/100', date: '2024-07-29', checkInTime: '09:00', status: 'Present' },
    { id: 'att6', userId: 'emp003', userName: 'Sophia Williams', userAvatarUrl: 'https://picsum.photos/seed/4/100/100', date: '2024-07-29', checkInTime: '08:45', status: 'Present' },
    { id: 'att7', userId: 'admin001', userName: 'Admin User', userAvatarUrl: 'https://picsum.photos/seed/1/100/100', date: '2024-07-29', checkInTime: '09:05', status: 'Present' },
    // Adding more data for calendar view
    { id: 'att8', userId: 'emp001', userName: 'Olivia Martin', date: '2024-07-01', status: 'Present' },
    { id: 'att9', userId: 'emp001', userName: 'Olivia Martin', date: '2024-07-02', status: 'Present' },
    { id: 'att10', userId: 'emp002', userName: 'Liam Anderson', date: '2024-07-03', status: 'Late' },
    { id: 'att11', userId: 'emp004', userName: 'Noah Brown', date: '2024-07-03', status: 'Absent' },
    { id: 'att12', userId: 'emp003', userName: 'Sophia Williams', date: '2024-07-05', status: 'On Leave' },
    { id: 'att13', userId: 'emp001', userName: 'Olivia Martin', date: '2024-07-08', status: 'Present' },
  ];

  const handleUserChange = (userId: string) => {
    const user = mockUsers.find(u => u.uid === userId) || null;
    setSelectedUser(user);
  };

  const filteredAttendance = selectedUser ? attendanceData.filter(a => a.userId === selectedUser.uid) : [];


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
                href="/employees"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Employees
              </Link>
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
            </nav>
          </div>
          <div className="mt-auto p-4">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                <Users className="h-4 w-4" />
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
                  href="/employees"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Employees
                </Link>
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
                 <Link
                  href="/settings"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
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
                  View employee attendance in a calendar format.
                </CardDescription>
              </div>
              <div className="w-[200px]">
                <Select onValueChange={handleUserChange} defaultValue={selectedUser?.uid}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map(user => (
                      <SelectItem key={user.uid} value={user.uid}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                 <AttendanceCalendar attendance={filteredAttendance} workDays={selectedUser.workDays}/>
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
