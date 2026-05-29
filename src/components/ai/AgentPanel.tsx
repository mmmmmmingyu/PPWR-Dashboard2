import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bot, Send, X, Sparkles } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useAppStore } from '../../store/appStore'
import { mockProductProgress, mockCountryProgress, mockAnomalies } from '../../mock/data'
import type { AgentMessage } from '../../types'

function generateResponse(query: string, lang: 'zh' | 'en'): AgentMessage {
  const id = Date.now().toString()

  if (query.includes('产品线') || query.includes('product line')) {
    const lines = [...new Set(mockProductProgress.map((p) => p.productLine))]
    const data = lines
      .map((line) => {
        const items = mockProductProgress.filter((p) => p.productLine === line)
        const total = items.reduce((s, p) => s + p.nodes.length, 0)
        const done = items.reduce((s, p) => s + p.nodes.filter((n) => n.status === 'completed').length, 0)
        return { name: line, value: total ? Math.round((done / total) * 100) : 0 }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)

    return {
      id,
      role: 'assistant',
      content: lang === 'zh'
        ? `当前切换准备度最高的三个产品线为：${data.map((d, i) => `${i + 1}. ${d.name}（${d.value}%）`).join('；')}`
        : `Top 3 product lines: ${data.map((d, i) => `${i + 1}. ${d.name} (${d.value}%)`).join('; ')}`,
      chart: { type: 'bar', data },
      timestamp: new Date(),
    }
  }

  if (query.includes('国家') || query.includes('代表处') || query.includes('country') || query.includes('overdue')) {
    const data = mockCountryProgress
      .map((c) => ({
        name: c.country,
        value: c.nodes.filter((n) => n.status === 'overdue').length,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)

    return {
      id,
      role: 'assistant',
      content: lang === 'zh'
        ? `逾期风险最大的国家/代表处：${data.map((d, i) => `${i + 1}. ${d.name}（${d.value}个逾期节点）`).join('；')}`
        : `Highest overdue risk: ${data.map((d, i) => `${i + 1}. ${d.name} (${d.value} overdue nodes)`).join('; ')}`,
      chart: { type: 'bar', data },
      timestamp: new Date(),
    }
  }

  const pending = mockAnomalies.filter((a) => a.status !== 'closed').length
  const baseline = mockAnomalies.filter((a) => a.scene === 'baseline_change' && a.status !== 'closed').length
  const shipment = mockAnomalies.filter((a) => a.scene === 'code_shipment' && a.status !== 'closed').length

  return {
    id,
    role: 'assistant',
    content: lang === 'zh'
      ? `当前共有 ${pending} 条未关闭异常。主要归因：基线变更风险 ${baseline} 条（客制化需求驱动），异常发货 ${shipment} 条（切换窗口期编码混用）。建议优先处理发货异常并加速意大利区域节点交付。`
      : `${pending} open anomalies. Main causes: ${baseline} baseline changes (customization-driven), ${shipment} shipment anomalies (code mixing during switch window). Prioritize shipment anomalies and accelerate Italy regional nodes.`,
    timestamp: new Date(),
  }
}

const PROACTIVE_ALERT = {
  zh: '⚠️ 进口商数据完整率环比下降 0.5%，主要因法国区新增进口商未及时补充联系人信息。建议本周内完成数据补录。',
  en: '⚠️ Importer data completeness dropped 0.5% MoM, mainly due to new French importers missing contact info. Recommend completing data entry this week.',
}

export function AgentPanel() {
  const { t } = useTranslation()
  const { agentOpen, toggleAgent, language } = useAppStore()
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: AgentMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [...prev, generateResponse(text, language)])
    }, 600)
  }

  if (!agentOpen) {
    return (
      <button
        onClick={toggleAgent}
        className="fixed right-4 bottom-4 z-50 w-12 h-12 rounded-full agent-glow bg-agent-panel border border-agent-accent/30 flex items-center justify-center text-agent-accent hover:scale-105 transition-transform"
      >
        <Bot size={22} />
      </button>
    )
  }

  return (
    <aside className="w-80 bg-agent-bg border-l border-agent-accent/20 flex flex-col shrink-0 relative overflow-hidden">
      {/* Particle background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="agent-particle absolute w-1 h-1 rounded-full bg-agent-accent/40"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${15 + (i * 11) % 70}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-agent-accent/5 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-agent-accent/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-agent-accent/20 flex items-center justify-center">
              <Sparkles size={14} className="text-agent-glow" />
            </div>
            <span className="text-sm font-medium text-white">{t('agent.title')}</span>
          </div>
          <button onClick={toggleAgent} className="text-slate-500 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {/* Proactive alert */}
          <div className="p-3 rounded-lg bg-agent-accent/10 border border-agent-accent/20">
            <p className="text-[10px] text-agent-glow font-medium mb-1">{t('agent.proactive')}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{PROACTIVE_ALERT[language]}</p>
          </div>

          {messages.length === 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-slate-500">{t('agent.examples')}</p>
              {[t('agent.example1'), t('agent.example2'), t('agent.example3')].map((ex) => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  className="block w-full text-left text-xs text-slate-400 hover:text-agent-glow p-2 rounded-lg hover:bg-agent-accent/10 border border-transparent hover:border-agent-accent/20 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-agent-accent/30 text-white'
                    : 'bg-agent-panel border border-agent-accent/15 text-slate-300'
                }`}
              >
                {msg.content}
                {msg.chart && (
                  <div className="mt-2 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={msg.chart.data}>
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #3b82f6', fontSize: 11 }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-agent-accent/20">
          <div className="flex items-center gap-2 bg-agent-panel rounded-lg border border-agent-accent/20 px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder={t('agent.placeholder')}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
            />
            <button onClick={() => send(input)} className="text-agent-accent hover:text-agent-glow p-0.5">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
