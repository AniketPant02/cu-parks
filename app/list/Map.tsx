'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export type MapPoint = { lat: number; lon: number; name: string; subtitle?: string }

const escapeHTML = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function ParksMap({ points }: { points: MapPoint[] }) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const userMarkerRef = useRef<maplibregl.Marker | null>(null)
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [locating, setLocating] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    useEffect(() => {
        if ((maplibregl as any).config?.WORKER_URL && maplibregl.config.WORKER_URL.trim().length === 0) {
            const workerUrl = new URL('maplibre-gl/dist/maplibre-gl-csp-worker.js', import.meta.url)
            maplibregl.config.WORKER_URL = workerUrl.toString()
        }
        if (!containerRef.current) return

        const style: StyleSpecification = {
            version: 8,
            sources: {
                osm: {
                    type: 'raster',
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors',
                },
            },
            layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        }

        const map = new maplibregl.Map({
            container: containerRef.current,
            style,
            center: points.length ? [points[0].lon, points[0].lat] : [-88.227, 40.110],
            zoom: points.length ? 12 : 11,
        })

        mapRef.current = map

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

        // Add markers
        const bounds = new maplibregl.LngLatBounds()
        points.forEach((p) => {
            if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) return

            const el = document.createElement('div')
            el.className = 'cu-marker'
            el.innerHTML = `
              <svg width="34" height="46" viewBox="0 0 34 46" aria-hidden="true">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#064e3b" flood-opacity=".25"/>
                  </filter>
                </defs>
                <path filter="url(#shadow)"
                  d="M17 44c6-9 15-16 15-26C32 8.82 25.18 2 17 2S2 8.82 2 18c0 10 9 17 15 26Z"
                  fill="#047857" stroke="#065f46" stroke-width="1.25"/>
                <circle cx="17" cy="18" r="6.5" fill="#ffffff"/>
              </svg>`
            const popupHTML = `
              <div class="cu-popup">
                <div class="cu-popup-title">${escapeHTML(p.name)}</div>
                ${p.subtitle ? `<div class="cu-popup-sub">${escapeHTML(p.subtitle)}</div>` : ''}
              </div>
            `
            new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat([p.lon, p.lat])
                .setPopup(new maplibregl.Popup({ offset: 10 }).setHTML(popupHTML))
                .addTo(map)

            bounds.extend([p.lon, p.lat])
        })

        if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 44, maxZoom: 14, linear: true })
        const onResize = () => map.resize()
        window.addEventListener('resize', onResize)

        map.on('error', (e) => console.warn('Map error:', (e as any)?.error ?? e))

        return () => {
            window.removeEventListener('resize', onResize)
            userMarkerRef.current?.remove()
            userMarkerRef.current = null
            map.remove()
            mapRef.current = null
        }
    }, [points])

    useEffect(() => {
        if (!mapRef.current || !userLocation) return

        if (!userMarkerRef.current) {
            userMarkerRef.current = new maplibregl.Marker({ color: '#2563eb' })
        }

        userMarkerRef.current.setLngLat([userLocation.lon, userLocation.lat]).addTo(mapRef.current)
        mapRef.current.easeTo({
            center: [userLocation.lon, userLocation.lat],
            zoom: Math.max(mapRef.current.getZoom(), 12),
            duration: 800,
        })
    }, [userLocation])

    const handleLocate = () => {
        setLocationError(null)
        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
            setLocationError('Geolocation is not supported in this browser.')
            return
        }

        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocating(false)
                setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude })
            },
            (error) => {
                setLocating(false)
                setLocationError(error.message || 'Unable to determine your location.')
            },
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }

    return (
        <div className="relative h-80 w-full overflow-hidden rounded-2xl ring-1 ring-emerald-200/60 bg-emerald-50">
            <div ref={containerRef} className="h-full w-full" />
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-start gap-2 p-3">
                <button
                    type="button"
                    onClick={handleLocate}
                    disabled={locating}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur disabled:opacity-70"
                >
                    {locating ? 'Locating…' : userLocation ? 'Recenter to me' : 'Show my location'}
                </button>
                {locationError && (
                    <span className="pointer-events-auto max-w-xs rounded-lg bg-white/85 px-2 py-1 text-[11px] text-amber-700 shadow">
                        {locationError}
                    </span>
                )}
            </div>
            <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.10]"
                style={{
                    background:
                        'radial-gradient(60% 60% at 50% 50%, #bbf7d0 0%, rgba(187,247,208,0.6) 50%, transparent 100%), ' +
                        'linear-gradient(0deg, rgba(16,185,129,0.05), rgba(16,185,129,0.05))',
                }}
            />
            <style jsx global>{`
                /* Controls: emerald + rounded */
                .maplibregl-ctrl,
                .maplibregl-ctrl-group {
                    background: rgba(236, 253, 245, 0.92); /* emerald-50 */
                    border: 1px solid rgba(16, 185, 129, 0.35); /* emerald-500/35 */
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(6, 78, 59, 0.08); /* emerald-800/8 */
                    overflow: hidden;
                }
                .maplibregl-ctrl button {
                    color: #065f46; /* emerald-700 */
                }
                .maplibregl-ctrl button:hover {
                    background: rgba(16, 185, 129, 0.12);
                }

                /* Popup: soft green card w/ amber text accent */
                .maplibregl-popup-content {
                    background: #f0fdf4;                /* emerald-50 */
                    border: 1px solid rgba(16,185,129,.25);
                    color: #064e3b;                      /* emerald-800 */
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(6,78,59,.12);
                    padding: 10px 12px;
                }
                .maplibregl-popup-tip {
                    border-top-color: rgba(16,185,129,.25) !important;
                    border-bottom-color: rgba(16,185,129,.25) !important;
                }
                .cu-popup-title {
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .cu-popup-sub {
                    margin-top: 2px;
                    color: #92400e; /* amber-800 */
                    font-size: 0.78rem;
                }

                /* Custom marker base (for hover scale) */
                .cu-marker { transform: translateZ(0); }
                .cu-marker:hover { transform: translateZ(0) scale(1.04); transition: transform .12s ease; }
            `}</style>
        </div>
    )
}
