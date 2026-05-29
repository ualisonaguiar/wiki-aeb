import clsx from "clsx";

interface Props {
  status: string;
}

export default function ProjectDetailPipelineStatusBadge({ status }: Props) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-600",
    running: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    canceled: "bg-gray-100 text-gray-500",
    skipped: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    success: "Passou",
    failed: "Falhou",
    running: "Rodando",
    pending: "Pendente",
    canceled: "Cancelado",
    skipped: "Ignorado",
  };

  return (
    <span
      className={clsx(
        "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        map[s] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {labels[s] ?? status}
    </span>
  );
}
