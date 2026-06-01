import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

const TT = { contentStyle:{background:"#1f2937",border:"1px solid #374151",
             borderRadius:8,fontSize:11,color:"#f9fafb"} }

export default function SystemStatus({ data }) {
  const s = data.stats
  const h = Math.floor(s.uptime_seconds / 3600)
  const m = Math.floor((s.uptime_seconds % 3600) / 60)
  const sec = s.uptime_seconds % 60

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Sniffer Status</p>
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center
                            border-2 ${s.sniffer_running
                              ? "border-green-500 bg-green-950/40"
                              : "border-gray-700 bg-gray-800"}`}>
              <div className={`w-4 h-4 rounded-full ${
 s.sniffer_running ? "bg-green-400" : "bg-gray-600"
              }`}/>
            </div>
            <div>
              <p className={`text-xl font-bold ${
                s.sniffer_running ? "text-green-400" : "text-gray-500"
              }`}>{s.sniffer_running ? "Running" : "Stopped"}</p>
              <p className="text-xs text-gray-600">Interface: eth0</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Uptime",       value:`${h}h ${m}m ${sec}s` },
              { label:"Last Capture", value:s.last_capture.slice(11) },
              { label:"Packets/sec",  value:s.packets_per_sec },
              { label:"Total",        value:s.total_packets.toLocaleString() },
            ].map(item => (
              <div key={item.label}
                   className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                <p className="text-sm font-semibold font-mono text-gray-200">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
 </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Capture Metrics</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Total Packets",   value:s.total_packets.toLocaleString(), color:"text-blue-400" },
              { label:"Anomalies",       value:s.total_anomalies,                color:"text-red-400" },
              { label:"Data Volume",     value:`${s.total_mb} MB`,               color:"text-green-400" },
              { label:"Anomaly Types",   value:s.anomaly_types,                  color:"text-amber-400" },
            ].map(item => (
              <div key={item.label}
                   className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">{item.label}</p>
                <p className={`text-2xl font-bold font-mono ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
          Live Packet Rate — last 15 minutes
 </p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data.traffic.slice(-15)} margin={{left:-10,right:10}}>
            <defs>
              <linearGradient id="glive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
            <XAxis dataKey="time" tick={{fontSize:9,fill:"#6b7280"}}
                   axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:"#6b7280"}} axisLine={false} tickLine={false}/>
            <Tooltip {...TT}/>
            <Area type="monotone" dataKey="count" stroke="#22c55e"
                  fill="url(#glive)" strokeWidth={2} dot={false} name="Packets/min"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
