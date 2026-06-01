import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"

const TT = { contentStyle:{background:"#1f2937",border:"1px solid #374151",
             borderRadius:8,fontSize:11,color:"#f9fafb"} }

export default function Analytics({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">TCP vs UDP Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.traffic} margin={{left:-10,right:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
 <XAxis dataKey="time" tick={{fontSize:9,fill:"#6b7280"}}
                     axisLine={false} tickLine={false} interval={5}/>
              <YAxis tick={{fontSize:9,fill:"#6b7280"}} axisLine={false} tickLine={false}/>
              <Tooltip {...TT}/>
              <Legend wrapperStyle={{fontSize:11,color:"#9ca3af"}}/>
              <Line type="monotone" dataKey="tcp" stroke="#60a5fa"
                    strokeWidth={2} dot={false} name="TCP"/>
              <Line type="monotone" dataKey="udp" stroke="#34d399"
                    strokeWidth={2} dot={false} name="UDP"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Packet Size Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.packet_sizes} margin={{left:-10,right:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
              <XAxis dataKey="range" tick={{fontSize:9,fill:"#6b7280"}}
                     axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"#6b7280"}} axisLine={false} tickLine={false}/>
              <Tooltip {...TT}/>
              <Bar dataKey="count" fill="#a78bfa" radius={[4,4,0,0]} name="Packets"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
 </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Traffic Timeline — all protocols</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.traffic} margin={{left:-10,right:10}}>
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
            <XAxis dataKey="time" tick={{fontSize:9,fill:"#6b7280"}}
                   axisLine={false} tickLine={false} interval={4}/>
            <YAxis tick={{fontSize:9,fill:"#6b7280"}} axisLine={false} tickLine={false}/>
            <Tooltip {...TT}/>
            <Area type="monotone" dataKey="count" stroke="#a78bfa"
                  fill="url(#ga)" strokeWidth={2} dot={false} name="Total"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
<div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Most Active IPs</p>
        <div className="grid grid-cols-4 gap-3">
          {data.talkers.map((t, i) => (
            <div key={t.ip}
                 className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">#{i+1}</p>
              <p className="text-xs font-mono text-gray-300 mb-2 truncate">{t.ip}</p>
              <p className="text-lg font-bold font-mono text-blue-400">
                {t.count.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">packets</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
