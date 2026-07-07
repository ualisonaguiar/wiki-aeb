import { Activity, Calendar, Code2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Project } from "../types";

import StatCard from "../utils/StatCard";
import { projetoService } from "./../services/projeto.service";
import AtividadeRecente from "./AtividadeRecente";
import GraficoLinguagem from "./GraficoLinguagem";
import ProjectCard from "./ProjetoCard";

interface Props {
  projects: Project[];
  onSelect: (id: number) => void;
}

const PROJECTS_PER_PAGE = 12;

export default function Dashboard({ projects, onSelect }: Props) {

  const [projetos, setProjetos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    projetoService.getProjects().then(setProjetos);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [projetos.length]);

  const totalPages = Math.max(1, Math.ceil(projetos.length / PROJECTS_PER_PAGE));
  const currentProjects = projetos.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="mt-1 text-sm text-gray-500">
          Todos os projetos do grupo CTI · AEB
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Code2 size={20} className="text-blue-600" />}
          label="Projetos"
          value={Object.keys(projetos).length}
        />
        <StatCard
          icon={<Activity size={20} className="text-green-600" />}
          label="Ativos (último mês) - mock"
          value={
            projects.filter((p) => {
              const diff = Date.now() - new Date(p.last_activity_at).getTime();
              return diff < 30 * 86_400_000;
            }).length
          }
        />
        <StatCard
          icon={<Calendar size={20} className="text-purple-600" />}
          label="Linguagens únicas"
          value={
            new Set(projetos.flatMap((p) => Object.keys(p.languages))).size
          }
        />
      </div>


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        { /* Grafico */}
        <GraficoLinguagem projects={projetos} />

        { /* Atividade Recente */}
        <AtividadeRecente projetos={projetos} onSelect={onSelect} />
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Todos os Projetos
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentProjects.map((project) => (
            <ProjectCard
              key={project.projectId}
              projeto={project}
              onSelect={onSelect}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            {projetos.length} projeto(s) · página {currentPage} de {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
