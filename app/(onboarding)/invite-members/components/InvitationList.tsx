
"use client";

import { useState } from "react";
import {
  Clock3,
  Loader2,
  Mail,
  RotateCcw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  useGetInvitationsQuery,
  useRevokeInvitationMutation,
  useRegenerateInvitationMutation,
  type OrganizationInvitation,
  readInvitationList,
} from "@/features/organizations/organizationApi";

interface Props {
  organizationId: string;
}

function getStatus(invitation: OrganizationInvitation) {
  if (
    invitation.status === "pending" &&
    new Date(invitation.expiresAt).getTime() <= Date.now()
  ) {
    return "expired";
  }

  return invitation.status;
}

export function InvitationList({ organizationId }: Props) {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetInvitationsQuery(organizationId, {
    skip: !organizationId,
  });
  const parsedInvitations = data === undefined ? [] : readInvitationList(data);
  const invitations = parsedInvitations ?? [];

  console.log("invitations", invitations);

  const [regenerateInvitation] = useRegenerateInvitationMutation();
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState("");
  const [revokeInvitation] = useRevokeInvitationMutation();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleRegenerate(invitationId: string) {
    setError("");
    setInvitationLink("");
    setRegeneratingId(invitationId);
    try {
      const result = await regenerateInvitation({ organizationId, invitationId }).unwrap();
      setInvitationLink(result.invitationLink);
    } catch {
      setError("Unable to regenerate invitation. Only organization owners and admins can regenerate pending invitations.");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function handleRevoke(invitationId: string) {
    setError("");
    setRevokingId(invitationId);

    try {
      await revokeInvitation({
        organizationId,
        invitationId,
      }).unwrap();
    } catch {
      setError("Unable to revoke invitation. Please try again.");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E8E2F1] bg-white shadow-[0_4px_20px_rgba(60,40,100,0.04)]">
      <div className="flex items-center justify-between border-b border-[#F0ECF5] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#17152B]">
            Invitations
          </h2>
          <p className="mt-1 text-xs text-[#77718E]">
            Manage pending and previous invitations
          </p>
        </div>

        <span className="rounded-full bg-[#F2EAFF] px-3 py-1 text-xs font-semibold text-[#8754E8]">
          {invitations.length}
        </span>
      </div>

      {invitationLink && (
        <div role="status" className="px-5 pt-4 text-sm text-[#625D76]">
          <label htmlFor="regenerated-invitation">New invitation link. Copy and share it with the invitee. The previous link is no longer valid.</label>
          <input id="regenerated-invitation" readOnly value={invitationLink} onFocus={(event) => event.target.select()} className="mt-2 w-full rounded-lg border p-2" />
        </div>
      )}

      {error && (
        <p role="alert" className="px-5 pt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#9160EF]" />
        </div>
      ) : isError || parsedInvitations === null ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-red-600">
            Could not load invitations?.
          </p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      ) : invitations?.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-12 text-center">
          <div className="mb-4 rounded-2xl bg-[#F3EDFF] p-4">
            <Users size={26} className="text-[#9160EF]" />
          </div>
          <p className="font-medium text-[#17152B]">
            No invitations yet
          </p>
          <p className="mt-1 text-sm text-[#77718E]">
            Invite teammates to start collaborating.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0ECF5]">
          {invitations.map((invitation) => {
            const status = getStatus(invitation);
            const canRevoke = status === "pending";

            return (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0E6FF] text-[#8754E8]">
                  <Mail size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#211C32]">
                    {invitation.email}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#77718E]">
                    <Clock3 size={12} />
                    Expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                <span className="rounded-lg border border-[#E4DDF1] px-2.5 py-1 text-xs text-[#625D76]">
                  {invitation.role}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    status === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : status === "accepted"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status}
                </span>

                {invitation.status === "pending" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={regeneratingId !== null || revokingId !== null}
                    onClick={() => handleRegenerate(invitation.id)}
                  >
                    {regeneratingId === invitation.id && <Loader2 size={14} className="animate-spin" />}
                    Regenerate link
                  </Button>
                )}

                {canRevoke && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revokingId !== null || regeneratingId !== null}
                    onClick={() => handleRevoke(invitation.id)}
                    className="rounded-lg border-[#E4DDF1] text-[#8754E8]"
                  >
                    {revokingId === invitation.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RotateCcw size={14} />
                    )}
                    Revoke
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
