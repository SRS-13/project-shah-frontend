import { baseApi } from "@/lib/store/services/api";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationPreviewResponse {
  id: string;
  role: "admin" | "member";
  status: string;
  expiresAt: string;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface InvitationLinkResponse {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "member";
  status: string;
  expiresAt: string;
  invitationLink: string;
  message?: string;
}

export interface AddOrganizationMemberRequest {
  organizationId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
}

export type InvitationRole = "admin" | "member";

export type InvitationStatus = "pending" | "accepted" | "declined" | "revoked";

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt?: string;
}

// Also accepts responses cached before the shared API unwrapped envelopes.
export function readInvitationList(
  response: unknown,
): OrganizationInvitation[] | null {
  if (Array.isArray(response)) return response;
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    response.success === true &&
    "data" in response &&
    Array.isArray(response.data)
  ) {
    return response.data;
  }
  return null;
}

export interface CreateInvitationRequest {
  organizationId: string;
  email: string;
  role: InvitationRole;
}

export interface InvitationTokenRequest {
  token: string;
}

export interface AcceptInvitationResponse {
  message: string;
  organizationId: string;
  role: InvitationRole;
}

export interface InvitationMessageResponse {
  message: string;
}

export type Invitation = OrganizationInvitation;

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export interface OrganizationMember {
  id: string;
  role: OrganizationRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
}

export interface UpdateOrganizationRequest {
  id: string;
  data: Partial<CreateOrganizationRequest>;
}

export interface DeleteOrganizationResponse {
  message: string;
}

export const organizationApi = baseApi
  .enhanceEndpoints({
    addTagTypes: [
      "Organization",
      "OrganizationMember",
      "OrganizationInvitation",
    ],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      // Create organization
      createOrganization: builder.mutation<
        Organization,
        CreateOrganizationRequest
      >({
        query: (body) => ({
          url: "/organizations",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Organization"],
      }),

      // Get organizations belonging to current user
      getOrganizations: builder.query<Organization[], void>({
        query: () => ({
          url: "/organizations",
          method: "GET",
        }),
        providesTags: ["Organization"],
      }),

      // Get one organization
      getOrganization: builder.query<Organization, string>({
        query: (id) => ({
          url: `/organizations/${encodeURIComponent(id)}`,
          method: "GET",
        }),
        providesTags: (_result, _error, id) => [{ type: "Organization", id }],
      }),

      // Update organization
      updateOrganization: builder.mutation<
        Organization,
        UpdateOrganizationRequest
      >({
        query: ({ id, data }) => ({
          url: `/organizations/${encodeURIComponent(id)}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          "Organization",
          { type: "Organization", id },
        ],
      }),

      // Delete organization
      deleteOrganization: builder.mutation<DeleteOrganizationResponse, string>({
        query: (id) => ({
          url: `/organizations/${encodeURIComponent(id)}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Organization"],
      }),

      // Get organization members
      getOrganizationMembers: builder.query<OrganizationMember[], string>({
        query: (id) => ({
          url: `/organizations/${encodeURIComponent(id)}/members`,
          method: "GET",
        }),
        providesTags: (_result, _error, id) => [
          { type: "OrganizationMember", id },
        ],
      }),

      addOrganizationMember: builder.mutation<
        OrganizationMember,
        AddOrganizationMemberRequest
      >({
        query: ({ organizationId, email, role }) => ({
          url: `/organizations/${encodeURIComponent(organizationId)}/members`,
          method: "POST",
          body: { email, role },
        }),
        invalidatesTags: (_result, _error, { organizationId }) => [
          { type: "OrganizationMember", id: organizationId },
        ],
      }),

      createInvitation: builder.mutation<Invitation, CreateInvitationRequest>({
        query: ({ organizationId, email, role }) => ({
          url: `/organizations/${encodeURIComponent(organizationId)}/invitations`,
          method: "POST",
          body: {
            email,
            role,
          },
        }),
        invalidatesTags: ["OrganizationInvitation"],
      }),

      getInvitations: builder.query<OrganizationInvitation[], string>({
        query: (organizationId) => ({
          url: `/organizations/${encodeURIComponent(organizationId)}/invitations`,
          method: "GET",
        }),
        transformResponse: (response: unknown) => {
          const invitations = readInvitationList(response);
          if (!invitations)
            throw new Error("Invalid invitations response: expected an array");
          return invitations;
        },
        providesTags: ["OrganizationInvitation"],
      }),

      acceptInvitation: builder.mutation<
        AcceptInvitationResponse,
        InvitationTokenRequest
      >({
        query: (body) => ({
          url: "/invitations/accept",
          method: "POST",
          body,
        }),
        invalidatesTags: [
          "Organization",
          "OrganizationMember",
          "OrganizationInvitation",
        ],
      }),

      declineInvitation: builder.mutation<
        InvitationMessageResponse,
        InvitationTokenRequest
      >({
        query: (body) => ({
          url: "/invitations/decline",
          method: "POST",
          body,
        }),
        invalidatesTags: ["OrganizationInvitation"],
      }),

      revokeInvitation: builder.mutation<
        InvitationMessageResponse,
        { organizationId: string; invitationId: string }
      >({
        query: ({ organizationId, invitationId }) => ({
          url: `/organizations/${encodeURIComponent(organizationId)}/invitations/${encodeURIComponent(invitationId)}`,
          method: "DELETE",
        }),
        invalidatesTags: ["OrganizationInvitation"],
      }),
      regenerateInvitation: builder.mutation<
        InvitationLinkResponse,
        {
          organizationId: string;
          invitationId: string;
        }
      >({
        query: ({ organizationId, invitationId }) => ({
          url: `/organizations/${encodeURIComponent(organizationId)}/invitations/${encodeURIComponent(invitationId)}/regenerate`,
          method: "POST",
        }),
        invalidatesTags: ["OrganizationInvitation"],
      }),

      previewInvitation: builder.mutation<
        InvitationPreviewResponse,
        { token: string }
      >({
        query: (body) => ({
          url: "/invitations/preview",
          method: "POST",
          body,
        }),
      }),
    }),
  });

export const {
  usePreviewInvitationMutation,
  useRegenerateInvitationMutation,
  useCreateOrganizationMutation,
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetOrganizationMembersQuery,
  useAddOrganizationMemberMutation,
  useCreateInvitationMutation,
  useGetInvitationsQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useRevokeInvitationMutation,
} = organizationApi;
