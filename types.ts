
export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum Frequency {
  ONE_TIME = 'One Time',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
}

export enum AccountType {
    INDIVIDUAL = 'individual',
    TEAM = 'team',
}

export enum CalendarProvider {
    NONE = 'none',
    GOOGLE = 'Google',
    OUTLOOK = 'Outlook',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  password?: string; // Should be hashed in a real app
  role: 'admin' | 'user';
  accountType: AccountType;
  teamId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  frequency: Frequency;
  dueDate: string; // ISO string format
  assignee: User;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
