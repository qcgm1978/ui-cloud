/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
import cloud from "d3-cloud";

interface WordFrequency {
  text: string;
  value: number;
}

interface CommentData {
  step: number;
  wordFrequencies: WordFrequency[];
  averageSentiment: number;
}
function getSentimentColor(sentiment: number): string {
  if (sentiment < 0.4) return "bg-red-500";
  if (sentiment > 0.6) return "bg-green-500";
  return "bg-yellow-500";
}
function getSentimentColorStr(sentiment: number): string {
  if (sentiment < 0.4) return "#ef4444"; // red-500
  if (sentiment > 0.6) return "#22c55e"; // green-500
  return "#eab308"; // yellow-500
}

function getSentimentLabel(sentiment: number): string {
  if (sentiment < 0.4) return "消极";
  if (sentiment > 0.6) return "积极";
  return "中性";
}
export default function GoGameWordCloud() {
  const [commentData, setCommentData] = useState<CommentData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 600, height: 400 });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
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
        height: window.innerHeight * 0.81,
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
        setCurrentIndex((prevStep) => {
          const nextIndex = prevStep + 1;
          return nextIndex < commentData.length ? nextIndex : prevStep; // Prevents repeating and does not reset to 0
        });
      }, 1000); // 每3秒切换一次
    }
    return () => clearInterval(timer);
  }, [isPlaying, commentData]);

  useEffect(() => {
    if (!canvasRef.current || commentData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const word_freq = commentData[currentIndex].wordFrequencies;
    word_freq.sort((a, b) => a.value - b.value);
    const wordFrequencies = word_freq.slice(-20)
    // const wordFrequencies = word_freq;
    const maxFrequency = Math.max(...wordFrequencies.map((w) => w.value));
    const minFrequency = Math.min(...wordFrequencies.map((w) => w.value));

    const sizeScale = (freq: number) => {
      if (maxFrequency == minFrequency) {
        return 40;
      }
      return 20 + ((freq - minFrequency) / (maxFrequency - minFrequency)) * 36;
    };

    const diameter = Math.min(windowSize.width, windowSize.height) * 0.9;
    const radius = diameter / 2;

    cloud()
      .size([diameter, diameter])
      .words(
        wordFrequencies.map((w) => ({
          text: w.text,
          size: sizeScale(w.value),
        }))
      )
      .padding(5)
      .rotate(() => 0) // 不旋转文字
      // .rotate(() => (~~(Math.random() * 6) - 3) * 30)
      .font("Arial")
      .fontSize((d) => d.size!)
      .spiral("archimedean") // 使用阿基米德螺旋线布局
      .on("end", (words) => {
        ctx.clearRect(0, 0, windowSize.width, windowSize.height);
        ctx.save();
        ctx.translate(windowSize.width / 2, windowSize.height / 2);

        // 绘制圆圈
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = getSentimentColorStr(
          commentData[currentIndex].averageSentiment
        );
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        words.forEach((word: any) => {
          const { x, y, size, text } = word;
          ctx.font = `${size}px Arial`;
          ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
          ctx.fillText(text, x, y);
        });

        ctx.restore();
      })
      .start();
  }, [currentIndex, windowSize, commentData]);
  useEffect(() => {
    if (isAudioLoaded) {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = volume;
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then((_) => {
              // 自动播放成功
              setIsMusicPlaying(true);
            })
            .catch((error) => {
              // 自动播放被阻止
              console.log("自动播放被阻止:", error);
              setIsMusicPlaying(false);
            });
        }
      }
    }
  }, [isAudioLoaded, volume]);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsMusicPlaying(true);
          })
          .catch((error) => {
            console.log("播放被阻止:", error);
          });
      }
    }
  };
  const handleAudioLoaded = () => {
    setIsAudioLoaded(true);
  };
  const toggleMusicAndPlay = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
        setIsPlaying(false); // Stop word cloud switching
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsMusicPlaying(true);
            setIsPlaying(true); // Start word cloud switching
          })
          .catch((error) => {
            console.log("播放被阻止:", error);
          });
      }
    }
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault(); // Prevent scrolling when space is pressed
        toggleMusicAndPlay(); // Toggle music playback and word cloud switching
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMusicPlaying]); // Dependency on isMusicPlaying to ensure the latest state is used

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
  const currentData = commentData[currentIndex];
  const sentimentColor = getSentimentColor(currentData.averageSentiment);
  const sentimentLabel = getSentimentLabel(currentData.averageSentiment);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">
        围棋评论单词云 - 第 {currentData.step} 步
      </h2>
      <div
        className="bg-white rounded-lg shadow-lg "
        style={{ width: windowSize.width, height: windowSize.height }}
      >
        <canvas
          ref={canvasRef}
          width={windowSize.width}
          height={windowSize.height}
        />
      </div>
      <div className="mt-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">评论情绪</h3>
        <Progress
          value={currentData.averageSentiment * 100}
          color={sentimentColor}
          className="w-full"
        />
        <p className="text-sm text-gray-600 mt-1">
          情绪评分: {(currentData.averageSentiment * 100).toFixed(2)}% (
          {sentimentLabel})
        </p>
      </div>
      <div className="mt-4 space-x-2">
        <Button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? "暂停" : "继续"}
        </Button>
        <Button
          onClick={() =>
            setCurrentIndex(
              (prevStep) =>
                (prevStep - 1 + commentData.length) % commentData.length
            )
          }
        >
          上一步
        </Button>
        <Button
          onClick={() =>
            setCurrentIndex((prevStep) => (prevStep + 1) % commentData.length)
          }
        >
          下一步
        </Button>
      </div>
      {/* <div className="mt-4 flex items-center space-x-4">
        <Button onClick={toggleMusic}>
          {isMusicPlaying ? "暂停音乐" : "播放音乐"}
        </Button>
        <div className="flex items-center space-x-2">
          {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(value: React.SetStateAction<number>[]) =>
              setVolume(value[0])
            }
            className="w-32"
          />
        </div>
      </div> */}

      <audio ref={audioRef} loop
        // onLoadedData={handleAudioLoaded}
      >
        <source src="/gem.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}