import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ────────────────────────────────────────────────────────────────
const SUPA_URL = "https://pgnpyyvamzutuxntmdxz.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbnB5eXZhbXp1dHV4bnRtZHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTg3MDQsImV4cCI6MjA5NDIzNDcwNH0.1aSEgHAKz8cndND7o2gCWSyAzggeX8DOXrje4fH6Xkg";
const supabase = createClient(SUPA_URL, SUPA_KEY);

// ── Constants ───────────────────────────────────────────────────────────────
const SQUARE = "https://square.link/u/Wx7s5x21";
const STRIPE = "https://buy.stripe.com/5kQ3cu7kNbX08XbesSgw000";
const LEGAL  = "https://drive.google.com/drive/folders/1Pw-v8LkfQrjtk63Fl4BEbqg34GI7wc8j?usp=share_link";
const SITE   = "https://www.usi101.com/mind-by-twc";

const C = {
  navy:"#1a1a2e", gold:"#c9a84c", goldSoft:"#f5eedc",
  red:"#b5341a", purple:"#7C6FAD", green:"#4A8C6F",
  orange:"#C4783A", blue:"#3A7DB5", bg:"#f5f5f7",
};

const PILLARS = [
  { id:"sleep",    icon:"🌙", label:"Sleep",     sub:"Rest before weight loss",    col:"#7C6FAD", light:"#EDE9F8", free:true,
    prompts:["What time did I sleep?","How rested do I feel? (1-10)","Any wins or disruptions?"],
    tip:"Late nights cost more than food. Sleep is your first medicine." },
  { id:"nervous",  icon:"🌿", label:"Calm Body", sub:"Regulate before you hustle", col:"#4A8C6F", light:"#E4F4EC", free:true,
    prompts:["Did I walk or move gently today?","Did I pause and breathe?","Stress level? (1-10)"],
    tip:"You do not need intensity. You need rhythm." },
  { id:"nourish",  icon:"🥗", label:"Nourish",   sub:"Protein before restriction", col:"#C4783A", light:"#FDF0E4", free:false,
    prompts:["Did I eat protein at each meal?","Did I drink enough water?","Any emotional eating moments?"],
    tip:"Feed your body. Do not punish it." },
  { id:"structure",icon:"📅", label:"Structure", sub:"Systems before motivation",  col:"#3A7DB5", light:"#E3EEF8", free:false,
    prompts:["Did I follow my morning plan?","What one habit did I repeat?","What needs adjusting?"],
    tip:"Motivation fades. Systems stay." },
  { id:"identity", icon:"✨", label:"Identity",  sub:"Promise kept to yourself",   col:"#b5341a", light:"#F8EDE3", free:false,
    prompts:["What small promise did I keep today?","How do I describe myself?","One win, however tiny?"],
    tip:"You are becoming someone who keeps their word to themselves." },
];

const MOODS = ["😞","😐","🙂","😊","🌟"];
const DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function todayKey() { return new Date().toISOString().split("T")[0]; }
function weekDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + offset * 7);
  return Array.from({length:7}, (_,i) => {
    const x = new Date(d); x.setDate(d.getDate()+i);
    return x.toISOString().split("T")[0];
  });
}
function fmtDate(key) {
  return new Date(key+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
}

async function askClaude(prompt, sys) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:200,
        system: sys || "You are a warm, grounded wellbeing coach for InnerProof by MindByTWC. Keep responses to 2-3 sentences. Be specific, honest, never preachy. Speak like a wise trusted friend.",
        messages:[{role:"user",content:prompt}]
      })
    });
    const d = await r.json();
    return d?.content?.[0]?.text || "Keep going. One step at a time.";
  } catch(e) { return "Keep going. One step at a time."; }
}

