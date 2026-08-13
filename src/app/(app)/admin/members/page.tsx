"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { UserPlus, Shield, ShieldOff, Trash2, Users, Search, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  createdAt: string;
  _count: { projectMembships: number; assignedTasks: number };
}

export default function AdminMembersPage() {
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MEMBER" as "ADMIN" | "MEMBER" });

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch {
      showError("Error", "Could not load members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUsers(data.data || []);
        }
      } catch {
        if (isMounted) showError("Error", "Could not load members.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [showError]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) { showError("Failed", body.error); return; }
      success("Member created!", `${form.name || form.email} has been added to the workspace.`);
      setForm({ name: "", email: "", password: "", role: "MEMBER" });
      setIsCreateOpen(false);
      loadUsers();
    } catch {
      showError("Error", "Failed to create member.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleRole(user: WorkspaceUser) {
    const newRole = user.role === "ADMIN" ? "MEMBER" : "ADMIN";
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) { showError("Failed", "Could not update role."); return; }
      success("Role updated", `${user.name} is now ${newRole === "ADMIN" ? "an Admin" : "a Member"}.`);
      loadUsers();
    } catch {
      showError("Error", "Failed to update role.");
    }
  }

  async function handleToggleActive(user: WorkspaceUser) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) { showError("Failed", "Could not update status."); return; }
      success(user.isActive ? "Member deactivated" : "Member reactivated", `${user.name}'s account is now ${!user.isActive ? "active" : "deactivated"}.`);
      loadUsers();
    } catch {
      showError("Error", "Failed to update status.");
    }
  }

  async function handleDeleteUser() {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, { method: "DELETE" });
      if (!res.ok) { const b = await res.json(); showError("Failed", b.error); return; }
      success("Member removed", "The member has been removed from the workspace.");
      setDeleteUserId(null);
      loadUsers();
    } catch {
      showError("Error", "Failed to remove member.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Workspace Members</h1>
          <p className="text-xs text-text-muted mt-0.5">{users.length} members in total</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setIsCreateOpen(true)}>
          Add Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-8 pr-3 text-sm rounded-[8px] border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-[10px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="No members match your search." />
      ) : (
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-alt">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Projects</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Tasks</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((user) => (
                  <tr key={user.id} className={cn("hover:bg-background transition-colors", !user.isActive && "opacity-60")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} src={user.avatar} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{user.name}</p>
                          <p className="text-[11px] text-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        user.role === "ADMIN"
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                          : "bg-surface-alt text-text-muted border border-border"
                      )}>
                        {user.role === "ADMIN" && <Shield className="h-2.5 w-2.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{user._count.projectMembships}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{user._count.assignedTasks}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-[10px] font-semibold",
                        user.isActive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-500"
                      )}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggleRole(user)}
                          title={user.role === "ADMIN" ? "Demote to Member" : "Promote to Admin"}
                          className="p-1.5 rounded-[6px] text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors"
                        >
                          {user.role === "ADMIN" ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          title={user.isActive ? "Deactivate" : "Reactivate"}
                          className="p-1.5 rounded-[6px] text-text-muted hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        >
                          {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          title="Remove from workspace"
                          className="p-1.5 rounded-[6px] text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Member Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Workspace Member" size="md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jane Smith" required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" required />
          <Input label="Initial Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="password123" required />
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "MEMBER" })}
              className="w-full h-9 px-3 text-sm rounded-[8px] border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={creating}>Add Member</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Remove Member"
        description="This will permanently remove this user from the workspace and all their project memberships. This cannot be undone."
        confirmLabel="Remove"
        isLoading={deleting}
      />
    </div>
  );
}
