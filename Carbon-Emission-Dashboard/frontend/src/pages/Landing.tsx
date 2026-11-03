import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Float, Html, PerformanceMonitor, Preload, Stars, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import {
  Activity,
  ArrowRight,
  BarChart3,
  CloudSun,
  Gauge,
  Globe2,
  Leaf,
  LocateFixed,
  RadioTower,
  Recycle,
  Satellite,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  TrendingDown,
  Waves,
  Wind,
  Zap,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const EARTH_TEXTURES = {
  day: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  night: 'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
  normal: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  roughness: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
}

const metrics = [
  { label: 'AQI', value: '42', detail: 'Good air window', icon: Wind, accent: '#6ee7b7' },
  { label: 'Weather', value: 'Clear', detail: 'Solar gain rising', icon: CloudSun, accent: '#93c5fd' },
  { label: 'Temperature', value: '24 degC', detail: 'Urban delta -1.8', icon: ThermometerSun, accent: '#fbbf24' },
  { label: 'CO2 Today', value: '419 ppm', detail: 'Down 0.6% weekly', icon: Activity, accent: '#f472b6' },
  { label: 'Sustainability Score', value: '86', detail: 'On track', icon: ShieldCheck, accent: '#22d3ee' },
]

const cities = [
  { name: 'New York', lat: 40.7128, lon: -74.006, aqi: 46, weather: 'Mist', temp: '21 degC' },
  { name: 'London', lat: 51.5072, lon: -0.1276, aqi: 38, weather: 'Clouds', temp: '18 degC' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, aqi: 61, weather: 'Clear', temp: '29 degC' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, aqi: 54, weather: 'Humid', temp: '30 degC' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, aqi: 32, weather: 'Breeze', temp: '17 degC' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, aqi: 73, weather: 'Haze', temp: '34 degC' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, aqi: 58, weather: 'Rain edge', temp: '23 degC' },
]

const features = [
  { title: 'Planetary AQI Mesh', copy: 'Air-quality signals, weather context, and exposure risk grouped by region.', icon: RadioTower },
  { title: 'Carbon Ledger', copy: 'Daily activity streams become auditable CO2e forecasts and reduction paths.', icon: BarChart3 },
  { title: 'Climate Operations', copy: 'Track cities, assets, and teams from one calm operational cockpit.', icon: Satellite },
  { title: 'Action Scoring', copy: 'Sustainability scores reward measurable changes instead of vague pledges.', icon: Leaf },
]

const sdgs = [
  { number: '07', title: 'Clean Energy', accent: '#fbbf24' },
  { number: '11', title: 'Sustainable Cities', accent: '#60a5fa' },
  { number: '12', title: 'Responsible Consumption', accent: '#fb7185' },
  { number: '13', title: 'Climate Action', accent: '#34d399' },
]

const timeline = [
  'Collect real activity and environment data',
  'Normalize emissions with trusted factors',
  'Model regional risk and savings potential',
  'Trigger reduction plans and share reports',
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
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 26
      data[i * 3 + 1] = (Math.random() - 0.5) * 14
      data[i * 3 + 2] = -Math.random() * 16 - 2
    }
    return data
  }, [count])

  const ref = useRef<THREE.Points>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.012
    ref.current.rotation.x += delta * 0.004
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#b7f7ff" transparent opacity={0.38} depthWrite={false} />
    </points>
  )
}

function Atmosphere({ hovered }: { hovered: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color('#4bb8ff') },
      pulseColor: { value: new THREE.Color('#2dff9a') },
      hoverMix: { value: 0 },
    }),
    [],
  )

  useFrame((_, delta) => {
    if (!materialRef.current) return
    const target = hovered ? 1 : 0
    materialRef.current.uniforms.hoverMix.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.hoverMix.value,
      target,
      3.6,
      delta,
    )
  })

  return (
    <mesh scale={1.08}>
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
            float rim = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 color = mix(glowColor, pulseColor, hoverMix);
            gl_FragColor = vec4(color, rim * (0.62 + hoverMix * 0.85));
          }
        `}
      />
    </mesh>
  )
}

function NightLights({ nightMap, sunRef }: { nightMap: THREE.Texture; sunRef: React.RefObject<THREE.DirectionalLight | null> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      nightMap: { value: nightMap },
      sunDirection: { value: new THREE.Vector3(1, 0.2, 0.4).normalize() },
    }),
    [nightMap],
  )

  useFrame(() => {
    if (!materialRef.current || !sunRef.current) return
    materialRef.current.uniforms.sunDirection.value.copy(sunRef.current.position).normalize()
  })

  return (
    <mesh scale={1.003}>
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
            gl_FragColor = vec4(lights * vec3(1.15, 0.92, 0.58), night * 0.92);
          }
        `}
      />
    </mesh>
  )
}

