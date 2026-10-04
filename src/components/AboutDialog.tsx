import { commitUrl, repoUrl, shortSha } from '../lib/build-info';
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
          Copyright &copy; 2020{' '}
          <a
            href="https://github.com/LoicViennois"
            target="_blank"
            rel="noopener"
          >
            Loïc Viennois
          </a>
        </p>
        <p className="text-ink-soft">
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU General Public License as published by
          the Free Software Foundation, either version 3 of the License, or (at
          your option) any later version. See the{' '}
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            target="_blank"
            rel="noopener"
            className="text-ink"
          >
            GNU General Public License v3
          </a>{' '}
          for details.
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
      </div>
    </Modal>
  );
}
