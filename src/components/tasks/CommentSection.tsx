"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatRelative } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { CommentWithUser } from "@/types";

interface CommentSectionProps {
  taskId: string;
  comments: CommentWithUser[];
  onCommentAdded?: () => void;
}

export function CommentSection({ taskId, comments, onCommentAdded }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const { success, error: showError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        showError("Failed to add comment", "Please try again.");
        return;
      }

      setContent("");
      success("Comment added", "Your comment was posted.");
      onCommentAdded?.();
    } catch {
      showError("Error", "Could not submit comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t border-[var(--border)]">
      <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment to this task..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 h-9 px-3 text-xs rounded-[10px] border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)]"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={posting}
          disabled={!content.trim()}
          leftIcon={<Send className="h-3.5 w-3.5" />}
        >
          Comment
        </Button>
      </form>

      {/* List */}
      <div className="space-y-3 pt-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3 bg-[var(--background)] p-3 rounded-[10px] border border-[var(--border-subtle)]">
            <Avatar name={comment.user.name} src={comment.user.avatar} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[var(--text-primary)]">{comment.user.name}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{formatRelative(comment.createdAt)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
