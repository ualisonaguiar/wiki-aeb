import { formatDateRelative } from "../utils";

export default function AtividadeRecente({ projetos: projetos, onSelect: onSelect }) {

    const recentProjects = [...projetos].sort(
        (a, b) =>
            new Date(b.lastActivityAt).getTime() -
            new Date(a.lastActivityAt).getTime(),
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
                Atividade Recente
            </h2>
            <div className="space-y-3">
                {recentProjects.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                        <button
                            onClick={() => onSelect(p.projectId)}
                            className="truncate text-sm font-medium text-blue-600 hover:underline"
                        >
                            {p.name}
                        </button>
                        <span className="ml-3 flex-shrink-0 text-xs text-gray-400">
                            {formatDateRelative(p.lastActivityAt)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}