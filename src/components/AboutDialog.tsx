import { Coffee } from 'lucide-react';

import { commitUrl, repoUrl, shortSha, sponsorUrl } from '../lib/build-info';
import { Modal } from './Modal';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Licence notice"
      className="w-[min(40rem,calc(100%-2rem))]"
    >
      <div className="max-w-[68ch] space-y-4 text-sm leading-relaxed [&_a]:font-semibold [&_a]:underline [&_a]:decoration-lamp [&_a]:decoration-2 [&_a]:underline-offset-2">
        <p>
          The Binary Game, build{' '}
          <a
            href={commitUrl}
            target="_blank"
            rel="noopener"
            data-testid="commit-link"
            className="font-digits"
          >
            {shortSha}
          </a>
          <br />
          Copyright &copy; 2026{' '}
          <a
            href="https://github.com/LoicViennois"
            target="_blank"
            rel="noopener"
          >
            Loïc Viennois
          </a>
        </p>
        <p className="text-ink-soft">
          This program is free software, released under the{' '}
          <a
            href={`${repoUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener"
            className="text-ink"
          >
            MIT License
          </a>
          . You may use, copy, modify and distribute it, provided the copyright
          notice is kept.
        </p>
        <div className="rounded-2xl bg-tint p-4">
          <h3 className="mb-1 font-bold">Send feedback</h3>
          <ul className="space-y-1 text-ink-soft">
            <li>
              Found a bug or have an idea?{' '}
              <a
                href={`${repoUrl}/issues/new`}
                target="_blank"
                rel="noopener"
                className="text-ink"
              >
                Open an issue on GitHub
              </a>
            </li>
            <li>
              Want to say hi?{' '}
              <a
                href="https://www.reddit.com/message/compose/?to=LoicViennois"
                target="_blank"
                rel="noopener"
                className="text-ink"
              >
                Message me on Reddit
              </a>
            </li>
          </ul>
        </div>
        <p className="flex items-start gap-2 text-ink-soft">
          <Coffee className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            The game is free and always will be. If you enjoy it, you can{' '}
            <a
              href={sponsorUrl}
              target="_blank"
              rel="noopener"
              data-testid="sponsor-link"
              className="text-ink"
            >
              buy me a coffee
            </a>
            , no pressure!
          </span>
        </p>
      </div>
    </Modal>
  );
}
