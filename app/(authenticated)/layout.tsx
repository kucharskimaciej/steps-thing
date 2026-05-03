import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-dvh">
      <header className="border-[var(--border)] border-b bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <a className="font-semibold text-lg" href="/feed">
            Steps
          </a>
          <UserButton />
        </div>
      </header>
      {children}
    </div>
  );
}
