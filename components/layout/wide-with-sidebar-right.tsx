import type { ReactNode } from "react";

type WideWithSidebarRightProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export function WideWithSidebarRight({
  children,
  sidebar,
}: WideWithSidebarRightProps) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 min-[900px]:grid-cols-[minmax(0,1fr)_20rem]">
      <main>{children}</main>
      <aside>{sidebar}</aside>
    </div>
  );
}
