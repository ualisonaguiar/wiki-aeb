import { getLangColor } from '../utils';

interface Props {
  languages: Record<string, number>;
}

export default function LanguageBar({ languages }: Props) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-xs text-gray-400 italic">Sem dados de linguagem</p>;

  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {entries.map(([lang, pct]) => (
          <div
            key={lang}
            title={`${lang}: ${pct.toFixed(1)}%`}
            style={{ width: `${pct}%`, backgroundColor: getLangColor(lang) }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {entries.map(([lang, pct]) => (
          <span key={lang} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: getLangColor(lang) }}
            />
            {lang}
            <span className="text-gray-400">{pct.toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
