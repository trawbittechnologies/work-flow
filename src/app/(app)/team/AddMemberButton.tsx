"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { AddMemberModal } from "./AddMemberModal";

export function AddMemberButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Member
      </Button>
      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
