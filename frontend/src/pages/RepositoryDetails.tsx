import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileCode2,
  Folder,
  GitBranch,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from "@/context/useAuth";
import {
  getFileChunks,
  getRepository,
  getRepositoryFiles,
} from "@/services/repository.service";
import {
  getRepositoryDependencies,
  type RepositoryDependency,
} from "@/services/dependency.service";

import type { CodeChunk, Repository, RepositoryFile } from "@/types/repository";

type WorkspaceTab = "overview" | "code" | "architecture" | "chat";

function getStatusInfo(status: string) {
  switch (status.toUpperCase()) {
    case "READY":
      return {
        label: "Ready",
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      };

    case "PROCESSING":
    case "INDEXING":
    case "CLONING":
      return {
        label: "Indexing",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      };

    case "FAILED":
      return {
        label: "Failed",
        className: "border-red-500/20 bg-red-500/10 text-red-400",
      };

    default:
      return {
        label: "Pending",
        className: "border-slate-500/20 bg-slate-500/10 text-slate-400",
      };
  }
}

function getFileExtension(file: RepositoryFile) {
  if (file.extension) {
    return file.extension.replace(".", "").toUpperCase();
  }

  const parts = file.name.split(".");

  return parts.length > 1 ? (parts.at(-1)?.toUpperCase() ?? "FILE") : "FILE";
}

