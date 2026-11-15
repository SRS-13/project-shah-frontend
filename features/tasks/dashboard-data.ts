export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type Task = { id: string; project: string; title: string; description: string; status: TaskStatus; priority: 'High' | 'Medium' | 'Low'; label: string; assignee: string; comments: number; attachments: number };
export const members = ['Emily Carter', 'Michael Reed', 'Sophia Nguyen', 'Daniel Park'];
export const workspaces = [{ name: 'TeamFlow', projects: ['TeamFlow Platform', 'Marketing Site', 'Mobile App', 'Design System'] }, { name: 'Studio', projects: ['Brand Refresh', 'Client Portal'] }];
const titles = [
  ['Design onboarding flow', 'Create a smooth onboarding experience for new users.', 'To Do', 'Design'],
  ['Set up project permissions', 'Implement role-based access control for projects.', 'To Do', 'Backend'],
  ['Create notification system', 'Build real-time notifications for tasks, mentions, and updates.', 'To Do', 'Backend'],
  ['Build task management UI', 'Implement the core UI for creating and managing tasks.', 'In Progress', 'Frontend'],
  ['Integrate authentication', 'Connect with NestJS APIs for login, registration, and refresh.', 'In Progress', 'Frontend'],
  ['Create project dashboard', 'Build the project dashboard with charts and task overview.', 'In Progress', 'Frontend'],
  ['Project setup & architecture', 'Initialize the project and configure Next.js and Redux.', 'Done', 'Setup'],
  ['Design system and UI components', 'Create reusable components with a consistent visual language.', 'Done', 'Design'],
  ['Database & API integration', 'Set up NestJS, PostgreSQL, and basic project APIs.', 'Done', 'Backend'],
] as const;
export const sampleTasks: Task[] = workspaces.flatMap(w => w.projects.flatMap((project, p) => titles.slice(0, p === 0 ? 9 : 3).map(([title, description, status, label], i) => ({ id: `${project}-${i}`, project, title, description, status, label, priority: i % 3 === 0 ? 'High' : 'Medium', assignee: members[i % members.length], comments: i % 5 + 2, attachments: i % 3 + 1 }))));
