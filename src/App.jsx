import React, { useState, useEffect, useMemo } from "react";
import { db, auth, storage, leerTicketIA } from "./firebase";
import { ref, uploadBytes } from "firebase/storage";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  CheckSquare,
  Plus,
  X,
  LogOut,
  TrendingUp,
  TrendingDown,
  Circle,
  CheckCircle2,
  Clock,
  GraduationCap,
  Wrench,
  ShoppingCart,
  Home,
  Camera,
  Settings,
  Calendar,
  FileText,
  Upload,
  Check,
  Download,
  Settings2,
  AlertOctagon,
  Trash2,
  ClipboardCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const LOGO_GOLFB_PLATA = "data:image/png;base64,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";

/* ---------- Tema "Golf B Premium" · acento bronce/dorado para Finanzas ---------- */
const theme = {
  bg: "#F8FAF9",
  surface: "#FFFFFF",
  ink: "#16241C",
  inkSoft: "#5C6C62",
  border: "#E6ECE8",
  pine: "#1F4F37",
  accent: "#C6A253",
  accentSoft: "#F4ECDA",
  success: "#2F7D4F",
  danger: "#B3462C",
  warn: "#C69A3C",
};

const fmtEUR = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    Number(n || 0)
  );

const fmtDate = (isoOrTimestamp) => {
  if (!isoOrTimestamp) return "—";
  const d =
    typeof isoOrTimestamp?.toDate === "function"
      ? isoOrTimestamp.toDate()
      : new Date(isoOrTimestamp);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

const monthKey = (isoOrTimestamp) => {
  const d =
    typeof isoOrTimestamp?.toDate === "function"
      ? isoOrTimestamp.toDate()
      : new Date(isoOrTimestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// Convierte fecha/Timestamp/ISO a objeto Date, sea cual sea el formato
// con el que venga guardado (transacciones usan ISO string, Proshop
// usa Timestamp de Firestore).
const aFecha = (v) => (typeof v?.toDate === "function" ? v.toDate() : new Date(v));

// Partidas por defecto — el club puede añadir, renombrar o quitar las
// suyas desde "Configurar categorías" en el propio dashboard.
const CATEGORIAS_DEFECTO = {
  ingresos: ["Clases", "Cuotas de socios", "Greenfees", "Alquileres", "Proshop", "Subvenciones", "Otros ingresos"],
  gastos: ["Salarios", "Electricidad", "Gasoil / Combustible", "Agua", "Mantenimiento campo", "Suministros", "Seguros", "Otros gastos"],
  // Subcategorías por nombre de categoría — opcional, se gestiona desde
  // "Configurar categorías". Ej: { "Ventas Campo": ["Alquileres","GFs socios"] }
  subcategorias: {},
};

// Presets de rango de fechas para el dashboard.
const RANGOS_PRESET = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
  { id: "trimestre", label: "Trimestre" },
  { id: "semestre", label: "Semestre" },
  { id: "anio", label: "Año" },
  { id: "personalizado", label: "Personalizado" },
];

function calcularRango(preset, desdeManual, hastaManual) {
  const hoy = new Date();
  const finDia = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
  const inicioDia = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  switch (preset) {
    case "hoy":
      return { desde: inicioDia(hoy), hasta: finDia(hoy) };
    case "semana": {
      const diaSemana = (hoy.getDay() + 6) % 7; // lunes = 0
      const inicio = new Date(hoy); inicio.setDate(hoy.getDate() - diaSemana);
      return { desde: inicioDia(inicio), hasta: finDia(hoy) };
    }
    case "trimestre": {
      const inicio = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1);
      return { desde: inicioDia(inicio), hasta: finDia(hoy) };
    }
    case "semestre": {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() < 6 ? 0 : 6, 1);
      return { desde: inicioDia(inicio), hasta: finDia(hoy) };
    }
    case "anio":
      return { desde: inicioDia(new Date(hoy.getFullYear(), 0, 1)), hasta: finDia(hoy) };
    case "personalizado":
      return {
        desde: desdeManual ? inicioDia(new Date(desdeManual)) : inicioDia(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
        hasta: hastaManual ? finDia(new Date(hastaManual)) : finDia(hoy),
      };
    case "mes":
    default:
      return { desde: inicioDia(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: finDia(hoy) };
  }
}

// Divide el rango elegido en "cubos" (días, semanas o meses según la
// duración) para dibujar el comparativo — así "Mes" se ve día a día,
// "Trimestre" semana a semana y "Año" mes a mes, automáticamente.
function generarBuckets(desde, hasta) {
  const spanDias = Math.max(1, Math.round((hasta - desde) / 86400000));
  const buckets = [];
  if (spanDias <= 40) {
    const cursor = new Date(desde);
    while (cursor <= hasta) {
      const inicio = new Date(cursor); inicio.setHours(0, 0, 0, 0);
      const fin = new Date(cursor); fin.setHours(23, 59, 59, 999);
      buckets.push({ label: inicio.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }), inicio, fin });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (spanDias <= 120) {
    const cursor = new Date(desde);
    while (cursor <= hasta) {
      const inicio = new Date(cursor); inicio.setHours(0, 0, 0, 0);
      let fin = new Date(cursor); fin.setDate(fin.getDate() + 6); fin.setHours(23, 59, 59, 999);
      if (fin > hasta) fin = new Date(hasta);
      buckets.push({ label: `${inicio.getDate()}/${inicio.getMonth() + 1}`, inicio, fin });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    const cursor = new Date(desde.getFullYear(), desde.getMonth(), 1);
    const mismoAnio = desde.getFullYear() === hasta.getFullYear();
    while (cursor <= hasta) {
      const inicio = new Date(cursor);
      const fin = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = new Intl.DateTimeFormat("es-ES", { month: "short", ...(mismoAnio ? {} : { year: "2-digit" }) }).format(inicio);
      buckets.push({ label, inicio, fin });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }
  return buckets;
}

function sumaEnRango(items, inicio, fin, campoFecha, campoImporte, filtro) {
  return items
    .filter((it) => (!filtro || filtro(it)))
    .filter((it) => { const f = aFecha(it[campoFecha]); return f >= inicio && f <= fin; })
    .reduce((s, it) => s + Number(it[campoImporte] || 0), 0);
}

/* ---------------------------- Componentes UI ---------------------------- */

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const barColor =
    pct >= 100 ? theme.danger : pct >= 80 ? theme.warn : color || theme.success;
  return (
    <div style={{ background: "#EDEAE2", borderRadius: 999, height: 8 }}>
      <div
        style={{
          width: `${pct}%`,
          background: barColor,
          height: "100%",
          borderRadius: 999,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#EFEDE6", fg: theme.inkSoft },
    income: { bg: "#E4F1E8", fg: theme.success },
    expense: { bg: "#F5E4DE", fg: theme.danger },
    urgent: { bg: "#F5E4DE", fg: theme.danger },
    high: { bg: "#FBEEDB", fg: theme.warn },
    medium: { bg: theme.accentSoft, fg: theme.accent },
    low: { bg: "#EFEDE6", fg: theme.inkSoft },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className="rounded-md"
      style={{
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 600,
        padding: "2px 8px",
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: theme.surface,
        padding: 20,
        boxShadow: "0 1px 3px rgba(20,38,28,0.06)",
        border: `1px solid ${theme.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------- Sidebar -------------------------------- */

const GOLFB_APPS = [
  { id: "academia", nombre: "Academia", color: "#B03A2E", url: "https://academia.golfb.es/", Icon: GraduationCap },
  { id: "mantenimiento", nombre: "Mantenimiento", color: "#1A5C2A", url: "https://mantenimiento.golfb.es/", Icon: Wrench },
  { id: "recepcion", nombre: "Recepción", color: "#7C2A35", url: "https://recepciongcr.golfb.es/", Icon: ClipboardCheck },
  { id: "proshop", nombre: "Proshop", color: "#2E6DA4", url: "https://proshop.golfb.es/", Icon: ShoppingCart },
  { id: "finanzas", nombre: "Finanzas", color: "#8E969E", url: "https://finanzas.golfb.es/", Icon: Wallet },
  { id: "master", nombre: "Golf B Máster", color: "#C9A227", url: "https://golfb.es/", Icon: Home },
];

function Sidebar({ active, setActive, onLogout, userEmail }) {
  const items = [
    { id: "resumen", label: "Resumen", icon: LayoutDashboard },
    { id: "transacciones", label: "Transacciones", icon: Receipt },
    { id: "informes", label: "Informes", icon: FileText },
    { id: "presupuestos", label: "Presupuestos", icon: Wallet },
    { id: "metas", label: "Metas", icon: Target },
    { id: "tareas", label: "Tareas", icon: CheckSquare },
    { id: "ajustes", label: "Ajustes", icon: Settings2 },
  ];

  return (
    <aside
      style={{
        width: 240,
        background: theme.surface,
        borderRight: `1px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        gap: 4,
        minHeight: "100vh",
      }}
    >
      <div style={{ padding: "0 8px 20px" }}>
        <img src={LOGO_GOLFB_PLATA} alt="Golf B" style={{ height: 52, objectFit: "contain" }} />
        <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.16em" }}>
          Finanzas
        </div>
        <div style={{ marginTop: 14, height: 1, background: `linear-gradient(90deg, ${theme.accent}55, transparent)` }} />
      </div>

      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => setActive(id)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px 10px 16px",
              borderRadius: 10,
              border: "none",
              background: isActive ? theme.accentSoft : "transparent",
              color: isActive ? "#8A6A2E" : theme.inkSoft,
              fontWeight: isActive ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {isActive && (
              <span style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: 999, background: theme.accent }} />
            )}
            <Icon size={18} />
            {label}
          </button>
        );
      })}

      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        <div style={{ padding: "0 8px 14px" }}>
          <div style={{ fontSize: 10, color: theme.inkSoft, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, opacity: 0.6 }}>
            Cambiar de app
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {GOLFB_APPS.map((app) => {
              const esActual = app.id === "finanzas";
              return (
                <a
                  key={app.id}
                  href={esActual ? undefined : app.url}
                  target={esActual ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  title={app.nombre}
                  onClick={(e) => { if (esActual) e.preventDefault(); }}
                  style={{
                    width: 30, height: 30, borderRadius: 999, background: app.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, textDecoration: "none",
                    opacity: esActual ? 1 : 0.6,
                    boxShadow: esActual ? `0 0 0 2px ${theme.surface}, 0 0 0 4px ${app.color}88` : "none",
                    cursor: esActual ? "default" : "pointer",
                  }}
                >
                  <app.Icon size={14} color="white" strokeWidth={2} />
                </a>
              );
            })}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.inkSoft,
            padding: "0 8px 8px",
            wordBreak: "break-all",
          }}
        >
          {userEmail}
        </div>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: theme.inkSoft,
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

