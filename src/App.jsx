import { useState } from "react";

const SQUARE = "https://square.link/u/Wx7s5x21";
const STRIPE = "https://buy.stripe.com/5kQ3cu7kNbX08XbesSgw000";
const LEGAL  = "https://drive.google.com/drive/folders/1Pw-v8LkfQrjtk63Fl4BEbqg34GI7wc8j?usp=share_link";
const SITE   = "https://www.usi101.com/mind-by-twc";

const C = {
  navy:    "#1a1a2e",
  gold:    "#c9a84c",
  goldSoft:"#f5eedc",
  red:     "#b5341a",
  purple:  "#7C6FAD",
  green:   "#4A8C6F",
  orange:  "#C4783A",
  blue:    "#3A7DB5",
  bg:      "#f5f5f7",
};

const PILLARS = [
  {
    id:"sleep", icon:"🌙", label:"Sleep", sub:"Rest before weight loss",
    col:"#7C6FAD", light:"#EDE9F8", free:true,
    prompts:["What time did I sleep?","How rested do I feel? (1-10)","Any wins or disruptions?"],
    tip:"Late nights cost more than food. Sleep is your first medicine."
  },
  {
    id:"nervous", icon:"🌿", label:"Calm Body", sub:"Regulate before you hustle",
    col:"#4A8C6F", light:"#E4F4EC", free:true,
    prompts:["Did I walk or move gently today?","Did I pause and breathe?","Stress level? (1-10)"],
    tip:"You do not need intensity. You need rhythm."
  },
  {
    id:"nourish", icon:"🥗", label:"Nourish", sub:"Protein before restriction",
    col:"#C4783A", light:"#FDF0E4", free:false,
    prompts:["Did I eat protein at each meal?","Did I drink enough water?","Any emotional eating moments?"],
    tip:"Feed your body. Do not punish it."
  },
  {
    id:"structure", icon:"📅", label:"Structure", sub:"Systems before motivation",
    col:"#3A7DB5", light:"#E3EEF8", free:false,
    prompts:["Did I follow my morning plan?","What one habit did I repeat?","What needs adjusting?"],
    tip:"Motivation fades. Systems stay."
  },
  {
    id:"identity", icon:"✨", label:"Identity", sub:"Promise kept to yourself",
    col:"#b5341a", light:"#F8EDE3", free:false,
    prompts:["What small promise did I keep today?","How do I describe myself right now?","One win, however tiny?"],
    tip:"You are becoming someone who keeps their word to themselves."
  },
];

const MOODS = ["😞","😐","🙂","😊","🌟"];
const DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function weekDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + offset * 7);
  return Array.from({length:7}, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x.toISOString().split("T")[0];
  });
}

async function askClaude(prompt, sys) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: sys || "You are a warm, grounded wellbeing coach for InnerProof by MindByTWC. Keep responses to 2-3 sentences. Be specific, honest, never preachy. Speak like a wise trusted friend.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const d = await r.json();
    return d?.content?.[0]?.text || "Keep going. One step at a time.";
  } catch(e) {
    return "Keep going. One step at a time.";
  }
}

