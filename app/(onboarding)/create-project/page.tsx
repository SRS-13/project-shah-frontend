
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Flag,
  FolderKanban,
  Layers3,
  LayoutGrid,
  ListTodo,
  Loader2,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useCreateProjectMutation,
  type ProjectStatus,
  type ProjectPriority,
  type CreateProjectRequest,
} from "@/features/projects/projectApi";

const PROJECT_COLORS = [
  "#9160EF",
  "#6366F1",
  "#3B82F6",
  "#14B8A6",
  "#22C55E",
  "#F59E0B",
  "#F97316",
  "#EC4899",
  "#EF4444",
  "#64748B",
];

const INITIAL_FORM: CreateProjectRequest = {
  name: "",
  key: "",
  description: "",
  status: "planning",
  priority: "medium",
  startDate: "",
  dueDate: "",
  color: "#9160EF",
};

function generateProjectKey(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  const key =
    words.length === 1
      ? words[0].slice(0, 4)
      : words.map((word) => word[0]).join("");

  return key
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
}

function getApiError(error: unknown): string {
  const apiError = error as {
    data?: {
      message?: string | string[];
    };
  };

  const message = apiError?.data?.message;

  if (Array.isArray(message)) {
    return message.join(". ");
  }

  return message || "Unable to create project. Please try again.";
}

