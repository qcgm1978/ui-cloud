"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Howl } from 'howler'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface GoPlayer {
  name: string
  yearsListed: number
  img: string
  num: number
  [year: string]: string | number | null
}

export function GapminderGoRankingComponent() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = useRef<Howl | null>(null)
  const yearsRef = useRef<string[]>([])
  const currentYearIndexRef = useRef(0)
  const [goData, setGoData] = useState<GoPlayer[]>([])
  const [animationSpeed, setAnimationSpeed] = useState(1000)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8010/get_ratings_csv')
      const data: (string | null)[][] = await response.json()
      
      if (!data || data.length < 2) {
        console.error('Invalid data format')
        return
      }

      const headers = data[0]
      if (!headers) {
        console.error('Invalid headers')
        return
      }

      const playerData = data.slice(1).map(row => {
        if (!row) return null
        const player: GoPlayer = {
          name: row[0] || '',
          yearsListed: parseInt(row[1] || '0'),
          img: row[2] || '',
          num: parseInt(row[3] || '0')
        }
        headers.slice(4).forEach((year, index) => {
          if (year) {
            player[year] = row[index + 4] !== null ? Number(row[index + 4]) : null
          }
        })
        return player
      }).filter((player): player is GoPlayer => player !== null)

      setGoData(playerData)
      yearsRef.current = headers.slice(5).filter((year): year is string => year !== null)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])

  const updateChart = useCallback((year: string) => {
    if (!svgRef.current || goData.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = window.innerWidth
    const height = window.innerHeight
    const margin = { top: 20, right: 20, bottom: 50, left: 40 }

    const x = d3.scalePoint()
      .range([margin.left, width - margin.right])
      .domain(yearsRef.current)

    const allRatings = goData.flatMap(player => 
      yearsRef.current.map(year => Number(player[year]))
    ).filter(rating => rating !== null && !isNaN(rating))

    const y = d3.scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([d3.min(allRatings) || 0, d3.max(allRatings) || 0])

    const r = d3.scaleLinear()
      .range([5, 40])
      .domain([d3.min(allRatings) || 0, d3.max(allRatings) || 0])

    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const yearData = goData.filter(d => d[year] !== undefined && d[year] !== null && d[year] !== "")

    // Force simulation to prevent overlap
    const simulation = d3.forceSimulation(yearData)
      .force("x", d3.forceX((d: any) => x(year)!).strength(0.1))
      .force("y", d3.forceY((d: any) => y(Number(d[year]))).strength(0.1))
      .force("collide", d3.forceCollide((d: any) => r(Number(d[year])) + 1).iterations(4))
      .stop()

    for (let i = 0; i < 120; ++i) simulation.tick()

    const circles = svg.selectAll('circle')
      .data(yearData, d => d.name)

    circles.enter()
      .append('circle')
      .attr('r', d => r(Number(d[year])))
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('fill', d => color(d.name) as string)
      .attr('opacity', 0.7)
      .merge(circles as any)
      .transition()
      .duration(animationSpeed)
      .attr('r', d => r(Number(d[year])))
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)

    circles.exit().remove()

    const texts = svg.selectAll('text.player-name')
      .data(yearData, d => d.name)

    texts.enter()
      .append('text')
      .attr('class', 'player-name')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .merge(texts as any)
      .transition()
      .duration(animationSpeed)
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)

    texts.exit().remove()

    svg.select('.x-axis')
      .call(d3.axisBottom(x) as any)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    svg.select('.y-axis').call(d3.axisLeft(y) as any)

    svg.select('.year-label')
      .text(year)
  }, [goData, animationSpeed])

  useEffect(() => {
    fetchData()

    const svg = d3.select(svgRef.current)
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
    if (goData.length > 0 && yearsRef.current.length > 0) {
      updateChart(yearsRef.current[0])
    }
  }, [goData, updateChart])

  useEffect(() => {
    let animationId: number

    const animate = () => {
      if (currentYearIndexRef.current < yearsRef.current.length - 1) {
        currentYearIndexRef.current += 1
        updateChart(yearsRef.current[currentYearIndexRef.current])
        animationId = setTimeout(animate, animationSpeed)
      } else {
        setIsPlaying(false)
        if (soundRef.current) {
          soundRef.current.pause()
        }
      }
    }

    if (isPlaying) {
      animationId = setTimeout(animate, animationSpeed)
      if (soundRef.current) {
        soundRef.current.play()
      }
    } else {
      clearTimeout(animationId)
      if (soundRef.current) {
        soundRef.current.pause()
      }
    }

    return () => {
      clearTimeout(animationId)
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
            min={100}
            max={5000}
            step={100}
            value={[animationSpeed]}
            onValueChange={(value) => setAnimationSpeed(value[0])}
            className="w-64"
          />
          <span className="ml-2">{animationSpeed}ms</span>
        </div>
      </div>
    </div>
  )
}