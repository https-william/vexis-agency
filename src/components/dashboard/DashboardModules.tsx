import { 
  PhoneCall, 
  Clock, 
  Waves, 
  Mic2, 
  MessageCircle, 
  BarChart3, 
  Zap,
  Users2,
  PieChart,
  Settings2,
  Activity
} from 'lucide-react'

// --- REUSABLE COMPONENTS ---
const Card = ({ title, value, sub, icon: Icon, trend }: any) => (
  <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between group hover:border-electric/20 transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-electric/10 transition-colors">
        <Icon className="w-5 h-5 text-white/40 group-hover:text-electric transition-colors" />
      </div>
      {trend && (
        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
          +{trend}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-xs text-white/20 font-medium">{sub}</span>
      </div>
    </div>
  </div>
)

// --- VOICE MODULE ---
export function VoiceModule() {
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white mb-2">Voice Infrastructure</h2>
          <p className="text-white/30 text-sm font-medium">Real-time SIP latency and agent performance telemetry.</p>
        </div>
        <button className="glass-button-3d px-6 py-3 bg-electric/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
          Deploy New Agent
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Concurrent Calls" value="12" sub="/25 cap" icon={PhoneCall} />
        <Card title="Avg Latency" value="48" sub="ms" icon={Zap} trend="12" />
        <Card title="Total Talk Time" value="1.2k" sub="min" icon={Clock} />
        <Card title="Agent Sentiment" value="94" sub="%" icon={Waves} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Active Logs</h4>
            <div className="flex gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Live Feed</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mt-1" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Mic2 className="w-4 h-4 text-white/20" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Agent_0{i}_Alpha</div>
                    <div className="text-[10px] text-white/20 font-medium uppercase tracking-wider">SIP_TUNNEL_04_ESTABLISHED</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-white/40 mb-1">Duration</div>
                  <div className="text-xs font-bold text-electric">04:12</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-electric/[0.02]">
          <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8">Quick Config</h4>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-wider text-white/20">Agent Voice Tone</label>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-electric/20 text-white text-[10px] font-black rounded-xl border border-electric/30">Neutral</button>
                <button className="flex-1 py-3 bg-white/5 text-white/40 text-[10px] font-black rounded-xl border border-white/5 hover:bg-white/10">Energetic</button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-wider text-white/20">Response Delay</label>
              <input type="range" className="w-full accent-electric" />
              <div className="flex justify-between text-[8px] font-black text-white/20 tracking-widest">
                <span>0.1S</span>
                <span>2.0S</span>
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors mt-4">
              Access SIP Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- WHATSAPP MODULE ---
export function WhatsAppModule() {
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white mb-2">WhatsApp Automation</h2>
          <p className="text-white/30 text-sm font-medium">Bespoke conversational engine telemetry.</p>
        </div>
        <button className="glass-button-3d px-6 py-3 bg-electric/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
          Update Flow Logic
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Messages Today" value="8.4k" sub="+12% vs yest" icon={MessageCircle} />
        <Card title="Resolution Rate" value="88" sub="%" icon={BarChart3} trend="4" />
        <Card title="Avg Latency" value="1.2" sub="s" icon={Zap} />
        <Card title="Active Sockets" value="242" sub="nodes" icon={Activity} />
      </div>

      <div className="glass-card p-10 rounded-[3rem] border-white/5">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-xs font-black uppercase tracking-widest text-white">Live Conversation Matrix</h4>
          <Settings2 className="w-4 h-4 text-white/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Socket_ID_{i}04x</span>
              </div>
              <div className="space-y-4 font-jetbrains text-[11px]">
                <div className="text-electric/60">[SYSTEM]: INCOMING_PACKET_RECEIVED</div>
                <div className="text-white/80">[USER]: How do I track my order?</div>
                <div className="text-electric/60">[AGENT]: TRIGGERING_ORDER_TRACK_MODULE</div>
                <div className="text-white/80 group">
                  <span className="text-electric">[BOT]:</span> Fetching status for <span className="text-white font-bold">#VX-990</span>... 
                  <span className="inline-block w-1.5 h-3 bg-electric animate-pulse ml-1 align-middle" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- CRM MODULE ---
export function CRMModule() {
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white mb-2">Revenue CRM</h2>
          <p className="text-white/30 text-sm font-medium">Lead generation and pipeline conversion funnel.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white transition-colors">Export DB</button>
          <button className="glass-button-3d px-6 py-3 bg-electric/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Add Lead</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Leads" value="1,490" sub="active" icon={Users2} trend="22" />
        <Card title="Conversion %" value="18" sub="avg" icon={PieChart} />
        <Card title="Est. Pipeline" value="₦42M" sub="value" icon={BarChart3} />
        <Card title="Agent Activity" value="98" sub="%" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-10 rounded-[3rem] border-white/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8">Lead Velocity</h4>
          <div className="h-64 flex items-end justify-between gap-4">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-electric/20 rounded-t-xl group relative">
                <div className="absolute inset-0 bg-electric opacity-0 group-hover:opacity-40 transition-opacity rounded-t-xl" style={{ height: `${h}%` }} />
                <div className="bg-electric/40 rounded-t-xl transition-all duration-1000" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[3rem] border-white/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8">Pipeline Stages</h4>
          <div className="space-y-6">
            <PipelineStage label="Discovery" value="442" percent={90} color="bg-blue-500" />
            <PipelineStage label="Nurturing" value="212" percent={60} color="bg-electric" />
            <PipelineStage label="Negotiation" value="84" percent={40} color="bg-indigo-500" />
            <PipelineStage label="Closing" value="32" percent={20} color="bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PipelineStage({ label, value, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-white/40">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
