"use client";

import { useState, useEffect, use } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { UserPlus, Trash2, Mail, Star, Search, Check, Shield } from "lucide-react";
import type { MemberWithUser } from "@/types";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: "ADMIN" | "MEMBER";
}

export default function ProjectTeamPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { success, error: showError } = useToast();
  const [members, setMembers] = useState<(MemberWithUser & { isLead?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Registered workspace users list
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"EXISTING" | "NEW">("EXISTING");

  // Form states
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviting, setInviting] = useState(false);

  const [addingUserId, setAddingUserId] = useState<string | null>(null);
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

  async function fetchWorkspaceUsers() {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const body = await res.json();
        setWorkspaceUsers(body.data || []);
      }
    } catch {
      showError("Error", "Could not load workspace members.");
    } finally {
      setLoadingUsers(false);
    }
  }

  function handleOpenModal() {
    setIsInviteOpen(true);
    fetchWorkspaceUsers();
  }

  async function handleAddExistingUser(userId: string) {
    setAddingUserId(userId);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const body = await res.json();
      if (!res.ok) {
        showError("Failed to add teammate", body.error);
        return;
      }

      const addedUser = workspaceUsers.find((u) => u.id === userId);
      success("Teammate added!", `${addedUser?.name || "Member"} is now part of this project.`);
      reloadMembers();
    } catch {
      showError("Error", "Failed to add teammate.");
    } finally {
      setAddingUserId(null);
    }
  }

  async function handleCreateNewMember(e: React.FormEvent) {
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

  const existingMemberUserIds = new Set(members.map((m) => m.userId));

  const availableWorkspaceUsers = workspaceUsers.filter(
    (u) =>
      !existingMemberUserIds.has(u.id) &&
      (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

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
          onClick={handleOpenModal}
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
        description="Select from registered workspace members or create a new user account."
        size="md"
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("EXISTING")}
              className={cn(
                "flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors",
                activeTab === "EXISTING"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              )}
            >
              Registered Members
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("NEW")}
              className={cn(
                "flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors",
                activeTab === "NEW"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              )}
            >
              Create New Account
            </button>
          </div>

          {activeTab === "EXISTING" ? (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search registered members..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-[8px] border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Members List */}
              {loadingUsers ? (
                <div className="space-y-2 py-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
                  ))}
                </div>
              ) : availableWorkspaceUsers.length === 0 ? (
                <div className="py-8 text-center bg-surface-alt border border-dashed border-border rounded-[10px]">
                  <p className="text-xs font-semibold text-text-primary">
                    {userSearch ? "No matching members found" : "All registered members are already in this project"}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">
                    Use &quot;Create New Account&quot; to invite a new teammate.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {availableWorkspaceUsers.map((user) => {
                    const isAdded = existingMemberUserIds.has(user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2.5 rounded-[10px] bg-surface hover:bg-background border border-border transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar name={user.name} src={user.avatar} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-text-primary truncate">
                                {user.name}
                              </span>
                              {user.role === "ADMIN" && (
                                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-1 py-0.2 rounded uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                          </div>
                        </div>

                        <Button
                          variant={isAdded ? "ghost" : "primary"}
                          size="sm"
                          disabled={isAdded || addingUserId === user.id}
                          isLoading={addingUserId === user.id}
                          onClick={() => handleAddExistingUser(user.id)}
                          className="ml-3 flex-shrink-0"
                        >
                          {isAdded ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Check className="h-3.5 w-3.5" /> Added
                            </span>
                          ) : (
                            "Add to Project"
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateNewMember} className="space-y-4">
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
                  Create & Add
                </Button>
              </div>
            </form>
          )}
        </div>
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
