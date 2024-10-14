"use client";

import Head from "next/head";
import { KeJieRecordComponent } from "../components/ke-jie-record";

export default function KeJieRecord() {
  return (
    <>
      <Head>
        <title>柯洁围棋战绩可视化 | 数据动画展示</title>
        <meta
          name="description"
          content="通过动态数据可视化展示围棋棋手柯洁的战绩"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            柯洁围棋战绩可视化
          </h1>
          <KeJieRecordComponent />
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              这个可视化展示了柯洁最近50场比赛的模拟结果。每个棋子代表一场比赛，黑色为胜，白色为负。
            </p>
            <p className="text-gray-600 mt-2">
              数据仅供演示，不代表实际战绩。如需查看真实数据，请访问官方围棋比赛记录。
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
