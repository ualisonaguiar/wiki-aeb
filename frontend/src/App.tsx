import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ProjectDetail from "./components/Projeto/ProjectDetail";
import MembersPanel from "./components/MembersPanel";
import { PROJECTS, MEMBERS } from "./data/projects";

type View = "dashboard" | "members" | "project";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  function handleSelectProject(id: number) {
    setSelectedId(id);
    setView("project");
  }

  function handleDashboard() {
    setView("dashboard");
    setSelectedId(null);
  }

  function handleMembers() {
    setView("members");
    setSelectedId(null);
  }

  const selectedProject = PROJECTS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar
        projects={PROJECTS}
        selectedId={selectedId}
        view={view}
        onSelect={handleSelectProject}
        onDashboard={handleDashboard}
        onMembers={handleMembers}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {view === "dashboard" && (
            <Dashboard projects={PROJECTS} onSelect={handleSelectProject} />
          )}
          {view === "members" && <MembersPanel members={MEMBERS} />}
          {view === "project" && selectedProject && (
            <ProjectDetail project={selectedProject} />
          )}
        </div>
      </main>
    </div>
  );
}
