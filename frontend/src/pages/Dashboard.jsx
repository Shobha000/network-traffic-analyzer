import {
  PieChart, Pie, Cell, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"

const PROTO_COLORS = {TCP:"#60a5fa",UDP:"#34d399",ARP:"#fbbf24",ICMP:"#a78bfa"}
const TT = { contentStyle:{background:"#1f2937",border:"1px solid #374151",
             borderRadius:8,fontSize:11,color:"#f9fafb"} }

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color||"text-gray-100"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  )
}

function AnomalyBadge({ reason }) {
  if (reason.includes("High")) return (
    <span className="text-xs px-2 py-0.5 rounded bg-red-900/60 text-red-400">HIGH FREQ</span>)
  if (reason.includes("Scan")) return (
    <span className="text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-400">PORT SCAN</span>)
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-400">LARGE PKT</span>)
}

export default function Dashboard({ data }) {
  const total = data.protocols.reduce((s,p) => s + p.count, 0)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Packets"
          value={data.stats.total_packets.toLocaleString()} sub="all time" />
        <StatCard label="Anomalies"
          value={data.stats.total_anomalies}
          sub={`${data.stats.anomaly_types} types`} color="text-red-400" />
        <StatCard label="Packets/sec"
          value={data.stats.packets_per_sec} color="text-green-400" />
        <StatCard label="Data Captured"
          value={`${data.stats.total_mb} MB`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Protocol Distribution</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={data.protocols} dataKey="count"
                     cx="50%" cy="50%" innerRadius={38} outerRadius={65} paddingAngle={3}>
                  {data.protocols.map(p =>
                    <Cell key={p.protocol} fill={PROTO_COLORS[p.protocol]||"#6b7280"}/>)}
                </Pie>
                <Tooltip {...TT}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.protocols.map(p => (
                <div key={p.protocol} className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full"
                          style={{background:PROTO_COLORS[p.protocol]}}/>
                    {p.protocol}
                  </span>
                  <span className="text-gray-500 font-mono">
                    {p.count.toLocaleString()} 
                    <span className="text-gray-600">
                      ({Math.round(p.count/total*100)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Top Talkers</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.talkers.slice(0,5)} layout="vertical"
                      margin={{left:8,right:16}}>
              <XAxis type="number" tick={{fontSize:9,fill:"#6b7280"}}
                     axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="ip"
  tick={{fontSize:10,fill:"#9ca3af",fontFamily:"monospace"}}
                     axisLine={false} tickLine={false} width={110}/>
              <Tooltip {...TT}/>
              <Bar dataKey="count" fill="#3b82f6" radius={[0,4,4,0]} name="Packets"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Packet Rate — last hour</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data.traffic} margin={{left:-10,right:10}}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
            <XAxis dataKey="time" tick={{fontSize:9,fill:"#6b7280"}}
                   axisLine={false} tickLine={false} interval={4}/>
            <YAxis tick={{fontSize:9,fill:"#6b7280"}} axisLine={false} tickLine={false}/>
            <Tooltip {...TT}/>
            <Area type="monotone" dataKey="count" stroke="#3b82f6"
                  fill="url(#g1)" strokeWidth={2} dot={false} name="Packets"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Recent Anomalies</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              {["Type","IP","Protocol","Reason","Time"].map(h => (
                <th key={h} className="px-4 py-2 text-left text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.anomalies.slice(0,5).map(a => (
              <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-4 py-2.5"><AnomalyBadge reason={a.reason}/></td>
                <td className="px-4 py-2.5 font-mono text-gray-300">{a.ip}</td>
                <td className="px-4 py-2.5 text-gray-500">{a.protocol}</td>
                <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">{a.reason}</td>
                <td className="px-4 py-2.5 font-mono text-gray-600">
                  {a.detected_at.slice(11,19)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
