import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Dashboard  from "./pages/Dashboard"
import Analytics  from "./pages/Analytics"
import Alerts     from "./pages/Alerts"
import SystemStatus from "./pages/SystemStatus"

const MOCK_TRAFFIC = Array.from({ length: 30 }, (_, i) => ({
  time:  `14:${String(i * 2).padStart(2, "0")}`,
  count: Math.floor(Math.random() * 80 + 20),
  tcp:   Math.floor(Math.random() * 55 + 10),
  udp:   Math.floor(Math.random() * 20 + 5),
}))

const FALLBACK = {
  stats: {
    total_packets: 52847, total_anomalies: 63, anomaly_types: 3,
    total_mb: 184.2, packets_per_sec: 42, uptime_seconds: 7320,
    sniffer_running: true, last_capture: "2025-05-28 14:32:01"
  },
  protocols: [
    { protocol:"TCP", count:41220 }, { protocol:"UDP", count:7398 },
    { protocol:"ARP", count:2642  }, { protocol:"ICMP", count:1587 }
  ],
  talkers: [
    { ip:"192.168.1.1",    count:18204 }, { ip:"8.8.8.8",        count:9102 },
    { ip:"142.250.77.46",  count:6341  }, { ip:"192.168.1.105",  count:4209 },
    { ip:"1.1.1.1",        count:3876  }, { ip:"172.217.14.78",  count:2901 },
    { ip:"34.107.221.82",  count:1832  }, { ip:"192.168.1.200",  count:984  },
  ],
  anomalies: [
    { id:1, ip:"192.168.1.105", protocol:"TCP",  severity:"high",
      reason:"High frequency: 10+ packets from this source",
      detected_at:"2025-05-28 14:32:01" },
    { id:2, ip:"10.0.0.44",     protocol:"UDP",  severity:"medium",
      reason:"Scan pattern: contacted 5 unique destinations",
      detected_at:"2025-05-28 14:29:47" },
    { id:3, ip:"142.250.77.46", protocol:"TCP",  severity:"low",
      reason:"Large packet: 1842 bytes exceeds MTU threshold",
      detected_at:"2025-05-28 14:27:15" },
    { id:4, ip:"192.168.1.1",   protocol:"ARP",  severity:"high",
      reason:"High frequency: 10+ packets from this source",
      detected_at:"2025-05-28 14:21:03" },
    { id:5, ip:"10.0.0.88",     protocol:"TCP",  severity:"medium",
      reason:"Scan pattern: contacted 5 unique destinations",
      detected_at:"2025-05-28 14:18:44" },
    { id:6, ip:"8.8.8.8",       protocol:"UDP",  severity:"low",
      reason:"Large packet: 1620 bytes exceeds MTU threshold",
      detected_at:"2025-05-28 14:15:30" },
  ],
  traffic:      MOCK_TRAFFIC,
  packet_sizes: [
    { range:"0-64",     count:8420  }, { range:"65-128",  count:12300 },
    { range:"129-256",  count:15840 }, { range:"257-512", count:9200  },
    { range:"513-1024", count:5100  }, { range:"1025+",   count:1987  },
  ],
}

const NAV = [
  { id:"dashboard", label:"Dashboard" },
  { id:"analytics", label:"Analytics" },
  { id:"alerts",    label:"Alerts"    },
  { id:"status",    label:"System"    },
]

export default function App() {
  const [page, setPage]           = useState("dashboard")
  const [data, setData]           = useState(FALLBACK)
  const [lastUpdated, setUpdated] = useState("")
  const [live, setLive]           = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [stats, protocols, talkers, anomalies, traffic, sizes] =
        await Promise.all([
          axios.get("/api/stats"),
          axios.get("/api/protocols"),
          axios.get("/api/talkers"),
          axios.get("/api/anomalies"),
          axios.get("/api/traffic-over-time"),
          axios.get("/api/packet-sizes"),
        ])
      setData({
        stats:        stats.data,
        protocols:    protocols.data,
        talkers:      talkers.data,
        anomalies:    anomalies.data,
        traffic:      traffic.data.length ? traffic.data : MOCK_TRAFFIC,
        packet_sizes: sizes.data.length   ? sizes.data   : FALLBACK.packet_sizes,
      })
      setLive(true)
    } catch {
      setLive(false)
    }
    setUpdated(new Date().toLocaleTimeString())
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 5000)
    return () => clearInterval(id)
  }, [fetchAll])

  const highCount = data.anomalies.filter(a => a.severity === "high").length

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100"
         style={{ fontFamily:"'IBM Plex Mono', monospace" }}>

      {/* sidebar */}
      <aside className="w-48 bg-gray-900 border-r border-gray-800
                        flex flex-col py-5 flex-shrink-0">
        <div className="px-5 pb-5 border-b border-gray-800">
          <p className="text-xs text-blue-400 tracking-widest mb-1">
            NET·ANALYZER
          </p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${live?"bg-green-400":"bg-gray-600"}`} />
            <span className={`text-xs ${live?"text-green-400":"text-gray-500"}`}>
              {live ? "LIVE" : "DEMO"}
            </span>
          </div>
        </div>

        <nav className="flex-1 pt-4">
          {NAV.map(n => (
            <button key={n.id}
              onClick={() => setPage(n.id)}
              className={`w-full text-left px-5 py-2.5 text-sm
   flex items-center justify-between transition-colors
                border-l-2 ${
                  page === n.id
                    ? "bg-gray-800 text-gray-100 border-blue-500"
                    : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800/50"
                }`}>
              {n.label}
              {n.id === "alerts" && highCount > 0 && (
                <span className="text-xs bg-red-500 text-white
                               rounded-full px-1.5 py-0.5 font-bold">
                  {highCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-5 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">Updated</p>
          <p className="text-xs text-gray-500 font-mono">{lastUpdated}</p>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-base font-semibold text-gray-200 tracking-wide">
            {NAV.find(n => n.id === page)?.label}
          </h1>
          <button onClick={fetchAll}
            className="text-xs px-3 py-1.5 border border-gray-700
                       rounded-lg text-gray-400 hover:bg-gray-800
                       hover:text-gray-200 transition-colors">
            ↻ Refresh
          </button>
        </div>

        {page === "dashboard" && <Dashboard data={data} />}
        {page === "analytics"  && <Analytics  data={data} />}
        {page === "alerts"     && <Alerts     data={data} />}
        {page === "status"     && <SystemStatus data={data} />}
      </main>
    </div>
  )
}
