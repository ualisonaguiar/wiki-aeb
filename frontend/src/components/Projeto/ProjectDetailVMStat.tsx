import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  value: string;
}

export default function ProjectDetailVMStat({ icon, label, value }: Props) {
  return (
    <div className="rounded-md bg-white px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-0.5 text-gray-400">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="mt-0.5 text-xs font-semibold text-gray-800">{value}</p>
    </div>
  );
}
