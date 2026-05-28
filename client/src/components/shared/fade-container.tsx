import type React from "react";

import { motion } from "motion/react";

import { staggerContainer } from "@/lib/animations";

export default function FadeContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={staggerContainer(0.1, 0.15)}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}
