'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts'
import { useSpring, animated } from 'react-spring'
import { Howl } from 'howler'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Assume we have a music file URL
const MUSIC_URL = '/gem.mp3'

// Function to calculate the fit line
const calculateFitLine = (data) => {
  const n = data.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  data.forEach(point => {
    sumX += point.moveNum
    sumY += point.value
    sumXY += point.moveNum * point.value
    sumX2 += point.moveNum * point.moveNum
  })
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

// Function to calculate performance score
const calculatePerformanceScore = (fitLine) => {
  return fitLine.slope * -1000 + fitLine.intercept * 100 // Example calculation method
}

const GoGameAnalysis = ({ gamesData }) => {
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = useRef(null)

  // Process the data
  const processedGames = gamesData.map(game => {
    const moveData = game.report.reportData.map(move => ({
      moveNum: move.moveNum,
      value: move.data.value
    }))
    const fitLine = calculateFitLine(moveData)
    const performanceScore = calculatePerformanceScore(fitLine)
    return { moveData, fitLine, performanceScore }
  }).sort((a, b) => b.performanceScore - a.performanceScore)

  // Animation properties
  const props = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    reset: true,
    reverse: currentGameIndex % 2 === 0
  })

  // Initialize music
  useEffect(() => {
    soundRef.current = new Howl({
      src: [MUSIC_URL],
      loop: true
    })
  }, [])

  // Control play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      soundRef.current.pause()
    } else {
      soundRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        togglePlayPause()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPlaying])

  // Auto-switch charts
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentGameIndex((prevIndex) => (prevIndex + 1) % processedGames.length)
      }, 5000) // Switch every 5 seconds
      return () => clearInterval(timer)
    }
  }, [isPlaying, processedGames.length])

  const currentGame = processedGames[currentGameIndex]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>围棋对局分析</CardTitle>
        <CardDescription>按空格键控制动画和音乐播放</CardDescription>
      </CardHeader>
      <CardContent>
        <animated.div style={props}>
          <ChartContainer
            config={{
              moveData: {
                label: "走子",
                color: "hsl(var(--chart-1))",
              },
              fitLine: {
                label: "拟合线",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px] w-full"
            style={{ height: '400px' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="moveNum" name="步数" />
                <YAxis type="number" dataKey="value" name="胜率" domain={[0, 1]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Scatter name="走子" data={currentGame.moveData} fill="var(--color-moveData)" />
                <Line
                  type="linear"
                  dataKey="value"
                  data={[
                    { moveNum: 0, value: currentGame.fitLine.intercept },
                    { moveNum: 200, value: currentGame.fitLine.slope * 200 + currentGame.fitLine.intercept }
                  ]}
                  stroke="var(--color-fitLine)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </animated.div>
        <div className="mt-4 text-center">
          <p>性能得分: {currentGame.performanceScore.toFixed(2)}</p>
          <Button onClick={togglePlayPause} className="mt-2">
            {isPlaying ? '暂停' : '播放'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default GoGameAnalysis