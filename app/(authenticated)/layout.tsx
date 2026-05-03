import type { ReactNode } from "react";
import { TopBar } from "@/components/app-shell/top-bar";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-dvh">
      <TopBar />
      {children}
    </div>
  );
}
