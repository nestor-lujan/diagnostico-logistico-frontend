import { useState, useEffect } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const DEMO_MODE   = !import.meta.env.VITE_BACKEND_URL;
const PRECIO_DISPLAY = "$49.000 ARS";

// ─── DATA ────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { area:"Transporte y entregas",      short:"Entregas a tiempo",         q:"¿Qué porcentaje de tus entregas se realizan en el tiempo pactado con el cliente?",         opts:["Menos del 70% llegan a tiempo","Entre el 70% y el 90% llegan a tiempo","Más del 90% de las entregas son puntuales"],                         weights:[0,5,10] },
  { area:"Transporte y entregas",      short:"Planificación de rutas",    q:"¿Cómo planificás las rutas de entrega actualmente?",                                        opts:["Sin planificación formal, se decide en el momento","Con criterios básicos pero sin sistema definido","Con una herramienta o sistema estructurado"],  weights:[0,5,10] },
  { area:"Transporte y entregas",      short:"Costo por entrega",         q:"¿Tenés registro del costo por kilómetro o por entrega de tu flota?",                        opts:["No lo medimos","Lo registramos de forma informal o aproximada","Sí, con datos actualizados y confiables"],                                    weights:[0,5,10] },
  { area:"Transporte y entregas",      short:"Entregas fallidas",         q:"¿Con qué frecuencia tenés problemas de entregas fallidas o reprogramadas?",                 opts:["Frecuentemente, es un problema recurrente","Ocasionalmente, no es crítico","Raramente, está bien controlado"],                              weights:[0,5,10] },
  { area:"Transporte y entregas",      short:"Seguimiento al cliente",    q:"¿El cliente recibe confirmación o seguimiento de su entrega?",                              opts:["No, se entera cuando llega o si pregunta","Solo por llamado cuando hay problemas","Sí, de forma sistemática y proactiva"],                   weights:[0,5,10] },
  { area:"Almacenamiento e inventario",short:"Control de stock",          q:"¿Cómo controlás el stock de productos o materiales?",                                       opts:["Sin sistema formal, a ojo o de memoria","Con planilla Excel o cuaderno de registros","Con un sistema de gestión (WMS, ERP u otro)"],          weights:[0,5,10] },
  { area:"Almacenamiento e inventario",short:"Faltantes y excesos",       q:"¿Con qué frecuencia tenés faltantes o excesos de stock que afecten la operación?",         opts:["Frecuentemente, genera problemas importantes","Ocasionalmente, con impacto moderado","Casi nunca, está bien gestionado"],                   weights:[0,5,10] },
  { area:"Almacenamiento e inventario",short:"Layout del depósito",       q:"¿El depósito o almacén tiene una distribución definida por zonas o criterios?",            opts:["No, la disposición es improvisada","Tiene una organización básica pero mejorable","Sí, con layout definido y criterios claros"],             weights:[0,5,10] },
  { area:"Almacenamiento e inventario",short:"Inventarios físicos",       q:"¿Realizás inventarios físicos con alguna frecuencia?",                                      opts:["Nunca o solo cuando hay algún problema","Una o dos veces al año","Mensualmente o con mayor frecuencia"],                                     weights:[0,5,10] },
  { area:"Almacenamiento e inventario",short:"Visibilidad en tiempo real",q:"¿Podés saber en tiempo real cuánto stock tenés disponible?",                               opts:["No, hay que ir físicamente a verificar","Aproximadamente, con cierto margen de error","Sí, con datos actualizados en el momento"],           weights:[0,5,10] },
  { area:"Procesos y personal",        short:"Documentación de procesos", q:"¿Los procesos logísticos clave están documentados o estandarizados?",                      opts:["No están documentados, depende de quién haga la tarea","Algunos procesos sí, pero no la mayoría","Sí, la mayoría están documentados y se respetan"], weights:[0,5,10] },
  { area:"Procesos y personal",        short:"Capacitación del personal", q:"¿El personal logístico recibió capacitación específica en el último año?",                  opts:["No recibió capacitación","Capacitación informal o puntual sin planificación","Sí, capacitación formal y planificada"],                    weights:[0,5,10] },
  { area:"Procesos y personal",        short:"KPIs logísticos",           q:"¿Medís indicadores de desempeño (KPIs) de tu operación logística?",                        opts:["No medimos ningún indicador","Medimos algunos de forma informal","Sí, con KPIs definidos y revisados periódicamente"],                      weights:[0,5,10] },
  { area:"Procesos y personal",        short:"Registro de errores",       q:"¿Cuándo ocurre un error logístico, tenés un proceso para registrarlo y corregirlo?",       opts:["No, se resuelve en el momento y se olvida","A veces se registra pero no hay seguimiento","Sí, siempre hay registro y plan de mejora"],      weights:[0,5,10] },
  { area:"Procesos y personal",        short:"Roles y responsabilidades", q:"¿Las responsabilidades logísticas están claramente asignadas entre el personal?",           opts:["No están claras, hay superposición o vacíos","Están parcialmente definidas","Sí, cada rol tiene responsabilidades claras y documentadas"],  weights:[0,5,10] },
];

