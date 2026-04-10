"use client";

import { useState, useCallback } from "react";

export interface UseChatOverlay {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useChatOverlay(): UseChatOverlay {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}