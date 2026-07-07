import { ExternalLink } from "lucide-react";
import { formatDate, getLangColor, topLanguages } from "../utils";
import LanguageBar from "./LanguageBar";

export default function ProjectCard({ projeto: projeto, onSelect: onSelect }) {

    const top = topLanguages(projeto.languages, 1);

    return (
        <div
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            onClick={() => onSelect(projeto.projectId)}
        >
            <div className="flex items-start justify-between">
                <h3 className="truncate text-sm font-semibold text-gray-900">
                    {projeto.name}
                </h3>
                <a
                    href={projeto.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                    <ExternalLink size={14} />
                </a>
            </div>
            {top.length > 0 && (
                <span
                    className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: getLangColor(top[0]![1].name) }}
                >
                    {top[0]![1].name}
                </span>
            )}
            <div className="mt-3">
                <LanguageBar languages={projeto.languages} />
            </div>
            <p className="mt-3 text-xs text-gray-400">Atualizado {formatDate(projeto.lastActivityAt)}</p>
        </div>
    );
}
