/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 模拟的棋局胜率数据
const chessData = [
  { game: 1, player1: 0.5, player2: 0.5 },
  { game: 2, player1: 0.6, player2: 0.4 },
  { game: 3, player1: 0.55, player2: 0.45 },
  { game: 4, player1: 0.7, player2: 0.3 },
  { game: 5, player1: 0.65, player2: 0.35 },
];

const ChessRaceVisualization = () => {
  const [currentGame, setCurrentGame] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      const frequency = 220 + chessData[currentGame].player1 * 880;
      oscillator.frequency.setValueAtTime(
        frequency,
        audioContextRef.current.currentTime
      );

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    }
  }, [currentGame]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGame((prev) => (prev + 1) % chessData.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: chessData.map((d) => `Game ${d.game}`),
    datasets: [
      {
        label: "Player 1",
        data: chessData.map((d) => d.player1),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Player 2",
        data: chessData.map((d) => d.player2),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chess Game Win Rates",
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chess Race Visualization</h1>
      <div className="mb-8">
        <Line options={options} data={chartData} />
      </div>
      <div className="relative h-40 bg-gray-200 rounded-full overflow-hidden">
        {chessData.map((data, index) => (
          <motion.div
            key={index}
            className="absolute top-0 h-full bg-blue-500"
            style={{
              left: `${(index / chessData.length) * 100}%`,
              width: `${(1 / chessData.length) * 100}%`,
            }}
            initial={{ height: "0%" }}
            animate={{ height: `${data.player1 * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        ))}
        <motion.div
          className="absolute top-0 left-0 w-8 h-8 bg-red-500 rounded-full"
          animate={{
            x: `${(currentGame / (chessData.length - 1)) * 100}%`,
            y: `${(1 - chessData[currentGame].player1) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default ChessRaceVisualization;
