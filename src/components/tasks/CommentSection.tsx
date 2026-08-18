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
    <div className="space-y-4 pt-6 mt-6 border-t border-[#DDE2D8]">
      <h3 className="text-sm font-bold uppercase font-display text-[#071A49] flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4 text-[#8E99A8]" />
        Comments ({comments.length})
      </h3>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment to this task..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 h-9 px-3.5 text-xs rounded-[2px] border border-[#DDE2D8] bg-[#F8F9F6] focus:outline-none focus:ring-1 focus:ring-[#071A49] focus:border-[#071A49] text-[#071A49] placeholder:text-[#8E99A8] transition-all"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={posting}
          disabled={!content.trim()}
          leftIcon={<Send className="h-3.5 w-3.5" />}
          className="rounded-[2px] font-mono text-xs uppercase"
        >
          Comment
        </Button>
      </form>

      {/* List */}
      <div className="space-y-3 pt-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3 bg-white p-3.5 rounded-[2px] border border-[#DDE2D8] shadow-xs">
            <Avatar name={comment.user.name} src={comment.user.avatar} size="sm" className="rounded-[2px] ring-1 ring-[#DDE2D8]" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-sm font-bold text-[#071A49]">{comment.user.name}</span>
                <span className="text-[10px] font-mono text-[#8E99A8]">{formatRelative(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-[#586274] mt-1 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-xs font-mono text-[#8E99A8] text-center py-6 bg-[#F8F9F6] rounded-[2px] border border-dashed border-[#DDE2D8]">No comments yet. Be the first to start the conversation.</p>
        )}
      </div>
    </div>
  );
}
