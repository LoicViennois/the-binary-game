import { applyUpdate, dismissUpdate, useUpdateReady } from '../lib/update';

/** Offers to reload when a new version has been installed in the background. */
export function UpdatePrompt() {
  const updateReady = useUpdateReady();

  return (
    // The live region stays mounted so screen readers announce the message when it appears.
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-10 z-40 flex justify-center px-4"
    >
      {updateReady && (
        <div
          data-testid="update-prompt"
          className="pointer-events-auto flex animate-rise flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl bg-surface py-2 pr-2 pl-5 text-ink shadow-2xl ring-1 ring-line"
        >
          <p className="font-semibold">A new version is available.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={dismissUpdate}
              className="btn btn-ghost"
            >
              Later
            </button>
            <button
              type="button"
              onClick={applyUpdate}
              className="btn btn-primary"
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
