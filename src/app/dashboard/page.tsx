
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
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { Attendance, User } from "@/lib/types";
import { EmployeeQrCodeGenerator } from "@/components/dashboard/qr-code-generator";
import { useLanguage } from "@/lib/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";

export default function Dashboard() {
  const { firestore, user: authUser, isUserLoading } = useFirebase();
  const { t } = useLanguage();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('accountStatus', '==', 'Approved'));
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // For now, we continue to use mock data for recent attendance.
    // A more complex query would be needed for cross-user recent attendance.
    return null;
  }, [firestore]);

  const { data: attendance, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);
  
  const currentUserQuery = useMemoFirebase(() => {
      if (!firestore || !authUser) return null;
      return query(collection(firestore, 'users'), where('uid', '==', authUser.uid));
  }, [firestore, authUser]);
  const { data: currentUserData } = useCollection<User>(currentUserQuery);
  
  const currentUser = currentUserData?.[0];

  const { totalEmployees, totalSalaryCost, totalDaysMissed, averageAttendance } = useMemo(() => {
    if (!users) return { totalEmployees: 0, totalSalaryCost: 0, totalDaysMissed: 0, averageAttendance: 0 };
    
    const totalEmployees = users.length;
    const totalSalaryCost = users.reduce((acc, user) => acc + (user.totalSalary || 0), 0);
    const totalDaysMissed = users.reduce((acc, user) => acc + (user.daysAbsent || 0), 0);
    const totalPossibleAttendance = users.reduce((acc, user) => acc + user.attendanceRate, 0);
    const averageAttendance = totalEmployees > 0 ? totalPossibleAttendance / totalEmployees : 0;

    return { totalEmployees, totalSalaryCost, totalDaysMissed, averageAttendance };
  }, [users]);
  
  const mockRecentAttendance: Attendance[] = [
    { id: 'att1', userId: 'emp002', userName: 'Liam Anderson', userAvatarUrl: 'https://picsum.photos/seed/3/100/100', date: '2024-07-29', checkInTime: '09:15', status: 'Late' },
    { id: 'att2', userId: 'emp004', userName: 'Noah Brown', userAvatarUrl: 'https://picsum.photos/seed/5/100/100', date: '2024-07-29', status: 'Absent' },
    { id: 'att3', userId: 'emp001', userName: 'Olivia Martin', userAvatarUrl: 'https://picsum.photos/seed/2/100/100', date: '2024-07-29', checkInTime: '08:55', status: 'Present' },
    { id: 'att4', userId: 'emp003', userName: 'Sophia Williams', userAvatarUrl: 'https://picsum.photos/seed/4/100/100', date: '2024-07-28', status: 'On Leave' },
];


  if (isUserLoading || usersLoading || !currentUser) {
    return <div className="flex h-screen items-center justify-center">{t('general.loading')}</div>
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
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                {t('nav.dashboard')}
              </Link>
              <Link
                href="/clock-in"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Clock className="h-4 w-4" />
                {t('nav.clockIn')}
              </Link>
               {currentUser?.role === 'Admin' && (
                <Link
                  href="/employees"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  {t('nav.employees')}
                </Link>
               )}
              <Link
                href="/attendance"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Activity className="h-4 w-4" />
                {t('nav.attendance')}
              </Link>
              <Link
                href="/salary"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <DollarSign className="h-4 w-4" />
                {t('nav.salary')}
              </Link>
               {currentUser?.role === 'Admin' && (
                  <Link
                    href="/applicants"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Users className="h-4 w-4" />
                    {t('nav.newApplicants')}
                  </Link>
                )}
                 <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  {t('nav.settings')}
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
                   <span className="font-headline">Solminder</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/clock-in"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Clock className="h-5 w-5" />
                  {t('nav.clockIn')}
                </Link>
                 {currentUser?.role === 'Admin' && (
                  <Link
                    href="/employees"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    {t('nav.employees')}
                  </Link>
                 )}
                <Link
                  href="/attendance"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Activity className="h-5 w-5" />
                  {t('nav.attendance')}
                </Link>
                 <Link
                  href="/salary"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <DollarSign className="h-5 w-5" />
                  {t('nav.salary')}
                </Link>
                {currentUser?.role === 'Admin' && (
                  <Link
                    href="/applicants"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    {t('nav.newApplicants')}
                  </Link>
                )}
                 <Link
                  href="/settings"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  {t('nav.settings')}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search here if needed */}
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('nav.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">{t('nav.profile')}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings">{t('nav.settings')}</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/login">{t('nav.logout')}</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalEmployees')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.approvedAccounts')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.attendanceRate')}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.companyWideAverage')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.totalSalaryCost')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'DZD' }).format(totalSalaryCost)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.perMonth')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.daysMissed')}</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDaysMissed}</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.acrossAllEmployees')}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
             {currentUser?.role === 'Admin' && (
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle>{t('dashboard.qrCodesTitle')}</CardTitle>
                  <CardDescription>
                    {t('dashboard.qrCodesDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {users && users.filter(user => user.uid !== currentUser.uid).map(employee => (
                    <div key={employee.uid} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={employee.avatarUrl} alt="Avatar" data-ai-hint="person face" />
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{employee.name}</div>
                      </div>
                      <EmployeeQrCodeGenerator employee={employee} t={t} />
                    </div>
                  ))}
                </CardContent>
              </Card>
             )}
            <Card className={currentUser?.role === 'Admin' ? "xl:col-span-2" : "xl:col-span-3"}>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>{t('dashboard.recentAttendance')}</CardTitle>
                  <CardDescription>
                    {t('dashboard.recentAttendanceDesc')}
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/attendance">
                    {t('dashboard.viewAll')}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.employee')}</TableHead>
                      <TableHead>{t('dashboard.status')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.date')}</TableHead>
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
        <BottomNavBar userRole={currentUser.role} />
      </div>
    </div>
  );
}
