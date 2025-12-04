"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isRtl, setIsRtl] = useState(true);

  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  // In RTL, "forward" is from left, in LTR it's from right
  const slideDirection = isRtl ? 20 : -20;

  return (
    <motion.div
      initial={{ opacity: 0, x: slideDirection }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -slideDirection }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
