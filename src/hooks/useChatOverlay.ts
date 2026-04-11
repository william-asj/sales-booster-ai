"use client";

import { useCallback } from "react";
import { useChatState } from "@/context/ChatContext";

export interface UseChatOverlay {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useChatOverlay(): UseChatOverlay {
  const { isOverlayOpen, setIsOverlayOpen, setOverlaySessionId } = useChatState();

  const open = useCallback(() => {
    setIsOverlayOpen(true);
  }, [setIsOverlayOpen]);

  const close = useCallback(() => {
    setIsOverlayOpen(false);
    // Clear the ID so next time we open, we start fresh (no session yet)
    setOverlaySessionId(null);
  }, [setIsOverlayOpen, setOverlaySessionId]);

  const toggle = useCallback(() => {
    if (isOverlayOpen) {
      close();
    } else {
      open();
    }
  }, [isOverlayOpen, open, close]);

  return { isOpen: isOverlayOpen, open, close, toggle };
}
