import ProjectItem from "./ProjectItemMenu";
import { useEffect, useState } from "react";
import { projetoService } from "../../services/projeto.service";

export default function ProjectMenu({
  onSelect,
  selectedId,
  view,
  search = "",
}) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    projetoService.getProjects().then(setProjects);
  }, []);

  const searchTerm = search.trim().toLowerCase();

  const filtered = searchTerm
    ? projects.filter((project) => {
      const values = [
        project.name,
        project.sigla,
        project.fullPath,
        project.path,
        project.pathWithNamespace,
        project.webUrl,
        project.web_url,
      ];

      return values
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchTerm));
    })
    : projects;

  const sorted = [...filtered].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div>
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Projetos
      </p>
      {sorted.length === 0 && (
        <p className="px-3 py-2 text-xs text-gray-400">
          Nenhum resultado
        </p>
      )}

      {sorted.map((project) => (
        <ProjectItem
          key={project.projectId}
          project={project}
          onSelect={onSelect}
          selectedId={selectedId}
          view={view}
        />
      ))}
    </div>
  );
}
