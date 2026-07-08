import { ChevronDown, FolderGit2, LogOut, UserCircle2 } from "lucide-react";
import { GROUP_NAME } from "../data/projects";
import type { Project } from "../types";

interface SidebarHeaderProps {
  projects: Project[];
  displayName: string;
  initials: string;
  email?: string;
  username?: string;
  isAuthenticated: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

export function SidebarHeader({
  projects,
  displayName,
  initials,
  email,
  username,
  isAuthenticated,
  menuOpen,
  onToggleMenu,
  onLogout,
  onLogin,
}: SidebarHeaderProps) {
  return (
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
            onClick={onToggleMenu}
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
                {email || username || "Sessão ativa"}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {menuOpen ? (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              <div className="rounded-md px-3 py-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{username}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
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
  );
}
