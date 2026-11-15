"use client";

import type { ComponentProps } from "react";
import { TypeAnimation } from "react-type-animation";

interface TypewriterProps {
  words: string[];
  speed?: ComponentProps<typeof TypeAnimation>["speed"];
  wait?: number;
}

const Typewriter = ({ words, speed = 20, wait = 1000 }: TypewriterProps) => {
  const sequence = words.flatMap((word) => [word, wait]);

  return (
    <TypeAnimation
      preRenderFirstString={true}
      sequence={sequence}
      speed={speed}
      repeat={Infinity}
      cursor={false}
    />
  );
};

export default Typewriter;
