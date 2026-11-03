import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Html, Preload, Stars, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { CloudSun, Gauge, Leaf, ThermometerSun, Wind } from 'lucide-react'
import { GlassMetricCard } from '@/components/ui/glass'
import { cn } from '@/lib/utils'

export type EarthMode = 'landing' | 'auth' | 'dashboard' | 'analytics' | 'world'

const TEXTURES = {
  day: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  night: 'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
  normal: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  specular: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
}

const WORLD_MARKERS = [
  { name: 'India', lat: 20.5937, lon: 78.9629, metric: 'AQI 142' },
  { name: 'United States', lat: 37.0902, lon: -95.7129, metric: '14.7t CO2/cap' },
  { name: 'Germany', lat: 51.1657, lon: 10.4515, metric: '52% renewable' },
  { name: 'China', lat: 35.8617, lon: 104.1954, metric: 'AQI 110' },
  { name: 'Brazil', lat: -14.235, lon: -51.9253, metric: '84% renewable' },
  { name: 'Australia', lat: -25.2744, lon: 133.7751, metric: '+1.6 degC' },
  { name: 'Japan', lat: 36.2048, lon: 138.2529, metric: 'AQI 38' },
  { name: 'United Kingdom', lat: 55.3781, lon: -3.436, metric: 'AQI 29' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return isMobile
}

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function SpaceDust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 26
      data[i * 3 + 1] = (Math.random() - 0.5) * 16
      data[i * 3 + 2] = -Math.random() * 15 - 1
    }
    return data
  }, [count])

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.01
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#c7fbff" transparent opacity={0.38} depthWrite={false} />
    </points>
  )
}

function Atmosphere({ active }: { active: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    glowColor: { value: new THREE.Color('#55c7ff') },
    pulseColor: { value: new THREE.Color('#28ff9b') },
    hoverMix: { value: active ? 0.4 : 0 },
  }), [active])

  useFrame((_, delta) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.hoverMix.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.hoverMix.value,
      active ? 1 : 0.22,
      2.8,
      delta,
    )
  })

  return (
    <mesh scale={1.09}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          uniform vec3 glowColor;
          uniform vec3 pulseColor;
          uniform float hoverMix;
          void main() {
            float rim = pow(0.64 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 color = mix(glowColor, pulseColor, hoverMix);
            gl_FragColor = vec4(color, rim * (0.65 + hoverMix * 0.75));
          }
        `}
      />
    </mesh>
  )
}

function NightLights({ map, sunRef }: { map: THREE.Texture; sunRef: React.RefObject<THREE.DirectionalLight | null> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    nightMap: { value: map },
    sunDirection: { value: new THREE.Vector3(1, 0.25, 0.45).normalize() },
  }), [map])

  useFrame(() => {
    if (!materialRef.current || !sunRef.current) return
    materialRef.current.uniforms.sunDirection.value.copy(sunRef.current.position).normalize()
  })

  return (
    <mesh scale={1.004}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          uniform sampler2D nightMap;
          uniform vec3 sunDirection;
          void main() {
            float night = smoothstep(0.0, 0.55, -dot(normalize(vNormal), normalize(sunDirection)));
            vec3 lights = texture2D(nightMap, vUv).rgb;
            gl_FragColor = vec4(lights * vec3(1.16, 0.95, 0.64), night * 0.9);
          }
        `}
      />
    </mesh>
  )
}

function Marker({ marker }: { marker: typeof WORLD_MARKERS[number] }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<THREE.Mesh>(null)
  const position = useMemo(() => latLonToVector3(marker.lat, marker.lon, 1.045), [marker.lat, marker.lon])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3.4 + marker.lat) * 0.22)
  })

  return (
    <group position={position} lookAt={[0, 0, 0]}>
      <mesh
        ref={ref}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[0.016, 18, 18]} />
        <meshBasicMaterial color="#62ffb2" toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.026, 0.038, 32]} />
        <meshBasicMaterial color="#30f6ad" transparent opacity={0.58} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {hovered && (
        <Html distanceFactor={7} center className="global-earth-tooltip">
          <strong>{marker.name}</strong>
          <span>{marker.metric}</span>
        </Html>
      )}
    </group>
  )
}

function EarthMesh({ mode, sunRef }: { mode: EarthMode; sunRef: React.RefObject<THREE.DirectionalLight | null> }) {
  const groupRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const textures = useTexture(TEXTURES) as Record<keyof typeof TEXTURES, THREE.Texture>

  useEffect(() => {
    textures.day.colorSpace = THREE.SRGBColorSpace
    textures.night.colorSpace = THREE.SRGBColorSpace
    textures.clouds.colorSpace = THREE.SRGBColorSpace
    Object.values(textures).forEach((texture) => { texture.anisotropy = 8 })
  }, [textures])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * (mode === 'world' ? 0.045 : 0.065)
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.105
  })

  return (
    <group ref={groupRef} rotation={[0.04, -0.45, -0.2]}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[1, 144, 144]} />
        <meshStandardMaterial
          map={textures.day}
          normalMap={textures.normal}
          normalScale={new THREE.Vector2(0.55, 0.55)}
          roughnessMap={textures.specular}
          roughness={0.86}
          metalness={0.02}
        />
      </mesh>
      <NightLights map={textures.night} sunRef={sunRef} />
      <mesh ref={cloudsRef} scale={1.018}>
        <sphereGeometry args={[1, 112, 112]} />
        <meshStandardMaterial map={textures.clouds} transparent opacity={0.42} depthWrite={false} roughness={1} />
      </mesh>
      {(mode === 'world' || mode === 'dashboard' || mode === 'analytics') && WORLD_MARKERS.map((marker) => <Marker key={marker.name} marker={marker} />)}
      <Atmosphere active={hovered || mode === 'auth'} />
    </group>
  )
}

