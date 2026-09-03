import { useState, useEffect } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

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

// ─── BACKEND ─────────────────────────────────────────────────────────────────
async function saveDiagnosticToBackend({ email, empresa, nombre, rubro, answers, scores, general }) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/save-diagnostic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, empresa, nombre, rubro, answers, scores, general }),
    });
    return res.ok;
  } catch { return false; }
}

async function sendEmailToClient({ email, empresa, nombre, scores, general }) {
  try {
    await fetch(`${BACKEND_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, empresa, nombre, scores, general }),
    });
  } catch { /* silencioso */ }
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
  accentGlow:  "rgba(37,99,235,0.20)",
  accentLight: "rgba(37,99,235,0.10)",
  text:        "#e8ecf8",
  textSoft:    "#a0aacb",
  muted:       "#5a6285",
  green:       "#22c87a",
  amber:       "#f5a623",
  red:         "#e84040",
};

// ─── PDF ─────────────────────────────────────────────────────────────────────
function generatePDF(scores, answers, general, clientData) {
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
body{font-family:'DM Sans',sans-serif;background:#fff;color:#1a1d2e;padding:40px;font-size:13px;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #1e2440}
.brand{font-family:'Libre Baskerville',serif;font-size:20px;color:#0f1320}
.brand-sub{font-size:11px;color:#5a6285;letter-spacing:.1em;text-transform:uppercase;margin-top:3px}
.hero{text-align:center;padding:28px 0 36px;background:#f7f8fc;border-radius:14px;margin-bottom:28px}
.score-wrap{width:100px;height:100px;border-radius:50%;border:3px solid ${color};display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 14px}
.score-num{font-family:'Libre Baskerville',serif;font-size:34px;line-height:1;color:#0f1320}
.score-sub{font-size:10px;color:#5a6285;margin-top:2px}
.score-label{font-family:'Libre Baskerville',serif;font-size:18px;color:#0f1320;margin-bottom:6px}
.score-desc{font-size:12px;color:#5a6285;max-width:380px;margin:0 auto}
.client-info{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap}
.client-chip{background:#f7f8fc;border:1px solid #e8ecf8;border-radius:8px;padding:8px 14px;font-size:12px}
.chip-label{font-size:10px;color:#5a6285;text-transform:uppercase;letter-spacing:.08em}
.section{margin-bottom:28px}
.section-title{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#5a6285;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e8ecf8}
.area-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.area-name{font-size:12px;font-weight:500;min-width:200px}
.area-bar-bg{flex:1;height:6px;background:#e8ecf8;border-radius:3px;overflow:hidden}
.area-bar-fill{height:100%;border-radius:3px}
.area-pct{font-size:12px;font-weight:600;min-width:50px;text-align:right}
.chip{display:inline-block;font-size:10px;padding:2px 8px;border-radius:10px;font-weight:600;margin-left:6px}
.problem-row{display:flex;gap:12px;margin-bottom:8px;padding:12px;background:#f7f8fc;border-radius:8px}
.p-num{font-family:'Libre Baskerville',serif;font-size:18px;color:#b0b8d4;min-width:20px;line-height:1.2}
.p-title{font-size:12px;font-weight:600;color:#1a1d2e;margin-bottom:2px}
.p-area{font-size:11px;color:#5a6285}
.action-row{display:flex;gap:12px;margin-bottom:8px;padding:12px;border-left:3px solid #2563eb;background:#f4f6ff;border-radius:0 8px 8px 0}
.a-num{font-size:13px;font-weight:700;color:#2563eb;min-width:20px}
.a-text{font-size:12px;color:#1a1d2e;font-weight:500}
.a-meta{font-size:11px;color:#5a6285;margin-top:2px}
.footer{margin-top:36px;padding-top:16px;border-top:1px solid #e8ecf8;display:flex;justify-content:space-between;font-size:11px;color:#5a6285}
</style></head><body>
<div class="header">
  <div><div class="brand">Luján Logística</div><div class="brand-sub">Diagnóstico Operativo · PYMEs</div></div>
  <div style="text-align:right"><div class="brand-sub">Informe</div><div style="font-size:11px;color:#5a6285;margin-top:3px">${date}</div></div>
</div>
<div class="hero">
  <div class="score-wrap"><div class="score-num">${general}</div><div class="score-sub">/ 100</div></div>
  <div class="score-label">${semLabel(general)}</div>
  <div class="score-desc">Score general <strong>${general}/100</strong> — análisis por área, problemas y plan de acción.</div>
</div>
${clientData ? `<div class="client-info">
  ${clientData.nombre ? `<div class="client-chip"><div class="chip-label">Nombre</div>${clientData.nombre}</div>` : ""}
  ${clientData.empresa ? `<div class="client-chip"><div class="chip-label">Empresa</div>${clientData.empresa}</div>` : ""}
  ${clientData.rubro ? `<div class="client-chip"><div class="chip-label">Rubro</div>${clientData.rubro}</div>` : ""}
</div>` : ""}
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
    <div style={{ height:8, background:G.border, borderRadius:4, overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:4, background:color, width:`${w}%`, transition:"width 1.1s cubic-bezier(.4,0,.2,1)" }}/>
    </div>
  );
}

// ─── LANDING ─────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  return (
    <div>
      {/* HERO */}
      <div style={{ paddingTop:"3rem", paddingBottom:"2.5rem", textAlign:"center" }}>
        <div style={{
          display:"inline-block", fontSize:11, letterSpacing:".14em", textTransform:"uppercase",
          color:G.accent, fontWeight:600, border:`1px solid ${G.accentGlow}`,
          background:G.accentLight, borderRadius:20, padding:"6px 18px", marginBottom:"1.5rem"
        }}>
          Diagnóstico Logístico Gratuito · PYMEs
        </div>

        <h1 style={{
          fontFamily:"'Libre Baskerville',serif",
          fontSize:"clamp(1.9rem,7vw,3rem)",
          lineHeight:1.2, marginBottom:"1.25rem", color:"#fff", letterSpacing:"-.02em"
        }}>
          Sabé exactamente<br/>qué está fallando<br/>
          <span style={{ color:G.accent }}>en tu operación.</span>
        </h1>

        <p style={{ fontSize:15, color:G.textSoft, lineHeight:1.75, maxWidth:400, margin:"0 auto 2rem" }}>
          Diagnóstico completo en 15 minutos. Score por área, problemas críticos y plan de acción. <strong style={{ color:"#fff" }}>100% gratuito.</strong>
        </p>

        <button
          style={{
            display:"block", width:"100%", maxWidth:340, margin:"0 auto",
            padding:"18px 0", background:G.accent, color:"#fff",
            border:"none", borderRadius:14, fontSize:16, fontWeight:700,
            fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
            boxShadow:`0 8px 32px ${G.accentGlow}`, letterSpacing:".01em"
          }}
          onClick={onStart}
        >
          Comenzar diagnóstico →
        </button>
        <div style={{ fontSize:12, color:G.muted, marginTop:10 }}>
          Sin registro. Sin tarjeta. Resultado inmediato.
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:"2rem" }}>
        {[["15'","Duración"],["3","Áreas"],["100","Score máx"]].map(([v,l],i)=>(
          <div key={i} style={{ textAlign:"center", padding:"1.1rem .5rem", background:G.surface, border:`1px solid ${G.border}`, borderRadius:12 }}>
            <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.8rem", color:"#fff", lineHeight:1, marginBottom:3 }}>{v}</div>
            <div style={{ fontSize:10, color:G.muted, textTransform:"uppercase", letterSpacing:".1em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ height:1, background:G.border, marginBottom:"2rem" }}/>
      <div style={{ textAlign:"center", marginBottom:"1.25rem" }}>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.25rem", color:"#fff" }}>¿Qué incluye?</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"2rem" }}>
        {[
          { icon:"📊", title:"Score por área", desc:"Semáforo visual: Transporte, Inventario y Procesos." },
          { icon:"🎯", title:"Plan de acción", desc:"Acciones concretas priorizadas por impacto." },
          { icon:"⚠️", title:"Problemas críticos", desc:"Los puntos débiles de tu operación, claros." },
          { icon:"📄", title:"Informe PDF", desc:"Documento profesional para compartir." },
        ].map((f,i)=>(
          <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:"1rem" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{f.icon}</div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:4, color:"#fff" }}>{f.title}</div>
            <div style={{ fontSize:12, color:G.textSoft, lineHeight:1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ height:1, background:G.border, marginBottom:"1.75rem" }}/>
      <div style={{ textAlign:"center", paddingBottom:"2rem" }}>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.1rem", marginBottom:6, color:"#fff" }}>Luján Logística</div>
        <div style={{ fontSize:12, color:G.textSoft, marginBottom:"1rem", lineHeight:1.7 }}>
          Consultoría en logística y operaciones para PYMEs.<br/>Trelew, Chubut, Argentina
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
          {[
            ["mailto:lic.nestorlujan@gmail.com","✉ Email"],
            ["https://wa.me/542804206573","💬 WhatsApp"],
            ["https://www.instagram.com/licnestorlujan","📸 Instagram"],
          ].map(([href,label],i)=>(
            <a key={i} href={href} target="_blank" rel="noreferrer"
              style={{ fontSize:12, color:G.accent, textDecoration:"none", fontWeight:500 }}>{label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FORMULARIO DE CAPTURA ────────────────────────────────────────────────────
function Capture({ onNext }) {
  const [nombre,  setNombre]  = useState("");
  const [empresa, setEmpresa] = useState("");
  const [rubro,   setRubro]   = useState("");
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width:"100%", padding:"14px 16px",
    background:G.bg, border:`1px solid ${G.border}`,
    borderRadius:12, color:G.text, fontSize:15,
    fontFamily:"'DM Sans',sans-serif", outline:"none",
    marginBottom:12,
  };

  async function handleSubmit() {
    if (!nombre.trim())  { setError("Ingresá tu nombre."); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Ingresá un email válido."); return; }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    onNext({ nombre, empresa, rubro, email });
  }

  return (
    <div style={{ paddingTop:"2.5rem" }}>
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.6rem", color:"#fff", marginBottom:6 }}>
        Antes de empezar
      </div>
      <div style={{ fontSize:14, color:G.textSoft, marginBottom:"1.75rem", lineHeight:1.6 }}>
        Completá tus datos para recibir el informe por email al finalizar.
      </div>

      <label style={{ fontSize:12, color:G.textSoft, fontWeight:500, display:"block", marginBottom:6 }}>Nombre *</label>
      <input style={inputStyle} type="text" placeholder="Tu nombre" value={nombre} onChange={e=>{ setNombre(e.target.value); setError(""); }}/>

      <label style={{ fontSize:12, color:G.textSoft, fontWeight:500, display:"block", marginBottom:6 }}>Email *</label>
      <input style={{ ...inputStyle, borderColor: error && !email ? G.red : G.border }} type="email" placeholder="tu@email.com" value={email} onChange={e=>{ setEmail(e.target.value); setError(""); }}/>

      <label style={{ fontSize:12, color:G.textSoft, fontWeight:500, display:"block", marginBottom:6 }}>Empresa (opcional)</label>
      <input style={inputStyle} type="text" placeholder="Nombre de tu empresa" value={empresa} onChange={e=>setEmpresa(e.target.value)}/>

      <label style={{ fontSize:12, color:G.textSoft, fontWeight:500, display:"block", marginBottom:6 }}>Rubro (opcional)</label>
      <input style={inputStyle} type="text" placeholder="Ej: Distribución, Ferretería, Alimentos..." value={rubro} onChange={e=>setRubro(e.target.value)}/>

      {error && <div style={{ fontSize:13, color:G.red, marginBottom:12, background:"rgba(232,64,64,.08)", border:`1px solid rgba(232,64,64,.2)`, borderRadius:8, padding:"8px 12px" }}>{error}</div>}

      <button
        style={{
          display:"block", width:"100%", padding:"17px 0",
          background: loading ? G.border : G.accent,
          border:"none", borderRadius:14, color: loading ? G.muted : "#fff",
          fontSize:15, fontWeight:700, fontFamily:"'DM Sans',sans-serif",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : `0 6px 24px ${G.accentGlow}`,
          marginTop:4
        }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Guardando..." : "Comenzar diagnóstico →"}
      </button>

      <div style={{ fontSize:11, color:G.muted, textAlign:"center", marginTop:10 }}>
        🔒 Tus datos son confidenciales y no se comparten con terceros.
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
  const pct = Math.round((current / 15) * 100);

  function selectOpt(i){ const next=[...answers]; next[current]=i; setAnswers(next); }
  function goNext(){
    if (answers[current]===null) return;
    if (current===14){ onFinish(answers); return; }
    setAnimKey(k=>k+1); setCurrent(c=>c+1);
  }
  function goBack(){ if(current>0){ setAnimKey(k=>k+1); setCurrent(c=>c-1); } }

  return (
    <div style={{ paddingTop:"1.75rem" }}>
      {/* Progress */}
      <div style={{ marginBottom:"1.75rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:12, color:G.accent, fontWeight:600 }}>{AREA_ICONS[q.area]} {q.area}</span>
          <span style={{ fontSize:12, color:G.muted }}>{current+1} / 15</span>
        </div>
        <div style={{ height:4, background:G.border, borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", background:`linear-gradient(90deg,${G.accent},#6366f1)`, borderRadius:2, width:`${pct}%`, transition:"width .5s ease" }}/>
        </div>
      </div>

      <div key={animKey} style={{ animation:"fadeUp .3s ease forwards" }}>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(1.1rem,4.5vw,1.35rem)", lineHeight:1.45, marginBottom:"1.75rem", color:"#fff" }}>
          {q.q}
        </div>

        <div>
          {q.opts.map((o,i)=>{
            const sel = answers[current]===i;
            return (
              <button key={i}
                style={{
                  display:"flex", alignItems:"flex-start", gap:14, width:"100%",
                  padding:"16px", marginBottom:12,
                  background:sel ? G.accentLight : G.surface,
                  border:`2px solid ${sel ? G.accent : G.border}`,
                  borderRadius:14, color:sel ? "#fff" : G.text,
                  fontSize:14, fontFamily:"'DM Sans',sans-serif",
                  cursor:"pointer", textAlign:"left", transition:"all .15s",
                  lineHeight:1.45
                }}
                onClick={()=>selectOpt(i)}
              >
                <span style={{
                  minWidth:30, height:30, borderRadius:8, flexShrink:0,
                  background: sel ? G.accent : G.border,
                  color: sel ? "#fff" : G.muted,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, marginTop:1
                }}>
                  {["A","B","C"][i]}
                </span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginTop:8 }}>
        <button
          style={{ padding:"13px 20px", background:"transparent", border:`1px solid ${G.border}`, borderRadius:10, color:G.muted, fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", visibility:current===0?"hidden":"visible" }}
          onClick={goBack}>← Anterior</button>
        <button
          style={{ padding:"14px 28px", background:answers[current]===null ? G.border : G.accent, border:"none", borderRadius:10, color:answers[current]===null ? G.muted : "#fff", fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:answers[current]===null ? "not-allowed" : "pointer" }}
          onClick={goNext} disabled={answers[current]===null}>
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
    saveDiagnosticToBackend({
      email:   clientData?.email || "",
      nombre:  clientData?.nombre || "",
      empresa: clientData?.empresa || "",
      rubro:   clientData?.rubro || "",
      answers, scores, general
    }).then(ok => setSaved(ok));
    sendEmailToClient({
      email:   clientData?.email || "",
      nombre:  clientData?.nombre || "",
      empresa: clientData?.empresa || "",
      scores, general
    });
  }, []);

  return (
    <div style={{ paddingTop:"2rem" }}>
      {/* Score hero */}
      <div style={{ textAlign:"center", marginBottom:"2rem" }}>
        <div style={{
          width:130, height:130, borderRadius:"50%",
          border:`3px solid ${color}`, boxShadow:`0 0 40px ${color}44`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          margin:"0 auto 1rem"
        }}>
          <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"2.8rem", color:"#fff", lineHeight:1 }}>{general}</div>
          <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>/ 100</div>
        </div>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.5rem", color:"#fff", marginBottom:6 }}>{semLabel(general)}</div>
        <div style={{ fontSize:14, color:G.textSoft, lineHeight:1.6, maxWidth:380, margin:"0 auto" }}>
          {clientData?.nombre && <span>Hola <strong style={{ color:"#fff" }}>{clientData.nombre}</strong>, tu</span>}
          {!clientData?.nombre && <span>Tu</span>} operación obtuvo un score de <strong style={{ color:"#fff" }}>{general}/100</strong>.
        </div>
        {saved && <div style={{ fontSize:12, color:G.green, marginTop:10 }}>✓ Informe enviado a {clientData?.email}</div>}
      </div>

      {/* Semáforo */}
      <div style={{ fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:G.muted, marginBottom:10 }}>Semáforo por área</div>
      {AREAS.map(a=>{
        const s=scores[a]; const c=semColor(s.pct);
        return (
          <div key={a} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:"1rem 1.1rem", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block", boxShadow:`0 0 8px ${c}` }}/>
                {AREA_ICONS[a]} {a}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:13, fontWeight:700, color:c }}>{s.pct}/100</span>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:600, background:c+"22", color:c }}>{semLabel(s.pct)}</span>
              </div>
            </div>
            <BarAnimate pct={s.pct} color={c}/>
          </div>
        );
      })}

      {/* Problemas */}
      {top5.length>0 && <>
        <div style={{ fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:G.muted, margin:"1.5rem 0 .75rem" }}>Principales problemas detectados</div>
        {top5.map((p,i)=>(
          <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:"1rem 1.1rem", marginBottom:10, display:"flex", gap:12 }}>
            <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"1.4rem", color:G.muted, minWidth:22, lineHeight:1.1 }}>{i+1}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{p.short}</div>
              <div style={{ fontSize:12, color:G.muted }}>{p.area} · {p.severity===2?"⚠ Prioridad alta":"Prioridad media"}</div>
            </div>
          </div>
        ))}
      </>}

      {/* Plan */}
      <div style={{ fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:G.muted, margin:"1.5rem 0 .75rem" }}>Plan de acción recomendado</div>
      {top5.length===0 ? (
        <div style={{ borderLeft:`3px solid ${G.green}`, background:G.surface2, borderRadius:"0 14px 14px 0", padding:"1rem 1.1rem" }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>Tu operación está en buen nivel.</div>
          <div style={{ fontSize:11, color:G.muted }}>Enfocate en mantener indicadores y explorar mejoras tecnológicas.</div>
        </div>
      ) : top5.map((p,i)=>{
        const accion = ACTIONS[p.q]||"Revisá esta área con tu equipo.";
        return (
          <div key={i} style={{ borderLeft:`3px solid ${G.accent}`, background:G.surface2, borderRadius:"0 14px 14px 0", padding:"1rem 1.1rem", marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{i+1}. {accion}</div>
            <div style={{ fontSize:11, color:G.muted }}>{p.area} · {p.severity===2?"Acción urgente":"Próximo trimestre"}</div>
          </div>
        );
      })}

      {/* CTA Luján */}
      <div style={{ background:`linear-gradient(135deg,${G.accent}22,${G.surface2})`, border:`1px solid ${G.accent}44`, borderRadius:16, padding:"1.25rem", margin:"1.75rem 0", textAlign:"center" }}>
        <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:4 }}>¿Querés profundizar en los resultados?</div>
        <div style={{ fontSize:13, color:G.textSoft, marginBottom:14 }}>Hablemos sobre cómo mejorar tu operación logística.</div>
        <a href="https://wa.me/542804206573" target="_blank" rel="noreferrer"
          style={{ display:"inline-block", padding:"13px 28px", background:G.green, borderRadius:12, color:"#071a10", fontSize:14, fontWeight:700, textDecoration:"none" }}>
          💬 Contactar por WhatsApp
        </a>
      </div>

      <button
        style={{ display:"block", width:"100%", padding:"15px 0", background:G.accent, border:"none", borderRadius:14, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", marginBottom:10 }}
        onClick={()=>generatePDF(scores,answers,general,clientData)}>
        ↓ Descargar informe PDF
      </button>
      <button
        style={{ display:"block", width:"100%", padding:"13px 0", background:"transparent", border:`1px solid ${G.border}`, borderRadius:14, color:G.muted, fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}
        onClick={onRestart}>
        Realizar nuevo diagnóstico
      </button>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]         = useState("landing");
  const [finalAnswers, setFinalAns] = useState(null);
  const [clientData,   setClientData] = useState(null);

  useEffect(()=>{
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  },[]);

  return (
    <div style={{ background:G.bg, minHeight:"100vh" }}>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:250,
        background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(37,99,235,.14),transparent)",
        pointerEvents:"none", zIndex:0 }}/>
      <div style={{
        maxWidth:480, margin:"0 auto",
        padding:"0 1.1rem 5rem",
        fontFamily:"'DM Sans',sans-serif",
        color:G.text, minHeight:"100vh",
        position:"relative", zIndex:1
      }}>
        {screen==="landing"  && <Landing  onStart={()=>setScreen("capture")}/>}
        {screen==="capture"  && <Capture  onNext={(data)=>{ setClientData(data); setScreen("quiz"); }}/>}
        {screen==="quiz"     && <Quiz     onFinish={ans=>{ setFinalAns(ans); setScreen("results"); }}/>}
        {screen==="results"  && <Results  answers={finalAnswers} clientData={clientData} onRestart={()=>{ setFinalAns(null); setClientData(null); setScreen("landing"); }}/>}
      </div>
    </div>
  );
}
