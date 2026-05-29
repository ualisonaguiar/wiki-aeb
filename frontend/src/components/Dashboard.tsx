import type { ReactNode } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Code2, Calendar, ExternalLink } from "lucide-react";
import type { Project } from "../types";
import {
  getLangColor,
  formatDate,
  formatDateRelative,
  topLanguages,
} from "../utils";
import LanguageBar from "./LanguageBar";

interface Props {
  projects: Project[];
  onSelect: (id: number) => void;
}

function aggregateLanguages(
  projects: Project[],
): { name: string; value: number }[] {
  const totals: Record<string, number> = {};
  for (const p of projects) {
    for (const [lang, pct] of Object.entries(p.languages)) {
      totals[lang] = (totals[lang] ?? 0) + pct;
    }
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value: Math.round(value) }));
}

const RADIAN = Math.PI / 180;
function renderLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  name,
}: Record<string, number> & { name: string }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={600}
    >
      {name}
    </text>
  );
}

export default function Dashboard({ projects, onSelect }: Props) {
  const langData = aggregateLanguages(projects);
  const recentProjects = [...projects].sort(
    (a, b) =>
      new Date(b.last_activity_at).getTime() -
      new Date(a.last_activity_at).getTime(),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="mt-1 text-sm text-gray-500">
          Todos os projetos do grupo CTI · AEB
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Code2 size={20} className="text-blue-600" />}
          label="Projetos"
          value={projects.length}
        />
        <StatCard
          icon={<Activity size={20} className="text-green-600" />}
          label="Ativos (último mês)"
          value={
            projects.filter((p) => {
              const diff = Date.now() - new Date(p.last_activity_at).getTime();
              return diff < 30 * 86_400_000;
            }).length
          }
        />
        <StatCard
          icon={<Calendar size={20} className="text-purple-600" />}
          label="Linguagens únicas"
          value={
            new Set(projects.flatMap((p) => Object.keys(p.languages))).size
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Distribuição de Linguagens
          </h2>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={langData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                    label={renderLabel}
                  >
                    {langData.map((entry) => (
                      <Cell key={entry.name} fill={getLangColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toFixed(0)} pts`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {langData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getLangColor(entry.name) }}
                  />
                  <span className="text-sm text-gray-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Atividade Recente
          </h2>
          <div className="space-y-3">
            {recentProjects.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <button
                  onClick={() => onSelect(p.id)}
                  className="truncate text-sm font-medium text-blue-600 hover:underline"
                >
                  {p.name}
                </button>
                <span className="ml-3 flex-shrink-0 text-xs text-gray-400">
                  {formatDateRelative(p.last_activity_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Todos os Projetos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (id: number) => void;
}) {
  const top = topLanguages(project.languages, 1);
  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
      onClick={() => onSelect(project.id)}
    >
      <div className="flex items-start justify-between">
        <h3 className="truncate text-sm font-semibold text-gray-900">
          {project.name}
        </h3>
        <a
          href={project.web_url}
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
          style={{ backgroundColor: getLangColor(top[0]![0]) }}
        >
          {top[0]![0]}
        </span>
      )}
      <div className="mt-3">
        <LanguageBar languages={project.languages} />
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Atualizado {formatDate(project.last_activity_at)}
      </p>
    </div>
  );
}
