import { Users } from 'lucide-react';
import type { Member } from '../types';
import { accessLevelLabel, accessLevelColor } from '../utils';

interface Props {
  members: Member[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-yellow-500',
];

export default function MembersPanel({ members }: Props) {
  const owners = members.filter((m) => m.access_level === 50);
  const others = members.filter((m) => m.access_level < 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Membros do Grupo</h1>
        <p className="mt-1 text-sm text-gray-500">{members.length} colaboradores no grupo CTI</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
          <Users size={16} /> Owners ({owners.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((m, i) => (
            <MemberCard key={m.id} member={m} colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]!} />
          ))}
        </div>
      </div>

      {others.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-800">Outros ({others.length})</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((m, i) => (
              <MemberCard key={m.id} member={m} colorClass={AVATAR_COLORS[(owners.length + i) % AVATAR_COLORS.length]!} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, colorClass }: { member: Member; colorClass: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${colorClass}`}>
        {getInitials(member.name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{member.name}</p>
        <p className="truncate text-xs text-gray-400">@{member.username}</p>
      </div>
      <span className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${accessLevelColor(member.access_level)}`}>
        {accessLevelLabel(member.access_level)}
      </span>
    </div>
  );
}