/* ------------------------------- Resumen -------------------------------- */

/* ------------------------------ Selector de rango ------------------------------ */

function SelectorRango({ preset, setPreset, desdeManual, setDesdeManual, hastaManual, setHastaManual }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      {RANGOS_PRESET.map((r) => (
        <button
          key={r.id}
          onClick={() => setPreset(r.id)}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            border: `1px solid ${preset === r.id ? theme.accent : theme.border}`,
            background: preset === r.id ? theme.accent : theme.surface,
            color: preset === r.id ? "#fff" : theme.inkSoft,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "all .15s",
          }}
        >
          {r.label}
        </button>
      ))}
      {preset === "personalizado" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
          <Calendar size={15} color={theme.inkSoft} />
          <input type="date" value={desdeManual} onChange={(e) => setDesdeManual(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13 }} />
          <span style={{ color: theme.inkSoft, fontSize: 13 }}>→</span>
          <input type="date" value={hastaManual} onChange={(e) => setHastaManual(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13 }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Desglose por categoría ------------------------------ */

function DesgloseCategorias({ titulo, datos, color, icon: Icon }) {
  const max = Math.max(1, ...datos.map((d) => d.total));
  const total = datos.reduce((s, d) => s + d.total, 0);
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: theme.ink }}>
          <Icon size={17} color={color} />
          {titulo}
        </div>
        <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: 18, color }}>
          {fmtEUR(total)}
        </div>
      </div>
      {datos.length === 0 && (
        <div style={{ fontSize: 13, color: theme.inkSoft, padding: "8px 0" }}>Sin movimientos en este periodo.</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {datos.map((d) => (
          <div key={d.category}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
                {d.category}
                {d.automatico && (
                  <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "22", borderRadius: 999, padding: "1px 7px" }}>
                    ● en vivo
                  </span>
                )}
              </span>
              <span style={{ color: theme.inkSoft, fontWeight: 600 }}>{fmtEUR(d.total)}</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: theme.border, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(d.total / max) * 100}%`, background: color, borderRadius: 999, transition: "width .3s" }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------ Configurar categorías ------------------------------ */

function ModalCategorias({ categorias, onClose, onGuardar }) {
  const [ingresos, setIngresos] = useState(categorias.ingresos);
  const [gastos, setGastos] = useState(categorias.gastos);
  const [subcategorias, setSubcategorias] = useState(categorias.subcategorias || {});
  const [nuevoIngreso, setNuevoIngreso] = useState("");
  const [nuevoGasto, setNuevoGasto] = useState("");
  const [catExpandida, setCatExpandida] = useState(null);
  const [nuevaSub, setNuevaSub] = useState("");

  const Chip = ({ label, onQuitar }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: theme.bg,
      border: `1px solid ${theme.border}`, borderRadius: 999, padding: "5px 6px 5px 12px", fontSize: 13,
    }}>
      {label}
      <button onClick={onQuitar} style={{ border: "none", background: "none", cursor: "pointer", color: theme.inkSoft, display: "flex" }}>
        <X size={13} />
      </button>
    </span>
  );

  function agregarSub(cat) {
    if (!nuevaSub.trim()) return;
    const actuales = subcategorias[cat] || [];
    if (actuales.includes(nuevaSub.trim())) { setNuevaSub(""); return; }
    setSubcategorias({ ...subcategorias, [cat]: [...actuales, nuevaSub.trim()] });
    setNuevaSub("");
  }
  function quitarSub(cat, sub) {
    setSubcategorias({ ...subcategorias, [cat]: (subcategorias[cat] || []).filter((s) => s !== sub) });
  }
  function quitarCategoria(cat, lista, setLista) {
    setLista(lista.filter((x) => x !== cat));
    const { [cat]: _omit, ...resto } = subcategorias;
    setSubcategorias(resto);
    if (catExpandida === cat) setCatExpandida(null);
  }

  const BloqueCategorias = ({ titulo, color, lista, setLista, nuevo, setNuevo, placeholder }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 8 }}>{titulo}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {lista.map((c) => (
          <div key={c} style={{ border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => setCatExpandida(catExpandida === c ? null : c)}
                style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: theme.ink, padding: 0 }}
              >
                {catExpandida === c ? "▾" : "▸"} {c}
                {(subcategorias[c] || []).length > 0 && (
                  <span style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 400 }}>({subcategorias[c].length} subcat.)</span>
                )}
              </button>
              <button onClick={() => quitarCategoria(c, lista, setLista)} style={{ border: "none", background: "none", cursor: "pointer", color: theme.inkSoft, display: "flex" }}>
                <X size={13} />
              </button>
            </div>
            {catExpandida === c && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {(subcategorias[c] || []).map((s) => <Chip key={s} label={s} onQuitar={() => quitarSub(c, s)} />)}
                  {(subcategorias[c] || []).length === 0 && (
                    <span style={{ fontSize: 12, color: theme.inkSoft }}>Sin subcategorías todavía.</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={nuevaSub} onChange={(e) => setNuevaSub(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarSub(c); } }}
                    placeholder="Nueva subcategoría…"
                    style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: `1px solid ${theme.border}`, fontSize: 12.5 }} />
                  <button onClick={() => agregarSub(c)}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: color, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13 }} />
        <button onClick={() => { if (nuevo.trim()) { setLista([...lista, nuevo.trim()]); setNuevo(""); } }}
          style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: color, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,43,34,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div style={{ background: theme.surface, borderRadius: 16, padding: 26, width: 520, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: theme.ink }}>Configurar categorías</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div style={{ fontSize: 12.5, color: theme.inkSoft, marginBottom: 18 }}>
          Toca una categoría para desplegarla y añadirle subcategorías.
        </div>

        <BloqueCategorias titulo="Categorías de ingreso" color={theme.success} lista={ingresos} setLista={setIngresos}
          nuevo={nuevoIngreso} setNuevo={setNuevoIngreso} placeholder="Nueva categoría de ingreso…" />

        <BloqueCategorias titulo="Partidas de gasto" color={theme.danger} lista={gastos} setLista={setGastos}
          nuevo={nuevoGasto} setNuevo={setNuevoGasto} placeholder="Nueva partida de gasto…" />

        <button
          onClick={() => { onGuardar({ ingresos, gastos, subcategorias }); onClose(); }}
          style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: theme.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}
        >
          Guardar categorías
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------- Resumen (dashboard) ------------------------------------- */

function ResumenView({ transacciones, presupuestos, metas, ventasProshop, categorias, onGuardarCategorias }) {
  const now = new Date();
  const [preset, setPreset] = useState("mes");
  const [desdeManual, setDesdeManual] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [hastaManual, setHastaManual] = useState(now.toISOString().slice(0, 10));
  const [modalCategorias, setModalCategorias] = useState(false);
  const [compararAnio, setCompararAnio] = useState(false);
  const [compararPresupuesto, setCompararPresupuesto] = useState(false);

  const { desde, hasta } = useMemo(() => calcularRango(preset, desdeManual, hastaManual), [preset, desdeManual, hastaManual]);

  const enRango = (t) => { const f = aFecha(t.date); return f >= desde && f <= hasta; };
  const delRango = transacciones.filter(enRango);

  const ingresosManual = delRango.filter((t) => t.type === "income");
  const gastosManual = delRango.filter((t) => t.type === "expense");

  const ventasProshopRango = ventasProshop.filter((v) => { const f = aFecha(v.creadoEn); return f >= desde && f <= hasta; });
  const totalProshopAuto = ventasProshopRango.reduce((s, v) => s + Number(v.total || 0), 0);

  const totalIngresos = ingresosManual.reduce((s, t) => s + Number(t.amount), 0) + totalProshopAuto;
  const totalGastos = gastosManual.reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIngresos - totalGastos;

  const agruparPorCategoria = (items) => {
    const mapa = {};
    items.forEach((t) => { const c = t.category || "Sin categoría"; mapa[c] = (mapa[c] || 0) + Number(t.amount || 0); });
    return Object.entries(mapa).map(([category, total]) => ({ category, total }));
  };

  const desgloseIngresos = useMemo(() => {
    const base = agruparPorCategoria(ingresosManual).filter((d) => d.category !== "Proshop");
    if (totalProshopAuto > 0 || ventasProshopRango.length > 0) {
      base.push({ category: "Proshop", total: totalProshopAuto, automatico: true });
    }
    return base.sort((a, b) => b.total - a.total);
  }, [ingresosManual, totalProshopAuto]);

  const desgloseGastos = useMemo(() => agruparPorCategoria(gastosManual).sort((a, b) => b.total - a.total), [gastosManual]);

  const totalPresupuestoMensual = useMemo(
    () => presupuestos.reduce((s, p) => s + Number(p.monthly_limit || 0), 0),
    [presupuestos]
  );

  const comparativo = useMemo(() => {
    const buckets = generarBuckets(desde, hasta);
    return buckets.map((b) => {
      const diasBucket = Math.max(1, Math.round((b.fin - b.inicio) / 86400000) + 1);

      const ingB = sumaEnRango(transacciones, b.inicio, b.fin, "date", "amount", (t) => t.type === "income")
        + sumaEnRango(ventasProshop, b.inicio, b.fin, "creadoEn", "total");
      const gasB = sumaEnRango(transacciones, b.inicio, b.fin, "date", "amount", (t) => t.type === "expense");

      const inicioAnt = new Date(b.inicio); inicioAnt.setFullYear(inicioAnt.getFullYear() - 1);
      const finAnt = new Date(b.fin); finAnt.setFullYear(finAnt.getFullYear() - 1);
      const ingAnt = sumaEnRango(transacciones, inicioAnt, finAnt, "date", "amount", (t) => t.type === "income")
        + sumaEnRango(ventasProshop, inicioAnt, finAnt, "creadoEn", "total");
      const gasAnt = sumaEnRango(transacciones, inicioAnt, finAnt, "date", "amount", (t) => t.type === "expense");

      const presupuestoB = totalPresupuestoMensual * (diasBucket / 30.44);

      return {
        periodo: b.label,
        Ingresos: ingB,
        Gastos: gasB,
        "Ingresos (año ant.)": ingAnt,
        "Gastos (año ant.)": gasAnt,
        "Presupuesto gastos": presupuestoB,
      };
    });
  }, [desde, hasta, transacciones, ventasProshop, totalPresupuestoMensual]);

  const currentMonth = monthKey(now.toISOString());
  const delMes = transacciones.filter((t) => monthKey(t.date) === currentMonth);
  const presupuestosAlerta = presupuestos
    .map((p) => {
      const gastado = delMes.filter((t) => t.type === "expense" && t.category === p.category).reduce((s, t) => s + Number(t.amount), 0);
      return { ...p, gastado, pct: (gastado / Number(p.monthly_limit)) * 100 };
    })
    .filter((p) => p.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  const metasProximas = [...metas]
    .filter((m) => m.deadline)
    .sort((a, b) => new Date(a.deadline?.toDate?.() || a.deadline) - new Date(b.deadline?.toDate?.() || b.deadline))
    .slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <SelectorRango preset={preset} setPreset={setPreset} desdeManual={desdeManual} setDesdeManual={setDesdeManual} hastaManual={hastaManual} setHastaManual={setHastaManual} />
        <button
          onClick={() => setModalCategorias(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.inkSoft, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          <Settings size={15} /> Configurar categorías
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: 3, background: theme.success }} />
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.success }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Ingresos</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10, color: theme.ink, fontFamily: "Playfair Display, serif" }}>
              {fmtEUR(totalIngresos)}
            </div>
          </div>
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: 3, background: theme.danger }} />
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.danger }}>
              <TrendingDown size={18} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Gastos</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10, color: theme.ink, fontFamily: "Playfair Display, serif" }}>
              {fmtEUR(totalGastos)}
            </div>
          </div>
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: 3, background: theme.accent }} />
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.accent }}>
              <Wallet size={18} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Balance</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10, color: balance >= 0 ? theme.ink : theme.danger, fontFamily: "Playfair Display, serif" }}>
              {fmtEUR(balance)}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DesgloseCategorias titulo="Ingresos por categoría" datos={desgloseIngresos} color={theme.success} icon={TrendingUp} />
        <DesgloseCategorias titulo="Gastos por partida" datos={desgloseGastos} color={theme.danger} icon={TrendingDown} />
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: theme.ink }}>
            Ingresos vs. Gastos <span style={{ fontWeight: 400, color: theme.inkSoft, fontSize: 12.5 }}>· periodo seleccionado</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCompararAnio(!compararAnio)}
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${compararAnio ? theme.accent : theme.border}`,
                background: compararAnio ? theme.accentSoft : "transparent",
                color: compararAnio ? "#8A6A2E" : theme.inkSoft,
              }}
            >
              vs. año anterior
            </button>
            <button
              onClick={() => setCompararPresupuesto(!compararPresupuesto)}
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${compararPresupuesto ? theme.accent : theme.border}`,
                background: compararPresupuesto ? theme.accentSoft : "transparent",
                color: compararPresupuesto ? "#8A6A2E" : theme.inkSoft,
              }}
            >
              vs. presupuesto
            </button>
          </div>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={comparativo}>
              <CartesianGrid stroke={theme.border} vertical={false} />
              <XAxis dataKey="periodo" stroke={theme.inkSoft} fontSize={11} />
              <YAxis stroke={theme.inkSoft} fontSize={12} />
              <Tooltip formatter={(v) => fmtEUR(v)} />
              <Line type="monotone" dataKey="Ingresos" stroke={theme.success} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Gastos" stroke={theme.danger} strokeWidth={2.5} dot={false} />
              {compararAnio && (
                <>
                  <Line type="monotone" dataKey="Ingresos (año ant.)" stroke={theme.success} strokeWidth={1.5} strokeDasharray="5 4" dot={false} opacity={0.55} />
                  <Line type="monotone" dataKey="Gastos (año ant.)" stroke={theme.danger} strokeWidth={1.5} strokeDasharray="5 4" dot={false} opacity={0.55} />
                </>
              )}
              {compararPresupuesto && (
                <Line type="monotone" dataKey="Presupuesto gastos" stroke={theme.accent} strokeWidth={1.5} strokeDasharray="2 3" dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {totalPresupuestoMensual === 0 && compararPresupuesto && (
          <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 8 }}>
            Aún no tienes presupuestos configurados en "Presupuestos" — la línea de presupuesto estará en 0€ hasta que crees alguno.
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 12, color: theme.ink }}>
            Presupuestos a vigilar <span style={{ fontWeight: 400, color: theme.inkSoft, fontSize: 12 }}>(mes en curso)</span>
          </div>
          {presupuestosAlerta.length === 0 && (
            <div style={{ fontSize: 13, color: theme.inkSoft }}>
              Ninguna categoría por encima del 80% este mes.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {presupuestosAlerta.map((p) => (
              <div key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{p.category}</span>
                  <span style={{ color: theme.inkSoft }}>
                    {fmtEUR(p.gastado)} / {fmtEUR(p.monthly_limit)}
                  </span>
                </div>
                <ProgressBar value={p.gastado} max={Number(p.monthly_limit)} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, marginBottom: 12, color: theme.ink }}>
            Metas más próximas
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {metasProximas.map((m) => (
              <div key={m.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{m.title}</span>
                  <span style={{ color: theme.inkSoft }}>{fmtDate(m.deadline)}</span>
                </div>
                <ProgressBar value={Number(m.current_amount)} max={Number(m.target_amount)} color={theme.accent} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {modalCategorias && (
        <ModalCategorias categorias={categorias} onClose={() => setModalCategorias(false)} onGuardar={onGuardarCategorias} />
      )}
    </div>
  );
}

/* ---------------------------- Transacciones ------------------------------ */

/* ------------------------- Escanear ticket (OCR) -------------------------- */

// Interpreta el texto bruto reconocido en la foto del ticket y saca
// un importe, una fecha y una descripción razonables. No es perfecto:
// el usuario siempre revisa y corrige antes de guardar.
function extraerDatosTicket(texto) {
  const lineas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  const regexImporte = /(\d{1,4}[.,]\d{2})/g;

  // Importe: prioriza la línea que contiene "total"; si no, coge el
  // número más alto de todo el ticket (suele ser el total, no una unidad)
  let importe = null;
  const lineaTotal = lineas.find((l) => /total/i.test(l));
  if (lineaTotal) {
    const m = [...lineaTotal.matchAll(regexImporte)];
    if (m.length) importe = m[m.length - 1][1].replace(",", ".");
  }
  if (!importe) {
    const todos = [...texto.matchAll(regexImporte)].map((m) => parseFloat(m[1].replace(",", ".")));
    if (todos.length) importe = Math.max(...todos).toFixed(2);
  }

  // Fecha: formatos dd/mm/yyyy, dd-mm-yyyy, dd.mm.yy...
  let fecha = null;
  const mFecha = texto.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (mFecha) {
    let [, d, m, y] = mFecha;
    if (y.length === 2) y = "20" + y;
    const fechaProbable = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    if (!isNaN(fechaProbable) && fechaProbable <= new Date()) {
      fecha = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }

  // Descripción: primera línea con contenido real (evita líneas de solo números/símbolos)
  const descripcion = lineas.find((l) => l.length > 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(l)) || "";

  return {
    amount: importe || "",
    date: fecha || new Date().toISOString().slice(0, 10),
    description: descripcion.slice(0, 60),
  };
}

function EscanearTicketModal({ onClose, onDetectado }) {
  const [imagen, setImagen] = useState(null);
  const [nombrePdf, setNombrePdf] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const procesarImagen = async (file) => {
    setError("");
    setImagen(URL.createObjectURL(file));
    setProcesando(true);
    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data } = await leerTicketIA({ imageBase64, mediaType: file.type || "image/jpeg" });
try {
        const clubId = tenantId;
        const nombreArchivo = `${Date.now()}_${file.name || "ticket.jpg"}`;
        const storageRef = ref(storage, `clubes/${clubId}/finanzas/tickets/${auth.currentUser?.uid}/${nombreArchivo}`);
        await uploadBytes(storageRef, file);
      } catch (uploadErr) {
        console.warn("No se pudo guardar el archivo en Storage:", uploadErr);
      }
      const detectado = {
        amount: data?.importeTotal != null ? String(data.importeTotal) : "",
        date: data?.fecha || new Date().toISOString().slice(0, 10),
        description: (data?.descripcion || data?.proveedor || "").slice(0, 60),
      };
      onDetectado(detectado);
    } catch (e) {
      console.warn("Error leyendo imagen con IA:", e);
      setError("No se ha podido leer el ticket automáticamente. Rellena los datos a mano.");
      setProcesando(false);
    }
  };

  // Lee el texto "de verdad" incrustado en un PDF digital (facturas
  // generadas por ordenador). Si el PDF es un escaneo sin texto
  // (foto metida dentro de un PDF), esto no encuentra nada — en ese
  // caso lo mejor es hacerle una foto en vez de subir el PDF.
  const procesarPdf = async (file) => {
    setError("");
    setNombrePdf(file.name);
    setProcesando(true);
    try {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
try {
        const clubId = tenantId;
        const nombreArchivo = `${Date.now()}_${file.name || "factura.pdf"}`;
        const storageRef = ref(storage, `clubes/${clubId}/finanzas/tickets/${auth.currentUser?.uid}/${nombreArchivo}`);
        await uploadBytes(storageRef, file);
      } catch (uploadErr) {
        console.warn("No se pudo guardar el PDF en Storage:", uploadErr);
      }
     pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let texto = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const pagina = await pdf.getPage(i);
        const contenido = await pagina.getTextContent();
        texto += contenido.items.map((it) => it.str).join(" ") + "\n";
      }
      if (texto.trim().length < 15) {
        setError("Este PDF parece un escaneo (sin texto real dentro). Prueba a subir una foto o imagen de la factura en vez del PDF.");
        setProcesando(false);
        return;
      }
      const detectado = extraerDatosTicket(texto);
      onDetectado(detectado);
    } catch (e) {
      console.warn("Error leyendo PDF:", e);
      setError("No se ha podido leer el PDF automáticamente. Rellena los datos a mano.");
      setProcesando(false);
    }
  };

  const procesarArchivo = (file) => {
    if (!file) return;
    if (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf")) {
      procesarPdf(file);
    } else {
      procesarImagen(file);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(28,43,34,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60,
      }}
    >
      <div
        className="shadow-lg rounded-2xl"
        style={{ background: theme.surface, padding: 24, width: 380, maxWidth: "90vw" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: theme.ink }}>Escanear ticket o factura</div>
          <button type="button" onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {!imagen && !nombrePdf && (
          <label
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              border: `2px dashed ${theme.border}`, borderRadius: 12, padding: "36px 16px",
              cursor: "pointer", textAlign: "center",
            }}
          >
            <Camera size={30} color={theme.accent} />
            <span style={{ fontSize: 13, color: theme.inkSoft }}>
              Foto/imagen de un ticket, o PDF de una factura digital
            </span>
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => procesarArchivo(e.target.files?.[0])}
            />
          </label>
        )}

        {imagen && (
          <div style={{ textAlign: "center" }}>
            <img
              src={imagen} alt="Ticket"
              style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 8, marginBottom: 12, objectFit: "contain" }}
            />
            {procesando && (
              <div style={{ fontSize: 13, color: theme.inkSoft }}>Leyendo el ticket…</div>
            )}
          </div>
        )}

        {nombrePdf && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <FileText size={30} color={theme.accent} style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 13, color: theme.ink, fontWeight: 600, marginBottom: 4 }}>{nombrePdf}</div>
            {procesando && (
              <div style={{ fontSize: 13, color: theme.inkSoft }}>Leyendo la factura…</div>
            )}
          </div>
        )}

        {error && (
          <div style={{ fontSize: 13, color: theme.danger, marginTop: 10 }}>{error}</div>
        )}
      </div>
    </div>
  );
}


/* ------------------------- Importar Excel/CSV en bloque -------------------------- */

// Quita acentos y pasa a minúsculas, para reconocer cabeceras de
// columna aunque estén escritas de formas distintas (Fecha/fecha/Date…).
const normalizarClave = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function normalizarFilaExcel(filaOriginal, categoriasDisponibles) {
  const fila = {};
  Object.entries(filaOriginal).forEach(([k, v]) => { fila[normalizarClave(k)] = v; });

  const rawFecha = fila["fecha"] ?? fila["date"] ?? "";
  let fecha = new Date().toISOString().slice(0, 10);
  if (rawFecha instanceof Date && !isNaN(rawFecha)) {
    fecha = rawFecha.toISOString().slice(0, 10);
  } else if (rawFecha) {
    const s = String(rawFecha).trim();
    const mDMY = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (mDMY) {
      let [, d, m, y] = mDMY; if (y.length === 2) y = "20" + y;
      fecha = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    } else if (!isNaN(new Date(s))) {
      fecha = new Date(s).toISOString().slice(0, 10);
    }
  }

  const rawTipo = normalizarClave(fila["tipo"] ?? fila["type"] ?? "");
  let importeRaw = fila["importe"] ?? fila["amount"] ?? fila["cantidad"] ?? fila["total"] ?? "0";
  importeRaw = String(importeRaw).replace(/[€\s]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  let importe = parseFloat(importeRaw) || 0;

  let tipo = rawTipo.includes("ingres") || rawTipo.includes("income") ? "income"
    : rawTipo.includes("gasto") || rawTipo.includes("expense") ? "expense"
    : importe < 0 ? "expense" : "income";
  importe = Math.abs(importe);

  const categoria = String(fila["categoria"] ?? fila["category"] ?? fila["partida"] ?? "").trim()
    || (tipo === "income" ? categoriasDisponibles.ingresos[0] : categoriasDisponibles.gastos[0]);
  const subcategoria = String(fila["subcategoria"] ?? fila["subcategory"] ?? fila["subfamilia"] ?? "").trim();
  const descripcion = String(fila["descripcion"] ?? fila["concepto"] ?? fila["description"] ?? "").trim();

  return { incluir: true, date: fecha, type: tipo, category: categoria, subcategory: subcategoria, description: descripcion, amount: importe.toFixed(2) };
}

function descargarPlantilla() {
  const csv = "Fecha,Tipo,Categoría,Subcategoría,Descripción,Importe\n2026-01-15,Gasto,Electricidad,,Recibo luz enero,145.30\n2026-01-20,Ingreso,Greenfees,GFs no socios,Greenfees enero,890.00\n";
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "plantilla_transacciones_golfb.csv"; a.click();
  URL.revokeObjectURL(url);
}

function ImportarExcelModal({ onClose, onAdd, categorias }) {
  const [filas, setFilas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [hecho, setHecho] = useState(false);

  const cargarArchivo = async (file) => {
    if (!file) return;
    setError(""); setCargando(true); setFilas(null);
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const hoja = wb.Sheets[wb.SheetNames[0]];
      const filasCrudas = XLSX.utils.sheet_to_json(hoja, { defval: "" });
      if (filasCrudas.length === 0) {
        setError("No se han encontrado filas con datos en el archivo.");
      } else {
        setFilas(filasCrudas.map((f) => normalizarFilaExcel(f, categorias)));
      }
    } catch (e) {
      console.warn("Error leyendo Excel:", e);
      setError("No se ha podido leer el archivo. Comprueba que sea un .xlsx, .xls o .csv válido.");
    }
    setCargando(false);
  };

  const actualizarFila = (i, campo, valor) => {
    setFilas(filas.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  };

  const seleccionadas = (filas || []).filter((f) => f.incluir);

  const importar = async () => {
    setImportando(true); setProgreso(0);
    for (let i = 0; i < seleccionadas.length; i++) {
      const f = seleccionadas[i];
      await onAdd({
        type: f.type, category: f.category, subcategory: f.subcategory || "", description: f.description,
        amount: Number(f.amount).toFixed(2), date: new Date(f.date).toISOString(),
        activity: "", iva_type: "", base_amount: null, irpf_deductible: "no",
      });
      setProgreso(i + 1);
    }
    setImportando(false);
    setHecho(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,43,34,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div style={{ background: theme.surface, borderRadius: 16, padding: 24, width: 720, maxWidth: "94vw", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: theme.ink }}>Importar transacciones desde Excel/CSV</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={18} /></button>
        </div>

        {!filas && (
          <>
            <div style={{ fontSize: 13, color: theme.inkSoft, marginBottom: 14 }}>
              Sube un archivo con columnas <b>Fecha, Tipo (Ingreso/Gasto), Categoría, Subcategoría (opcional), Descripción, Importe</b> — el orden no importa, y reconoce nombres en español o inglés.{" "}
              <button onClick={descargarPlantilla} style={{ border: "none", background: "none", color: theme.accent, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Descargar plantilla de ejemplo
              </button>
            </div>
            <label
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                border: `2px dashed ${theme.border}`, borderRadius: 12, padding: "40px 16px",
                cursor: "pointer", textAlign: "center",
              }}
            >
              <Upload size={30} color={theme.accent} />
              <span style={{ fontSize: 13, color: theme.inkSoft }}>
                {cargando ? "Leyendo archivo…" : "Haz clic para elegir tu archivo .xlsx, .xls o .csv"}
              </span>
              <input type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
                onChange={(e) => cargarArchivo(e.target.files?.[0])} />
            </label>
            {error && <div style={{ fontSize: 13, color: theme.danger, marginTop: 10 }}>{error}</div>}
          </>
        )}

        {filas && !hecho && (
          <>
            <div style={{ fontSize: 13, color: theme.inkSoft, marginBottom: 10 }}>
              Revisa los datos detectados — desmarca las filas que no quieras importar, o corrige lo que haga falta. Se han encontrado <b>{filas.length}</b> filas.
            </div>
            <div style={{ flex: 1, overflow: "auto", border: `1px solid ${theme.border}`, borderRadius: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead style={{ position: "sticky", top: 0, background: theme.bg }}>
                  <tr>
                    {["", "Fecha", "Tipo", "Categoría", "Subcategoría", "Descripción", "Importe"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: theme.inkSoft, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${theme.border}`, opacity: f.incluir ? 1 : 0.4 }}>
                      <td style={{ padding: "6px 10px" }}>
                        <input type="checkbox" checked={f.incluir} onChange={(e) => actualizarFila(i, "incluir", e.target.checked)} />
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <input type="date" value={f.date} onChange={(e) => actualizarFila(i, "date", e.target.value)}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 12, width: 128 }} />
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <select value={f.type} onChange={(e) => actualizarFila(i, "type", e.target.value)}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 12 }}>
                          <option value="income">Ingreso</option>
                          <option value="expense">Gasto</option>
                        </select>
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <input value={f.category} onChange={(e) => actualizarFila(i, "category", e.target.value)}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 12, width: 130 }} />
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <input value={f.subcategory} onChange={(e) => actualizarFila(i, "subcategory", e.target.value)}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 12, width: 130 }} />
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <input value={f.description} onChange={(e) => actualizarFila(i, "description", e.target.value)}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 12, width: 160 }} />
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <input type="number" step="0.01" value={f.amount} onChange={(e) => actualizarFila(i, "amount", e.target.value)}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 12, width: 80 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <span style={{ fontSize: 13, color: theme.inkSoft }}>
                {importando ? `Importando ${progreso} de ${seleccionadas.length}…` : `${seleccionadas.length} de ${filas.length} filas seleccionadas`}
              </span>
              <button
                onClick={importar}
                disabled={seleccionadas.length === 0 || importando}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: seleccionadas.length === 0 || importando ? theme.border : theme.accent,
                  color: "#fff", fontWeight: 700, cursor: seleccionadas.length === 0 || importando ? "default" : "pointer",
                }}
              >
                {importando ? "Importando…" : `Importar ${seleccionadas.length} transacciones`}
              </button>
            </div>
          </>
        )}

        {hecho && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <Check size={40} color={theme.success} style={{ margin: "0 auto 12px" }} />
            <div style={{ fontWeight: 700, color: theme.ink, marginBottom: 6 }}>¡Importación completada!</div>
            <div style={{ fontSize: 13, color: theme.inkSoft, marginBottom: 18 }}>
              Se han añadido {seleccionadas.length} transacciones nuevas.
            </div>
            <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: theme.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TransaccionForm({ onClose, onSave, initial, categorias }) {
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    subcategory: "",
    description: initial?.description || "",
    amount: initial?.amount || "",
    date: initial?.date || new Date().toISOString().slice(0, 10),
    activity: "",
    iva_type: "",
    base_amount: "",
    irpf_deductible: "no",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;
    onSave({
      ...form,
      amount: Number(form.amount).toFixed(2),
      base_amount: form.base_amount ? Number(form.base_amount).toFixed(2) : null,
      iva_amount:
        form.base_amount && form.iva_type
          ? (Number(form.base_amount) * (Number(form.iva_type) / 100)).toFixed(2)
          : null,
      date: new Date(form.date).toISOString(),
    });
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    fontSize: 14,
    marginTop: 4,
  };
  const label = { fontSize: 12, fontWeight: 600, color: theme.inkSoft };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,43,34,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <form
        onSubmit={submit}
        className="shadow-lg rounded-2xl"
        style={{ background: theme.surface, padding: 24, width: 420, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: theme.ink }}>Nueva transacción</div>
          <button type="button" onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {initial && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8, background: theme.accentSoft,
              color: "#8A6A2E", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, marginBottom: 14,
            }}
          >
            <Camera size={14} />
            Datos detectados del ticket — revísalos antes de guardar.
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["expense", "income"].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setForm({ ...form, type: t })}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: `1px solid ${form.type === t ? theme.accent : theme.border}`,
                background: form.type === t ? theme.accentSoft : "transparent",
                color: form.type === t ? theme.accent : theme.inkSoft,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t === "expense" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>

        <label style={label}>Categoría</label>
        <input style={inputStyle} value={form.category} onChange={set("category")} required list="lista-categorias" placeholder="Elige o escribe una nueva…" />
        <datalist id="lista-categorias">
          {(form.type === "income" ? categorias?.ingresos : categorias?.gastos || []).map((c) => <option key={c} value={c} />)}
        </datalist>

        <label style={label}>Subcategoría (opcional)</label>
        <input style={inputStyle} value={form.subcategory} onChange={set("subcategory")} list="lista-subcategorias" placeholder="Ej: Greenfees no socios…" />
        <datalist id="lista-subcategorias">
          {((categorias?.subcategorias || {})[form.category] || []).map((s) => <option key={s} value={s} />)}
        </datalist>

        <label style={label}>Descripción</label>
        <input style={inputStyle} value={form.description} onChange={set("description")} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={label}>Importe (€)</label>
            <input style={inputStyle} type="number" step="0.01" value={form.amount} onChange={set("amount")} required />
          </div>
          <div>
            <label style={label}>Fecha</label>
            <input style={inputStyle} type="date" value={form.date} onChange={set("date")} />
          </div>
        </div>

        <label style={label}>Actividad (opcional: club / mantenimiento...)</label>
        <input style={inputStyle} value={form.activity} onChange={set("activity")} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={label}>Base imponible (opcional)</label>
            <input style={inputStyle} type="number" step="0.01" value={form.base_amount} onChange={set("base_amount")} />
          </div>
          <div>
            <label style={label}>IVA % (opcional)</label>
            <input style={inputStyle} type="number" value={form.iva_type} onChange={set("iva_type")} />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md"
          style={{
            marginTop: 16,
            width: "100%",
            padding: "10px 0",
            background: theme.accent,
            color: "#fff",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Guardar transacción
        </button>
      </form>
    </div>
  );
}

