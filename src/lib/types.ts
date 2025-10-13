export type User = {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Admin' | 'Employee';
  rank: string;
  baseSalary: number;
  totalSalary: number;
  attendanceRate: number;
  daysAbsent: number;
  workDays?: number[]; // 0 for Sunday, 6 for Saturday
};

export type Attendance = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
};

export type Salary = {
  month: string;
  baseSalary: number;
  deductions: number;
  netSalary: number;
};
