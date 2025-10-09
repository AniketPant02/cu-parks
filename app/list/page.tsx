import fs from 'fs/promises'
import path from 'path'
import { ParksMap, type MapPoint } from './Map'

export const metadata = {
    title: 'List',
    description: 'A list of parks in Urbana-Champaign.',
}

export const revalidate = 0

type Row = {
    Rank: string
    Park: string
    'Approx. size (acres)': string
    District: string
    'Visited (+ date)': string
    lat: string
    lon: string
}

type DecoratedRow = Row & {
    visited: boolean
    visitedRaw: string
}

function splitCSVLine(line: string): string[] {
    const cols: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i += 1
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            cols.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }

    cols.push(current.trim())
    return cols
}

function parseCSV(text: string): Row[] {
    const rawLines = text.trim().replace(/\r\n?/g, '\n').split('\n')
    const lines = rawLines.filter((line) => line.trim().length > 0)
    if (!lines.length) return []

    const headers = splitCSVLine(lines[0])
    const rows: Row[] = []

    for (let i = 1; i < lines.length; i++) {
        const cols = splitCSVLine(lines[i])
        if (!cols.length) continue
        if (cols.length < headers.length) continue

        const obj: Record<string, string> = {}
        headers.forEach((h, j) => {
            const rawValue = cols[j] ?? ''
            const trimmed = rawValue.trim()
            const hasWrappedQuotes = trimmed.startsWith('"') && trimmed.endsWith('"')
            const cleaned = hasWrappedQuotes
                ? trimmed.slice(1, -1).replace(/""/g, '"')
                : trimmed

            obj[h] = cleaned
        })
        rows.push(obj as Row)
    }

    return rows
}

async function readList(): Promise<Row[]> {
    const filePath = path.join(process.cwd(), 'app', 'list', 'geocoded_list.txt')
    const buf = await fs.readFile(filePath, 'utf8')
    return parseCSV(buf)
}

function isVisited(value: string): boolean {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return false
    if (normalized.includes('never again')) return true
    if (/^y\b/.test(normalized)) return true
    if (normalized.startsWith('visited')) return true
    if (normalized.includes('✅')) return true
    return false
}

function formatVisitedLabel(raw: string, visited: boolean): string {
    const trimmed = raw.trim()
    if (!trimmed) return visited ? 'Visited' : 'Not visited yet'
    if (/^y\b/i.test(trimmed)) {
        const rest = trimmed.replace(/^y\s*/i, '').trim()
        return rest ? `Visited ${rest}` : 'Visited'
    }
    if (/^n\b/i.test(trimmed)) return 'Not visited yet'
    return trimmed
}

function VisitedBadge({ raw, visited }: { raw: string; visited: boolean }) {
    const normalized = raw.trim().toLowerCase()
    if (!normalized) {
        return (
            <span className="inline-flex items-center rounded-full border border-emerald-200/40 bg-emerald-50/40 px-2 py-0.5 text-xs text-emerald-700/70">
                —
            </span>
        )
    }
    if (normalized.includes('never again')) {
        return (
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                🔥 never again
            </span>
        )
    }
    if (visited) {
        return (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                ✅ {formatVisitedLabel(raw, true)}
            </span>
        )
    }
    if (normalized.startsWith('n')) {
        return (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50/80 px-2 py-0.5 text-xs font-medium text-amber-700">
                ⏳ Not visited yet
            </span>
        )
    }
    return (
        <span className="inline-flex items-center rounded-full border border-emerald-200/40 bg-emerald-50/40 px-2 py-0.5 text-xs text-emerald-700/70">
            {raw}
        </span>
    )
}

export default async function ListPage() {
    const data = await readList()
    const rows: DecoratedRow[] = data.map((row) => {
        const visitedRaw = (row['Visited (+ date)'] || '').trim()
        return {
            ...row,
            visitedRaw,
            visited: isVisited(visitedRaw),
        }
    })
    const mapPoints = rows.reduce<MapPoint[]>((acc, row) => {
        const lat = Number.parseFloat(row.lat)
        const lon = Number.parseFloat(row.lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            const subtitleParts: string[] = []
            if (row.District) subtitleParts.push(row.District)
            if (row['Approx. size (acres)']) {
                subtitleParts.push(`${row['Approx. size (acres)']} acres`)
            }
            acc.push({
                lat,
                lon,
                name: row.Park || `Rank ${row.Rank || '?'}`,
                subtitle: subtitleParts.length ? subtitleParts.join(' - ') : undefined,
                visited: row.visited,
                visitedLabel: formatVisitedLabel(row.visitedRaw, row.visited),
            })
        }
        return acc
    }, [])

    return (
        <section className="max-w-4xl">
            <h1 className="font-semibold text-2xl mb-8 tracking-tighter">List of parks</h1>

            <div className="overflow-x-auto rounded-2xl border border-emerald-200/60 bg-emerald-50/40 shadow-sm backdrop-blur-sm dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-emerald-200/70 dark:bg-emerald-900/50">
                        <tr className="[&>th]:px-4 [&>th]:py-3 text-left text-sm font-semibold text-amber-800 dark:text-amber-200">
                            <th className="w-14">Rank</th>
                            <th>Park</th>
                            <th className="w-44">Approx. size (acres)</th>
                            <th className="w-32">District</th>
                            <th className="w-36">Visited</th>
                        </tr>
                    </thead>

                    <tbody className="text-sm text-emerald-950/90 dark:text-emerald-50">
                        {rows.map((row, i) => (
                            <tr
                                key={`${row.Rank}-${row.Park}-${i}`}
                                className="odd:bg-white/60 even:bg-emerald-50/60 hover:bg-emerald-100/60 transition-colors dark:odd:bg-emerald-950/30 dark:even:bg-emerald-900/30 dark:hover:bg-emerald-800/40"
                            >
                                <td className="px-4 py-2 tabular-nums text-emerald-900/80 dark:text-emerald-100">
                                    {row.Rank || '—'}
                                </td>
                                <td className="px-4 py-2 font-medium">{row.Park || '—'}</td>
                                <td className="px-4 py-2 tabular-nums">
                                    {row['Approx. size (acres)'] || '—'}
                                </td>
                                <td className="px-4 py-2">{row.District || '—'}</td>
                                <td className="px-4 py-2">
                                    <VisitedBadge raw={row.visitedRaw} visited={row.visited} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-3 text-xs text-amber-700">
                List of selected parks from CU. Some additional parks may be added, like Mahomet.
            </p>

            {mapPoints.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold">
                        Map of parks
                    </h2>
                    <div className="mt-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/10">
                        <ParksMap points={mapPoints} />
                        <p className="mt-2 text-xs text-amber-700">
                            Pan and zoom to explore each park. Click a marker to see basic details.
                        </p>
                    </div>
                </div>
            )}
        </section>
    )
}
