'use client';
import Link from 'next/link';
import {
  Activity,
  CircleUser,
  Clock,
  DollarSign,
  Menu,
  Settings,
  Users,
  Fingerprint,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AtProfitLogo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, setDoc, limitToLast, onValue, ref } from 'firebase/firestore';
import { getDatabase, ref as dbRef, onValue as onDbValue, query as dbQuery, limitToLast as dbLimitToLast, off } from 'firebase/database';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/lib/language-provider';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';

const weekDays = [
    { id: 0, label: 'Sun' },
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
]

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  rank: z.string().min(2, 'Rank is required.'),
  jobDescription: z.string().optional(),
  baseSalary: z.coerce.number().min(0, 'Salary must be a positive number.'),
  role: z.enum(['Admin', 'Employee']),
  workDays: z.array(z.number()).min(1, "Employee must work at least one day"),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddEmployeePage() {
  const { firestore, auth, user: authUser, isUserLoading, firebaseApp } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [step, setStep] = useState<'details' | 'fingerprint' | 'confirmed'>('details');
  const [newEmployeeData, setNewEmployeeData] = useState<FormValues | null>(null);
  const [fingerprintId, setFingerprintId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rank: '',
      jobDescription: '',
      baseSalary: 0,
      role: 'Employee',
      workDays: [1, 2, 3, 4, 5],
      startDate: new Date(),
    },
  });

  const currentUserQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, 'users'), where('uid', '==', authUser.uid));
  }, [firestore, authUser]);
  const { data: currentUserData, isLoading: currentUserLoading } = useCollection<User>(currentUserQuery);
  const currentUser = currentUserData?.[0];
  
  useEffect(() => {
    if (!isUserLoading && currentUser && currentUser.role !== 'Admin') {
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUser, router]);

  useEffect(() => {
    if (step !== 'fingerprint' || !firebaseApp) return;

    const db = getDatabase(firebaseApp);
    const eventsRef = dbRef(db, 'fingerprint/events');
    const q = dbQuery(eventsRef, dbLimitToLast(1));

    const unsubscribe = onDbValue(q, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const eventKey = Object.keys(data)[0];
            const latestEvent = data[eventKey];

            if (latestEvent.result === 'ENROLLED') {
                setFingerprintId(latestEvent.id);
                setStep('confirmed');
                toast({
                    title: "Fingerprint Registered",
                    description: `Fingerprint ID ${latestEvent.id} has been successfully captured.`
                });
            }
        }
    });

    return () => off(eventsRef);
  }, [step, firebaseApp, toast]);


  const handleDetailsSubmit = (values: FormValues) => {
    setNewEmployeeData(values);
    setStep('fingerprint');
  };

  const finalizeEmployeeCreation = async () => {
    if (!auth || !firestore || !newEmployeeData || fingerprintId === null) return;
    try {
      // Note: This creates a temporary user in auth. In a real app you might use a server-side function
      // to avoid this, but for simplicity we'll create it on the client.
      const tempUserCredential = await createUserWithEmailAndPassword(auth, newEmployeeData.email, newEmployeeData.password);
      const newUser = tempUserCredential.user;

      const userDoc: Omit<User, 'id'> = {
        uid: newUser.uid,
        name: newEmployeeData.name,
        email: newEmployeeData.email,
        role: newEmployeeData.role,
        accountStatus: 'Approved',
        rank: newEmployeeData.rank,
        baseSalary: newEmployeeData.baseSalary,
        totalSalary: newEmployeeData.baseSalary,
        attendanceRate: 100,
        daysAbsent: 0,
        workDays: newEmployeeData.workDays,
        startDate: newEmployeeData.startDate.toISOString(),
        jobDescription: newEmployeeData.jobDescription,
        fingerprintId: fingerprintId,
      };

      await setDoc(doc(firestore, 'users', newUser.uid), userDoc);

      toast({
        title: 'Employee Added',
        description: `${newEmployeeData.name} has been added as a new employee.`,
      });

      // Sign the admin back in
      if(authUser?.email){
        // This is a simplified re-authentication. A real app would prompt for password.
        await auth.updateCurrentUser(authUser);
      }
      
      router.push('/employees');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Add Employee',
        description: error.message || 'An unexpected error occurred.',
      });
      setStep('details'); // Go back to details form on error
    }
  };
  
  if (isUserLoading || currentUserLoading || !currentUser || currentUser.role !== 'Admin') {
    return <div>{t('general.loading')}</div>;
  }

  const renderContent = () => {
    switch (step) {
      case 'fingerprint':
        return (
          <div className="text-center py-12">
            <Fingerprint className="mx-auto h-24 w-24 text-primary animate-pulse" />
            <h2 className="mt-6 text-xl font-semibold">Awaiting Fingerprint</h2>
            <p className="mt-2 text-muted-foreground">Please ask the new employee to place their finger on the scanner to enroll.</p>
          </div>
        );
      case 'confirmed':
        return (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
            <h2 className="mt-6 text-xl font-semibold">Fingerprint Registered!</h2>
            <p className="mt-2 text-muted-foreground">Fingerprint ID: {fingerprintId} has been successfully captured.</p>
             <Button onClick={finalizeEmployeeCreation} className="mt-8">Finalize and Create Employee</Button>
          </div>
        );
      case 'details':
      default:
        return (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rank" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank / Job Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="baseSalary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Salary (DZD)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? ( format(field.value, "PPP")) : ( <span>Pick a date</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                 )} />
                 <div />
                 <FormField control={form.control} name="jobDescription" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <div className='flex justify-between items-center'>
                      <FormLabel>Job Description</FormLabel>
                       <Button variant="link" size="sm" asChild><Link href="/job-description" target="_blank">Generate with AI</Link></Button>
                    </div>
                    <FormControl><Textarea {...field} rows={6} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <FormField
                  control={form.control}
                  name="workDays"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Work Days</FormLabel>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                      {weekDays.map((day) => (
                        <FormField
                          key={day.id}
                          control={form.control}
                          name="workDays"
                          render={({ field }) => {
                            return (
                              <FormItem key={day.id} className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="flex justify-end pt-4">
                 <Button type="submit" disabled={form.formState.isSubmitting}>
                    Proceed to Fingerprint Enrollment
                 </Button>
              </div>
            </form>
          </Form>
        );
    }
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
                {t('nav.dashboard')}
              </Link>
              <Link href="/clock-in" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Clock className="h-4 w-4" />
                {t('nav.clockIn')}
              </Link>
              <Link href="/employees" className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary">
                <Users className="h-4 w-4" />
                {t('nav.employees')}
              </Link>
              <Link href="/attendance" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Activity className="h-4 w-4" />
                {t('nav.attendance')}
              </Link>
              <Link href="/salary" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <DollarSign className="h-4 w-4" />
                {t('nav.salary')}
              </Link>
              <Link href="/applicants" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Users className="h-4 w-4" />
                {t('nav.newApplicants')}
              </Link>
              <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
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
                  {t('nav.dashboard')}
                </Link>
                <Link href="/clock-in" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Clock className="h-5 w-5" />
                  {t('nav.clockIn')}
                </Link>
                <Link href="/employees" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground">
                  <Users className="h-5 w-5" />
                  {t('nav.employees')}
                </Link>
                <Link href="/attendance" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Activity className="h-5 w-5" />
                  {t('nav.attendance')}
                </Link>
                <Link href="/salary" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <DollarSign className="h-5 w-5" />
                  {t('nav.salary')}
                </Link>
                <Link href="/applicants" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                    <Users className="h-4 w-4" />
                    {t('nav.newApplicants')}
                </Link>
                <Link href="/settings" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Settings className="h-5 w-5" />
                  {t('nav.settings')}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
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
          <Card>
            <CardHeader>
              <CardTitle>Add New Employee</CardTitle>
              <CardDescription>
                {step === 'details' 
                    ? "Fill out the form below to create a new employee account."
                    : "Follow the steps to enroll the new employee's fingerprint."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
          </Card>
        </main>
        <BottomNavBar userRole={currentUser?.role} />
      </div>
    </div>
  );
}

    