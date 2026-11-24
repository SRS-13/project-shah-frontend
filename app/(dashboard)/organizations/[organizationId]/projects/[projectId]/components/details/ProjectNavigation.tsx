
"use client";

import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  Users,
  Activity,
  Settings2,
} from "lucide-react";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "board",
    label: "Board",
    icon: Kanban,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ListTodo,
  },
  {
    id: "members",
    label: "Members",
    icon: Users,
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings2,
  },
] as const;

export type ProjectTab = (typeof tabs)[number]["id"];

interface Props {
  activeTab: ProjectTab;
  onChange: (tab: ProjectTab) => void;
}

export function ProjectNavigation({
  activeTab,
  onChange,
}: Props) {
  return (
    <nav
      aria-label="Project navigation"
      className="overflow-x-auto rounded-xl border border-[#EAE5F1] bg-white p-1.5"
    >
      <div className="flex min-w-max items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#F0E7FF] text-[#8754E8]"
                  : "text-[#77718E] hover:bg-[#F8F5FC] hover:text-[#9160EF]"
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
