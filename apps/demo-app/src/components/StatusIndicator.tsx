"use client";
import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./util/firebase";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import { AnimatePresence, motion } from "framer-motion";
import { FaHeart, FaStar, FaRegClock } from "react-icons/fa";

interface UserStats {
  health: number;
  xp: number;
  healthRestoreTime?: string;
}

const formatXP = (xp: number): string => {
  if (xp < 1000) return xp.toString();
  if (xp < 1000000) return `${(xp / 1000).toFixed(1)}K`;
  return `${(xp / 1000000).toFixed(1)}M`;
};

const calculateTimeRemaining = (restoreTime?: string): string => {
  if (!restoreTime) return "";
  const now = new Date();
  const restoreDate = new Date(restoreTime);
  const diff = restoreDate.getTime() - now.getTime();
  if (diff <= 0) return "Ready to restore!";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const StatusIndicators = () => {
  const { data: account } = useAbstraxionAccount();
  const [stats, setStats] = useState<UserStats>({ health: 5, xp: 0 });
  const [timeRemaining, setTimeRemaining] = useState("");
  const xpScale = useRef(1);

  useEffect(() => {
    if (!account?.bech32Address) return;

    const userRef = doc(db, "learners", account.bech32Address);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      try {
        if (doc.exists()) {
          const data = doc.data();
          setStats({
            health: Math.max(0, Math.min(5, Number(data.health || 5))), // Fixed: Added missing parenthesis
            xp: Math.max(0, Number(data.xp || 0)),
            healthRestoreTime: data.healthRestoreTime || undefined
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    });

    return () => unsubscribe();
  }, [account?.bech32Address]);

  useEffect(() => {
    if (!stats.healthRestoreTime) {
      setTimeRemaining("");
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(stats.healthRestoreTime);
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [stats.healthRestoreTime]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 pointer-events-none">
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 flex items-center shadow-md gap-1"
        animate={{ scale: xpScale.current }}
      >
        <FaStar className="text-lg text-yellow-500" />
        <span className="text-sm font-bold text-gray-800 dark:text-white">
          {formatXP(stats.xp)} <span className="text-gray-500 dark:text-gray-300">XP</span>
        </span>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 flex items-center shadow-md gap-1">
        <FaHeart className={`text-lg ${stats.health > 0 ? 'text-red-500' : 'text-gray-400'}`} />
        <span className={`text-sm font-bold ${stats.health > 0 ? 'text-gray-800 dark:text-white' : 'text-red-500'}`}>
          {stats.health}
        </span>
      </div>

      <AnimatePresence>
        {timeRemaining && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 right-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-md flex items-center gap-1">
              <FaRegClock className="text-xs text-red-500" />
              <span className="text-xs font-bold text-red-500">
                {timeRemaining}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusIndicators;