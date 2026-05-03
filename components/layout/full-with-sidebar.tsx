import type { ReactNode } from "react";

type FullWithSidebarProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export function FullWithSidebar({ children, sidebar }: FullWithSidebarProps) {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] min-[900px]:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="border-[var(--border)] border-b p-4 min-[900px]:border-r min-[900px]:border-b-0">
        {sidebar}
      </aside>
      <main className="min-w-0 p-4">{children}</main>
    </div>
  );
}
