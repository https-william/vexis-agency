import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { 
  LayoutDashboard, MessageSquare, Phone, Users, Settings, LogOut,
  Bell, Search, Command, Wallet, ChevronRight, TrendingUp, Clock, Activity,
  PhoneCall, Mic2, MessageCircle, BarChart3, PieChart, UserPlus
} from 'lucide-react'

type View = 'OVERVIEW' | 'VOICE' | 'WHATSAPP' | 'CRM'

function useDashboardData() {
  const [data, setData] = useState({
    agents: 0, callsToday: 0, messages: 0, revenue: '₦0', balance: '₦0',
    logs: [] as { time: string; msg: string }[],
    deployments: [] as { name: string; type: string; uptime: string; tasks: string }[],
    stats: { bookingSuccess: 0, responseTime: '0s', leadConversion: 0, satisfaction: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        agents: 3, callsToday: 47, messages: 1284, revenue: '₦847K', balance: '₦1,240,000',
        logs: [
          { time: '14:32', msg: 'Confirmed table booking for 6 guests at The Place, VI' },
          { time: '14:28', msg: 'Qualified inbound lead — Budget: ₦15M, Lekki Phase 1' },
          { time: '14:25', msg: 'Responded to WhatsApp — "What are your opening hours?"' },
          { time: '14:22', msg: 'Scheduled property viewing for 3pm tomorrow' },
          { time: '14:18', msg: 'Processed late checkout request for Room 204' },
        ],
        deployments: [
          { name: 'Alpha-01', type: 'Voice', uptime: '99.9%', tasks: '47' },
          { name: 'Beta-02', type: 'WhatsApp', uptime: '99.7%', tasks: '312' },
          { name: 'Gamma-03', type: 'CRM', uptime: '100%', tasks: '89' },
        ],
        stats: { bookingSuccess: 99, responseTime: '0.4s', leadConversion: 72, satisfaction: 94 },
      })
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return { data, loading }
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>('OVERVIEW')
  const { data, loading } = useDashboardData()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.dash-sidebar', { x: -30, opacity: 0, duration: 0.5, ease: 'power3.out' })
      gsap.from('.dash-content', { y: 15, opacity: 0, duration: 0.5, delay: 0.1, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen flex font-inter" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <aside className="dash-sidebar hidden lg:flex w-64 glass-panel flex-col p-6" style={{ borderRadius: 0, borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}>
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: 'var(--bg-raised)', boxShadow: '4px 4px 10px var(--clay-shadow-1), -2px -2px 6px var(--clay-highlight), inset 0 1px 0 var(--clay-highlight)' }}>
            <img src="/vexis-logo.png" alt="Vexis" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-base tracking-tight">Vexis</span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" active={view === 'OVERVIEW'} onClick={() => setView('OVERVIEW')} />
          <div className="pt-6 pb-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] ml-3">Agents</span>
          </div>
          <SidebarItem icon={<Phone className="w-4 h-4" />} label="Voice Agent" active={view === 'VOICE'} onClick={() => setView('VOICE')} />
          <SidebarItem icon={<MessageSquare className="w-4 h-4" />} label="WhatsApp Bot" active={view === 'WHATSAPP'} onClick={() => setView('WHATSAPP')} />
          <SidebarItem icon={<Users className="w-4 h-4" />} label="CRM" active={view === 'CRM'} onClick={() => setView('CRM')} />
        </nav>

        <div className="pt-6 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" />
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-content flex-1 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 glass-panel px-6 lg:px-8 py-4 flex items-center justify-between" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div className="flex items-center gap-3 skeu-input px-3 py-2 w-72">
            <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-xs w-full placeholder:text-[var(--muted)]" style={{ boxShadow: 'none' }} />
            <div className="flex items-center gap-0.5 text-[var(--muted)]">
              <Command className="w-3 h-3" /><span className="text-[9px]">K</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--muted)]">Balance</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Wallet className="w-3.5 h-3.5 text-electric" />
                {loading ? <span className="w-20 h-4 rounded animate-pulse" style={{ background: 'var(--glass)' }} /> : data.balance}
              </div>
            </div>
            <button className="clay-button relative w-9 h-9 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[var(--muted)]" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-electric" />
            </button>
            <div className="w-9 h-9 rounded-lg" style={{ background: 'var(--bg)', boxShadow: 'var(--inner-shadow)' }} />
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          {view === 'OVERVIEW' && <OverviewView data={data} loading={loading} />}
          {view === 'VOICE' && <VoiceView />}
          {view === 'WHATSAPP' && <WhatsAppView />}
          {view === 'CRM' && <CRMView />}
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════
   OVERVIEW VIEW
   ═══════════════════════════════════════════ */
