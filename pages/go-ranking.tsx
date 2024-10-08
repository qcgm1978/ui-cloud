'use client'

import Head from 'next/head'
import {GapminderGoRankingComponent} from '../components/gapminder-go-ranking'

export default function GoRanking() {
  console.log("Rendering GoRanking page")
  return (
    <div className="min-h-screen bg-gray-100">
      {/*<Head>*/}
      {/*  <title>围棋等级分排行动画</title>*/}
      {/*  <meta name="description" content="围棋等级分排行动画可视化" />*/}
      {/*  <link rel="icon" href="/favicon.ico" />*/}
      {/*</Head>*/}

      <main className="container mx-auto px-4 py-8">
        {/*<h1 className="text-4xl font-bold text-center mb-8">围棋等级分排行动画</h1>*/}
        <div className="border-2 border-red-500 p-4">
          <GapminderGoRankingComponent />
        </div>
      </main>

      <footer className="text-center py-4 mt-8">
        <p>&copy; 2024 围棋数据可视化. All rights reserved.</p>
      </footer>
    </div>
  )
}