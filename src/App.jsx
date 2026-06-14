import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Target, Users, Mail, AlertTriangle, Sparkles, TrendingUp, TrendingDown, Briefcase, DollarSign, Loader2, Copy, Check, ChevronRight, Zap, Brain, Heart, Activity, Swords, Trophy, Wand2 } from "lucide-react";

// ---------- 示例人才库 ----------
const TALENTS = [
  {
    id: 1, name: "陈明远", initials: "陈", title: "首席算法科学家", company: "某头部自动驾驶公司",
    years: 12, salary: "180-220万", domain: "AI / 计算机视觉", color: "#6366f1",
    radar: { 专业技能: 96, 做事风格: 78, 薪资匹配: 65, 文化契合: 82, 稳定倾向: 70 },
    style: "技术深度极强，偏好独立攻坚，对管理琐事兴趣低。决策依据数据，沟通直接。",
    highlights: ["发表 CVPR/ICCV 论文 8 篇", "主导过 3 个量产 L4 项目", "团队管理经验 15 人"],
    flightRisk: 38, riskReasons: ["现公司晋升通道饱和", "近期与直属上级理念冲突", "猎头接触频繁"],
  },
  {
    id: 2, name: "林思颖", initials: "林", title: "资深芯片架构师", company: "某 GPU 创业独角兽",
    years: 15, salary: "200-260万", domain: "半导体 / SoC 设计", color: "#0ea5e9",
    radar: { 专业技能: 94, 做事风格: 88, 薪资匹配: 55, 文化契合: 90, 稳定倾向: 85 },
    style: "体系化思维强，重视团队协作与长期主义。对公司愿景和股权激励敏感。",
    highlights: ["主导 2 代 7nm SoC 架构", "持有核心专利 23 项", "海外大厂 + 创业双背景"],
    flightRisk: 18, riskReasons: ["现公司处于上升期", "股权未到行权期", "对现团队认同度高"],
  },
  {
    id: 3, name: "王启航", initials: "王", title: "大模型应用负责人", company: "某互联网大厂",
    years: 9, salary: "150-190万", domain: "LLM / Agent", color: "#10b981",
    radar: { 专业技能: 90, 做事风格: 92, 薪资匹配: 80, 文化契合: 75, 稳定倾向: 52 },
    style: "执行力与商业嗅觉俱佳，追求快速落地与影响力，偏好扁平、敢于试错的环境。",
    highlights: ["0-1 搭建公司 AI 中台", "带过 30 人产研团队", "有完整商业化闭环经验"],
    flightRisk: 64, riskReasons: ["大厂流程冗长抑制发挥", "明确表达过创业意愿", "薪资涨幅低于市场"],
  },
];

const JOBS = [
  { id: "j1", title: "AI 研发副总裁 (VP)", need: { 专业技能: 90, 做事风格: 85, 薪资匹配: 70, 文化契合: 85, 稳定倾向: 75 }, desc: "组建并领导 50 人 AI 研发体系，需兼具技术深度与团队领导力。" },
  { id: "j2", title: "首席架构师", need: { 专业技能: 95, 做事风格: 80, 薪资匹配: 60, 文化契合: 88, 稳定倾向: 88 }, desc: "负责下一代核心平台架构设计，重长期投入与稳定性。" },
  { id: "j3", title: "创新业务技术负责人", need: { 专业技能: 85, 做事风格: 90, 薪资匹配: 78, 文化契合: 78, 稳定倾向: 60 }, desc: "0-1 孵化新业务线，需极强落地与试错能力。" },
];

// ---------- 触达话术：8 大流派（核心亮点）----------
const STYLES = [
  { id: "s1", emoji: "🤝", name: "真诚专业", desc: "平实可信，突出尊重与专业度" },
  { id: "s2", emoji: "🔥", name: "热情感染", desc: "充满激情，传递使命与温度" },
  { id: "s3", emoji: "🥂", name: "高端含蓄", desc: "克制内敛，彰显格调与稀缺感" },
  { id: "s4", emoji: "⚙️", name: "技术极客", desc: "用技术语言对话，聊硬核挑战" },
  { id: "s5", emoji: "🚀", name: "愿景驱动", desc: "强调改变行业的宏大叙事" },
  { id: "s6", emoji: "📊", name: "数据理性", desc: "用事实、数字、ROI 说话" },
  { id: "s7", emoji: "📖", name: "故事叙事", desc: "以场景故事切入，引发共鸣" },
  { id: "s8", emoji: "😎", name: "圈内人脉", desc: "像老友/同行推荐，轻松不端着" },
];

