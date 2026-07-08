import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ProjectDetail from "./components/Projeto/ProjectDetail";
import InfrastructurePanel from "./components/Infra/InfrastructurePanel";
import InventarioVmPanel from "./components/Infra/InventarioVmPanel";
import { AplicacaoPage } from "./components/Aplicacao/AplicacaoPage";
import { PROJECTS } from "./data/projects";
import { projetoService } from "./services/projeto.service";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./contexts/AuthContext";

type View =
  | "dashboard"
  | "members"
  | "project"
  | "infra"
  | "inventario"
  | "admin"
  | "aplicacao";

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [projetos, setProjetos] = useState<any[]>([]);

  useEffect(() => {
    projetoService.getProjects().then(setProjetos);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/projects/")) {
      const pathParts = location.pathname.split("/");
      const projectId = Number(pathParts[pathParts.length - 1]);
      setSelectedId(Number.isNaN(projectId) ? null : projectId);
    } else {
      setSelectedId(null);
    }
  }, [location.pathname]);

  function handleSelectProject(id: number) {
    setSelectedId(id);
    navigate(`/projects/${id}`);
  }

  function handleDashboard() {
    navigate("/dashboard");
    setSelectedId(null);
  }

  function handleInfra() {
    navigate("/infra");
    setSelectedId(null);
  }

  function handleInventario() {
    navigate("/inventario");
    setSelectedId(null);
  }

  function handleAplicacao() {
    navigate("/aplicacao");
    setSelectedId(null);
  }

  const view = useMemo<View>(() => {
    if (location.pathname === "/infra") return "infra";
    if (location.pathname === "/inventario") return "inventario";
    if (location.pathname === "/admin") return "admin";
    if (location.pathname === "/aplicacao") return "aplicacao";
    if (location.pathname.startsWith("/projects/")) return "project";
    return "dashboard";
  }, [location.pathname]);

  const selectedProject =
    projetos.find((p) => p.projectId === selectedId) ?? null;

  const renderContent = () => {
    if (location.pathname === "/infra") return <InfrastructurePanel />;
    if (location.pathname === "/inventario") return <InventarioVmPanel />;
    if (location.pathname === "/admin") return <AplicacaoPage />;
    if (location.pathname === "/aplicacao") return <AplicacaoPage />;
    if (location.pathname.startsWith("/projects/")) {
      return selectedProject ? (
        <ProjectDetail project={selectedProject} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Projeto não encontrado.
        </div>
      );
    }

    return <Dashboard projects={PROJECTS} onSelect={handleSelectProject} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar
        projects={projetos}
        selectedId={selectedId}
        view={view}
        onSelect={handleSelectProject}
        onDashboard={handleDashboard}
        onMembers={() => {}}
        onInfra={handleInfra}
        onInventario={handleInventario}
        onAplicacao={handleAplicacao}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{renderContent()}</div>
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-600">
        Carregando sessão...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<AppLayout />} />
      <Route path="/infra" element={<AppLayout />} />
      <Route path="/inventario" element={<AppLayout />} />
      <Route path="/projects/:id" element={<AppLayout />} />

      <Route
        path="/aplicacao"
        element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}
