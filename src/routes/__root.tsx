import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { Header } from '../components/Header';
import { UpdatePrompt } from '../components/UpdatePrompt';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Header />
      <main className="flex h-full pt-12 lg:pt-14">
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      <UpdatePrompt />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
