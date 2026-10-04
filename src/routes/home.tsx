import { createFileRoute, redirect } from '@tanstack/react-router';

// Legacy URL of the grid picker, now on the home page; kept for bookmarks.
export const Route = createFileRoute('/home')({
  beforeLoad: () => {
    throw redirect({ to: '/', replace: true });
  },
});
