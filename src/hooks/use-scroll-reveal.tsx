"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}

/** Utility: className string for scroll-reveal animations */
export function revealClass(isVisible: boolean, direction: "up" | "left" | "right" | "scale" = "up", delay = 0): string {
  const base = "transition-all duration-700 ease-out";
  const delayClass = delay > 0 ? ` delay-[${delay}ms]` : "";
  
  if (!isVisible) {
    const hidden: Record<string, string> = {
      up: "opacity-0 translate-y-10",
      left: "opacity-0 -translate-x-10",
      right: "opacity-0 translate-x-10",
      scale: "opacity-0 scale-95",
    };
    return `${base}${delayClass} ${hidden[direction]}`;
  }
  
  return `${base}${delayClass} opacity-100 translate-y-0 translate-x-0 scale-100`;
}