// ── Auth Screen ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function sendMagicLink() {
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: "https://innerproofapp.usi101.com" }
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true); setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.navy},#2d2d5e)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:800,color:C.gold,letterSpacing:3}}>
            INNER<span style={{color:"#fff"}}>PROOF</span>
          </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontFamily:"sans-serif",marginTop:4}}>BY MINDBYTWC</div>
          <p style={{color:"rgba(255,255,255,0.6)",fontFamily:"Georgia,serif",fontSize:13,marginTop:12,lineHeight:1.6,fontStyle:"italic"}}>
            Build evidence of who you are becoming.
          </p>
        </div>

        <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          {!sent ? (
            <>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:18,color:C.navy,margin:"0 0 6px"}}>Welcome back</h2>
              <p style={{fontFamily:"sans-serif",fontSize:12,color:"#999",margin:"0 0 20px",lineHeight:1.5}}>
                Enter your email and we will send you a magic link to sign in instantly. No password needed.
              </p>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:6,letterSpacing:1}}>YOUR EMAIL</label>
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key==="Enter" && sendMagicLink()}
                placeholder="you@example.com"
                style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${error?"#f4b8b8":"#eee"}`,fontFamily:"sans-serif",fontSize:14,color:C.navy,marginBottom:10,boxSizing:"border-box",outline:"none"}}
              />
              {error && <p style={{fontFamily:"sans-serif",fontSize:11,color:C.red,margin:"0 0 10px",fontWeight:600}}>{error}</p>}
              <button onClick={sendMagicLink} disabled={loading} style={{
                width:"100%",padding:"13px 0",borderRadius:10,border:"none",
                background:loading?"#ddd":C.gold,color:C.navy,
                fontFamily:"sans-serif",fontWeight:800,fontSize:14,cursor:loading?"not-allowed":"pointer"
              }}>
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
              <p style={{fontFamily:"sans-serif",fontSize:10,color:"#ccc",textAlign:"center",margin:"12px 0 0",lineHeight:1.5}}>
                By continuing you agree to our{" "}
                <a href={LEGAL} target="_blank" rel="noopener" style={{color:C.purple}}>Terms of Service</a>{" "}and{" "}
                <a href={LEGAL} target="_blank" rel="noopener" style={{color:C.purple}}>Privacy Policy</a>.
              </p>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"10px 0"}}>
              <div style={{fontSize:48,marginBottom:16}}>📧</div>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:18,color:C.navy,margin:"0 0 10px"}}>Check your inbox</h2>
              <p style={{fontFamily:"sans-serif",fontSize:13,color:"#666",lineHeight:1.6,margin:"0 0 16px"}}>
                We sent a magic link to <strong>{email}</strong>. Click it to sign in to InnerProof.
              </p>
              <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",lineHeight:1.5}}>
                No email? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} style={{background:"none",border:"none",color:C.purple,cursor:"pointer",fontFamily:"sans-serif",fontSize:11,fontWeight:700,padding:0}}>try again</button>.
              </p>
            </div>
          )}
        </div>
        <p style={{textAlign:"center",fontFamily:"sans-serif",fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:20}}>
          Powered by <a href={SITE} target="_blank" rel="noopener" style={{color:C.gold,textDecoration:"none",fontWeight:700}}>MindByTWC</a>
        </p>
      </div>
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ view, setView, streak, pro, user, onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);
  const tabs = [
    {id:"today",     label:"Today"},
    {id:"intention", label:"Intention"},
    {id:"review",    label:"True Rhythm", lock:!pro},
    {id:"log",       label:"Proof Log"},
    {id:"dashboard", label:"Dashboard",  lock:!pro},
  ];
  return (
    <header style={{background:C.navy,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
      <div style={{maxWidth:520,margin:"0 auto",padding:"12px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <a href={SITE} target="_blank" rel="noopener" style={{textDecoration:"none"}}>
              <span style={{fontSize:17,fontWeight:800,color:C.gold,letterSpacing:2,fontFamily:"Georgia,serif"}}>INNER</span>
              <span style={{fontSize:17,fontWeight:800,color:"#fff",letterSpacing:2,fontFamily:"Georgia,serif"}}>PROOF</span>
            </a>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontFamily:"sans-serif",letterSpacing:1,marginTop:1}}>BY MINDBYTWC</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {streak > 0 && (
              <div style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:16,padding:"3px 9px",display:"flex",alignItems:"center",gap:3}}>
                <span style={{fontSize:13}}>🔥</span>
                <span style={{color:C.gold,fontSize:10,fontWeight:700,fontFamily:"sans-serif"}}>{streak}d</span>
              </div>
            )}
            <span style={{background:pro?C.gold:"rgba(255,255,255,0.08)",color:pro?C.navy:"rgba(255,255,255,0.4)",fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:8,fontFamily:"sans-serif",letterSpacing:0.5}}>
              {pro?"PRO":"FREE"}
            </span>
            <div style={{position:"relative"}}>
              <button onClick={() => setShowMenu(v=>!v)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",color:"#fff",fontSize:14}}>
                👤
              </button>
              {showMenu && (
                <div style={{position:"absolute",right:0,top:"110%",background:"#fff",borderRadius:12,padding:"8px",boxShadow:"0 8px 24px rgba(0,0,0,0.15)",minWidth:180,zIndex:200}}>
                  <p style={{fontFamily:"sans-serif",fontSize:11,color:"#aaa",padding:"4px 8px",margin:0}}>{user?.email}</p>
                  <div style={{height:1,background:"#eee",margin:"6px 0"}}/>
                  <button onClick={() => { setView("dashboard"); setShowMenu(false); }} style={{display:"block",width:"100%",padding:"8px",background:"none",border:"none",cursor:"pointer",fontFamily:"sans-serif",fontSize:13,color:C.navy,textAlign:"left",borderRadius:8}}>
                    📊 My Dashboard
                  </button>
                  <button onClick={onSignOut} style={{display:"block",width:"100%",padding:"8px",background:"none",border:"none",cursor:"pointer",fontFamily:"sans-serif",fontSize:13,color:C.red,textAlign:"left",borderRadius:8}}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:3,overflowX:"auto"}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              flexShrink:0,padding:"6px 10px",borderRadius:"7px 7px 0 0",border:"none",
              cursor:"pointer",fontFamily:"sans-serif",fontSize:10,fontWeight:700,
              background:view===t.id?C.bg:"transparent",
              color:view===t.id?C.navy:"rgba(255,255,255,0.45)",
            }}>
              {t.label}{t.lock?" 🔒":""}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// ── Upgrade Gate ─────────────────────────────────────────────────────────────
function Gate({ onDemo }) {
  const [agreed, setAgreed] = useState(false);
  const [warn,   setWarn]   = useState(false);
  function pay(url) { if (!agreed) { setWarn(true); return; } window.open(url,"_blank"); }
  return (
    <div style={{maxWidth:460,margin:"32px auto",padding:"0 16px"}}>
      <div style={{background:"#fff",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
        <div style={{background:`linear-gradient(135deg,${C.navy},#2d2d5e)`,padding:"26px 22px",textAlign:"center"}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:800,color:C.gold,letterSpacing:2}}>INNER<span style={{color:"#fff"}}>PROOF</span></div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontFamily:"sans-serif",margin:"3px 0 12px"}}>PRO</div>
          <p style={{color:"rgba(255,255,255,0.7)",fontFamily:"Georgia,serif",fontSize:13,margin:0,lineHeight:1.6,fontStyle:"italic"}}>Find your true rhythm. Build proof of who you are becoming.</p>
        </div>
        <div style={{padding:"18px 22px"}}>
          {[["📊","True Rhythm Report - your weekly pattern at a glance"],["✨","Full AI coaching insight on every pillar"],["📅","All 5 pillars: Structure, Identity and Nourish unlocked"],["🌅","Daily intention setter with smart reminders"],["📈","Full progress dashboard with charts and streaks"]].map(([icon,text],i) => (
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",marginBottom:9}}>
              <span style={{fontSize:17}}>{icon}</span>
              <span style={{fontFamily:"sans-serif",fontSize:12,color:"#444"}}>{text}</span>
            </div>
          ))}
          <div style={{background:C.goldSoft,borderRadius:11,padding:"12px 14px",margin:"14px 0",textAlign:"center"}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:20,color:C.navy,fontWeight:700}}>GBP 4.99 <span style={{fontSize:13,fontWeight:400}}>/month</span></div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#888",marginTop:2}}>or GBP 39/year - save 35%</div>
          </div>
          <div onClick={() => { setAgreed(a=>!a); setWarn(false); }} style={{display:"flex",alignItems:"flex-start",gap:11,cursor:"pointer",background:agreed?"#f0f7f0":warn?"#fff5f5":"#f9f9f9",border:`1.5px solid ${agreed?"#c3e0c3":warn?"#f4b8b8":"#e8e8e8"}`,borderRadius:9,padding:"11px 13px",marginBottom:9,transition:"all 0.2s"}}>
            <div style={{width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,border:`2px solid ${agreed?C.green:warn?C.red:"#ccc"}`,background:agreed?C.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
              {agreed && <span style={{color:"#fff",fontSize:12,fontWeight:800,lineHeight:1}}>✓</span>}
            </div>
            <p style={{fontFamily:"sans-serif",fontSize:11,color:"#444",margin:0,lineHeight:1.6}}>
              I agree to the <a href={LEGAL} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{color:C.purple,fontWeight:700}}>Terms of Service</a>,{" "}
              <a href={LEGAL} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{color:C.purple,fontWeight:700}}>Privacy Policy</a> and{" "}
              <a href={LEGAL} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{color:C.purple,fontWeight:700}}>Refund Policy</a>.
            </p>
          </div>
          {warn && !agreed && <p style={{fontFamily:"sans-serif",fontSize:11,color:C.red,textAlign:"center",margin:"0 0 9px",fontWeight:600}}>Please accept the Terms before continuing.</p>}
          <p style={{fontFamily:"sans-serif",fontSize:10,color:"#aaa",textAlign:"center",margin:"0 0 7px",letterSpacing:0.5}}>CHOOSE HOW TO PAY</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:4}}>
            <button onClick={() => pay(SQUARE)} style={{padding:"12px 0",borderRadius:11,border:"none",background:agreed?C.gold:"#ddd",color:agreed?C.navy:"#aaa",fontFamily:"sans-serif",fontWeight:800,fontSize:12,cursor:agreed?"pointer":"not-allowed",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.2s"}}>
              <span>Pay with Square</span><span style={{fontSize:9,fontWeight:400,opacity:0.7}}>square.link</span>
            </button>
            <button onClick={() => pay(STRIPE)} style={{padding:"12px 0",borderRadius:11,border:agreed?`2px solid ${C.navy}`:"2px solid #ddd",background:agreed?"#fff":"#f5f5f5",color:agreed?C.navy:"#bbb",fontFamily:"sans-serif",fontWeight:800,fontSize:12,cursor:agreed?"pointer":"not-allowed",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.2s"}}>
              <span>Pay with Stripe</span><span style={{fontSize:9,fontWeight:400,opacity:0.6}}>buy.stripe.com</span>
            </button>
          </div>
          <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",textAlign:"center",margin:"5px 0 0"}}>Both options start your 7-day free trial - no charge today</p>
          <div style={{background:"#f0f7f0",border:"1px solid #c3e0c3",borderRadius:9,padding:"9px 12px",margin:"10px 0 8px",textAlign:"center"}}>
            <p style={{fontFamily:"sans-serif",fontSize:11,color:"#3a6b3a",margin:0,lineHeight:1.6}}>
              🔒 No charge for 7 days. Cancel anytime.<br/><strong>We will remind you 2 days before billing starts.</strong>
            </p>
          </div>
          <p style={{textAlign:"center",fontSize:10,color:"#ccc",fontFamily:"sans-serif",margin:"4px 0 8px"}}>
            Secure payment via Square and Stripe - Powered by <a href={SITE} target="_blank" rel="noopener" style={{color:C.gold,fontWeight:700}}>MindByTWC</a>
          </p>
          <button onClick={onDemo} style={{display:"block",width:"100%",padding:"9px 0",borderRadius:9,border:`1px dashed ${C.purple}`,background:"transparent",color:C.purple,fontFamily:"sans-serif",fontSize:11,cursor:"pointer",fontWeight:600}}>
            Preview PRO mode (demo)
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pillar Card ───────────────────────────────────────────────────────────────
function PillarCard({ pillar, data, onSave, locked }) {
  const [open,    setOpen]    = useState(false);
  const [notes,   setNotes]   = useState(data?.notes||"");
  const [score,   setScore]   = useState(data?.score??null);
  const [insight, setInsight] = useState(data?.insight||"");
  const [loading, setLoading] = useState(false);
  const done = data?.score != null;

  useEffect(() => {
    setNotes(data?.notes||"");
    setScore(data?.score??null);
    setInsight(data?.insight||"");
  }, [data]);

  async function handleSave() {
    if (!notes.trim() && score===null) return;
    setLoading(true);
    let ins = insight;
    if (notes.trim() && !insight) {
      ins = await askClaude(`InnerProof pillar: ${pillar.label}\nNotes: "${notes}"\nGive one specific grounded insight to help them build proof.`);
      setInsight(ins);
    }
    onSave({notes, score, insight:ins});
    setLoading(false); setOpen(false);
  }

  if (locked) return (
    <div style={{borderRadius:13,marginBottom:9,border:"1.5px solid #eee",background:"#fafafa",opacity:0.6}}>
      <div style={{display:"flex",alignItems:"center",gap:11,padding:"12px 15px"}}>
        <span style={{fontSize:21,filter:"grayscale(1)"}}>{pillar.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:14,color:"#aaa",fontWeight:700}}>{pillar.label}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:"#ccc",marginTop:1}}>Unlock with InnerProof PRO</div>
        </div>
        <span style={{fontSize:13}}>🔒</span>
      </div>
    </div>
  );

  return (
    <div style={{borderRadius:13,marginBottom:9,border:`1.5px solid ${done?pillar.col:"#e8e8e8"}`,background:"#fff",boxShadow:done?`0 2px 10px ${pillar.col}22`:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <button onClick={() => setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"12px 15px",background:done?pillar.light:"#fff",border:"none",cursor:"pointer",textAlign:"left",borderRadius:13}}>
        <span style={{fontSize:21}}>{pillar.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:14,color:C.navy,fontWeight:700}}>{pillar.label}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:"#aaa",marginTop:1}}>{pillar.sub}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          {done && <span style={{fontSize:14}}>✅</span>}
          {score!=null && <span style={{background:pillar.col,color:"#fff",borderRadius:7,padding:"2px 6px",fontSize:10,fontFamily:"sans-serif",fontWeight:700}}>{score}/5</span>}
          <span style={{color:"#ccc",fontSize:12}}>{open?"▲":"▼"}</span>
        </div>
      </button>
      {open && (
        <div style={{padding:"0 15px 15px",borderTop:`1px solid ${pillar.light}`}}>
          <p style={{fontSize:11,color:pillar.col,fontStyle:"italic",fontFamily:"sans-serif",margin:"10px 0 9px",padding:"7px 11px",background:pillar.light,borderRadius:7}}>{pillar.tip}</p>
          <p style={{fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:0.5}}>REFLECT ON:</p>
          <ul style={{margin:"0 0 9px",paddingLeft:16}}>
            {pillar.prompts.map((p,i) => <li key={i} style={{fontSize:11,color:"#666",fontFamily:"sans-serif",marginBottom:3}}>{p}</li>)}
          </ul>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Write anything - one honest sentence counts."
            style={{width:"100%",minHeight:65,borderRadius:9,border:"1.5px solid #eee",padding:"9px 11px",fontFamily:"sans-serif",fontSize:12,color:"#333",resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.5,marginBottom:9}}/>
          <div style={{display:"flex",gap:5,marginBottom:11}}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setScore(n)} style={{flex:1,padding:"7px 0",borderRadius:7,border:score===n?`2px solid ${pillar.col}`:"2px solid #eee",background:score===n?pillar.light:"#fafafa",color:score===n?pillar.col:"#bbb",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>{n}</button>
            ))}
          </div>
          {insight && (
            <div style={{background:"#f9f6ff",border:"1px solid #e8e0ff",borderRadius:9,padding:"9px 11px",marginBottom:9}}>
              <p style={{fontSize:10,color:C.purple,fontWeight:700,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>YOUR INNERPROOF INSIGHT</p>
              <p style={{fontSize:12,color:"#444",fontFamily:"sans-serif",lineHeight:1.55,margin:0}}>{insight}</p>
            </div>
          )}
          <button onClick={handleSave} disabled={loading} style={{width:"100%",padding:"10px 0",borderRadius:9,border:"none",background:loading?"#ddd":pillar.col,color:"#fff",fontFamily:"sans-serif",fontWeight:700,fontSize:12,cursor:loading?"not-allowed":"pointer"}}>
            {loading?"Getting insight...":done?"Update":"Save and Get Insight"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Today View ────────────────────────────────────────────────────────────────
function TodayView({ userId, pro, setView, dbData, setDbData }) {
  const key = todayKey();
  const entry = dbData.entries[key] || {};
  const pillars = dbData.pillars[key] || {};
  const [mood, setMood] = useState(entry.mood??null);
  const [saving, setSaving] = useState(false);

  async function saveMood(v) {
    setMood(v);
    setSaving(true);
    const { data: existing } = await supabase.from("entries").select("id").eq("user_id",userId).eq("entry_date",key).single();
    if (existing) {
      await supabase.from("entries").update({mood:v}).eq("user_id",userId).eq("entry_date",key);
    } else {
      await supabase.from("entries").insert({user_id:userId,entry_date:key,mood:v});
    }
    setDbData(d => ({...d, entries:{...d.entries,[key]:{...entry,mood:v}}}));
    setSaving(false);
  }

  async function savePillar(pid, val) {
    const { data: existing } = await supabase.from("pillar_entries").select("id").eq("user_id",userId).eq("entry_date",key).eq("pillar_id",pid).single();
    if (existing) {
      await supabase.from("pillar_entries").update({notes:val.notes,score:val.score,insight:val.insight}).eq("user_id",userId).eq("entry_date",key).eq("pillar_id",pid);
    } else {
      await supabase.from("pillar_entries").insert({user_id:userId,entry_date:key,pillar_id:pid,...val});
    }
    setDbData(d => ({...d, pillars:{...d.pillars,[key]:{...pillars,[pid]:val}}}));
  }

  const done = PILLARS.filter(p => pillars[p.id]?.score!=null).length;
  const pct  = Math.round((done/PILLARS.length)*100);
  const intent = entry.intention_text;

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      {intent && (
        <div style={{background:C.goldSoft,borderRadius:13,padding:"11px 15px",marginBottom:13,border:`1px solid ${C.gold}44`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:3,letterSpacing:1}}>TODAY'S INTENTION</div>
          {entry.intention_word && <div style={{fontFamily:"Georgia,serif",fontSize:18,color:C.navy,fontWeight:700,marginBottom:2}}>{entry.intention_word}</div>}
          <div style={{fontFamily:"sans-serif",fontSize:12,color:"#666",lineHeight:1.5}}>{intent}</div>
          {entry.intention_ai && <div style={{fontFamily:"Georgia,serif",fontSize:11,color:C.orange,fontStyle:"italic",marginTop:5}}>"{entry.intention_ai}"</div>}
        </div>
      )}
      <div style={{background:"#fff",borderRadius:13,padding:"13px 15px",marginBottom:13,border:"1.5px solid #eee"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,fontWeight:700}}>Today's InnerProof</span>
          <span style={{fontFamily:"sans-serif",fontWeight:800,color:C.gold,fontSize:14}}>{pct}%</span>
        </div>
        <div style={{height:7,background:"#eee",borderRadius:5,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.red},${C.gold})`,borderRadius:5,transition:"width 0.4s"}}/>
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",margin:"5px 0 0"}}>{done} of 5 pillars checked {done===5?"- Full proof today!":""}</p>
      </div>
      <div style={{marginBottom:13}}>
        <p style={{fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:5,letterSpacing:0.5}}>OVERALL FEELING TODAY</p>
        <div style={{display:"flex",gap:5}}>
          {MOODS.map((m,i) => (
            <button key={i} onClick={() => saveMood(i)} style={{flex:1,fontSize:19,padding:"8px 0",borderRadius:9,border:mood===i?`2px solid ${C.gold}`:"2px solid #eee",background:mood===i?C.goldSoft:"#fafafa",cursor:"pointer"}}>{m}</button>
          ))}
        </div>
      </div>
      {PILLARS.map(p => (
        <PillarCard key={p.id} pillar={p} data={pillars[p.id]} onSave={val=>savePillar(p.id,val)} locked={!pro&&!p.free}/>
      ))}
      {!pro && (
        <div style={{background:"#f9f6ff",borderRadius:13,padding:"15px",border:"1px solid #e8e0ff",marginTop:5,textAlign:"center"}}>
          <p style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 4px"}}>Unlock your full InnerProof</p>
          <p style={{fontFamily:"sans-serif",fontSize:11,color:"#999",margin:"0 0 11px"}}>Structure, Identity and Nourish are ready for you.</p>
          <button onClick={() => setView("upgrade")} style={{background:C.gold,color:C.navy,border:"none",borderRadius:9,fontFamily:"sans-serif",fontWeight:800,fontSize:12,padding:"9px 20px",cursor:"pointer"}}>
            Start My 7-Day Free Trial
          </button>
          <p style={{fontFamily:"sans-serif",fontSize:9,color:"#ddd",margin:"8px 0 0"}}>
            By starting you agree to our <a href={LEGAL} target="_blank" rel="noopener" style={{color:C.purple}}>Terms</a>.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Intention View ─────────────────────────────────────────────────────────
function IntentionView({ userId, dbData, setDbData }) {
  const key  = todayKey();
  const entry = dbData.entries[key] || {};
  const [word,    setWord]    = useState(entry.intention_word||"");
  const [intent,  setIntent]  = useState(entry.intention_text||"");
  const [rel,     setRel]     = useState(entry.intention_release||"");
  const [ai,      setAi]      = useState(entry.intention_ai||"");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(!!entry.intention_text);
  const [reminders, setReminders] = useState([]);
  const [rLabel, setRLabel] = useState("Morning InnerProof check-in");
  const [rTime,  setRTime]  = useState("07:00");
  const [showForm, setShowForm] = useState(false);

  async function save() {
    if (!intent.trim()) return;
    setLoading(true);
    let sentence = ai;
    if (!ai) {
      sentence = await askClaude(`My word for today is "${word}". My intention: "${intent}". I want to release: "${rel}". Give me one grounding sentence to carry into my day.`);
      setAi(sentence);
    }
    const payload = {intention_word:word, intention_text:intent, intention_release:rel, intention_ai:sentence};
    const { data: existing } = await supabase.from("entries").select("id").eq("user_id",userId).eq("entry_date",key).single();
    if (existing) {
      await supabase.from("entries").update(payload).eq("user_id",userId).eq("entry_date",key);
    } else {
      await supabase.from("entries").insert({user_id:userId,entry_date:key,...payload});
    }
    setDbData(d => ({...d, entries:{...d.entries,[key]:{...entry,...payload}}}));
    setDone(true); setLoading(false);
  }

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>Set Your Intention</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Anchor your day before the world pulls you in every direction.</p>
      </div>
      <div style={{background:"#fff",borderRadius:15,padding:"16px",marginBottom:13,border:"1.5px solid #eee"}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>MY ONE WORD TODAY</label>
        <input value={word} onChange={e=>setWord(e.target.value)} placeholder="e.g. Steady - Present - Aligned"
          style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"Georgia,serif",fontSize:15,color:C.navy,marginBottom:13,boxSizing:"border-box",outline:"none"}}/>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>MY INNERPROOF INTENTION</label>
        <textarea value={intent} onChange={e=>setIntent(e.target.value)} placeholder="Today I choose to... / I am building proof that..."
          style={{width:"100%",minHeight:70,padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"sans-serif",fontSize:12,color:"#333",resize:"vertical",marginBottom:13,boxSizing:"border-box",outline:"none",lineHeight:1.55}}/>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>I RELEASE TODAY</label>
        <input value={rel} onChange={e=>setRel(e.target.value)} placeholder="e.g. the need to be perfect - yesterday's guilt"
          style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"sans-serif",fontSize:12,color:"#333",marginBottom:13,boxSizing:"border-box",outline:"none"}}/>
        {ai && (
          <div style={{background:C.goldSoft,border:`1px solid ${C.gold}55`,borderRadius:9,padding:"10px 13px",marginBottom:13}}>
            <p style={{fontSize:10,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>YOUR GROUNDING SENTENCE</p>
            <p style={{fontSize:12,color:"#444",fontFamily:"Georgia,serif",lineHeight:1.6,margin:0,fontStyle:"italic"}}>"{ai}"</p>
          </div>
        )}
        <button onClick={save} disabled={loading||!intent.trim()} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:loading||!intent.trim()?"#ddd":C.gold,color:C.navy,fontFamily:"sans-serif",fontWeight:800,fontSize:13,cursor:loading||!intent.trim()?"not-allowed":"pointer"}}>
          {loading?"Finding your grounding sentence...":done?"Update Intention":"Set Intention and Get Grounding Sentence"}
        </button>
      </div>
      <div style={{background:"#fff",borderRadius:15,padding:"16px",border:"1.5px solid #eee"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
          <div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:15,color:C.navy,margin:"0 0 2px"}}>Reminders</h2>
            <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",margin:0}}>Keep your true rhythm on track</p>
          </div>
          <button onClick={() => setShowForm(v=>!v)} style={{background:C.navy,color:"#fff",border:"none",borderRadius:7,padding:"6px 12px",fontFamily:"sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add</button>
        </div>
        {showForm && (
          <div style={{background:"#f9f9f9",borderRadius:9,padding:"11px",marginBottom:11,border:"1px solid #eee"}}>
            <input value={rLabel} onChange={e=>setRLabel(e.target.value)} placeholder="Reminder name"
              style={{width:"100%",padding:"7px 9px",borderRadius:7,border:"1px solid #ddd",fontFamily:"sans-serif",fontSize:12,marginBottom:7,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:7}}>
              <input type="time" value={rTime} onChange={e=>setRTime(e.target.value)} style={{flex:1,padding:"7px 9px",borderRadius:7,border:"1px solid #ddd",fontFamily:"sans-serif",fontSize:12}}/>
              <button onClick={() => { setReminders(r=>[...r,{label:rLabel,time:rTime}]); setShowForm(false); }} style={{flex:1,background:C.green,color:"#fff",border:"none",borderRadius:7,fontFamily:"sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>Save</button>
            </div>
          </div>
        )}
        {reminders.length===0
          ? <p style={{fontFamily:"sans-serif",fontSize:12,color:"#ccc",textAlign:"center",padding:"13px 0"}}>No reminders yet. Add one to stay in rhythm.</p>
          : reminders.map((r,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 11px",background:"#f9f9f9",borderRadius:9,marginBottom:7}}>
              <div>
                <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:"#333"}}>{r.label}</div>
                <div style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",marginTop:1}}>{r.time} daily</div>
              </div>
              <button onClick={() => setReminders(rs=>rs.filter((_,j)=>j!==i))} style={{background:"#fee8e8",border:"none",borderRadius:7,padding:"4px 9px",fontSize:11,color:C.red,cursor:"pointer",fontWeight:700}}>Remove</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── True Rhythm Review ────────────────────────────────────────────────────
function TrueRhythm({ userId, dbData }) {
  const [offset,     setOffset]     = useState(0);
  const [reflection, setReflection] = useState("");
  const [aiReview,   setAiReview]   = useState("");
  const [loading,    setLoading]    = useState(false);

  const days     = weekDays(offset);
  const weekData = days.map(k => ({key:k, day:new Date(k+"T12:00:00"), e:dbData.entries[k]||{}, p:dbData.pillars[k]||{}}));
  const checkedIn = weekData.filter(({p}) => PILLARS.some(pl => p[pl.id]));

  const totals = PILLARS.map(pl => {
    const scores = weekData.map(({p}) => p[pl.id]?.score).filter(Boolean);
    return {...pl, avg:scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):null, cnt:scores.length};
  });

  const best  = [...totals].filter(p=>p.avg).sort((a,b)=>b.avg-a.avg)[0];
  const needs = [...totals].filter(p=>p.avg).sort((a,b)=>a.avg-b.avg)[0];
  const moodArr = weekData.map(({e})=>e.mood).filter(v=>v!=null);
  const moodAvg = moodArr.length?(moodArr.reduce((a,b)=>a+b,0)/moodArr.length).toFixed(1):null;
  const sLabel = new Date(days[0]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  const eLabel = new Date(days[6]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});

  async function generate() {
    if (!checkedIn.length) return;
    setLoading(true);
    const summary = totals.map(p=>`${p.label}: ${p.avg||"no data"}/5`).join(", ");
    const text = await askClaude(
      `InnerProof True Rhythm ${sLabel}-${eLabel}:\nPillar averages: ${summary}\nDays: ${checkedIn.length}/7\nMood avg: ${moodAvg}/4\nReflection: "${reflection}"\n\nGive me: 1 win to celebrate, 1 honest pattern to notice, 1 tiny action for next week. Warm, practical, under 120 words.`,
      "You are the InnerProof True Rhythm coach. Help people see their weekly patterns clearly so they can align how they live with who they know they are. Be honest, warm, and specific."
    );
    setAiReview(text); setLoading(false);
  }

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>True Rhythm Report</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Your weekly InnerProof - where your real rhythm lives.</p>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={() => setOffset(o=>o-1)} style={{background:"#fff",border:"1.5px solid #eee",borderRadius:9,padding:"7px 13px",fontFamily:"sans-serif",fontSize:12,cursor:"pointer",fontWeight:700,color:C.navy}}>Prev</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:C.navy}}>{sLabel} - {eLabel}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",marginTop:1}}>{offset===0?"This week":offset===-1?"Last week":`${Math.abs(offset)} weeks ago`}</div>
        </div>
        <button onClick={() => setOffset(o=>Math.min(0,o+1))} disabled={offset===0} style={{background:offset===0?"#f5f5f5":"#fff",border:"1.5px solid #eee",borderRadius:9,padding:"7px 13px",fontFamily:"sans-serif",fontSize:12,cursor:offset===0?"not-allowed":"pointer",fontWeight:700,color:offset===0?"#ccc":C.navy}}>Next</button>
      </div>
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 11px"}}>Daily Check-ins</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {weekData.map(({key,day,p,e}) => {
            const cnt = PILLARS.filter(pl=>p[pl.id]?.score!=null).length;
            const isToday = key===todayKey();
            return (
              <div key={key} style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:"#bbb",fontFamily:"sans-serif",marginBottom:3}}>{DAYS[day.getDay()]}</div>
                <div style={{width:"100%",aspectRatio:"1",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:cnt===5?C.navy:cnt>0?`${C.gold}55`:"#f0f0f0",border:isToday?`2px solid ${C.gold}`:"2px solid transparent",fontSize:10,fontWeight:700,fontFamily:"sans-serif",color:cnt===5?"#fff":cnt>0?C.navy:"#ccc"}}>
                  {cnt>0?cnt:"."}
                </div>
                <div style={{fontSize:10,fontFamily:"sans-serif",marginTop:2}}>{e.mood!=null?MOODS[e.mood]:""}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 11px"}}>This Week's Pillar Rhythm</h3>
        {totals.map(p => (
          <div key={p.id} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontFamily:"sans-serif",fontSize:11,color:"#555"}}>{p.icon} {p.label}</span>
              <span style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:p.col}}>{p.avg?`${p.avg}/5 (${p.cnt}d)`:"--"}</span>
            </div>
            <div style={{height:6,background:"#f0f0f0",borderRadius:5,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.avg?(p.avg/5)*100:0}%`,background:p.col,borderRadius:5,transition:"width 0.5s"}}/>
            </div>
          </div>
        ))}
      </div>
      {(best||needs) && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
          {best && <div style={{background:best.light,borderRadius:11,padding:"11px",border:`1px solid ${best.col}44`}}>
            <div style={{fontSize:9,fontWeight:700,color:best.col,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>STRONGEST</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{best.icon} {best.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {best.avg}/5</div>
          </div>}
          {needs && needs.id!==best?.id && <div style={{background:"#fff8f0",borderRadius:11,padding:"11px",border:"1px solid #f4d0a033"}}>
            <div style={{fontSize:9,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>NEEDS LOVE</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{needs.icon} {needs.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {needs.avg}/5</div>
          </div>}
        </div>
      )}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:14,color:C.navy,margin:"0 0 3px"}}>AI True Rhythm Coach</h3>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",margin:"0 0 9px"}}>Add a reflection then get your personalised weekly insight.</p>
        <textarea value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="How did this week feel? What surprised you?"
          style={{width:"100%",minHeight:65,padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"sans-serif",fontSize:12,color:"#333",resize:"vertical",marginBottom:9,boxSizing:"border-box",outline:"none",lineHeight:1.5}}/>
        {aiReview && (
          <div style={{background:"#f9f6ff",border:"1px solid #e8e0ff",borderRadius:9,padding:"11px",marginBottom:9}}>
            <p style={{fontSize:10,fontWeight:700,color:C.purple,fontFamily:"sans-serif",marginBottom:5,letterSpacing:0.5}}>YOUR TRUE RHYTHM INSIGHT</p>
            <p style={{fontSize:12,color:"#444",fontFamily:"sans-serif",lineHeight:1.6,margin:0,whiteSpace:"pre-wrap"}}>{aiReview}</p>
          </div>
        )}
        <button onClick={generate} disabled={loading||!checkedIn.length} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:loading||!checkedIn.length?"#ddd":C.navy,color:"#fff",fontFamily:"sans-serif",fontWeight:700,fontSize:13,cursor:loading||!checkedIn.length?"not-allowed":"pointer"}}>
          {loading?"Generating your True Rhythm Report...":!checkedIn.length?"No check-ins this week yet":"Generate My True Rhythm Report"}
        </button>
      </div>
    </div>
  );
}