// -- Nav --
function Nav({ view, setView, streak, pro }) {
  const tabs = [
    { id:"today",     label:"Today" },
    { id:"intention", label:"Intention" },
    { id:"review",    label:"True Rhythm", lock:!pro },
    { id:"log",       label:"Proof Log" },
    { id:"insights",  label:"Insights", lock:!pro },
  ];

  return (
    <header style={{
      background: C.navy,
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "12px 16px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 8 }}>
          <div>
            <a href={SITE} target="_blank" rel="noopener" style={{ textDecoration:"none" }}>
              <span style={{ fontSize:17, fontWeight:800, color:C.gold, letterSpacing:2, fontFamily:"Georgia,serif" }}>INNER</span>
              <span style={{ fontSize:17, fontWeight:800, color:"#fff", letterSpacing:2, fontFamily:"Georgia,serif" }}>PROOF</span>
            </a>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", fontFamily:"sans-serif", letterSpacing:1, marginTop:1 }}>
              BY MINDBYTWC
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {streak > 0 && (
              <div style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: 16, padding: "3px 9px",
                display:"flex", alignItems:"center", gap:3
              }}>
                <span style={{ fontSize:13 }}>🔥</span>
                <span style={{ color:C.gold, fontSize:10, fontWeight:700, fontFamily:"sans-serif" }}>{streak}d</span>
              </div>
            )}
            <span style={{
              background: pro ? C.gold : "rgba(255,255,255,0.08)",
              color: pro ? C.navy : "rgba(255,255,255,0.4)",
              fontSize:9, fontWeight:800, padding:"3px 8px",
              borderRadius:8, fontFamily:"sans-serif", letterSpacing:0.5
            }}>
              {pro ? "PRO" : "FREE"}
            </span>
          </div>
        </div>

        <div style={{ display:"flex", gap:3, overflowX:"auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              flexShrink: 0, padding:"6px 10px",
              borderRadius:"7px 7px 0 0", border:"none",
              cursor:"pointer", fontFamily:"sans-serif",
              fontSize:10, fontWeight:700,
              background: view===t.id ? C.bg : "transparent",
              color: view===t.id ? C.navy : "rgba(255,255,255,0.45)",
            }}>
              {t.label}{t.lock ? " 🔒" : ""}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// -- Upgrade Gate --
function Gate({ onDemo }) {
  const [agreed, setAgreed] = useState(false);
  const [warn,   setWarn]   = useState(false);

  function pay(url) {
    if (!agreed) { setWarn(true); return; }
    window.open(url, "_blank");
  }

  return (
    <div style={{ maxWidth:460, margin:"32px auto", padding:"0 16px" }}>
      <div style={{ background:"#fff", borderRadius:20, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>

        <div style={{
          background: `linear-gradient(135deg,${C.navy},#2d2d5e)`,
          padding: "26px 22px", textAlign:"center"
        }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:800, color:C.gold, letterSpacing:2 }}>
            INNER<span style={{ color:"#fff" }}>PROOF</span>
          </div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:2, fontFamily:"sans-serif", margin:"3px 0 12px" }}>PRO</div>
          <p style={{ color:"rgba(255,255,255,0.7)", fontFamily:"Georgia,serif", fontSize:13, margin:0, lineHeight:1.6, fontStyle:"italic" }}>
            Find your true rhythm. Build proof of who you are becoming.
          </p>
        </div>

        <div style={{ padding:"18px 22px" }}>
          {[
            ["📊","True Rhythm Report - your weekly pattern at a glance"],
            ["✨","Full AI coaching insight on every pillar"],
            ["📅","All 5 pillars: Structure, Identity and Nourish unlocked"],
            ["🌅","Daily intention setter with smart reminders"],
            ["📈","InnerProof score trends over time"],
          ].map(([icon, text], i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:9 }}>
              <span style={{ fontSize:17 }}>{icon}</span>
              <span style={{ fontFamily:"sans-serif", fontSize:12, color:"#444" }}>{text}</span>
            </div>
          ))}

          <div style={{ background:C.goldSoft, borderRadius:11, padding:"12px 14px", margin:"14px 0", textAlign:"center" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:20, color:C.navy, fontWeight:700 }}>
              GBP 4.99 <span style={{ fontSize:13, fontWeight:400 }}>/month</span>
            </div>
            <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#888", marginTop:2 }}>or GBP 39/year - save 35%</div>
          </div>

          <div
            onClick={() => { setAgreed(a => !a); setWarn(false); }}
            style={{
              display:"flex", alignItems:"flex-start", gap:11, cursor:"pointer",
              background: agreed ? "#f0f7f0" : warn ? "#fff5f5" : "#f9f9f9",
              border: `1.5px solid ${agreed ? "#c3e0c3" : warn ? "#f4b8b8" : "#e8e8e8"}`,
              borderRadius:9, padding:"11px 13px", marginBottom:9, transition:"all 0.2s"
            }}
          >
            <div style={{
              width:18, height:18, borderRadius:4, flexShrink:0, marginTop:1,
              border: `2px solid ${agreed ? C.green : warn ? C.red : "#ccc"}`,
              background: agreed ? C.green : "#fff",
              display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s"
            }}>
              {agreed && <span style={{ color:"#fff", fontSize:12, fontWeight:800, lineHeight:1 }}>✓</span>}
            </div>
            <p style={{ fontFamily:"sans-serif", fontSize:11, color:"#444", margin:0, lineHeight:1.6 }}>
              I have read and agree to the InnerProof{" "}
              <a href={LEGAL} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                style={{ color:C.purple, fontWeight:700 }}>Terms of Service</a>,{" "}
              <a href={LEGAL} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                style={{ color:C.purple, fontWeight:700 }}>Privacy Policy</a>{" "}and{" "}
              <a href={LEGAL} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                style={{ color:C.purple, fontWeight:700 }}>Refund Policy</a>.
            </p>
          </div>

          {warn && !agreed && (
            <p style={{ fontFamily:"sans-serif", fontSize:11, color:C.red, textAlign:"center", margin:"0 0 9px", fontWeight:600 }}>
              Please accept the Terms of Service before continuing.
            </p>
          )}

          <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#aaa", textAlign:"center", margin:"0 0 7px", letterSpacing:0.5 }}>
            CHOOSE HOW TO PAY
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:4 }}>
            <button onClick={() => pay(SQUARE)} style={{
              padding:"12px 0", borderRadius:11, border:"none",
              background: agreed ? C.gold : "#ddd",
              color: agreed ? C.navy : "#aaa",
              fontFamily:"sans-serif", fontWeight:800, fontSize:12,
              cursor: agreed ? "pointer" : "not-allowed",
              display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all 0.2s"
            }}>
              <span>Pay with Square</span>
              <span style={{ fontSize:9, fontWeight:400, opacity:0.7 }}>square.link</span>
            </button>

            <button onClick={() => pay(STRIPE)} style={{
              padding:"12px 0", borderRadius:11,
              border: agreed ? `2px solid ${C.navy}` : "2px solid #ddd",
              background: agreed ? "#fff" : "#f5f5f5",
              color: agreed ? C.navy : "#bbb",
              fontFamily:"sans-serif", fontWeight:800, fontSize:12,
              cursor: agreed ? "pointer" : "not-allowed",
              display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all 0.2s"
            }}>
              <span>Pay with Stripe</span>
              <span style={{ fontSize:9, fontWeight:400, opacity:0.6 }}>buy.stripe.com</span>
            </button>
          </div>

          <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", textAlign:"center", margin:"5px 0 0" }}>
            Both options start your 7-day free trial - no charge today
          </p>

          <div style={{
            background:"#f0f7f0", border:"1px solid #c3e0c3",
            borderRadius:9, padding:"9px 12px", margin:"10px 0 8px", textAlign:"center"
          }}>
            <p style={{ fontFamily:"sans-serif", fontSize:11, color:"#3a6b3a", margin:0, lineHeight:1.6 }}>
              🔒 No charge for 7 days. Cancel anytime.<br/>
              <strong>We will remind you 2 days before billing starts.</strong>
            </p>
          </div>

          <p style={{ textAlign:"center", fontSize:10, color:"#ccc", fontFamily:"sans-serif", margin:"4px 0 8px" }}>
            Secure payment via Square and Stripe - Powered by{" "}
            <a href={SITE} target="_blank" rel="noopener" style={{ color:C.gold, fontWeight:700 }}>MindByTWC</a>
          </p>

          <button onClick={onDemo} style={{
            display:"block", width:"100%", padding:"9px 0", borderRadius:9,
            border:`1px dashed ${C.purple}`, background:"transparent",
            color:C.purple, fontFamily:"sans-serif", fontSize:11, cursor:"pointer", fontWeight:600
          }}>
            Preview PRO mode (demo)
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Pillar Card --
function PillarCard({ pillar, data, onSave, locked }) {
  const [open,    setOpen]    = useState(false);
  const [notes,   setNotes]   = useState(data?.notes || "");
  const [score,   setScore]   = useState(data?.score ?? null);
  const [insight, setInsight] = useState(data?.insight || "");
  const [loading, setLoading] = useState(false);
  const done = data?.score != null;

  async function handleSave() {
    if (!notes.trim() && score === null) return;
    setLoading(true);
    let ins = insight;
    if (notes.trim() && !insight) {
      ins = await askClaude(`InnerProof pillar: ${pillar.label}\nNotes: "${notes}"\nGive one specific grounded insight to help them build proof.`);
      setInsight(ins);
    }
    onSave({ notes, score, insight: ins });
    setLoading(false);
    setOpen(false);
  }

  if (locked) {
    return (
      <div style={{ borderRadius:13, marginBottom:9, border:"1.5px solid #eee", background:"#fafafa", opacity:0.6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, padding:"12px 15px" }}>
          <span style={{ fontSize:21, filter:"grayscale(1)" }}>{pillar.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:14, color:"#aaa", fontWeight:700 }}>{pillar.label}</div>
            <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#ccc", marginTop:1 }}>Unlock with InnerProof PRO</div>
          </div>
          <span style={{ fontSize:13 }}>🔒</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius:13, marginBottom:9,
      border: `1.5px solid ${done ? pillar.col : "#e8e8e8"}`,
      background:"#fff",
      boxShadow: done ? `0 2px 10px ${pillar.col}22` : "0 1px 4px rgba(0,0,0,0.04)"
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", display:"flex", alignItems:"center", gap:11,
        padding:"12px 15px", background: done ? pillar.light : "#fff",
        border:"none", cursor:"pointer", textAlign:"left", borderRadius:13
      }}>
        <span style={{ fontSize:21 }}>{pillar.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:14, color:C.navy, fontWeight:700 }}>{pillar.label}</div>
          <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#aaa", marginTop:1 }}>{pillar.sub}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          {done && <span style={{ fontSize:14 }}>✅</span>}
          {score != null && (
            <span style={{
              background:pillar.col, color:"#fff",
              borderRadius:7, padding:"2px 6px",
              fontSize:10, fontFamily:"sans-serif", fontWeight:700
            }}>{score}/5</span>
          )}
          <span style={{ color:"#ccc", fontSize:12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding:"0 15px 15px", borderTop:`1px solid ${pillar.light}` }}>
          <p style={{
            fontSize:11, color:pillar.col, fontStyle:"italic",
            fontFamily:"sans-serif", margin:"10px 0 9px",
            padding:"7px 11px", background:pillar.light, borderRadius:7
          }}>
            {pillar.tip}
          </p>
          <p style={{ fontSize:10, fontWeight:700, color:"#bbb", fontFamily:"sans-serif", marginBottom:4, letterSpacing:0.5 }}>REFLECT ON:</p>
          <ul style={{ margin:"0 0 9px", paddingLeft:16 }}>
            {pillar.prompts.map((p, i) => (
              <li key={i} style={{ fontSize:11, color:"#666", fontFamily:"sans-serif", marginBottom:3 }}>{p}</li>
            ))}
          </ul>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Write anything - one honest sentence counts."
            style={{
              width:"100%", minHeight:65, borderRadius:9,
              border:"1.5px solid #eee", padding:"9px 11px",
              fontFamily:"sans-serif", fontSize:12, color:"#333",
              resize:"vertical", boxSizing:"border-box", outline:"none",
              lineHeight:1.5, marginBottom:9
            }}
          />
          <div style={{ display:"flex", gap:5, marginBottom:11 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setScore(n)} style={{
                flex:1, padding:"7px 0", borderRadius:7,
                border: score===n ? `2px solid ${pillar.col}` : "2px solid #eee",
                background: score===n ? pillar.light : "#fafafa",
                color: score===n ? pillar.col : "#bbb",
                fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"sans-serif"
              }}>{n}</button>
            ))}
          </div>
          {insight && (
            <div style={{ background:"#f9f6ff", border:"1px solid #e8e0ff", borderRadius:9, padding:"9px 11px", marginBottom:9 }}>
              <p style={{ fontSize:10, color:C.purple, fontWeight:700, fontFamily:"sans-serif", marginBottom:3, letterSpacing:0.5 }}>YOUR INNERPROOF INSIGHT</p>
              <p style={{ fontSize:12, color:"#444", fontFamily:"sans-serif", lineHeight:1.55, margin:0 }}>{insight}</p>
            </div>
          )}
          <button onClick={handleSave} disabled={loading} style={{
            width:"100%", padding:"10px 0", borderRadius:9, border:"none",
            background: loading ? "#ddd" : pillar.col, color:"#fff",
            fontFamily:"sans-serif", fontWeight:700, fontSize:12,
            cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Getting insight..." : done ? "Update" : "Save and Get Insight"}
          </button>
        </div>
      )}
    </div>
  );
}

