import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types";
import { useAuth } from "../contexts/AuthContext";
import ProjectMenu from "./Menu/ProjectMenu";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarSearch } from "./SidebarSearch";

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
      <SidebarHeader
        projects={projects}
        displayName={displayName}
        initials={initials}
        email={user?.email}
        username={user?.username}
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((value) => !value)}
        onLogout={handleLogout}
        onLogin={onLogin}
      />

      <SidebarNav
        view={view}
        isAuthenticated={isAuthenticated}
        onDashboard={onDashboard}
        onInfra={onInfra}
        onInventario={onInventario}
        onAplicacao={onAplicacao}
      />

      <SidebarSearch value={search} onChange={setSearch} />

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
