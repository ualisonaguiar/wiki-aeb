import ProjectItem from "./ProjectItemMenu";
import { useEffect, useState } from "react";
import { gitlabService } from "../../services/gitlab.service";

export default function ProjectMenu({
    onSelect,
    selectedId,
    view,
}) {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        gitlabService.getProjects().then(setProjects);
    }, []);

    const sorted = [...projects].sort((a, b) =>
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
                    key={project.id}
                    project={project}
                    onSelect={onSelect}
                    selectedId={selectedId}
                    view={view}
                />
            ))}
        </div>
    );
}
