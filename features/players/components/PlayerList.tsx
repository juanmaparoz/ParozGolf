import { mockPlayers } from "@/mocks/mockPlayers";

export function PlayerList() {
  return (
    <div className="overflow-hidden rounded-lg border border-dark-border">
      <table className="w-full">
        <thead className="bg-dark-surface">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Club
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Handicap
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {mockPlayers.map((player) => (
            <tr key={player.id} className="bg-dark-bg">
              <td className="px-4 py-3 text-slate-100">{player.name}</td>
              <td className="px-4 py-3 text-slate-300">
                {player.club ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-300">{player.handicap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
