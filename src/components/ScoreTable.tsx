import { formatTime } from '../lib/format-time';
import type { Ranking } from '../lib/high-scores';

const MEDALS = ['bg-lamp text-lamp-ink', 'bg-line text-ink', 'bg-[#e0a47a] text-[#3a1f0b]'];

interface ScoreTableProps {
  rankings: Ranking[];
  /** Highlights this player's row. */
  playerUid?: string;
  showSolves?: boolean;
}

export function ScoreTable({ rankings, playerUid, showSolves = false }: ScoreTableProps) {
  return (
    <table className="w-full text-sm" data-testid="high-scores">
      <thead className={showSolves ? 'text-xs text-ink-soft' : 'sr-only'}>
        <tr>
          <th scope="col" className="pb-2 pl-1.5 text-left font-semibold">
            Rank
          </th>
          <th scope="col" className="pb-2 pl-2 text-left font-semibold">
            Name
          </th>
          {showSolves ? (
            <th scope="col" className="pb-2 pr-2 text-right font-semibold">
              Solves
            </th>
          ) : null}
          <th scope="col" className="pb-2 pr-2 text-right font-semibold">
            Best time
          </th>
        </tr>
      </thead>
      <tbody>
        {rankings.map((ranking, i) => (
          <tr key={ranking.user.uid} className={ranking.user.uid === playerUid ? 'bg-lamp/15' : ''}>
            <th scope="row" className="w-10 rounded-l-lg py-1.5 pl-1.5">
              <span
                className={`font-digits grid size-6 place-items-center rounded-full text-xs font-bold ${
                  MEDALS[i] ?? 'text-ink-soft'
                }`}
              >
                {i + 1}
              </span>
            </th>
            <td className="py-1.5 pl-2 text-left font-semibold">{ranking.user.name}</td>
            {showSolves ? <td className="font-digits py-1.5 pr-2 text-right text-ink-soft">{ranking.solves}</td> : null}
            <td className="font-digits rounded-r-lg py-1.5 pr-2 text-right">{formatTime(ranking.best)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
