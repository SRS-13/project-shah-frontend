import {   ProjectMember,
  ProjectMemberRole,
  ProjectMemberPermissions, } from "@/features/projects/projectMemberTypes";

export const ROLE_CONFIG = {
  manager: {
    label: "Manager",
    description: "Manage project members and project work.",
    className: "bg-[#F0E7FF] text-[#8754E8]",
  },
  member: {
    label: "Member",
    description: "Collaborate on project work.",
    className: "bg-blue-50 text-blue-600",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only project access.",
    className: "bg-slate-100 text-slate-600",
  },
} satisfies Record<
  ProjectMemberRole,
  {
    label: string;
    description: string;
    className: string;
  }
>;

export function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export function getErrorMessage(error: unknown) {
  const message = (
    error as {
      data?: {
        message?: string | string[];
      };
    }
  )?.data?.message;

  return Array.isArray(message)
    ? message.join(". ")
    : message || "Something went wrong. Please try again.";
}

export function getAssignableRoles(
  permissions: ProjectMemberPermissions,
): ProjectMemberRole[] {
  if (!permissions.canManage) return [];

  return permissions.isAdmin
    ? ["manager", "member", "viewer"]
    : ["member", "viewer"];
}

export function canManageMember(
  member: ProjectMember,
  permissions: ProjectMemberPermissions,
) {
  if (!permissions.canManage) return false;

  if (member.role === "manager") {
    return permissions.isAdmin;
  }

  return true;
}

export function formatJoinedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
