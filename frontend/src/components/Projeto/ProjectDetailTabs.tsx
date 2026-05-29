import type { ReactNode } from "react";
import { Code2, GitBranch, GitMerge, BookOpen, Server } from "lucide-react";
import clsx from "clsx";
import type { ProjectGQLData } from "../../services/gitlab";

export type Tab =
  | "overview"
  | "branches"
  | "readme"
  | "mergerequests"
  | "infra";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Visão Geral", icon: <Code2 size={14} /> },
  { id: "branches", label: "Branches", icon: <GitBranch size={14} /> },
  { id: "readme", label: "README", icon: <BookOpen size={14} /> },
  {
    id: "mergerequests",
    label: "Merge Requests",
    icon: <GitMerge size={14} />,
  },
  { id: "infra", label: "Infraestrutura", icon: <Server size={14} /> },
];

interface Props {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  data?: ProjectGQLData | null;
}

export default function ProjectDetailTabs({
  activeTab,
  onChange,
  data,
}: Props) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "branches" && data?.branches.length ? (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {data.branches.length}
              </span>
            ) : null}
            {tab.id === "mergerequests" && data?.mergeRequests.length ? (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {data.mergeRequests.length}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  );
}
