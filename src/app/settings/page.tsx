
'use client';
import Link from "next/link";
import {
  Activity,
  CircleUser,
  Clock,
  DollarSign,
  Menu,
  Settings as SettingsIcon, // Renamed to avoid conflict
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFirebase, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Setting } from "@/lib/types";

const formSchema = z.object({
  payCutRate: z.coerce.number().min(0, "Pay cut rate must be a positive number."),
  companyName: z.string().min(1, "Company name is required."),
  companyAddress: z.string().min(1, "Company address is required."),
});


export default function SettingsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const settingsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'global');
  }, [firestore]);

  const { data: settingsData, isLoading } = useDoc<Setting>(settingsRef);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payCutRate: 0,
      companyName: '',
      companyAddress: '',
    }
  });

  useEffect(() => {
    if (settingsData) {
      form.reset({
        payCutRate: settingsData.payCutRate || 0,
        companyName: settingsData.companyName || '',
        companyAddress: settingsData.companyAddress || '',
      });
    }
  }, [settingsData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !settingsRef) return;
    try {
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: "Settings Saved",
        description: "Your company settings have been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Saving Settings",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const isAdmin = user?.email === 'Admin@gmail.com'; // Simplified admin check

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
              {isAdmin && (
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
               {isAdmin && (
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
                  className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                >
                  <SettingsIcon className="h-4 w-4" />
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
                {isAdmin && (
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
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Activity className="h-5 w-5" />
                  Attendance
                </Link>                 <Link
                  href="/salary"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <DollarSign className="h-5 w-5" />
                  Salary
                </Link>
                {isAdmin && (
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
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <SettingsIcon className="h-5 w-5" />
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
          {isLoading ? (
            <p>Loading settings...</p>
          ) : (
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>
                {isAdmin ? "Manage your company's information and settings." : "View your company's information."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly={!isAdmin} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} readOnly={!isAdmin} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payCutRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Cut Rate (%) per Missed Day</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} readOnly={!isAdmin}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isAdmin && <Button type="submit">Save Changes</Button>}
                </form>
              </Form>
            </CardContent>
          </Card>
          )}
        </main>
      </div>
    </div>
  );
}
