'use client';

import { useState } from 'react';
import { DayPicker, DayModifiers } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Attendance } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type AttendanceCalendarProps = {
  attendance: Attendance[];
  workDays?: number[];
};

export function AttendanceCalendar({ attendance, workDays = [1, 2, 3, 4, 5] }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const statusToModifier = (status: Attendance['status']) => {
    switch (status) {
      case 'Present':
        return 'present';
      case 'Late':
        return 'late';
      case 'Absent':
        return 'absent';
      case 'On Leave':
        return 'onLeave';
      default:
        return '';
    }
  };

  const attendanceByDate = attendance.reduce((acc, record) => {
    const date = format(new Date(record.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, Attendance[]>);

  const modifiers: DayModifiers = {
    present: [],
    late: [],
    absent: [],
    onLeave: [],
    nonWorkDay: (day: Date) => !workDays.includes(day.getDay()),
  };

  for (const dateStr in attendanceByDate) {
    const records = attendanceByDate[dateStr];
    const date = new Date(dateStr);
    // The API gives us UTC dates, so we need to adjust for the timezone offset
    const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    for (const record of records) {
        const modifier = statusToModifier(record.status);
        if (modifier && Array.isArray(modifiers[modifier])) {
            (modifiers[modifier] as Date[]).push(adjustedDate);
        }
    }
  }


  return (
    <Card>
      <CardContent className="p-4">
        <DayPicker
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          modifiers={modifiers}
          modifiersClassNames={{
            present: 'bg-green-100 dark:bg-green-900',
            late: 'bg-yellow-100 dark:bg-yellow-900',
            absent: 'bg-red-100 dark:bg-red-900',
            onLeave: 'bg-blue-100 dark:bg-blue-900',
            nonWorkDay: 'text-muted-foreground opacity-50',
            today: 'bg-accent/50',
          }}
          components={{
            DayContent: (props) => {
              const dateStr = format(props.date, 'yyyy-MM-dd');
              const records = attendanceByDate[dateStr];
              return (
                <div className="relative h-full w-full">
                  <span className='z-10 relative'>{props.date.getDate()}</span>
                  {records && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                       {records.map(r => (
                         <div key={r.id} className={cn('h-1 w-1 rounded-full', {
                            'bg-green-500': r.status === 'Present',
                            'bg-yellow-500': r.status === 'Late',
                            'bg-red-500': r.status === 'Absent',
                            'bg-blue-500': r.status === 'On Leave',
                         })} />
                       ))}
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800" />
                <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800" />
                <span className="text-sm">Late</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800" />
                <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800" />
                <span className="text-sm">On Leave</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-muted/50" />
                <span className="text-sm">Non-work day</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
