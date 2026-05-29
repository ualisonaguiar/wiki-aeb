import { Code2 } from "lucide-react";
import type { Project } from "../../types";
import { getLangColor } from "../../utils";
import LanguageBar from "../LanguageBar";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  languages: Project["languages"];
}

export default function ProjectDetailOverview({ languages }: Props) {
  const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const radarData = langEntries
    .slice(0, 6)
    .map(([lang, pct]) => ({ lang, pct }));

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Code2 size={15} /> Linguagens
        </h2>
        <LanguageBar languages={languages} />
      </div>

      {radarData.length > 2 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Distribuição Visual
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="lang" tick={{ fontSize: 12 }} />
                <Radar
                  name="Uso (%)"
                  dataKey="pct"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Detalhamento
        </h2>
        <div className="space-y-3">
          {langEntries.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              Repositório sem código detectado.
            </p>
          )}
          {langEntries.map(([lang, pct]) => (
            <div key={lang} className="flex items-center gap-3">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: getLangColor(lang) }}
              />
              <span className="w-32 text-sm text-gray-700">{lang}</span>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getLangColor(lang),
                    }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-xs text-gray-400">
                {pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
