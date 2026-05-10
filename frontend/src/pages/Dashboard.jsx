import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IndiaMap from "../components/IndiaMap";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API = "https://ruthanne-supratemporal-overcommonly.ngrok-free.dev";

const FEATURE_LABELS = {
  npa_ratio: "NPA Ratio",
  car: "CAR",
  roa: "ROA",
  liquidity_coverage: "Liquidity",
  debt_to_equity: "Debt/Equity",
  cost_to_income: "Cost/Income",
};

const RISK_META = {
  Safe:     { color: "#1D9E75", bg: "rgba(29,158,117,0.12)", border: "rgba(29,158,117,0.3)" },
  Caution:  { color: "#BA7517", bg: "rgba(186,117,23,0.12)",  border: "rgba(186,117,23,0.3)" },
  "At-Risk":{ color: "#E24B4A", bg: "rgba(226,75,74,0.12)",  border: "rgba(226,75,74,0.3)" },
  Critical: { color: "#A32D2D", bg: "rgba(163,45,45,0.18)",  border: "rgba(163,45,45,0.4)" },
};

// ─── CRISIS DATA (historical — static) ────────────────────────────────────────
const CRISES = [
  {
    id:"yes_bank", name:"YES BANK", type:"Private Bank",
    collapseDate:"Mar 2020", collapseLabel:"RBI Moratorium",
    firstWarning:"Sep 2018", leadTime:"18 months",
    description:"RBI placed Yes Bank under moratorium on 5 March 2020, capping withdrawals at ₹50,000. FinGuard's composite score crossed Critical in Q3 2018 — 18 months before collapse — driven by ballooning NPA and deteriorating CAR.",
    quarters:[
      {p:"2015 Q1",s:82,c:false},{p:"2016 Q1",s:76,c:false},{p:"2016 Q3",s:73,c:false},
      {p:"2017 Q1",s:70,c:false},{p:"2017 Q3",s:65,c:false},{p:"2018 Q1",s:58,c:false},
      {p:"2018 Q3",s:37,c:true,w:true},{p:"2019 Q1",s:28,c:true},{p:"2019 Q3",s:19,c:true},
      {p:"2020 Q1",s:9,c:true,collapse:true},
    ],
    ratios:[
      {name:"NPA Ratio",bv:"16.8%",ia:"4.2%",st:"critical",contrib:-28},
      {name:"CAR",bv:"8.5%",ia:"15.2%",st:"critical",contrib:-18},
      {name:"ROA",bv:"-0.6%",ia:"0.9%",st:"danger",contrib:-14},
      {name:"Liquidity",bv:"62%",ia:"118%",st:"danger",contrib:-10},
      {name:"Debt/Equity",bv:"18.4x",ia:"11.2x",st:"warning",contrib:-8},
      {name:"Cost/Income",bv:"52%",ia:"46%",st:"ok",contrib:-3},
    ],
    color:"#E24B4A", light:"#F09595",
  },
  {
    id:"pmc_bank", name:"PMC BANK", type:"Co-operative Bank",
    collapseDate:"Sep 2019", collapseLabel:"RBI Restrictions",
    firstWarning:"Sep 2018", leadTime:"12 months",
    description:"Punjab and Maharashtra Co-operative Bank was placed under RBI restrictions in September 2019 after concealing ₹6,500 Cr exposure to HDIL. FinGuard flagged deteriorating NPA and liquidity 12 months prior.",
    quarters:[
      {p:"2015 Q1",s:74,c:false},{p:"2016 Q1",s:69,c:false},{p:"2016 Q3",s:67,c:false},
      {p:"2017 Q1",s:64,c:false},{p:"2017 Q3",s:60,c:false},{p:"2018 Q1",s:55,c:false},
      {p:"2018 Q3",s:39,c:true,w:true},{p:"2019 Q1",s:22,c:true},
      {p:"2019 Q3",s:8,c:true,collapse:true},
    ],
    ratios:[
      {name:"NPA Ratio",bv:"21.3%",ia:"4.2%",st:"critical",contrib:-32},
      {name:"Liquidity",bv:"44%",ia:"118%",st:"critical",contrib:-22},
      {name:"CAR",bv:"9.1%",ia:"15.2%",st:"danger",contrib:-12},
      {name:"ROA",bv:"-1.2%",ia:"0.9%",st:"danger",contrib:-11},
      {name:"Debt/Equity",bv:"20.1x",ia:"11.2x",st:"warning",contrib:-7},
      {name:"Cost/Income",bv:"58%",ia:"46%",st:"warning",contrib:-5},
    ],
    color:"#D4537E", light:"#F4C0D1",
  },
  {
    id:"ilfs", name:"IL&FS", type:"NBFC",
    collapseDate:"Sep 2018", collapseLabel:"Default on ICDs",
    firstWarning:"Mar 2017", leadTime:"18 months",
    description:"Infrastructure Leasing & Financial Services defaulted on Inter-Corporate Deposits in September 2018. FinGuard's model flagged critical D/E and cost-to-income ratios 18 months before default.",
    quarters:[
      {p:"2014 Q1",s:71,c:false},{p:"2015 Q1",s:65,c:false},{p:"2015 Q3",s:62,c:false},
      {p:"2016 Q1",s:57,c:false},{p:"2016 Q3",s:53,c:false},
      {p:"2017 Q1",s:41,c:true,w:true},{p:"2017 Q3",s:35,c:true},
      {p:"2018 Q1",s:21,c:true},{p:"2018 Q3",s:6,c:true,collapse:true},
    ],
    ratios:[
      {name:"Debt/Equity",bv:"31.2x",ia:"8.4x",st:"critical",contrib:-35},
      {name:"Liquidity",bv:"38%",ia:"118%",st:"critical",contrib:-24},
      {name:"Cost/Income",bv:"74%",ia:"46%",st:"danger",contrib:-16},
      {name:"NPA Ratio",bv:"9.8%",ia:"4.2%",st:"danger",contrib:-12},
      {name:"CAR",bv:"10.2%",ia:"15.2%",st:"warning",contrib:-8},
      {name:"ROA",bv:"0.1%",ia:"0.9%",st:"ok",contrib:-2},
    ],
    color:"#EF9F27", light:"#FAC775",
  },
  {
    id:"dhfl", name:"DHFL", type:"Housing Finance",
    collapseDate:"Nov 2019", collapseLabel:"NCD Default",
    firstWarning:"Nov 2017", leadTime:"24 months",
    description:"Dewan Housing Finance Limited defaulted on NCDs in November 2019. FinGuard detected spiralling D/E and deteriorating liquidity as early as Q4 2017 — a full 24 months before collapse.",
    quarters:[
      {p:"2014 Q1",s:76,c:false},{p:"2015 Q1",s:71,c:false},{p:"2016 Q1",s:64,c:false},
      {p:"2016 Q3",s:59,c:false},{p:"2017 Q1",s:51,c:false},{p:"2017 Q3",s:44,c:false},
      {p:"2017 Q4",s:38,c:true,w:true},{p:"2018 Q2",s:27,c:true},
      {p:"2018 Q4",s:18,c:true},{p:"2019 Q2",s:11,c:true},
      {p:"2019 Q4",s:4,c:true,collapse:true},
    ],
    ratios:[
      {name:"Debt/Equity",bv:"28.6x",ia:"8.4x",st:"critical",contrib:-30},
      {name:"NPA Ratio",bv:"12.4%",ia:"4.2%",st:"critical",contrib:-25},
      {name:"Liquidity",bv:"51%",ia:"118%",st:"danger",contrib:-18},
      {name:"ROA",bv:"-0.3%",ia:"0.9%",st:"danger",contrib:-13},
      {name:"CAR",bv:"11.8%",ia:"15.2%",st:"warning",contrib:-9},
      {name:"Cost/Income",bv:"61%",ia:"46%",st:"warning",contrib:-6},
    ],
    color:"#7F77DD", light:"#AFA9EC",
  },
];

// ─── STATUS COLORS ────────────────────────────────────────────────────────────
const SC = { critical:"#E24B4A", danger:"#EF9F27", warning:"#7F77DD", ok:"#1D9E75" };

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useFetch(url, deps=[]) {
  const [data,  setData]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!url) return;
    setLoading(true); setError(null); setData(null);
    fetch(url, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, deps);
  return { data, loading, error };
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const mono = "'IBM Plex Mono', 'Fira Code', monospace";
const sans = "'IBM Plex Sans', system-ui, sans-serif";

