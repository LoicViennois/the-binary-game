import { createRootRoute, Outlet } from '@tanstack/react-router';

import { BuildInfo } from '../components/BuildInfo';
import { Header } from '../components/Header';

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
      <BuildInfo />
    </>
  );
}
