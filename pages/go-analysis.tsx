"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import GoGameAnalysis from "@/components/go-game-analysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GoAnalysis() {
  const [gamesData, setGamesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("26届围甲13轮");
  const [date, setDate] = useState("2024-10-09");
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8010/get_golaxy_by_name?name=${encodeURIComponent(
          name
        )}&date=${date}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setGamesData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const { name: queryName, date: queryDate } = router.query;
      if (queryName) setName(queryName as string);
      if (queryDate) setDate(queryDate as string);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (name && date) {
      fetchData();
    }
  }, [name, date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/go-analysis?name=${encodeURIComponent(name)}&date=${date}`);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>围棋比赛分析</CardTitle>
          <CardDescription>输入比赛名称和日期以获取分析数据</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比赛名称"
              required
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Button type="submit">获取数据</Button>
          </form>
        </CardContent>
      </Card>

      {loading && <p>加载中...</p>}
      {error && <p className="text-red-500">错误: {error}</p>}
      {gamesData && <GoGameAnalysis gamesData={gamesData} />}
    </div>
  );
}
