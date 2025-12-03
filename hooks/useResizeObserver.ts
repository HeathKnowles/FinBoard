"use client";

import { useCallback, useLayoutEffect, useState } from "react";

export function useResizeObserver<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useLayoutEffect(() => {
    if (!node) return;

    const observer = new ResizeObserver(() => {
      setRect(node.getBoundingClientRect());
    });

    observer.observe(node);
    setRect(node.getBoundingClientRect());

    return () => observer.disconnect();
  }, [node]);

  return { ref, rect };
}
