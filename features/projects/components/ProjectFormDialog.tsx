"use client";

import { useState, type FormEvent } from "react";

import { Check, FolderPlus, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  type Project,
  type ProjectStatus,
  type ProjectPriority,
  type CreateProjectRequest,
} from "../projectApi";

import {
  PROJECT_COLORS,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  generateProjectKey,
  getErrorMessage,
} from "./projectUtils";

interface Props {
  organizationId: string;
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (project: Project) => void;
}

export function ProjectFormDialog(props: Props) {
  if (!props.open) return null;

  return <ProjectForm key={props.project?.id || "create"} {...props} />;
}

function ProjectForm({
  organizationId,
  project,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const editing = Boolean(project);

  const [form, setForm] = useState<CreateProjectRequest>({
    name: project?.name || "",
    key: project?.key || "",
    description: project?.description || "",
    status: project?.status || "planning",
    priority: project?.priority || "medium",
    startDate: project?.startDate?.slice(0, 10) || "",
    dueDate: project?.dueDate?.slice(0, 10) || "",
    color: project?.color || "#9160EF",
  });

  const [keyEdited, setKeyEdited] = useState(editing);
  const [error, setError] = useState("");

  const [createProject, { isLoading: creating }] = useCreateProjectMutation();

  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();

  const busy = creating || updating;

  function updateField<K extends keyof CreateProjectRequest>(
    key: K,
    value: CreateProjectRequest[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  }

  function handleNameChange(name: string) {
    setForm((previous) => ({
      ...previous,
      name,
      key: keyEdited ? previous.key : generateProjectKey(name),
    }));

    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setError("");

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!/^[A-Z][A-Z0-9]{1,9}$/.test(form.key)) {
      setError(
        "Project key must contain 2–10 uppercase letters or numbers and start with a letter.",
      );
      return;
    }

    if (form.startDate && form.dueDate && form.dueDate < form.startDate) {
      setError("Due date cannot be before the start date.");
      return;
    }

    const payload: CreateProjectRequest = {
      name: form.name.trim(),
      key: form.key.trim(),
      description: form.description?.trim(),
      status: form.status,
      priority: form.priority,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      color: form.color,
    };

    try {
      let result: Project;

      if (project) {
        // Keep the existing project key unchanged.
        const data = { ...payload };
        delete (data as Partial<CreateProjectRequest>).key;

        result = await updateProject({
          organizationId,
          projectId: project.id,
          data: {
            ...data,
            startDate: form.startDate || null,
            dueDate: form.dueDate || null,
          },
        }).unwrap();
      } else {
        result = await createProject({
          organizationId,
          data: payload,
        }).unwrap();
      }

      onSuccess?.(result);
      onOpenChange(false);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  const inputClass =
    "h-11 rounded-xl border-[#DED9E8] bg-white text-[#17152B] shadow-none focus-visible:ring-[#9160EF]/20";

  const selectClass =
    "h-11 w-full rounded-xl border border-[#DED9E8] bg-white px-3 text-sm text-[#17152B]";

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white text-[#17152B] sm:max-w-[580px]">
        <DialogHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#F0E7FF] text-[#9160EF]">
            {editing ? <Pencil size={24} /> : <FolderPlus size={24} />}
          </div>

          <DialogTitle className="text-xl font-bold text-[#17152B]">
            {editing ? "Edit project" : "Create new project"}
          </DialogTitle>

          <DialogDescription>
            {editing
              ? "Update your project information and preferences."
              : "Set up a new workspace for your team's work."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name *</Label>

              <Input
                id="project-name"
                value={form.name}
                required
                maxLength={150}
                placeholder="e.g. Product Development"
                onChange={(event) => handleNameChange(event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-key">Project key *</Label>

              <div className="flex items-center gap-3">
                <Input
                  id="project-key"
                  value={form.key}
                  readOnly={editing}
                  required
                  maxLength={10}
                  placeholder="PD"
                  onChange={(event) => {
                    setKeyEdited(true);

                    updateField(
                      "key",
                      event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, ""),
                    );
                  }}
                  className={`${inputClass} w-32 font-semibold uppercase`}
                />

                <span className="rounded-lg bg-[#F4EEFF] px-3 py-2 text-xs text-[#8754E8]">
                  Task ID: {form.key || "PRJ"}-001
                </span>
              </div>

              <p className="text-xs text-[#827B94]">
                A unique identifier for project tasks.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>

              <Textarea
                id="project-description"
                value={form.description}
                rows={3}
                maxLength={5000}
                placeholder="Describe your project goals..."
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="resize-none rounded-xl border-[#DED9E8] bg-white text-[#17152B] shadow-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>

                <select
                  id="project-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as ProjectStatus)
                  }
                  className={selectClass}
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
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
                  className={selectClass}
                >
                  {PROJECT_PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0 space-y-2">
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

              <div className="min-w-0 space-y-2">
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
              <Label>Project color</Label>

              <div className="flex flex-wrap gap-3">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select color ${color}`}
                    aria-pressed={form.color === color}
                    onClick={() => updateField("color", color)}
                    className="flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline:
                        form.color === color ? `2px solid ${color}` : "none",
                      outlineOffset: "3px",
                    }}
                  >
                    {form.color === color && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <DialogFooter className="border-t border-[#F0ECF5] pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={busy || !form.name.trim() || !form.key.trim()}
              className="rounded-xl bg-[#9160EF] text-white hover:bg-[#8754E8]"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}

              {busy ? "Saving..." : editing ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
