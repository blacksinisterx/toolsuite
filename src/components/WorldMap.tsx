import { useMemo } from 'react'
import { CONTINENTS, project, subsolarLongitude } from '../lib/worldMap'

const W = 360
const H = 180

interface Pin {
  timeZone: string
  lat: number
  lon: number
  label: string
  time: string
  isSource?: boolean
}

export function WorldMap({ pins, now }: { pins: Pin[]; now: Date }) {
  const nightCenterLon = useMemo(() => {
    const antiSolar = subsolarLongitude(now) + 180
    return ((antiSolar + 180) % 360) - 180 // normalize to -180..180
  }, [now])

  const nightBands = useMemo(() => {
    const bands: { x: number; opacity: number }[] = []
    const bandCount = 36
    const degPerBand = 360 / bandCount
    const pxPerBand = W / bandCount
    for (let i = 0; i < bandCount; i++) {
      const lon = i * degPerBand - 180 + degPerBand / 2
      let diff = Math.abs(lon - nightCenterLon)
      if (diff > 180) diff = 360 - diff
      // cosine falloff -- full darkness at the anti-solar point, clear by ~90 deg away
      const opacity = diff < 90 ? 0.38 * Math.cos((diff / 90) * (Math.PI / 2)) : 0
      bands.push({ x: i * pxPerBand, opacity: Math.max(0, opacity) })
    }
    return bands
  }, [nightCenterLon])

  const source = pins.find((p) => p.isSource)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-sunken">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="World map showing local times">
        <rect x={0} y={0} width={W} height={H} fill="var(--bg-sunken)" />

        {CONTINENTS.map((poly, i) => (
          <polygon
            key={i}
            points={poly.map(([lat, lon]) => project(lat, lon, W, H).join(',')).join(' ')}
            fill="var(--border-strong)"
            opacity={0.55}
          />
        ))}

        {/* day/night shading */}
        {nightBands.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={W / 36 + 0.5} height={H} fill="#000000" opacity={b.opacity} />
        ))}

        {/* lines from source to each target */}
        {source && pins.filter((p) => !p.isSource).map((p) => {
          const [x1, y1] = project(source.lat, source.lon, W, H)
          const [x2, y2] = project(p.lat, p.lon, W, H)
          return <line key={p.timeZone} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth={0.4} strokeDasharray="1.5,1.5" opacity={0.5} />
        })}

        {pins.map((p) => {
          const [x, y] = project(p.lat, p.lon, W, H)
          const color = p.isSource ? 'var(--accent)' : 'var(--accent2)'
          return (
            <g key={p.timeZone}>
              <circle cx={x} cy={y} r={p.isSource ? 2.6 : 2} fill={color} stroke="white" strokeWidth={0.5} />
              <text x={x + 3.5} y={y - 2} fontSize={5.5} fill="white" stroke="black" strokeWidth={1.8} paintOrder="stroke" fontWeight={600}>
                {p.label.split(' (')[0]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
