
import { baseApi } from "@/lib/store/services/api";

// Extend these unions to match your NestJS enums.
export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "completed";

export type ProjectPriority =
  | "low"
  | "medium"
  | "high";

export type ProjectRole =
  | "manager"
  | "member"
  | "viewer";

export interface CreateProjectRequest {
  name: string;
  key: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  dueDate?: string;
  color?: string;
}

export interface Project extends CreateProjectRequest {
  id: string;
  organizationId: string;
  createdBy: string;
  deletedAt: string | null;
  myRole: ProjectRole | null;
  memberCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFilters {
  organizationId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  archiveStatus?: "active" | "archived";
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface ProjectListResponse {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ProjectIdentifier {
  organizationId: string;
  projectId: string;
}

interface UpdateProjectRequest extends ProjectIdentifier {
  data: Omit<Partial<CreateProjectRequest>, "startDate" | "dueDate"> & {
    startDate?: string | null;
    dueDate?: string | null;
  };
}

const projectPath = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/projects`;

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProject: builder.mutation<
      Project,
      {
        organizationId: string;
        data: CreateProjectRequest;
      }
    >({
      query: ({ organizationId, data }) => ({
        url: projectPath(organizationId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, error, { organizationId }) =>
        error ? [] : [
          { type: "Project", id: `LIST-${organizationId}` },
        ],
    }),

    getProject: builder.query<
  Project,
  {
    organizationId: string;
    projectId: string;
  }
>({
  query: ({ organizationId, projectId }) => ({
    url: `/organizations/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(projectId)}`,
    method: "GET",
  }),

  providesTags: (_result, _error, { projectId }) => [
    { type: "Project", id: projectId },
  ],
}),

    getProjects: builder.query<
      ProjectListResponse,
      ProjectFilters
    >({
      query: ({ organizationId, ...params }) => ({
        url: projectPath(organizationId),
        method: "GET",
        params,
      }),
      providesTags: (result, _error, { organizationId }) => [
        { type: "Project", id: `LIST-${organizationId}` },
        ...(result?.data.map((project) => ({
          type: "Project" as const,
          id: project.id,
        })) ?? []),
      ],
    }),

    updateProject: builder.mutation<
      Project,
      UpdateProjectRequest
    >({
      query: ({ organizationId, projectId, data }) => ({
        url: `${projectPath(organizationId)}/${encodeURIComponent(projectId)}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (
        _result,
        error,
        { organizationId, projectId }
      ) => error ? [] : [
        { type: "Project", id: projectId },
        { type: "Project", id: `LIST-${organizationId}` },
      ],
    }),

    archiveProject: builder.mutation<
      unknown,
      ProjectIdentifier
    >({
      query: ({ organizationId, projectId }) => ({
        url: `${projectPath(organizationId)}/${encodeURIComponent(projectId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (
        _result,
        error,
        { organizationId, projectId }
      ) => error ? [] : [
        { type: "Project", id: projectId },
        { type: "Project", id: `LIST-${organizationId}` },
      ],
    }),

    restoreProject: builder.mutation<
      unknown,
      ProjectIdentifier
    >({
      query: ({ organizationId, projectId }) => ({
        url: `${projectPath(organizationId)}/${encodeURIComponent(projectId)}/restore`,
        method: "POST",
      }),
      invalidatesTags: (
        _result,
        error,
        { organizationId, projectId }
      ) => error ? [] : [
        { type: "Project", id: projectId },
        { type: "Project", id: `LIST-${organizationId}` },
      ],
    }),
  }),
});

export const {
  useGetProjectQuery,
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useRestoreProjectMutation,
} = projectApi;