// -- Today View --
function TodayView({ data, setData, pro, setView }) {
  const key   = todayKey();
  const today = data[key] || {};
  const [mood, setMood] = useState(today.mood ?? null);

  function saveMood(v) {
    setMood(v);
    setData(d => ({ ...d, [key]: { ...(d[key]||{}), mood:v } }));
  }
  function savePillar(pid, val) {
    setData(d => ({ ...d, [key]: { ...(d[key]||{}), [pid]:val } }));
  }

  const done = PILLARS.filter(p => today[p.id]?.score != null).length;
  const pct  = Math.round((done / PILLARS.length) * 100);
  const intent = today.intention;

  return (
    <div style={{ padding:"18px 15px", maxWidth:480, margin:"0 auto" }}>
      {intent?.text && (
        <div style={{ background:C.goldSoft, borderRadius:13, padding:"11px 15px", marginBottom:13, border:`1px solid ${C.gold}44` }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.orange, fontFamily:"sans-serif", marginBottom:3, letterSpacing:1 }}>TODAY'S INTENTION</div>
          {intent.word && <div style={{ fontFamily:"Georgia,serif", fontSize:18, color:C.navy, fontWeight:700, marginBottom:2 }}>{intent.word}</div>}
          <div style={{ fontFamily:"sans-serif", fontSize:12, color:"#666", lineHeight:1.5 }}>{intent.text}</div>
          {intent.ai && <div style={{ fontFamily:"Georgia,serif", fontSize:11, color:C.orange, fontStyle:"italic", marginTop:5 }}>"{intent.ai}"</div>}
        </div>
      )}

      <div style={{ background:"#fff", borderRadius:13, padding:"13px 15px", marginBottom:13, border:"1.5px solid #eee" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, fontWeight:700 }}>Today's InnerProof</span>
          <span style={{ fontFamily:"sans-serif", fontWeight:800, color:C.gold, fontSize:14 }}>{pct}%</span>
        </div>
        <div style={{ height:7, background:"#eee", borderRadius:5, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.red},${C.gold})`, borderRadius:5, transition:"width 0.4s" }}/>
        </div>
        <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", margin:"5px 0 0" }}>
          {done} of 5 pillars checked {done===5 ? "- Full proof today!" : ""}
        </p>
      </div>

      <div style={{ marginBottom:13 }}>
        <p style={{ fontSize:10, fontWeight:700, color:"#bbb", fontFamily:"sans-serif", marginBottom:5, letterSpacing:0.5 }}>OVERALL FEELING TODAY</p>
        <div style={{ display:"flex", gap:5 }}>
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => saveMood(i)} style={{
              flex:1, fontSize:19, padding:"8px 0", borderRadius:9,
              border: mood===i ? `2px solid ${C.gold}` : "2px solid #eee",
              background: mood===i ? C.goldSoft : "#fafafa", cursor:"pointer"
            }}>{m}</button>
          ))}
        </div>
      </div>

      {PILLARS.map(p => (
        <PillarCard
          key={p.id}
          pillar={p}
          data={today[p.id]}
          onSave={val => savePillar(p.id, val)}
          locked={!pro && !p.free}
        />
      ))}

      {!pro && (
        <div style={{ background:"#f9f6ff", borderRadius:13, padding:"15px", border:"1px solid #e8e0ff", marginTop:5, textAlign:"center" }}>
          <p style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, margin:"0 0 4px" }}>Unlock your full InnerProof</p>
          <p style={{ fontFamily:"sans-serif", fontSize:11, color:"#999", margin:"0 0 11px" }}>Structure, Identity and Nourish are ready for you.</p>
          <button onClick={() => setView("insights")} style={{
            background:C.gold, color:C.navy, border:"none", borderRadius:9,
            fontFamily:"sans-serif", fontWeight:800, fontSize:12, padding:"9px 20px", cursor:"pointer"
          }}>
            Start My 7-Day Free Trial
          </button>
          <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#ccc", margin:"8px 0 3px", lineHeight:1.5 }}>
            No charge for 7 days - Cancel anytime
          </p>
          <p style={{ fontFamily:"sans-serif", fontSize:9, color:"#ddd", margin:0, lineHeight:1.5 }}>
            By starting your trial you agree to our{" "}
            <a href={LEGAL} target="_blank" rel="noopener" style={{ color:C.purple }}>Terms of Service</a>{" "}and{" "}
            <a href={LEGAL} target="_blank" rel="noopener" style={{ color:C.purple }}>Privacy Policy</a>.
          </p>
        </div>
      )}
    </div>
  );
}

// -- Intention View --
function IntentionView({ data, setData }) {
  const key  = todayKey();
  const saved = (data[key] || {}).intention || {};
  const [word,    setWord]    = useState(saved.word || "");
  const [intent,  setIntent]  = useState(saved.text || "");
  const [rel,     setRel]     = useState(saved.release || "");
  const [ai,      setAi]      = useState(saved.ai || "");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(!!saved.text);
  const [reminders, setReminders] = useState([]);
  const [rLabel, setRLabel] = useState("Morning InnerProof check-in");
  const [rTime,  setRTime]  = useState("07:00");
  const [showForm, setShowForm] = useState(false);

  async function save() {
    if (!intent.trim()) return;
    setLoading(true);
    let sentence = ai;
    if (!ai) {
      sentence = await askClaude(
        `My word for today is "${word}". My intention: "${intent}". I want to release: "${rel}". Give me one grounding sentence to carry into my day.`
      );
      setAi(sentence);
    }
    setData(d => ({
      ...d,
      [key]: { ...(d[key]||{}), intention: { word, text:intent, release:rel, ai:sentence } }
    }));
    setDone(true);
    setLoading(false);
  }

  return (
    <div style={{ padding:"18px 15px", maxWidth:480, margin:"0 auto" }}>
      <div style={{ marginBottom:14 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, color:C.navy, margin:"0 0 3px" }}>Set Your Intention</h2>
        <p style={{ fontFamily:"sans-serif", fontSize:11, color:"#bbb", margin:0 }}>Anchor your day before the world pulls you in every direction.</p>
      </div>

      <div style={{ background:"#fff", borderRadius:15, padding:"16px", marginBottom:13, border:"1.5px solid #eee" }}>
        <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#bbb", fontFamily:"sans-serif", marginBottom:4, letterSpacing:1 }}>MY ONE WORD TODAY</label>
        <input
          value={word} onChange={e => setWord(e.target.value)}
          placeholder="e.g. Steady - Present - Aligned - Rooted"
          style={{ width:"100%", padding:"9px 11px", borderRadius:9, border:"1.5px solid #eee", fontFamily:"Georgia,serif", fontSize:15, color:C.navy, marginBottom:13, boxSizing:"border-box", outline:"none" }}
        />

        <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#bbb", fontFamily:"sans-serif", marginBottom:4, letterSpacing:1 }}>MY INNERPROOF INTENTION</label>
        <textarea
          value={intent} onChange={e => setIntent(e.target.value)}
          placeholder="Today I choose to... / Today I will show up by... / I am building proof that..."
          style={{ width:"100%", minHeight:70, padding:"9px 11px", borderRadius:9, border:"1.5px solid #eee", fontFamily:"sans-serif", fontSize:12, color:"#333", resize:"vertical", marginBottom:13, boxSizing:"border-box", outline:"none", lineHeight:1.55 }}
        />

        <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#bbb", fontFamily:"sans-serif", marginBottom:4, letterSpacing:1 }}>I RELEASE TODAY</label>
        <input
          value={rel} onChange={e => setRel(e.target.value)}
          placeholder="e.g. the need to be perfect - yesterday's guilt"
          style={{ width:"100%", padding:"9px 11px", borderRadius:9, border:"1.5px solid #eee", fontFamily:"sans-serif", fontSize:12, color:"#333", marginBottom:13, boxSizing:"border-box", outline:"none" }}
        />

        {ai && (
          <div style={{ background:C.goldSoft, border:`1px solid ${C.gold}55`, borderRadius:9, padding:"10px 13px", marginBottom:13 }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.orange, fontFamily:"sans-serif", marginBottom:4, letterSpacing:1 }}>YOUR GROUNDING SENTENCE</p>
            <p style={{ fontSize:12, color:"#444", fontFamily:"Georgia,serif", lineHeight:1.6, margin:0, fontStyle:"italic" }}>"{ai}"</p>
          </div>
        )}

        <button onClick={save} disabled={loading || !intent.trim()} style={{
          width:"100%", padding:"12px 0", borderRadius:9, border:"none",
          background: loading || !intent.trim() ? "#ddd" : C.gold,
          color: C.navy, fontFamily:"sans-serif", fontWeight:800, fontSize:13,
          cursor: loading || !intent.trim() ? "not-allowed" : "pointer"
        }}>
          {loading ? "Finding your grounding sentence..." : done ? "Update Intention" : "Set Intention and Get Grounding Sentence"}
        </button>
      </div>

      <div style={{ background:"#fff", borderRadius:15, padding:"16px", border:"1.5px solid #eee" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:11 }}>
          <div>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:15, color:C.navy, margin:"0 0 2px" }}>Reminders</h2>
            <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", margin:0 }}>Keep your true rhythm on track</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{
            background:C.navy, color:"#fff", border:"none",
            borderRadius:7, padding:"6px 12px", fontFamily:"sans-serif", fontSize:11, fontWeight:700, cursor:"pointer"
          }}>+ Add</button>
        </div>

        {showForm && (
          <div style={{ background:"#f9f9f9", borderRadius:9, padding:"11px", marginBottom:11, border:"1px solid #eee" }}>
            <input value={rLabel} onChange={e => setRLabel(e.target.value)} placeholder="Reminder name"
              style={{ width:"100%", padding:"7px 9px", borderRadius:7, border:"1px solid #ddd", fontFamily:"sans-serif", fontSize:12, marginBottom:7, boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", gap:7 }}>
              <input type="time" value={rTime} onChange={e => setRTime(e.target.value)}
                style={{ flex:1, padding:"7px 9px", borderRadius:7, border:"1px solid #ddd", fontFamily:"sans-serif", fontSize:12 }}
              />
              <button onClick={() => { setReminders(r => [...r, {label:rLabel, time:rTime}]); setShowForm(false); }} style={{
                flex:1, background:C.green, color:"#fff", border:"none",
                borderRadius:7, fontFamily:"sans-serif", fontWeight:700, fontSize:12, cursor:"pointer"
              }}>Save</button>
            </div>
          </div>
        )}

        {reminders.length === 0
          ? <p style={{ fontFamily:"sans-serif", fontSize:12, color:"#ccc", textAlign:"center", padding:"13px 0" }}>No reminders yet. Add one to stay in rhythm.</p>
          : reminders.map((r, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 11px", background:"#f9f9f9", borderRadius:9, marginBottom:7 }}>
              <div>
                <div style={{ fontFamily:"sans-serif", fontSize:12, fontWeight:700, color:"#333" }}>{r.label}</div>
                <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", marginTop:1 }}>{r.time} daily</div>
              </div>
              <button onClick={() => setReminders(rs => rs.filter((_,j) => j!==i))} style={{
                background:"#fee8e8", border:"none", borderRadius:7,
                padding:"4px 9px", fontSize:11, color:C.red, cursor:"pointer", fontWeight:700
              }}>Remove</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// -- True Rhythm Review --
function TrueRhythm({ data }) {
  const [offset,     setOffset]     = useState(0);
  const [reflection, setReflection] = useState("");
  const [aiReview,   setAiReview]   = useState("");
  const [loading,    setLoading]    = useState(false);

  const days     = weekDays(offset);
  const weekData = days.map(k => ({ key:k, day:new Date(k+"T12:00:00"), d:data[k]||{} }));
  const checkedIn = weekData.filter(({d}) => PILLARS.some(p => d[p.id]));

  const totals = PILLARS.map(p => {
    const scores = weekData.map(({d}) => d[p.id]?.score).filter(Boolean);
    return { ...p, avg: scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : null, cnt: scores.length };
  });

  const best  = [...totals].filter(p=>p.avg).sort((a,b)=>b.avg-a.avg)[0];
  const needs = [...totals].filter(p=>p.avg).sort((a,b)=>a.avg-b.avg)[0];
  const moodArr = weekData.map(({d}) => d.mood).filter(v => v != null);
  const moodAvg = moodArr.length ? (moodArr.reduce((a,b)=>a+b,0)/moodArr.length).toFixed(1) : null;

  const sLabel = new Date(days[0]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  const eLabel = new Date(days[6]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});

  async function generate() {
    if (!checkedIn.length) return;
    setLoading(true);
    const summary = totals.map(p => `${p.label}: ${p.avg||"no data"}/5`).join(", ");
    const text = await askClaude(
      `InnerProof True Rhythm Report ${sLabel}-${eLabel}:\nPillar averages: ${summary}\nDays checked in: ${checkedIn.length}/7\nAvg mood: ${moodAvg}/4\nReflection: "${reflection}"\n\nGive me: 1 win to celebrate, 1 honest pattern to notice, 1 tiny action for next week. Warm, practical, under 120 words.`,
      "You are the InnerProof True Rhythm coach - part of MindByTWC. Help people see their weekly patterns clearly so they can align how they live with who they know they are. Be honest, warm, and specific."
    );
    setAiReview(text);
    setLoading(false);
  }

  return (
    <div style={{ padding:"18px 15px", maxWidth:480, margin:"0 auto" }}>
      <div style={{ marginBottom:14 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, color:C.navy, margin:"0 0 3px" }}>True Rhythm Report</h2>
        <p style={{ fontFamily:"sans-serif", fontSize:11, color:"#bbb", margin:0 }}>Your weekly InnerProof - where your real rhythm lives.</p>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <button onClick={() => setOffset(o => o-1)} style={{ background:"#fff", border:"1.5px solid #eee", borderRadius:9, padding:"7px 13px", fontFamily:"sans-serif", fontSize:12, cursor:"pointer", fontWeight:700, color:C.navy }}>Prev</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:13, fontWeight:700, color:C.navy }}>{sLabel} - {eLabel}</div>
          <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", marginTop:1 }}>{offset===0?"This week":offset===-1?"Last week":`${Math.abs(offset)} weeks ago`}</div>
        </div>
        <button onClick={() => setOffset(o => Math.min(0, o+1))} disabled={offset===0} style={{ background:offset===0?"#f5f5f5":"#fff", border:"1.5px solid #eee", borderRadius:9, padding:"7px 13px", fontFamily:"sans-serif", fontSize:12, cursor:offset===0?"not-allowed":"pointer", fontWeight:700, color:offset===0?"#ccc":C.navy }}>Next</button>
      </div>

      <div style={{ background:"#fff", borderRadius:14, padding:"14px", marginBottom:11, border:"1.5px solid #eee" }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, margin:"0 0 11px" }}>Daily Check-ins</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {weekData.map(({key,day,d}) => {
            const cnt = PILLARS.filter(p => d[p.id]?.score != null).length;
            const isToday = key === todayKey();
            return (
              <div key={key} style={{ textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#bbb", fontFamily:"sans-serif", marginBottom:3 }}>{DAYS[day.getDay()]}</div>
                <div style={{
                  width:"100%", aspectRatio:"1", borderRadius:7,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: cnt===5 ? C.navy : cnt>0 ? `${C.gold}55` : "#f0f0f0",
                  border: isToday ? `2px solid ${C.gold}` : "2px solid transparent",
                  fontSize:10, fontWeight:700, fontFamily:"sans-serif",
                  color: cnt===5 ? "#fff" : cnt>0 ? C.navy : "#ccc"
                }}>
                  {cnt > 0 ? cnt : "."}
                </div>
                <div style={{ fontSize:10, fontFamily:"sans-serif", marginTop:2 }}>{d.mood != null ? MOODS[d.mood] : ""}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:14, padding:"14px", marginBottom:11, border:"1.5px solid #eee" }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, margin:"0 0 11px" }}>This Week's Pillar Rhythm</h3>
        {totals.map(p => (
          <div key={p.id} style={{ marginBottom:9 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
              <span style={{ fontFamily:"sans-serif", fontSize:11, color:"#555" }}>{p.icon} {p.label}</span>
              <span style={{ fontFamily:"sans-serif", fontSize:11, fontWeight:700, color:p.col }}>{p.avg ? `${p.avg}/5 (${p.cnt}d)` : "--"}</span>
            </div>
            <div style={{ height:6, background:"#f0f0f0", borderRadius:5, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${p.avg ? (p.avg/5)*100 : 0}%`, background:p.col, borderRadius:5, transition:"width 0.5s" }}/>
            </div>
          </div>
        ))}
      </div>

      {(best || needs) && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:11 }}>
          {best && (
            <div style={{ background:best.light, borderRadius:11, padding:"11px", border:`1px solid ${best.col}44` }}>
              <div style={{ fontSize:9, fontWeight:700, color:best.col, fontFamily:"sans-serif", marginBottom:3, letterSpacing:0.5 }}>STRONGEST</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:12, color:C.navy }}>{best.icon} {best.label}</div>
              <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#999", marginTop:2 }}>avg {best.avg}/5</div>
            </div>
          )}
          {needs && needs.id !== best?.id && (
            <div style={{ background:"#fff8f0", borderRadius:11, padding:"11px", border:"1px solid #f4d0a033" }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.orange, fontFamily:"sans-serif", marginBottom:3, letterSpacing:0.5 }}>NEEDS LOVE</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:12, color:C.navy }}>{needs.icon} {needs.label}</div>
              <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#999", marginTop:2 }}>avg {needs.avg}/5</div>
            </div>
          )}
        </div>
      )}

      <div style={{ background:"#fff", borderRadius:14, padding:"14px", border:"1.5px solid #eee" }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:14, color:C.navy, margin:"0 0 3px" }}>AI True Rhythm Coach</h3>
        <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", margin:"0 0 9px" }}>Add a reflection then get your personalised weekly insight.</p>
        <textarea
          value={reflection} onChange={e => setReflection(e.target.value)}
          placeholder="How did this week feel? What surprised you? What shifted?"
          style={{ width:"100%", minHeight:65, padding:"9px 11px", borderRadius:9, border:"1.5px solid #eee", fontFamily:"sans-serif", fontSize:12, color:"#333", resize:"vertical", marginBottom:9, boxSizing:"border-box", outline:"none", lineHeight:1.5 }}
        />
        {aiReview && (
          <div style={{ background:"#f9f6ff", border:"1px solid #e8e0ff", borderRadius:9, padding:"11px", marginBottom:9 }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.purple, fontFamily:"sans-serif", marginBottom:5, letterSpacing:0.5 }}>YOUR TRUE RHYTHM INSIGHT</p>
            <p style={{ fontSize:12, color:"#444", fontFamily:"sans-serif", lineHeight:1.6, margin:0, whiteSpace:"pre-wrap" }}>{aiReview}</p>
          </div>
        )}
        <button onClick={generate} disabled={loading || !checkedIn.length} style={{
          width:"100%", padding:"12px 0", borderRadius:9, border:"none",
          background: loading || !checkedIn.length ? "#ddd" : C.navy,
          color:"#fff", fontFamily:"sans-serif", fontWeight:700, fontSize:13,
          cursor: loading || !checkedIn.length ? "not-allowed" : "pointer"
        }}>
          {loading ? "Generating your True Rhythm Report..." : !checkedIn.length ? "No check-ins this week yet" : "Generate My True Rhythm Report"}
        </button>
      </div>
    </div>
  );
}

