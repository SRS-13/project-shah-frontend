"use client";

import {
  Layers3,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  CircleCheck,
} from "lucide-react";

const previewTasks = [
  {
    title: "Create design system",
    status: "Todo",
    color: "bg-orange-300",
  },
  {
    title: "Build dashboard UI",
    status: "Todo",
    color: "bg-purple-300",
  },
  {
    title: "API integration",
    status: "In Progress",
    color: "bg-amber-300",
  },
  {
    title: "User authentication",
    status: "In Progress",
    color: "bg-blue-300",
  },
  {
    title: "Project setup",
    status: "Done",
    color: "bg-green-300",
  },
  {
    title: "Team onboarding",
    status: "Done",
    color: "bg-green-300",
  },
];


export default function DashboardPreview() {
  const columns = [
    { name: "Todo", count: 5 },
    { name: "In Progress", count: 3 },
    { name: "Done", count: 8 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[640px] rounded-[25px] border border-white/80 bg-white/75 p-3 shadow-[0_30px_90px_rgba(111,65,174,0.17)] backdrop-blur-xl sm:p-4">
      <div className="flex min-h-[310px] overflow-hidden rounded-[18px] bg-[#FAF9FE]">
        {/* Preview sidebar */}
        <div className="flex w-[56px] shrink-0 flex-col items-center gap-6 border-r border-purple-100 bg-white/90 py-5">
          <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-sm">
            👨‍💻
          </div>
          <LayoutDashboard size={16} className="text-[#8B5CF6]" />
          <FolderKanban size={16} className="text-slate-400" />
          <ListTodo size={16} className="text-slate-400" />
          <Users size={16} className="text-slate-400" />
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Layers3 size={16} />
              </div>
              <span className="text-sm font-bold text-[#211B35]">
                Product Launch
              </span>
            </div>

            <div className="flex -space-x-2">
              {["#F9C6A6", "#C4B5FD", "#A7F3D0"].map((color, index) => (
                <div
                  key={index}
                  className="flex size-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-slate-700"
                  style={{ backgroundColor: color }}
                >
                  {["JD", "AL", "MK"][index]}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5 grid grid-cols-4 gap-1 rounded-xl bg-white p-1 text-center text-[10px] text-slate-500 shadow-sm">
            {["Overview", "List", "Dashboard", "Timeline"].map((tab) => (
              <div
                key={tab}
                className={`rounded-lg px-1 py-2 ${
                  tab === "Dashboard"
                    ? "bg-[#9661ED] font-semibold text-white"
                    : ""
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {columns.map((column) => (
              <div key={column.name} className="min-w-0">
                <div className="mb-3 flex items-center gap-1 text-[10px] font-semibold text-slate-800">
                  <span className="truncate">{column.name}</span>
                  <span className="rounded-md bg-purple-100 px-1 text-purple-500">
                    {column.count}
                  </span>
                </div>

                <div className="space-y-2">
                  {previewTasks
                    .filter((task) => task.status === column.name)
                    .map((task) => (
                      <div
                        key={task.title}
                        className="min-h-[90px] rounded-xl border border-purple-50 bg-white p-2.5 shadow-sm"
                      >
                        <p className="line-clamp-2 text-[10px] font-medium leading-4 text-slate-800">
                          {task.title}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <div
                            className={`h-2 w-10 rounded-full ${task.color}`}
                          />
                          <CircleCheck size={12} className="text-slate-300" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
