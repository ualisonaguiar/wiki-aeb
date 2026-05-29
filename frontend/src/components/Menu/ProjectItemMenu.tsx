import clsx from "clsx";

export default function ProjectItem({ project, selectedId, view, onSelect }) {
  return (
    <button
      onClick={() => onSelect(project.id)}
      className={clsx(
        "flex w-full flex-col items-start rounded-md px-3 py-2 text-left transition-colors",
        selectedId === project.id && view === "project"
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
      )}
    >
      <span className="truncate text-sm font-medium">{project.name}</span>

      {project.languages && Object.keys(project.languages).length > 0 && (
        <span className="mt-0.5 truncate text-xs text-gray-400">
          {Object.keys(project.languages)[0]}
        </span>
      )}
    </button>
  );
}
