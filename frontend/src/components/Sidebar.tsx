import { useState } from "react";
import { Search, FolderGit2, LayoutDashboard, Users } from "lucide-react";
import clsx from "clsx";
import type { Project } from "../types";
import { GROUP_NAME } from "../data/projects";

import ProjectMenu from "./Menu/ProjectMenu";

interface Props {
  projects: Project[];
  selectedId: number | null;
  view: "dashboard" | "members" | "project";
  onSelect: (id: number) => void;
  onDashboard: () => void;
  onMembers: () => void;
}

export default function Sidebar({
  projects,
  selectedId,
  view,
  onSelect,
  onDashboard,
  onMembers,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.last_activity_at).getTime() -
      new Date(a.last_activity_at).getTime(),
  );

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <FolderGit2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{GROUP_NAME}</p>
            <p className="text-xs text-gray-500">{projects.length} projetos</p>
          </div>
        </div>
      </div>

      <nav className="border-b border-gray-100 px-2 py-2">
        <button
          onClick={onDashboard}
          className={clsx(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            view === "dashboard"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          )}
        >
          <LayoutDashboard size={16} />
          Visão geral
        </button>
        <button
          onClick={onMembers}
          className={clsx(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            view === "members"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          )}
        >
          <Users size={16} />
          Membros
        </button>
      </nav>

      <div className="px-3 py-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <ProjectMenu onSelect={onSelect} selectedId={selectedId} view={view} />
      </div>
    </aside>
  );
}
