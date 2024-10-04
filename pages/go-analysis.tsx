import React from 'react';
import dynamic from 'next/dynamic';

const GoProbabilityMountain = dynamic(() => import('../components/ui/GoProbabilityMountain'), { ssr: false });

const mockMoveData = [
  { coord: 'Q16', prob: 0.3, winrate: 0.55 },
  { coord: 'D4', prob: 0.2, winrate: 0.52 },
  { coord: 'R4', prob: 0.15, winrate: 0.48 },
  // ... 添加更多数据点
];

const GoAnalysisPage: React.FC = () => {
  return (
    <div>
      <h1>Go Analysis Visualization</h1>
      <GoProbabilityMountain moveData={mockMoveData} />
    </div>
  );
};

export default GoAnalysisPage;