const DIMS = ["专业技能", "做事风格", "薪资匹配", "文化契合", "稳定倾向"];

// ---------- AI 调用（已改为调用自己的后端 /api/chat）----------
async function callAI(prompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data.content.map((i) => i.text || "").filter(Boolean).join("\n");
}

function matchScore(talent, job) {
  let total = 0;
  DIMS.forEach((d) => { total += 100 - Math.abs(talent.radar[d] - job.need[d]); });
  return Math.round(total / DIMS.length);
}

// ---------- 通用组件 ----------
function RadarCard({ data, color, compareData, compareColor, names }) {
  const chartData = DIMS.map((d) => ({
    dim: d, A: data[d], ...(compareData ? { B: compareData[d] } : {}),
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData} outerRadius="70%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="dim" tick={{ fill: "#475569", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name={names ? names[0] : "候选人"} dataKey="A" stroke={color} fill={color} fillOpacity={0.4} />
        {compareData && <Radar name={names ? names[1] : "对比"} dataKey="B" stroke={compareColor} fill={compareColor} fillOpacity={0.3} />}
        {compareData && <Legend wrapperStyle={{ fontSize: 12 }} />}
      </RadarChart>
    </ResponsiveContainer>
  );
}

function Avatar({ t, size = 44 }) {
  return <div style={{ width: size, height: size, background: t.color }} className="rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">{t.initials}</div>;
}

function RiskBadge({ risk }) {
  const level = risk >= 55 ? { t: "高风险", c: "bg-red-100 text-red-700" } : risk >= 35 ? { t: "中风险", c: "bg-amber-100 text-amber-700" } : { t: "低风险", c: "bg-emerald-100 text-emerald-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${level.c}`}>{level.t} {risk}%</span>;
}

function InfoRow({ icon, label, val }) {
  return <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">{icon}</span><span className="text-slate-400 w-16">{label}</span><span className="text-slate-700 font-medium">{val}</span></div>;
}

// ---------- 模块 1：人才画像 ----------
function ProfileModule() {
  const [sel, setSel] = useState(TALENTS[0]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1 space-y-3">
        {TALENTS.map((t) => (
          <button key={t.id} onClick={() => setSel(t)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${sel.id === t.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
            <Avatar t={t} />
            <div className="min-w-0"><div className="font-semibold text-slate-800 truncate">{t.name}</div><div className="text-xs text-slate-500 truncate">{t.title}</div></div>
            <ChevronRight className="ml-auto text-slate-300" size={18} />
          </button>
        ))}
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar t={sel} size={56} />
          <div><div className="text-xl font-bold text-slate-800">{sel.name}</div><div className="text-sm text-slate-500">{sel.title} · {sel.company}</div></div>
          <div className="ml-auto"><RiskBadge risk={sel.flightRisk} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <RadarCard data={sel.radar} color={sel.color} />
          <div className="space-y-3">
            <InfoRow icon={<Briefcase size={15} />} label="领域" val={sel.domain} />
            <InfoRow icon={<Activity size={15} />} label="经验" val={`${sel.years} 年`} />
            <InfoRow icon={<DollarSign size={15} />} label="薪资期望" val={sel.salary} />
            <div className="pt-2"><div className="text-xs font-semibold text-slate-400 mb-1">做事风格洞察</div><p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{sel.style}</p></div>
          </div>
        </div>
        <div className="mt-5"><div className="text-xs font-semibold text-slate-400 mb-2">核心亮点</div><div className="flex flex-wrap gap-2">{sel.highlights.map((h, i) => <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">{h}</span>)}</div></div>
      </div>
    </div>
  );
}

// ---------- 模块 2：智能匹配 + AI 推荐 ----------
function MatchModule() {
  const [job, setJob] = useState(JOBS[0]);
  const [rec, setRec] = useState("");
  const [loading, setLoading] = useState(false);
  const ranked = [...TALENTS].map((t) => ({ ...t, score: matchScore(t, job) })).sort((a, b) => b.score - a.score);

  async function recommend() {
    setLoading(true); setRec("");
    const profiles = ranked.map((t) => `${t.name}(${t.title})：匹配指数${t.score}；五维${DIMS.map((d) => `${d}${t.radar[d]}`).join("/")}；风格：${t.style}；薪资期望${t.salary}`).join("\n");
    const prompt = `你是顶尖的人才决策顾问。岗位「${job.title}」——${job.desc}\n岗位五维要求：${DIMS.map((d) => `${d}${job.need[d]}`).join("/")}\n\n候选人：\n${profiles}\n\n请基于人岗匹配做出智能推荐，输出：\n1.【首选推荐】推荐谁，并用2-3句话说明决定性理由\n2.【关键权衡】此人需要注意/弥补的1个短板及应对建议\n3.【备选提示】另一位候选人在什么情况下更合适\n中文，分点，250字以内，直接输出。`;
    try { setRec((await callAI(prompt)).trim()); } catch { setRec("生成失败，请重试。"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm font-semibold text-slate-700">选择招聘岗位</div>
          <button onClick={recommend} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}{loading ? "AI 分析中..." : "AI 一键推荐最佳人选"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {JOBS.map((j) => (
            <button key={j.id} onClick={() => { setJob(j); setRec(""); }} className={`text-left p-3 rounded-xl border-2 transition-all ${job.id === j.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200"}`}>
              <div className="font-semibold text-slate-800 text-sm">{j.title}</div><div className="text-xs text-slate-500 mt-1 leading-snug">{j.desc}</div>
            </button>
          ))}
        </div>
        {(rec || loading) && (
          <div className="mt-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100">
            <div className="text-xs font-semibold text-violet-700 flex items-center gap-1 mb-2"><Sparkles size={13} /> AI 智能推荐</div>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{loading ? <span className="text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin" size={14} />正在权衡全部候选人...</span> : rec}</div>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {ranked.map((t, i) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-5 relative">
            {i === 0 && <span className="absolute -top-2 left-4 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Trophy size={11} />最佳匹配</span>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="flex items-center gap-3"><Avatar t={t} size={50} /><div><div className="font-bold text-slate-800">{t.name}</div><div className="text-xs text-slate-500">{t.title}</div></div></div>
              <div className="flex items-center justify-center"><div className="text-center"><div className="text-4xl font-extrabold" style={{ color: t.score >= 80 ? "#10b981" : t.score >= 65 ? "#f59e0b" : "#ef4444" }}>{t.score}</div><div className="text-xs text-slate-400">匹配指数</div></div></div>
              <div className="text-xs space-y-1.5">
                {DIMS.map((d) => { const gap = t.radar[d] - job.need[d]; return (
                  <div key={d} className="flex items-center gap-2"><span className="text-slate-400 w-16">{d}</span><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${t.radar[d]}%`, background: t.color }} /></div><span className={`w-10 text-right font-medium ${gap >= 0 ? "text-emerald-600" : "text-amber-600"}`}>{gap >= 0 ? "+" : ""}{gap}</span></div>
                ); })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- 模块 3：候选人 PK ----------
function PkModule() {
  const [job, setJob] = useState(JOBS[0]);
  const [aId, setAId] = useState(TALENTS[0].id);
  const [bId, setBId] = useState(TALENTS[2].id);
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);
  const A = TALENTS.find((t) => t.id === aId);
  const B = TALENTS.find((t) => t.id === bId);
  const scoreA = matchScore(A, job), scoreB = matchScore(B, job);

  async function judge() {
    setLoading(true); setVerdict("");
    const prompt = `你是资深人才决策顾问，帮 HR 在两位候选人之间做权衡。岗位「${job.title}」：${job.desc}\n岗位五维要求：${DIMS.map((d) => `${d}${job.need[d]}`).join("/")}\n\nA. ${A.name}(${A.title})：匹配${scoreA}；${DIMS.map((d) => `${d}${A.radar[d]}`).join("/")}；风格：${A.style}；薪资${A.salary}\nB. ${B.name}(${B.title})：匹配${scoreB}；${DIMS.map((d) => `${d}${B.radar[d]}`).join("/")}；风格：${B.style}；薪资${B.salary}\n\n请输出权衡建议：\n1.【A 的相对优势】\n2.【B 的相对优势】\n3.【最终建议】结合岗位特性给出倾向性结论及一句话理由\n中文，分点，每点1-2句，250字以内，直接输出。`;
    try { setVerdict((await callAI(prompt)).trim()); } catch { setVerdict("生成失败，请重试。"); }
    setLoading(false);
  }

  const pick = (val, set, exclude) => (
    <select value={val} onChange={(e) => { set(Number(e.target.value)); setVerdict(""); }} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white">
      {TALENTS.filter((t) => t.id !== exclude).map((t) => <option key={t.id} value={t.id}>{t.name} · {t.title}</option>)}
    </select>
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="text-sm font-semibold text-slate-700 mb-2">对比岗位</div>
        <select value={job.id} onChange={(e) => { setJob(JOBS.find((j) => j.id === e.target.value)); setVerdict(""); }} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white mb-4">
          {JOBS.map((j) => <option key={j.id} value={j.id}>{j.title} —— {j.desc}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <div><div className="text-xs text-indigo-600 font-semibold mb-1">选手 A</div>{pick(aId, setAId, bId)}</div>
          <div><div className="text-xs text-sky-600 font-semibold mb-1">选手 B</div>{pick(bId, setBId, aId)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="grid grid-cols-3 items-center mb-4">
          <div className="flex items-center gap-2 justify-end pr-2"><div className="text-right"><div className="font-bold text-slate-800">{A.name}</div><div className="text-xs text-slate-500">{A.title}</div></div><Avatar t={A} size={48} /></div>
          <div className="text-center"><Swords className="mx-auto text-slate-300" size={24} /><div className="text-xs text-slate-400 mt-1">同岗 PK</div></div>
          <div className="flex items-center gap-2 pl-2"><Avatar t={B} size={48} /><div><div className="font-bold text-slate-800">{B.name}</div><div className="text-xs text-slate-500">{B.title}</div></div></div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-5">
          <div className="text-center"><div className="text-3xl font-extrabold text-indigo-600">{scoreA}</div><div className="text-[10px] text-slate-400">匹配指数</div></div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${scoreA === scoreB ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"}`}>{scoreA === scoreB ? "势均力敌" : scoreA > scoreB ? `${A.name} 领先 ${scoreA - scoreB}` : `${B.name} 领先 ${scoreB - scoreA}`}</div>
          <div className="text-center"><div className="text-3xl font-extrabold text-sky-600">{scoreB}</div><div className="text-[10px] text-slate-400">匹配指数</div></div>
        </div>

        <RadarCard data={A.radar} color={A.color} compareData={B.radar} compareColor={B.color} names={[A.name, B.name]} />

        <div className="mt-4 space-y-2">
          {DIMS.map((d) => { const win = A.radar[d] === B.radar[d] ? 0 : A.radar[d] > B.radar[d] ? -1 : 1; return (
            <div key={d} className="flex items-center gap-2 text-xs">
              <span className={`w-10 text-right font-bold ${win === -1 ? "text-indigo-600" : "text-slate-400"}`}>{A.radar[d]}</span>
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex justify-end"><div className="h-full rounded-full" style={{ width: `${A.radar[d]}%`, background: A.color, opacity: win === -1 ? 1 : 0.4 }} /></div>
                <span className="text-slate-500 w-16 text-center">{d}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${B.radar[d]}%`, background: B.color, opacity: win === 1 ? 1 : 0.4 }} /></div>
              </div>
              <span className={`w-10 font-bold ${win === 1 ? "text-sky-600" : "text-slate-400"}`}>{B.radar[d]}</span>
            </div>
          ); })}
        </div>

        <button onClick={judge} disabled={loading} className="w-full mt-5 py-3 bg-gradient-to-r from-indigo-600 to-sky-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}{loading ? "AI 权衡中..." : "AI 生成权衡建议，助 HR 决策"}
        </button>
        {(verdict || loading) && <div className="mt-4 bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{loading ? <span className="text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin" size={14} />分析中...</span> : verdict}</div>}
      </div>
    </div>
  );
}

// ---------- 模块 4：个性化触达（8 流派）----------
function OutreachModule() {
  const [sel, setSel] = useState(TALENTS[0]);
  const [job, setJob] = useState(JOBS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function gen() {
    setLoading(true); setOut("");
    const prompt = `你是顶尖的高端人才猎头。请用「${style.name}」风格（${style.desc}）为候选人撰写一封个性化招聘邀约信（中文，250字以内），打动一位已有稳定职位的资深专家。\n\n候选人：${sel.name}，${sel.title}，${sel.years}年经验，领域${sel.domain}。\n做事风格：${sel.style}\n核心亮点：${sel.highlights.join("；")}\n流动诱因：${sel.riskReasons.join("；")}\n目标岗位：${job.title} —— ${job.desc}\n\n要求：\n1. 鲜明体现「${style.name}」这一风格的语气与措辞特征，让风格差异一眼可辨\n2. 开篇精准点出对方成就，体现"我们研究过你"\n3. 结合其诉求给出针对性吸引点，不油腻、不群发感\n4. 直接输出邮件正文，无标题无额外说明。`;
    try { setOut((await callAI(prompt)).trim()); } catch { setOut("生成失败，请重试。"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-center gap-2 mb-1"><Sparkles size={18} /><span className="font-bold">8 大触达流派 · 千人千面打动专家</span></div>
        <p className="text-xs text-indigo-100">同一候选人，不同流派话术天差地别。选对风格，是打动资深专家的关键。</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="text-sm font-semibold text-slate-700 mb-2">① 选择候选人</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {TALENTS.map((t) => (
                <button key={t.id} onClick={() => setSel(t)} className={`p-2 rounded-xl border-2 text-xs ${sel.id === t.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100"}`}>
                  <Avatar t={t} size={32} /><div className="mt-1 font-medium text-slate-700 truncate">{t.name}</div>
                </button>
              ))}
            </div>
            <div className="text-sm font-semibold text-slate-700 mb-2">② 目标岗位</div>
            <select value={job.id} onChange={(e) => setJob(JOBS.find((j) => j.id === e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white">
              {JOBS.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="text-sm font-semibold text-slate-700 mb-3">③ 选择话术流派 <span className="text-xs text-indigo-500 font-normal">（核心亮点）</span></div>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s)} className={`text-left p-2.5 rounded-xl border-2 transition-all ${style.id === s.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200"}`}>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm"><span>{s.emoji}</span>{s.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{s.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={gen} disabled={loading} className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}{loading ? "AI 撰写中..." : `用「${style.name}」风格生成邀约`}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Mail size={15} className="text-indigo-500" /> 邀约信预览 <span className="text-xs text-slate-400">· {style.emoji}{style.name}</span></div>
            {out && !loading && <button onClick={() => { navigator.clipboard?.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "已复制" : "复制"}</button>}
          </div>
          <div className="min-h-[420px] bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {loading ? <div className="flex items-center justify-center h-full text-slate-400 gap-2"><Loader2 className="animate-spin" size={16} /> 正以「{style.name}」风格为「{sel.name}」定制...</div>
              : out || <div className="text-slate-400 flex items-center justify-center h-full text-center">选好候选人、岗位与流派<br />点击生成，感受不同风格的差异</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- 模块 5：保留风险预警 ----------
function RetentionModule() {
  const [sel, setSel] = useState(TALENTS.find((t) => t.flightRisk >= 55) || TALENTS[0]);
  const [strat, setStrat] = useState("");
  const [loading, setLoading] = useState(false);
  const sorted = [...TALENTS].sort((a, b) => b.flightRisk - a.flightRisk);

  async function gen() {
    setLoading(true); setStrat("");
    const prompt = `你是资深人才保留专家(HRBP)。核心人才「${sel.name}」(${sel.title}, ${sel.years}年) 出现流失预警。\n风险评分：${sel.flightRisk}/100\n风险信号：${sel.riskReasons.join("；")}\n做事风格：${sel.style}\n核心价值：${sel.highlights.join("；")}\n\n请输出保留行动方案：\n1.【风险研判】2-3句点出核心症结\n2.【保留策略】分3点给出可落地干预措施，结合其诉求与风格\n3.【一句话沟通建议】给直属上级的开场话术\n中文，分点，300字以内，直接输出。`;
    try { setStrat((await callAI(prompt)).trim()); } catch { setStrat("生成失败，请重试。"); }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <div className="text-sm font-semibold text-slate-700 mb-1">流失风险雷达</div>
        {sorted.map((t) => (
          <button key={t.id} onClick={() => { setSel(t); setStrat(""); }} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${sel.id === t.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100 bg-white"}`}>
            <div className="flex items-center gap-3 mb-2"><Avatar t={t} size={40} /><div className="min-w-0"><div className="font-semibold text-slate-800 text-sm truncate">{t.name}</div><div className="text-xs text-slate-500 truncate">{t.title}</div></div><div className="ml-auto">{t.flightRisk >= 55 ? <TrendingUp className="text-red-500" size={18} /> : <TrendingDown className="text-emerald-500" size={18} />}</div></div>
            <div className="flex items-center gap-2"><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${t.flightRisk}%`, background: t.flightRisk >= 55 ? "#ef4444" : t.flightRisk >= 35 ? "#f59e0b" : "#10b981" }} /></div><span className="text-xs font-bold text-slate-600 w-8">{t.flightRisk}%</span></div>
          </button>
        ))}
      </div>
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center gap-3 mb-4"><Avatar t={sel} size={48} /><div><div className="font-bold text-slate-800">{sel.name}</div><div className="text-xs text-slate-500">{sel.title}</div></div><div className="ml-auto"><RiskBadge risk={sel.flightRisk} /></div></div>
        <div className="mb-4"><div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1"><AlertTriangle size={13} /> 风险信号</div><div className="space-y-1.5">{sel.riskReasons.map((r, i) => <div key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-red-50 rounded-lg px-3 py-2"><span className="text-red-400 mt-0.5">●</span>{r}</div>)}</div></div>
        <button onClick={gen} disabled={loading} className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mb-4">{loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}{loading ? "AI 研判中..." : "AI 生成保留行动方案"}</button>
        {(strat || loading) && <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[120px]">{loading ? <div className="flex items-center justify-center text-slate-400 gap-2 py-6"><Loader2 className="animate-spin" size={16} /> 分析中...</div> : strat}</div>}
      </div>
    </div>
  );
}

// ---------- 主框架 ----------
const NAV = [
  { id: "profile", name: "多维人才画像", icon: Users, sub: "看懂人的复杂多面" },
  { id: "match", name: "AI 智能匹配", icon: Target, sub: "人岗对齐 + 智能推荐" },
  { id: "pk", name: "候选人 PK", icon: Swords, sub: "同岗对比助权衡" },
  { id: "outreach", name: "个性化触达", icon: Mail, sub: "8 大流派打动专家" },
  { id: "retention", name: "保留风险预警", icon: Heart, sub: "前置守住核心人才" },
];

export default function App() {
  const [tab, setTab] = useState("profile");
  const cur = NAV.find((n) => n.id === tab);
  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "system-ui, sans-serif" }}>
      <aside className="w-60 bg-white border-r border-slate-100 p-5 flex-shrink-0 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center"><Zap className="text-white" size={20} /></div>
          <div><div className="font-extrabold text-slate-800 leading-tight">星猎 AI</div><div className="text-[10px] text-slate-400">高端人才智能引擎</div></div>
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => { const I = n.icon; return (
            <button key={n.id} onClick={() => setTab(n.id)} className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${tab === n.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <I size={18} /><div><div className="text-sm font-medium">{n.name}</div><div className="text-[10px] opacity-60">{n.sub}</div></div>
            </button>
          ); })}
        </nav>
        <div className="mt-8 p-3 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl"><div className="text-xs font-semibold text-indigo-700 flex items-center gap-1 mb-1"><Sparkles size={12} /> AI 实时驱动</div><div className="text-[10px] text-slate-500 leading-relaxed">推荐、PK、触达、保留均由大模型实时生成，非预设模板</div></div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="md:hidden flex gap-1 p-2 bg-white border-b border-slate-100 overflow-x-auto">
          {NAV.map((n) => <button key={n.id} onClick={() => setTab(n.id)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${tab === n.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{n.name}</button>)}
        </div>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="mb-5"><h1 className="text-xl font-bold text-slate-800">{cur.name}</h1><p className="text-sm text-slate-500">{cur.sub}</p></div>
          {tab === "profile" && <ProfileModule />}
          {tab === "match" && <MatchModule />}
          {tab === "pk" && <PkModule />}
          {tab === "outreach" && <OutreachModule />}
          {tab === "retention" && <RetentionModule />}
        </div>
      </main>
    </div>
  );
}
