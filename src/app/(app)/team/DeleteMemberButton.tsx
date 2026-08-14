"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/Modal";

interface Props {
  memberId: string;
  memberName: string;
}

export function DeleteMemberButton({ memberId, memberName }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${memberId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Delete Member"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Remove Workspace Member"
        description={`Are you sure you want to remove ${memberName} from the workspace? This will delete all their data and cannot be undone.`}
        confirmLabel="Remove Member"
        isLoading={isDeleting}
      />
    </>
  );
}
