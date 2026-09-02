import { useMemo } from 'react'
import { CONTINENTS, GRATICULE_LATS, GRATICULE_LONS, project, subsolarLongitude } from '../lib/worldMap'

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
    const bandCount = 72
    const degPerBand = 360 / bandCount
    const pxPerBand = W / bandCount
    for (let i = 0; i < bandCount; i++) {
      const lon = i * degPerBand - 180 + degPerBand / 2
      let diff = Math.abs(lon - nightCenterLon)
      if (diff > 180) diff = 360 - diff
      // cosine falloff -- full darkness at the anti-solar point, clear by ~90 deg away
      const opacity = diff < 90 ? 0.4 * Math.cos((diff / 90) * (Math.PI / 2)) : 0
      bands.push({ x: i * pxPerBand, opacity: Math.max(0, opacity) })
    }
    return bands
  }, [nightCenterLon])

  const source = pins.find((p) => p.isSource)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-sunken">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="World map showing local times">
        <rect x={0} y={0} width={W} height={H} fill="var(--bg-sunken)" />

        {/* graticule -- the reference lines that read "map," not just "blob" */}
        {GRATICULE_LONS.map((lon) => {
          const [x] = project(0, lon, W, H)
          return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={H} stroke="var(--border)" strokeWidth={0.3} opacity={0.5} />
        })}
        {GRATICULE_LATS.map((lat) => {
          const [, y] = project(lat, 0, W, H)
          return <line key={`lat${lat}`} x1={0} y1={y} x2={W} y2={y} stroke="var(--border)" strokeWidth={0.3} opacity={0.5} />
        })}
        {/* equator, emphasized */}
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="var(--border-strong)" strokeWidth={0.5} opacity={0.6} />

        {CONTINENTS.map((poly, i) => (
          <polygon
            key={i}
            points={poly.map(([lat, lon]) => project(lat, lon, W, H).join(',')).join(' ')}
            fill="var(--text-faint)"
            stroke="var(--border-strong)"
            strokeWidth={0.4}
            opacity={0.6}
          />
        ))}

        {/* day/night shading, above the continents so it reads as global light, not per-shape */}
        {nightBands.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={W / 72 + 0.5} height={H} fill="#000000" opacity={b.opacity} />
        ))}

        {/* lines from source to each target */}
        {source && pins.filter((p) => !p.isSource).map((p) => {
          const [x1, y1] = project(source.lat, source.lon, W, H)
          const [x2, y2] = project(p.lat, p.lon, W, H)
          return <line key={p.timeZone} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth={0.5} strokeDasharray="1.5,1.5" opacity={0.65} />
        })}

        {pins.map((p) => {
          const [x, y] = project(p.lat, p.lon, W, H)
          const color = p.isSource ? 'var(--accent)' : 'var(--accent2)'
          // flip the label to the left near the right edge so it doesn't clip off-canvas
          const flip = x > W - 60
          const labelX = x + (flip ? -3.5 : 3.5)
          return (
            <g key={p.timeZone}>
              <circle cx={x} cy={y} r={p.isSource ? 3 : 2.2} fill={color} stroke="white" strokeWidth={0.6} />
              <text
                x={labelX}
                y={y - 3}
                fontSize={6}
                fill="white"
                stroke="black"
                strokeWidth={0.9}
                strokeLinejoin="round"
                paintOrder="stroke"
                fontWeight={700}
                textAnchor={flip ? 'end' : 'start'}
              >
                {p.label.split(' (')[0]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
