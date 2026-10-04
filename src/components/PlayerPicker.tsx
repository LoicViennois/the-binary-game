import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { countScores } from '../lib/high-scores';
import {
  isValidName,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  pickName,
  type Player,
  removePlayer,
  selectPlayer,
  useCurrentPlayer,
  usePlayers,
} from '../lib/players';
import { ConfirmDialog } from './ConfirmDialog';

interface PlayerPickerProps {
  /** Called after a name is picked, e.g. to resume a game. */
  onPicked?: () => void;
}

function NameForm({ label, onPicked, autoFocus }: { label: string; onPicked?: () => void; autoFocus?: boolean }) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const valid = isValidName(name);
  const showError = touched && !valid;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) {
      return;
    }
    pickName(name);
    setName('');
    setTouched(false);
    onPicked?.();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="player-name" className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id="player-name"
          type="text"
          autoComplete="nickname"
          spellCheck={false}
          autoFocus={autoFocus}
          placeholder="Ada"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(name.length > 0)}
          aria-invalid={showError}
          aria-describedby="player-name-hint"
          className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2.5 shadow-[inset_0_0_0_1.5px_var(--line)] transition outline-none placeholder:text-ink-soft/60 focus:shadow-[inset_0_0_0_2px_var(--ink)] aria-invalid:shadow-[inset_0_0_0_2px_var(--alert)]"
        />
        <button type="submit" disabled={!valid} className="btn btn-primary">
          Play
        </button>
      </div>
      <p id="player-name-hint" className={`mt-1.5 pl-4 text-xs ${showError ? 'text-alert' : 'text-ink-soft'}`}>
        {NAME_MIN_LENGTH} to {NAME_MAX_LENGTH} letters or digits
      </p>
    </form>
  );
}

/** Lets someone pick a name used on this device before, add a new one, or remove one with its scores. */
export function PlayerPicker({ onPicked }: PlayerPickerProps) {
  const players = usePlayers();
  const current = useCurrentPlayer();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toRemove, setToRemove] = useState<Player | null>(null);

  if (players.length === 0) {
    return <NameForm label="Pick a name to save your scores" onPicked={onPicked} />;
  }

  const handleSelect = (player: Player) => {
    selectPlayer(player.uid);
    onPicked?.();
  };

  const confirmRemove = () => {
    if (toRemove) {
      removePlayer(toRemove.uid);
    }
    setToRemove(null);
    if (players.length === 1) {
      setEditing(false);
    }
  };

  const removedScores = toRemove ? countScores(toRemove.uid) : 0;

  return (
    <section aria-labelledby="players-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="players-title" className="text-lg font-bold">
          Who&apos;s playing?
        </h2>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          aria-pressed={editing}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-ink-soft transition hover:bg-tint hover:text-ink"
        >
          {editing ? <Check className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
          {editing ? 'Done' : 'Edit players'}
        </button>
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Players on this device">
        {players.map((player) => {
          const selected = player.uid === current?.uid;
          return (
            <li key={player.uid} className="animate-rise">
              {editing ? (
                <button
                  type="button"
                  onClick={() => setToRemove(player)}
                  aria-label={`Remove ${player.name}`}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-surface py-1.5 pr-3 pl-1.5 font-semibold text-alert shadow-[inset_0_0_0_1.5px_currentColor] transition hover:bg-alert hover:text-surface"
                >
                  <Trash2 className="ml-1 size-4" aria-hidden />
                  {player.name}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelect(player)}
                  aria-pressed={selected}
                  className={`flex cursor-pointer items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 font-semibold transition active:scale-95 ${
                    selected
                      ? 'bg-ink text-bg'
                      : 'bg-surface shadow-[inset_0_0_0_1.5px_var(--line)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-soft)]'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`grid size-7 place-items-center rounded-full text-xs ${
                      selected ? 'bg-lamp text-lamp-ink' : 'bg-tint'
                    }`}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                  {player.name}
                </button>
              )}
            </li>
          );
        })}
        {editing ? null : (
          <li>
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              aria-expanded={adding}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 font-semibold text-ink-soft border-[1.5px] border-dashed border-line transition hover:border-ink-soft hover:text-ink"
            >
              <Plus className="size-4" aria-hidden />
              New name
            </button>
          </li>
        )}
      </ul>

      {adding && !editing ? (
        <div className="mt-4 animate-rise">
          <NameForm
            label="New player name"
            autoFocus
            onPicked={() => {
              setAdding(false);
              onPicked?.();
            }}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={toRemove !== null}
        title={`Remove ${toRemove?.name ?? ''}?`}
        confirmLabel="Remove player"
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      >
        {removedScores === 0
          ? 'This removes the name from this device.'
          : `This removes the name and ${removedScores} saved ${removedScores === 1 ? 'score' : 'scores'} from this device. This can't be undone.`}
      </ConfirmDialog>
    </section>
  );
}