function TransaccionesView({ transacciones, onAdd, categorias }) {
  const [showForm, setShowForm] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showImportar, setShowImportar] = useState(false);
  const [datosDetectados, setDatosDetectados] = useState(null);
  const ordenadas = [...transacciones].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: theme.ink }}>Transacciones</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowImportar(true)}
            className="rounded-md"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              color: theme.pine,
              border: `1px solid ${theme.border}`,
              padding: "8px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Upload size={16} /> Importar Excel/CSV
          </button>
          <button
            onClick={() => setShowScan(true)}
            className="rounded-md"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              padding: "8px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Camera size={16} /> Escanear ticket
          </button>
          <button
            onClick={() => { setDatosDetectados(null); setShowForm(true); }}
            className="rounded-md"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: theme.accent,
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
              {["Fecha", "Categoría", "Descripción", "Tipo", "Importe"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 12,
                    color: theme.inkSoft,
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((t) => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: "12px 16px", fontSize: 14 }}>{fmtDate(t.date)}</td>
                <td style={{ padding: "12px 16px", fontSize: 14 }}>{t.category}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: theme.inkSoft }}>
                  {t.description || "—"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Badge tone={t.type === "income" ? "income" : "expense"}>
                    {t.type === "income" ? "Ingreso" : "Gasto"}
                  </Badge>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.type === "income" ? theme.success : theme.danger,
                  }}
                >
                  {t.type === "income" ? "+" : "-"} {fmtEUR(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showScan && (
        <EscanearTicketModal
          onClose={() => setShowScan(false)}
          onDetectado={(datos) => {
            setDatosDetectados(datos);
            setShowScan(false);
            setShowForm(true);
          }}
        />
      )}

      {showImportar && (
        <ImportarExcelModal
          onClose={() => setShowImportar(false)}
          onAdd={onAdd}
          categorias={categorias}
        />
      )}

      {showForm && (
        <TransaccionForm
          initial={datosDetectados}
          categorias={categorias}
          onClose={() => { setShowForm(false); setDatosDetectados(null); }}
          onSave={(data) => {
            onAdd(data);
            setShowForm(false);
            setDatosDetectados(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------- Presupuestos ------------------------------- */

/* =========================== INFORMES (exportación) =========================== */

// Colores en RGB para jsPDF (que no admite hex directamente en
// versiones antiguas), sacados de la misma paleta "Golf B Premium".
const rgbPine = [31, 79, 55];
const rgbAccent = [198, 162, 83];
const rgbSuccess = [47, 125, 79];
const rgbDanger = [179, 70, 44];
const rgbInkSoft = [92, 108, 98];

function agruparPorCategoriaGenerico(items) {
  const mapa = {};
  items.forEach((t) => { const c = t.category || "Sin categoría"; mapa[c] = (mapa[c] || 0) + Number(t.amount || 0); });
  return Object.entries(mapa).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

async function exportarInformeExcel({ desde, hasta, ingresosManual, gastosManual, totalProshopAuto, desgloseIngresos, desgloseGastos, transaccionesRango, totalIngresos, totalGastos, balance }) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Golf B · Finanzas";
  wb.created = new Date();

  const colorCabecera = "FF1F4F37"; // verde pino
  const colorAcento = "FFC6A253"; // dorado
  const colorTextoClaro = "FFFFFFFF";

  // ---- Hoja Resumen ----
  const shResumen = wb.addWorksheet("Resumen");
  shResumen.mergeCells("A1:D1");
  shResumen.getCell("A1").value = "Golf Ciudad Real · Informe financiero";
  shResumen.getCell("A1").font = { size: 16, bold: true, color: { argb: colorCabecera } };
  shResumen.mergeCells("A2:D2");
  shResumen.getCell("A2").value = `Periodo: ${fmtDate(desde)} — ${fmtDate(hasta)}   ·   Generado: ${fmtDate(new Date())}`;
  shResumen.getCell("A2").font = { size: 10, italic: true, color: { argb: "FF5C6C62" } };
  shResumen.addRow([]);

  const filaKpiInicio = shResumen.rowCount + 1;
  shResumen.getRow(filaKpiInicio).values = ["Ingresos", "Gastos", "Balance"];
  shResumen.getRow(filaKpiInicio).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: colorTextoClaro } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colorCabecera } };
    cell.alignment = { horizontal: "center" };
  });
  const filaKpiValores = filaKpiInicio + 1;
  shResumen.getRow(filaKpiValores).values = [totalIngresos, totalGastos, balance];
  shResumen.getRow(filaKpiValores).eachCell((cell) => {
    cell.numFmt = '#,##0.00 "€"';
    cell.font = { size: 14, bold: true };
    cell.alignment = { horizontal: "center" };
  });
  shResumen.columns = [{ width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }];

  const escribirTabla = (hoja, filaInicio, titulo, datos) => {
    hoja.mergeCells(`A${filaInicio}:B${filaInicio}`);
    hoja.getCell(`A${filaInicio}`).value = titulo;
    hoja.getCell(`A${filaInicio}`).font = { bold: true, size: 12, color: { argb: colorCabecera } };
    const filaCab = filaInicio + 1;
    hoja.getCell(`A${filaCab}`).value = "Categoría";
    hoja.getCell(`B${filaCab}`).value = "Importe";
    [`A${filaCab}`, `B${filaCab}`].forEach((ref) => {
      hoja.getCell(ref).font = { bold: true, color: { argb: colorTextoClaro } };
      hoja.getCell(ref).fill = { type: "pattern", pattern: "solid", fgColor: { argb: colorAcento } };
    });
    datos.forEach((d, i) => {
      const f = filaCab + 1 + i;
      hoja.getCell(`A${f}`).value = d.category;
      hoja.getCell(`B${f}`).value = d.total;
      hoja.getCell(`B${f}`).numFmt = '#,##0.00 "€"';
      if (i % 2 === 1) {
        [`A${f}`, `B${f}`].forEach((ref) => { hoja.getCell(ref).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4ECDA" } }; });
      }
    });
    return filaCab + 1 + datos.length + 2;
  };

  let siguienteFila = filaKpiValores + 3;
  siguienteFila = escribirTabla(shResumen, siguienteFila, "Ingresos por categoría", desgloseIngresos);
  escribirTabla(shResumen, siguienteFila, "Gastos por partida", desgloseGastos);

  // ---- Hoja Transacciones (detalle) ----
  const shDetalle = wb.addWorksheet("Transacciones");
  shDetalle.columns = [
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Categoría", key: "categoria", width: 22 },
    { header: "Descripción", key: "descripcion", width: 32 },
    { header: "Importe", key: "importe", width: 14 },
  ];
  shDetalle.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: colorTextoClaro } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colorCabecera } };
  });
  transaccionesRango
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((t) => {
      const fila = shDetalle.addRow({
        fecha: fmtDate(t.date),
        tipo: t.type === "income" ? "Ingreso" : "Gasto",
        categoria: t.category || "Sin categoría",
        descripcion: t.description || "",
        importe: Number(t.amount || 0),
      });
      fila.getCell("importe").numFmt = '#,##0.00 "€"';
      fila.getCell("importe").font = { color: { argb: t.type === "income" ? "FF2F7D4F" : "FFB3462C" } };
    });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `informe_finanzas_${fmtDate(desde).replace(/ /g, "-")}_${fmtDate(hasta).replace(/ /g, "-")}.xlsx`; a.click();
  URL.revokeObjectURL(url);
}

