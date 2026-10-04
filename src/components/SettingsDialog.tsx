import { useId } from 'react';

import { updateSettings, useSettings } from '../lib/settings';
import { Modal } from './Modal';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p id={labelId} className="font-semibold">
          {label}
        </p>
        <p id={descriptionId} className="text-sm text-ink-soft">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? 'bg-match' : 'bg-ink-soft'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-1 left-1 size-5 rounded-full bg-surface shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { valueHints } = useSettings();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      className="w-[min(28rem,calc(100%-2rem))]"
    >
      <Switch
        label="Value hints"
        description="Show what each bit is worth along the edges of the grid."
        checked={valueHints}
        onChange={(checked) => updateSettings({ valueHints: checked })}
      />
    </Modal>
  );
}
