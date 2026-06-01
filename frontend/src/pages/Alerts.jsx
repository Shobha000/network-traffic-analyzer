import { useState } from "react"

function SeverityBar({ severity }) {
  const color = severity==="high"?"bg-red-500":severity==="medium"?"bg-amber-500":"bg-green-500"
  return <div className={`w-1 self-stretch rounded ${color} flex-shrink-0`}/>
}

function Badge({ type }) {
  const s = {
    high:   "bg-red-900/60 text-red-400",
    medium: "bg-amber-900/60 text-amber-400",
    low:    "bg-green-900/60 text-green-400",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-semibold tracking-wide ${s[type]}`}>
      {type.toUpperCase()}
    </span>
  )
}

function TypeBadge({ reason }) {
  if (reason.includes("High"))
    return <span className="text-xs px-2 py-0.5 rounded bg-red-900/40 text-red-300">HIGH FREQ</span>
  if (reason.includes("Scan"))
 return <span className="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300">PORT SCAN</span>
  return <span className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300">LARGE PKT</span>
}

export default function Alerts({ data }) {
  const [filter, setFilter] = useState("all")
  const filters = ["all","high","medium","low"]
  const filtered = filter==="all"
    ? data.anomalies
    : data.anomalies.filter(a => a.severity===filter)

  const counts = {
    high:   data.anomalies.filter(a => a.severity==="high").length,
    medium: data.anomalies.filter(a => a.severity==="medium").length,
    low:    data.anomalies.filter(a => a.severity==="low").length,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4">
          <p className="text-xs text-red-500 uppercase tracking-widest mb-2">High Traffic</p>
          <p className="text-3xl font-bold font-mono text-red-400">{counts.high}</p>
          <p className="text-xs text-red-900 mt-1">flood / high frequency</p>
        </div>
 <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4">
          <p className="text-xs text-amber-500 uppercase tracking-widest mb-2">Port Scans</p>
          <p className="text-3xl font-bold font-mono text-amber-400">{counts.medium}</p>
          <p className="text-xs text-amber-900 mt-1">unique dst threshold</p>
        </div>
        <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-4">
          <p className="text-xs text-green-500 uppercase tracking-widest mb-2">Large Packets</p>
          <p className="text-3xl font-bold font-mono text-green-400">{counts.low}</p>
          <p className="text-xs text-green-900 mt-1">over 1500 byte MTU</p>
        </div>
      </div>

      <div className="flex gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium
                       border transition-colors capitalize ${
              filter===f
                ? "bg-blue-600 border-blue-500 text-white"
                : "border-gray-700 text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}>
            {f==="all" ? `All (${data.anomalies.length})` :
             `${f.charAt(0).toUpperCase()+f.slice(1)} (${counts[f]||0})`}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Alert log</span>
          <span className="text-xs text-gray-600">{filtered.length} events</span>
        </div>
        {filtered.map(a => (
          <div key={a.id}
               className="flex items-start gap-3 px-5 py-3
                          border-b border-gray-800/50 hover:bg-gray-800/20">
            <SeverityBar severity={a.severity}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge type={a.severity}/>
                <TypeBadge reason={a.reason}/>
                <span className="text-xs font-mono text-gray-300">{a.ip}</span>
                <span className="text-xs text-gray-600">{a.protocol}</span>
                <span className="ml-auto text-xs font-mono text-gray-600">
                  {a.detected_at.slice(11,19)}
                </span>
              </div>
              <p className="text-xs text-gray-600">{a.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
)
}