async function exportarInformePDF({ desde, hasta, desgloseIngresos, desgloseGastos, transaccionesRango, totalIngresos, totalGastos, balance, incluirTransacciones }) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margen = 40;

  const dibujarCabecera = () => {
    doc.setFillColor(...rgbPine);
    doc.rect(0, 0, anchoPagina, 80, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Golf Ciudad Real", margen, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Informe financiero", margen, 52);
    doc.setFontSize(9);
    doc.setTextColor(230, 230, 220);
    doc.text(`Periodo: ${fmtDate(desde)} — ${fmtDate(hasta)}`, margen, 68);
    doc.text(`Generado: ${fmtDate(new Date())}`, anchoPagina - margen, 68, { align: "right" });
  };
  dibujarCabecera();

  // Tarjetas KPI
  const yKpi = 106;
  const anchoKpi = (anchoPagina - margen * 2 - 20) / 3;
  const kpis = [
    { label: "INGRESOS", valor: totalIngresos, color: rgbSuccess },
    { label: "GASTOS", valor: totalGastos, color: rgbDanger },
    { label: "BALANCE", valor: balance, color: rgbAccent },
  ];
  kpis.forEach((k, i) => {
    const x = margen + i * (anchoKpi + 10);
    doc.setDrawColor(230, 230, 225);
    doc.setLineWidth(1);
    doc.roundedRect(x, yKpi, anchoKpi, 58, 6, 6, "S");
    doc.setFillColor(...k.color);
    doc.rect(x, yKpi, 4, 58, "F");
    doc.setTextColor(...rgbInkSoft);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(k.label, x + 14, yKpi + 20);
    doc.setTextColor(20, 30, 25);
    doc.setFontSize(16);
    doc.text(fmtEUR(k.valor), x + 14, yKpi + 42);
  });

  let y = yKpi + 80;

  doc.setTextColor(20, 30, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Ingresos por categoría", margen, y);
  autoTable(doc, {
    startY: y + 8,
    margin: { left: margen, right: margen },
    head: [["Categoría", "Importe"]],
    body: desgloseIngresos.map((d) => [d.category, fmtEUR(d.total)]),
    theme: "striped",
    headStyles: { fillColor: rgbSuccess, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: { 1: { halign: "right" } },
  });
  y = doc.lastAutoTable.finalY + 26;

  if (y > 650) { doc.addPage(); dibujarCabecera(); y = 106; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Gastos por partida", margen, y);
  autoTable(doc, {
    startY: y + 8,
    margin: { left: margen, right: margen },
    head: [["Partida", "Importe"]],
    body: desgloseGastos.map((d) => [d.category, fmtEUR(d.total)]),
    theme: "striped",
    headStyles: { fillColor: rgbDanger, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: { 1: { halign: "right" } },
  });
  y = doc.lastAutoTable.finalY + 26;

  if (incluirTransacciones && transaccionesRango.length > 0) {
    if (y > 620) { doc.addPage(); dibujarCabecera(); y = 106; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Detalle de transacciones", margen, y);
    autoTable(doc, {
      startY: y + 8,
      margin: { left: margen, right: margen },
      head: [["Fecha", "Tipo", "Categoría", "Descripción", "Importe"]],
      body: [...transaccionesRango]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((t) => [fmtDate(t.date), t.type === "income" ? "Ingreso" : "Gasto", t.category || "—", t.description || "", fmtEUR(t.amount)]),
      theme: "striped",
      headStyles: { fillColor: rgbPine, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 5 },
      columnStyles: { 4: { halign: "right" } },
    });
  }

  const paginas = doc.internal.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...rgbInkSoft);
    doc.text(`Golf B · Finanzas — página ${p} de ${paginas}`, anchoPagina / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
  }

  doc.save(`informe_finanzas_${fmtDate(desde).replace(/ /g, "-")}_${fmtDate(hasta).replace(/ /g, "-")}.pdf`);
}

function InformesView({ transacciones, ventasProshop }) {
  const [preset, setPreset] = useState("mes");
  const now = new Date();
  const [desdeManual, setDesdeManual] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [hastaManual, setHastaManual] = useState(now.toISOString().slice(0, 10));
  const [incluirTransacciones, setIncluirTransacciones] = useState(true);
  const [generando, setGenerando] = useState(null); // "excel" | "pdf" | null
  const [error, setError] = useState("");

  const { desde, hasta } = useMemo(() => calcularRango(preset, desdeManual, hastaManual), [preset, desdeManual, hastaManual]);

  const datosInforme = useMemo(() => {
    const enRango = (t) => { const f = aFecha(t.date); return f >= desde && f <= hasta; };
    const transaccionesRango = transacciones.filter(enRango);
    const ingresosManual = transaccionesRango.filter((t) => t.type === "income");
    const gastosManual = transaccionesRango.filter((t) => t.type === "expense");
    const ventasProshopRango = ventasProshop.filter((v) => { const f = aFecha(v.creadoEn); return f >= desde && f <= hasta; });
    const totalProshopAuto = ventasProshopRango.reduce((s, v) => s + Number(v.total || 0), 0);

    const desgloseIngresos = agruparPorCategoriaGenerico(ingresosManual).filter((d) => d.category !== "Proshop");
    if (totalProshopAuto > 0) desgloseIngresos.push({ category: "Proshop", total: totalProshopAuto });
    desgloseIngresos.sort((a, b) => b.total - a.total);
    const desgloseGastos = agruparPorCategoriaGenerico(gastosManual);

    const totalIngresos = ingresosManual.reduce((s, t) => s + Number(t.amount), 0) + totalProshopAuto;
    const totalGastos = gastosManual.reduce((s, t) => s + Number(t.amount), 0);

    return { transaccionesRango, ingresosManual, gastosManual, totalProshopAuto, desgloseIngresos, desgloseGastos, totalIngresos, totalGastos, balance: totalIngresos - totalGastos };
  }, [transacciones, ventasProshop, desde, hasta]);

  const generar = async (formato) => {
    setError(""); setGenerando(formato);
    try {
      if (formato === "excel") {
        await exportarInformeExcel({ desde, hasta, ...datosInforme });
      } else {
        await exportarInformePDF({ desde, hasta, ...datosInforme, incluirTransacciones });
      }
    } catch (e) {
      console.warn("Error generando informe:", e);
      setError("No se ha podido generar el informe. Vuelve a intentarlo.");
    }
    setGenerando(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: theme.ink }}>Informes</div>

      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12, color: theme.ink }}>1. Elige el periodo</div>
        <SelectorRango preset={preset} setPreset={setPreset} desdeManual={desdeManual} setDesdeManual={setDesdeManual} hastaManual={hastaManual} setHastaManual={setHastaManual} />
      </Card>

      <Card>
        <div style={{ fontWeight: 700, marginBottom: 6, color: theme.ink }}>2. Qué incluir</div>
        <div style={{ fontSize: 12.5, color: theme.inkSoft, marginBottom: 12 }}>
          El resumen de ingresos/gastos y el desglose por categoría siempre se incluyen. El listado línea a línea es opcional (en el Excel siempre se incluye en su propia hoja).
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: theme.ink, cursor: "pointer" }}>
          <input type="checkbox" checked={incluirTransacciones} onChange={(e) => setIncluirTransacciones(e.target.checked)} />
          Incluir el detalle de todas las transacciones (además del resumen) en el PDF
        </label>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, marginBottom: 4, color: theme.ink }}>3. Vista previa rápida</div>
        <div style={{ display: "flex", gap: 24, marginTop: 10, marginBottom: 6, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>INGRESOS</div><div style={{ fontSize: 20, fontWeight: 700, color: theme.success, fontFamily: "Playfair Display, serif" }}>{fmtEUR(datosInforme.totalIngresos)}</div></div>
          <div><div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>GASTOS</div><div style={{ fontSize: 20, fontWeight: 700, color: theme.danger, fontFamily: "Playfair Display, serif" }}>{fmtEUR(datosInforme.totalGastos)}</div></div>
          <div><div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>BALANCE</div><div style={{ fontSize: 20, fontWeight: 700, color: theme.ink, fontFamily: "Playfair Display, serif" }}>{fmtEUR(datosInforme.balance)}</div></div>
          <div><div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>TRANSACCIONES</div><div style={{ fontSize: 20, fontWeight: 700, color: theme.ink, fontFamily: "Playfair Display, serif" }}>{datosInforme.transaccionesRango.length}</div></div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => generar("excel")}
          disabled={!!generando}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 0", borderRadius: 12, border: "none",
            background: generando === "excel" ? theme.border : theme.success, color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: generando ? "default" : "pointer",
          }}
        >
          <Download size={17} /> {generando === "excel" ? "Generando…" : "Descargar Excel"}
        </button>
        <button
          onClick={() => generar("pdf")}
          disabled={!!generando}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 0", borderRadius: 12, border: "none",
            background: generando === "pdf" ? theme.border : theme.pine, color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: generando ? "default" : "pointer",
          }}
        >
          <FileText size={17} /> {generando === "pdf" ? "Generando…" : "Descargar PDF"}
        </button>
      </div>
      {error && <div style={{ fontSize: 13, color: theme.danger }}>{error}</div>}
    </div>
  );
}

