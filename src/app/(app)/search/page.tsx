"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FolderKanban, CheckSquare, Users, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectIcon } from "@/components/ui/ProjectIcon";

interface SearchResults {
  projects: Array<{ id: string; name: string; description?: string | null; icon: string; status: string }>;
  tasks: Array<{ id: string; title: string; status: string; priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; project: { id: string; name: string; icon: string } }>;
  users: Array<{ id: string; name: string; email: string; avatar?: string | null }>;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResults>({
    projects: [],
    tasks: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    async function performSearch() {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const body = await res.json();
          setResults(body.data || { projects: [], tasks: [], users: [] });
        }
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const totalResults = results.projects.length + results.tasks.length + results.users.length;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Search Results</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Showing results for <strong className="text-[var(--text-primary)]">&quot;{query}&quot;</strong>
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[10px]" />
          ))}
        </div>
      ) : totalResults > 0 ? (
        <div className="space-y-6">
          {/* Projects */}
          {results.projects.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5" />
                Projects ({results.projects.length})
              </h2>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] divide-y divide-[var(--border-subtle)]">
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between p-3.5 hover:bg-[var(--background)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-text-secondary"><ProjectIcon name={p.icon} className="h-5 w-5" /></span>
                      <div>
                        <h3 className="text-xs font-semibold text-[var(--text-primary)]">{p.name}</h3>
                        {p.description && <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{p.description}</p>}
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" />
                Tasks ({results.tasks.length})
              </h2>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] divide-y divide-[var(--border-subtle)]">
                {results.tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between p-3.5 hover:bg-[var(--background)] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-semibold text-[var(--text-primary)]">{t.title}</h3>
                      <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                        <ProjectIcon name={t.project.icon} className="h-3 w-3" /> {t.project.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Teammates ({results.users.length})
              </h2>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] divide-y divide-[var(--border-subtle)]">
                {results.users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3.5">
                    <Avatar name={u.name} src={u.avatar} size="sm" />
                    <div>
                      <h3 className="text-xs font-semibold text-[var(--text-primary)]">{u.name}</h3>
                      <p className="text-[11px] text-[var(--text-muted)]">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`No projects, tasks, or teammates matching "${query}".`}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-[var(--text-muted)]">Searching...</div>}>
      <SearchContent />
    </Suspense>
  );
}