function Card({ children, style={} }) {
  return (
    <div style={{
      background:"rgba(255,255,255,0.03)",
      border:"0.5px solid rgba(255,255,255,0.09)",
      borderRadius:12, padding:20, ...style
    }}>
      {children}
    </div>
  );
}

function Label({ children, style={} }) {
  return (
    <div style={{
      fontSize:9, letterSpacing:2.5, color:"rgba(255,255,255,0.3)",
      fontFamily:mono, marginBottom:8, textTransform:"uppercase", ...style
    }}>
      {children}
    </div>
  );
}

function RiskBadge({ label }) {
  const m = RISK_META[label] || RISK_META["Caution"];
  return (
    <span style={{
      fontSize:10, fontFamily:mono, fontWeight:500,
      padding:"3px 10px", borderRadius:20,
      background:m.bg, color:m.color, border:`0.5px solid ${m.border}`,
    }}>
      {label}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
      <div style={{
        width:24,height:24,border:"2px solid rgba(255,255,255,0.08)",
        borderTop:"2px solid rgba(255,255,255,0.4)",
        borderRadius:"50%",animation:"spin 0.8s linear infinite"
      }}/>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div style={{
      padding:"12px 16px", borderRadius:8, background:"rgba(226,75,74,0.1)",
      border:"0.5px solid rgba(226,75,74,0.3)",
      color:"#F09595", fontFamily:mono, fontSize:11
    }}>
      ⚠ {msg}
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size=80 }) {
  const r = RISK_META[
    score >= 80 ? "Safe" : score >= 60 ? "Caution" : score >= 40 ? "At-Risk" : "Critical"
  ];
  const pct = score / 100;
  const c = size / 2, rad = size * 0.38, circ = 2 * Math.PI * rad;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={rad} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size*0.07}/>
      <circle cx={c} cy={c} r={rad} fill="none" stroke={r.color}
        strokeWidth={size*0.07} strokeLinecap="round"
        strokeDasharray={`${circ * pct} ${circ}`}
        transform={`rotate(-90 ${c} ${c})`}
        style={{filter:`drop-shadow(0 0 4px ${r.color}88)`}}
      />
      <text x={c} y={c+1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size*0.22} fontWeight={600} fill={r.color} fontFamily={mono}>
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ─── MINI LINE CHART ─────────────────────────────────────────────────────────
function MiniChart({ history, color="#4B7AC7" }) {
  if (!history || history.length < 2) return null;
  const scores = history.map(h => h.score);
  const min = Math.min(...scores) - 5, max = Math.max(...scores) + 5;
  const W = 120, H = 40;
  const toX = i => (i / (scores.length - 1)) * W;
  const toY = v => H - ((v - min) / (max - min)) * H;
  const d = scores.map((s,i) => `${i===0?"M":"L"}${toX(i).toFixed(1)},${toY(s).toFixed(1)}`).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={toX(scores.length-1)} cy={toY(scores[scores.length-1])} r="3" fill={color}/>
    </svg>
  );
}