function PresupuestosView({ presupuestos, transacciones }) {
  const now = new Date();
  const currentMonth = monthKey(now.toISOString());
  const delMes = transacciones.filter(
    (t) => monthKey(t.date) === currentMonth && t.type === "expense"
  );

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, color: theme.ink, marginBottom: 16 }}>
        Presupuestos · {new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(now)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {presupuestos.map((p) => {
          const gastado = delMes
            .filter((t) => t.category === p.category)
            .reduce((s, t) => s + Number(t.amount), 0);
          return (
            <Card key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: theme.ink }}>{p.category}</span>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: p.color,
                    marginTop: 4,
                  }}
                />
              </div>
              <div style={{ fontSize: 13, color: theme.inkSoft, marginBottom: 8 }}>
                {fmtEUR(gastado)} de {fmtEUR(p.monthly_limit)}
              </div>
              <ProgressBar value={gastado} max={Number(p.monthly_limit)} color={p.color} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- Metas ---------------------------------- */

function MetasView({ metas }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, color: theme.ink, marginBottom: 16 }}>
        Metas de ahorro e inversión
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {metas.map((m) => {
          const pct = (Number(m.current_amount) / Number(m.target_amount)) * 100;
          return (
            <Card key={m.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.ink }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 2 }}>
                    {m.description}
                  </div>
                </div>
                <Badge>{m.category}</Badge>
              </div>
              <div style={{ margin: "16px 0 8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: theme.accent }}>{pct.toFixed(0)}%</span>
                  <span style={{ color: theme.inkSoft }}>
                    {fmtEUR(m.current_amount)} / {fmtEUR(m.target_amount)}
                  </span>
                </div>
                <ProgressBar value={Number(m.current_amount)} max={Number(m.target_amount)} color={theme.accent} />
              </div>
              <div style={{ fontSize: 12, color: theme.inkSoft }}>
                Fecha objetivo: {fmtDate(m.deadline)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- Tareas ----------------------------------- */

function TareasView({ tareas, onUpdateStatus }) {
  const columnas = [
    { id: "pending", label: "Pendientes", icon: Circle },
    { id: "in_progress", label: "En curso", icon: Clock },
    { id: "done", label: "Hechas", icon: CheckCircle2 },
  ];

  const nextStatus = { pending: "in_progress", in_progress: "done", done: "pending" };

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, color: theme.ink, marginBottom: 16 }}>
        Tareas financieras
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {columnas.map(({ id, label, icon: Icon }) => (
          <div key={id}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: theme.inkSoft }}>
              <Icon size={16} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tareas
                .filter((t) => t.status === id)
                .map((t) => (
                  <Card key={t.id} style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: theme.ink }}>{t.title}</span>
                      <Badge tone={t.priority}>{t.priority}</Badge>
                    </div>
                    {t.description && (
                      <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 4 }}>
                        {t.description}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontSize: 12, color: theme.inkSoft }}>
                        {t.due_date ? fmtDate(t.due_date) : "Sin fecha"}
                      </span>
                      <button
                        onClick={() => onUpdateStatus(t.id, nextStatus[t.status])}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: theme.accent,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Avanzar →
                      </button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- App ------------------------------------ */
const ROLES_PERMITIDOS_FINANZAS = ["superadmin"];
function AccessDenied({ onLogout }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.bg,
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, color: theme.ink }}>
        Acceso restringido
      </div>
      <div style={{ color: theme.inkSoft, fontSize: 14 }}>
        Esta sección de Finanzas es solo para el superadministrador.
      </div>
      <button
        onClick={onLogout}
        style={{
          marginTop: 8,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          background: theme.pine,
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
function ModuloDesactivado({ email, onLogout }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.bg,
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, color: theme.ink }}>
        Finanzas no está activo para tu club
      </div>
      <div style={{ color: theme.inkSoft, fontSize: 14, textAlign: "center", maxWidth: 380 }}>
        La cuenta <strong>{email}</strong> ha entrado correctamente, pero este módulo no está contratado actualmente. Contacta con el administrador del club.
      </div>
      <button
        onClick={onLogout}
        style={{
          marginTop: 8,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          background: theme.pine,
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
// Login propio de Finanzas (independiente de Golf B Máster) — antes
// todas las apps compartían dominio y por eso la sesión de Firebase
// Auth se compartía sola; con cada app en su propio subdominio ya no
// es así, así que Finanzas necesita su propio formulario de login.
function LoginFinanzas() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarReset, setMostrarReset] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setError(""); setCargando(true);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { setError("Email o contraseña incorrectos."); }
    setCargando(false);
  }
  async function recuperar(e) {
    e.preventDefault();
    setError(""); setCargando(true);
    try { await sendPasswordResetEmail(auth, email); setResetEnviado(true); }
    catch { setError("No se pudo enviar el email. Revisa la dirección."); }
    setCargando(false);
  }

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10,
    border: `1px solid ${theme.border}`, background: theme.surface, color: theme.ink, fontSize: 14, outline: "none" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src={LOGO_GOLFB_PLATA} alt="Golf B" style={{ height: 48, objectFit: "contain", margin: "0 auto" }} />
          <p style={{ color: theme.inkSoft, fontSize: 14, marginTop: 10 }}>Finanzas · Golf Ciudad Real</p>
        </div>
        <div style={{ background: theme.surface, borderRadius: 16, padding: 28, border: `1px solid ${theme.border}`, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
          {!mostrarReset ? (
            <form onSubmit={entrar}>
              <p style={{ color: theme.pine, fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Iniciar sesión</p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: theme.inkSoft, fontSize: 12.5, marginBottom: 5 }}>Email</label>
                <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="tu@email.com" />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", color: theme.inkSoft, fontSize: 12.5, marginBottom: 5 }}>Contraseña</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              {error && <p style={{ color: theme.danger, background: "#FCEBE6", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 14 }}>{error}</p>}
              <button type="submit" disabled={cargando} style={{ width: "100%", background: theme.accent, color: theme.ink, border: "none",
                borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: cargando ? .6 : 1 }}>
                {cargando ? "Entrando…" : "Entrar"}
              </button>
              <button type="button" onClick={() => { setMostrarReset(true); setError(""); }} style={{ width: "100%", background: "transparent", border: "none",
                color: theme.inkSoft, fontSize: 12.5, marginTop: 14, cursor: "pointer" }}>
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : (
            <div>
              <p style={{ color: theme.pine, fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Recuperar contraseña</p>
              {resetEnviado ? (
                <p style={{ color: theme.success, background: "#E9F5EE", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
                  Te hemos enviado un email con instrucciones para recuperar tu contraseña.
                </p>
              ) : (
                <form onSubmit={recuperar}>
                  <p style={{ color: theme.inkSoft, fontSize: 12.5, marginBottom: 14 }}>Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
                  <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} placeholder="tu@email.com" />
                  {error && <p style={{ color: theme.danger, background: "#FCEBE6", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 14 }}>{error}</p>}
                  <button type="submit" disabled={cargando} style={{ width: "100%", background: theme.accent, color: theme.ink, border: "none",
                    borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: cargando ? .6 : 1 }}>
                    {cargando ? "Enviando…" : "Enviar enlace"}
                  </button>
                </form>
              )}
              <button type="button" onClick={() => { setMostrarReset(false); setResetEnviado(false); setError(""); }} style={{ width: "100%", background: "transparent", border: "none",
                color: theme.inkSoft, fontSize: 12.5, marginTop: 14, cursor: "pointer" }}>
                ← Volver al login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function AppConAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
function App() {
  const { currentUser: user, userRole: role, modulosActivos, tenantId } = useAuth();
  const [active, setActive] = useState("resumen");

  const [transacciones, setTransacciones] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [metas, setMetas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [ventasProshop, setVentasProshop] = useState([]);
  const [categorias, setCategorias] = useState(null); // null = aún no cargado

  
    // Suscripciones en vivo a Firestore
  useEffect(() => {
    if (!user || !ROLES_PERMITIDOS_FINANZAS.includes(role)) return;

    const base = `clubes/${tenantId}`;
    const unsubs = [
      onSnapshot(
        query(collection(db, `${base}/finanzas_transacciones`), orderBy("date", "desc")),
        (snap) => setTransacciones(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
      ),
      onSnapshot(collection(db, `${base}/finanzas_presupuestos`), (snap) =>
        setPresupuestos(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
      ),
      onSnapshot(collection(db, `${base}/finanzas_metas`), (snap) =>
        setMetas(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
      ),
      onSnapshot(collection(db, `${base}/finanzas_tareas`), (snap) =>
        setTareas(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
      ),
      // Lectura en vivo, de solo lectura, de las ventas de Proshop —
      // así "Ingresos Proshop" en el dashboard no depende de que
      // alguien las vuelva a teclear aquí a mano.
      onSnapshot(collection(db, `${base}/proshop_ventas`), (snap) =>
        setVentasProshop(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
      ),
      onSnapshot(doc(db, `${base}/finanzas_config`, "categorias"), (snap) =>
        setCategorias(snap.exists() ? snap.data() : { ingresos: CATEGORIAS_DEFECTO.ingresos, gastos: CATEGORIAS_DEFECTO.gastos })
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, [user, role]);

  const handleAddTransaccion = async (data) => {
    await addDoc(collection(db, `clubes/${tenantId}/finanzas_transacciones`), {
      ...data,
      created_at: serverTimestamp(),
    });
  };

  const handleUpdateTareaStatus = async (id, status) => {
    await updateDoc(doc(db, `clubes/${tenantId}/finanzas_tareas`, id), {
      status,
      completed_at: status === "done" ? serverTimestamp() : null,
    });
  };

  const handleGuardarCategorias = async (nuevas) => {
    await setDoc(doc(db, `clubes/${tenantId}/finanzas_config`, "categorias"), nuevas);
  };

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
        <span style={{ color: theme.inkSoft }}>Cargando…</span>
      </div>
    );
  }

  if (!user) {
    return <LoginFinanzas />;
  }

  if (!ROLES_PERMITIDOS_FINANZAS.includes(role)) {
    return <AccessDenied onLogout={() => signOut(auth)} />;
  }

  if (modulosActivos && modulosActivos.finanzas === false) {
    return <ModuloDesactivado email={user.email} onLogout={() => signOut(auth)} />;
  }

  return (
    <div style={{ display: "flex", background: theme.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={active} setActive={setActive} onLogout={() => signOut(auth)} userEmail={user.email} />
      <main style={{ flex: 1, padding: 32 }}>
        {active === "resumen" && (
          <ResumenView
            transacciones={transacciones}
            presupuestos={presupuestos}
            metas={metas}
            ventasProshop={ventasProshop}
            categorias={categorias || CATEGORIAS_DEFECTO}
            onGuardarCategorias={handleGuardarCategorias}
          />
        )}
        {active === "transacciones" && (
          <TransaccionesView transacciones={transacciones} onAdd={handleAddTransaccion} categorias={categorias || CATEGORIAS_DEFECTO} />
        )}
        {active === "informes" && (
          <InformesView transacciones={transacciones} ventasProshop={ventasProshop} />
        )}
        {active === "presupuestos" && (
          <PresupuestosView presupuestos={presupuestos} transacciones={transacciones} />
        )}
        {active === "metas" && <MetasView metas={metas} />}
        {active === "tareas" && (
          <TareasView tareas={tareas} onUpdateStatus={handleUpdateTareaStatus} />
        )}
        {active === "ajustes" && (
          <AjustesView transacciones={transacciones} presupuestos={presupuestos} metas={metas} tareas={tareas} />
        )}
      </main>
    </div>
  );
}

/* ================================ AJUSTES ================================ */
// Zona de borrado seguro: permite vaciar los datos de prueba/ficticios
// (transacciones, presupuestos, metas, tareas) para empezar a trabajar
// con datos reales. NO toca las categorías configuradas ni las ventas
// de Proshop (esas no son "datos ficticios" de Finanzas).
function AjustesView({ transacciones, presupuestos, metas, tareas }) {
  const [seleccion, setSeleccion] = useState({ transacciones: true, presupuestos: true, metas: true, tareas: true });
  const [confirmando, setConfirmando] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [hecho, setHecho] = useState(false);
  // Progreso del borrado: { hechos, total, seccion } — para la barra en vivo
  const [progreso, setProgreso] = useState(null);

  const etiquetasSeccion = {
    transacciones: "Transacciones",
    presupuestos: "Presupuestos",
    metas: "Metas",
    tareas: "Tareas",
  };

  const conteos = {
    transacciones: transacciones.length,
    presupuestos: presupuestos.length,
    metas: metas.length,
    tareas: tareas.length,
  };
  const totalSeleccionado = Object.entries(seleccion).reduce((s, [k, v]) => s + (v ? conteos[k] : 0), 0);
  const nadaSeleccionado = Object.values(seleccion).every((v) => !v);

  const coleccionesPorClave = {
    transacciones: { ruta: "finanzas_transacciones", items: transacciones },
    presupuestos: { ruta: "finanzas_presupuestos", items: presupuestos },
    metas: { ruta: "finanzas_metas", items: metas },
    tareas: { ruta: "finanzas_tareas", items: tareas },
  };

  async function borrarSeleccion() {
    setBorrando(true);
    setHecho(false);
    const total = totalSeleccionado;
    let hechos = 0;
    setProgreso({ hechos: 0, total, seccion: "" });
    try {
      for (const [clave, activo] of Object.entries(seleccion)) {
        if (!activo) continue;
        const { ruta, items } = coleccionesPorClave[clave];
        const validos = items.filter((it) => typeof it.id === "string" && it.id.length > 0);
        // Borrado por lotes: más estable con muchos registros y permite
        // ir actualizando la barra de progreso tras cada lote.
        const TAMANO_LOTE = 40;
        for (let i = 0; i < validos.length; i += TAMANO_LOTE) {
          const lote = validos.slice(i, i + TAMANO_LOTE);
          await Promise.all(lote.map((it) => deleteDoc(doc(db, `clubes/${tenantId}/${ruta}`, it.id))));
          hechos += lote.length;
          setProgreso({ hechos, total, seccion: etiquetasSeccion[clave] || clave });
        }
      }
      setHecho(true);
      setConfirmando(false);
      setTextoConfirmacion("");
    } catch (e) {
      console.warn("Error borrando datos:", e);
      alert(`Ha habido un problema borrando los datos (se habían borrado ${hechos} de ${total}). Revisa la consola.`);
    }
    setBorrando(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: theme.ink }}>Ajustes</div>

      <Card style={{ border: `1px solid ${theme.danger}55` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <AlertOctagon size={19} color={theme.danger} />
          <div style={{ fontWeight: 700, color: theme.danger }}>Borrar datos de prueba</div>
        </div>
        <p style={{ fontSize: 13, color: theme.inkSoft, marginBottom: 18 }}>
          Usa esto para vaciar los datos ficticios/de prueba que haya en Finanzas y empezar a trabajar con datos reales.
          Esta acción <b>no se puede deshacer</b>. No afecta a tus categorías configuradas ni a las ventas de Proshop
          (esas se leen automáticamente y no son "datos" de Finanzas).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {[
            { clave: "transacciones", label: "Transacciones" },
            { clave: "presupuestos", label: "Presupuestos" },
            { clave: "metas", label: "Metas" },
            { clave: "tareas", label: "Tareas" },
          ].map((c) => (
            <label key={c.clave} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: theme.ink, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={seleccion[c.clave]}
                onChange={(e) => setSeleccion({ ...seleccion, [c.clave]: e.target.checked })}
              />
              {c.label}
              <span style={{ color: theme.inkSoft, fontSize: 12 }}>({conteos[c.clave]} registro{conteos[c.clave] !== 1 ? "s" : ""})</span>
            </label>
          ))}
        </div>

        {!confirmando ? (
          <button
            onClick={() => setConfirmando(true)}
            disabled={nadaSeleccionado || totalSeleccionado === 0}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none",
              background: nadaSeleccionado || totalSeleccionado === 0 ? theme.border : theme.danger, color: "#fff",
              fontWeight: 700, fontSize: 13.5, cursor: nadaSeleccionado || totalSeleccionado === 0 ? "default" : "pointer",
            }}
          >
            <Trash2 size={16} /> Borrar {totalSeleccionado} registro{totalSeleccionado !== 1 ? "s" : ""} seleccionado{totalSeleccionado !== 1 ? "s" : ""}
          </button>
        ) : (
          <div style={{ background: "#FCEBE6", borderRadius: 10, padding: 16 }}>
            {borrando && progreso ? (
              <div>
                <p style={{ fontSize: 13.5, color: theme.danger, fontWeight: 700, marginBottom: 4 }}>
                  Borrando{progreso.seccion ? ` ${progreso.seccion.toLowerCase()}` : ""}… no cierres esta pestaña
                </p>
                <p style={{ fontSize: 13, color: theme.ink, marginBottom: 10 }}>
                  {progreso.hechos} de {progreso.total} registros borrados
                  {" "}({progreso.total > 0 ? Math.round((progreso.hechos / progreso.total) * 100) : 0}%)
                </p>
                <div style={{ width: "100%", height: 10, borderRadius: 999, background: "#fff", overflow: "hidden", border: `1px solid ${theme.danger}55` }}>
                  <div
                    style={{
                      width: `${progreso.total > 0 ? (progreso.hechos / progreso.total) * 100 : 0}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: theme.danger,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            ) : (
            <div>
            <p style={{ fontSize: 13.5, color: theme.danger, fontWeight: 600, marginBottom: 10 }}>
              Vas a borrar {totalSeleccionado} registro{totalSeleccionado !== 1 ? "s" : ""} de forma permanente. Escribe BORRAR para confirmar:
            </p>
            <input
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value)}
              placeholder="BORRAR"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.danger}`, marginBottom: 12, fontSize: 13.5 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setConfirmando(false); setTextoConfirmacion(""); }}
                style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "#fff", color: theme.ink, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >Cancelar</button>
              <button
                onClick={borrarSeleccion}
                disabled={textoConfirmacion !== "BORRAR" || borrando}
                style={{
                  padding: "9px 16px", borderRadius: 8, border: "none",
                  background: textoConfirmacion === "BORRAR" && !borrando ? theme.danger : theme.border,
                  color: "#fff", fontWeight: 700, fontSize: 13,
                  cursor: textoConfirmacion === "BORRAR" && !borrando ? "pointer" : "default",
                }}
              >{borrando ? "Borrando…" : "Confirmar borrado definitivo"}</button>
            </div>
            </div>
            )}
          </div>
        )}

        {hecho && (
          <p style={{ marginTop: 14, fontSize: 13.5, color: theme.success, background: "#E9F5EE", borderRadius: 8, padding: "10px 12px" }}>
            Hecho — se han borrado {progreso ? progreso.hechos : 0} registros. Ya puedes empezar a registrar datos reales.
          </p>
        )}
      </Card>
    </div>
  );
}
