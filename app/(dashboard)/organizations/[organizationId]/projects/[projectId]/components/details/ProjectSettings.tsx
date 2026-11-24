
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Loader2,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useRestoreProjectMutation,
  type Project,
  type ProjectStatus,
  type ProjectPriority,
} from "@/features/projects/projectApi";

interface Props {
  project: Project;
  organizationId: string;
}

function getErrorMessage(error: unknown) {
  const message = (
    error as {
      data?: { message?: string | string[] };
    }
  )?.data?.message;

  return Array.isArray(message)
    ? message.join(". ")
    : message || "Something went wrong. Please try again.";
}

export function ProjectSettings(props: Props) {
  return (
    <ProjectSettingsForm
      key={`${props.project.id}-${props.project.updatedAt || ""}-${props.project.deletedAt || ""}`}
      {...props}
    />
  );
}

function ProjectSettingsForm({
  project,
  organizationId,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: project.name,
    description: project.description || "",
    status: project.status || "in_progress",
    priority: project.priority || "medium",
    startDate: project.startDate?.slice(0, 10) || "",
    dueDate: project.dueDate?.slice(0, 10) || "",
    color: project.color || "#9160EF",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updateProject, { isLoading: updating }] =
    useUpdateProjectMutation();

  const [archiveProject, { isLoading: archiving }] =
    useArchiveProjectMutation();

  const [restoreProject, { isLoading: restoring }] =
    useRestoreProjectMutation();

  const archived = Boolean(project.deletedAt);
  const busy = updating || archiving || restoring;

  // Conservative project-level permission.
  // Extend with the actual organization owner/admin role
  // once it is available in your organization context.
  const canManage = project.myRole === "manager";

  const canEdit = canManage && !archived;

  const inputClass =
    "h-12 rounded-xl border-[#DED9E8] shadow-none focus-visible:ring-[#9160EF]/20";

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSuccess("");
    setError("");
  }

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canEdit || busy) return;

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Project name is required.");
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

    try {
      await updateProject({
        organizationId,
        projectId: project.id,
        data: {
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          color: form.color,
        },
      }).unwrap();

      setSuccess("Project updated successfully.");
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleArchive() {
    if (!canManage || archived || busy) return;

    setError("");

    try {
      await archiveProject({
        organizationId,
        projectId: project.id,
      }).unwrap();

      router.replace(
        `/organizations/${encodeURIComponent(organizationId)}/projects`,
      );
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleRestore() {
    if (!canManage || !archived || busy) return;

    setError("");
    setSuccess("");

    try {
      await restoreProject({
        organizationId,
        projectId: project.id,
      }).unwrap();

      setSuccess("Project restored successfully.");
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <section className="rounded-2xl border border-[#EAE5F1] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#17152B]">
          General settings
        </h2>

        <p className="mt-2 text-sm text-[#77718E]">
          Update your project information and preferences.
        </p>

        {!canEdit && (
          <div className="mt-5 rounded-xl bg-[#F5F0FF] p-4 text-sm text-[#8754E8]">
            {archived
              ? "Restore this project before editing its details."
              : "You have read-only access to project settings."}
          </div>
        )}

        <form onSubmit={handleUpdate} className="mt-6 space-y-5">
          <fieldset
            disabled={!canEdit || busy}
            className="space-y-5 disabled:opacity-70"
          >
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>

              <Input
                id="project-name"
                value={form.name}
                required
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-key">Project key</Label>

              <Input
                id="project-key"
                value={project.key}
                readOnly
                className={`${inputClass} bg-[#FAF9FD]`}
              />

              <p className="text-xs text-[#827B94]">
                The project identifier is kept unchanged.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">
                Description
              </Label>

              <Textarea
                id="project-description"
                value={form.description}
                rows={4}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                className="rounded-xl border-[#DED9E8] shadow-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>

                <select
                  id="project-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as ProjectStatus,
                    )
                  }
                  className={`w-full border bg-white px-3 ${inputClass}`}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-priority">Priority</Label>

                <select
                  id="project-priority"
                  value={form.priority}
                  onChange={(event) =>
                    updateField(
                      "priority",
                      event.target.value as ProjectPriority,
                    )
                  }
                  className={`w-full border bg-white px-3 ${inputClass}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start date</Label>

                <Input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField("startDate", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due date</Label>

                <Input
                  id="due-date"
                  type="date"
                  value={form.dueDate}
                  min={form.startDate || undefined}
                  onChange={(event) =>
                    updateField("dueDate", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="project-color">Project color</Label>

              <div className="flex items-center gap-3">
                <input
                  id="project-color"
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    updateField("color", event.target.value)
                  }
                  className="size-11 cursor-pointer rounded-lg border border-[#DED9E8] bg-white p-1"
                />

                <span className="text-sm text-[#77718E]">
                  {form.color}
                </span>
              </div>
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              {success}
            </p>
          )}

          <div className="flex justify-end border-t border-[#F0ECF5] pt-5">
            <Button
              type="submit"
              disabled={!canEdit || busy}
              className="h-11 rounded-xl bg-[#9160EF] px-6 text-white hover:bg-[#8754E8]"
            >
              {updating ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {updating ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </section>

      {canManage && (
        <section className="rounded-2xl border border-red-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-red-600">
            Project lifecycle
          </h2>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#EAE5F1] p-4">
            <div>
              <h3 className="text-sm font-semibold text-[#17152B]">
                {archived ? "Restore project" : "Archive project"}
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-[#77718E]">
                {archived
                  ? "Return this project to the active projects list."
                  : "Remove this project from active projects. You can restore it later."}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  className={
                    archived
                      ? "border-[#D9C7F8] text-[#9160EF]"
                      : "border-red-200 text-red-600 hover:bg-red-50"
                  }
                >
                  {busy ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : archived ? (
                    <ArchiveRestore size={16} />
                  ) : (
                    <Archive size={16} />
                  )}

                  {archived ? "Restore" : "Archive"}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {archived
                      ? "Restore this project?"
                      : "Archive this project?"}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {archived
                      ? "This project will return to your active projects."
                      : "This project will be moved to archived projects. This action can be reversed."}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    disabled={busy}
                    onClick={() =>
                      archived
                        ? handleRestore()
                        : handleArchive()
                    }
                    className={
                      archived
                        ? "bg-[#9160EF] hover:bg-[#8754E8]"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {archived
                      ? "Restore project"
                      : "Archive project"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      )}
    </div>
  );
}