function Scene({ mode }: { mode: EarthMode }) {
  const rigRef = useRef<THREE.Group>(null)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const isMobile = useIsMobile()
  const { camera } = useThree()

  useFrame((state, delta) => {
    const config = mode === 'auth'
      ? { x: 0.0, y: 0, scale: isMobile ? 1.25 : 1.6, z: isMobile ? 4.5 : 3.4 }
      : mode === 'dashboard'
      ? { x: isMobile ? 0.65 : 1.45, y: isMobile ? 0.72 : 0.88, scale: isMobile ? 0.38 : 0.5, z: 4.2 }
      : mode === 'analytics'
      ? { x: isMobile ? 0.6 : 1.35, y: 0.92, scale: isMobile ? 0.34 : 0.44, z: 4.3 }
      : mode === 'world'
      ? { x: 0, y: 0.03, scale: isMobile ? 0.86 : 1.12, z: isMobile ? 4.25 : 3.75 }
      : { x: 0.65, y: 0, scale: isMobile ? 0.85 : 1.05, z: 3.85 }

    if (rigRef.current) {
      rigRef.current.position.x = THREE.MathUtils.damp(rigRef.current.position.x, config.x + state.pointer.x * 0.11, 4, delta)
      rigRef.current.position.y = THREE.MathUtils.damp(rigRef.current.position.y, config.y + state.pointer.y * 0.08, 4, delta)
      rigRef.current.scale.setScalar(THREE.MathUtils.damp(rigRef.current.scale.x, config.scale, 4, delta))
      rigRef.current.rotation.x = THREE.MathUtils.damp(rigRef.current.rotation.x, state.pointer.y * 0.06, 3, delta)
      rigRef.current.rotation.z = THREE.MathUtils.damp(rigRef.current.rotation.z, -state.pointer.x * 0.045, 3, delta)
    }

    if (sunRef.current) {
      const angle = state.clock.elapsedTime * 0.12
      sunRef.current.position.set(Math.cos(angle) * 5.8, 2.2 + Math.sin(angle * 0.5), Math.sin(angle) * 4.8)
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, config.z, 2.2, delta)
  })

  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 6, 15]} />
      <ambientLight intensity={0.075} />
      <directionalLight ref={sunRef} intensity={4.3} color="#fff7df" castShadow shadow-mapSize-width={1536} shadow-mapSize-height={1536} />
      <pointLight position={[-4, 1.4, 3]} intensity={0.34} color="#06b6d4" />
      <pointLight position={[3.2, -1.6, 2.2]} intensity={0.28} color="#10b981" />
      <Stars radius={72} depth={34} count={isMobile ? 1200 : 3600} factor={4} saturation={0} fade speed={0.55} />
      <SpaceDust count={isMobile ? 200 : 680} />
      <group ref={rigRef}>
        <EarthMesh mode={mode} sunRef={sunRef} />
      </group>
      {!isMobile && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={0.78} luminanceThreshold={0.48} luminanceSmoothing={0.34} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.72} />
        </EffectComposer>
      )}
      <AdaptiveDpr pixelated />
      <Preload all />
    </>
  )
}

function Loader() {
  return (
    <Html center className="global-earth-loader">
      <span />
      <strong>Loading Earth intelligence</strong>
    </Html>
  )
}

export function GlobalEarthBackground({ mode = 'dashboard', className, showWidgets = false }: { mode?: EarthMode; className?: string; showWidgets?: boolean }) {
  return (
    <div className={cn('global-earth-background', `global-earth-${mode}`, className)} aria-hidden={mode !== 'world'}>
      <div className="global-earth-aurora" />
      <Canvas
        shadows
        camera={{ position: [0, 0, 4], fov: mode === 'auth' ? 38 : 42, near: 0.1, far: 120 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={<Loader />}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
      {showWidgets && (
        <div className="global-earth-widgets">
          <GlassMetricCard icon={<CloudSun size={16} />} label="Weather" value="24 degC" detail="Solar gain rising" accent="#06B6D4" />
          <GlassMetricCard icon={<Wind size={16} />} label="AQI" value="42" detail="Good air window" accent="#10B981" />
          <GlassMetricCard icon={<Gauge size={16} />} label="CO2 Today" value="419 ppm" detail="-0.6% weekly" accent="#FBBF24" />
          <GlassMetricCard icon={<Leaf size={16} />} label="Score" value="86" detail="On track" accent="#22C55E" />
          <GlassMetricCard icon={<ThermometerSun size={16} />} label="Temp" value="+1.2 degC" detail="Urban delta" accent="#F472B6" />
        </div>
      )}
    </div>
  )
}

export default GlobalEarthBackground
