export type DissolveOptions = {
  onComplete?: () => void;
  duration?: number;
};

export function dissolve(
  element: HTMLElement,
  { onComplete, duration = 300 }: DissolveOptions = {}
) {
  if (typeof window === "undefined") {
    onComplete?.();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onComplete?.();
    return;
  }

  try {
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out, filter ${duration}ms ease-out`;
    element.style.opacity = "0";
    element.style.filter = "blur(4px)";
    element.style.transform = "scale(0.92) translateY(-6px)";

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => window.clearTimeout(timer);
  } catch {
    onComplete?.();
  }
}
