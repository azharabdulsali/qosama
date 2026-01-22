"use client";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useRef } from "react";
import clsx from "clsx";

export default function TextReveal({ text, className }: { text: string, className?: string }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.1"], // Extended range for slower animation
  });

  const words = text.split(" ");

  return (
    <p ref={container} className={clsx("flex flex-wrap gap-2 leading-tight relative", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

import { MotionValue } from "motion/react";

const Word = ({ children, progress, range }: { children: string, progress: MotionValue<number>, range: number[] }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative">
      <span className="absolute opacity-20">{children}</span>
      <motion.span style={{ opacity }} className="text-white">{children}</motion.span>
    </span>
  );
};
