import { createFileRoute, redirect } from '@tanstack/react-router';

// Legacy URL from when names were picked on a login page; kept for bookmarks and installed apps.
export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    throw redirect({ to: '/', replace: true });
  },
});
