import fs from 'fs/promises'
import path from 'path'

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
}

function parseTSV(text: string): Row[] {
    const lines = text.trim().replace(/\r\n?/g, '\n').split('\n')
    if (!lines.length) return []
    const split = (l: string) => l.split(/\t+/)
    const headers = split(lines[0])
    const rows: Row[] = []
    for (let i = 1; i < lines.length; i++) {
        const cols = split(lines[i])
        const obj: Record<string, string> = {}
        headers.forEach((h, j) => (obj[h] = (cols[j] ?? '').trim()))
        rows.push(obj as Row)
    }
    return rows
}

async function readList(): Promise<Row[]> {
    const filePath = path.join(process.cwd(), 'app', 'list', 'list.txt')
    const buf = await fs.readFile(filePath, 'utf8')
    return parseTSV(buf)
}

function VisitedBadge({ value }: { value: string }) {
    const v = (value || '').toLowerCase()
    if (!v) {
        return (
            <span className="inline-flex items-center rounded-full border border-emerald-200/40 bg-emerald-50/40 px-2 py-0.5 text-xs text-emerald-700/70">
                —
            </span>
        )
    }
    if (v.includes('never again')) {
        return (
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                🔥 never again
            </span>
        )
    }
    if (v.startsWith('y')) {
        return (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                ✅ {value.replace(/^y\s*/i, 'Visited ')}
            </span>
        )
    }
    return (
        <span className="inline-flex items-center rounded-full border border-emerald-200/40 bg-emerald-50/40 px-2 py-0.5 text-xs text-emerald-700/70">
            {value}
        </span>
    )
}

export default async function ListPage() {
    const data = await readList()

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
                        </tr>
                    </thead>

                    <tbody className="text-sm text-emerald-950/90 dark:text-emerald-50">
                        {data.map((row, i) => (
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-3 text-xs text-amber-700">
                List of selected parks from CU. Some additional parks may be added, like Mahomet.
            </p>
        </section>
    )
}