// ── Proof Log ─────────────────────────────────────────────────────────────
function ProofLog({ dbData }) {
  const days = Object.keys(dbData.entries).sort((a,b)=>b.localeCompare(a)).slice(0,60);
  if (!days.length) return (
    <div style={{padding:40,textAlign:"center",color:"#ccc",fontFamily:"sans-serif"}}>
      <div style={{fontSize:38,marginBottom:11}}>📅</div>
      <p style={{fontFamily:"Georgia,serif",fontSize:14,color:"#aaa"}}>Your proof log starts today.</p>
    </div>
  );
  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>Your Proof Log</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Every entry is evidence of who you are becoming.</p>
      </div>
      {days.map(day => {
        const e = dbData.entries[day]||{};
        const p = dbData.pillars[day]||{};
        const scores = PILLARS.map(pl=>p[pl.id]?.score).filter(Boolean);
        const cnt = scores.length;
        const avg = cnt?(scores.reduce((a,b)=>a+b,0)/cnt).toFixed(1):null;
        return (
          <div key={day} style={{background:"#fff",borderRadius:13,padding:"12px 15px",marginBottom:7,border:"1.5px solid #eee"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,fontWeight:700}}>{fmtDate(day)}</div>
                <div style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",marginTop:1}}>{cnt}/5 pillars - {e.mood!=null?MOODS[e.mood]:"--"}</div>
                {e.intention_word && <div style={{fontFamily:"sans-serif",fontSize:10,color:C.gold,marginTop:1,fontWeight:700}}>"{e.intention_word}"</div>}
              </div>
              {avg && <div style={{textAlign:"right"}}>
                <div style={{fontSize:17,fontWeight:800,color:C.gold,fontFamily:"sans-serif"}}>{avg}</div>
                <div style={{fontSize:9,color:"#ccc",fontFamily:"sans-serif"}}>avg</div>
              </div>}
            </div>
            <div style={{display:"flex",gap:4,marginTop:7}}>
              {PILLARS.map(pl=><div key={pl.id} title={pl.label} style={{flex:1,height:4,borderRadius:3,background:p[pl.id]?.score?pl.col:"#eee"}}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ dbData, user, pro, onUpgrade }) {
  if (!pro) return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <Gate onDemo={onUpgrade}/>
    </div>
  );

  const allDays = Object.keys(dbData.entries).sort();
  const allPillars = Object.keys(dbData.pillars);

  // Streak
  let streak = 0;
  const sd = new Date();
  while (true) {
    const k = sd.toISOString().split("T")[0];
    const p = dbData.pillars[k]||{};
    if (!Object.keys(p).length) break;
    streak++; sd.setDate(sd.getDate()-1);
  }

  // Consistency - last 30 days
  const last30 = Array.from({length:30},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-29+i);
    return d.toISOString().split("T")[0];
  });

  // Pillar averages all time
  const pillarAvgs = PILLARS.map(pl => {
    const scores = allPillars.map(day=>(dbData.pillars[day]||{})[pl.id]?.score).filter(Boolean);
    return {...pl, avg:scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):null, total:scores.length};
  });

  // Weekly scores for chart (last 8 weeks)
  const weeklyData = Array.from({length:8},(_,i) => {
    const days = weekDays(-7+i);
    const scores = days.flatMap(k => PILLARS.map(pl=>(dbData.pillars[k]||{})[pl.id]?.score).filter(Boolean));
    const avg = scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):null;
    const label = new Date(days[0]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
    return {label, avg, cnt:days.filter(k=>Object.keys(dbData.pillars[k]||{}).length>0).length};
  });

  const strongest = [...pillarAvgs].filter(p=>p.avg).sort((a,b)=>b.avg-a.avg)[0];
  const needsLove = [...pillarAvgs].filter(p=>p.avg).sort((a,b)=>a.avg-b.avg)[0];
  const totalCheckins = allPillars.length;
  const intentionDays = allDays.filter(d=>dbData.entries[d]?.intention_text).length;
  const maxWeekly = Math.max(...weeklyData.map(w=>parseFloat(w.avg||0)),1);

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>Your Progress Dashboard</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Your InnerProof evidence, all in one place.</p>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:13}}>
        {[
          {label:"Day Streak",  val:`${streak}🔥`},
          {label:"Total Days",  val:totalCheckins},
          {label:"Intentions",  val:intentionDays},
          {label:"Avg Score",   val: (() => { const sc = allPillars.flatMap(d=>PILLARS.map(p=>(dbData.pillars[d]||{})[p.id]?.score).filter(Boolean)); return sc.length?(sc.reduce((a,b)=>a+b,0)/sc.length).toFixed(1):"--"; })()},
        ].map(s => (
          <div key={s.label} style={{background:"#fff",borderRadius:11,padding:"10px 6px",border:"1.5px solid #eee",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:C.gold,fontFamily:"sans-serif"}}>{s.val}</div>
            <div style={{fontSize:8,color:"#bbb",fontFamily:"sans-serif",marginTop:2,lineHeight:1.3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 30-day consistency calendar */}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 10px"}}>30-Day Consistency</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:3}}>
          {last30.map(k => {
            const p = dbData.pillars[k]||{};
            const cnt = PILLARS.filter(pl=>p[pl.id]?.score!=null).length;
            const isToday = k===todayKey();
            return (
              <div key={k} title={fmtDate(k)} style={{aspectRatio:"1",borderRadius:4,background:cnt===5?C.navy:cnt>0?`${C.gold}88`:"#f0f0f0",border:isToday?`2px solid ${C.gold}`:"2px solid transparent"}}/>
            );
          })}
        </div>
        <div style={{display:"flex",gap:10,marginTop:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:3,alignItems:"center"}}><div style={{width:8,height:8,background:C.navy,borderRadius:2}}/><span style={{fontSize:9,color:"#aaa",fontFamily:"sans-serif"}}>All 5</span></div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}><div style={{width:8,height:8,background:`${C.gold}88`,borderRadius:2}}/><span style={{fontSize:9,color:"#aaa",fontFamily:"sans-serif"}}>Partial</span></div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}><div style={{width:8,height:8,background:"#f0f0f0",borderRadius:2}}/><span style={{fontSize:9,color:"#aaa",fontFamily:"sans-serif"}}>Missed</span></div>
        </div>
      </div>

      {/* Weekly score trend */}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 12px"}}>Weekly Score Trend</h3>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
          {weeklyData.map((w,i) => (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{fontSize:9,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{w.avg||""}</div>
              <div style={{width:"100%",background:w.avg?C.gold:"#f0f0f0",borderRadius:"3px 3px 0 0",height:`${w.avg?(parseFloat(w.avg)/maxWeekly)*55:4}px`,transition:"height 0.5s",minHeight:4}}/>
              <div style={{fontSize:7,color:"#ccc",fontFamily:"sans-serif",textAlign:"center",lineHeight:1.2}}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillar averages */}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,marginBottom:11}}>All-Time Pillar Averages</h3>
        {pillarAvgs.map(p => (
          <div key={p.id} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontFamily:"sans-serif",fontSize:11,color:"#555"}}>{p.icon} {p.label}</span>
              <span style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:p.col}}>{p.avg?""+p.avg+"/5 ("+p.total+"d)":"--"}</span>
            </div>
            <div style={{height:6,background:"#f0f0f0",borderRadius:5,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.avg?(p.avg/5)*100:0}%`,background:p.col,borderRadius:5,transition:"width 0.5s"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {(strongest||needsLove) && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
          {strongest && <div style={{background:strongest.light,borderRadius:11,padding:"12px",border:`1px solid ${strongest.col}44`}}>
            <div style={{fontSize:9,fontWeight:700,color:strongest.col,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>YOUR STRENGTH</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{strongest.icon} {strongest.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {strongest.avg}/5</div>
          </div>}
          {needsLove && needsLove.id!==strongest?.id && <div style={{background:"#fff8f0",borderRadius:11,padding:"12px",border:"1px solid #f4d0a033"}}>
            <div style={{fontSize:9,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>NEEDS MORE LOVE</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{needsLove.icon} {needsLove.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {needsLove.avg}/5</div>
          </div>}
        </div>
      )}

      <div style={{background:"#f9f6ff",borderRadius:11,padding:"13px",border:"1px solid #e8e0ff"}}>
        <p style={{fontSize:9,fontWeight:700,color:C.purple,fontFamily:"sans-serif",marginBottom:5,letterSpacing:0.5}}>YOUR INNERPROOF REMINDER</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:12,color:"#444",lineHeight:1.65,margin:"0 0 7px",fontStyle:"italic"}}>
          "You are not starting from zero. You are becoming integrated. And integrated people become powerful quietly."
        </p>
        <a href={SITE} target="_blank" rel="noopener" style={{fontSize:10,color:C.purple,fontFamily:"sans-serif",textDecoration:"none",fontWeight:700}}>Explore more at MindByTWC</a>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [session,  setSession]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [view,     setView]     = useState("today");
  const [pro,      setPro]      = useState(false);
  const [dbData,   setDbData]   = useState({entries:{}, pillars:{}});

  // Listen for auth state
  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => { if (mounted) setLoading(false); }, 3000);

    supabase.auth.getSession().then(({data}) => {
      if (!mounted) return;
      clearTimeout(timeout);
      setSession(data?.session || null);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      clearTimeout(timeout);
      setLoading(false);
    });

    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Load user data when session exists
  const loadData = useCallback(async (userId) => {
    const [entriesRes, pillarsRes] = await Promise.all([
      supabase.from("entries").select("*").eq("user_id",userId),
      supabase.from("pillar_entries").select("*").eq("user_id",userId),
    ]);
    const entries = {};
    (entriesRes.data||[]).forEach(e => { entries[e.entry_date] = e; });
    const pillars = {};
    (pillarsRes.data||[]).forEach(p => {
      if (!pillars[p.entry_date]) pillars[p.entry_date] = {};
      pillars[p.entry_date][p.pillar_id] = {notes:p.notes, score:p.score, insight:p.insight};
    });
    setDbData({entries, pillars});
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadData(session.user.id);
      // Check pro status
      supabase.from("profiles").select("is_pro").eq("id",session.user.id).single()
        .then(({data}) => { if (data?.is_pro) setPro(true); });
    }
  }, [session, loadData]);

  // Streak calculation
  let streak = 0;
  const sd = new Date();
  while (true) {
    const k = sd.toISOString().split("T")[0];
    if (!Object.keys(dbData.pillars[k]||{}).length) break;
    streak++; sd.setDate(sd.getDate()-1);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null); setDbData({entries:{},pillars:{}}); setPro(false); setView("today");
  }

  function demoPro() { setPro(true); setView("today"); }

  if (loading) return (
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:800,color:C.gold,letterSpacing:3,marginBottom:8}}>INNERPROOF</div>
        <div style={{fontFamily:"sans-serif",fontSize:12,color:"rgba(255,255,255,0.4)"}}>Loading your proof...</div>
      </div>
    </div>
  );

  if (!session) return <AuthScreen onAuth={setSession}/>;

  const showGate = !pro && (view==="review" || view==="dashboard");

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <Nav view={view} setView={setView} streak={streak} pro={pro} user={session.user} onSignOut={signOut}/>
      {showGate
        ? <Gate onDemo={demoPro}/>
        : view==="today"     ? <TodayView     userId={session.user.id} pro={pro} setView={setView} dbData={dbData} setDbData={setDbData}/>
        : view==="intention" ? <IntentionView userId={session.user.id} dbData={dbData} setDbData={setDbData}/>
        : view==="review"    ? <TrueRhythm    userId={session.user.id} dbData={dbData}/>
        : view==="log"       ? <ProofLog      dbData={dbData}/>
        : view==="dashboard" ? <Dashboard     dbData={dbData} user={session.user} pro={pro} onUpgrade={demoPro}/>
        :                      <Gate onDemo={demoPro}/>
      }
      <div style={{textAlign:"center",padding:"18px 15px 30px"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.gold,fontWeight:700,letterSpacing:1,marginBottom:2}}>INNERPROOF</div>
        <a href={SITE} target="_blank" rel="noopener" style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",textDecoration:"none"}}>
          by <strong style={{color:C.gold}}>MindByTWC</strong> - The Wellbeing Cognoscente
        </a>
      </div>
    </div>
  );
}


const MOODS = ["😞","😐","🙂","😊","🌟"];
const DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function todayKey() { return new Date().toISOString().split("T")[0]; }
function weekDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + offset * 7);
  return Array.from({length:7}, (_,i) => {
    const x = new Date(d); x.setDate(d.getDate()+i);
    return x.toISOString().split("T")[0];
  });
}
function fmtDate(key) {
  return new Date(key+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
}

async function askClaude(prompt, sys) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:200,
        system: sys || "You are a warm, grounded wellbeing coach for InnerProof by MindByTWC. Keep responses to 2-3 sentences. Be specific, honest, never preachy. Speak like a wise trusted friend.",
        messages:[{role:"user",content:prompt}]
      })
    });
    const d = await r.json();
    return d?.content?.[0]?.text || "Keep going. One step at a time.";
  } catch(e) { return "Keep going. One step at a time."; }
}

// ── Auth Screen ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function sendMagicLink() {
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: "https://innerproofapp.usi101.com" }
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true); setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.navy},#2d2d5e)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:800,color:C.gold,letterSpacing:3}}>
            INNER<span style={{color:"#fff"}}>PROOF</span>
          </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontFamily:"sans-serif",marginTop:4}}>BY MINDBYTWC</div>
          <p style={{color:"rgba(255,255,255,0.6)",fontFamily:"Georgia,serif",fontSize:13,marginTop:12,lineHeight:1.6,fontStyle:"italic"}}>
            Build evidence of who you are becoming.
          </p>
        </div>

        <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          {!sent ? (
            <>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:18,color:C.navy,margin:"0 0 6px"}}>Welcome back</h2>
              <p style={{fontFamily:"sans-serif",fontSize:12,color:"#999",margin:"0 0 20px",lineHeight:1.5}}>
                Enter your email and we will send you a magic link to sign in instantly. No password needed.
              </p>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:6,letterSpacing:1}}>YOUR EMAIL</label>
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key==="Enter" && sendMagicLink()}
                placeholder="you@example.com"
                style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${error?"#f4b8b8":"#eee"}`,fontFamily:"sans-serif",fontSize:14,color:C.navy,marginBottom:10,boxSizing:"border-box",outline:"none"}}
              />
              {error && <p style={{fontFamily:"sans-serif",fontSize:11,color:C.red,margin:"0 0 10px",fontWeight:600}}>{error}</p>}
              <button onClick={sendMagicLink} disabled={loading} style={{
                width:"100%",padding:"13px 0",borderRadius:10,border:"none",
                background:loading?"#ddd":C.gold,color:C.navy,
                fontFamily:"sans-serif",fontWeight:800,fontSize:14,cursor:loading?"not-allowed":"pointer"
              }}>
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
              <p style={{fontFamily:"sans-serif",fontSize:10,color:"#ccc",textAlign:"center",margin:"12px 0 0",lineHeight:1.5}}>
                By continuing you agree to our{" "}
                <a href={LEGAL} target="_blank" rel="noopener" style={{color:C.purple}}>Terms of Service</a>{" "}and{" "}
                <a href={LEGAL} target="_blank" rel="noopener" style={{color:C.purple}}>Privacy Policy</a>.
              </p>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"10px 0"}}>
              <div style={{fontSize:48,marginBottom:16}}>📧</div>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:18,color:C.navy,margin:"0 0 10px"}}>Check your inbox</h2>
              <p style={{fontFamily:"sans-serif",fontSize:13,color:"#666",lineHeight:1.6,margin:"0 0 16px"}}>
                We sent a magic link to <strong>{email}</strong>. Click it to sign in to InnerProof.
              </p>
              <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",lineHeight:1.5}}>
                No email? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} style={{background:"none",border:"none",color:C.purple,cursor:"pointer",fontFamily:"sans-serif",fontSize:11,fontWeight:700,padding:0}}>try again</button>.
              </p>
            </div>
          )}
        </div>
        <p style={{textAlign:"center",fontFamily:"sans-serif",fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:20}}>
          Powered by <a href={SITE} target="_blank" rel="noopener" style={{color:C.gold,textDecoration:"none",fontWeight:700}}>MindByTWC</a>
        </p>
      </div>
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ view, setView, streak, pro, user, onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);
  const tabs = [
    {id:"today",     label:"Today"},
    {id:"intention", label:"Intention"},
    {id:"review",    label:"True Rhythm", lock:!pro},
    {id:"log",       label:"Proof Log"},
    {id:"dashboard", label:"Dashboard",  lock:!pro},
  ];
  return (
    <header style={{background:C.navy,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
      <div style={{maxWidth:520,margin:"0 auto",padding:"12px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <a href={SITE} target="_blank" rel="noopener" style={{textDecoration:"none"}}>
              <span style={{fontSize:17,fontWeight:800,color:C.gold,letterSpacing:2,fontFamily:"Georgia,serif"}}>INNER</span>
              <span style={{fontSize:17,fontWeight:800,color:"#fff",letterSpacing:2,fontFamily:"Georgia,serif"}}>PROOF</span>
            </a>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontFamily:"sans-serif",letterSpacing:1,marginTop:1}}>BY MINDBYTWC</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {streak > 0 && (
              <div style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:16,padding:"3px 9px",display:"flex",alignItems:"center",gap:3}}>
                <span style={{fontSize:13}}>🔥</span>
                <span style={{color:C.gold,fontSize:10,fontWeight:700,fontFamily:"sans-serif"}}>{streak}d</span>
              </div>
            )}
            <span style={{background:pro?C.gold:"rgba(255,255,255,0.08)",color:pro?C.navy:"rgba(255,255,255,0.4)",fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:8,fontFamily:"sans-serif",letterSpacing:0.5}}>
              {pro?"PRO":"FREE"}
            </span>
            <div style={{position:"relative"}}>
              <button onClick={() => setShowMenu(v=>!v)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",color:"#fff",fontSize:14}}>
                👤
              </button>
              {showMenu && (
                <div style={{position:"absolute",right:0,top:"110%",background:"#fff",borderRadius:12,padding:"8px",boxShadow:"0 8px 24px rgba(0,0,0,0.15)",minWidth:180,zIndex:200}}>
                  <p style={{fontFamily:"sans-serif",fontSize:11,color:"#aaa",padding:"4px 8px",margin:0}}>{user?.email}</p>
                  <div style={{height:1,background:"#eee",margin:"6px 0"}}/>
                  <button onClick={() => { setView("dashboard"); setShowMenu(false); }} style={{display:"block",width:"100%",padding:"8px",background:"none",border:"none",cursor:"pointer",fontFamily:"sans-serif",fontSize:13,color:C.navy,textAlign:"left",borderRadius:8}}>
                    📊 My Dashboard
                  </button>
                  <button onClick={onSignOut} style={{display:"block",width:"100%",padding:"8px",background:"none",border:"none",cursor:"pointer",fontFamily:"sans-serif",fontSize:13,color:C.red,textAlign:"left",borderRadius:8}}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:3,overflowX:"auto"}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              flexShrink:0,padding:"6px 10px",borderRadius:"7px 7px 0 0",border:"none",
              cursor:"pointer",fontFamily:"sans-serif",fontSize:10,fontWeight:700,
              background:view===t.id?C.bg:"transparent",
              color:view===t.id?C.navy:"rgba(255,255,255,0.45)",
            }}>
              {t.label}{t.lock?" 🔒":""}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// ── Upgrade Gate ─────────────────────────────────────────────────────────────
function Gate({ onDemo }) {
  const [agreed, setAgreed] = useState(false);
  const [warn,   setWarn]   = useState(false);
  function pay(url) { if (!agreed) { setWarn(true); return; } window.open(url,"_blank"); }
  return (
    <div style={{maxWidth:460,margin:"32px auto",padding:"0 16px"}}>
      <div style={{background:"#fff",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
        <div style={{background:`linear-gradient(135deg,${C.navy},#2d2d5e)`,padding:"26px 22px",textAlign:"center"}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:800,color:C.gold,letterSpacing:2}}>INNER<span style={{color:"#fff"}}>PROOF</span></div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontFamily:"sans-serif",margin:"3px 0 12px"}}>PRO</div>
          <p style={{color:"rgba(255,255,255,0.7)",fontFamily:"Georgia,serif",fontSize:13,margin:0,lineHeight:1.6,fontStyle:"italic"}}>Find your true rhythm. Build proof of who you are becoming.</p>
        </div>
        <div style={{padding:"18px 22px"}}>
          {[["📊","True Rhythm Report - your weekly pattern at a glance"],["✨","Full AI coaching insight on every pillar"],["📅","All 5 pillars: Structure, Identity and Nourish unlocked"],["🌅","Daily intention setter with smart reminders"],["📈","Full progress dashboard with charts and streaks"]].map(([icon,text],i) => (
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",marginBottom:9}}>
              <span style={{fontSize:17}}>{icon}</span>
              <span style={{fontFamily:"sans-serif",fontSize:12,color:"#444"}}>{text}</span>
            </div>
          ))}
          <div style={{background:C.goldSoft,borderRadius:11,padding:"12px 14px",margin:"14px 0",textAlign:"center"}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:20,color:C.navy,fontWeight:700}}>GBP 4.99 <span style={{fontSize:13,fontWeight:400}}>/month</span></div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#888",marginTop:2}}>or GBP 39/year - save 35%</div>
          </div>
          <div onClick={() => { setAgreed(a=>!a); setWarn(false); }} style={{display:"flex",alignItems:"flex-start",gap:11,cursor:"pointer",background:agreed?"#f0f7f0":warn?"#fff5f5":"#f9f9f9",border:`1.5px solid ${agreed?"#c3e0c3":warn?"#f4b8b8":"#e8e8e8"}`,borderRadius:9,padding:"11px 13px",marginBottom:9,transition:"all 0.2s"}}>
            <div style={{width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,border:`2px solid ${agreed?C.green:warn?C.red:"#ccc"}`,background:agreed?C.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
              {agreed && <span style={{color:"#fff",fontSize:12,fontWeight:800,lineHeight:1}}>✓</span>}
            </div>
            <p style={{fontFamily:"sans-serif",fontSize:11,color:"#444",margin:0,lineHeight:1.6}}>
              I agree to the <a href={LEGAL} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{color:C.purple,fontWeight:700}}>Terms of Service</a>,{" "}
              <a href={LEGAL} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{color:C.purple,fontWeight:700}}>Privacy Policy</a> and{" "}
              <a href={LEGAL} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{color:C.purple,fontWeight:700}}>Refund Policy</a>.
            </p>
          </div>
          {warn && !agreed && <p style={{fontFamily:"sans-serif",fontSize:11,color:C.red,textAlign:"center",margin:"0 0 9px",fontWeight:600}}>Please accept the Terms before continuing.</p>}
          <p style={{fontFamily:"sans-serif",fontSize:10,color:"#aaa",textAlign:"center",margin:"0 0 7px",letterSpacing:0.5}}>CHOOSE HOW TO PAY</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:4}}>
            <button onClick={() => pay(SQUARE)} style={{padding:"12px 0",borderRadius:11,border:"none",background:agreed?C.gold:"#ddd",color:agreed?C.navy:"#aaa",fontFamily:"sans-serif",fontWeight:800,fontSize:12,cursor:agreed?"pointer":"not-allowed",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.2s"}}>
              <span>Pay with Square</span><span style={{fontSize:9,fontWeight:400,opacity:0.7}}>square.link</span>
            </button>
            <button onClick={() => pay(STRIPE)} style={{padding:"12px 0",borderRadius:11,border:agreed?`2px solid ${C.navy}`:"2px solid #ddd",background:agreed?"#fff":"#f5f5f5",color:agreed?C.navy:"#bbb",fontFamily:"sans-serif",fontWeight:800,fontSize:12,cursor:agreed?"pointer":"not-allowed",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.2s"}}>
              <span>Pay with Stripe</span><span style={{fontSize:9,fontWeight:400,opacity:0.6}}>buy.stripe.com</span>
            </button>
          </div>
          <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",textAlign:"center",margin:"5px 0 0"}}>Both options start your 7-day free trial - no charge today</p>
          <div style={{background:"#f0f7f0",border:"1px solid #c3e0c3",borderRadius:9,padding:"9px 12px",margin:"10px 0 8px",textAlign:"center"}}>
            <p style={{fontFamily:"sans-serif",fontSize:11,color:"#3a6b3a",margin:0,lineHeight:1.6}}>
              🔒 No charge for 7 days. Cancel anytime.<br/><strong>We will remind you 2 days before billing starts.</strong>
            </p>
          </div>
          <p style={{textAlign:"center",fontSize:10,color:"#ccc",fontFamily:"sans-serif",margin:"4px 0 8px"}}>
            Secure payment via Square and Stripe - Powered by <a href={SITE} target="_blank" rel="noopener" style={{color:C.gold,fontWeight:700}}>MindByTWC</a>
          </p>
          <button onClick={onDemo} style={{display:"block",width:"100%",padding:"9px 0",borderRadius:9,border:`1px dashed ${C.purple}`,background:"transparent",color:C.purple,fontFamily:"sans-serif",fontSize:11,cursor:"pointer",fontWeight:600}}>
            Preview PRO mode (demo)
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pillar Card ───────────────────────────────────────────────────────────────
function PillarCard({ pillar, data, onSave, locked }) {
  const [open,    setOpen]    = useState(false);
  const [notes,   setNotes]   = useState(data?.notes||"");
  const [score,   setScore]   = useState(data?.score??null);
  const [insight, setInsight] = useState(data?.insight||"");
  const [loading, setLoading] = useState(false);
  const done = data?.score != null;

  useEffect(() => {
    setNotes(data?.notes||"");
    setScore(data?.score??null);
    setInsight(data?.insight||"");
  }, [data]);

  async function handleSave() {
    if (!notes.trim() && score===null) return;
    setLoading(true);
    let ins = insight;
    if (notes.trim() && !insight) {
      ins = await askClaude(`InnerProof pillar: ${pillar.label}\nNotes: "${notes}"\nGive one specific grounded insight to help them build proof.`);
      setInsight(ins);
    }
    onSave({notes, score, insight:ins});
    setLoading(false); setOpen(false);
  }

  if (locked) return (
    <div style={{borderRadius:13,marginBottom:9,border:"1.5px solid #eee",background:"#fafafa",opacity:0.6}}>
      <div style={{display:"flex",alignItems:"center",gap:11,padding:"12px 15px"}}>
        <span style={{fontSize:21,filter:"grayscale(1)"}}>{pillar.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:14,color:"#aaa",fontWeight:700}}>{pillar.label}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:"#ccc",marginTop:1}}>Unlock with InnerProof PRO</div>
        </div>
        <span style={{fontSize:13}}>🔒</span>
      </div>
    </div>
  );

  return (
    <div style={{borderRadius:13,marginBottom:9,border:`1.5px solid ${done?pillar.col:"#e8e8e8"}`,background:"#fff",boxShadow:done?`0 2px 10px ${pillar.col}22`:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <button onClick={() => setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"12px 15px",background:done?pillar.light:"#fff",border:"none",cursor:"pointer",textAlign:"left",borderRadius:13}}>
        <span style={{fontSize:21}}>{pillar.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:14,color:C.navy,fontWeight:700}}>{pillar.label}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:"#aaa",marginTop:1}}>{pillar.sub}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          {done && <span style={{fontSize:14}}>✅</span>}
          {score!=null && <span style={{background:pillar.col,color:"#fff",borderRadius:7,padding:"2px 6px",fontSize:10,fontFamily:"sans-serif",fontWeight:700}}>{score}/5</span>}
          <span style={{color:"#ccc",fontSize:12}}>{open?"▲":"▼"}</span>
        </div>
      </button>
      {open && (
        <div style={{padding:"0 15px 15px",borderTop:`1px solid ${pillar.light}`}}>
          <p style={{fontSize:11,color:pillar.col,fontStyle:"italic",fontFamily:"sans-serif",margin:"10px 0 9px",padding:"7px 11px",background:pillar.light,borderRadius:7}}>{pillar.tip}</p>
          <p style={{fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:0.5}}>REFLECT ON:</p>
          <ul style={{margin:"0 0 9px",paddingLeft:16}}>
            {pillar.prompts.map((p,i) => <li key={i} style={{fontSize:11,color:"#666",fontFamily:"sans-serif",marginBottom:3}}>{p}</li>)}
          </ul>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Write anything - one honest sentence counts."
            style={{width:"100%",minHeight:65,borderRadius:9,border:"1.5px solid #eee",padding:"9px 11px",fontFamily:"sans-serif",fontSize:12,color:"#333",resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.5,marginBottom:9}}/>
          <div style={{display:"flex",gap:5,marginBottom:11}}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setScore(n)} style={{flex:1,padding:"7px 0",borderRadius:7,border:score===n?`2px solid ${pillar.col}`:"2px solid #eee",background:score===n?pillar.light:"#fafafa",color:score===n?pillar.col:"#bbb",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>{n}</button>
            ))}
          </div>
          {insight && (
            <div style={{background:"#f9f6ff",border:"1px solid #e8e0ff",borderRadius:9,padding:"9px 11px",marginBottom:9}}>
              <p style={{fontSize:10,color:C.purple,fontWeight:700,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>YOUR INNERPROOF INSIGHT</p>
              <p style={{fontSize:12,color:"#444",fontFamily:"sans-serif",lineHeight:1.55,margin:0}}>{insight}</p>
            </div>
          )}
          <button onClick={handleSave} disabled={loading} style={{width:"100%",padding:"10px 0",borderRadius:9,border:"none",background:loading?"#ddd":pillar.col,color:"#fff",fontFamily:"sans-serif",fontWeight:700,fontSize:12,cursor:loading?"not-allowed":"pointer"}}>
            {loading?"Getting insight...":done?"Update":"Save and Get Insight"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Today View ────────────────────────────────────────────────────────────────
function TodayView({ userId, pro, setView, dbData, setDbData }) {
  const key = todayKey();
  const entry = dbData.entries[key] || {};
  const pillars = dbData.pillars[key] || {};
  const [mood, setMood] = useState(entry.mood??null);
  const [saving, setSaving] = useState(false);

  async function saveMood(v) {
    setMood(v);
    setSaving(true);
    const { data: existing } = await supabase.from("entries").select("id").eq("user_id",userId).eq("entry_date",key).single();
    if (existing) {
      await supabase.from("entries").update({mood:v}).eq("user_id",userId).eq("entry_date",key);
    } else {
      await supabase.from("entries").insert({user_id:userId,entry_date:key,mood:v});
    }
    setDbData(d => ({...d, entries:{...d.entries,[key]:{...entry,mood:v}}}));
    setSaving(false);
  }

  async function savePillar(pid, val) {
    const { data: existing } = await supabase.from("pillar_entries").select("id").eq("user_id",userId).eq("entry_date",key).eq("pillar_id",pid).single();
    if (existing) {
      await supabase.from("pillar_entries").update({notes:val.notes,score:val.score,insight:val.insight}).eq("user_id",userId).eq("entry_date",key).eq("pillar_id",pid);
    } else {
      await supabase.from("pillar_entries").insert({user_id:userId,entry_date:key,pillar_id:pid,...val});
    }
    setDbData(d => ({...d, pillars:{...d.pillars,[key]:{...pillars,[pid]:val}}}));
  }

  const done = PILLARS.filter(p => pillars[p.id]?.score!=null).length;
  const pct  = Math.round((done/PILLARS.length)*100);
  const intent = entry.intention_text;

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      {intent && (
        <div style={{background:C.goldSoft,borderRadius:13,padding:"11px 15px",marginBottom:13,border:`1px solid ${C.gold}44`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:3,letterSpacing:1}}>TODAY'S INTENTION</div>
          {entry.intention_word && <div style={{fontFamily:"Georgia,serif",fontSize:18,color:C.navy,fontWeight:700,marginBottom:2}}>{entry.intention_word}</div>}
          <div style={{fontFamily:"sans-serif",fontSize:12,color:"#666",lineHeight:1.5}}>{intent}</div>
          {entry.intention_ai && <div style={{fontFamily:"Georgia,serif",fontSize:11,color:C.orange,fontStyle:"italic",marginTop:5}}>"{entry.intention_ai}"</div>}
        </div>
      )}
      <div style={{background:"#fff",borderRadius:13,padding:"13px 15px",marginBottom:13,border:"1.5px solid #eee"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,fontWeight:700}}>Today's InnerProof</span>
          <span style={{fontFamily:"sans-serif",fontWeight:800,color:C.gold,fontSize:14}}>{pct}%</span>
        </div>
        <div style={{height:7,background:"#eee",borderRadius:5,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.red},${C.gold})`,borderRadius:5,transition:"width 0.4s"}}/>
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",margin:"5px 0 0"}}>{done} of 5 pillars checked {done===5?"- Full proof today!":""}</p>
      </div>
      <div style={{marginBottom:13}}>
        <p style={{fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:5,letterSpacing:0.5}}>OVERALL FEELING TODAY</p>
        <div style={{display:"flex",gap:5}}>
          {MOODS.map((m,i) => (
            <button key={i} onClick={() => saveMood(i)} style={{flex:1,fontSize:19,padding:"8px 0",borderRadius:9,border:mood===i?`2px solid ${C.gold}`:"2px solid #eee",background:mood===i?C.goldSoft:"#fafafa",cursor:"pointer"}}>{m}</button>
          ))}
        </div>
      </div>
      {PILLARS.map(p => (
        <PillarCard key={p.id} pillar={p} data={pillars[p.id]} onSave={val=>savePillar(p.id,val)} locked={!pro&&!p.free}/>
      ))}
      {!pro && (
        <div style={{background:"#f9f6ff",borderRadius:13,padding:"15px",border:"1px solid #e8e0ff",marginTop:5,textAlign:"center"}}>
          <p style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 4px"}}>Unlock your full InnerProof</p>
          <p style={{fontFamily:"sans-serif",fontSize:11,color:"#999",margin:"0 0 11px"}}>Structure, Identity and Nourish are ready for you.</p>
          <button onClick={() => setView("upgrade")} style={{background:C.gold,color:C.navy,border:"none",borderRadius:9,fontFamily:"sans-serif",fontWeight:800,fontSize:12,padding:"9px 20px",cursor:"pointer"}}>
            Start My 7-Day Free Trial
          </button>
          <p style={{fontFamily:"sans-serif",fontSize:9,color:"#ddd",margin:"8px 0 0"}}>
            By starting you agree to our <a href={LEGAL} target="_blank" rel="noopener" style={{color:C.purple}}>Terms</a>.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Intention View ─────────────────────────────────────────────────────────
function IntentionView({ userId, dbData, setDbData }) {
  const key  = todayKey();
  const entry = dbData.entries[key] || {};
  const [word,    setWord]    = useState(entry.intention_word||"");
  const [intent,  setIntent]  = useState(entry.intention_text||"");
  const [rel,     setRel]     = useState(entry.intention_release||"");
  const [ai,      setAi]      = useState(entry.intention_ai||"");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(!!entry.intention_text);
  const [reminders, setReminders] = useState([]);
  const [rLabel, setRLabel] = useState("Morning InnerProof check-in");
  const [rTime,  setRTime]  = useState("07:00");
  const [showForm, setShowForm] = useState(false);

  async function save() {
    if (!intent.trim()) return;
    setLoading(true);
    let sentence = ai;
    if (!ai) {
      sentence = await askClaude(`My word for today is "${word}". My intention: "${intent}". I want to release: "${rel}". Give me one grounding sentence to carry into my day.`);
      setAi(sentence);
    }
    const payload = {intention_word:word, intention_text:intent, intention_release:rel, intention_ai:sentence};
    const { data: existing } = await supabase.from("entries").select("id").eq("user_id",userId).eq("entry_date",key).single();
    if (existing) {
      await supabase.from("entries").update(payload).eq("user_id",userId).eq("entry_date",key);
    } else {
      await supabase.from("entries").insert({user_id:userId,entry_date:key,...payload});
    }
    setDbData(d => ({...d, entries:{...d.entries,[key]:{...entry,...payload}}}));
    setDone(true); setLoading(false);
  }

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>Set Your Intention</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Anchor your day before the world pulls you in every direction.</p>
      </div>
      <div style={{background:"#fff",borderRadius:15,padding:"16px",marginBottom:13,border:"1.5px solid #eee"}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>MY ONE WORD TODAY</label>
        <input value={word} onChange={e=>setWord(e.target.value)} placeholder="e.g. Steady - Present - Aligned"
          style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"Georgia,serif",fontSize:15,color:C.navy,marginBottom:13,boxSizing:"border-box",outline:"none"}}/>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>MY INNERPROOF INTENTION</label>
        <textarea value={intent} onChange={e=>setIntent(e.target.value)} placeholder="Today I choose to... / I am building proof that..."
          style={{width:"100%",minHeight:70,padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"sans-serif",fontSize:12,color:"#333",resize:"vertical",marginBottom:13,boxSizing:"border-box",outline:"none",lineHeight:1.55}}/>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:"#bbb",fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>I RELEASE TODAY</label>
        <input value={rel} onChange={e=>setRel(e.target.value)} placeholder="e.g. the need to be perfect - yesterday's guilt"
          style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"sans-serif",fontSize:12,color:"#333",marginBottom:13,boxSizing:"border-box",outline:"none"}}/>
        {ai && (
          <div style={{background:C.goldSoft,border:`1px solid ${C.gold}55`,borderRadius:9,padding:"10px 13px",marginBottom:13}}>
            <p style={{fontSize:10,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:4,letterSpacing:1}}>YOUR GROUNDING SENTENCE</p>
            <p style={{fontSize:12,color:"#444",fontFamily:"Georgia,serif",lineHeight:1.6,margin:0,fontStyle:"italic"}}>"{ai}"</p>
          </div>
        )}
        <button onClick={save} disabled={loading||!intent.trim()} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:loading||!intent.trim()?"#ddd":C.gold,color:C.navy,fontFamily:"sans-serif",fontWeight:800,fontSize:13,cursor:loading||!intent.trim()?"not-allowed":"pointer"}}>
          {loading?"Finding your grounding sentence...":done?"Update Intention":"Set Intention and Get Grounding Sentence"}
        </button>
      </div>
      <div style={{background:"#fff",borderRadius:15,padding:"16px",border:"1.5px solid #eee"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
          <div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:15,color:C.navy,margin:"0 0 2px"}}>Reminders</h2>
            <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",margin:0}}>Keep your true rhythm on track</p>
          </div>
          <button onClick={() => setShowForm(v=>!v)} style={{background:C.navy,color:"#fff",border:"none",borderRadius:7,padding:"6px 12px",fontFamily:"sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add</button>
        </div>
        {showForm && (
          <div style={{background:"#f9f9f9",borderRadius:9,padding:"11px",marginBottom:11,border:"1px solid #eee"}}>
            <input value={rLabel} onChange={e=>setRLabel(e.target.value)} placeholder="Reminder name"
              style={{width:"100%",padding:"7px 9px",borderRadius:7,border:"1px solid #ddd",fontFamily:"sans-serif",fontSize:12,marginBottom:7,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:7}}>
              <input type="time" value={rTime} onChange={e=>setRTime(e.target.value)} style={{flex:1,padding:"7px 9px",borderRadius:7,border:"1px solid #ddd",fontFamily:"sans-serif",fontSize:12}}/>
              <button onClick={() => { setReminders(r=>[...r,{label:rLabel,time:rTime}]); setShowForm(false); }} style={{flex:1,background:C.green,color:"#fff",border:"none",borderRadius:7,fontFamily:"sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>Save</button>
            </div>
          </div>
        )}
        {reminders.length===0
          ? <p style={{fontFamily:"sans-serif",fontSize:12,color:"#ccc",textAlign:"center",padding:"13px 0"}}>No reminders yet. Add one to stay in rhythm.</p>
          : reminders.map((r,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 11px",background:"#f9f9f9",borderRadius:9,marginBottom:7}}>
              <div>
                <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:"#333"}}>{r.label}</div>
                <div style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",marginTop:1}}>{r.time} daily</div>
              </div>
              <button onClick={() => setReminders(rs=>rs.filter((_,j)=>j!==i))} style={{background:"#fee8e8",border:"none",borderRadius:7,padding:"4px 9px",fontSize:11,color:C.red,cursor:"pointer",fontWeight:700}}>Remove</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── True Rhythm Review ────────────────────────────────────────────────────
function TrueRhythm({ userId, dbData }) {
  const [offset,     setOffset]     = useState(0);
  const [reflection, setReflection] = useState("");
  const [aiReview,   setAiReview]   = useState("");
  const [loading,    setLoading]    = useState(false);

  const days     = weekDays(offset);
  const weekData = days.map(k => ({key:k, day:new Date(k+"T12:00:00"), e:dbData.entries[k]||{}, p:dbData.pillars[k]||{}}));
  const checkedIn = weekData.filter(({p}) => PILLARS.some(pl => p[pl.id]));

  const totals = PILLARS.map(pl => {
    const scores = weekData.map(({p}) => p[pl.id]?.score).filter(Boolean);
    return {...pl, avg:scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):null, cnt:scores.length};
  });

  const best  = [...totals].filter(p=>p.avg).sort((a,b)=>b.avg-a.avg)[0];
  const needs = [...totals].filter(p=>p.avg).sort((a,b)=>a.avg-b.avg)[0];
  const moodArr = weekData.map(({e})=>e.mood).filter(v=>v!=null);
  const moodAvg = moodArr.length?(moodArr.reduce((a,b)=>a+b,0)/moodArr.length).toFixed(1):null;
  const sLabel = new Date(days[0]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  const eLabel = new Date(days[6]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});

  async function generate() {
    if (!checkedIn.length) return;
    setLoading(true);
    const summary = totals.map(p=>`${p.label}: ${p.avg||"no data"}/5`).join(", ");
    const text = await askClaude(
      `InnerProof True Rhythm ${sLabel}-${eLabel}:\nPillar averages: ${summary}\nDays: ${checkedIn.length}/7\nMood avg: ${moodAvg}/4\nReflection: "${reflection}"\n\nGive me: 1 win to celebrate, 1 honest pattern to notice, 1 tiny action for next week. Warm, practical, under 120 words.`,
      "You are the InnerProof True Rhythm coach. Help people see their weekly patterns clearly so they can align how they live with who they know they are. Be honest, warm, and specific."
    );
    setAiReview(text); setLoading(false);
  }

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>True Rhythm Report</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Your weekly InnerProof - where your real rhythm lives.</p>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={() => setOffset(o=>o-1)} style={{background:"#fff",border:"1.5px solid #eee",borderRadius:9,padding:"7px 13px",fontFamily:"sans-serif",fontSize:12,cursor:"pointer",fontWeight:700,color:C.navy}}>Prev</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:C.navy}}>{sLabel} - {eLabel}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",marginTop:1}}>{offset===0?"This week":offset===-1?"Last week":`${Math.abs(offset)} weeks ago`}</div>
        </div>
        <button onClick={() => setOffset(o=>Math.min(0,o+1))} disabled={offset===0} style={{background:offset===0?"#f5f5f5":"#fff",border:"1.5px solid #eee",borderRadius:9,padding:"7px 13px",fontFamily:"sans-serif",fontSize:12,cursor:offset===0?"not-allowed":"pointer",fontWeight:700,color:offset===0?"#ccc":C.navy}}>Next</button>
      </div>
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 11px"}}>Daily Check-ins</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {weekData.map(({key,day,p,e}) => {
            const cnt = PILLARS.filter(pl=>p[pl.id]?.score!=null).length;
            const isToday = key===todayKey();
            return (
              <div key={key} style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:"#bbb",fontFamily:"sans-serif",marginBottom:3}}>{DAYS[day.getDay()]}</div>
                <div style={{width:"100%",aspectRatio:"1",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:cnt===5?C.navy:cnt>0?`${C.gold}55`:"#f0f0f0",border:isToday?`2px solid ${C.gold}`:"2px solid transparent",fontSize:10,fontWeight:700,fontFamily:"sans-serif",color:cnt===5?"#fff":cnt>0?C.navy:"#ccc"}}>
                  {cnt>0?cnt:"."}
                </div>
                <div style={{fontSize:10,fontFamily:"sans-serif",marginTop:2}}>{e.mood!=null?MOODS[e.mood]:""}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 11px"}}>This Week's Pillar Rhythm</h3>
        {totals.map(p => (
          <div key={p.id} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontFamily:"sans-serif",fontSize:11,color:"#555"}}>{p.icon} {p.label}</span>
              <span style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:p.col}}>{p.avg?`${p.avg}/5 (${p.cnt}d)`:"--"}</span>
            </div>
            <div style={{height:6,background:"#f0f0f0",borderRadius:5,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.avg?(p.avg/5)*100:0}%`,background:p.col,borderRadius:5,transition:"width 0.5s"}}/>
            </div>
          </div>
        ))}
      </div>
      {(best||needs) && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
          {best && <div style={{background:best.light,borderRadius:11,padding:"11px",border:`1px solid ${best.col}44`}}>
            <div style={{fontSize:9,fontWeight:700,color:best.col,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>STRONGEST</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{best.icon} {best.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {best.avg}/5</div>
          </div>}
          {needs && needs.id!==best?.id && <div style={{background:"#fff8f0",borderRadius:11,padding:"11px",border:"1px solid #f4d0a033"}}>
            <div style={{fontSize:9,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>NEEDS LOVE</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{needs.icon} {needs.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {needs.avg}/5</div>
          </div>}
        </div>
      )}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:14,color:C.navy,margin:"0 0 3px"}}>AI True Rhythm Coach</h3>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",margin:"0 0 9px"}}>Add a reflection then get your personalised weekly insight.</p>
        <textarea value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="How did this week feel? What surprised you?"
          style={{width:"100%",minHeight:65,padding:"9px 11px",borderRadius:9,border:"1.5px solid #eee",fontFamily:"sans-serif",fontSize:12,color:"#333",resize:"vertical",marginBottom:9,boxSizing:"border-box",outline:"none",lineHeight:1.5}}/>
        {aiReview && (
          <div style={{background:"#f9f6ff",border:"1px solid #e8e0ff",borderRadius:9,padding:"11px",marginBottom:9}}>
            <p style={{fontSize:10,fontWeight:700,color:C.purple,fontFamily:"sans-serif",marginBottom:5,letterSpacing:0.5}}>YOUR TRUE RHYTHM INSIGHT</p>
            <p style={{fontSize:12,color:"#444",fontFamily:"sans-serif",lineHeight:1.6,margin:0,whiteSpace:"pre-wrap"}}>{aiReview}</p>
          </div>
        )}
        <button onClick={generate} disabled={loading||!checkedIn.length} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:loading||!checkedIn.length?"#ddd":C.navy,color:"#fff",fontFamily:"sans-serif",fontWeight:700,fontSize:13,cursor:loading||!checkedIn.length?"not-allowed":"pointer"}}>
          {loading?"Generating your True Rhythm Report...":!checkedIn.length?"No check-ins this week yet":"Generate My True Rhythm Report"}
        </button>
      </div>
    </div>
  );
}

