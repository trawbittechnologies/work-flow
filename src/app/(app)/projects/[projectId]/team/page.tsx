"use client";

import { useState, useEffect, use } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { UserPlus, Trash2, Mail, Star } from "lucide-react";
import type { MemberWithUser } from "@/types";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default function ProjectTeamPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { success, error: showError } = useToast();
  const [members, setMembers] = useState<(MemberWithUser & { isLead?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/projects/${projectId}/members`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setMembers(data.data || []);
        }
      } catch {
        if (!ignore) showError("Error", "Could not fetch project members.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchMembers();
    return () => { ignore = true; };
  }, [projectId, showError]);

  async function reloadMembers() {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data || []);
      }
    } catch {
      showError("Error", "Could not fetch project members.");
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName || undefined,
          email: inviteEmail,
          password: invitePassword || undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        showError("Failed to add member", body.error);
        return;
      }

      success("Member added!", `${inviteEmail} is now part of this project.`);
      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      setIsInviteOpen(false);
      reloadMembers();
    } catch {
      showError("Error", "Failed to add member.");
    } finally {
      setInviting(false);
    }
  }

  async function handleSetLead(userId: string, currentIsLead: boolean) {
    try {
      const res = await fetch(`/api/projects/${projectId}/lead`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: currentIsLead ? null : userId }),
      });
      if (!res.ok) {
        showError("Error", "Could not update project lead.");
        return;
      }
      success("Project Lead", currentIsLead ? "Lead removed." : "Lead assigned.");
      reloadMembers();
    } catch {
      showError("Error", "Failed to update project lead.");
    }
  }

  async function handleRemoveMember() {
    if (!removeMemberId) return;

    setRemoving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${removeMemberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json();
        showError("Failed to remove member", body.error);
        return;
      }

      success("Member removed", "Member has been removed from the project.");
      setRemoveMemberId(null);
      reloadMembers();
    } catch {
      showError("Error", "Could not remove member.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Team Members</h2>
          <p className="text-xs text-[var(--text-muted)]">People who have access to this project</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          onClick={() => setIsInviteOpen(true)}
        >
          Add Teammate
        </Button>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[14px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-4 flex flex-col justify-between shadow-xs relative group"
            >
              <div className="flex items-start gap-3">
                <Avatar name={member.user?.name || "Unknown"} src={member.user?.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {member.user?.name || "Unknown User"}
                    </h3>
                    {member.role === "OWNER" && (
                      <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.2 rounded uppercase">
                        Owner
                      </span>
                    )}
                    {member.isLead && (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded uppercase flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Lead
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {member.user?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Workload */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">{member.assignedTasks}</span> tasks assigned
                </div>
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">{member.completedTasks}</span> completed
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSetLead(member.userId, !!member.isLead)}
                    className={`p-1 rounded transition-colors ${member.isLead ? "text-amber-500" : "text-[var(--text-muted)] hover:text-amber-500"}`}
                    title={member.isLead ? "Remove as Lead" : "Make Project Lead"}
                  >
                    <Star className={`h-3.5 w-3.5 ${member.isLead ? "fill-amber-500" : ""}`} />
                  </button>

                  {member.role !== "OWNER" && (
                    <button
                      onClick={() => setRemoveMemberId(member.userId)}
                      className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Remove member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Teammate Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Add Teammate to Project"
        description="Enter user details. If the account does not exist, Flowdesk will create it for them automatically."
        size="md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Full Name (optional)"
            type="text"
            placeholder="e.g. John Doe"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />

          <Input
            label="User Email"
            type="email"
            placeholder="teammate@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Input
            label="Initial Password (optional, default: password123)"
            type="password"
            placeholder="password123"
            value={invitePassword}
            onChange={(e) => setInvitePassword(e.target.value)}
            helperText="Provide a password for new users to log in with."
          />

          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={inviting}>
              Add Teammate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={!!removeMemberId}
        onClose={() => setRemoveMemberId(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        description="Are you sure you want to remove this user from the project?"
        confirmLabel="Remove"
        isLoading={removing}
      />
    </div>
  );
}
