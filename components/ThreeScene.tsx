"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

type ModelType = string;

/* ─── Materials ─── */
const matteIvory = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#E8E2D4"),
  metalness: 0.1,
  roughness: 0.65,
  clearcoat: 0.2,
});

const chromeEmber = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#E85D2A"),
  metalness: 0.85,
  roughness: 0.15,
  envMapIntensity: 1.2,
});

const chromeDark = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#0E1116"),
  metalness: 0.9,
  roughness: 0.1,
  envMapIntensity: 1.5,
});

const chromeGold = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#E0A536"),
  metalness: 0.8,
  roughness: 0.2,
  envMapIntensity: 1.0,
});

const glassEmber = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#E85D2A"),
  metalness: 0.3,
  roughness: 0.1,
  transparent: true,
  opacity: 0.6,
  envMapIntensity: 1.0,
});

const tireRubber = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#1a1a1a"),
  metalness: 0.0,
  roughness: 0.9,
});

/* ─── Lights ─── */
function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.3} color="#E8E2D4" />
      <directionalLight
        position={[5, 6, 4]}
        intensity={2.0}
        color="#E85D2A"
        castShadow
      />
      <directionalLight
        position={[-4, 3, -5]}
        intensity={1.0}
        color="#2F6D4F"
      />
      <directionalLight
        position={[0, -2, 6]}
        intensity={0.8}
        color="#E0A536"
      />
      <pointLight position={[-3, 4, 2]} intensity={0.4} color="#E85D2A" />
    </>
  );
}

/* ─── Particles ─── */
function DriftParticles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 6;
      p[i * 3 + 1] = (Math.random() - 0.5) * 4;
      p[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return p;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const ge = ref.current.geometry;
    const posAttr = ge.attributes.position;
    if (!posAttr) return;
    const pos = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1]! += Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.001;
      pos[i * 3]! += Math.cos(state.clock.elapsedTime * 0.15 + i * 0.5) * 0.001;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#E0A536"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Ground shadow ─── */
function GroundShadow() {
  return (
    <ContactShadows
      position={[0, -0.8, 0]}
      opacity={0.5}
      scale={6}
      blur={3}
      far={4}
      color="#0E1116"
    />
  );
}

/* ─── Per-type 3D models ─── */

function MotorcycleModel() {
  const group = useRef<THREE.Group>(null);

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Rear wheel */}
      <mesh position={[-1.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.55, 0.1, 12, 20]} />
        <primitive object={tireRubber} />
      </mesh>
      <mesh position={[-1.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.55, 0.04, 12, 20]} />
        <meshPhysicalMaterial color="#555" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Front wheel */}
      <mesh position={[1.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.55, 0.1, 12, 20]} />
        <primitive object={tireRubber} />
      </mesh>
      <mesh position={[1.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.55, 0.04, 12, 20]} />
        <meshPhysicalMaterial color="#555" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Frame - main spine */}
      <mesh position={[0, 0.1, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[2.0, 0.08, 0.08]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Frame - down tubes */}
      <mesh position={[-0.6, 0.2, 0.15]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
        <primitive object={chromeDark} />
      </mesh>
      <mesh position={[-0.6, 0.2, -0.15]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Fuel tank */}
      <mesh position={[0.15, 0.35, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.5, 8]} />
        <primitive object={chromeEmber} />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.6, 0.35, 0]}>
        <boxGeometry args={[0.45, 0.08, 0.2]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Handlebars */}
      <mesh position={[1.2, 0.55, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
        <primitive object={chromeDark} />
      </mesh>
      <mesh position={[1.25, 0.55, 0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 0.06, 6]} />
        <primitive object={chromeGold} />
      </mesh>
      <mesh position={[1.25, 0.55, -0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 0.06, 6]} />
        <primitive object={chromeGold} />
      </mesh>

      {/* Fork */}
      <mesh position={[1.2, 0.15, 0]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Engine block */}
      <mesh position={[-0.3, -0.05, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.2]} />
        <meshPhysicalMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Exhaust pipe */}
      <mesh position={[-0.8, -0.15, 0.2]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
        <primitive object={chromeEmber} />
      </mesh>
    </group>
  );
}