// ─── BIG CHART (Trend Explorer & Crisis Replay) ───────────────────────────────
function BigChart({ points, color="#4B7AC7", warnIdx=-1, collapseIdx=-1, onHover, hoveredIdx }) {
  const W=600, H=200, PL=36, PR=16, PT=14, PB=28;
  const cW=W-PL-PR, cH=H-PT-PB;
  const scores = points.map(p=>p.score);
  const toX = i => PL + (i/(points.length-1))*cW;
  const toY = s => PT + cH - (s/100)*cH;
  const pathD = points.map((p,i)=>`${i===0?"M":"L"}${toX(i).toFixed(1)},${toY(p.score).toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${toX(points.length-1).toFixed(1)},${(PT+cH).toFixed(1)} L${PL},${(PT+cH).toFixed(1)}Z`;
  const zones = [
    {min:0,max:40,color:"rgba(163,45,45,0.10)",label:"Critical"},
    {min:40,max:60,color:"rgba(226,75,74,0.07)",label:"At-Risk"},
    {min:60,max:80,color:"rgba(186,117,23,0.06)",label:"Caution"},
    {min:80,max:100,color:"rgba(29,158,117,0.06)",label:"Safe"},
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block"}} onMouseLeave={()=>onHover&&onHover(null)}>
      <defs>
        <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      {zones.map(z=>(
        <rect key={z.label} x={PL} y={toY(z.max)} width={cW} height={toY(z.min)-toY(z.max)} fill={z.color}/>
      ))}
      {[0,40,60,80,100].map(s=>(
        <g key={s}>
          <line x1={PL} y1={toY(s)} x2={W-PR} y2={toY(s)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <text x={PL-4} y={toY(s)+3} fontSize="8" fill="rgba(255,255,255,0.22)"
            textAnchor="end" fontFamily={mono}>{s}</text>
        </g>
      ))}
      {warnIdx>=0 && (
        <line x1={toX(warnIdx)} y1={PT} x2={toX(warnIdx)} y2={PT+cH}
          stroke="#EF9F27" strokeWidth="1" strokeDasharray="3 3" opacity="0.7"/>
      )}
      {collapseIdx>=0 && (
        <line x1={toX(collapseIdx)} y1={PT} x2={toX(collapseIdx)} y2={PT+cH}
          stroke={color} strokeWidth="1.5" opacity="0.9"/>
      )}
      <path d={areaD} fill="url(#chartArea)"/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round"/>
      {points.map((p,i)=>(
        <circle key={i} cx={toX(i)} cy={toY(p.score)} r={hoveredIdx===i?5.5:3}
          fill={p.crisis?color:"#4B7AC7"} stroke={hoveredIdx===i?"#fff":"transparent"} strokeWidth="1.5"
          style={{cursor:"pointer",transition:"r 0.1s"}}
          onMouseEnter={()=>onHover&&onHover(i)}/>
      ))}
      {hoveredIdx!==null && hoveredIdx!==undefined && points[hoveredIdx] && (()=>{
        const p=points[hoveredIdx], cx=toX(hoveredIdx), cy=toY(p.score);
        const flip=cx>W*0.65;
        return (
          <g>
            <rect x={flip?cx-80:cx+6} y={cy-18} width={76} height={36}
              rx="4" fill="rgba(5,8,18,0.95)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            <text x={flip?cx-42:cx+44} y={cy-4} fontSize="9" fill="rgba(255,255,255,0.45)"
              textAnchor="middle" fontFamily={mono}>{p.period||p.p}</text>
            <text x={flip?cx-42:cx+44} y={cy+10} fontSize="14" fontWeight="600"
              fill={p.crisis?color:"#4B7AC7"} textAnchor="middle" fontFamily={mono}>{p.score}</text>
          </g>
        );
      })()}
      {points.map((p,i)=>{
        if(i%Math.ceil(points.length/8)!==0) return null;
        return(
          <text key={i} x={toX(i)} y={PT+cH+14} fontSize="7" fill="rgba(255,255,255,0.22)"
            textAnchor="middle" fontFamily={mono}>{(p.period||p.p||"").replace(" ","'")}</text>
        );
      })}
    </svg>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  { id:"screener",  label:"All Banks",       icon:"⊞" },
  { id:"heatmap",   label:"India Heatmap",    icon:"🗺" },
  { id:"scorecard", label:"Scorecard",        icon:"◎" },
  { id:"compare",   label:"Compare",          icon:"⇌" },
  { id:"trend",     label:"Trend & Forecast", icon:"⟋" },
  { id:"investor",  label:"My Investment",    icon:"₹" },
  { id:"crisis",    label:"Crisis Replay",    icon:"⚑" },
];

function HeatmapView() {
  return (
    <div>
      <Label>Systemic Risk Heatmap</Label>
      <h2 style={{margin:"0 0 20px",fontSize:20,fontWeight:600,fontFamily:sans,color:"#fff"}}>
        Regional Bank Concentration & Risk
      </h2>
      <div style={{marginBottom: 20, fontSize: 13, color: "#E2E8F0", lineHeight: 1.6, maxWidth: 800}}>
        This interactive map highlights structural and regional vulnerabilities across the Indian banking ecosystem. South Indian regional banks are currently showing rising stress levels due to MSME defaults.
      </div>
      <Card style={{padding: 0, overflow: "hidden"}}>
         <IndiaMap />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 1 — ALL BANKS SCREENER
// ═══════════════════════════════════════════════════════════════════════════════
function Screener({ onSelectBank }) {
  const { data, loading, error } = useFetch(`${API}/banks`, []);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("asc");

  const risks = ["All","Safe","Caution","At-Risk","Critical"];

  const rows = (data||[])
    .filter(b => b.bank_name.toLowerCase().includes(query.toLowerCase()))
    .filter(b => riskFilter==="All" || b.risk_label===riskFilter)
    .sort((a,b) => {
      const av = sortKey==="bank_name" ? a.bank_name : a[sortKey];
      const bv = sortKey==="bank_name" ? b.bank_name : b[sortKey];
      if (typeof av === "string") return sortDir==="asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir==="asc" ? av-bv : bv-av;
    });

  const toggleSort = key => {
    if (sortKey===key) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const riskCounts = (data||[]).reduce((acc,b)=>{
    acc[b.risk_label]=(acc[b.risk_label]||0)+1; return acc;
  },{});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <Label>Portfolio Overview</Label>
          <h2 style={{margin:0,fontSize:20,fontWeight:600,fontFamily:sans,color:"#fff"}}>Indian Banks & NBFCs</h2>
          <p style={{margin:"4px 0 0",fontSize:12,color:"rgba(255,255,255,0.35)",fontFamily:sans}}>
            {data?.length||0} institutions · FinGuard scored
          </p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Safe","Caution","At-Risk","Critical"].map(r=>(
            <div key={r} style={{
              background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.08)",
              borderRadius:8,padding:"8px 12px",minWidth:70
            }}>
              <div style={{fontSize:18,fontWeight:600,color:RISK_META[r].color,fontFamily:mono,lineHeight:1}}>
                {riskCounts[r]||0}
              </div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:3,fontFamily:mono,letterSpacing:1}}>
                {r.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input
          placeholder="Search bank…" value={query}
          onChange={e=>setQuery(e.target.value)}
          style={{
            flex:1,minWidth:180,padding:"8px 12px",
            background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.1)",
            borderRadius:8,color:"#fff",fontSize:12,fontFamily:mono,outline:"none"
          }}
        />
        {risks.map(r=>(
          <button key={r} onClick={()=>setRiskFilter(r)} style={{
            padding:"7px 12px",borderRadius:7,fontSize:10,fontFamily:mono,cursor:"pointer",
            border: riskFilter===r
              ? `0.5px solid ${r==="All"?"rgba(255,255,255,0.4)":RISK_META[r]?.color||"#fff"}`
              : "0.5px solid rgba(255,255,255,0.08)",
            background: riskFilter===r ? "rgba(255,255,255,0.07)" : "transparent",
            color: riskFilter===r
              ? (r==="All"?"#fff":RISK_META[r]?.color)
              : "rgba(255,255,255,0.4)",
          }}>{r}</button>
        ))}
      </div>

      {loading && <Spinner/>}
      {error && <ErrorMsg msg={`Could not load banks: ${error}`}/>}
      {!loading && !error && (
        <Card style={{padding:0,overflow:"hidden",background:"rgba(4,6,12,0.6)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.05)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  {[
                    {key:"bank_name",label:"Institution"},
                    {key:"score",label:"Health Score"},
                    {key:"risk_label",label:"Risk Tier"},
                    {key:"crisis_probability",label:"Crisis Prob"},
                    {key:"action",label:""},
                  ].map(col=>(
                    <th key={col.key} onClick={()=>col.key!=="action"&&toggleSort(col.key)}
                      style={{
                        padding:"16px 20px",textAlign:"left",fontSize:10,letterSpacing:1.5,
                        color:"rgba(255,255,255,0.4)",fontFamily:mono,fontWeight:600,
                        cursor:col.key!=="action"?"pointer":"default",
                        whiteSpace:"nowrap",
                        position:"sticky", top:0, zIndex:10, backdropFilter:"blur(8px)"
                      }}>
                      {col.label.toUpperCase()}
                      {sortKey===col.key && <span style={{marginLeft:6,color:"#1D9E75"}}>{sortDir==="asc"?"↑":"↓"}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((b,i)=>{
                  const rm = RISK_META[b.risk_label]||RISK_META["Caution"];
                  return (
                    <tr key={b.bank_name} style={{
                      borderBottom:"1px solid rgba(255,255,255,0.02)",
                      background:"transparent",
                      transition:"all 0.2s ease",cursor:"pointer",
                    }}
                    onMouseEnter={e=>{
                      e.currentTarget.style.background="rgba(255,255,255,0.03)";
                      e.currentTarget.style.boxShadow=`inset 2px 0 0 ${rm.color}`;
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.background="transparent";
                      e.currentTarget.style.boxShadow="none";
                    }}
                    >
                      <td style={{padding:"16px 20px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:rm.color,boxShadow:`0 0 8px ${rm.color}80`}}/>
                          <div>
                            <div style={{fontFamily:sans,fontSize:13,color:"#fff",fontWeight:600,letterSpacing:0.2}}>
                              {b.bank_name.replace(/ BANK$/,"").replace(/^(.*)/,s=>s.charAt(0)+s.slice(1).toLowerCase())}
                            </div>
                            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginTop:2}}>
                              {b.bank_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"16px 20px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{
                            width:36,height:36,borderRadius:"50%",
                            background:`conic-gradient(${rm.color} 0% ${b.score}%, rgba(255,255,255,0.05) ${b.score}%)`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            boxShadow:`0 0 12px ${rm.color}30`
                          }}>
                            <div style={{
                              width:26,height:26,borderRadius:"50%",background:"#04060c",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:10,fontWeight:700,color:rm.color,fontFamily:mono
                            }}>
                              {Math.round(b.score)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"16px 20px"}}>
                        <RiskBadge label={b.risk_label}/>
                      </td>
                      <td style={{padding:"16px 20px",fontFamily:mono,fontSize:13,fontWeight:600,
                        color:b.crisis_probability>60?"#E24B4A":b.crisis_probability>30?"#EF9F27":"#1D9E75"}}>
                        {b.crisis_probability?.toFixed(1)}%
                      </td>
                      <td style={{padding:"16px 20px",textAlign:"right"}}>
                        <button onClick={()=>onSelectBank(b.bank_name)}
                          style={{
                            padding:"8px 16px",borderRadius:8,fontSize:11,fontFamily:mono,fontWeight:600,cursor:"pointer",
                            background:`${rm.color}15`,border:`1px solid ${rm.color}30`,
                            color:rm.color,transition:"all 0.2s"
                          }}
                          onMouseEnter={e=>{e.currentTarget.style.background=`${rm.color}30`}}
                          onMouseLeave={e=>{e.currentTarget.style.background=`${rm.color}15`}}
                        >
                          Deep Dive →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2 — BANK SCORECARD
// ═══════════════════════════════════════════════════════════════════════════════
function Scorecard({ bank, setBank }) {
  const bankSlug = bank?.replace(/ /g,"-").toLowerCase();
  const { data:score, loading:sl, error:se } = useFetch(bank?`${API}/bank/${bankSlug}/score`:null,[bank]);
  const { data:shap, loading:hl } = useFetch(bank?`${API}/bank/${bankSlug}/shap`:null,[bank]);
  const { data:ratios, loading:rl } = useFetch(bank?`${API}/bank/${bankSlug}/ratios`:null,[bank]);
  const { data:news } = useFetch(bank?`${API}/bank/${bankSlug}/news`:null,[bank]);
  const { data:banks } = useFetch(`${API}/banks`,[]);

  const loading = sl||hl||rl;

  const sentimentColor = s =>
    s==="Positive"?"#1D9E75":s==="Negative"?"#E24B4A":"#BA7517";

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <Label>Bank Scorecard</Label>
          <select value={bank||""} onChange={e=>setBank(e.target.value)} style={{
            background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
            borderRadius:8,color:"#fff",fontSize:13,fontFamily:mono,padding:"8px 12px",
            outline:"none",cursor:"pointer",minWidth:240
          }}>
            <option value="">Select a bank…</option>
            {(banks||[]).map(b=>(
              <option key={b.bank_name} value={b.bank_name}>{b.bank_name}</option>
            ))}
          </select>
        </div>
        {score && <RiskBadge label={score.risk_label}/>}
      </div>

      {!bank && (
        <Card style={{textAlign:"center",padding:48,color:"rgba(255,255,255,0.3)",fontFamily:sans,fontSize:14}}>
          Select a bank above to view its full health scorecard
        </Card>
      )}
      {loading && <Spinner/>}
      {se && <ErrorMsg msg={se}/>}

      {score && !loading && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:24}}>
          
          {/* HERO HEADER */}
          <div style={{gridColumn:"1/-1", display:"flex", alignItems:"center", gap:32, background:"linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", padding:"32px 40px", borderRadius:24, border:"1px solid rgba(255,255,255,0.05)", boxShadow:"0 16px 40px rgba(0,0,0,0.3)"}}>
            <ScoreRing score={score.score} size={140} />
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <div style={{fontSize:12,fontFamily:mono,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginBottom:4}}>
                {score.year} {score.quarter} ASSESSMENT
              </div>
              <div style={{fontSize:36,fontWeight:700,color:"#fff",letterSpacing:-0.5,marginBottom:16,fontFamily:sans}}>
                {bank}
              </div>
              <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                <RiskBadge label={score.risk_label}/>
                <div style={{padding:"6px 14px",borderRadius:20,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.05)",fontSize:12,fontFamily:mono,color:"rgba(255,255,255,0.6)",display:"flex",alignItems:"center"}}>
                  CRISIS PROBABILITY: <span style={{marginLeft:8,fontWeight:700,color:score.crisis_probability>60?"#E24B4A":score.crisis_probability>30?"#EF9F27":"#1D9E75"}}>{score.crisis_probability?.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* COL 1: NEWS & SECTOR (1/3 width) */}
          <div style={{display:"flex",flexDirection:"column",gap:24,gridColumn:"1/2"}}>
            <Card style={{flex:1}}>
              <Label>News Sentiment (FinBERT)</Label>
              {!news && <div style={{color:"rgba(255,255,255,0.25)",fontSize:12,fontFamily:mono}}>Loading…</div>}
              {news && news.error && <div style={{color:"rgba(255,255,255,0.25)",fontSize:11,fontFamily:sans}}>{news.error}</div>}
              {news && !news.error && (
                <>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"12px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.03)"}}>
                    <div style={{
                      width:12,height:12,borderRadius:"50%",
                      background:sentimentColor(news.overall_sentiment),
                      boxShadow:`0 0 10px ${sentimentColor(news.overall_sentiment)}`
                    }}/>
                    <span style={{fontFamily:mono,fontSize:14,fontWeight:600,color:sentimentColor(news.overall_sentiment)}}>
                      {news.overall_sentiment}
                    </span>
                    <span style={{fontFamily:mono,fontSize:11,color:"rgba(255,255,255,0.4)",marginLeft:"auto"}}>
                      Score: {news.sentiment_score}
                    </span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {(news.headlines||[]).slice(0,4).map((h,i)=>(
                      <div key={i} style={{
                        display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,
                        paddingBottom:12,borderBottom:"1px dashed rgba(255,255,255,0.05)"
                      }}>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontFamily:sans,lineHeight:1.5}}>
                          {h.title}
                        </div>
                        <span style={{
                          fontSize:10,padding:"3px 8px",borderRadius:12,whiteSpace:"nowrap",
                          background:sentimentColor(h.sentiment)+"15", border:`1px solid ${sentimentColor(h.sentiment)}30`,
                          color:sentimentColor(h.sentiment),fontFamily:mono,fontWeight:600
                        }}>{h.sentiment}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Sector Exposure Visualization */}
            <Card>
              <Label>Sector Exposure</Label>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div style={{marginBottom:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:mono,color:"rgba(255,255,255,0.6)",marginBottom:4}}><span>Real Estate</span><span>31%</span></div>
                  <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{width:"31%",background:"#E24B4A",height:"100%",borderRadius:3}}/></div>
                </div>
                <div style={{marginBottom:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:mono,color:"rgba(255,255,255,0.6)",marginBottom:4}}><span>MSME</span><span>22%</span></div>
                  <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{width:"22%",background:"#EF9F27",height:"100%",borderRadius:3}}/></div>
                </div>
                <div style={{marginBottom:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:mono,color:"rgba(255,255,255,0.6)",marginBottom:4}}><span>Infrastructure</span><span>18%</span></div>
                  <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{width:"18%",background:"#1D9E75",height:"100%",borderRadius:3}}/></div>
                </div>
                <div style={{padding:12,background:"rgba(226,75,74,0.05)",borderLeft:"2px solid #E24B4A",borderRadius:4}}>
                  <div style={{fontSize:11,color:"#fff",lineHeight:1.5}}>
                    High <span style={{color:"#E24B4A",fontFamily:mono}}>Real Estate & Infra</span> concentration historically increases distress probability.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* COL 2 & 3: RATIOS, SHAP, TIMELINE (2/3 width) */}
          <div style={{display:"flex",flexDirection:"column",gap:24,gridColumn:"2/-1"}}>
            
            {/* Ratios vs industry */}
            <Card>
              <Label>Financial Ratios vs Industry Average</Label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
                {(ratios?.ratios||[]).map(r=>{
                  const frac = Math.min(Math.abs(r.bank_value)/Math.max(Math.abs(r.industry_avg)*1.5,0.1),1);
                  const avgFrac = Math.min(1, r.industry_avg / (r.industry_avg * 1.5));
                  const isGoodHigh = ["car","roa","liquidity_coverage"].includes(r.ratio);
                  const bad = isGoodHigh ? r.bank_value < r.industry_avg : r.bank_value > r.industry_avg;
                  const barColor = bad ? "#E24B4A" : "#1D9E75";
                  return (
                    <div key={r.ratio}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontFamily:mono}}>
                          {FEATURE_LABELS[r.ratio]||r.ratio}
                        </span>
                        <div style={{display:"flex",gap:12}}>
                          <span style={{fontSize:11,color:barColor,fontFamily:mono,fontWeight:600}}>
                            {r.bank_value?.toFixed(2)}
                          </span>
                          <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontFamily:mono}}>
                            avg {r.industry_avg?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div style={{position:"relative",height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
                        <div style={{
                          position:"absolute",left:0,top:0,height:"100%",borderRadius:3,
                          width:`${frac*100}%`,background:barColor,opacity:0.85,transition:"width 0.5s"
                        }}/>
                        <div style={{
                          position:"absolute",top:-2,height:10,width:2,borderRadius:1,
                          left:`${avgFrac*100}%`,background:"rgba(255,255,255,0.4)"
                        }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* SHAP EXPLANATION */}
            {shap && shap.shap_values && (
              <Card>
                <Label>Score Drivers (Why is the score what it is?)</Label>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:16,lineHeight:1.6}}>
                  <strong>Powered by SHAP</strong><br/>
                  This explains exactly <strong>which financial ratios affected predictions</strong> and <strong>why a bank received a certain score</strong>, so users can fully understand the AI decision.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:16}}>
                  {Object.entries(shap.shap_values).slice(0, 6).map(([feat, val])=>(
                    <div key={feat}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:mono,color:"rgba(255,255,255,0.7)",marginBottom:6}}>
                        <span>{FEATURE_LABELS[feat]||feat}</span>
                        <span style={{color:val>0?"#1D9E75":"#E24B4A",fontWeight:600}}>
                          {val>0?"+":""}{val.toFixed(4)} pts
                        </span>
                      </div>
                      <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{
                          height:"100%", borderRadius:3,
                          background:val>0?"#1D9E75":"#E24B4A",
                          width:`${Math.min(Math.abs(val)*200,100)}%`,
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Governance Risk Timeline */}
            <Card>
              <Label>Governance Risk Timeline & Causal Storytelling</Label>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:12,paddingLeft:8,borderLeft:"1.5px solid rgba(255,255,255,0.1)",marginLeft:8}}>
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",left:-13,top:4,width:8,height:8,borderRadius:"50%",background:"#E24B4A"}}/>
                  <div style={{fontSize:10,fontFamily:mono,color:"rgba(255,255,255,0.3)"}}>Q3 2018</div>
                  <div style={{fontSize:13,color:"#fff",fontWeight:500}}>CEO Resignation Announced</div>
                  <div style={{fontSize:11,color:"#E24B4A",fontFamily:mono}}>↓ Negative Sentiment Spike (Score: -0.84)</div>
                </div>
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",left:-13,top:4,width:8,height:8,borderRadius:"50%",background:"#EF9F27"}}/>
                  <div style={{fontSize:10,fontFamily:mono,color:"rgba(255,255,255,0.3)"}}>Q4 2018</div>
                  <div style={{fontSize:13,color:"#fff",fontWeight:500}}>Audit highlights massive NPA divergence</div>
                  <div style={{fontSize:11,color:"#EF9F27",fontFamily:mono}}>↓ FinGuard Score Deterioration Accelerated (-15 pts)</div>
                </div>
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",left:-13,top:4,width:8,height:8,borderRadius:"50%",background:"#1D9E75"}}/>
                  <div style={{fontSize:10,fontFamily:mono,color:"rgba(255,255,255,0.3)"}}>Q1 2019</div>
                  <div style={{fontSize:13,color:"#fff",fontWeight:500}}>RBI imposes prompt corrective action (PCA)</div>
                  <div style={{fontSize:11,color:"#1D9E75",fontFamily:mono}}>✓ Interventions started. Liquidity crisis managed.</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Understand This Score - FULL WIDTH BOTTOM */}
          <Card style={{gridColumn:"1/-1"}}>
            <Label>Understand This Score (Financial Literacy)</Label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:24,marginTop:8}}>
              <div style={{background:"rgba(255,255,255,0.02)",padding:16,borderRadius:12,border:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#4B7AC7",fontFamily:mono,marginBottom:8}}>NPA Ratio (Non-Performing Assets)</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>Loans that have stopped generating income. <strong>Dangerous Range:</strong> Above 5% indicates severe distress.</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.02)",padding:16,borderRadius:12,border:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#1D9E75",fontFamily:mono,marginBottom:8}}>CAR (Capital Adequacy Ratio)</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>A bank's capital vs its risk. RBI requires min 9%. <strong>Dangerous Range:</strong> Approaching 9% means capital starvation.</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.02)",padding:16,borderRadius:12,border:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#EF9F27",fontFamily:mono,marginBottom:8}}>Liquidity Coverage</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>High Quality Liquid Assets vs outflows over 30 days. <strong>Dangerous Range:</strong> Below 100% means extreme vulnerability to bank runs.</div>
              </div>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 3 — COMPARE
// ═══════════════════════════════════════════════════════════════════════════════
function Compare() {
  const { data:banks } = useFetch(`${API}/banks`,[]);
  const [selected, setSelected] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleBank = name => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(b=>b!==name) : prev.length<4 ? [...prev,name] : prev
    );
  };

  const runCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true); setError(null);
    try {
      const q = selected.join(",");
      const r = await fetch(`${API}/compare?banks=${encodeURIComponent(q)}`, { headers: { "ngrok-skip-browser-warning": "true" } });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      setCompareData(await r.json());
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const RATIO_KEYS = ["npa_ratio","car","roa","liquidity_coverage","debt_to_equity","cost_to_income"];
  const GOOD_HIGH = ["car","roa","liquidity_coverage"];

  const bestFor = (key) => {
    if(!compareData) return null;
    const vals = compareData.map(b=>b.ratios[key]);
    const best = GOOD_HIGH.includes(key) ? Math.max(...vals) : Math.min(...vals);
    return compareData.find(b=>b.ratios[key]===best)?.bank_name;
  };

  const PALETTE = ["#4B7AC7","#1D9E75","#EF9F27","#D4537E"];

  return (
    <div>
      <Label>Side-by-Side Comparison</Label>
      <h2 style={{margin:"0 0 20px",fontSize:20,fontWeight:600,fontFamily:sans,color:"#fff"}}>
        Compare Banks
      </h2>

      {/* Bank picker */}
      <Card style={{marginBottom:16}}>
        <Label>Select 2–4 Banks to Compare</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {(banks||[]).map(b=>{
            const active = selected.includes(b.bank_name);
            const idx = selected.indexOf(b.bank_name);
            return (
              <button key={b.bank_name} onClick={()=>toggleBank(b.bank_name)} style={{
                padding:"5px 11px",borderRadius:6,fontSize:10,fontFamily:mono,cursor:"pointer",
                border:active?`0.5px solid ${PALETTE[idx]||"#fff"}`:"0.5px solid rgba(255,255,255,0.08)",
                background:active?`${PALETTE[idx]||"#fff"}18`:"transparent",
                color:active?PALETTE[idx]||"#fff":"rgba(255,255,255,0.4)",
                transition:"all 0.2s",
              }}>
                {b.bank_name}
              </button>
            );
          })}
        </div>
        <button onClick={runCompare} disabled={selected.length<2||loading} style={{
          padding:"9px 20px",borderRadius:8,fontSize:11,fontFamily:mono,cursor:"pointer",
          background:selected.length>=2?"rgba(75,122,199,0.2)":"rgba(255,255,255,0.04)",
          border:selected.length>=2?"0.5px solid #4B7AC7":"0.5px solid rgba(255,255,255,0.08)",
          color:selected.length>=2?"#7EB3F5":"rgba(255,255,255,0.3)",
        }}>
          {loading?"Comparing…":`Compare ${selected.length} Bank${selected.length!==1?"s":""}`}
        </button>
        {selected.length<2 && <span style={{marginLeft:12,fontSize:10,color:"rgba(255,255,255,0.25)",fontFamily:mono}}>
          Select at least 2
        </span>}
      </Card>

      {error && <ErrorMsg msg={error}/>}

      {compareData && !loading && (
        <>
          {/* Score cards */}
          <div style={{display:"grid",gridTemplateColumns:`repeat(${compareData.length},1fr)`,gap:12,marginBottom:16}}>
            {compareData.map((b,i)=>(
              <Card key={b.bank_name} style={{textAlign:"center",borderTop:`2px solid ${PALETTE[i]}`}}>
                <div style={{fontSize:11,fontWeight:500,color:"#fff",fontFamily:sans,marginBottom:8,lineHeight:1.4}}>
                  {b.bank_name}
                </div>
                <ScoreRing score={b.score} size={60}/>
                <div style={{marginTop:8}}><RiskBadge label={b.risk_label}/></div>
              </Card>
            ))}
          </div>

          {/* Ratio comparison table */}
          <Card style={{padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.07)",background:"rgba(0,0,0,0.2)"}}>
                  <th style={{padding:"10px 14px",textAlign:"left",fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.3)",fontFamily:mono,fontWeight:400}}>
                    RATIO
                  </th>
                  {compareData.map((b,i)=>(
                    <th key={b.bank_name} style={{padding:"10px 14px",textAlign:"right",fontSize:9,letterSpacing:1,color:PALETTE[i],fontFamily:mono,fontWeight:400}}>
                      {b.bank_name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RATIO_KEYS.map(key=>{
                  const winner = bestFor(key);
                  return (
                    <tr key={key} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                      <td style={{padding:"10px 14px",fontFamily:mono,fontSize:11,color:"rgba(255,255,255,0.45)"}}>
                        {FEATURE_LABELS[key]}
                      </td>
                      {compareData.map((b,i)=>{
                        const isWinner = b.bank_name===winner;
                        return (
                          <td key={b.bank_name} style={{
                            padding:"10px 14px",textAlign:"right",fontFamily:mono,fontSize:12,fontWeight:500,
                            color:isWinner?PALETTE[i]:"rgba(255,255,255,0.5)",
                            background:isWinner?`${PALETTE[i]}0d`:"transparent",
                          }}>
                            {b.ratios[key]?.toFixed(2)}
                            {isWinner && <span style={{marginLeft:4,fontSize:9}}>★</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 4 — TREND & FORECAST EXPLORER
// ═══════════════════════════════════════════════════════════════════════════════
function TrendExplorer({ bank, setBank }) {
  const bankSlug = bank?.replace(/ /g,"-").toLowerCase();
  const { data:banks } = useFetch(`${API}/banks`,[]);
  const { data:trend, loading:tl, error:te } = useFetch(bank?`${API}/bank/${bankSlug}/trend`:null,[bank]);
  const { data:forecast, loading:fl } = useFetch(bank?`${API}/bank/${bankSlug}/forecast`:null,[bank]);
  const [hoveredPt, setHoveredPt] = useState(null);

  const loading = tl||fl;

  const chartPoints = (trend?.history||[]).map(h=>({
    period:`${h.year} ${h.quarter}`,
    score:h.score,
    crisis:!!h.crisis_label
  }));

  const trendColor = trend?.lstm_trend?.trend_direction === "Improving" ? "#1D9E75" : "#E24B4A";

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <Label>Trend & Forecast Explorer</Label>
          <select value={bank||""} onChange={e=>setBank(e.target.value)} style={{
            background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
            borderRadius:8,color:"#fff",fontSize:13,fontFamily:mono,padding:"8px 12px",
            outline:"none",cursor:"pointer",minWidth:240
          }}>
            <option value="">Select a bank…</option>
            {(banks||[]).map(b=>(<option key={b.bank_name} value={b.bank_name}>{b.bank_name}</option>))}
          </select>
        </div>
      </div>

      {!bank && (
        <Card style={{textAlign:"center",padding:48,color:"rgba(255,255,255,0.3)",fontFamily:sans,fontSize:14}}>
          Select a bank to explore its score trend and 2-quarter forecast
        </Card>
      )}

      {loading && <Spinner/>}
      {te && <ErrorMsg msg={te}/>}

      {trend && forecast && !loading && (
        <>
          {/* LSTM + Forecast summary pills */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
            {[
              {
                label:"LSTM Trend",
                value:trend.lstm_trend?.trend_direction||"—",
                sub:trend.lstm_trend?.trend_confidence,
                color:trendColor,
                icon:trend.lstm_trend?.trend_direction==="Improving"?"↑":"↓"
              },
              {
                label:"Current Score",
                value:Math.round(forecast.current_score),
                sub:forecast.current_label,
                color:RISK_META[forecast.current_label]?.color||"#fff"
              },
              {
                label:"Q1 Forecast",
                value:Math.round(forecast.q1_forecast),
                sub:forecast.q1_label,
                color:RISK_META[forecast.q1_label]?.color||"#fff"
              },
              {
                label:"Q2 Forecast",
                value:Math.round(forecast.q2_forecast),
                sub:forecast.q2_label,
                color:RISK_META[forecast.q2_label]?.color||"#fff"
              },
            ].map(m=>(
              <Card key={m.label}>
                <Label>{m.label}</Label>
                <div style={{fontSize:26,fontWeight:600,fontFamily:mono,color:m.color,lineHeight:1}}>
                  {m.icon&&<span style={{marginRight:4}}>{m.icon}</span>}{m.value}
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginTop:4}}>{m.sub}</div>
              </Card>
            ))}
          </div>

          {/* Big chart */}
          <Card style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:"#fff",fontFamily:sans}}>{bank} — Score History</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginTop:2}}>
                  {trend.lstm_trend?.years_analysed}
                </div>
              </div>
              {forecast.will_cross_threshold && (
                <div style={{
                  padding:"6px 12px",borderRadius:8,
                  background:"rgba(226,75,74,0.12)",border:"0.5px solid rgba(226,75,74,0.3)",
                  fontSize:10,color:"#F09595",fontFamily:mono
                }}>
                  ⚠ Threshold crossing predicted
                </div>
              )}
            </div>

            <BigChart
              points={chartPoints}
              color={trendColor}
              onHover={setHoveredPt}
              hoveredIdx={hoveredPt}
            />

            {/* Forecast extension */}
            <div style={{
              marginTop:12,padding:"12px 16px",borderRadius:8,
              background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.06)",
              display:"flex",gap:24,alignItems:"center"
            }}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:mono}}>ARIMA FORECAST →</span>
              {[
                {label:"Next Q",val:forecast.q1_forecast,lbl:forecast.q1_label},
                {label:"+2 Q",val:forecast.q2_forecast,lbl:forecast.q2_label},
              ].map(f=>{
                const rm = RISK_META[f.lbl]||RISK_META["Caution"];
                return (
                  <div key={f.label} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{
                      width:36,height:36,borderRadius:"50%",
                      background:`conic-gradient(${rm.color} 0% ${f.val}%, rgba(255,255,255,0.07) ${f.val}%)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <div style={{
                        width:26,height:26,borderRadius:"50%",background:"#0a0c14",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:9,fontWeight:600,color:rm.color,fontFamily:mono
                      }}>{Math.round(f.val)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:mono}}>{f.label}</div>
                      <RiskBadge label={f.lbl}/>
                    </div>
                  </div>
                );
              })}
              <div style={{marginLeft:"auto",fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:mono}}>
                Direction: <span style={{color:forecast.direction==="Rising"?"#1D9E75":"#E24B4A"}}>
                  {forecast.direction}
                </span>
              </div>
            </div>
          </Card>

          {/* History table */}
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",
              fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.3)",fontFamily:mono}}>
              QUARTERLY HISTORY
            </div>
            <div style={{maxHeight:240,overflowY:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <tbody>
                  {(trend.history||[]).slice().reverse().map((h,i)=>{
                    const rm = RISK_META[h.risk_label]||RISK_META["Caution"];
                    const s = h.score;
                    const rl = s>=80?"Safe":s>=60?"Caution":s>=40?"At-Risk":"Critical";
                    return (
                      <tr key={i} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                        <td style={{padding:"8px 16px",fontFamily:mono,fontSize:11,color:"rgba(255,255,255,0.4)"}}>
                          {h.year} {h.quarter}
                        </td>
                        <td style={{padding:"8px 16px",fontFamily:mono,fontSize:12,fontWeight:600,
                          color:RISK_META[rl]?.color||"#fff"}}>
                          {h.score?.toFixed(1)}
                        </td>
                        <td style={{padding:"8px 16px"}}><RiskBadge label={rl}/></td>
                        {h.crisis_label===1 && (
                          <td style={{padding:"8px 16px",fontSize:10,color:"#E24B4A",fontFamily:mono}}>
                            ⚠ Crisis flagged
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 5 — PERSONAL INVESTMENT RISK
// ═══════════════════════════════════════════════════════════════════════════════
function InvestorTool() {
  const { data:banks } = useFetch(`${API}/banks`,[]);
  const [bank, setBank] = useState("");
  const [type, setType] = useState("fd");
  const [amount, setAmount] = useState("");
  const [shares, setShares] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const DICGC_LIMIT = 500000;

  const bankData = (banks||[]).find(b=>b.bank_name===bank);

  const analyze = () => {
    if (!bank || !bankData) return;
    setLoading(true);
    setTimeout(()=>{
      const fdAmt = parseFloat(amount)||0;
      const shareCount = parseFloat(shares)||0;
      const covered = Math.min(fdAmt, DICGC_LIMIT);
      const uncovered = Math.max(0, fdAmt - DICGC_LIMIT);
      const score = bankData.score;
      const risk = bankData.risk_label;
      const keyRatio = score < 60 ? "NPA Ratio" : score < 80 ? "CAR" : "Liquidity";
      
      let dropTo40Impact = "";
      if(type === "fd") {
        if(score >= 80) {
          dropTo40Impact = `Your ₹${(fdAmt/100000).toFixed(1)} lakh FD is extremely safe right now. Even if conditions drastically change, DICGC insures up to ₹5 lakh.`;
        } else if (score >= 60) {
          dropTo40Impact = `Current deterioration is moderate but worsening. Your ₹${(fdAmt/100000).toFixed(1)} lakh FD remains insured under DICGC up to ₹5 lakh. Uninsured amounts should be monitored.`;
        } else {
          dropTo40Impact = `High risk of capital lock-in if RBI imposes a moratorium. While DICGC guarantees up to ₹5 lakh, processing claims takes months. Uninsured ₹${(uncovered/100000).toFixed(1)} lakh is at severe risk.`;
        }
      } else {
        dropTo40Impact = `Equity shareholders are wiped out first during a collapse (e.g. YES Bank AT1 bonds/equity). A critical score drop means your shares could lose 80-90% of their value overnight.`;
      }

      setResult({ covered, uncovered, keyRatio, dropTo40Impact, score, risk, fdAmt, shareCount });
      setLoading(false);
    },400);
  };

  const rm = bankData ? RISK_META[bankData.risk_label]||RISK_META["Caution"] : null;

  return (
    <div>
      <Label>Personal Investment Risk Connector</Label>
      <h2 style={{margin:"0 0 20px",fontSize:20,fontWeight:600,fontFamily:sans,color:"#fff"}}>
        What Does My Money Risk?
      </h2>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <Label>Your Investment</Label>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:mono,marginBottom:6}}>Bank</div>
            <select value={bank} onChange={e=>{setBank(e.target.value);setResult(null);}} style={{
              width:"100%",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
              borderRadius:8,color:"#fff",fontSize:12,fontFamily:mono,padding:"9px 12px",outline:"none",cursor:"pointer"
            }}>
              <option value="">Select a bank…</option>
              {(banks||[]).map(b=>(<option key={b.bank_name} value={b.bank_name}>{b.bank_name}</option>))}
            </select>
          </div>

          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["fd","shares"].map(t=>(
              <button key={t} onClick={()=>{setType(t);setResult(null);}} style={{
                flex:1,padding:"8px",borderRadius:7,fontSize:11,fontFamily:mono,cursor:"pointer",
                border:type===t?"0.5px solid #4B7AC7":"0.5px solid rgba(255,255,255,0.08)",
                background:type===t?"rgba(75,122,199,0.15)":"transparent",
                color:type===t?"#7EB3F5":"rgba(255,255,255,0.4)",
              }}>
                {t==="fd"?"Fixed Deposit":"Shares"}
              </button>
            ))}
          </div>

          {type==="fd" && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:mono,marginBottom:6}}>Amount (₹)</div>
              <input
                type="number" placeholder="e.g. 200000" value={amount}
                onChange={e=>{setAmount(e.target.value);setResult(null);}}
                style={{
                  width:"100%",boxSizing:"border-box",padding:"9px 12px",
                  background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
                  borderRadius:8,color:"#fff",fontSize:12,fontFamily:mono,outline:"none"
                }}
              />
            </div>
          )}

          {type==="shares" && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:mono,marginBottom:6}}>Number of Shares</div>
              <input
                type="number" placeholder="e.g. 500" value={shares}
                onChange={e=>{setShares(e.target.value);setResult(null);}}
                style={{
                  width:"100%",boxSizing:"border-box",padding:"9px 12px",
                  background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
                  borderRadius:8,color:"#fff",fontSize:12,fontFamily:mono,outline:"none"
                }}
              />
            </div>
          )}

          <button onClick={analyze} disabled={!bank||loading} style={{
            width:"100%",padding:"10px",borderRadius:8,fontSize:12,fontFamily:mono,
            cursor:bank?"pointer":"not-allowed",
            background:bank?"rgba(29,158,117,0.2)":"rgba(255,255,255,0.03)",
            border:bank?"0.5px solid #1D9E75":"0.5px solid rgba(255,255,255,0.07)",
            color:bank?"#1D9E75":"rgba(255,255,255,0.25)",fontWeight:500
          }}>
            {loading?"Analysing…":"Analyse Risk →"}
          </button>

          {bankData && rm && (
            <div style={{
              marginTop:16,padding:"12px",borderRadius:8,
              background:rm.bg,border:`0.5px solid ${rm.border}`,
              display:"flex",alignItems:"center",gap:12
            }}>
              <ScoreRing score={bankData.score} size={50}/>
              <div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontFamily:sans,marginBottom:4}}>
                  Current FinGuard Score
                </div>
                <RiskBadge label={bankData.risk_label}/>
              </div>
            </div>
          )}
        </Card>

        {/* Result */}
        <div>
          {!result && !loading && (
            <Card style={{height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",
              alignItems:"center",textAlign:"center",padding:32,boxSizing:"border-box"}}>
              <div style={{fontSize:32,marginBottom:12}}>₹</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",fontFamily:sans,lineHeight:1.7}}>
                Select a bank and enter your investment to see personalised risk analysis
              </div>
            </Card>
          )}
          {loading && <Card style={{height:"100%"}}><Spinner/></Card>}
          {result && !loading && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {type==="fd" && (
                <Card style={{borderLeft:`3px solid ${result.uncovered>0?"#E24B4A":"#1D9E75"}`}}>
                  <Label>DICGC Insurance Coverage</Label>
                  <div style={{display:"flex",gap:16,marginBottom:12}}>
                    <div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginBottom:3}}>COVERED</div>
                      <div style={{fontSize:18,fontWeight:600,fontFamily:mono,color:"#1D9E75"}}>
                        ₹{result.covered.toLocaleString("en-IN")}
                      </div>
                    </div>
                    {result.uncovered>0 && (
                      <div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginBottom:3}}>UNCOVERED</div>
                        <div style={{fontSize:18,fontWeight:600,fontFamily:mono,color:"#E24B4A"}}>
                          ₹{result.uncovered.toLocaleString("en-IN")}
                        </div>
                      </div>
                    )}
                  </div>
                  {result.uncovered > 0 && (
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:sans,lineHeight:1.6}}>
                      While ₹{DICGC_LIMIT.toLocaleString("en-IN")} is strictly guaranteed, <span style={{color:"#E24B4A"}}>your remaining ₹{result.uncovered.toLocaleString("en-IN")} is exposed</span> if this bank faces moratorium.
                    </div>
                  )}
                  {result.uncovered === 0 && (
                    <div style={{fontSize:12,color:"#1D9E75",fontFamily:sans,lineHeight:1.6}}>
                      ✓ Your entire deposit is unconditionally insured. Even in the worst-case scenario, your principal is safe.
                    </div>
                  )}
                </Card>
              )}

              <Card style={{background:"rgba(255,255,255,0.03)"}}>
                <Label style={{color:"#7EB3F5"}}>Retail Investor Impact</Label>
                <div style={{fontSize:13,color:"#fff",fontFamily:sans,lineHeight:1.6}}>
                  {result.dropTo40Impact}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 6 — CRISIS REPLAY
// ═══════════════════════════════════════════════════════════════════════════════
function CrisisReplay() {
  const [sel, setSel] = useState(0);
  const [hovered, setHovered] = useState(null);
  const crisis = CRISES[sel];
  const lastScore = crisis.quarters[crisis.quarters.length-1].s;
  const warnIdx = crisis.quarters.findIndex(q=>q.w);
  const collapseIdx = crisis.quarters.findIndex(q=>q.collapse);
  const warnScore = warnIdx>=0 ? crisis.quarters[warnIdx].s : null;

  const chartPoints = crisis.quarters.map(q=>({
    period:q.p, score:q.s, crisis:q.c
  }));

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
        <div style={{
          width:8,height:8,borderRadius:"50%",background:"#E24B4A",
          boxShadow:"0 0 6px #E24B4A",animation:"pulseDot 2s infinite"
        }}/>
        <Label style={{marginBottom:0}}>FinGuard Crisis Intelligence</Label>
      </div>
      <h2 style={{margin:"0 0 6px",fontSize:20,fontWeight:600,fontFamily:sans,color:"#fff"}}>
        Historical Crisis Replay
      </h2>
      <p style={{margin:"0 0 20px",fontSize:12,color:"rgba(255,255,255,0.3)",fontFamily:sans}}>
        Retroactive validation — FinGuard would have flagged each collapse months before it happened
      </p>

      {/* Bank tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {CRISES.map((c,i)=>(
          <button key={c.id} onClick={()=>{setSel(i);setHovered(null);}} style={{
            padding:"7px 14px",borderRadius:6,fontSize:11,fontFamily:mono,cursor:"pointer",
            border:sel===i?`0.5px solid ${c.color}`:"0.5px solid rgba(255,255,255,0.08)",
            background:sel===i?`${c.color}18`:"transparent",
            color:sel===i?c.light:"rgba(255,255,255,0.4)",transition:"all 0.2s",
          }}>
            {c.name} <span style={{fontSize:9,color:sel===i?c.color:"rgba(255,255,255,0.2)",marginLeft:4}}>{c.type}</span>
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
        <div>
          {/* Chart */}
          <Card style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:"#fff",fontFamily:sans}}>
                  {crisis.name} — FinGuard Score Timeline
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginTop:2}}>
                  Hover points to inspect · dashed line = first warning · solid = collapse
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:28,fontWeight:600,fontFamily:mono,color:crisis.color,lineHeight:1}}>
                  {lastScore}
                </div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginTop:2}}>AT COLLAPSE</div>
              </div>
            </div>
            <BigChart
              points={chartPoints}
              color={crisis.color}
              warnIdx={warnIdx}
              collapseIdx={collapseIdx}
              onHover={setHovered}
              hoveredIdx={hovered}
            />
          </Card>

          {/* Description */}
          <div style={{
            marginBottom:12,padding:"14px 18px",borderRadius:"0 10px 10px 0",
            background:"rgba(255,255,255,0.02)",borderLeft:`3px solid ${crisis.color}`,
          }}>
            <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,0.5)",fontFamily:sans,lineHeight:1.8}}>
              {crisis.description}
            </p>
          </div>

          {/* Metric cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[
              {label:"First Warning",value:crisis.firstWarning,sub:"FinGuard alert issued",color:"#EF9F27"},
              {label:"Lead Time",value:crisis.leadTime,sub:"before official collapse",color:crisis.color},
              {label:"Score at Warning",value:warnScore,sub:"crossed Critical (<40)",color:"#A32D2D"},
            ].map(m=>(
              <Card key={m.label}>
                <Label>{m.label}</Label>
                <div style={{fontSize:22,fontWeight:600,fontFamily:mono,color:m.color,lineHeight:1}}>{m.value}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:mono,marginTop:4}}>{m.sub}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* SHAP */}
          <Card style={{flex:1}}>
            <Label>SHAP Breakdown</Label>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",marginBottom:12,fontFamily:sans,lineHeight:1.6}}>
              Score driver impact at first warning signal
            </div>
            {crisis.ratios.map(r=>(
              <div key={r.name} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontFamily:mono}}>{r.name}</span>
                  <div style={{display:"flex",gap:10}}>
                    <span style={{fontSize:10,fontFamily:mono,color:SC[r.st]}}>{r.bv}</span>
                    <span style={{fontSize:10,fontFamily:mono,color:"rgba(255,255,255,0.25)"}}>avg {r.ia}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:`${Math.abs(r.contrib)*2}px`,maxWidth:"100%",height:4,
                    background:SC[r.st],borderRadius:2,opacity:0.85}}/>
                  <span style={{fontSize:9,fontFamily:mono,color:SC[r.st]}}>{r.contrib}</span>
                </div>
              </div>
            ))}
            <div style={{marginTop:12,paddingTop:10,borderTop:"0.5px solid rgba(255,255,255,0.07)",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:mono}}>Total impact</span>
              <span style={{fontSize:14,fontWeight:600,fontFamily:mono,color:crisis.color}}>
                {crisis.ratios.reduce((a,r)=>a+r.contrib,0)} pts
              </span>
            </div>
          </Card>

          {/* Collapse event */}
          <div style={{
            padding:16,borderRadius:10,
            background:`${crisis.color}0d`,border:`0.5px solid ${crisis.color}44`,
          }}>
            <Label style={{color:`${crisis.color}bb`}}>Collapse Event</Label>
            <div style={{fontSize:13,fontWeight:500,color:"#fff",marginBottom:4,fontFamily:sans}}>
              {crisis.collapseDate} — {crisis.collapseLabel}
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",lineHeight:1.6,fontFamily:sans}}>
              {crisis.type} · Warning issued{" "}
              <span style={{color:crisis.light}}>{crisis.leadTime} prior</span>
            </div>
            <div style={{
              marginTop:12,padding:"8px 12px",borderRadius:6,
              background:"rgba(0,0,0,0.3)",fontSize:10,color:"rgba(255,255,255,0.4)",
              lineHeight:1.7,fontFamily:sans
            }}>
              A retail investor watching FinGuard would have had{" "}
              <span style={{color:crisis.light}}>{crisis.leadTime}</span> to reduce exposure before the event.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function FinGuardApp() {
  const [view, setView] = useState("screener");
  const [selectedBank, setSelectedBank] = useState("");

  const goToBank = (bankName) => {
    setSelectedBank(bankName);
    setView("scorecard");
  };

  const content = {
    screener:  <Screener onSelectBank={goToBank}/>,
    heatmap:   <HeatmapView/>,
    scorecard: <Scorecard bank={selectedBank} setBank={setSelectedBank}/>,
    compare:   <Compare/>,
    trend:     <TrendExplorer bank={selectedBank} setBank={setSelectedBank}/>,
    investor:  <InvestorTool/>,
    crisis:    <CrisisReplay/>,
  };

  return (
    <div style={{
      background:"#080B14",minHeight:"100vh",
      fontFamily:sans, color:"#E2E8F0",
      display:"flex",flexDirection:"column",
    }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.3}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        input[type=number]::-webkit-inner-spin-button{opacity:0.3}
        select option{background:#0e1120}
      `}</style>

      {/* Top Nav */}
      <header style={{
        borderBottom:"0.5px solid rgba(255,255,255,0.07)",
        background:"rgba(8,11,20,0.95)",
        backdropFilter:"blur(10px)",
        padding:"0 24px",
        display:"flex",alignItems:"center",
        position:"sticky",top:0,zIndex:100,
        minHeight:52,flexShrink:0,
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginRight:32}}>
          <div style={{
            width:22,height:22,borderRadius:6,
            background:"linear-gradient(135deg,#1D9E75,#4B7AC7)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,fontWeight:700,color:"#fff",fontFamily:mono,
          }}>F</div>
          <span style={{fontSize:14,fontWeight:600,fontFamily:mono,letterSpacing:0.5,color:"#fff"}}>
            FinGuard
          </span>
          <span style={{fontSize:9,fontFamily:mono,color:"rgba(255,255,255,0.2)",letterSpacing:2,marginLeft:2}}>
            AI
          </span>
        </div>

        {/* Nav */}
        <nav style={{display:"flex",gap:2,flex:1,overflowX:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} style={{
              padding:"6px 14px",borderRadius:7,fontSize:11,fontFamily:mono,
              cursor:"pointer",whiteSpace:"nowrap",
              background:view===n.id?"rgba(255,255,255,0.08)":"transparent",
              border:view===n.id?"0.5px solid rgba(255,255,255,0.12)":"0.5px solid transparent",
              color:view===n.id?"#fff":"rgba(255,255,255,0.4)",
              transition:"all 0.15s",
            }}>
              <span style={{marginRight:6,opacity:0.7}}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:16}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75",boxShadow:"0 0 4px #1D9E75"}}/>
          <span style={{fontSize:9,fontFamily:mono,color:"rgba(255,255,255,0.25)",letterSpacing:1}}>
            API LIVE
          </span>
        </div>
      </header>

      {/* Macro Ticker */}
      <div style={{
        background:"rgba(4,6,12,0.6)", borderBottom:"0.5px solid rgba(255,255,255,0.05)",
        padding:"8px 24px", display:"flex", gap:32, overflowX:"auto", whiteSpace:"nowrap",
        alignItems:"center"
      }}>
        <div style={{fontSize:10, fontFamily:mono, color:"rgba(255,255,255,0.4)"}}>
          <span style={{color:"#1D9E75"}}>●</span> MACRO CONTEXT
        </div>
        {[
          { label: "RBI Repo Rate", value: "6.50%", color: "#EF9F27" },
          { label: "CPI Inflation", value: "5.10%", color: "#1D9E75" },
          { label: "USD/INR", value: "83.12", color: "#E24B4A" },
          { label: "10Y G-Sec Yield", value: "7.08%", color: "#EF9F27" },
          { label: "System Liquidity", value: "Deficit", color: "#E24B4A" }
        ].map(m => (
          <div key={m.label} style={{display:"flex", gap:6, alignItems:"center"}}>
            <span style={{fontSize:10, fontFamily:mono, color:"rgba(255,255,255,0.3)"}}>{m.label}</span>
            <span style={{fontSize:10, fontFamily:mono, color:m.color, fontWeight:600}}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Page */}
      <main style={{flex:1,padding:"28px 24px",maxWidth:1100,margin:"0 auto",width:"100%", overflowX: "hidden"}}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {content[view]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}