// ── Proof Log ─────────────────────────────────────────────────────────────
function ProofLog({ dbData }) {
  const days = Object.keys(dbData.entries).sort((a,b)=>b.localeCompare(a)).slice(0,60);
  if (!days.length) return (
    <div style={{padding:40,textAlign:"center",color:"#ccc",fontFamily:"sans-serif"}}>
      <div style={{fontSize:38,marginBottom:11}}>📅</div>
      <p style={{fontFamily:"Georgia,serif",fontSize:14,color:"#aaa"}}>Your proof log starts today.</p>
    </div>
  );
  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>Your Proof Log</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Every entry is evidence of who you are becoming.</p>
      </div>
      {days.map(day => {
        const e = dbData.entries[day]||{};
        const p = dbData.pillars[day]||{};
        const scores = PILLARS.map(pl=>p[pl.id]?.score).filter(Boolean);
        const cnt = scores.length;
        const avg = cnt?(scores.reduce((a,b)=>a+b,0)/cnt).toFixed(1):null;
        return (
          <div key={day} style={{background:"#fff",borderRadius:13,padding:"12px 15px",marginBottom:7,border:"1.5px solid #eee"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,fontWeight:700}}>{fmtDate(day)}</div>
                <div style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",marginTop:1}}>{cnt}/5 pillars - {e.mood!=null?MOODS[e.mood]:"--"}</div>
                {e.intention_word && <div style={{fontFamily:"sans-serif",fontSize:10,color:C.gold,marginTop:1,fontWeight:700}}>"{e.intention_word}"</div>}
              </div>
              {avg && <div style={{textAlign:"right"}}>
                <div style={{fontSize:17,fontWeight:800,color:C.gold,fontFamily:"sans-serif"}}>{avg}</div>
                <div style={{fontSize:9,color:"#ccc",fontFamily:"sans-serif"}}>avg</div>
              </div>}
            </div>
            <div style={{display:"flex",gap:4,marginTop:7}}>
              {PILLARS.map(pl=><div key={pl.id} title={pl.label} style={{flex:1,height:4,borderRadius:3,background:p[pl.id]?.score?pl.col:"#eee"}}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ dbData, user, pro, onUpgrade }) {
  if (!pro) return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <Gate onDemo={onUpgrade}/>
    </div>
  );

  const allDays = Object.keys(dbData.entries).sort();
  const allPillars = Object.keys(dbData.pillars);

  // Streak
  let streak = 0;
  const sd = new Date();
  while (true) {
    const k = sd.toISOString().split("T")[0];
    const p = dbData.pillars[k]||{};
    if (!Object.keys(p).length) break;
    streak++; sd.setDate(sd.getDate()-1);
  }

  // Consistency - last 30 days
  const last30 = Array.from({length:30},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-29+i);
    return d.toISOString().split("T")[0];
  });

  // Pillar averages all time
  const pillarAvgs = PILLARS.map(pl => {
    const scores = allPillars.map(day=>(dbData.pillars[day]||{})[pl.id]?.score).filter(Boolean);
    return {...pl, avg:scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):null, total:scores.length};
  });

  // Weekly scores for chart (last 8 weeks)
  const weeklyData = Array.from({length:8},(_,i) => {
    const days = weekDays(-7+i);
    const scores = days.flatMap(k => PILLARS.map(pl=>(dbData.pillars[k]||{})[pl.id]?.score).filter(Boolean));
    const avg = scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):null;
    const label = new Date(days[0]+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
    return {label, avg, cnt:days.filter(k=>Object.keys(dbData.pillars[k]||{}).length>0).length};
  });

  const strongest = [...pillarAvgs].filter(p=>p.avg).sort((a,b)=>b.avg-a.avg)[0];
  const needsLove = [...pillarAvgs].filter(p=>p.avg).sort((a,b)=>a.avg-b.avg)[0];
  const totalCheckins = allPillars.length;
  const intentionDays = allDays.filter(d=>dbData.entries[d]?.intention_text).length;
  const maxWeekly = Math.max(...weeklyData.map(w=>parseFloat(w.avg||0)),1);

  return (
    <div style={{padding:"18px 15px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:C.navy,margin:"0 0 3px"}}>Your Progress Dashboard</h2>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:"#bbb",margin:0}}>Your InnerProof evidence, all in one place.</p>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:13}}>
        {[
          {label:"Day Streak",  val:`${streak}🔥`},
          {label:"Total Days",  val:totalCheckins},
          {label:"Intentions",  val:intentionDays},
          {label:"Avg Score",   val: (() => { const sc = allPillars.flatMap(d=>PILLARS.map(p=>(dbData.pillars[d]||{})[p.id]?.score).filter(Boolean)); return sc.length?(sc.reduce((a,b)=>a+b,0)/sc.length).toFixed(1):"--"; })()},
        ].map(s => (
          <div key={s.label} style={{background:"#fff",borderRadius:11,padding:"10px 6px",border:"1.5px solid #eee",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:C.gold,fontFamily:"sans-serif"}}>{s.val}</div>
            <div style={{fontSize:8,color:"#bbb",fontFamily:"sans-serif",marginTop:2,lineHeight:1.3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 30-day consistency calendar */}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 10px"}}>30-Day Consistency</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:3}}>
          {last30.map(k => {
            const p = dbData.pillars[k]||{};
            const cnt = PILLARS.filter(pl=>p[pl.id]?.score!=null).length;
            const isToday = k===todayKey();
            return (
              <div key={k} title={fmtDate(k)} style={{aspectRatio:"1",borderRadius:4,background:cnt===5?C.navy:cnt>0?`${C.gold}88`:"#f0f0f0",border:isToday?`2px solid ${C.gold}`:"2px solid transparent"}}/>
            );
          })}
        </div>
        <div style={{display:"flex",gap:10,marginTop:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:3,alignItems:"center"}}><div style={{width:8,height:8,background:C.navy,borderRadius:2}}/><span style={{fontSize:9,color:"#aaa",fontFamily:"sans-serif"}}>All 5</span></div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}><div style={{width:8,height:8,background:`${C.gold}88`,borderRadius:2}}/><span style={{fontSize:9,color:"#aaa",fontFamily:"sans-serif"}}>Partial</span></div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}><div style={{width:8,height:8,background:"#f0f0f0",borderRadius:2}}/><span style={{fontSize:9,color:"#aaa",fontFamily:"sans-serif"}}>Missed</span></div>
        </div>
      </div>

      {/* Weekly score trend */}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,margin:"0 0 12px"}}>Weekly Score Trend</h3>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
          {weeklyData.map((w,i) => (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{fontSize:9,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{w.avg||""}</div>
              <div style={{width:"100%",background:w.avg?C.gold:"#f0f0f0",borderRadius:"3px 3px 0 0",height:`${w.avg?(parseFloat(w.avg)/maxWeekly)*55:4}px`,transition:"height 0.5s",minHeight:4}}/>
              <div style={{fontSize:7,color:"#ccc",fontFamily:"sans-serif",textAlign:"center",lineHeight:1.2}}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillar averages */}
      <div style={{background:"#fff",borderRadius:14,padding:"14px",marginBottom:11,border:"1.5px solid #eee"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:13,color:C.navy,marginBottom:11}}>All-Time Pillar Averages</h3>
        {pillarAvgs.map(p => (
          <div key={p.id} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontFamily:"sans-serif",fontSize:11,color:"#555"}}>{p.icon} {p.label}</span>
              <span style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:p.col}}>{p.avg?""+p.avg+"/5 ("+p.total+"d)":"--"}</span>
            </div>
            <div style={{height:6,background:"#f0f0f0",borderRadius:5,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.avg?(p.avg/5)*100:0}%`,background:p.col,borderRadius:5,transition:"width 0.5s"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {(strongest||needsLove) && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
          {strongest && <div style={{background:strongest.light,borderRadius:11,padding:"12px",border:`1px solid ${strongest.col}44`}}>
            <div style={{fontSize:9,fontWeight:700,color:strongest.col,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>YOUR STRENGTH</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{strongest.icon} {strongest.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {strongest.avg}/5</div>
          </div>}
          {needsLove && needsLove.id!==strongest?.id && <div style={{background:"#fff8f0",borderRadius:11,padding:"12px",border:"1px solid #f4d0a033"}}>
            <div style={{fontSize:9,fontWeight:700,color:C.orange,fontFamily:"sans-serif",marginBottom:3,letterSpacing:0.5}}>NEEDS MORE LOVE</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.navy}}>{needsLove.icon} {needsLove.label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:"#999",marginTop:2}}>avg {needsLove.avg}/5</div>
          </div>}
        </div>
      )}

      <div style={{background:"#f9f6ff",borderRadius:11,padding:"13px",border:"1px solid #e8e0ff"}}>
        <p style={{fontSize:9,fontWeight:700,color:C.purple,fontFamily:"sans-serif",marginBottom:5,letterSpacing:0.5}}>YOUR INNERPROOF REMINDER</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:12,color:"#444",lineHeight:1.65,margin:"0 0 7px",fontStyle:"italic"}}>
          "You are not starting from zero. You are becoming integrated. And integrated people become powerful quietly."
        </p>
        <a href={SITE} target="_blank" rel="noopener" style={{fontSize:10,color:C.purple,fontFamily:"sans-serif",textDecoration:"none",fontWeight:700}}>Explore more at MindByTWC</a>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [session,  setSession]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState("today");
  const [pro,      setPro]      = useState(false);
  const [dbData,   setDbData]   = useState({entries:{}, pillars:{}});

  // Listen for auth state
  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      setSession(session);
      setLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load user data when session exists
  const loadData = useCallback(async (userId) => {
    const [entriesRes, pillarsRes] = await Promise.all([
      supabase.from("entries").select("*").eq("user_id",userId),
      supabase.from("pillar_entries").select("*").eq("user_id",userId),
    ]);
    const entries = {};
    (entriesRes.data||[]).forEach(e => { entries[e.entry_date] = e; });
    const pillars = {};
    (pillarsRes.data||[]).forEach(p => {
      if (!pillars[p.entry_date]) pillars[p.entry_date] = {};
      pillars[p.entry_date][p.pillar_id] = {notes:p.notes, score:p.score, insight:p.insight};
    });
    setDbData({entries, pillars});
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadData(session.user.id);
      // Check pro status
      supabase.from("profiles").select("is_pro").eq("id",session.user.id).single()
        .then(({data}) => { if (data?.is_pro) setPro(true); });
    }
  }, [session, loadData]);

  // Streak calculation
  let streak = 0;
  const sd = new Date();
  while (true) {
    const k = sd.toISOString().split("T")[0];
    if (!Object.keys(dbData.pillars[k]||{}).length) break;
    streak++; sd.setDate(sd.getDate()-1);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null); setDbData({entries:{},pillars:{}}); setPro(false); setView("today");
  }

  function demoPro() { setPro(true); setView("today"); }

  if (loading) return (
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:800,color:C.gold,letterSpacing:3,marginBottom:8}}>INNERPROOF</div>
        <div style={{fontFamily:"sans-serif",fontSize:12,color:"rgba(255,255,255,0.4)"}}>Loading your proof...</div>
      </div>
    </div>
  );

  if (!session) return <AuthScreen onAuth={setSession}/>;

  const showGate = !pro && (view==="review" || view==="dashboard");

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <Nav view={view} setView={setView} streak={streak} pro={pro} user={session.user} onSignOut={signOut}/>
      {showGate
        ? <Gate onDemo={demoPro}/>
        : view==="today"     ? <TodayView     userId={session.user.id} pro={pro} setView={setView} dbData={dbData} setDbData={setDbData}/>
        : view==="intention" ? <IntentionView userId={session.user.id} dbData={dbData} setDbData={setDbData}/>
        : view==="review"    ? <TrueRhythm    userId={session.user.id} dbData={dbData}/>
        : view==="log"       ? <ProofLog      dbData={dbData}/>
        : view==="dashboard" ? <Dashboard     dbData={dbData} user={session.user} pro={pro} onUpgrade={demoPro}/>
        :                      <Gate onDemo={demoPro}/>
      }
      <div style={{textAlign:"center",padding:"18px 15px 30px"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:12,color:C.gold,fontWeight:700,letterSpacing:1,marginBottom:2}}>INNERPROOF</div>
        <a href={SITE} target="_blank" rel="noopener" style={{fontFamily:"sans-serif",fontSize:10,color:"#bbb",textDecoration:"none"}}>
          by <strong style={{color:C.gold}}>MindByTWC</strong> - The Wellbeing Cognoscente
        </a>
      </div>
    </div>
  );
}
