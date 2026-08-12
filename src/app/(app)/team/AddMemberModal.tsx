"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus, Key } from "lucide-react";
import { addTeamMember } from "./actions";
import { useToast } from "@/components/ui/Toast";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success } = useToast();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await addTeamMember(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      success("Member added", "The new member has been added to the workspace.");
      onClose();
    }
    
    setIsLoading(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Workspace Member"
      description="Create a new member account. They can change this password later."
      size="md"
    >
      <form action={handleSubmit} className="space-y-4 py-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g. John Doe"
          required
          autoFocus
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
        />

        <div className="space-y-1">
          <Input
            label="Temporary Password"
            name="password"
            type="text"
            placeholder="Min 6 characters"
            required
            minLength={6}
            leftAddon={<Key className="h-4 w-4 text-[var(--text-muted)]" />}
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Provide this password to the user so they can log in.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
            {error}
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-subtle)] mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            <UserPlus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
