import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

interface MoveData {
  coord: string;
  prob: number;
  winrate: number;
}

interface GoProbabilityMountainProps {
  moveData: MoveData[];
}

const BoardSize = 19;
const MountainHeight = 5;

const coordToPosition = (coord: string): [number, number] => {
  const [col, row] = coord.split("");
  const x = col.charCodeAt(0) - "A".charCodeAt(0) - 9;
  const z = BoardSize - parseInt(row);
  return [x, z];
};

const Mountain: React.FC<{ moveData: MoveData[] }> = ({ moveData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!meshRef.current) return;

    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];

    moveData.forEach((move) => {
      const [x, z] = coordToPosition(move.coord);
      const y = move.prob * MountainHeight;

      vertices.push(x, y, z);

      const color = new THREE.Color();
      color.setHSL(move.winrate * 0.3, 1, 0.5);
      colors.push(color.r, color.g, color.b);
    });

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5, // 增加点的大小以确保所有点都可见
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    return () => {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    };
  }, [moveData, scene]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[BoardSize, 0.1, BoardSize]} />
      <meshStandardMaterial color="#d4a556" />
    </mesh>
  );
};

const GoProbabilityMountain: React.FC<GoProbabilityMountainProps> = ({
  moveData,
}) => {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Canvas camera={{ position: [0, 15, 20], fov: 60 }}>
        {/* // 调整相机位置和视野 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Mountain moveData={moveData} />
        <OrbitControls />
        <Text
          position={[0, MountainHeight + 1, 0]}
          color="white"
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
        >
          Go Probability Mountain
        </Text>
      </Canvas>
    </div>
  );
};

export default GoProbabilityMountain;
