"use client";

import { CheckCircle2, Copy, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationLink: string;
  email: string;
  role: string;
}

export function InvitationSuccessDialog({
  open,
  onOpenChange,
  invitationLink,
  email,
  role,
}: Props) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      toast.success("Invitation link copied");
    } catch {
      toast.error("Unable to copy invitation link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <CheckCircle2 className="mb-2 size-10 text-green-600" />

          <DialogTitle>Invitation created</DialogTitle>

          <DialogDescription>
            Share this link to invite your team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Invited email
            </p>
            <p className="font-medium">{email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Assigned role
            </p>
            <p className="font-medium capitalize">{role}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Invitation link
            </p>

            <div className="flex gap-2">
              <Input value={invitationLink} readOnly />

              <Button variant="outline" onClick={copyLink}>
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            This invitation expires after 7 days.
          </div>

          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}