
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MailCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  usePreviewInvitationMutation,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} from "@/features/organizations/organizationApi";

export default function InvitationResponsePage() {
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center">Loading invitation...</p>}>
      <InvitationResponse />
    </Suspense>
  );
}

function InvitationResponse() {
  const searchParams = useSearchParams();
  return <InvitationResponseContent key={searchParams.get("token")} token={searchParams.get("token")} />;
}

function InvitationResponseContent({ token }: { token: string | null }) {
  const router = useRouter();
  const [previewInvitation, { data: preview, isLoading: previewing, isError: previewFailed }] =
    usePreviewInvitationMutation();

  useEffect(() => {
    if (token) void previewInvitation({ token });
  }, [token, previewInvitation]);

  const [acceptInvitation, { isLoading: accepting }] =
    useAcceptInvitationMutation();

  const [declineInvitation, { isLoading: declining }] =
    useDeclineInvitationMutation();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const busy = accepting || declining;
  const canRespond = Boolean(token && preview && !previewing && !previewFailed && preview.status === "pending");

  async function handleAccept() {
    if (!token || !canRespond || busy || success) return;

    setError("");

    try {
      const result = await acceptInvitation({ token }).unwrap();

      router.replace(
        `/dashboard?organizationId=${encodeURIComponent(
          result.organizationId
        )}`
      );
    } catch {
      setError(
        "Unable to accept this invitation. It may have expired, already been used, or belong to another account."
      );
    }
  }

  async function handleDecline() {
    if (!token || !canRespond || busy || success) return;

    setError("");

    try {
      await declineInvitation({ token }).unwrap();
      setSuccess("You have declined this invitation.");
    } catch {
      setError(
        "Unable to decline this invitation. Please try again."
      );
    }
  }

  return (
    <main className="auth-layout flex min-h-dvh items-center justify-center bg-[#F8F4FF] px-5 py-12">
      <div className="w-full max-w-[480px] rounded-[28px] border border-[#E8DFF7] bg-white p-8 text-center shadow-[0_25px_80px_rgba(105,70,170,0.1)] sm:p-10">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#F0E6FF] text-[#9160EF]">
          <MailCheck size={32} />
        </div>

        <h1 className="text-[30px] font-bold tracking-[-0.045em] text-[#17152B]">
          You&apos;re invited!
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#69647C]">
          {preview
            ? `You've been invited to join ${preview.organization.name} as ${preview.role}.`
            : "You've received an invitation to collaborate in a TeamFlow organization."}
        </p>

        {token && (previewing || (!preview && !previewFailed)) && (
          <p role="status" className="mt-6 text-sm text-[#69647C]">Loading invitation details...</p>
        )}

        {previewFailed && (
          <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            This invitation is unavailable. It may have expired or already been used. Ask the organization admin for a new link.
            <Button variant="outline" className="mt-3" onClick={() => token && previewInvitation({ token })}>
              Try again
            </Button>
          </div>
        )}

        {preview && (
          <p className="mt-3 text-xs text-[#69647C]">
            Expires {new Date(preview.expiresAt).toLocaleString()}
          </p>
        )}

        {!token && (
          <div
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600"
          >
            Invalid invitation link. The token is missing.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {success ? (
          <div
            role="status"
            className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 size={18} />
            {success}
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            <Button
              type="button"
              onClick={handleAccept}
              disabled={!canRespond || busy}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#A36AF0] to-[#8754E8] text-white"
            >
              {accepting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Accept invitation
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDecline}
              disabled={!canRespond || busy}
              className="h-12 w-full rounded-xl border-[#DDD9E8]"
            >
              {declining ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <XCircle size={18} />
              )}
              Decline invitation
            </Button>
          </div>
        )}

        <p className="mt-6 text-xs text-[#9993A9]">
          Sign in with the email address that received the invitation.
        </p>
      </div>
    </main>
  );
}
