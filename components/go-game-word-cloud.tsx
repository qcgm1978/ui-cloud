"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import cloud from 'd3-cloud'

// 模拟的评论数据
const commentData = [
  { step: 1, comments: "开局 布局 好棋 有趣" },
  { step: 2, comments: "攻击 防守 激烈 紧张" },
  { step: 3, comments: "中盘 战略 复杂 深奥" },
  { step: 4, comments: "收官 计算 精妙 惊人" },
  { step: 5, comments: "结束 精彩 高手 精彩对局" },
]

export function GoGameWordCloud() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [windowSize, setWindowSize] = useState({ width: 600, height: 400 })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.6
      })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prevStep) => (prevStep + 1) % commentData.length)
      }, 3000) // 每3秒切换一次
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const words = commentData[currentStep].comments.split(' ').map(word => ({
      text: word,
      size: Math.floor(Math.random() * 50) + 20 // 随机大小
    }))

    cloud()
      .size([windowSize.width, windowSize.height])
      .words(words)
      .padding(5)
      .rotate(() => (~~(Math.random() * 6) - 3) * 30)
      .font("Arial")
      .fontSize(d => d.size?? 0)
      .on("end", (words) => {
        ctx.clearRect(0, 0, windowSize.width, windowSize.height)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        words.forEach(word => {
          const { x, y, size, text } = word
          ctx.font = `${size}px Arial`
          ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`
          ctx.fillText(text?? '', x?? 0 + windowSize.width / 2, y?? 0 + windowSize.height / 2)
        })
      })
      .start()
  }, [currentStep, windowSize])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">围棋评论单词云 - 第 {commentData[currentStep].step} 步</h2>
      <div className="bg-white rounded-lg shadow-lg p-4" style={{ width: windowSize.width, height: windowSize.height }}>
        <canvas ref={canvasRef} width={windowSize.width} height={windowSize.height} />
      </div>
      <div className="mt-4 space-x-2">
        <Button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '暂停' : '继续'}
        </Button>
        <Button onClick={() => setCurrentStep((prevStep) => (prevStep - 1 + commentData.length) % commentData.length)}>
          上一步
        </Button>
        <Button onClick={() => setCurrentStep((prevStep) => (prevStep + 1) % commentData.length)}>
          下一步
        </Button>
      </div>
    </div>
  )
}