import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderGit2,
  LayoutDashboard,
  Server,
  Shield,
  ChevronDown,
  LogOut,
  UserCircle2,
} from "lucide-react";
import clsx from "clsx";
import type { Project } from "../types";
import { GROUP_NAME } from "../data/projects";
import { useAuth } from "../contexts/AuthContext";

import ProjectMenu from "./Menu/ProjectMenu";

interface Props {
  projects: Project[];
  selectedId: number | null;
  view:
    | "dashboard"
    | "members"
    | "project"
    | "infra"
    | "inventario"
    | "admin"
    | "aplicacao";
  onSelect: (id: number) => void;
  onDashboard: () => void;
  onMembers: () => void;
  onInfra: () => void;
  onInventario: () => void;
  onAplicacao: () => void;
}

export default function Sidebar({
  projects,
  selectedId,
  view,
  onSelect,
  onDashboard,
  onInfra,
  onInventario,
  onAplicacao,
}: Props) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.nome || user?.username || "Usuário";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/dashboard");
  };

  const onLogin = () => {
    navigate("/login");
  };

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

        {isAuthenticated ? (
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left transition hover:bg-gray-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {initials || <UserCircle2 size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {displayName}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user?.email || user?.username || "Sessão ativa"}
                </p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {menuOpen ? (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <div className="rounded-md px-3 py-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.username}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <UserCircle2 size={16} />
            Login CTI
          </button>
        )}
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
        {isAuthenticated ? (
          <>
            <button
              onClick={onInfra}
              className={clsx(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                view === "infra"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Server size={16} />
              Infraestrutura
            </button>
            <button
              onClick={onAplicacao}
              className={clsx(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                view === "aplicacao"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Shield size={16} />
              Aplicação
            </button>
          </>
        ) : null}
      </nav>

      <div className="px-3 py-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar projeto ou sigla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <ProjectMenu
          onSelect={onSelect}
          selectedId={selectedId}
          view={view}
          search={search}
        />
      </div>
    </aside>
  );
}
