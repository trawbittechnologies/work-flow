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
    <div className="space-y-4 pt-6 mt-6 border-t border-border-subtle">
      <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4 text-text-muted" />
        Comments ({comments.length})
      </h3>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment to this task..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 h-9 px-3.5 text-sm rounded-lg border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-text-primary placeholder:text-text-muted transition-all"
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
          <div key={comment.id} className="flex items-start gap-3 bg-surface p-3.5 rounded-xl border border-border shadow-sm">
            <Avatar name={comment.user.name} src={comment.user.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-sm font-bold text-text-primary">{comment.user.name}</span>
                <span className="text-[11px] font-medium text-text-muted">{formatRelative(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6 bg-surface-alt rounded-xl border border-dashed border-border">No comments yet. Be the first to start the conversation.</p>
        )}
      </div>
    </div>
  );
}