const AREAS = ["Transporte y entregas","Almacenamiento e inventario","Procesos y personal"];
const AREA_ICONS = {
  "Transporte y entregas": "🚛",
  "Almacenamiento e inventario": "📦",
  "Procesos y personal": "⚙️",
};

const ACTIONS = {
  "¿Qué porcentaje de tus entregas se realizan en el tiempo pactado con el cliente?":"Implementar registro diario de cumplimiento de entregas para identificar causas de demora.",
  "¿Cómo planificás las rutas de entrega actualmente?":"Definir criterios de planificación de rutas: zonas, ventanas horarias y capacidad de carga.",
  "¿Tenés registro del costo por kilómetro o por entrega de tu flota?":"Crear planilla de registro de costos por entrega: combustible, tiempo y kilómetros recorridos.",
  "¿Con qué frecuencia tenés problemas de entregas fallidas o reprogramadas?":"Implementar checklist de verificación previa a cada entrega para reducir intentos fallidos.",
  "¿El cliente recibe confirmación o seguimiento de su entrega?":"Establecer protocolo de aviso al cliente: confirmación de despacho y aviso de llegada.",
  "¿Cómo controlás el stock de productos o materiales?":"Implementar registro de stock en Excel con entradas, salidas y stock mínimo por ítem.",
  "¿Con qué frecuencia tenés faltantes o excesos de stock que afecten la operación?":"Definir stock mínimo y máximo por producto y crear alerta de reposición.",
  "¿El depósito o almacén tiene una distribución definida por zonas o criterios?":"Diseñar layout del depósito con zonas definidas: recepción, almacenamiento y despacho.",
  "¿Realizás inventarios físicos con alguna frecuencia?":"Establecer conteo físico mensual de los 20 ítems de mayor rotación (criterio Pareto).",
  "¿Podés saber en tiempo real cuánto stock tenés disponible?":"Implementar sistema de doble registro: movimiento físico + planilla actualizada al momento.",
  "¿Los procesos logísticos clave están documentados o estandarizados?":"Documentar los 3 procesos más críticos en un instructivo de una página cada uno.",
  "¿El personal logístico recibió capacitación específica en el último año?":"Armar un plan de capacitación trimestral con temas clave de la operación.",
  "¿Medís indicadores de desempeño (KPIs) de tu operación logística?":"Definir 3 KPIs básicos: tasa de entregas a tiempo, costo por entrega y exactitud de stock.",
  "¿Cuándo ocurre un error logístico, tenés un proceso para registrarlo y corregirlo?":"Crear registro de incidencias con causa, impacto y acción correctiva aplicada.",
  "¿Las responsabilidades logísticas están claramente asignadas entre el personal?":"Elaborar matriz de responsabilidades (RACI) para las tareas logísticas clave.",
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
function calcScores(answers) {
  const scores = {};
  AREAS.forEach(a => scores[a] = { total:0, max:0, problems:[] });
  QUESTIONS.forEach((q,i) => {
    const pts = answers[i] !== null ? q.weights[answers[i]] : 0;
    scores[q.area].total += pts;
    scores[q.area].max   += 10;
    if (answers[i] !== null && answers[i] <= 1)
      scores[q.area].problems.push({ q:q.q, short:q.short, area:q.area, severity: answers[i]===0 ? 2 : 1 });
  });
  AREAS.forEach(a => { scores[a].pct = Math.round(scores[a].total / scores[a].max * 100); });
  return scores;
}

function semLabel(p){ return p>=70 ? "Consolidado" : p>=40 ? "En desarrollo" : "Crítico"; }
function semColor(p){ return p>=70 ? "#22c87a"     : p>=40 ? "#f5a623"       : "#e84040"; }

// ─── SUPABASE SAVE ───────────────────────────────────────────────────────────
async function saveDiagnosticToBackend({ email, empresa, answers, scores, general }) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/save-diagnostic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, empresa, answers, scores, general }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const G = {
  bg:          "#080b12",
  surface:     "#0f1320",
  surface2:    "#141826",
  border:      "#1e2440",
  borderLight: "#252d4a",
  accent:      "#2563eb",
  accentHover: "#1d4ed8",
  accentGlow:  "rgba(37,99,235,0.18)",
  accentLight: "rgba(37,99,235,0.10)",
  text:        "#e8ecf8",
  textSoft:    "#a0aacb",
  muted:       "#5a6285",
  green:       "#22c87a",
  amber:       "#f5a623",
  red:         "#e84040",
};

