
export type ProjectMemberRole =
  | "manager"
  | "member"
  | "viewer";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EligibleProjectMember {
  userId: string;
  name: string;
  email: string;
  organizationRole: string;
}

export interface ProjectMemberListResponse {
  data: ProjectMember[];
  total: number;
}

export interface EligibleMembersResponse {
  data: EligibleProjectMember[];
  total: number;
}

export interface ProjectMemberParams {
  organizationId: string;
  projectId: string;
}

export interface AddProjectMemberRequest
  extends ProjectMemberParams {
  userId: string;
  role: ProjectMemberRole;
}

export interface UpdateProjectMemberRequest
  extends ProjectMemberParams {
  memberId: string;
  role: ProjectMemberRole;
}

export interface RemoveProjectMemberRequest
  extends ProjectMemberParams {
  memberId: string;
}

export interface UpdateProjectMemberResponse {
  id: string;
  userId?: string;
  role: ProjectMemberRole;
  message: string;
}

export interface RemoveProjectMemberResponse {
  message: string;
  memberId: string;
}

export interface ProjectMemberPermissions {
  canManage: boolean;
  isAdmin: boolean;
}
