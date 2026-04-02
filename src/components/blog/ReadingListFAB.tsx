"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@once-ui-system/core";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ReadingListFAB() {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const isDark = theme.resolvedTheme === "dark";

  useEffect(() => {
    // Count total bookmarks from localStorage
    const posts = localStorage.getItem("bookmarked_posts");
    const projects = localStorage.getItem("bookmarked_projects");
    const total =
      (posts ? JSON.parse(posts).length : 0) +
      (projects ? JSON.parse(projects).length : 0);
    setCount(total);

    // Small delay so it doesnt pop in instantly
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hidden md:block">
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-28 right-4 md:bottom-6 md:right-6 z-50"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <Link href="/reading-list" aria-label="Open reading list">
            <motion.div
              className="relative flex items-center gap-2.5 px-4 py-3 rounded-2xl cursor-pointer"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(30,30,30,0.7), rgba(20,20,20,0.6))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(0,0,0,0.08)",
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Bookmark icon */}
              <Bookmark
                className="w-4 h-4 flex-shrink-0"
                style={{
                  color: "#f59e0b",
                  fill: count > 0 ? "#f59e0b" : "none",
                }}
              />

              {/* Label */}
              <span
                className="text-sm font-medium"
                style={{ color: isDark ? "#e5e7eb" : "#374151" }}
              >
                Reading List
              </span>

              {/* Badge — only when bookmarks exist */}
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    color: "#fff",
                    minWidth: "20px",
                  }}
                >
                  {count > 9 ? "9+" : count}
                </motion.span>
              )}
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
