
import type { ReactNode } from "react";
import {
  CalendarDays,
  Clock3,
  Flag,
  FolderKanban,
  Hash,
  ShieldCheck,
  Users,
  ListTodo,
} from "lucide-react";

import type { Project } from "@/features/projects/projectApi";

import {
  formatProjectDate,
  formatProjectLabel,
} from "./ProjectHeader";

interface Props {
  project: Project;
}

function getTimeline(
  startDate?: string,
  dueDate?: string,
) {
  if (!startDate || !dueDate) return null;

  const start = new Date(startDate).getTime();
  const due = new Date(dueDate).getTime();
  const now = Date.now();

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(due) ||
    due < start
  ) {
    return null;
  }

  const day = 24 * 60 * 60 * 1000;
  const duration = due - start;

  return {
    totalDays: Math.ceil(duration / day),
    remainingDays: Math.max(
      0,
      Math.ceil((due - now) / day),
    ),
    elapsedPercentage:
      duration === 0
        ? now >= due ? 100 : 0
        : Math.min(
            100,
            Math.max(0, ((now - start) / duration) * 100),
          ),
    overdue: now >= due + day,
  };
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EAE5F1] bg-white p-5 shadow-[0_4px_20px_rgba(60,40,100,0.025)]">
      <div
        className="mb-4 flex size-11 items-center justify-center rounded-xl"
        style={{
          color,
          backgroundColor: `${color}15`,
        }}
      >
        {icon}
      </div>

      <p className="text-sm text-[#77718E]">{label}</p>

      <h3 className="mt-2 text-xl font-bold tracking-tight text-[#17152B]">
        {value}
      </h3>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-sm text-[#77718E]">
        {label}
      </span>

      <div className="text-right text-sm font-medium text-[#211A3B]">
        {children}
      </div>
    </div>
  );
}

export function ProjectOverview({ project }: Props) {
  const timeline = getTimeline(
    project.startDate,
    project.dueDate,
  );

  return (
    <div className="space-y-6">
      {/* Overview statistics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Project status"
          value={formatProjectLabel(project.status)}
          icon={<Clock3 size={22} />}
          color="#9160EF"
        />

        <StatCard
          label="Priority"
          value={formatProjectLabel(project.priority)}
          icon={<Flag size={22} />}
          color="#E59B52"
        />

        <StatCard
          label="Team members"
          value={project.memberCount ?? 0}
          icon={<Users size={22} />}
          color="#638CE5"
        />

        <StatCard
          label="Your role"
          value={formatProjectLabel(project.myRole)}
          icon={<ShieldCheck size={22} />}
          color="#38A881"
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* About project */}
          <section className="rounded-2xl border border-[#EAE5F1] bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <FolderKanban
                size={21}
                className="text-[#9160EF]"
              />

              <h2 className="text-lg font-semibold text-[#17152B]">
                About this project
              </h2>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-[#69647C]">
              {project.description ||
                "No description has been added yet."}
            </p>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-[#EAE5F1] bg-white p-6">
            <div className="mb-6 flex items-center gap-3">
              <CalendarDays
                size={21}
                className="text-[#9160EF]"
              />

              <h2 className="text-lg font-semibold text-[#17152B]">
                Project timeline
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#F8F5FC] p-4">
                <p className="text-xs text-[#827B94]">
                  Start date
                </p>

                <p className="mt-2 text-sm font-semibold text-[#17152B]">
                  {formatProjectDate(project.startDate)}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F5FC] p-4">
                <p className="text-xs text-[#827B94]">
                  Due date
                </p>

                <p className="mt-2 text-sm font-semibold text-[#17152B]">
                  {formatProjectDate(project.dueDate)}
                </p>
              </div>
            </div>

            {timeline ? (
              <div className="mt-6">
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-[#77718E]">
                    Scheduled time elapsed
                  </span>

                  <span className="font-semibold text-[#9160EF]">
                    {Math.round(timeline.elapsedPercentage)}%
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label="Scheduled time elapsed"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(
                    timeline.elapsedPercentage,
                  )}
                  className="h-2.5 overflow-hidden rounded-full bg-[#EEE8F6]"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#A36AF0] to-[#8754E8]"
                    style={{
                      width: `${timeline.elapsedPercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-[#827B94]">
                  <span>
                    {timeline.totalDays} days duration
                  </span>

                  <span
                    className={
                      timeline.overdue
                        ? "font-medium text-red-500"
                        : ""
                    }
                  >
                    {timeline.overdue
                      ? "Past due date"
                      : `${timeline.remainingDays} days remaining`}
                  </span>
                </div>

                <p className="mt-4 text-xs text-[#9993A9]">
                  This represents elapsed schedule time,
                  not task completion.
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-[#827B94]">
                Set a start and due date to view the project timeline.
              </p>
            )}
          </section>

          {/* Task module placeholder */}
          <section className="rounded-2xl border border-[#EAE5F1] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#17152B]">
              Project tasks
            </h2>

            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#F1E9FF] text-[#9160EF]">
                <ListTodo size={28} />
              </div>

              <p className="font-semibold text-[#17152B]">
                Ready to start working?
              </p>

              <p className="mt-2 max-w-xs text-sm leading-6 text-[#827B94]">
                Task management will be available once the
                task module is connected.
              </p>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#EAE5F1] bg-white p-5">
            <h2 className="mb-3 text-base font-semibold text-[#17152B]">
              Project information
            </h2>

            <div className="divide-y divide-[#F0ECF5]">
              <DetailRow label="Project key">
                <span className="inline-flex items-center gap-1">
                  <Hash size={14} />
                  {project.key}
                </span>
              </DetailRow>

              <DetailRow label="Status">
                {formatProjectLabel(project.status)}
              </DetailRow>

              <DetailRow label="Priority">
                {formatProjectLabel(project.priority)}
              </DetailRow>

              <DetailRow label="Your role">
                {formatProjectLabel(project.myRole)}
              </DetailRow>

              <DetailRow label="Created">
                {formatProjectDate(project.createdAt)}
              </DetailRow>

              <DetailRow label="Last updated">
                {formatProjectDate(project.updatedAt)}
              </DetailRow>

              <DetailRow label="Project color">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-4 rounded-full"
                    style={{
                      backgroundColor:
                        project.color || "#9160EF",
                    }}
                  />

                  {project.color || "#9160EF"}
                </span>
              </DetailRow>
            </div>
          </section>

          <section className="rounded-2xl border border-[#EAE5F1] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#17152B]">
                Project team
              </h2>

              <span className="rounded-full bg-[#F0E7FF] px-2.5 py-1 text-xs font-semibold text-[#9160EF]">
                {project.memberCount ?? 0}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#F8F5FC] p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EDE4FF] text-[#9160EF]">
                <Users size={20} />
              </div>

              <div>
                <p className="text-sm font-medium text-[#17152B]">
                  {project.memberCount ?? 0} project members
                </p>

                <p className="mt-1 text-xs text-[#827B94]">
                  Your project collaborators
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
