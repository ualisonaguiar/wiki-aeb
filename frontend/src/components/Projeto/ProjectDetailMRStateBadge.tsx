import clsx from "clsx";

interface Props {
  state: string;
}

export default function ProjectDetailMRStateBadge({ state }: Props) {
  const map: Record<string, string> = {
    opened: "bg-green-100 text-green-700",
    merged: "bg-purple-100 text-purple-700",
    closed: "bg-red-100 text-red-600",
  };
  const labels: Record<string, string> = {
    opened: "Aberto",
    merged: "Merged",
    closed: "Fechado",
  };

  return (
    <span
      className={clsx(
        "mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        map[state] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {labels[state] ?? state}
    </span>
  );
}
