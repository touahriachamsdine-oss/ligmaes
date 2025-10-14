'use client';
import { useLanguage } from '@/lib/language-provider';
import { Activity, Clock, DollarSign, Home, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type BottomNavBarProps = {
  userRole?: 'Admin' | 'Employee';
};

export function BottomNavBar({ userRole }: BottomNavBarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { href: '/attendance', label: t('nav.attendance'), icon: Activity },
    { href: '/clock-in', label: t('nav.clockIn'), icon: Clock },
    { href: '/salary', label: t('nav.salary'), icon: DollarSign },
  ];
  
  if (userRole === 'Admin') {
    navItems.splice(2, 0, { href: '/employees', label: t('nav.employees'), icon: Users });
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t shadow-sm md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-muted group ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
