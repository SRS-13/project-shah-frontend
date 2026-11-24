
import { baseApi } from "@/lib/store/services/api";

import type {
  ProjectMember,
  ProjectMemberParams,
  ProjectMemberListResponse,
  EligibleMembersResponse,
  AddProjectMemberRequest,
  UpdateProjectMemberRequest,
  UpdateProjectMemberResponse,
  RemoveProjectMemberRequest,
  RemoveProjectMemberResponse,
} from "./projectMemberTypes";

const membersPath = ({
  organizationId,
  projectId,
}: ProjectMemberParams) =>
  `/organizations/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(projectId)}/members`;

const memberTags = ({
  organizationId,
  projectId,
}: ProjectMemberParams) => [
  {
    type: "ProjectMember" as const,
    id: `${organizationId}-${projectId}`,
  },
  {
    type: "EligibleProjectMember" as const,
    id: `${organizationId}-${projectId}`,
  },
  {
    type: "Project" as const,
    id: projectId,
  },
  {
    type: "Project" as const,
    id: `LIST-${organizationId}`,
  },
];

export const projectMemberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjectMembers: builder.query<
      ProjectMemberListResponse,
      ProjectMemberParams
    >({
      query: (params) => ({
        url: membersPath(params),
        method: "GET",
      }),

      providesTags: (
        _result,
        _error,
        { organizationId, projectId },
      ) => [
        {
          type: "ProjectMember",
          id: `${organizationId}-${projectId}`,
        },
      ],
    }),

    getEligibleProjectMembers: builder.query<
      EligibleMembersResponse,
      ProjectMemberParams
    >({
      query: (params) => ({
        url: `${membersPath(params)}/eligible`,
        method: "GET",
      }),

      providesTags: (
        _result,
        _error,
        { organizationId, projectId },
      ) => [
        {
          type: "EligibleProjectMember",
          id: `${organizationId}-${projectId}`,
        },
      ],
    }),

    addProjectMember: builder.mutation<
      ProjectMember,
      AddProjectMemberRequest
    >({
      query: ({ userId, role, ...params }) => ({
        url: membersPath(params),
        method: "POST",
        body: {
          userId,
          role,
        },
      }),

      invalidatesTags: (_result, error, params) =>
        error ? [] : memberTags(params),
    }),

    updateProjectMemberRole: builder.mutation<
      UpdateProjectMemberResponse,
      UpdateProjectMemberRequest
    >({
      query: ({ memberId, role, ...params }) => ({
        url: `${membersPath(params)}/${encodeURIComponent(memberId)}`,
        method: "PATCH",
        body: { role },
      }),

      invalidatesTags: (_result, error, params) =>
        error ? [] : memberTags(params),
    }),

    removeProjectMember: builder.mutation<
      RemoveProjectMemberResponse,
      RemoveProjectMemberRequest
    >({
      query: ({ memberId, ...params }) => ({
        url: `${membersPath(params)}/${encodeURIComponent(memberId)}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, error, params) =>
        error ? [] : memberTags(params),
    }),
  }),
});

export const {
  useGetProjectMembersQuery,
  useGetEligibleProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
  useRemoveProjectMemberMutation,
} = projectMemberApi;
