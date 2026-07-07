import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

function ensureScrollTrigger() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

type ScrollRevealOptions = {
  y?: number;
  opacity?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  childSelector?: string;
  once?: boolean;
};

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
  options: ScrollRevealOptions = {},
) {
  useEffect(() => {
    if (!ref.current) return;
    ensureScrollTrigger();

    const {
      y = 40,
      opacity = 0,
      stagger = 0.1,
      duration = 0.7,
      start = "top 85%",
      childSelector,
      once = true,
    } = options;

    const targets = childSelector
      ? ref.current.querySelectorAll(childSelector)
      : ref.current;

    const tween = gsap.fromTo(
      targets,
      { y, opacity },
      {
        y: 0,
        opacity: 1,
        stagger,
        duration,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: once ? "play none none none" : "play reverse play reverse",
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, deps);
}

export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  endValue: number,
  suffix: string,
  deps: unknown[] = [],
) {
  useEffect(() => {
    if (!ref.current) return;
    ensureScrollTrigger();

    const el = ref.current;
    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: endValue,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
      onUpdate: () => {
        const display =
          endValue >= 100
            ? Math.round(obj.val).toLocaleString()
            : obj.val % 1 === 0
              ? Math.round(obj.val).toString()
              : obj.val.toFixed(1);
        el.textContent = `${display}${suffix}`;
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, deps);
}
