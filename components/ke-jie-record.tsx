"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// 模拟柯洁最近50场比赛的结果
// true代表胜利,false代表失败
const keJieResults = Array(50)
  .fill(null)
  .map(() => Math.random() < 0.7);

export function KeJieRecordComponent() {
  const [currentGame, setCurrentGame] = useState(0);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGame((prev) => {
        if (prev < keJieResults.length - 1) {
          setStats((prevStats) => ({
            wins: prevStats.wins + (keJieResults[prev] ? 1 : 0),
            losses: prevStats.losses + (keJieResults[prev] ? 0 : 1),
          }));
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">柯洁的围棋战绩可视化</h1>
      <div className="bg-yellow-100 p-4 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="grid grid-cols-19 gap-0.5 mb-4">
          {Array(361)
            .fill(null)
            .map((_, index) => (
              <motion.div
                key={index}
                className={`aspect-square rounded-full ${
                  index < currentGame
                    ? keJieResults[index]
                      ? "bg-black"
                      : "bg-white border border-black"
                    : "bg-yellow-200"
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: index < currentGame ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            ))}
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold">
            胜: {stats.wins} 负: {stats.losses}
          </p>
          <p className="text-lg">
            胜率:{" "}
            {((stats.wins / (stats.wins + stats.losses)) * 100 || 0).toFixed(2)}
            %
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        注: 这是一个模拟数据的可视化展示,不代表实际战绩
      </p>
    </div>
  );
}
