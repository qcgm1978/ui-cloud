/* eslint-disable prefer-const */
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const GoProbabilityMountain = dynamic(
  () => import("../components/ui/GoProbabilityMountain"),
  { ssr: false }
);

const GoAnalysisPage: React.FC = () => {
  const [moveData, setMoveData] = useState<
    Array<{ coord: string; [key: string]: unknown }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const name = "2024-10-02-golaxy-29届LG杯世界棋王战4强-柯洁";
      const response = await fetch(
        `https://localhost:8010/get_file?address=/Users/dickphilipp/Documents/data/resource/${name}.json`
      ); // 假设您有一个API端点
      const data = await response.json();
      const reportData = data[1]["report"]["reportData"];
      let dat = [];
      for (let i = 0; i < reportData.length; i++) {
        const move_report = reportData[i];
        const move_data = JSON.parse(move_report["data"]);
        const options = move_data.options;
        const coord = move_data.next;
        const played_move = options.filter(
          (d: { coord: unknown }) => d.coord == coord
        )[0];
        dat.push({
          prob: played_move.prob,
          winrate: played_move.winrate,
          coord,
        });
      }
      setMoveData(dat as Array<{ coord: string; [key: string]: unknown }>);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Go Analysis Visualization</h1>
      <GoProbabilityMountain
        moveData={
          moveData as Array<{ coord: string; prob: number; winrate: number }>
        }
      />
    </div>
  );
};
export default GoAnalysisPage;