function OnboardingSteps() {
  const steps = [
    "Create Organization",
    "Invite Members",
    "Set Up Project",
  ];

  return (
    <div className="mb-10 flex items-start">
      {steps.map((step, index) => (
        <div
          key={step}
          className="relative flex flex-1 flex-col items-center gap-2"
        >
          {index > 0 && (
            <div className="absolute right-1/2 top-5 h-px w-full bg-[#9160EF]" />
          )}

          <div
            className={`relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-semibold ${
              index === 2
                ? "bg-[#9160EF] text-white ring-4 ring-[#EDE4FF]"
                : "bg-[#9160EF] text-white"
            }`}
          >
            {index < 2 ? <Check size={18} /> : index + 1}
          </div>

          <span
            className={`text-center text-xs sm:text-sm ${
              index === 2
                ? "font-semibold text-[#17152B]"
                : "text-[#77718E]"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProjectPreview({
  form,
}: {
  form: CreateProjectRequest;
}) {
  const color = form.color || "#9160EF";

  const columns = [
    {
      title: "To do",
      color: "#9160EF",
      tasks: [
        "Define project requirements",
        "Prepare project roadmap",
      ],
    },
    {
      title: "In progress",
      color: "#3B82F6",
      tasks: ["Initial project setup"],
    },
    {
      title: "Done",
      color: "#22C55E",
      tasks: ["Create workspace"],
    },
  ];

  return (
    <div className="rounded-[26px] border border-white/80 bg-white/80 p-3 shadow-[0_30px_80px_rgba(115,69,183,0.15)] backdrop-blur-xl">
      <div className="overflow-hidden rounded-2xl border border-[#EEE9F5] bg-[#FAF9FD]">
        {/* Preview header */}
        <div className="flex items-center justify-between border-b border-[#EEE9F5] bg-white p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${color}20`,
                color,
              }}
            >
              <FolderKanban size={23} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#17152B]">
                {form.name || "Your first project"}
              </p>
              <p className="mt-1 text-xs text-[#827B94]">
                {form.key || "PRJ"} · Project workspace
              </p>
            </div>
          </div>

          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EDE4FF] text-xs font-semibold text-[#9160EF]">
            ME
          </div>
        </div>

        {/* Preview navigation */}
        <div className="flex items-center gap-5 border-b border-[#EEE9F5] bg-white px-5 text-xs">
          <div className="flex items-center gap-1.5 border-b-2 border-[#9160EF] py-3 font-semibold text-[#9160EF]">
            <LayoutGrid size={14} />
            Board
          </div>

          <div className="flex items-center gap-1.5 text-[#827B94]">
            <ListTodo size={14} />
            List
          </div>

          <div className="flex items-center gap-1.5 text-[#827B94]">
            <CalendarDays size={14} />
            Timeline
          </div>
        </div>

        {/* Kanban preview */}
        <div className="grid grid-cols-3 gap-3 p-4">
          {columns.map((column) => (
            <div
              key={column.title}
              className="min-w-0 rounded-xl bg-[#F0EDF5] p-2.5"
            >
              <div className="mb-3 flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: column.color }}
                />

                <span className="truncate text-[11px] font-semibold text-[#211A3B]">
                  {column.title}
                </span>

                <span className="ml-auto text-[10px] text-[#827B94]">
                  {column.tasks.length}
                </span>
              </div>

              {column.tasks.map((task, index) => (
                <div
                  key={task}
                  className="mb-2 rounded-lg border border-[#EBE6F2] bg-white p-3 shadow-sm"
                >
                  <span
                    className="text-[9px] font-medium"
                    style={{ color }}
                  >
                    {form.key || "PRJ"}-{index + 1}
                  </span>

                  <p className="mt-2 text-[11px] font-medium leading-4 text-[#211A3B]">
                    {task}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <Flag
                      size={12}
                      className="text-[#E59B52]"
                    />

                    <span className="flex size-5 items-center justify-center rounded-full bg-[#EDE4FF] text-[8px] font-semibold text-[#9160EF]">
                      ME
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center gap-1 py-2 text-[10px] text-[#827B94]">
                <Plus size={12} />
                Add task
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="px-3 pb-1 pt-3 text-center text-[11px] text-[#827B94]">
        Live project preview · Sample tasks
      </p>
    </div>
  );
}

function CreateProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const organizationId = searchParams.get("organizationId");

  const [form, setForm] =
    useState<CreateProjectRequest>(INITIAL_FORM);

  const [keyEdited, setKeyEdited] = useState(false);
  const [error, setError] = useState("");

  const [createProject, { isLoading }] =
    useCreateProjectMutation();

  function updateField<K extends keyof CreateProjectRequest>(
    field: K,
    value: CreateProjectRequest[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  function handleNameChange(name: string) {
    setForm((previous) => ({
      ...previous,
      name,
      key: keyEdited
        ? previous.key
        : generateProjectKey(name),
    }));

    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!organizationId) {
      setError("Organization ID is missing.");
      return;
    }

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!/^[A-Z][A-Z0-9]{1,5}$/.test(form.key)) {
      setError(
        "Project key must contain 2–6 uppercase letters or numbers and start with a letter.",
      );
      return;
    }

    if (
      form.startDate &&
      form.dueDate &&
      form.dueDate < form.startDate
    ) {
      setError("Due date cannot be before the start date.");
      return;
    }

    const payload: CreateProjectRequest = {
      name: form.name.trim(),
      key: form.key.trim().toUpperCase(),
      description: form.description?.trim() || undefined,
      status: form.status,
      priority: form.priority,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      color: form.color,
    };

    try {
      const project = await createProject({
        organizationId,
        data: payload,
      }).unwrap();

      router.replace(
        `/organizations/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(project.id)}`,
      );
    } catch (error) {
      setError(getApiError(error));
    }
  }

  const organizationPath = organizationId
    ? `/organizations/${encodeURIComponent(organizationId)}/projects`
    : "/dashboard";

  const inputClass =
    "h-12 rounded-xl border-[#DED9E8] bg-white shadow-none focus-visible:border-[#9160EF] focus-visible:ring-[#9160EF]/20";

  const labelClass =
    "text-sm font-semibold text-[#211C32]";

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[48%_52%]">
      {/* Left panel */}
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-10 xl:px-[clamp(40px,5vw,90px)]">
        {/* Logo */}
        <header>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#AD80FA] to-[#7C4BEF] text-white shadow-lg shadow-purple-200">
              <Layers3 size={24} />
            </div>

            <span className="text-[26px] font-bold tracking-[-0.05em] text-[#17152B]">
              TeamFlow
            </span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[560px]">
            <OnboardingSteps />

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F3EBFF] px-3 py-1.5 text-xs font-semibold text-[#8754E8]">
                <Sparkles size={13} />
                Almost there!
              </div>

              <h1 className="text-[36px] font-bold leading-tight tracking-[-0.055em] text-[#17152B] sm:text-[42px]">
                Create your first project
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#77718E]">
                Give your team a shared space to plan work,
                track progress, and achieve great things
                together.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Project name */}
              <div className="space-y-2">
                <Label
                  htmlFor="project-name"
                  className={labelClass}
                >
                  Project name{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <FolderKanban
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#827B94]"
                  />

                  <Input
                    id="project-name"
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(event.target.value)
                    }
                    placeholder="e.g. TeamFlow SaaS Development"
                    disabled={isLoading}
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* Project key */}
              <div className="space-y-2">
                <Label
                  htmlFor="project-key"
                  className={labelClass}
                >
                  Project key{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <div className="flex items-center gap-3">
                  <Input
                    id="project-key"
                    value={form.key}
                    maxLength={6}
                    disabled={isLoading}
                    required
                    placeholder="TF"
                    onChange={(event) => {
                      setKeyEdited(true);

                      updateField(
                        "key",
                        event.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, ""),
                      );
                    }}
                    className={`${inputClass} w-[130px] font-semibold uppercase`}
                  />

                  <div className="rounded-lg bg-[#F6F1FF] px-3 py-2 text-xs text-[#8754E8]">
                    Task ID:{" "}
                    <strong>{form.key || "TF"}-001</strong>
                  </div>
                </div>

                <p className="text-xs text-[#9993A9]">
                  A short, unique identifier for project tasks.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className={labelClass}
                >
                  Description
                  <span className="ml-2 font-normal text-[#9993A9]">
                    Optional
                  </span>
                </Label>

                <Textarea
                  id="description"
                  value={form.description}
                  disabled={isLoading}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Describe your project goals and objectives..."
                  rows={3}
                  className="resize-none rounded-xl border-[#DED9E8] shadow-none focus-visible:ring-[#9160EF]/20"
                />
              </div>

              {/* Status and priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className={labelClass}
                  >
                    Status
                  </Label>

                  <Select
                    value={form.status}
                    disabled={isLoading}
                    onValueChange={(value) =>
                      updateField(
                        "status",
                        value as ProjectStatus,
                      )
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className="h-12 w-full rounded-xl border-[#DED9E8] shadow-none"
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="planning">
                        <Circle
                          size={14}
                          className="text-slate-400"
                        />
                        Planning
                      </SelectItem>

                      <SelectItem value="in_progress">
                        <Circle
                          size={14}
                          className="fill-blue-500 text-blue-500"
                        />
                        In progress
                      </SelectItem>

                      <SelectItem value="completed">
                        <CheckCircle2
                          size={14}
                          className="text-emerald-500"
                        />
                        Completed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="priority"
                    className={labelClass}
                  >
                    Priority
                  </Label>

                  <Select
                    value={form.priority}
                    disabled={isLoading}
                    onValueChange={(value) =>
                      updateField(
                        "priority",
                        value as ProjectPriority,
                      )
                    }
                  >
                    <SelectTrigger
                      id="priority"
                      className="h-12 w-full rounded-xl border-[#DED9E8] shadow-none"
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="low">
                        <Flag
                          size={14}
                          className="text-emerald-500"
                        />
                        Low
                      </SelectItem>

                      <SelectItem value="medium">
                        <Flag
                          size={14}
                          className="text-amber-500"
                        />
                        Medium
                      </SelectItem>

                      <SelectItem value="high">
                        <Flag
                          size={14}
                          className="text-red-500"
                        />
                        High
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0 space-y-2">
                  <Label
                    htmlFor="start-date"
                    className={labelClass}
                  >
                    Start date
                  </Label>

                  <Input
                    id="start-date"
                    type="date"
                    value={form.startDate}
                    disabled={isLoading}
                    onChange={(event) =>
                      updateField(
                        "startDate",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0 space-y-2">
                  <Label
                    htmlFor="due-date"
                    className={labelClass}
                  >
                    Due date
                  </Label>

                  <Input
                    id="due-date"
                    type="date"
                    min={form.startDate || undefined}
                    value={form.dueDate}
                    disabled={isLoading}
                    onChange={(event) =>
                      updateField(
                        "dueDate",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Project color */}
              <div className="space-y-3">
                <Label className={labelClass}>
                  Project color
                </Label>

                <div className="flex flex-wrap gap-3">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      disabled={isLoading}
                      aria-label={`Select color ${color}`}
                      aria-pressed={form.color === color}
                      onClick={() =>
                        updateField("color", color)
                      }
                      className="flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110 disabled:opacity-50"
                      style={{
                        backgroundColor: color,
                        outline:
                          form.color === color
                            ? `2px solid ${color}`
                            : "none",
                        outlineOffset: "3px",
                      }}
                    >
                      {form.color === color && (
                        <Check
                          size={16}
                          className="text-white"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-[#9993A9]">
                  Make your project easy to recognize.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              {!organizationId && (
                <p className="text-sm text-red-600">
                  Please create or select an organization
                  first.
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !organizationId ||
                  !form.name.trim() ||
                  !form.key.trim()
                }
                className="h-[54px] w-full rounded-xl bg-gradient-to-r from-[#A36AF0] to-[#8754E8] text-base font-semibold text-white shadow-[0_8px_20px_rgba(145,91,232,0.18)] hover:from-[#9256E5] hover:to-[#7740D8]"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Creating project...
                  </>
                ) : (
                  <>
                    Create Project
                    <ArrowRight size={19} />
                  </>
                )}
              </Button>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={
                    organizationId
                      ? `/onboarding/invite-members?organizationId=${encodeURIComponent(organizationId)}`
                      : "/dashboard"
                  }
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#77718E] hover:text-[#9160EF]"
                >
                  <ArrowLeft size={16} />
                  Back
                </Link>

                <Link
                  href={organizationPath}
                  className="text-sm font-semibold text-[#9160EF] hover:underline"
                >
                  Skip for now
                </Link>
              </div>
            </form>
          </div>
        </div>

        <footer className="text-center text-xs text-[#AAA5B7]">
          © {new Date().getFullYear()} TeamFlow.
          All rights reserved.
        </footer>
      </section>

      {/* Right panel */}
      <aside className="relative hidden min-h-dvh overflow-hidden bg-[#F4E9FF] lg:flex lg:items-center">
        <div className="pointer-events-none absolute -left-32 -top-40 size-[450px] rounded-full bg-[#D9BBFF]/70 blur-[85px]" />

        <div className="pointer-events-none absolute -right-32 top-16 size-[450px] rounded-full bg-[#F8D9EF]/90 blur-[85px]" />

        <div className="pointer-events-none absolute -bottom-40 left-10 size-[450px] rounded-full bg-[#DCC5FF]/80 blur-[85px]" />

        <div className="relative z-10 mx-auto w-full max-w-[800px] px-10 py-16 xl:px-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-2 text-xs font-semibold text-[#8754E8]">
            <Sparkles size={15} />
            Your productivity starts here
          </div>

          <h2 className="text-[42px] font-bold leading-[1.15] tracking-[-0.055em] text-[#211A3B] xl:text-[54px]">
            Great projects start
            <br />
            with a clear plan.
          </h2>

          <p className="mb-10 mt-5 max-w-[480px] text-base leading-7 text-[#625A79]">
            Turn ideas into actionable tasks, keep everyone
            aligned, and deliver your best work with TeamFlow.
          </p>

          <ProjectPreview form={form} />

          {/* Benefits */}
          <div className="mt-10 grid grid-cols-3 gap-5">
            {[
              {
                icon: FolderKanban,
                title: "Stay organized",
                description:
                  "Manage all your work in one place.",
              },
              {
                icon: Users,
                title: "Collaborate",
                description:
                  "Keep your entire team aligned.",
              },
              {
                icon: CheckCircle2,
                title: "Deliver results",
                description:
                  "Track progress and achieve goals.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white/60 text-[#9160EF]">
                  <item.icon size={22} />
                </div>

                <p className="text-sm font-semibold text-[#211A3B]">
                  {item.title}
                </p>

                <p className="mt-2 text-xs leading-5 text-[#625A79]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

export default function CreateProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-white">
          <Loader2 className="size-7 animate-spin text-[#9160EF]" />
        </div>
      }
    >
      <CreateProjectContent />
    </Suspense>
  );
}
