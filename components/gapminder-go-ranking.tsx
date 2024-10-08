"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { select, scalePoint, scaleLinear, scaleOrdinal, min, max, axisBottom, axisLeft, forceSimulation, forceX, forceY, forceCollide } from 'd3'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { Howl } from 'howler'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface GoPlayer {
  name: string
  yearsListed: number
  img: string
  num: number
  rating: number | null
}

const GapminderGoRankingComponent = React.memo(() => {
  console.log("Rendering GapminderGoRankingComponent")

  const svgRef = useRef<SVGSVGElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = useRef<Howl | null>(null)
  const yearsRef = useRef<string[]>([])
  const currentYearIndexRef = useRef(0)
  const [goData, setGoData] = useState<GoPlayer[]>([])
  const [animationSpeed, setAnimationSpeed] = useState(2000)
  const [currentYear, setCurrentYear] = useState<string>('')

  const fetchData = useCallback(async () => {
    try {
      console.log("Fetching data...")
      const response = await fetch('http://localhost:8010/get_ratings_csv')
      const data: (string | null)[][] = await response.json()
      console.log("Received data:", data)
      
      if (!data || data.length < 2) {
        console.error('Invalid data format')
        return
      }

      const headers = data[0]
      if (!headers) {
        console.error('Invalid headers')
        return
      }

      yearsRef.current = headers.slice(4).filter((year): year is string => year !== null)
      console.log("Years:", yearsRef.current)

      const processedData = yearsRef.current.reduce((acc, year) => {
        const yearData = data.slice(1)
          .map((row, index) => ({
            name: row[0] || '',
            yearsListed: parseInt(row[1] || '0'),
            img: row[2] || '',
            num: parseInt(row[3] || '0'),
            rating: row[headers.indexOf(year)] !== null ? Number(row[headers.indexOf(year)]) : null
          }))
          .filter(player => player.rating !== null && !isNaN(player.rating))
          .sort((a, b) => (b.rating as number) - (a.rating as number))
          .slice(0, 20)

        acc[year] = yearData
        return acc
      }, {} as Record<string, GoPlayer[]>)

      console.log("Processed data:", processedData)
      setGoData(processedData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])

  const updateChart = useCallback((year: string) => {
    console.log("Updating chart for year:", year)
    if (!svgRef.current || !goData[year]) {
      console.log("SVG ref or data not available")
      return
    }

    const svg = select(svgRef.current)
    const width = window.innerWidth
    const height = window.innerHeight
    const margin = { top: 20, right: 20, bottom: 50, left: 40 }

    const yearData = goData[year]

    const allRatings = yearData.map(player => player.rating as number)

    const minRating = min(allRatings) || 0
    const maxRating = max(allRatings) || 0

    const x = scalePoint()
      .range([margin.left, width - margin.right])
      .domain(yearsRef.current)

    const y = scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([minRating, maxRating])
      .nice()

    const r = scaleLinear()
      .range([5, 40])
      .domain([minRating, maxRating])

    const color = scaleOrdinal(schemeCategory10)

    const simulation = forceSimulation(yearData)
      .force("x", forceX((d: GoPlayer) => Math.max(margin.left + r(d.rating as number), Math.min(width - margin.right - r(d.rating as number), x(year) || 0))).strength(0.1))
      .force("y", forceY((d: GoPlayer) => Math.max(margin.top + r(d.rating as number), Math.min(height - margin.bottom - r(d.rating as number), y(d.rating as number)))).strength(0.1))
      .force("collide", forceCollide((d: GoPlayer) => r(d.rating as number) + 1).iterations(4))
      .stop()

    for (let i = 0; i < 120; ++i) simulation.tick()

    // 不要清除所有旧元素
    // svg.selectAll('*').remove()

    // 更新轴和标签
    svg.select('.x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x) as any)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    svg.select('.y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(10) as any)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.1)
      )

    svg.select('.year-label')
      .text(year)

    // 更新玩家
    const players = svg.selectAll<SVGGElement, GoPlayer>('g.player')
      .data(yearData, (d: GoPlayer) => d.name)

    // 移除退出的玩家
    players.exit()
      .transition()
      .duration(animationSpeed)
      .style('opacity', 0)
      .remove()

    // 添加新的玩家
    const enterPlayers = players.enter()
      .append('g')
      .attr('class', 'player')
      .attr('transform', (d: GoPlayer) => `translate(${(d as any).x},${(d as any).y})`)
      .style('opacity', 0)

    enterPlayers.append('circle')
      .attr('r', 0)
      .attr('fill', (d: GoPlayer) => color(d.name) as string)
      .attr('opacity', 0.7)

    enterPlayers.append('text')
      .attr('class', 'player-name')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .text((d: GoPlayer) => d.name)
      .style('font-size', '0px')

    // 更新所有玩家
    const allPlayers = enterPlayers.merge(players)

    allPlayers.transition()
      .duration(animationSpeed)
      .style('opacity', 1)
      .attr('transform', (d: GoPlayer) => `translate(${(d as any).x},${(d as any).y})`)

    allPlayers.select('circle')
      .transition()
      .duration(animationSpeed)
      .attr('r', (d: GoPlayer) => r(d.rating as number))

    allPlayers.select('text')
      .transition()
      .duration(animationSpeed)
      .style('font-size', (d: GoPlayer) => `${r(d.rating as number) / 2}px`)

    setCurrentYear(year)
  }, [goData, animationSpeed])

  useEffect(() => {
    console.log("Fetching data...")
    fetchData()

    const svg = select(svgRef.current)
    const width = window.innerWidth
    const height = window.innerHeight
    const margin = { top: 20, right: 20, bottom: 50, left: 40 }

    svg.attr('width', width)
      .attr('height', height)

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},0)`)

    svg.append('text')
      .attr('class', 'year-label')
      .attr('x', width - margin.right)
      .attr('y', height - margin.bottom + 40)
      .attr('font-size', '24px')
      .attr('text-anchor', 'end')

    soundRef.current = new Howl({
      src: ['/gem.mp3'],
      loop: true,
    })

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsPlaying(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      if (soundRef.current) {
        soundRef.current.unload()
      }
    }
  }, [fetchData])

  useEffect(() => {
    if (Object.keys(goData).length > 0 && yearsRef.current.length > 0) {
      updateChart(yearsRef.current[0])
    }
  }, [goData, updateChart])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const animate = () => {
      if (currentYearIndexRef.current < yearsRef.current.length - 1) {
        currentYearIndexRef.current += 1
        updateChart(yearsRef.current[currentYearIndexRef.current])
        timeoutId = setTimeout(animate, animationSpeed)
      } else {
        setIsPlaying(false)
        if (soundRef.current) {
          soundRef.current.pause()
        }
      }
    }

    if (isPlaying) {
      timeoutId = setTimeout(animate, animationSpeed)
      if (soundRef.current) {
        soundRef.current.play()
      }
    }

    return () => {
      clearTimeout(timeoutId)
      if (soundRef.current) {
        soundRef.current.pause()
      }
    }
  }, [isPlaying, updateChart, animationSpeed])

  const handleReset = () => {
    currentYearIndexRef.current = 0
    updateChart(yearsRef.current[0])
    setIsPlaying(false)
    if (soundRef.current) {
      soundRef.current.pause()
      soundRef.current.seek(0)
    }
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="text-red-500">GapminderGoRankingComponent is rendering</div>
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center bg-white bg-opacity-50 px-4 py-2 rounded">
        <div className="flex items-center mb-2">
          <Button onClick={() => setIsPlaying(!isPlaying)} className="mr-2">
            {isPlaying ? '暂停' : '播放'}
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </div>
        <div className="flex items-center">
          <span className="mr-2">动画速度:</span>
          <Slider
            min={1000}
            max={10000}
            step={1000}
            value={[animationSpeed]}
            onValueChange={(value) => setAnimationSpeed(value[0])}
            className="w-64"
          />
          <span className="ml-2">{animationSpeed / 1000}秒</span>
        </div>
        <div className="mt-2">
          <span>当前年份: {currentYear}</span>
        </div>
      </div>
    </div>
  )
})

// 添加显示名称
GapminderGoRankingComponent.displayName = 'GapminderGoRankingComponent'

export { GapminderGoRankingComponent }