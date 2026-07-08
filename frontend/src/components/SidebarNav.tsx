import { LayoutDashboard, Server, Shield, Boxes } from "lucide-react";
import clsx from "clsx";

interface SidebarNavProps {
  view:
    | "dashboard"
    | "members"
    | "project"
    | "infra"
    | "inventario"
    | "admin"
    | "aplicacao";
  isAuthenticated: boolean;
  onDashboard: () => void;
  onInfra: () => void;
  onInventario: () => void;
  onAplicacao: () => void;
}

export function SidebarNav({
  view,
  isAuthenticated,
  onDashboard,
  onInfra,
  onInventario,
  onAplicacao,
}: SidebarNavProps) {
  return (
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
  );
}
