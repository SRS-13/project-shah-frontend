"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  Archive,
  ChevronRight,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useGetMeQuery } from "@/features/auth/authQuery";

import { useGetOrganizationMembersQuery } from "@/features/organizations/organizationApi";

import { useGetProjectsQuery, type Project } from "../projectApi";

import { ProjectsHeader } from "./ProjectsHeader";
import { ProjectStats } from "./ProjectStats";
import { ProjectCard } from "./ProjectCard";
import { ProjectList } from "./ProjectList";
import { ProjectFormDialog } from "./ProjectFormDialog";
import { ProjectArchiveDialog } from "./ProjectArchiveDialog";
import { ProjectPagination } from "./ProjectPagination";

import {
  ProjectFilters,
  DEFAULT_FILTERS,
  type ProjectFilterState,
  type ProjectView,
} from "./ProjectFilters";

import type { ProjectPermissions } from "./projectUtils";

interface Props {
  organizationId: string;
}

type ProjectDialog =
  | { type: "create" }
  | {
      type: "edit" | "archive" | "restore";
      project: Project;
    }
  | null;

function useDebounce<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function ProjectsPage({ organizationId }: Props) {
  const [filters, setFilters] = useState<ProjectFilterState>(DEFAULT_FILTERS);

  const [view, setView] = useState<ProjectView>("grid");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [dialog, setDialog] = useState<ProjectDialog>(null);

  const [notice, setNotice] = useState("");

  const debouncedSearch = useDebounce(filters.search.trim(), 400);

  // Current authenticated user
  const { data: currentUser } = useGetMeQuery();

  // Organization-level permissions
  const { currentData: organizationMembers } = useGetOrganizationMembersQuery(
    organizationId,
    { skip: !currentUser?.id },
  );

  const currentOrganizationMember = organizationMembers?.find(
    (member) => member.user.id === currentUser?.id,
  );

  const organizationRole = currentOrganizationMember?.role.toLowerCase();

  const isAdmin = organizationRole === "owner" || organizationRole === "admin";

  const permissions: ProjectPermissions = {
    canCreate: isAdmin,
    isAdmin,
  };

  // Conservative archived access policy.
  // Adjust to match your NestJS permission rules.
  const canViewArchived = isAdmin;

  const archiveStatus = canViewArchived ? filters.archiveStatus : "active";

  // Server-side projects query
  const {
    currentData: data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProjectsQuery({
    organizationId,
    page,
    limit,
    archiveStatus,

    search: debouncedSearch || undefined,

    status: filters.status === "all" ? undefined : filters.status,

    priority: filters.priority === "all" ? undefined : filters.priority,

    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const projects = data?.data ?? [];

  // Return to a valid page after deleting or archiving
  // the final project on the current page.
  if (data && !isFetching && page > Math.max(1, data.meta.totalPages)) {
    setPage(Math.max(1, data.meta.totalPages));
  }

  function handleFiltersChange(nextFilters: ProjectFilterState) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleCreate() {
    if (!permissions.canCreate) return;

    setNotice("");
    setDialog({ type: "create" });
  }

  function handleEdit(project: Project) {
    if (project.deletedAt || (!isAdmin && project.myRole !== "manager")) {
      return;
    }

    setNotice("");
    setDialog({ type: "edit", project });
  }

  function handleArchive(project: Project) {
    if (project.deletedAt || !isAdmin) {
      return;
    }

    setNotice("");
    setDialog({ type: "archive", project });
  }

  function handleRestore(project: Project) {
    if (!isAdmin || !project.deletedAt) return;

    setNotice("");
    setDialog({ type: "restore", project });
  }

  function handleFormSuccess() {
    const creating = dialog?.type === "create";

    setNotice(
      creating
        ? "Project created successfully."
        : "Project updated successfully.",
    );

    if (creating) {
      setFilters({
        ...DEFAULT_FILTERS,
      });

      setPage(1);
    }
  }

  function handleArchiveSuccess() {
    setNotice(
      dialog?.type === "restore"
        ? "Project restored successfully."
        : "Project archived successfully.",
    );
  }

  const itemProps = {
    organizationId,
    permissions,
    onEdit: handleEdit,
    onArchive: handleArchive,
    onRestore: handleRestore,
  };

  const loading = isLoading || (isFetching && !data);

  return (
    <main className="min-h-full bg-[#FAF9FD] p-4 text-[#17152B] scheme-light sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard"
            className="text-[#827B94] hover:text-[#9160EF]"
          >
            Workspace
          </Link>

          <ChevronRight size={14} className="text-[#AAA5B7]" />

          <span className="font-medium text-[#17152B]">Projects</span>

          {isFetching && (
            <Loader2
              size={15}
              className="ml-auto animate-spin text-[#9160EF]"
            />
          )}
        </div>

        {/* Header */}
        <ProjectsHeader
          canCreate={permissions.canCreate}
          onCreate={handleCreate}
        />

        {/* Statistics */}
        <ProjectStats
          organizationId={organizationId}
          canViewArchived={canViewArchived}
        />

        {/* Success notification */}
        {notice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {notice}

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              className="font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <ProjectFilters
          filters={{
            ...filters,
            archiveStatus,
          }}
          view={view}
          canViewArchived={canViewArchived}
          onChange={handleFiltersChange}
          onViewChange={setView}
        />

        {/* Projects content */}
        {loading ? (
          <ProjectsSkeleton view={view} />
        ) : isError ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-[#EAE5F1] bg-white p-8 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={27} />
            </div>

            <h2 className="text-lg font-semibold text-[#17152B]">
              Unable to load projects
            </h2>

            <p className="mt-2 text-sm text-[#77718E]">
              Please check your connection and project access.
            </p>

            <Button
              variant="outline"
              disabled={isFetching}
              onClick={() => refetch()}
              className="mt-5 rounded-xl"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              Try again
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <ProjectsEmptyState
            archived={archiveStatus === "archived"}
            filtered={
              Boolean(debouncedSearch) ||
              filters.status !== "all" ||
              filters.priority !== "all"
            }
            canCreate={permissions.canCreate}
            onCreate={handleCreate}
            onClear={() => {
              setFilters({
                ...DEFAULT_FILTERS,
                archiveStatus,
              });

              setPage(1);
            }}
          />
        ) : view === "grid" ? (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} {...itemProps} />
            ))}
          </div>
        ) : (
          <ProjectList projects={projects} {...itemProps} />
        )}

        {/* Pagination */}
        {data && !isError && data.meta.total > 0 && (
          <ProjectPagination
            meta={data.meta}
            disabled={isFetching}
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        )}

        {/* Create and edit */}
        {(dialog?.type === "create" || dialog?.type === "edit") && (
          <ProjectFormDialog
            organizationId={organizationId}
            project={dialog.type === "edit" ? dialog.project : undefined}
            open
            onOpenChange={(open) => {
              if (!open) setDialog(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Archive and restore */}
        {(dialog?.type === "archive" || dialog?.type === "restore") && (
          <ProjectArchiveDialog
            key={`${dialog.type}-${dialog.project.id}`}
            organizationId={organizationId}
            project={dialog.project}
            action={dialog.type}
            open
            onOpenChange={(open) => {
              if (!open) setDialog(null);
            }}
            onSuccess={handleArchiveSuccess}
          />
        )}
      </div>
    </main>
  );
}

function ProjectsEmptyState({
  archived,
  filtered,
  canCreate,
  onCreate,
  onClear,
}: {
  archived: boolean;
  filtered: boolean;
  canCreate: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  const Icon = archived ? Archive : FolderOpen;

  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D9CDEB] bg-white p-8 text-center">
      <div className="mb-5 flex size-20 items-center justify-center rounded-[24px] bg-[#F0E7FF] text-[#9160EF]">
        <Icon size={36} />
      </div>

      <h2 className="text-xl font-bold text-[#17152B]">
        {filtered
          ? "No matching projects"
          : archived
            ? "No archived projects"
            : "No projects yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-[#827B94]">
        {filtered
          ? "Try changing your search or filter options."
          : archived
            ? "Projects you archive will appear here."
            : "Create your first project and start organizing your team's work."}
      </p>

      {filtered ? (
        <Button variant="outline" onClick={onClear} className="mt-6 rounded-xl">
          Clear filters
        </Button>
      ) : !archived && canCreate ? (
        <Button
          onClick={onCreate}
          className="mt-6 rounded-xl bg-[#9160EF] text-white hover:bg-[#8754E8]"
        >
          <Plus size={18} />
          Create project
        </Button>
      ) : null}
    </div>
  );
}

function ProjectsSkeleton({ view }: { view: ProjectView }) {
  return (
    <div
      className={
        view === "grid"
          ? "grid animate-pulse gap-5 md:grid-cols-2 2xl:grid-cols-3"
          : "animate-pulse space-y-3"
      }
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={`rounded-2xl border border-[#EAE5F1] bg-white p-5 ${
            view === "grid" ? "h-64" : "h-20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#F0E7FF]" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-[#EAE5F1]" />
              <div className="h-3 w-1/3 rounded bg-[#F0ECF5]" />
            </div>
          </div>

          {view === "grid" && (
            <div className="mt-6 space-y-3">
              <div className="h-4 w-4/5 rounded bg-[#EAE5F1]" />
              <div className="h-3 w-full rounded bg-[#F0ECF5]" />
              <div className="h-3 w-2/3 rounded bg-[#F0ECF5]" />
              <div className="mt-6 h-7 w-24 rounded-lg bg-[#F0E7FF]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
