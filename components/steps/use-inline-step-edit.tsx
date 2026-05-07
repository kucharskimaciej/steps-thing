"use client";

import { useCallback, useState } from "react";

export function useInlineStepEdit() {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const openInlineStepEdit = useCallback((stepId: string) => {
    setEditingStepId(stepId);
  }, []);

  const closeInlineStepEdit = useCallback(() => {
    setEditingStepId(null);
  }, []);

  return {
    editingStepId,
    isInlineStepEditOpen: editingStepId !== null,
    openInlineStepEdit,
    closeInlineStepEdit,
  };
}