function OverviewView({ data, loading }: any) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h2>
        <p className="text-sm text-[var(--muted)]">Your agents at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Active Agents" value={loading ? '—' : String(data.agents)} icon={Activity} accent loading={loading} />
        <MetricCard label="Calls Today" value={loading ? '—' : String(data.callsToday)} sub="+12%" icon={Phone} loading={loading} />
        <MetricCard label="Messages" value={loading ? '—' : data.messages.toLocaleString()} icon={MessageSquare} loading={loading} />
        <MetricCard label="Revenue Protected" value={loading ? '—' : data.revenue} icon={TrendingUp} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 clay-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold">Live Agent Activity</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-medium text-emerald-500 uppercase tracking-wider">Live</span>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2.5">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--glass)' }} />)}</div>
          ) : (
            <div className="space-y-2.5">
              {data.logs.map((log: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-jetbrains text-[var(--muted)] mt-0.5 shrink-0">{log.time}</span>
                  <span className="text-xs">{log.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 clay-card p-6 space-y-5">
          <h3 className="text-sm font-semibold">Performance</h3>
          {loading ? (
            <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'var(--glass)' }} />)}</div>
          ) : (
            <>
              <StatBar label="Booking Success" value={data.stats.bookingSuccess} />
              <StatBar label="Response Time" value={95} detail={`Avg ${data.stats.responseTime}`} />
              <StatBar label="Lead Conversion" value={data.stats.leadConversion} />
              <StatBar label="Satisfaction" value={data.stats.satisfaction} />
            </>
          )}
          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
              <Clock className="w-3 h-3" /> Updated 2 min ago
            </div>
          </div>
        </div>
      </div>

      <div className="clay-card p-6">
        <h3 className="text-sm font-semibold mb-5">Active Deployments</h3>
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--muted)] text-[10px] uppercase tracking-wider">
                  <th className="text-left py-3 font-medium">Agent</th>
                  <th className="text-left py-3 font-medium">Type</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Uptime</th>
                  <th className="text-right py-3 font-medium">Tasks/Day</th>
                </tr>
              </thead>
              <tbody>
                {data.deployments.map((a: any, i: number) => (
                  <tr key={i} className="hover:bg-[var(--glass)] transition-colors" style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="py-3 font-medium">{a.name}</td>
                    <td className="py-3 text-[var(--muted)]">{a.type}</td>
                    <td className="py-3"><span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium"><span className="w-1 h-1 rounded-full bg-emerald-500" /> Active</span></td>
                    <td className="py-3 font-jetbrains text-[var(--muted)]">{a.uptime}</td>
                    <td className="py-3 text-right font-jetbrains">{a.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   VOICE AGENT VIEW
   ═══════════════════════════════════════════ */
function VoiceView() {
  return (
    <>
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Voice Agent</h2>
          <p className="text-sm text-[var(--muted)]">Active calls and voice performance.</p>
        </div>
        <button className="clay-button px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-electric">Deploy New Agent</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Active Calls" value="3" icon={PhoneCall} accent />
        <MetricCard label="Avg Duration" value="4:32" icon={Clock} />
        <MetricCard label="Success Rate" value="97%" sub="+3%" icon={TrendingUp} />
        <MetricCard label="Sentiment" value="94%" icon={Mic2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 clay-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold">Active Calls</h3>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-medium text-emerald-500 uppercase tracking-wider">3 Live</span></div>
          </div>
          <div className="space-y-3">
            {[
              { caller: '+234 701 ***', duration: '04:12', agent: 'Alpha-01', topic: 'Table reservation for 8 guests' },
              { caller: '+234 802 ***', duration: '02:45', agent: 'Alpha-01', topic: 'Room availability inquiry — deluxe suite' },
              { caller: '+234 905 ***', duration: '01:18', agent: 'Alpha-01', topic: 'Follow-up on property viewing' },
            ].map((call, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg)', boxShadow: 'var(--inner-shadow)' }}>
                    <PhoneCall className="w-4 h-4 text-electric" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{call.topic}</div>
                    <div className="text-[10px] text-[var(--muted)]">{call.caller} · {call.agent}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-jetbrains text-electric font-semibold">{call.duration}</div>
                  <div className="flex items-center gap-1 mt-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] text-emerald-500">Live</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clay-card p-6">
          <h3 className="text-sm font-semibold mb-5">Voice Config</h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">Agent Tone</label>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-lg text-[10px] font-semibold text-white" style={{ background: 'var(--accent)', boxShadow: 'var(--inner-shadow)' }}>Neutral</button>
                <button className="flex-1 py-2.5 clay-button text-[10px] font-semibold text-[var(--muted)]">Energetic</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">Language</label>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-lg text-[10px] font-semibold text-white" style={{ background: 'var(--accent)', boxShadow: 'var(--inner-shadow)' }}>English</button>
                <button className="flex-1 py-2.5 clay-button text-[10px] font-semibold text-[var(--muted)]">Pidgin</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">Response Delay</label>
              <input type="range" className="w-full accent-electric" />
              <div className="flex justify-between text-[8px] font-semibold text-[var(--muted)] tracking-widest"><span>0.1s</span><span>2.0s</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   WHATSAPP VIEW
   ═══════════════════════════════════════════ */
function WhatsAppView() {
  return (
    <>
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">WhatsApp Bot</h2>
          <p className="text-sm text-[var(--muted)]">Automated messaging and conversation flows.</p>
        </div>
        <button className="clay-button px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-electric">Edit Flow</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Messages Today" value="1,284" icon={MessageCircle} accent />
        <MetricCard label="Resolution Rate" value="88%" sub="+4%" icon={BarChart3} />
        <MetricCard label="Avg Response" value="1.2s" icon={Clock} />
        <MetricCard label="Active Chats" value="24" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chat Preview */}
        <div className="clay-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold">Live Conversation</h3>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] text-emerald-500 uppercase tracking-wider font-medium">Active</span></div>
          </div>
          <div className="space-y-3 font-jetbrains text-xs">
            <ChatBubble from="user" msg="Hi, I'd like to make a reservation for tonight" />
            <ChatBubble from="bot" msg="Welcome! How many guests will be dining tonight?" />
            <ChatBubble from="user" msg="4 people, around 7pm please" />
            <ChatBubble from="bot" msg="I have a table for 4 available at 7pm. Would you like window or garden seating?" />
            <ChatBubble from="user" msg="Garden please!" />
            <ChatBubble from="bot" msg="Done! Your reservation is confirmed: 4 guests, 7pm, garden seating. We'll send a confirmation shortly. 🌿" />
          </div>
        </div>

        {/* Message Stats */}
        <div className="clay-card p-6 space-y-5">
          <h3 className="text-sm font-semibold">Message Categories</h3>
          <div className="space-y-4">
            <StatBar label="Booking Inquiries" value={42} detail="42%" />
            <StatBar label="FAQ Responses" value={28} detail="28%" />
            <StatBar label="Order Tracking" value={18} detail="18%" />
            <StatBar label="Escalated to Human" value={12} detail="12%" />
          </div>
          <div className="pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Top Queries Today</h4>
            <div className="space-y-2">
              {['What are your opening hours?', 'Do you have vegan options?', 'Can I see available properties?'].map((q, i) => (
                <div key={i} className="p-2.5 rounded-lg text-[11px] text-[var(--text-secondary)]" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                  "{q}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   CRM VIEW
   ═══════════════════════════════════════════ */
function CRMView() {
  return (
    <>
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">CRM Hub</h2>
          <p className="text-sm text-[var(--muted)]">Lead pipeline and conversion tracking.</p>
        </div>
        <button className="clay-button px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-electric flex items-center gap-2">
          <UserPlus className="w-3.5 h-3.5" /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Total Leads" value="1,490" sub="+22%" icon={Users} accent />
        <MetricCard label="Conversion" value="18%" icon={PieChart} />
        <MetricCard label="Pipeline Value" value="₦42M" icon={BarChart3} />
        <MetricCard label="Agent Activity" value="98%" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pipeline Funnel */}
        <div className="clay-card p-6">
          <h3 className="text-sm font-semibold mb-5">Pipeline Stages</h3>
          <div className="space-y-5">
            <FunnelBar label="Discovery" value={442} max={442} color="bg-blue-400" />
            <FunnelBar label="Nurturing" value={212} max={442} color="bg-electric" />
            <FunnelBar label="Negotiation" value={84} max={442} color="bg-indigo-500" />
            <FunnelBar label="Closing" value={32} max={442} color="bg-emerald-500" />
          </div>
        </div>

        {/* Lead Table */}
        <div className="clay-card p-6">
          <h3 className="text-sm font-semibold mb-5">Recent Leads</h3>
          <div className="space-y-2">
            {[
              { name: 'Adekunle Hotels', industry: 'Hospitality', stage: 'Nurturing', value: '₦2.4M' },
              { name: 'Prime Properties NG', industry: 'Real Estate', stage: 'Discovery', value: '₦8.1M' },
              { name: 'Bukka Hut Chain', industry: 'Restaurant', stage: 'Negotiation', value: '₦1.8M' },
              { name: 'Lagos Suites', industry: 'Hospitality', stage: 'Closing', value: '₦4.2M' },
              { name: 'Realty Hub Africa', industry: 'Real Estate', stage: 'Discovery', value: '₦12M' },
            ].map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                <div>
                  <div className="text-xs font-semibold">{lead.name}</div>
                  <div className="text-[10px] text-[var(--muted)]">{lead.industry}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-jetbrains font-semibold">{lead.value}</div>
                  <div className="text-[9px] text-electric">{lead.stage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */
function SidebarItem({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
      active ? 'text-electric' : 'text-[var(--muted)] hover:text-[var(--text)]'
    }`} style={active ? { background: 'var(--glass-strong)', boxShadow: 'var(--inner-shadow)' } : {}}>
      {icon} {label}
      {active && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
    </button>
  )
}

function MetricCard({ label, value, sub, icon: Icon, accent, loading }: any) {
  return (
    <div className="clay-card p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg" style={{ background: 'var(--bg)', boxShadow: 'var(--inner-shadow), 0 0 0 1px var(--border)' }}>
          <Icon className="w-4 h-4 text-[var(--muted)]" />
        </div>
        {sub && <span className="text-[10px] font-medium text-emerald-500">{sub}</span>}
        {accent && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
      </div>
      {loading ? <div className="w-16 h-7 rounded animate-pulse" style={{ background: 'var(--glass)' }} /> : <div className="text-2xl font-bold">{value}</div>}
      <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-1">{label}</div>
    </div>
  )
}

function StatBar({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px]">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-medium">{detail || `${value}%`}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass)' }}>
        <div className="h-full bg-electric rounded-full transition-all duration-1000" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px]">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--glass)' }}>
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ChatBubble({ from, msg }: { from: 'user' | 'bot'; msg: string }) {
  return (
    <div className={`flex ${from === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-4 py-2.5 font-inter text-xs leading-relaxed ${
        from === 'user' 
          ? 'rounded-2xl rounded-br-sm text-white' 
          : 'rounded-2xl rounded-bl-sm text-[var(--text)]'
      }`} style={from === 'user' 
        ? { background: 'var(--accent)', boxShadow: '4px 4px 12px var(--clay-shadow-2)' } 
        : { background: 'var(--glass-strong)', border: '1px solid var(--border)' }}>
        {msg}
      </div>
    </div>
  )
}
