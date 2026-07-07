import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Project } from '../types';
import { getLangColor } from '../utils';


type Props = {
    projects: Project[];
};

type ChartData = {
    name: string;
    value: number;
    color: string;
};

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

function aggregateLanguages(
    projects: Project[],
): ChartData[] {

    const totals: Record<
        string,
        { value: number; color: string }
    > = {};

    for (const project of projects) {
        for (const language of project.languages) {
            if (!totals[language.name]) {
                totals[language.name] = {
                    value: 0,
                    color: language.color,
                };
            }
            totals[language.name].value += language.share;
        }
    }

    return Object.entries(totals)
        .map(([name, data]) => ({
            name,
            value: Number(data.value.toFixed(2)),
            color: data.color,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

}

export default function GraficoLinguagem({
    projects,
}: Props) {
    const langData = aggregateLanguages(projects);

    return (
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
    );
}