function CarModel() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.4, 0.4, 1.0]} />
        <primitive object={matteIvory} />
      </mesh>

      {/* Cabin */}
      <mesh position={[-0.1, 0.5, 0]}>
        <boxGeometry args={[1.0, 0.35, 0.85]} />
        <primitive object={glassEmber} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0.6, 0.4, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.08, 0.3, 0.85]} />
        <meshPhysicalMaterial
          color="#E8E2D4"
          metalness={0.1}
          roughness={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Rear window */}
      <mesh position={[-0.7, 0.4, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.08, 0.25, 0.85]} />
        <meshPhysicalMaterial
          color="#E8E2D4"
          metalness={0.1}
          roughness={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Wheels */}
      {[
        [-0.8, -0.2, 0.55],
        [-0.8, -0.2, -0.55],
        [0.8, -0.2, 0.55],
        [0.8, -0.2, -0.55],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.28, 0.08, 10, 16]} />
            <primitive object={tireRubber} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.28, 0.03, 10, 16]} />
            <meshPhysicalMaterial color="#555" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[1.25, 0.2, 0.3]}>
        <circleGeometry args={[0.08, 12]} />
        <meshPhysicalMaterial color="#E0A536" emissive="#E0A536" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1.25, 0.2, -0.3]}>
        <circleGeometry args={[0.08, 12]} />
        <meshPhysicalMaterial color="#E0A536" emissive="#E0A536" emissiveIntensity={0.3} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-1.25, 0.2, 0.3]}>
        <circleGeometry args={[0.06, 12]} />
        <meshPhysicalMaterial color="#E85D2A" emissive="#E85D2A" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-1.25, 0.2, -0.3]}>
        <circleGeometry args={[0.06, 12]} />
        <meshPhysicalMaterial color="#E85D2A" emissive="#E85D2A" emissiveIntensity={0.2} />
      </mesh>

      {/* Silver trim line */}
      <mesh position={[0, 0.18, 0.52]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2.0, 0.02, 0.02]} />
        <primitive object={chromeGold} />
      </mesh>
      <mesh position={[0, 0.18, -0.52]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2.0, 0.02, 0.02]} />
        <primitive object={chromeGold} />
      </mesh>
    </group>
  );
}

function ScooterModel() {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Platform / floorboard */}
      <mesh position={[0, 0.0, 0]}>
        <boxGeometry args={[0.8, 0.06, 0.5]} />
        <meshPhysicalMaterial color="#333" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Stem / column */}
      <mesh position={[0.7, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 8]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Handlebars */}
      <mesh position={[0.85, 0.6, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.3, 0.35, 0]}>
        <boxGeometry args={[0.4, 0.08, 0.2]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.15, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Rear wheel */}
      <mesh position={[-0.6, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.07, 10, 16]} />
        <primitive object={tireRubber} />
      </mesh>
      <mesh position={[-0.6, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.025, 10, 16]} />
        <meshPhysicalMaterial color="#555" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Front wheel */}
      <mesh position={[0.7, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.07, 10, 16]} />
        <primitive object={tireRubber} />
      </mesh>
      <mesh position={[0.7, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.025, 10, 16]} />
        <meshPhysicalMaterial color="#555" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Fender */}
      <mesh position={[0.7, 0.0, 0]}>
        <boxGeometry args={[0.12, 0.02, 0.4]} />
        <primitive object={chromeEmber} />
      </mesh>
      <mesh position={[-0.6, 0.0, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.35]} />
        <primitive object={chromeEmber} />
      </mesh>
    </group>
  );
}