// -- Proof Log --
function ProofLog({ data }) {
  const days = Object.keys(data).sort((a,b) => b.localeCompare(a)).slice(0,60);

  if (!days.length) {
    return (
      <div style={{ padding:40, textAlign:"center", color:"#ccc", fontFamily:"sans-serif" }}>
        <div style={{ fontSize:38, marginBottom:11 }}>📅</div>
        <p style={{ fontFamily:"Georgia,serif", fontSize:14, color:"#aaa" }}>Your proof log starts today.</p>
      </div>
    );
  }

  return (
    <div style={{ padding:"18px 15px", maxWidth:480, margin:"0 auto" }}>
      <div style={{ marginBottom:14 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, color:C.navy, margin:"0 0 3px" }}>Your Proof Log</h2>
        <p style={{ fontFamily:"sans-serif", fontSize:11, color:"#bbb", margin:0 }}>Every entry is evidence of who you are becoming.</p>
      </div>

      {days.map(day => {
        const d = data[day];
        const scores = PILLARS.map(p => d[p.id]?.score).filter(Boolean);
        const cnt = PILLARS.filter(p => d[p.id]?.score != null).length;
        const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : null;
        const label = new Date(day+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
        const intent = d.intention;

        return (
          <div key={day} style={{ background:"#fff", borderRadius:13, padding:"12px 15px", marginBottom:7, border:"1.5px solid #eee" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, fontWeight:700 }}>{label}</div>
                <div style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", marginTop:1 }}>{cnt}/5 pillars - {d.mood != null ? MOODS[d.mood] : "--"}</div>
                {intent?.word && <div style={{ fontFamily:"sans-serif", fontSize:10, color:C.gold, marginTop:1, fontWeight:700 }}>"{intent.word}"</div>}
              </div>
              {avg && (
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:17, fontWeight:800, color:C.gold, fontFamily:"sans-serif" }}>{avg}</div>
                  <div style={{ fontSize:9, color:"#ccc", fontFamily:"sans-serif" }}>avg</div>
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:4, marginTop:7 }}>
              {PILLARS.map(p => (
                <div key={p.id} title={p.label} style={{ flex:1, height:4, borderRadius:3, background:d[p.id]?.score ? p.col : "#eee" }}/>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Insights --
function Insights({ data, onUpgrade }) {
  const days = Object.keys(data);
  let streak = 0;
  const sd = new Date();
  while (true) {
    const k = sd.toISOString().split("T")[0];
    if (!data[k]) break;
    streak++;
    sd.setDate(sd.getDate()-1);
  }

  const avgs = PILLARS.map(p => {
    const sc = days.map(day => data[day][p.id]?.score).filter(Boolean);
    return { ...p, avg: sc.length ? (sc.reduce((a,b)=>a+b,0)/sc.length).toFixed(1) : null };
  });
  const strongest = [...avgs].filter(p=>p.avg).sort((a,b)=>b.avg-a.avg)[0];
  const needsLove = [...avgs].filter(p=>p.avg).sort((a,b)=>a.avg-b.avg)[0];
  const intentDays = days.filter(day => data[day].intention?.text).length;

  return (
    <div style={{ padding:"18px 15px", maxWidth:480, margin:"0 auto" }}>
      <div style={{ marginBottom:14 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, color:C.navy, margin:"0 0 3px" }}>Your InnerProof Patterns</h2>
        <p style={{ fontFamily:"sans-serif", fontSize:11, color:"#bbb", margin:0 }}>This is what your true rhythm looks like over time.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:13 }}>
        {[
          { label:"Days tracked", val:days.length },
          { label:"Streak",       val:`${streak}🔥` },
          { label:"Intentions",   val:intentDays }
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", borderRadius:11, padding:"11px 7px", border:"1.5px solid #eee", textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.gold, fontFamily:"sans-serif" }}>{s.val}</div>
            <div style={{ fontSize:9, color:"#bbb", fontFamily:"sans-serif", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:13, padding:"14px", border:"1.5px solid #eee", marginBottom:11 }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, marginBottom:11 }}>All-Time Pillar Averages</h3>
        {avgs.map(p => (
          <div key={p.id} style={{ marginBottom:9 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
              <span style={{ fontFamily:"sans-serif", fontSize:11, color:"#555" }}>{p.icon} {p.label}</span>
              <span style={{ fontFamily:"sans-serif", fontSize:11, fontWeight:700, color:p.col }}>{p.avg || "--"}/5</span>
            </div>
            <div style={{ height:6, background:"#f0f0f0", borderRadius:5, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${p.avg ? (p.avg/5)*100 : 0}%`, background:p.col, borderRadius:5, transition:"width 0.5s" }}/>
            </div>
          </div>
        ))}
      </div>

      {strongest && (
        <div style={{ background:strongest.light, borderRadius:11, padding:"13px", border:`1px solid ${strongest.col}44`, marginBottom:9 }}>
          <p style={{ fontSize:9, fontWeight:700, color:strongest.col, fontFamily:"sans-serif", marginBottom:3, letterSpacing:0.5 }}>YOUR INNERPROOF STRENGTH</p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, margin:0 }}>{strongest.icon} {strongest.label} - avg {strongest.avg}/5</p>
          <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#999", marginTop:3 }}>This is your proof. Build on it.</p>
        </div>
      )}

      {needsLove && needsLove.id !== strongest?.id && (
        <div style={{ background:"#fff8f0", borderRadius:11, padding:"13px", border:"1px solid #f4d0a033", marginBottom:9 }}>
          <p style={{ fontSize:9, fontWeight:700, color:C.orange, fontFamily:"sans-serif", marginBottom:3, letterSpacing:0.5 }}>NEEDS MORE LOVE</p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:13, color:C.navy, margin:0 }}>{needsLove.icon} {needsLove.label} - avg {needsLove.avg}/5</p>
          <p style={{ fontFamily:"sans-serif", fontSize:10, color:"#999", marginTop:3 }}>Small consistent attention here = big shifts.</p>
        </div>
      )}

      <div style={{ background:"#f9f6ff", borderRadius:11, padding:"13px", border:"1px solid #e8e0ff", marginBottom:13 }}>
        <p style={{ fontSize:9, fontWeight:700, color:C.purple, fontFamily:"sans-serif", marginBottom:5, letterSpacing:0.5 }}>YOUR INNERPROOF REMINDER</p>
        <p style={{ fontFamily:"Georgia,serif", fontSize:12, color:"#444", lineHeight:1.65, margin:"0 0 7px", fontStyle:"italic" }}>
          "You are not starting from zero. You are becoming integrated. And integrated people become powerful quietly."
        </p>
        <a href={SITE} target="_blank" rel="noopener" style={{ fontSize:10, color:C.purple, fontFamily:"sans-serif", textDecoration:"none", fontWeight:700 }}>
          Explore more at MindByTWC
        </a>
      </div>

      <Gate onDemo={onUpgrade}/>
    </div>
  );
}

// -- Main App --
export default function App() {
  const [view, setView] = useState("today");
  const [data, setData] = useState({});
  const [pro,  setPro]  = useState(false);

  let streak = 0;
  const sd = new Date();
  while (true) {
    const k = sd.toISOString().split("T")[0];
    if (!data[k]) break;
    streak++;
    sd.setDate(sd.getDate()-1);
  }

  function demoPro() { setPro(true); setView("today"); }

  const showGate = !pro && (view === "review" || view === "insights");

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Nav view={view} setView={setView} streak={streak} pro={pro}/>

      {showGate
        ? <Gate onDemo={demoPro}/>
        : view === "today"     ? <TodayView     data={data} setData={setData} pro={pro} setView={setView}/>
        : view === "intention" ? <IntentionView data={data} setData={setData}/>
        : view === "review"    ? <TrueRhythm    data={data}/>
        : view === "log"       ? <ProofLog      data={data}/>
        :                        <Insights      data={data} onUpgrade={demoPro}/>
      }

      <div style={{ textAlign:"center", padding:"18px 15px 30px" }}>
        <div style={{ fontFamily:"Georgia,serif", fontSize:12, color:C.gold, fontWeight:700, letterSpacing:1, marginBottom:2 }}>INNERPROOF</div>
        <a href={SITE} target="_blank" rel="noopener" style={{ fontFamily:"sans-serif", fontSize:10, color:"#bbb", textDecoration:"none" }}>
          by <strong style={{ color:C.gold }}>MindByTWC</strong> - The Wellbeing Cognoscente
        </a>
      </div>
    </div>
  );
}
