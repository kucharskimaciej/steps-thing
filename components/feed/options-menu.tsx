"use client";

import { Copy, MoreHorizontal, Pencil, Shapes, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type OptionsMenuProps = {
  stepId: string;
  stepName: string;
  origin?: string;
  hasVariations: boolean;
  onShowVariations: () => void;
  onEdit: () => void;
};

export function OptionsMenu({
  stepId,
  stepName,
  origin,
  hasVariations,
  onShowVariations,
  onEdit,
}: OptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, [isOpen]);

  async function copyLink() {
    const base =
      origin ?? (typeof window === "undefined" ? "" : window.location.origin);
    const href = `${base}/s/${stepId}`;

    await globalThis.navigator.clipboard?.writeText(href);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`Open options for ${stepName}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-white"
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label={`Options for ${stepName}`}
          className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-[var(--border)] bg-white p-1 shadow-lg"
        >
          <MenuItem
            icon={<Copy size={16} />}
            label="Copy link"
            onClick={copyLink}
          />
          {hasVariations ? (
            <MenuItem
              icon={<Shapes size={16} />}
              label="Show variations"
              onClick={() => {
                setIsOpen(false);
                onShowVariations();
              }}
            />
          ) : null}
          <MenuItem
            icon={<Pencil size={16} />}
            label="Edit"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
          />
          <MenuItem
            icon={<X size={16} />}
            label="Cancel"
            onClick={() => setIsOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
};

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex h-10 w-full items-center gap-2 rounded px-2 text-left text-sm hover:bg-[var(--muted)]"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
