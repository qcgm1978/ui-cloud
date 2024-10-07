'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { PlayIcon, PauseIcon, RefreshCwIcon } from 'lucide-react'

// 模拟的围棋棋手数据，按出生日期排序
const goPlayers = [
  { id: 1, name: "吴清源", birthday: "1914-06-12", rank: 9 },
  { id: 2, name: "藤泽秀行", birthday: "1925-09-19", rank: 9 },
  { id: 3, name: "聂卫平", birthday: "1952-08-12", rank: 9 },
  { id: 4, name: "李昌镐", birthday: "1975-03-29", rank: 9 },
  { id: 5, name: "李世石", birthday: "1983-03-02", rank: 9 },
  { id: 6, name: "古力", birthday: "1983-02-14", rank: 9 },
  { id: 7, name: "柯洁", birthday: "1997-08-25", rank: 9 },
  { id: 8, name: "芈昱廷", birthday: "2000-01-15", rank: 9 },
].sort((a, b) => new Date(a.birthday).getTime() - new Date(b.birthday).getTime())

const startYear = new Date(goPlayers[0].birthday).getFullYear()
const endYear = new Date(goPlayers[goPlayers.length - 1].birthday).getFullYear()

export default function GoPlayersTimeline() {
  const [currentYear, setCurrentYear] = useState(startYear)
  const [visiblePlayers, setVisiblePlayers] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [hoveredPlayer, setHoveredPlayer] = useState(null)

  const resetAnimation = useCallback(() => {
    setCurrentYear(startYear)
    setVisiblePlayers([])
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYear((year) => {
          if (year < endYear) {
            return year + 1
          } else {
            clearInterval(interval)
            setIsPlaying(false)
            return year
          }
        })
      }, 1000) // 每秒更新一次年份
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    setVisiblePlayers(goPlayers.filter(player => new Date(player.birthday).getFullYear() <= currentYear))
  }, [currentYear])

  const getPositionFromBirthday = useCallback((birthday) => {
    const date = new Date(birthday)
    const x = (date.getMonth() * 80 / 12) + 10 + '%'
    const y = (date.getDate() * 80 / 31) + 10 + '%'
    return { x, y }
  }, [])

  return (
    <div className="relative w-full h-screen bg-amber-100 overflow-hidden p-4">
      <div className="absolute inset-0 grid grid-cols-19 grid-rows-19">
        {Array.from({ length: 361 }).map((_, i) => (
          <div key={i} className="border border-black opacity-10" />
        ))}
      </div>

      <AnimatePresence>
        {visiblePlayers.map((player) => {
          const { x, y } = getPositionFromBirthday(player.birthday)
          return (
            <motion.div
              key={player.id}
              className="absolute"
              style={{ left: x, top: y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-12 h-12 bg-black rounded-full flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.2 }}
                onHoverStart={() => setHoveredPlayer(player)}
                onHoverEnd={() => setHoveredPlayer(null)}
              >
                <span className="text-white text-xs">{player.name}</span>
              </motion.div>
              {hoveredPlayer === player && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow z-10"
                >
                  <p className="text-sm">{player.name}</p>
                  <p className="text-xs">生日: {player.birthday}</p>
                  <p className="text-xs">段位: {player.rank}段</p>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className="text-2xl font-bold">{currentYear}</span>
          <button
            onClick={resetAnimation}
            className="bg-gray-500 text-white p-2 rounded"
          >
            <RefreshCwIcon />
          </button>
        </div>
        <div className="bg-gray-200 h-2 rounded-full">
          <div
            className="bg-blue-500 h-full rounded-full"
            style={{ width: `${((currentYear - startYear) / (endYear - startYear)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}