"use client";

import { useState, useEffect, use } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/Modal";
import { MessagesSquare, Send, Reply, Pencil, Trash2, ChevronDown, ChevronRight, X, Check } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ projectId: string }> };

interface CommentUser { id: string; name: string; avatar?: string | null; }
interface ProjectCommentData {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies?: ProjectCommentData[];
}

interface CommentCardProps {
  comment: ProjectCommentData;
  currentUserId: string;
  projectId: string;
  onRefresh: () => void;
  isReply?: boolean;
}

function CommentCard({ comment, currentUserId, projectId, onRefresh, isReply }: CommentCardProps) {
  const { success, error: showError } = useToast();
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOwn = comment.userId === currentUserId;
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText, parentId: comment.id }),
      });
      if (!res.ok) { showError("Failed", "Could not post reply."); return; }
      setReplyText("");
      setIsReplying(false);
      setShowReplies(true);
      onRefresh();
    } catch {
      showError("Error", "Failed to post reply.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText }),
      });
      if (!res.ok) { showError("Failed", "Could not edit comment."); return; }
      setIsEditing(false);
      onRefresh();
    } catch {
      showError("Error", "Failed to edit comment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}/comments/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      onRefresh();
    } catch {
      showError("Error", "Failed to delete comment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("group", isReply && "ml-10 mt-3")}>
      <div className="flex gap-3">
        <Avatar name={comment.user.name} src={comment.user.avatar} size="sm" className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="bg-surface border border-border rounded-[12px] px-4 py-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-xs font-semibold text-text-primary">{comment.user.name}</span>
                <span className="text-[10px] text-text-muted ml-2">{formatRelative(comment.createdAt)}</span>
                {comment.updatedAt !== comment.createdAt && (
                  <span className="text-[10px] text-text-muted ml-1">(edited)</span>
                )}
              </div>
              {isOwn && !isEditing && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setIsEditing(true)} className="p-1 rounded text-text-muted hover:text-primary transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDeleteId(comment.id)} className="p-1 rounded text-text-muted hover:text-red-500 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEdit} className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  className="w-full text-sm text-text-primary bg-background border border-border rounded-[8px] px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="primary" isLoading={loading}>
                    <Check className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditText(comment.content); }}>
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-text-primary whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          {/* Actions */}
          {!isReply && (
            <div className="flex items-center gap-3 mt-1.5 px-1">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-primary transition-colors"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>
              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-primary transition-colors"
                >
                  {showReplies ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <form onSubmit={handleReply} className="mt-3 flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="flex-1 text-sm text-text-primary bg-background border border-border rounded-[8px] px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex flex-col gap-1">
                <Button type="submit" size="sm" variant="primary" isLoading={loading}>
                  <Send className="h-3 w-3" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </form>
          )}

          {/* Replies */}
          {showReplies && comment.replies?.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              projectId={projectId}
              onRefresh={onRefresh}
              isReply
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Comment"
        description="This will permanently delete this comment and all its replies."
        confirmLabel="Delete"
        isLoading={loading}
      />
    </div>
  );
}

export default function ProjectCommentsPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { error: showError } = useToast();
  const [comments, setComments] = useState<ProjectCommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  async function loadComments() {
    try {
      const [commentsRes, sessionRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/comments`),
        fetch("/api/auth/session"),
      ]);
      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data.data || []);
      }
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setCurrentUserId(session?.user?.id || "");
      }
    } catch {
      showError("Error", "Could not load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadComments(); }, [projectId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) { showError("Failed", "Could not post comment."); return; }
      setNewComment("");
      loadComments();
    } catch {
      showError("Error", "Failed to post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-base font-bold text-text-primary">Project Comments</h2>
        <p className="text-xs text-text-muted">Team discussions and @mentions</p>
      </div>

      {/* New Comment */}
      <form onSubmit={handlePost} className="flex gap-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment... use @name to mention teammates"
          rows={3}
          className="flex-1 text-sm text-text-primary bg-surface border border-border rounded-[12px] px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
        />
        <Button type="submit" variant="primary" size="sm" isLoading={posting} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[12px]" />)}
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No comments yet"
          description="Start the conversation by posting the first comment."
        />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              projectId={projectId}
              onRefresh={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
