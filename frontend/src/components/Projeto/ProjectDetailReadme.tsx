import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { projetoService } from "../../services/projeto.service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  project: {
    fullPath: string;
  };
}

type ReadmeNode = {
  path: string;
  rawBlob: string;
};

export default function ProjectDetailReadme({ project }: Props) {
  const [loading, setLoading] = useState(true);
  const [readme, setReadme] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    projetoService
      .getReadme(project.fullPath)
      .then((readmeRes) => {
        const node: ReadmeNode | undefined =
          readmeRes?.repository?.blobs?.nodes?.[0];

        setReadme(node?.rawBlob ?? null);
      })
      .finally(() => setLoading(false));
  }, [project.fullPath]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <BookOpen size={15} /> README
      </h2>

      {loading && (
        <p className="text-sm text-gray-500 animate-pulse">
          Carregando README...
        </p>
      )}

      {!loading && !readme && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-800">
            README não encontrado
          </p>

          <p className="mt-1 text-amber-700">
            O projeto não possui um{" "}
            <code className="rounded bg-amber-100 px-1">README.md</code> na
            raiz do repositório, ou o token não tem o escopo{" "}
            <code className="rounded bg-amber-100 px-1">
              read_repository
            </code>
            .
          </p>
        </div>
      )}

      {!loading && readme && (
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {readme}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}