function TentModel() {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Main body — 4-sided pyramid */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.7, 0.9, 4]} />
        <meshPhysicalMaterial
          color="#2F6D4F"
          metalness={0.05}
          roughness={0.85}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner pyramid (lighter) */}
      <mesh position={[0, 0.45, 0]} scale={0.85}>
        <coneGeometry args={[0.7, 0.9, 4]} />
        <meshPhysicalMaterial
          color="#E8E2D4"
          metalness={0.0}
          roughness={0.9}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pole structure — 4 edge poles */}
      {[
        [0.45, 0.5, 0.45],
        [-0.45, 0.5, 0.45],
        [0.45, 0.5, -0.45],
        [-0.45, 0.5, -0.45],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0.5, i * Math.PI / 2, 0.3]}>
          <cylinderGeometry args={[0.02, 0.025, 1.1, 6]} />
          <meshPhysicalMaterial color="#ccc" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Peak cap */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <primitive object={chromeGold} />
      </mesh>

      {/* Entry opening */}
      <mesh position={[0.3, 0.25, 0.55]} rotation={[0, 0, 0.2]}>
        <planeGeometry args={[0.35, 0.45]} />
        <meshPhysicalMaterial
          color="#0E1116"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ground base */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshPhysicalMaterial
          color="#2F6D4F"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function CameraModel() {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.8, 0.35, 0.5]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Lens barrel */}
      <mesh position={[0.45, 0.1, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 0.35, 16]} />
        <meshPhysicalMaterial color="#333" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Lens glass */}
      <mesh position={[0.65, 0.1, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshPhysicalMaterial
          color="#2F6D4F"
          metalness={0.1}
          roughness={0.05}
          transparent
          opacity={0.3}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Viewfinder */}
      <mesh position={[-0.3, 0.3, 0.2]}>
        <boxGeometry args={[0.2, 0.1, 0.15]} />
        <primitive object={chromeEmber} />
      </mesh>

      {/* Flash */}
      <mesh position={[-0.35, 0.3, -0.2]}>
        <boxGeometry args={[0.12, 0.04, 0.1]} />
        <meshPhysicalMaterial color="#E8E2D4" metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Grip texture */}
      <mesh position={[0.1, -0.05, 0.27]}>
        <boxGeometry args={[0.3, 0.2, 0.04]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Hot shoe */}
      <mesh position={[-0.15, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.02, 0.08]} />
        <primitive object={chromeGold} />
      </mesh>
    </group>
  );
}

function BicycleModel() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* Rear wheel */}
      <mesh position={[-1.0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.45, 0.06, 10, 20]} />
        <primitive object={tireRubber} />
      </mesh>
      <mesh position={[-1.0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.45, 0.025, 10, 18]} />
        <meshPhysicalMaterial color="#555" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Front wheel */}
      <mesh position={[1.0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.45, 0.06, 10, 20]} />
        <primitive object={tireRubber} />
      </mesh>
      <mesh position={[1.0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.45, 0.025, 10, 18]} />
        <meshPhysicalMaterial color="#555" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Frame — top tube */}
      <mesh position={[0.1, 0.15, 0]} rotation={[0.05, 0, 0.15]}>
        <cylinderGeometry args={[0.03, 0.035, 1.6, 6]} />
        <primitive object={chromeEmber} />
      </mesh>

      {/* Frame — down tube */}
      <mesh position={[0.2, 0.0, 0]} rotation={[0.05, 0, -0.25]}>
        <cylinderGeometry args={[0.03, 0.035, 1.0, 6]} />
        <primitive object={chromeEmber} />
      </mesh>

      {/* Frame — seat tube */}
      <mesh position={[-0.55, 0.0, 0]} rotation={[0.05, 0, 0.2]}>
        <cylinderGeometry args={[0.03, 0.035, 0.5, 6]} />
        <primitive object={chromeEmber} />
      </mesh>

      {/* Fork */}
      <mesh position={[1.0, 0.05, 0]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.025, 0.03, 0.5, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Handlebars */}
      <mesh position={[1.05, 0.4, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.55, 0.35, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.12]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Seat post */}
      <mesh position={[-0.55, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.3, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Pedal crank */}
      <mesh position={[-0.1, -0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 6]} />
        <primitive object={chromeGold} />
      </mesh>
    </group>
  );
}