export default function RepositoryDetails() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [files, setFiles] = useState<RepositoryFile[]>([]);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  const [search, setSearch] = useState("");

  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [chunks, setChunks] = useState<CodeChunk[]>([]);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [dependencies, setDependencies] = useState<RepositoryDependency[]>([]);
  const [isDepsLoading, setIsDepsLoading] = useState(false);
  const [depsError, setDepsError] = useState("");

  const loadRepository = useCallback(
    async (showRefreshing = false) => {
      if (!token || !repositoryId) return;

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      try {
        const [repoRes, filesRes] = await Promise.all([
          getRepository(token, repositoryId),
          getRepositoryFiles(token, repositoryId),
        ]);

        setRepository(repoRes.data);
        setFiles(filesRes.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load repository",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, repositoryId],
  );

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!token || !repositoryId) return
      try {
        const [repoRes, filesRes] = await Promise.all([
          getRepository(token, repositoryId),
          getRepositoryFiles(token, repositoryId),
        ])
        if (!cancelled) {
          setRepository(repoRes.data)
          setFiles(filesRes.data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load repository')
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => { cancelled = true }
  }, [token, repositoryId])

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return files;
    }

    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(query) ||
        file.path.toLowerCase().includes(query) ||
        file.language?.toLowerCase().includes(query),
    );
  }, [files, search]);

  async function handleFileSelect(file: RepositoryFile) {
    if (!token || !repositoryId) return;
    setSelectedFile(file);
    setFileError("");
    setChunks([]);
    setIsFileLoading(true);
    try {
      const response = await getFileChunks(token, repositoryId, file.id);
      const sorted = [...response.data].sort((a, b) => a.chunkIndex - b.chunkIndex);
      setChunks(sorted);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setIsFileLoading(false);
    }
  }

  function handleTabChange(tab: WorkspaceTab) {
    setActiveTab(tab);
    if (tab !== "code") {
      setSelectedFile(null);
      setChunks([]);
      setFileError("");
    }
    if (tab === "architecture" && dependencies.length === 0 && !isDepsLoading) {
      if (!token || !repositoryId) return;
      setIsDepsLoading(true);
      setDepsError("");
      getRepositoryDependencies(token, repositoryId)
        .then((res) => setDependencies(res.data))
        .catch((err) =>
          setDepsError(err instanceof Error ? err.message : "Failed to load dependencies"),
        )
        .finally(() => setIsDepsLoading(false));
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
          <p className="text-sm">Loading repository...</p>
        </div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card className="border-red-500/20 bg-[#111720]">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-red-400">
              {error || "Repository not found"}
            </p>

            <Button
              variant="outline"
              className="mt-5"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getStatusInfo(repository.status);

  return (
    <div className="min-h-full bg-[#0b0f14]">
      <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Repositories
          </Link>

          <span className="text-slate-700">/</span>

          <span className="max-w-[250px] truncate text-slate-300">
            {repository.name}
          </span>
        </div>

        {/* Repository Header */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#151c27] via-[#111720] to-[#0d1219]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative p-6 lg:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-violet-400">
                  <Sparkles className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                      {repository.name}
                    </h1>

                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </div>

                  <a
                    href={repository.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex max-w-xl items-center gap-1.5 truncate font-mono text-xs text-slate-500 hover:text-violet-400"
                  >
                    {repository.githubUrl}

                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" />
                      {repository.branch || "main"}
                    </span>

                    <span>{files.length} files</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadRepository(true)}
                disabled={isRefreshing}
                className="gap-2 border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </section>

        {/* Workspace Tabs */}
        <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-white/[0.07]">
          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("code")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "code"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Code Explorer
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("architecture")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "architecture"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Architecture
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("chat")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "chat"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            AI Chat
          </button>
        </div>

        {/* ================================================= */}
        {/* OVERVIEW */}
        {/* ================================================= */}

        {activeTab === "overview" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <Card className="border-white/[0.07] bg-[#111720] shadow-none">
              <CardHeader>
                <CardTitle className="text-base text-white">
                  Repository overview
                </CardTitle>

                <p className="mt-1 text-xs text-slate-500">
                  CodeLens AI has analyzed this repository.
                </p>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <p className="text-xs text-slate-500">Files</p>

                    <p className="mt-2 text-2xl font-semibold text-white">
                      {files.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <p className="text-xs text-slate-500">Branch</p>

                    <p className="mt-2 truncate font-mono text-sm text-white">
                      {repository.branch || "main"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <p className="text-xs text-slate-500">Status</p>

                    <p className="mt-2 text-sm font-medium text-emerald-400">
                      {status.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-500/10 bg-gradient-to-br from-violet-500/[0.08] to-transparent shadow-none">
              <CardContent className="p-5">
                <Sparkles className="h-5 w-5 text-violet-400" />

                <h3 className="mt-4 font-semibold text-white">
                  Explore your codebase
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Browse source files, inspect architecture, and ask CodeLens AI
                  questions about this repository.
                </p>

                <Button
                  className="mt-5 w-full gap-2 bg-violet-600 hover:bg-violet-500"
                  onClick={() => handleTabChange("code")}
                  disabled={repository.status !== "READY"}
                >
                  <FileCode2 className="h-4 w-4" />
                  Open Code Explorer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================================================= */}
        {/* CODE EXPLORER */}
        {/* ================================================= */}

        {activeTab === "code" && (
          <Card className="overflow-hidden border-white/[0.07] bg-[#111720] shadow-none">
            <div className="grid min-h-[650px] xl:grid-cols-[360px_1fr]">
              {/* File Explorer */}
              <div className="border-b border-white/[0.06] xl:border-b-0 xl:border-r">
                <div className="border-b border-white/[0.06] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Explorer
                  </p>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />

                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search files..."
                      className="h-9 border-white/[0.07] bg-black/20 pl-9 text-xs text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="max-h-[560px] overflow-y-auto p-2">
                  {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                      <Folder className="h-7 w-7 text-slate-700" />

                      <p className="mt-3 text-sm text-slate-500">
                        No files found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {filteredFiles.map((file) => {
                        const isSelected = selectedFile?.id === file.id;

                        return (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => void handleFileSelect(file)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-violet-500/10 text-white"
                                : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                            }`}
                          >
                            <FileCode2
                              className={`h-4 w-4 shrink-0 ${
                                isSelected
                                  ? "text-violet-400"
                                  : "text-slate-600"
                              }`}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-xs">
                                {file.path}
                              </p>
                            </div>

                            <span className="hidden text-[9px] text-slate-600 2xl:block">
                              {getFileExtension(file)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* File Viewer */}
              <div className="min-w-0">
                {!selectedFile ? (
                  <div className="flex min-h-[650px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                      <FileCode2 className="h-6 w-6" />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-white">
                      Select a file
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Choose a file from the explorer to inspect its indexed
                      information.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm text-white">
                          {selectedFile.path}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {selectedFile.language || "Unknown language"}
                          {selectedFile.size
                            ? ` • ${selectedFile.size} bytes`
                            : ""}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                        className="ml-4 shrink-0 text-slate-500 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isFileLoading ? (
                      <div className="flex min-h-[560px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                          <p className="text-xs">Loading file...</p>
                        </div>
                      </div>
                    ) : fileError ? (
                      <div className="p-6">
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                          <p className="text-sm text-red-400">{fileError}</p>
                        </div>
                      </div>
                    ) : chunks.length === 0 ? (
                      <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                        <Folder className="h-7 w-7 text-slate-700" />
                        <p className="mt-3 text-sm text-slate-500">No indexed chunks found for this file.</p>
                      </div>
                    ) : (
                      <div className="overflow-auto">
                        <table className="w-full border-collapse font-mono text-xs">
                          <tbody>
                            {chunks.map((chunk) =>
                              chunk.content.split('\n').map((line, i) => {
                                const lineNumber = chunk.startLine + i;
                                return (
                                  <tr
                                    key={`${chunk.id}-${lineNumber}`}
                                    className="group hover:bg-white/[0.02]"
                                  >
                                    <td className="w-12 select-none border-r border-white/[0.04] px-3 py-0.5 text-right text-slate-600 group-hover:text-slate-500">
                                      {lineNumber}
                                    </td>
                                    <td className="px-4 py-0.5 text-slate-300 whitespace-pre">
                                      {line || ' '}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* ================================================= */}
        {/* ARCHITECTURE */}
        {/* ================================================= */}

        {activeTab === "architecture" && (
          <div className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Dependency graph</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Internal file imports resolved by CodeLens AI.
                </p>
              </div>
              {!isDepsLoading && (
                <Badge variant="outline" className="border-white/[0.07] text-slate-400">
                  {dependencies.length} edges
                </Badge>
              )}
            </div>

            {isDepsLoading ? (
              <Card className="border-white/[0.07] bg-[#111720] shadow-none">
                <CardContent className="flex min-h-[500px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                    <p className="text-sm text-slate-500">Analysing dependencies...</p>
                  </div>
                </CardContent>
              </Card>
            ) : depsError ? (
              <Card className="border-red-500/20 bg-[#111720] shadow-none">
                <CardContent className="p-6">
                  <p className="text-sm text-red-400">{depsError}</p>
                </CardContent>
              </Card>
            ) : dependencies.length === 0 ? (
              <Card className="border-white/[0.07] bg-[#111720] shadow-none">
                <CardContent className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">No dependencies found</h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    This repository has no resolved internal imports. Try a repository
                    with TypeScript or Python files that import each other.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-white/[0.07] bg-[#111720] shadow-none">
                <div className="divide-y divide-white/[0.05]">
                  {(() => {
                    // Group edges by source file
                    const grouped = new Map<string, { source: RepositoryDependency['sourceFile']; targets: { file: RepositoryDependency['targetFile']; type: string }[] }>();
                    for (const dep of dependencies) {
                      const existing = grouped.get(dep.sourceFileId);
                      if (existing) {
                        existing.targets.push({ file: dep.targetFile, type: dep.type });
                      } else {
                        grouped.set(dep.sourceFileId, {
                          source: dep.sourceFile,
                          targets: [{ file: dep.targetFile, type: dep.type }],
                        });
                      }
                    }
                    return Array.from(grouped.values()).map((group) => (
                      <div key={group.source.id} className="p-5">
                        {/* Source file */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                            <FileCode2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-mono text-sm text-white">{group.source.path}</p>
                            <p className="text-xs text-slate-600">{group.source.language ?? 'Unknown'}</p>
                          </div>
                          <Badge variant="outline" className="ml-auto shrink-0 border-white/[0.07] text-[10px] text-slate-500">
                            {group.targets.length} import{group.targets.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {/* Edges */}
                        <div className="ml-4 mt-2 space-y-1.5 border-l border-white/[0.06] pl-7">
                          {group.targets.map((t) => (
                            <div key={t.file.id} className="flex items-center gap-3">
                              <ArrowLeft className="h-3 w-3 shrink-0 rotate-180 text-slate-700" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-xs text-slate-400">{t.file.path}</p>
                              </div>
                              <span className="shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                {t.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* AI CHAT */}
        {/* ================================================= */}

        {activeTab === "chat" && (
          <Card className="border-white/[0.07] bg-[#111720] shadow-none">
            <CardContent className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Sparkles className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                Ask CodeLens AI
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Your conversational RAG engine is already implemented. We'll
                connect the existing chat API to this workspace next.
              </p>

              <Badge
                variant="outline"
                className="mt-5 border-violet-500/20 bg-violet-500/10 text-violet-400"
              >
                Coming next
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