// ─── PDF ─────────────────────────────────────────────────────────────────────
function generatePDF(scores, answers, general) {
  const allProblems = [];
  AREAS.forEach(a => scores[a].problems.forEach(p => allProblems.push(p)));
  allProblems.sort((a,b) => b.severity - a.severity);
  const top5 = allProblems.slice(0,5);
  const date = new Date().toLocaleDateString("es-AR",{year:"numeric",month:"long",day:"numeric"});
  const color = semColor(general);

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#fff;color:#1a1d2e;padding:48px;font-size:13px;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #1e2440}
.brand{font-family:'Libre Baskerville',serif;font-size:22px;color:#0f1320;letter-spacing:-.02em}
.brand-sub{font-size:11px;color:#5a6285;letter-spacing:.1em;text-transform:uppercase;margin-top:4px}
.hero{text-align:center;padding:32px 0 40px;background:#f7f8fc;border-radius:16px;margin-bottom:36px}
.score-wrap{width:110px;height:110px;border-radius:50%;border:3px solid ${color};display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 16px}
.score-num{font-family:'Libre Baskerville',serif;font-size:38px;line-height:1;color:#0f1320}
.score-sub{font-size:10px;color:#5a6285;margin-top:2px}
.score-label{font-family:'Libre Baskerville',serif;font-size:20px;color:#0f1320;margin-bottom:8px}
.score-desc{font-size:13px;color:#5a6285;max-width:420px;margin:0 auto}
.section{margin-bottom:32px}
.section-title{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#5a6285;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e8ecf8}
.area-row{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.area-name{font-size:13px;font-weight:500;min-width:210px}
.area-bar-bg{flex:1;height:6px;background:#e8ecf8;border-radius:3px;overflow:hidden}
.area-bar-fill{height:100%;border-radius:3px}
.area-pct{font-size:13px;font-weight:600;min-width:55px;text-align:right}
.chip{display:inline-block;font-size:10px;padding:2px 9px;border-radius:10px;font-weight:600;margin-left:8px}
.problem-row{display:flex;gap:14px;margin-bottom:10px;padding:14px;background:#f7f8fc;border-radius:10px;border:1px solid #e8ecf8}
.p-num{font-family:'Libre Baskerville',serif;font-size:20px;color:#b0b8d4;min-width:22px;line-height:1.2}
.p-title{font-size:13px;font-weight:600;color:#1a1d2e;margin-bottom:3px}
.p-area{font-size:11px;color:#5a6285}
.action-row{display:flex;gap:14px;margin-bottom:10px;padding:14px;border-left:3px solid #2563eb;background:#f4f6ff;border-radius:0 10px 10px 0}
.a-num{font-size:14px;font-weight:700;color:#2563eb;min-width:22px}
.a-text{font-size:13px;color:#1a1d2e;font-weight:500}
.a-meta{font-size:11px;color:#5a6285;margin-top:3px}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e8ecf8;display:flex;justify-content:space-between;font-size:11px;color:#5a6285}
</style></head><body>
<div class="header">
  <div><div class="brand">Luján Logística</div><div class="brand-sub">Diagnóstico Operativo · PYMEs</div></div>
  <div style="text-align:right"><div class="brand-sub">Informe generado</div><div style="font-size:11px;color:#5a6285;margin-top:4px">${date}</div></div>
</div>
<div class="hero">
  <div class="score-wrap"><div class="score-num">${general}</div><div class="score-sub">/ 100</div></div>
  <div class="score-label">${semLabel(general)}</div>
  <div class="score-desc">Score general de <strong>${general}/100</strong>. Análisis por área, problemas y plan de acción recomendado.</div>
</div>
<div class="section"><div class="section-title">Semáforo por área</div>
${AREAS.map(a=>{const s=scores[a];const c=semColor(s.pct);return`<div class="area-row"><div class="area-name">${AREA_ICONS[a]} ${a}<span class="chip" style="background:${c}22;color:${c}">${semLabel(s.pct)}</span></div><div class="area-bar-bg"><div class="area-bar-fill" style="width:${s.pct}%;background:${c}"></div></div><div class="area-pct" style="color:${c}">${s.pct}/100</div></div>`;}).join("")}
</div>
<div class="section"><div class="section-title">Principales problemas detectados</div>
${top5.length===0?'<p style="color:#5a6285">No se detectaron problemas críticos.</p>':top5.map((p,i)=>`<div class="problem-row"><div class="p-num">${i+1}</div><div><div class="p-title">${p.short}</div><div class="p-area">${p.area} · ${p.severity===2?"⚠ Prioridad alta":"Prioridad media"}</div></div></div>`).join("")}
</div>
<div class="section"><div class="section-title">Plan de acción recomendado</div>
${top5.length===0?'<p style="color:#5a6285">Mantené los procesos actuales y enfocate en mejora continua.</p>':top5.map((p,i)=>{const a=ACTIONS[p.q]||"Revisá esta área con tu equipo.";return`<div class="action-row"><div class="a-num">${i+1}</div><div><div class="a-text">${a}</div><div class="a-meta">${p.area} · ${p.severity===2?"Acción urgente":"Próximo trimestre"}</div></div></div>`;}).join("")}
</div>
<div class="footer"><div>Luján Logística · lic.nestorlujan@gmail.com</div><div>Documento confidencial</div></div>
</body></html>`;

  const blob = new Blob([html],{type:"text/html"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "Diagnostico-Logistico-Lujan.html"; a.click();
  URL.revokeObjectURL(url);
}

// ─── BAR ANIMATE ─────────────────────────────────────────────────────────────
function BarAnimate({ pct, color }) {
  const [w, setW] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setW(pct),400); return()=>clearTimeout(t); },[pct]);
  return (
    <div style={{ height:6, background:G.border, borderRadius:3, overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:3, background:color, width:`${w}%`, transition:"width 1.1s cubic-bezier(.4,0,.2,1)" }}/>
    </div>
  );
}

// ─── LANDING ─────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  const feats = [
    { icon:"⏱", title:"15 minutos",     desc:"Cuestionario ágil sobre tu operación real. Sin rodeos." },
    { icon:"📊", title:"Score por área", desc:"Semáforo visual: Transporte, Inventario y Procesos." },
    { icon:"🎯", title:"Plan de acción", desc:"Las brechas críticas con acciones concretas priorizadas." },
    { icon:"📄", title:"Informe PDF",    desc:"Documento profesional listo para compartir con tu equipo." },
  ];

  return (
    <div>
      <div style={{ paddingTop:"4.5rem", paddingBottom:"3.5rem", textAlign:"center" }}>
        <div style={{
          display:"inline-block", fontSize:11, letterSpacing:".14em", textTransform:"uppercase",
          color:G.accent, fontWeight:600, border:`1px solid ${G.accentGlow}`,
          background:G.accentLight, borderRadius:20, padding:"5px 16px", marginBottom:"1.75rem"
        }}>
          Diagnóstico Logístico · PYMEs argentinas
        </div>

        <h1 style={{
          fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(2.1rem,6vw,3.2rem)",
          lineHeight:1.2, marginBottom:"1.25rem", color:"#fff", letterSpacing:"-.02em"
        }}>
          Sabé exactamente<br/>qué está fallando<br/>
          <span style={{ color:G.accent }}>en tu operación.</span>
        </h1>

        <p style={{ fontSize:15, color:G.textSoft, lineHeight:1.75, maxWidth:440, margin:"0 auto 2.5rem" }}>
          En 15 minutos obtenés un diagnóstico completo de tu logística con score, semáforo por área y plan de acción prioritario.
        </p>

        <div style={{
          display:"inline-flex", flexDirection:"column", alignItems:"center",
          background:G.surface, border:`1px solid ${G.border}`, borderRadius:16,
          padding:"1.25rem 2.5rem", marginBottom:"2rem"
        }}>
          <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"2.8rem", color:"#fff", lineHeight:1 }}>{PRECIO_DISPLAY}</div>
          <div style={{ fontSize:12, color:G.muted, marginTop:5 }}>pago único · acceso inmediato</div>
        </div>

        <div>
          <button
            style={{
              display:"inline-block", padding:"16px 40px", background:G.accent, color:"#fff",
              border:"none", borderRadius:12, fontSize:15, fontWeight:600,
              fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
              boxShadow:`0 8px 32px ${G.accentGlow}`
            }}
            onClick={onStart}
            onMouseOver={e=>e.currentTarget.style.background=G.accentHover}
            onMouseOut={e=>e.currentTarget.style.background=G.accent}
          >
            Comenzar diagnóstico →
          </button>
          <div style={{ fontSize:12, color:G.muted, marginTop:12 }}>Sin registro. Sin suscripción. Resultado inmediato.</div>
          {DEMO_MODE && (
            <div style={{ fontSize:11, color:G.amber, marginTop:8,
              background:"rgba(245,166,35,.08)", border:"1px solid rgba(245,166,35,.2)",
              borderRadius:8, padding:"6px 14px", display:"inline-block" }}>
              ⚠ Modo demo — el pago está simulado
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:"2.5rem" }}>
        {[["15'","Duración"],["3","Áreas clave"],["100","Score máximo"]].map(([v,l],i)=>(
          <div key={i} style={{ textAlign:"center", padding:"1.25rem 1rem", background:G.surface, border:`1px solid ${G.border}`, borderRadius:14 }}>
            <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"2rem", color:"#fff", lineHeight:1, marginBottom:4 }}>{v}</div>
            <div style={{ fontSize:11, color:G.muted, textTransform:"uppercase", letterSpacing:".1em" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ height:1, background:G.border, marginBottom:"2.5rem" }}/>

      <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.4rem", color:"#fff" }}>¿Qué incluye el diagnóstico?</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:12, marginBottom:"2.5rem" }}>
        {feats.map((f,i)=>(
          <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:"1.25rem" }}
            onMouseOver={e=>e.currentTarget.style.borderColor=G.borderLight}
            onMouseOut={e=>e.currentTarget.style.borderColor=G.border}
          >
            <div style={{ fontSize:22, marginBottom:10 }}>{f.icon}</div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:5, color:"#fff" }}>{f.title}</div>
            <div style={{ fontSize:12, color:G.textSoft, lineHeight:1.65 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ height:1, background:G.border, marginBottom:"2rem" }}/>
      <div style={{ textAlign:"center", padding:"1rem 0 2.5rem" }}>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.2rem", marginBottom:8, color:"#fff" }}>Luján Logística</div>
        <div style={{ fontSize:13, color:G.textSoft, maxWidth:360, margin:"0 auto 1.25rem", lineHeight:1.8 }}>
          Consultoría en logística y operaciones para PYMEs.<br/>Diagnósticos, procesos y estrategia operativa.
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          {[
            ["mailto:lic.nestorlujan@gmail.com","✉ Email"],
            ["https://wa.me/542804206573","💬 WhatsApp"],
            ["https://www.instagram.com/licnestorlujan","📸 Instagram"],
            ["https://www.linkedin.com/in/lic-n%C3%A9stor-luj%C3%A1n-consultor-log%C3%ADstico/","💼 LinkedIn"],
          ].map(([href,label],i)=>(
            <a key={i} href={href} target="_blank" rel="noreferrer"
              style={{ fontSize:12, color:G.accent, textDecoration:"none", fontWeight:500 }}>{label}</a>
          ))}
        </div>
        <div style={{ fontSize:11, color:G.muted, marginTop:14 }}>Trelew, Chubut, Argentina</div>
      </div>
    </div>
  );
}

// ─── CHECKOUT ────────────────────────────────────────────────────────────────
function Checkout({ onPaid, onBack }) {
  const [step, setStep]       = useState("form");
  const [email, setEmail]     = useState("");
  const [empresa, setEmpresa] = useState("");
  const [emailError, setErr]  = useState("");
  const [errorMsg, setErrMsg] = useState("");

  const s = {
    card:  { background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:"1.5rem", marginBottom:12 },
    label: { fontSize:12, color:G.textSoft, marginBottom:7, display:"block", fontWeight:500 },
    input: { width:"100%", padding:"12px 14px", background:G.bg, border:`1px solid ${G.border}`, borderRadius:10, color:G.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" },
    row:     { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${G.border}` },
    rowLast: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0 0" },
    mpBtn:   { display:"flex", alignItems:"center", justifyContent:"center", gap:10, width:"100%", padding:"16px 0", background:"#009ee3", border:"none", borderRadius:12, color:"#fff", fontSize:15, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", marginTop:16 },
  };

  async function handlePagar() {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setErr("Ingresá un email válido."); return; }
    setErr(""); setStep("processing");
    if (DEMO_MODE) { await new Promise(r=>setTimeout(r,1600)); setStep("success"); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/api/create-preference`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, empresa }),
      });
      if (!res.ok) throw new Error();
      const { init_point, sandbox_init_point } = await res.json();
      window.location.href = import.meta.env.DEV ? sandbox_init_point : init_point;
    } catch {
      setErrMsg("No pudimos conectar con el servidor de pagos. Intentá de nuevo.");
      setStep("error");
    }
  }

  if (step==="processing") return (
    <div style={{ paddingTop:"5rem", textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:16 }}>⏳</div>
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.4rem", color:"#fff", marginBottom:8 }}>Procesando...</div>
      <div style={{ fontSize:13, color:G.muted }}>Conectando con MercadoPago. No cerrés esta ventana.</div>
    </div>
  );

  if (step==="error") return (
    <div style={{ paddingTop:"5rem", textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:16 }}>❌</div>
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.4rem", color:"#fff", marginBottom:8 }}>Error al procesar</div>
      <div style={{ fontSize:13, color:G.muted, marginBottom:24 }}>{errorMsg}</div>
      <button style={{ padding:"13px 32px", background:G.accent, border:"none", borderRadius:10, color:"#fff", fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
        onClick={()=>setStep("form")}>Intentar de nuevo</button>
    </div>
  );

  if (step==="success") return (
    <div style={{ paddingTop:"5rem", textAlign:"center" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(34,200,122,.12)", border:`2px solid ${G.green}`,
        display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:28 }}>✓</div>
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.7rem", color:"#fff", marginBottom:10 }}>¡Pago confirmado!</div>
      <div style={{ fontSize:14, color:G.textSoft, marginBottom:28, lineHeight:1.7 }}>
        Acceso habilitado para <strong style={{ color:G.text }}>{email}</strong>.
      </div>
      <button style={{ padding:"15px 40px", background:G.green, border:"none", borderRadius:12,
        color:"#071a10", fontSize:15, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}
        onClick={()=>onPaid({ email, empresa })}>
        Comenzar diagnóstico →
      </button>
    </div>
  );

  return (
    <div style={{ paddingTop:"2.5rem" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:G.muted, fontSize:13, cursor:"pointer", marginBottom:"1.75rem", fontFamily:"'DM Sans',sans-serif" }}>← Volver</button>
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.7rem", color:"#fff", marginBottom:6 }}>Completá tu compra</div>
      <div style={{ fontSize:13, color:G.muted, marginBottom:"1.75rem" }}>Acceso inmediato al diagnóstico logístico completo.</div>
      <div style={s.card}>
        <div style={{ fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:G.accent, marginBottom:14, fontWeight:600 }}>Resumen</div>
        <div style={s.row}><span style={{ fontSize:13 }}>Diagnóstico Logístico para PYMEs</span><span style={{ fontSize:13, fontWeight:600 }}>{PRECIO_DISPLAY}</span></div>
        <div style={s.row}><span style={{ fontSize:12, color:G.muted }}>Informe PDF incluido</span><span style={{ fontSize:12, color:G.green }}>✓</span></div>
        <div style={s.row}><span style={{ fontSize:12, color:G.muted }}>Acceso inmediato</span><span style={{ fontSize:12, color:G.green }}>✓</span></div>
        <div style={s.rowLast}><span style={{ fontSize:14, fontWeight:600 }}>Total</span><span style={{ fontSize:17, fontWeight:600, color:"#fff" }}>{PRECIO_DISPLAY}</span></div>
      </div>
      <div style={s.card}>
        <div style={{ fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:G.accent, marginBottom:16, fontWeight:600 }}>Tus datos</div>
        <div style={{ marginBottom:14 }}>
          <label style={s.label}>Email *</label>
          <input style={{ ...s.input, borderColor: emailError ? G.red : G.border }} type="email"
            placeholder="tu@email.com" value={email} onChange={e=>{ setEmail(e.target.value); setErr(""); }}/>
          {emailError && <div style={{ fontSize:12, color:G.red, marginTop:5 }}>{emailError}</div>}
        </div>
        <div>
          <label style={s.label}>Empresa (opcional)</label>
          <input style={s.input} type="text" placeholder="Nombre de tu empresa" value={empresa} onChange={e=>setEmpresa(e.target.value)}/>
        </div>
      </div>
      <button style={s.mpBtn} onClick={handlePagar}>
        
        Pagar con MercadoPago
      </button>
      <div style={{ textAlign:"center", marginTop:12 }}>
        <div style={{ fontSize:11, color:G.muted }}>🔒 Pago seguro · Tarjetas, débito y transferencia</div>
      </div>
    </div>
  );
}

// ─── QUIZ ────────────────────────────────────────────────────────────────────
function Quiz({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(new Array(15).fill(null));
  const [animKey, setAnimKey] = useState(0);

  const q   = QUESTIONS[current];
  const pct = (current / 15) * 100;

  function selectOpt(i){ const next=[...answers]; next[current]=i; setAnswers(next); }
  function goNext(){
    if (answers[current]===null) return;
    if (current===14){ onFinish(answers); return; }
    setAnimKey(k=>k+1); setCurrent(c=>c+1);
  }
  function goBack(){ if(current>0){ setAnimKey(k=>k+1); setCurrent(c=>c-1); } }

  return (
    <div style={{ paddingTop:"2.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"2.25rem" }}>
        <div style={{ flex:1, height:3, background:G.border, borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", background:`linear-gradient(90deg,${G.accent},#6366f1)`, borderRadius:2, width:`${pct}%`, transition:"width .5s ease" }}/>
        </div>
        <span style={{ fontSize:12, color:G.muted, flexShrink:0 }}>{current+1}/15</span>
      </div>

      <div key={animKey} style={{ animation:"fadeUp .3s ease forwards" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <span style={{ fontSize:16 }}>{AREA_ICONS[q.area]}</span>
          <span style={{ fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:G.accent, fontWeight:600 }}>{q.area}</span>
        </div>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(1.15rem,3.5vw,1.4rem)", lineHeight:1.45, marginBottom:"2rem", color:"#fff" }}>
          {q.q}
        </div>
        <div>
          {q.opts.map((o,i)=>{
            const sel = answers[current]===i;
            return (
              <button key={i}
                style={{
                  display:"flex", alignItems:"center", gap:14, width:"100%", padding:"15px 16px", marginBottom:10,
                  background:sel ? G.accentLight : G.surface,
                  border:`1px solid ${sel ? G.accent : G.border}`,
                  borderRadius:12, color:sel ? "#fff" : G.text,
                  fontSize:14, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", textAlign:"left", transition:"all .15s"
                }}
                onClick={()=>selectOpt(i)}
              >
                <span style={{
                  minWidth:28, height:28, borderRadius:8,
                  background: sel ? G.accent : G.border, color: sel ? "#fff" : G.muted,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700, flexShrink:0
                }}>
                  {["A","B","C"][i]}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginTop:12 }}>
        <button style={{ padding:"12px 22px", background:"transparent", border:`1px solid ${G.border}`, borderRadius:10, color:G.muted, fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", visibility:current===0?"hidden":"visible" }} onClick={goBack}>← Anterior</button>
        <button style={{ padding:"13px 28px", background:answers[current]===null ? G.border : G.accent, border:"none", borderRadius:10, color:answers[current]===null ? G.muted : "#fff", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:answers[current]===null ? "not-allowed" : "pointer" }} onClick={goNext} disabled={answers[current]===null}>
          {current===14 ? "Ver diagnóstico →" : "Siguiente →"}
        </button>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function Results({ answers, clientData, onRestart }) {
  const scores  = calcScores(answers);
  const general = Math.round((scores[AREAS[0]].pct+scores[AREAS[1]].pct+scores[AREAS[2]].pct)/3);
  const color   = semColor(general);
  const [saved, setSaved] = useState(false);

  const allProblems = [];
  AREAS.forEach(a => scores[a].problems.forEach(p => allProblems.push(p)));
  allProblems.sort((a,b)=>b.severity-a.severity);
  const top5 = allProblems.slice(0,5);

  useEffect(()=>{
    if (clientData?.email) {
      saveDiagnosticToBackend({ email:clientData.email, empresa:clientData.empresa||"", answers, scores, general })
        .then(ok => setSaved(ok));
    }
  }, []);

  return (
    <div style={{ paddingTop:"2.5rem" }}>
      <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
        <div style={{ width:140, height:140, borderRadius:"50%", border:`3px solid ${color}`, boxShadow:`0 0 48px ${color}44`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
          <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"3rem", color:"#fff", lineHeight:1 }}>{general}</div>
          <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>/ 100</div>
        </div>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.6rem", color:"#fff", marginBottom:8 }}>{semLabel(general)}</div>
        <div style={{ fontSize:14, color:G.textSoft, lineHeight:1.7, maxWidth:400, margin:"0 auto" }}>
          Tu operación obtuvo un score de <strong style={{ color:"#fff" }}>{general}/100</strong>.
        </div>
        {saved && <div style={{ fontSize:12, color:G.green, marginTop:10 }}>✓ Diagnóstico guardado correctamente</div>}
      </div>

      <div style={{ fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:G.muted, marginBottom:12 }}>Semáforo por área</div>
      {AREAS.map(a=>{
        const s=scores[a]; const c=semColor(s.pct);
        return (
          <div key={a} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:"1rem 1.25rem", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }}/>
                {AREA_ICONS[a]} {a}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:c }}>{s.pct}/100</span>
                <span style={{ fontSize:10, padding:"2px 9px", borderRadius:20, fontWeight:600, background:c+"22", color:c }}>{semLabel(s.pct)}</span>
              </div>
            </div>
            <BarAnimate pct={s.pct} color={c}/>
          </div>
        );
      })}

      {top5.length>0 && <>
        <div style={{ fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:G.muted, margin:"1.75rem 0 .75rem" }}>Principales problemas detectados</div>
        {top5.map((p,i)=>(
          <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:"1rem 1.25rem", marginBottom:10, display:"flex", gap:14 }}>
            <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.5rem", color:G.muted, minWidth:24, lineHeight:1.1 }}>{i+1}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{p.short}</div>
              <div style={{ fontSize:12, color:G.muted }}>{p.area} · {p.severity===2?"⚠ Prioridad alta":"Prioridad media"}</div>
            </div>
          </div>
        ))}
      </>}

      <div style={{ fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:G.muted, margin:"1.75rem 0 .75rem" }}>Plan de acción recomendado</div>
      {top5.length===0 ? (
        <div style={{ borderLeft:`3px solid ${G.green}`, background:G.surface2, borderRadius:"0 14px 14px 0", padding:"1rem 1.25rem" }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>Tu operación está en buen nivel.</div>
          <div style={{ fontSize:11, color:G.muted }}>Enfocate en mantener indicadores y explorar mejoras tecnológicas.</div>
        </div>
      ) : top5.map((p,i)=>{
        const accion = ACTIONS[p.q]||"Revisá esta área con tu equipo.";
        return (
          <div key={i} style={{ borderLeft:`3px solid ${G.accent}`, background:G.surface2, borderRadius:"0 14px 14px 0", padding:"1rem 1.25rem", marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{i+1}. {accion.split(":")[0]}</div>
            <div style={{ fontSize:11, color:G.muted }}>{p.area} · {p.severity===2?"Acción urgente":"Próximo trimestre"}</div>
          </div>
        );
      })}

      <button style={{ display:"block", width:"100%", padding:"15px 0", marginTop:"1.75rem", background:G.green, border:"none", borderRadius:12, color:"#071a10", fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}
        onClick={()=>generatePDF(scores,answers,general)}>
        ↓ Descargar informe completo (PDF)
      </button>
      <button style={{ display:"block", width:"100%", padding:"13px 0", marginTop:10, background:"transparent", border:`1px solid ${G.border}`, borderRadius:12, color:G.muted, fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}
        onClick={onRestart}>
        Realizar nuevo diagnóstico
      </button>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState("landing");
  const [finalAnswers, setFinalAns] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [verifying, setVerifying]   = useState(false);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const status    = params.get("status");
    const paymentId = params.get("payment_id");
    if (status==="approved" && paymentId && !DEMO_MODE) {
      setVerifying(true);
      fetch(`${BACKEND_URL}/api/verify-payment?payment_id=${paymentId}`)
        .then(r=>r.json())
        .then(data=>{ if(data.approved) setScreen("quiz"); else setScreen("landing"); })
        .catch(()=>setScreen("landing"))
        .finally(()=>setVerifying(false));
    } else if (status==="approved" && DEMO_MODE) {
      setScreen("quiz");
    }
  }, []);

  useEffect(()=>{
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  },[]);

  if (verifying) return (
    <div style={{ background:G.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", color:G.muted, fontSize:14 }}>
      Verificando pago...
    </div>
  );

  return (
    <div style={{ background:G.bg, minHeight:"100vh" }}>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:300,
        background:"radial-gradient(ellipse 80% 40% at 50% 0%,rgba(37,99,235,.12),transparent)",
        pointerEvents:"none", zIndex:0 }}/>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"0 1rem 5rem", fontFamily:"'DM Sans',sans-serif", color:G.text, minHeight:"100vh", position:"relative", zIndex:1 }}>
        {screen==="landing"  && <Landing  onStart={()=>setScreen("checkout")}/>}
        {screen==="checkout" && <Checkout onPaid={(data)=>{ setClientData(data); setScreen("quiz"); }} onBack={()=>setScreen("landing")}/>}
        {screen==="quiz"     && <Quiz     onFinish={ans=>{ setFinalAns(ans); setScreen("results"); }}/>}
        {screen==="results"  && <Results  answers={finalAnswers} clientData={clientData} onRestart={()=>{ setFinalAns(null); setClientData(null); setScreen("landing"); }}/>}
      </div>
    </div>
  );
}