function CityMarker({ city }: { city: typeof cities[number] }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<THREE.Mesh>(null)
  const position = useMemo(() => latLonToVector3(city.lat, city.lon, 1.045), [city.lat, city.lon])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 3.8 + city.lat) * 0.24
    ref.current.scale.setScalar(pulse)
  })

  return (
    <group position={position} lookAt={[0, 0, 0]}>
      <mesh
        ref={ref}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.014, 16, 16]} />
        <meshBasicMaterial color="#6dffb4" toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.022, 0.032, 32]} />
        <meshBasicMaterial color="#33ffaa" transparent opacity={0.55} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {hovered && (
        <Html distanceFactor={7} center className="city-tooltip">
          <strong>{city.name}</strong>
          <span>AQI {city.aqi}</span>
          <span>{city.weather} / {city.temp}</span>
        </Html>
      )}
    </group>
  )
}

function EarthModel({
  hovered,
  setHovered,
  sunRef,
  onEarthClick,
}: {
  hovered: boolean
  setHovered: (hovered: boolean) => void
  sunRef: React.RefObject<THREE.DirectionalLight | null>
  onEarthClick: () => void
}) {
  const earthGroup = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const textures = useTexture(EARTH_TEXTURES) as Record<keyof typeof EARTH_TEXTURES, THREE.Texture>

  useEffect(() => {
    textures.day.colorSpace = THREE.SRGBColorSpace
    textures.night.colorSpace = THREE.SRGBColorSpace
    textures.clouds.colorSpace = THREE.SRGBColorSpace
    Object.values(textures).forEach((texture) => {
      texture.anisotropy = 8
    })
  }, [textures])

  useFrame((_, delta) => {
    if (earthGroup.current) earthGroup.current.rotation.y += delta * 0.072
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.105
  })

  return (
    <group ref={earthGroup} rotation={[0.05, -0.55, -0.18]}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={(event) => {
          event.stopPropagation()
          onEarthClick()
        }}
      >
        <sphereGeometry args={[1, 160, 160]} />
        <meshStandardMaterial
          map={textures.day}
          normalMap={textures.normal}
          normalScale={new THREE.Vector2(0.62, 0.62)}
          roughnessMap={textures.roughness}
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>
      <NightLights nightMap={textures.night} sunRef={sunRef} />
      <mesh ref={cloudsRef} scale={1.018}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial map={textures.clouds} transparent opacity={0.42} depthWrite={false} roughness={1} />
      </mesh>
      {cities.map((city) => <CityMarker key={city.name} city={city} />)}
      <Atmosphere hovered={hovered} />
      <mesh scale={1.16} visible={hovered}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshBasicMaterial color="#2fff9a" transparent opacity={0.08} wireframe toneMapped={false} />
      </mesh>
    </group>
  )
}

function EarthScene({ scrollProgress, onEarthClick }: { scrollProgress: MotionValue<number>; onEarthClick: () => void }) {
  const rigRef = useRef<THREE.Group>(null)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const [hovered, setHovered] = useState(false)
  const isMobile = useIsMobile()
  const { camera } = useThree()

  useFrame((state, delta) => {
    const progress = scrollProgress.get()
    const targetX = THREE.MathUtils.lerp(0, isMobile ? -0.16 : -1.45, progress)
    const targetY = THREE.MathUtils.lerp(0, -0.22, progress)
    const targetScale = THREE.MathUtils.lerp(isMobile ? 0.82 : 1.08, isMobile ? 0.68 : 0.72, progress)

    if (rigRef.current) {
      rigRef.current.position.x = THREE.MathUtils.damp(rigRef.current.position.x, targetX + state.pointer.x * 0.12, 4, delta)
      rigRef.current.position.y = THREE.MathUtils.damp(rigRef.current.position.y, targetY + state.pointer.y * 0.08, 4, delta)
      rigRef.current.scale.setScalar(THREE.MathUtils.damp(rigRef.current.scale.x, targetScale, 4, delta))
      rigRef.current.rotation.x = THREE.MathUtils.damp(rigRef.current.rotation.x, state.pointer.y * 0.07, 3, delta)
      rigRef.current.rotation.z = THREE.MathUtils.damp(rigRef.current.rotation.z, -state.pointer.x * 0.05, 3, delta)
    }

    if (sunRef.current) {
      const angle = state.clock.elapsedTime * 0.12
      sunRef.current.position.set(Math.cos(angle) * 5.8, 2.4 + Math.sin(angle * 0.5), Math.sin(angle) * 4.8)
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, isMobile ? 4.4 : 3.85, 2, delta)
  })

  return (
    <>
      <color attach="background" args={['#02040d']} />
      <fog attach="fog" args={['#02040d', 6, 15]} />
      <ambientLight intensity={0.06} />
      <directionalLight ref={sunRef} intensity={4.4} color="#fff4df" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-4, 1.5, 3]} intensity={0.4} color="#45caff" />
      <pointLight position={[2.8, -1.6, 2.2]} intensity={0.25} color="#4cff9e" />
      <Stars radius={80} depth={35} count={isMobile ? 1500 : 4200} factor={4} saturation={0} fade speed={0.65} />
      <SpaceDust count={isMobile ? 260 : 760} />
      <group ref={rigRef}>
        <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.16}>
          <EarthModel hovered={hovered} setHovered={setHovered} sunRef={sunRef} onEarthClick={onEarthClick} />
        </Float>
      </group>
      {!isMobile && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={0.95} luminanceThreshold={0.48} luminanceSmoothing={0.34} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.74} />
        </EffectComposer>
      )}
      <AdaptiveDpr pixelated />
      <Preload all />
    </>
  )
}

