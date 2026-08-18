"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/Modal";
import { FolderOpen, Upload, Download, Trash2, File, Image as ImageIcon, FileText, FileCode, FileVideo } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  userId: string;
  user: { id: string; name: string; avatar?: string | null };
}

interface FilesManagerProps {
  projectId: string;
  initialFiles: FileItem[];
  currentUserId: string;
  userRole: "OWNER" | "MEMBER";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-indigo-500" />;
  if (mimeType.startsWith("video/")) return <FileVideo className="h-5 w-5 text-purple-500" />;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes("code") || mimeType.includes("json") || mimeType.includes("javascript")) return <FileCode className="h-5 w-5 text-emerald-500" />;
  return <File className="h-5 w-5 text-text-muted" />;
}

export function FilesManager({ projectId, initialFiles, currentUserId, userRole }: FilesManagerProps) {
  const { success, error: showError } = useToast();
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [prevInitialFiles, setPrevInitialFiles] = useState(initialFiles);
  if (prevInitialFiles !== initialFiles) {
    setPrevInitialFiles(initialFiles);
    setFiles(initialFiles);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json();
        showError("Upload failed", body.error || "Could not upload file.");
        return;
      }

      const data = await res.json();
      setFiles((prev) => [data.data, ...prev]);
      success("File uploaded", `"${file.name}" was uploaded successfully.`);
    } catch {
      showError("Error", "Failed to upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/uploads/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        showError("Failed", body.error || "Could not delete file.");
        return;
      }
      setFiles((prev) => prev.filter((f) => f.id !== deleteId));
      success("File deleted", "The file has been removed.");
      setDeleteId(null);
    } catch {
      showError("Error", "Failed to delete file.");
    } finally {
      setDeleting(false);
    }
  }

  const canDelete = (file: FileItem) => file.userId === currentUserId || userRole === "OWNER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-display uppercase text-[#071A49]">Project Files</h2>
          <p className="text-xs font-mono text-[#586274]">{files.length} file{files.length !== 1 ? "s" : ""} attached</p>
        </div>
        <label className={cn(
          "inline-flex items-center gap-2 h-9 px-4 text-xs font-mono font-bold uppercase rounded-[2px] bg-[#071A49] hover:bg-[#041030] text-[#B7D600] transition-all shadow-xs cursor-pointer active:scale-95",
          uploading && "opacity-60 pointer-events-none"
        )}>
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload File"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {files.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No files yet"
          description="Upload project files to share with your team."
        />
      ) : (
        <div className="bg-white border border-[#DDE2D8] rounded-[2px] divide-y divide-[#DDE2D8] overflow-hidden shadow-xs">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-4 group hover:bg-[#F8F9F6] transition-colors">
              <div className="flex-shrink-0 h-10 w-10 rounded-[2px] bg-[#F0F2EC] border border-[#DDE2D8] flex items-center justify-center">
                {getFileIcon(file.mimeType)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#071A49] truncate">{file.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap font-mono text-[10px]">
                  <span className="text-[#586274]">{formatFileSize(file.size)}</span>
                  <span className="text-[#8E99A8]">·</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar name={file.user.name} src={file.user.avatar} size="xs" className="rounded-[2px]" />
                    <span className="text-[#071A49] font-medium">{file.user.name}</span>
                  </div>
                  <span className="text-[#8E99A8]">·</span>
                  <span className="text-[#586274]">{formatRelative(file.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-[2px] text-[#8E99A8] hover:text-[#071A49] hover:bg-[#F0F2EC] transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                {canDelete(file) && (
                  <button
                    onClick={() => setDeleteId(file.id)}
                    className="p-2 rounded-[2px] text-[#8E99A8] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete File"
        description="This will permanently delete this file. This cannot be undone."
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
