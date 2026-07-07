import { getLangColor } from '../utils';

type Language = {
  name: string;
  color: string;
  share: number;
};

interface Props {
  languages: Language[];
}

export default function LanguageBar({ languages, }: Props) {

  const entries = [...languages]
    .sort((a, b) => b.share - a.share);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        Sem dados de linguagem
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {entries.map((language) => (
          <div
            key={language.name}
            title={`${language.name}: ${language.share.toFixed(1)}%`}
            style={{
              width: `${language.share}%`,
              backgroundColor: getLangColor(language.name),
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {entries.map((language) => (
          <span
            key={language.name}
            className="flex items-center gap-1 text-xs text-gray-600"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: getLangColor(language.name),
              }}
            />
            {language.name}
            <span className="text-gray-400">
              {language.share.toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}