import { useEffect, useRef } from "react";

export const useInfiniteScroll = (onLoadMore: () => void, enabled: boolean) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  });

  useEffect(() => {
    const node = targetRef.current;

    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callbackRef.current();
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled]);

  return targetRef;
};
