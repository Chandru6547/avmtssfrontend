import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function AnimatedSphere() {
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh>
        <sphereGeometry args={[1.3, 64, 64]} />
        <meshStandardMaterial
          color="#667eea"
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function LoginScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} />
      <AnimatedSphere />
    </Canvas>
  );
}