function EventsModel() {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Arch stage frame */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.7, 0.04, 8, 16, Math.PI]} />
        <primitive object={chromeEmber} />
      </mesh>

      {/* Stage platform */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.8]} />
        <primitive object={matteIvory} />
      </mesh>

      {/* Vertical posts */}
      <mesh position={[-0.7, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.6, 6]} />
        <primitive object={chromeDark} />
      </mesh>
      <mesh position={[0.7, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.6, 6]} />
        <primitive object={chromeDark} />
      </mesh>

      {/* Decorative bulbs */}
      {[-0.5, -0.2, 0.1, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshPhysicalMaterial
            color={i % 2 === 0 ? "#E0A536" : "#E85D2A"}
            emissive={i % 2 === 0 ? "#E0A536" : "#E85D2A"}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* Curtain suggestion — side panels */}
      <mesh position={[-0.65, 0.35, 0.35]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.5]} />
        <meshPhysicalMaterial color="#E8E2D4" transparent opacity={0.2} metalness={0.1} roughness={0.8} />
      </mesh>
      <mesh position={[0.65, 0.35, -0.35]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.5]} />
        <meshPhysicalMaterial color="#E8E2D4" transparent opacity={0.2} metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  );
}

function OtherModel() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <dodecahedronGeometry args={[0.5]} />
        <primitive object={chromeEmber} />
      </mesh>
      <mesh position={[0, 0.3, 0]} scale={0.85}>
        <dodecahedronGeometry args={[0.5]} />
        <primitive object={matteIvory} />
      </mesh>
      <mesh position={[0, 0.3, 0]} scale={0.3}>
        <icosahedronGeometry args={[0.5]} />
        <primitive object={chromeGold} />
      </mesh>
      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.7, 0.015, 8, 24]} />
        <primitive object={chromeGold} />
      </mesh>
    </group>
  );
}

function getModel(type: string) {
  switch (type) {
    case "bikes": return <MotorcycleModel />;
    case "cars": return <CarModel />;
    case "scooters": return <ScooterModel />;
    case "camping": return <TentModel />;
    case "cameras": return <CameraModel />;
    case "ebikes": return <BicycleModel />;
    case "events": return <EventsModel />;
    default: return <OtherModel />;
  }
}

/* ─── Auto-rotate + mouse tilt controller ─── */

function ModelController({ modelType, reducedMotion }: { modelType: string; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.y = 0.3;
      return;
    }
    group.current.rotation.y = state.clock.elapsedTime * 0.4;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      (pointer.y * 0.1),
      0.03,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      -(pointer.x * 0.08),
      0.03,
    );
  });

  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.3} enabled={!reducedMotion}>
      <group ref={group}>
        {getModel(modelType)}
      </group>
    </Float>
  );
}

/* ─── Scene (no Canvas — that's parent's job) ─── */

export function ThreeSceneInner({ modelType, reducedMotion = false }: { modelType: string; reducedMotion?: boolean }) {
  return (
    <>
      <StudioLights />
      <ModelController modelType={modelType} reducedMotion={reducedMotion} />
      <DriftParticles count={60} />
      <GroundShadow />
    </>
  );
}

/* ─── Full Canvas wrapper (exported — import this with dynamic ssr:false) ─── */

export default function ThreeScene({
  modelType,
  reducedMotion,
}: {
  modelType: string;
  reducedMotion?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.5], fov: 35, near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
      linear
    >
      <ThreeSceneInner modelType={modelType} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
