import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
}

export default function ProjectDetailLoadingRow({
  message = "Carregando…",
}: Props) {
  return (
    <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
      <Loader2 size={14} className="animate-spin" /> {message}
    </div>
  );
}
