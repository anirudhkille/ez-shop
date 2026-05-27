import { type ElementType } from "react";

import { motion } from "motion/react";

type FadeProps = {
  children: React.ReactNode;
  as?: ElementType; 
  direction?: "up" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  margin?: string;
  ease?: any;
  className?: string;
};

export default function Fade({
  children,
  as: Component = "div",
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 30,
  once = true,
  margin = "-100px",
  ease = [0.22, 1, 0.36, 1],
  className = "",
}: FadeProps) {
 
  const getInitial = () => {
    switch (direction) {
      case "left":
        return { opacity: 0, x: -distance };
      case "right":
        return { opacity: 0, x: distance };
      default:
        return { opacity: 0, y: distance };
    }
  };

  const getAnimate = () => {
    return direction === "left" || direction === "right"
      ? { opacity: 1, x: 0 }
      : { opacity: 1, y: 0 };
  };

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{ once, margin }}
      transition={{
        delay,
        duration,
        ease,
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