function EarthLoading() {
  return (
    <Html center className="earth-loading">
      <div />
      <span>Loading planetary telemetry</span>
    </Html>
  )
}

function MetricCard({ metric, index }: { metric: typeof metrics[number]; index: number }) {
  const Icon = metric.icon
  return (
    <motion.div
      className={`earth-metric earth-metric-${index}`}
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.7 + index * 0.08, duration: 0.55 }}
      style={{ '--metric-accent': metric.accent } as React.CSSProperties}
    >
      <Icon size={17} />
      <div>
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
        <small>{metric.detail}</small>
      </div>
    </motion.div>
  )
}

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1800, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(target * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.45 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0])
  const heroTextY = useTransform(scrollYProgress, [0, 0.42], [0, -82])

  const scrollToDashboard = () => {
    document.getElementById('world-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useGSAP(() => {
    gsap.to('.hero-copy', {
      opacity: 0,
      y: -60,
      ease: 'none',
      scrollTrigger: { trigger: '.space-hero', start: 'top top', end: '65% top', scrub: true },
    })

    gsap.fromTo('.feature-card', { autoAlpha: 0, y: 58 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.features-band', start: 'top 72%' },
    })

    gsap.fromTo('.dashboard-preview', { autoAlpha: 0, y: 70, scale: 0.96 }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#world-dashboard', start: 'top 70%' },
    })

    gsap.fromTo('.sdg-card', { autoAlpha: 0, y: 34 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.13,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.sdg-grid', start: 'top 75%' },
    })

    gsap.fromTo('.timeline-step', { autoAlpha: 0, x: -44 }, {
      autoAlpha: 1,
      x: 0,
      duration: 0.62,
      stagger: 0.16,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.climate-timeline', start: 'top 74%' },
    })

    gsap.fromTo('.footer-shell', { autoAlpha: 0, y: 46 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.space-footer', start: 'top 82%' },
    })
  }, { scope: pageRef })

  return (
    <div ref={pageRef} className="space-landing">
      <nav className="space-nav" aria-label="Primary navigation">
        <button className="brand-mark" onClick={() => navigate('/')} aria-label="EcoTrack home">
          <span><Leaf size={18} /></span>
          EcoTrack
        </button>
        <div className="nav-links">
          <a href="#features">Signals</a>
          <a href="#world-dashboard">Dashboard</a>
          <a href="#sdgs">SDGs</a>
          <a href="#timeline">Roadmap</a>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate('/login')} className="ghost-button">Sign In</button>
          <button onClick={() => navigate('/register')} className="primary-button">Start <ArrowRight size={15} /></button>
        </div>
      </nav>

      <section ref={heroRef} className="space-hero">
        <div className="nebula-field" />
        <div className="aurora-ribbon aurora-one" />
        <div className="aurora-ribbon aurora-two" />

        <div className="earth-stage" aria-label="Interactive 3D Earth hero">
          <Canvas
            shadows
            camera={{ position: [0, 0, 3.9], fov: 42, near: 0.1, far: 120 }}
            dpr={[1, 1.8]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <PerformanceMonitor />
            <Suspense fallback={<EarthLoading />}>
              <EarthScene scrollProgress={scrollYProgress} onEarthClick={scrollToDashboard} />
            </Suspense>
          </Canvas>
          <div className="metric-orbit" aria-hidden="true">
            {metrics.map((metric, index) => <MetricCard key={metric.label} metric={metric} index={index} />)}
          </div>
        </div>

        <motion.div className="hero-copy" style={{ opacity: heroTextOpacity, y: heroTextY }}>
          <span className="eyebrow"><Sparkles size={14} /> Planet-scale sustainability intelligence</span>
          <h1>EcoTrack Analytics</h1>
          <p>
            A premium climate command center with a cinematic live Earth, city-level air signals,
            carbon insights, and the operational clarity teams need to act faster.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/register')} className="primary-button large">Launch Dashboard <ArrowRight size={18} /></button>
            <button onClick={scrollToDashboard} className="glass-button large"><LocateFixed size={18} /> Explore Earth</button>
          </div>
          <div className="hero-stats" aria-label="Platform statistics">
            <div><strong>12.8K</strong><span>active users</span></div>
            <div><strong>47</strong><span>countries</span></div>
            <div><strong>2.5M kg</strong><span>CO2 saved</span></div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="features-band section-band">
        <div className="section-heading">
          <span className="eyebrow"><Gauge size={14} /> Real-time planet signals</span>
          <h2>Climate data that feels alive.</h2>
          <p>Built for scanning, comparison, and repeated action across personal, city, and operations workflows.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.article key={feature.title} className="feature-card" whileHover={{ y: -8 }}>
                <Icon size={22} />
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section id="world-dashboard" className="dashboard-band section-band">
        <div className="section-heading align-left">
          <span className="eyebrow"><Globe2 size={14} /> World Sustainability Dashboard</span>
          <h2>The Earth becomes the interface.</h2>
          <p>City markers, carbon baselines, weather context, and sustainability scores converge into one spatial view.</p>
        </div>
        <div className="dashboard-preview">
          <div className="dashboard-topbar">
            <span />
            <span />
            <span />
            <strong>ecotrack.app/world</strong>
          </div>
          <div className="dashboard-grid">
            <div className="map-panel">
              {cities.map((city, index) => (
                <div key={city.name} className={`map-city map-city-${index}`}>
                  <span />
                  <strong>{city.name}</strong>
                  <small>AQI {city.aqi}</small>
                </div>
              ))}
            </div>
            <div className="ops-panel">
              <div className="panel-header"><BarChart3 size={18} /> Live Impact</div>
              <div className="stat-row"><span>Carbon avoided</span><strong><CountUp target={2500000} suffix=" kg" /></strong></div>
              <div className="stat-row"><span>Clean trips logged</span><strong><CountUp target={84210} /></strong></div>
              <div className="stat-row"><span>Forecast accuracy</span><strong><CountUp target={94} suffix="%" /></strong></div>
              <div className="score-ring"><span>86</span><small>Sustainability score</small></div>
            </div>
          </div>
        </div>
      </section>

      <section id="sdgs" className="section-band compact">
        <div className="section-heading">
          <span className="eyebrow"><Recycle size={14} /> Global alignment</span>
          <h2>Designed around measurable SDG outcomes.</h2>
        </div>
        <div className="sdg-grid">
          {sdgs.map((sdg) => (
            <article key={sdg.number} className="sdg-card" style={{ '--sdg-accent': sdg.accent } as React.CSSProperties}>
              <span>{sdg.number}</span>
              <strong>{sdg.title}</strong>
            </article>
          ))}
        </div>
      </section>

      <section id="timeline" className="climate-timeline section-band">
        <div className="section-heading align-left">
          <span className="eyebrow"><TrendingDown size={14} /> Reduction roadmap</span>
          <h2>From signal to action in four steps.</h2>
        </div>
        <div className="timeline-list">
          {timeline.map((step, index) => (
            <div key={step} className="timeline-step">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band section-band compact">
        <Reveal>
          <div className="cta-content">
            <span className="eyebrow"><Zap size={14} /> Built for modern ClimateTech</span>
            <h2>Turn environmental data into a daily operating rhythm.</h2>
            <button onClick={() => navigate('/register')} className="primary-button large">Get Started <ArrowRight size={18} /></button>
          </div>
        </Reveal>
      </section>

      <footer className="space-footer">
        <div className="liquid-wave" />
        <div className="footer-shell">
          <div>
            <button className="brand-mark" onClick={() => navigate('/')} aria-label="EcoTrack home">
              <span><Leaf size={18} /></span>
              EcoTrack
            </button>
            <p>Premium sustainability analytics for people, cities, and teams reducing carbon with evidence.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Signals</a>
            <a href="#world-dashboard">Dashboard</a>
            <a href="#sdgs">SDGs</a>
            <a href="/dashboard">App</a>
          </div>
          <div className="footer-note"><Waves size={16} /> Data-ready, API-friendly, climate-first.</div>
        </div>
      </footer>
    </div>
  )
}

