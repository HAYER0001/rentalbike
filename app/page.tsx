"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/store";
import { BusinessTypePicker } from "@/components/business-type-picker";
import { ConfiguratorShell } from "@/components/configurator-shell";

export default function Home() {
  const { state } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {!state.businessType ? (
        <motion.div
          key="picker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <BusinessTypePicker />
        </motion.div>
      ) : (
        <motion.div
          key="configurator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="h-[100dvh]"
        >
          <ConfiguratorShell />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
