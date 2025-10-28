
import { User, Task, Status, Priority, AccountType, Frequency } from './types';

// This is a mock database of users. In a real app, this would be in a database.
export const MOCK_INITIAL_USERS: User[] = [
  { 
    id: 'user-1', 
    name: 'Alex (Admin)', 
    avatar: 'https://i.pravatar.cc/150?u=alex',
    email: 'admin@team.com',
    password: 'password123',
    role: 'admin',
    accountType: AccountType.TEAM,
    teamId: 'team-1',
  },
  { 
    id: 'user-2', 
    name: 'Sam (Team)', 
    avatar: 'https://i.pravatar.cc/150?u=sam',
    email: 'sam@team.com',
    password: 'password123',
    role: 'user',
    accountType: AccountType.TEAM,
    teamId: 'team-1',
  },
  { 
    id: 'user-3', 
    name: 'Jamie (Team)', 
    avatar: 'https://i.pravatar.cc/150?u=jamie',
    email: 'jamie@team.com',
    password: 'password123',
    role: 'user',
    accountType: AccountType.TEAM,
    teamId: 'team-1',
  },
  { 
    id: 'user-4', 
    name: 'Casey (Individual)', 
    avatar: 'https://i.pravatar.cc/150?u=casey',
    email: 'casey@individual.com',
    password: 'password123',
    role: 'admin', // Individual users are their own admins
    accountType: AccountType.INDIVIDUAL,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design landing page mockups',
    description: 'Create high-fidelity mockups in Figma for the new marketing landing page.',
    status: Status.TODO,
    priority: Priority.HIGH,
    frequency: Frequency.ONE_TIME,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_INITIAL_USERS[0], // Alex
  },
  {
    id: 'task-urgent',
    title: 'Deploy urgent hotfix to production',
    description: 'A critical bug was found and needs immediate attention.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    frequency: Frequency.ONE_TIME,
    dueDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // Due in 1 hour
    assignee: MOCK_INITIAL_USERS[0], // Alex
  },
  {
    id: 'task-2',
    title: 'Develop user authentication API',
    description: 'Set up Passport.js for email/password and Google OAuth.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    frequency: Frequency.ONE_TIME,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_INITIAL_USERS[1], // Sam
  },
  {
    id: 'task-3',
    title: 'QA for version 1.2 release',
    description: 'Perform full regression testing on the staging environment.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    frequency: Frequency.WEEKLY,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_INITIAL_USERS[2], // Jamie
  },
  {
    id: 'task-4',
    title: 'Update documentation for new feature',
    description: 'Add a new section to the public docs explaining the new AI summarization feature.',
    status: Status.DONE,
    priority: Priority.LOW,
    frequency: Frequency.ONE_TIME,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_INITIAL_USERS[0], // Alex
  },
    {
    id: 'task-5',
    title: 'Fix login button styling on mobile',
    description: 'The login button is misaligned on screens smaller than 375px.',
    status: Status.IN_PROGRESS,
    priority: Priority.MEDIUM,
    frequency: Frequency.ONE_TIME,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_INITIAL_USERS[1], // Sam
  },
   {
    id: 'task-6',
    title: 'Organize personal files',
    description: 'Sort and backup documents on personal drive.',
    status: Status.TODO,
    priority: Priority.HIGH,
    frequency: Frequency.MONTHLY,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_INITIAL_USERS[3], // Casey
  },
];

export const PRIORITY_COLORS: { [key in Priority]: { bg: string; text: string } } = {
  [Priority.HIGH]: { bg: 'bg-red-500/20', text: 'text-red-400' },
  [Priority.MEDIUM]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  [Priority.LOW]: { bg: 'bg-green-500/20', text: 'text-green-400' },
};
