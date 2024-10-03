/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import cloud from "d3-cloud";

interface WordFrequency {
  text: string;
  value: number;
}

interface CommentData {
  step: number;
  wordFrequencies: WordFrequency[];
}

export default function GoGameWordCloud() {
  const [commentData, setCommentData] = useState<CommentData[]>([]);
  const [currentIndex, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const name = "2024-10-02-golaxy-29届LG杯世界棋王战4强-柯洁-msg";
        const response = await fetch(
          `https://localhost:8010/get_comment_data?address=/Users/dickphilipp/Documents/data/resource/${name}.json`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch comment data");
        }
        const data = await response.json();
        setCommentData(data);
        setIsLoading(false);
      } catch (err) {
        setError("Error loading comment data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: Math.min(window.innerWidth * 0.8, 800),
        height: Math.min(window.innerHeight * 0.6, 600),
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && commentData.length > 0) {
      timer = setInterval(() => {
        setCurrentStep((prevStep) => (prevStep + 1) % commentData.length);
      }, 3000); // 每3秒切换一次
    }
    return () => clearInterval(timer);
  }, [isPlaying, commentData]);

  useEffect(() => {
    if (!canvasRef.current || commentData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const wordFrequencies = commentData[currentIndex].wordFrequencies

    const maxFrequency = Math.max(...wordFrequencies.map(w => w.value))
    const minFrequency = Math.min(...wordFrequencies.map(w => w.value))

    const sizeScale = (freq: number) => {
      // 将词频映射到 20-100 的范围
      return 20 + (freq - minFrequency) / (maxFrequency - minFrequency) * 80
    }

    cloud()
      .size([windowSize.width, windowSize.height])
      .words(wordFrequencies.map(w => ({
        text: w.text,
        size: sizeScale(w.value)
      })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 6) - 3) * 30)
      .font("Arial")
      .fontSize(d => d.size!)
      .on("end", (words) => {
        ctx.clearRect(0, 0, windowSize.width, windowSize.height)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        words.forEach((word: any) => {
          const { x, y, size, text } = word
          ctx.font = `${size}px Arial`
          ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`
          ctx.fillText(text, x + windowSize.width / 2, y + windowSize.height / 2)
        })
      })
      .start()
  }, [currentIndex, windowSize, commentData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold text-red-500">{error}</div>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold text-red-500">{error}</div>
      </div>
    );
  }

  if (commentData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold">暂无评论数据</div>
      </div>
    );
  }
  const currentData = commentData[currentIndex]
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">
        围棋评论单词云 - 第 {currentData.step} 步
      </h2>
      <div
        className="bg-white rounded-lg shadow-lg p-4"
        style={{ width: windowSize.width, height: windowSize.height }}
      >
        <canvas
          ref={canvasRef}
          width={windowSize.width}
          height={windowSize.height}
        />
      </div>
      <div className="mt-4 space-x-2">
        <Button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? "暂停" : "继续"}
        </Button>
        <Button
          onClick={() =>
            setCurrentStep(
              (prevStep) =>
                (prevStep - 1 + commentData.length) % commentData.length
            )
          }
        >
          上一步
        </Button>
        <Button
          onClick={() =>
            setCurrentStep((prevStep) => (prevStep + 1) % commentData.length)
          }
        >
          下一步
        </Button>
      </div>
    </div>
  );
}
