import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, Download, Sparkles, Copy, Check, AlertTriangle, 
  Search, Filter, BookOpen, RefreshCw, PlusCircle, User, Calendar, 
  MapPin, ClipboardCheck, BrainCircuit, ExternalLink, Table,
  Database, Upload, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';

interface Finding {
  id: string;
  inspector: string;
  date: string;
  location: string;
  imageUrl?: string;
  technicalObservation: string;
  riskFactor: string;
  riskDetail: string;
  description: string;
  deficiencyLevel: number;
  exposureLevel: number;
  probabilityLevel: number;
  probabilityLabel: string;
  consequenceLevel: number;
  riskLevelValue: number;
  riskTier: string;
  riskAcceptability: string;
  elimination?: string;
  substitution?: string;
  engineeringControls?: string;
  administrativeControls?: string;
  eppControls?: string;
  actionPlan: string;
  status: "Abierto" | "En Proceso" | "Cerrado";
}

const RISK_FACTORS_MAP: Record<string, string[]> = {
  "Biológico": ["Virus (e.g. Influenza, COVID-19)", "Bacterias", "Hongos", "Rickettsias", "Parásitos", "Picaduras", "Mordeduras", "Fluidos o Excrementos"],
  "Físico": ["Ruido (continuo, intermitente, de impacto)", "Iluminación (deficiente o de exceso)", "Vibración (cuerpo entero, segmentaria)", "Temperaturas extremas (calor o frío)", "Presión atmosférica (normal o ajustada)", "Radiaciones ionizantes (Rayos X, gama, etc.)", "Radiaciones no ionizantes (Láser, UV, infrarroja, RF)"],
  "Químico": ["Polvos orgánicos o inorgánicos", "Fibras", "Líquidos (nieblas, rocíos)", "Gases y Vapores", "Humos metálicos, no metálicos", "Material particulado"],
  "Psicosocial": ["Gestión organizacional (estilo mando, pago, etc.)", "Características del grupo social de trabajo", "Condiciones de la tarea (carga mental, contenido)", "Interfase persona-tarea (conocimientos, tecnología)", "Jornación de trabajo (turnos, rotación, extras)"],
  "Biomecánico": ["Postura (prolongada, mantenida, forzada, antigravitacional)", "Esfuerzo muscular extremo", "Movimiento repetitivo (miembros superiores)", "Manipulación manual de cargas"],
  "Condiciones de seguridad": ["Mecánico (máquinas, herramientas, piezas a trabajar)", "Eléctrico (alta y baja tensión, estática)", "Locativo (sistemas y medios de almacenamiento, orden)", "Tecnológico (explosión, fuga, derrame, incendio)", "Accidentes de tránsito", "Públicos (robos, atracos, asaltos, orden público)", "Trabajo en alturas", "Espacios confinados"],
  "Fenómenos naturales": ["Sismos / Terremotos", "Vendavales", "Inundaciones", "Derrumbes", "Precipitaciones (lluvias, granizadas)"]
};

const INITIAL_FINDINGS: Finding[] = [
  {
    id: "f-1", inspector: "Carlos Mario Restrepo", date: "2026-05-10",
    location: "Almacén Central - Bahía de Cargue",
    technicalObservation: "Se observa estibamiento deficiente con cajas pesadas en el tercer nivel del estante sin barandilla de contención ni amarre.",
    riskFactor: "Condiciones de seguridad", riskDetail: "Locativo (sistemas y medios de almacenamiento, orden)",
    description: "Almacenamiento de mercancía inestable a más de 3 metros de altura con potencial de caída de objetos pesados sobre personal transitable.",
    deficiencyLevel: 6, exposureLevel: 3, probabilityLevel: 18, probabilityLabel: "Alto",
    consequenceLevel: 60, riskLevelValue: 1080, riskTier: "I", riskAcceptability: "Inaceptable",
    engineeringControls: "Instalar malla de contención y barandillas frontales de contención en racks elevados.",
    administrativeControls: "Capacitación en técnicas seguras de almacenamiento y demarcación de línea de seguridad en piso.",
    eppControls: "Obligatoriedad de uso de casco y calzado de seguridad con punta de acero en la zona.",
    actionPlan: "Reorganizar estantes de inmediato ubicando cargas más pesadas en niveles inferiores y colocar mallas.",
    status: "En Proceso"
  },
  {
    id: "f-2", inspector: "Patricia Gómez", date: "2026-05-12",
    location: "Planta de Producción - Línea de Inyección",
    technicalObservation: "Niveles de ruido medidos de manera cualitativa muy altos en máquina inyectora #4. Los operarios deben gritar para comunicarse a menos de 1 metro.",
    riskFactor: "Físico", riskDetail: "Ruido (continuo, intermitente, de impacto)",
    description: "Exposición ocupacional a niveles elevados de presión sonora generados por el motor de inyectora plástica.",
    deficiencyLevel: 6, exposureLevel: 4, probabilityLevel: 24, probabilityLabel: "Muy Alto",
    consequenceLevel: 25, riskLevelValue: 600, riskTier: "I", riskAcceptability: "Inaceptable",
    engineeringControls: "Aislamiento acústico de la bomba hidráulica de la inyectora #4 mediante cabina modular.",
    administrativeControls: "Rotación de turnos del personal y señalización de área de uso obligatorio de protección auditiva.",
    eppControls: "Suministrar e inspeccionar protectores auditivos de tipo copa con atenuación superior a 25dB.",
    actionPlan: "Realizar sonometría oficial en el área y suministrar protectores auditivos de doble protección si es necesario.",
    status: "Abierto"
  },
  {
    id: "f-3", inspector: "Carlos Mario Restrepo", date: "2026-05-15",
    location: "Oficinas Administrativas - Piso 2",
    technicalObservation: "Personal de call center manifiesta dolores lumbares frecuentes. Sillas de oficina no tienen soporte lumbar ajustable ni apoyabrazos regulables.",
    riskFactor: "Biomecánico", riskDetail: "Postura (prolongada, mantenida, forzada, antigravitacional)",
    description: "Posturas estáticas e inadecuadas prolongadas durante la ejecución de tareas de oficina por mobiliario no ergonómico.",
    deficiencyLevel: 2, exposureLevel: 4, probabilityLevel: 8, probabilityLabel: "Medio",
    consequenceLevel: 10, riskLevelValue: 80, riskTier: "III", riskAcceptability: "Aceptable",
    engineeringControls: "Cambio progresivo de silletería convencional a silletería con certificación ergonómica.",
    administrativeControls: "Implementación estricta de pausas activas programadas cada dos horas guiadas por el líder SST.",
    actionPlan: "Capacitaciones de higiene postural e implementar pausas activas por medio de recordatorios en PC.",
    status: "Cerrado"
  }
];

export default function App() {
  const [findings, setFindings] = useState<Finding[]>(() => {
    try {
      const saved = localStorage.getItem("gtc45_findings");
      return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
    } catch { return INITIAL_FINDINGS; }
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [factorFilter, setFactorFilter] = useState("Todos");
  const [tierFilter, setTierFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [inspector, setInspector] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [technicalObservation, setTechnicalObservation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [riskFactor, setRiskFactor] = useState("");
  const [riskDetail, setRiskDetail] = useState("");
  const [description, setDescription] = useState("");
  const [deficiencyLevel, setDeficiencyLevel] = useState<number>(2);
  const [exposureLevel, setExposureLevel] = useState<number>(2);
  const [consequenceLevel, setConsequenceLevel] = useState<number>(25);
  const [elimination, setElimination] = useState("");
  const [substitution, setSubstitution] = useState("");
  const [engineeringControls, setEngineeringControls] = useState("");
  const [administrativeControls, setAdministrativeControls] = useState("");
  const [eppControls, setEppControls] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [status, setStatus] = useState<"Abierto" | "En Proceso" | "Cerrado">("Abierto");
  const [isAICopierOpen, setIsAICopierOpen] = useState(false);
  const [externalAIInput, setExternalAIInput] = useState("");
  const [copiedPromptStatus, setCopiedPromptStatus] = useState(false);
  const [calculatedProb, setCalculatedProb] = useState(4);
  const [calculatedProbLabel, setCalculatedProbLabel] = useState("Bajo");
  const [calculatedRisk, setCalculatedRisk] = useState(100);
  const [calculatedTier, setCalculatedTier] = useState("III");
  const [calculatedAcceptability, setCalculatedAcceptability] = useState("Aceptable");
  const [isCompressing, setIsCompressing] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ usedKB: 0, percentage: 0 });
  const [storageError, setStorageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileImportInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("gtc45_findings", JSON.stringify(findings.slice(0, 30)));
      const dataStr = JSON.stringify(findings);
      const bytes = dataStr.length * 2;
      const kb = Math.round((bytes / 1024) * 10) / 10;
      const pct = Math.min(Math.round((kb / 5120) * 100), 100);
      setStorageUsage({ usedKB: kb, percentage: pct });
    } catch { console.error("Storage error"); }
  }, [findings]);

  useEffect(() => {
    const np = deficiencyLevel * exposureLevel;
    setCalculatedProb(np);
    let label = "Bajo";
    if (np >= 24 && np <= 40) label = "Muy Alto (MA)";
    else if (np >= 10 && np <= 20) label = "Alto (A)";
    else if (np >= 6 && np <= 8) label = "Medio (M)";
    setCalculatedProbLabel(label);
    const nr = np * consequenceLevel;
    setCalculatedRisk(nr);
    let tier = "IV", acceptability = "Aceptable";
    if (nr >= 600 && nr <= 4000) { tier = "I"; acceptability = "Inaceptable"; }
    else if (nr >= 120 && nr <= 500) { tier = "II"; acceptability = "Inaceptable o Aceptable con control específico"; }
    else if (nr >= 50 && nr <= 100) { tier = "III"; acceptability = "Aceptable"; }
    setCalculatedTier(tier);
    setCalculatedAcceptability(acceptability);
  }, [deficiencyLevel, exposureLevel, consequenceLevel]);

  const handleRiskFactorChange = (f: string) => {
    setRiskFactor(f);
    setRiskDetail(RISK_FACTORS_MAP[f]?.[0] || "");
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width, height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.55));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.match("image.*")) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setImageUrl(compressed);
      } catch { setIsCompressing(false); }
      finally { setIsCompressing(false); }
    }
  };

  const handleNewFindingClick = () => {
    setEditingFinding(null);
    setInspector("Ing. Inspector de Seguridad");
    setDate(new Date().toISOString().split("T")[0]);
    setLocation("");
    setTechnicalObservation("");
    setImageUrl("");
    setRiskFactor(Object.keys(RISK_FACTORS_MAP)[0]);
    setRiskDetail(RISK_FACTORS_MAP[Object.keys(RISK_FACTORS_MAP)[0]][0]);
    setDescription("");
    setDeficiencyLevel(6);
    setExposureLevel(3);
    setConsequenceLevel(25);
    setElimination("");
    setSubstitution("");
    setEngineeringControls("");
    setAdministrativeControls("");
    setEppControls("");
    setActionPlan("");
    setStatus("Abierto");
    setIsFormOpen(true);
  };

  const handleEditClick = (f: Finding) => {
    setEditingFinding(f);
    setInspector(f.inspector);
    setDate(f.date);
    setLocation(f.location);
    setTechnicalObservation(f.technicalObservation);
    setImageUrl(f.imageUrl || "");
    setRiskFactor(f.riskFactor);
    setRiskDetail(f.riskDetail);
    setDescription(f.description);
    setDeficiencyLevel(f.deficiencyLevel);
    setExposureLevel(f.exposureLevel);
    setConsequenceLevel(f.consequenceLevel);
    setElimination(f.elimination || "");
    setSubstitution(f.substitution || "");
    setEngineeringControls(f.engineeringControls || "");
    setAdministrativeControls(f.administrativeControls || "");
    setEppControls(f.eppControls || "");
    setActionPlan(f.actionPlan);
    setStatus(f.status);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("¿Eliminar este hallazgo?")) {
      setFindings(findings.filter(f => f.id !== id));
    }
  };

  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) { alert("Ingrese ubicación"); return; }
    if (!technicalObservation.trim()) { alert("Ingrese observación"); return; }
    if (!editingFinding && findings.length >= 30) { alert("Máximo 30 hallazgos"); return; }

    const findingData: Finding = {
      id: editingFinding ? editingFinding.id : `f-${Date.now()}`,
      inspector: inspector || "Inspector SST",
      date: date || new Date().toISOString().split("T")[0],
      location, imageUrl: imageUrl || undefined, technicalObservation,
      riskFactor, riskDetail, description: description || technicalObservation,
      deficiencyLevel, exposureLevel, probabilityLevel: calculatedProb,
      probabilityLabel: calculatedProbLabel, consequenceLevel,
      riskLevelValue: calculatedRisk, riskTier: calculatedTier,
      riskAcceptability: calculatedAcceptability, elimination, substitution,
      engineeringControls, administrativeControls, eppControls,
      actionPlan: actionPlan || "Realizar inspección periódica", status
    };

    if (editingFinding) {
      setFindings(findings.map(f => f.id === editingFinding.id ? findingData : f));
    } else {
      setFindings([findingData, ...findings]);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.85 } });
    }
    setIsFormOpen(false);
  };

  const generatedAIPrompt = `Analiza esta evidencia según GTC 45...`;

  const handleCopyAIPrompt = () => {
    navigator.clipboard.writeText(generatedAIPrompt);
    setCopiedPromptStatus(true);
    setTimeout(() => setCopiedPromptStatus(false), 2000);
  };

  const handleApplyExternalAI = () => {
    if (!externalAIInput.trim()) { alert("Pega el resultado de la IA"); return; }
    try {
      const startIdx = externalAIInput.indexOf("{");
      const endIdx = externalAIInput.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        const parsedData = JSON.parse(externalAIInput.substring(startIdx, endIdx + 1));
        if (parsedData.riskFactor) setRiskFactor(parsedData.riskFactor);
        if (parsedData.riskDetail) setRiskDetail(parsedData.riskDetail);
        if (parsedData.description) setDescription(parsedData.description);
        if (typeof parsedData.deficiencyLevel === "number") setDeficiencyLevel(parsedData.deficiencyLevel);
        if (typeof parsedData.exposureLevel === "number") setExposureLevel(parsedData.exposureLevel);
        if (typeof parsedData.consequenceLevel === "number") setConsequenceLevel(parsedData.consequenceLevel);
        if (parsedData.elimination) setElimination(parsedData.elimination);
        if (parsedData.substitution) setSubstitution(parsedData.substitution);
        if (parsedData.engineeringControls) setEngineeringControls(parsedData.engineeringControls);
        if (parsedData.administrativeControls) setAdministrativeControls(parsedData.administrativeControls);
        if (parsedData.eppControls) setEppControls(parsedData.eppControls);
        if (parsedData.actionPlan) setActionPlan(parsedData.actionPlan);
        confetti({ particleCount: 40, spread: 30, origin: { y: 0.5 } });
        setExternalAIInput("");
        setIsAICopierOpen(false);
        alert("¡Análisis integrado con éxito!");
      }
    } catch { alert("No se pudo interpretar la respuesta"); }
  };

  const exportToExcelGTC45 = () => {
    const tableData = findings.map((f, i) => ({
      "ID": f.id, "No": i + 1, "Fecha": f.date, "Inspector": f.inspector,
      "Ubicación": f.location, "Observación": f.technicalObservation,
      "Factor Riesgo": f.riskFactor, "ND": f.deficiencyLevel, "NE": f.exposureLevel,
      "NP": f.probabilityLevel, "NC": f.consequenceLevel, "NR": f.riskLevelValue,
      "Tier": f.riskTier, "Aceptabilidad": f.riskAcceptability,
      "Eliminación": f.elimination || "No", "Sustitución": f.substitution || "No",
      "Ingeniería": f.engineeringControls || "No", "Administrativos": f.administrativeControls || "No",
      "EPP": f.eppControls || "No", "Plan Acción": f.actionPlan, "Estado": f.status
    }));
    const ws = XLSX.utils.json_to_sheet(tableData);
    ws["!cols"] = [{ wch: 12 }, { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 45 }, { wch: 20 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 35 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriz_GTC45");
    XLSX.writeFile(wb, `Matriz_SST_GTC45_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert(`Exportados ${findings.length} hallazgos`);
  };

  const exportBackupJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(findings, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `Backup_SST_GTC45_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    confetti({ particleCount: 60, spread: 45, origin: { y: 0.85 } });
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && confirm(`Importar ${parsed.length} hallazgos?`)) {
            setFindings(parsed);
            confetti({ particleCount: 100, spread: 60, origin: { y: 0.8 } });
            alert("Backup restaurado");
          }
        } catch { alert("Archivo inválido"); }
      };
      reader.readAsText(file);
    }
  };

  const stats = {
    total: findings.length,
    abiertos: findings.filter(f => f.status === "Abierto").length,
    enProceso: findings.filter(f => f.status === "En Proceso").length,
    cerrados: findings.filter(f => f.status === "Cerrado").length,
    criticos: findings.filter(f => f.riskTier === "I" || f.riskTier === "II").length,
  };

  const filteredFindings = findings.filter(f => {
    const text = `${f.location} ${f.technicalObservation} ${f.riskFactor}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase()) &&
      (factorFilter === "Todos" || f.riskFactor === factorFilter) &&
      (tierFilter === "Todos" || f.riskTier === tierFilter) &&
      (statusFilter === "Todos" || f.status === statusFilter);
  });

  const percentCerrados = stats.total > 0 ? Math.round((stats.cerrados / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-indigo-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3"><ClipboardCheck className="w-6 h-6" /><h1 className="font-bold text-lg">Matriz de Riesgos SST • GTC 45 Colombia</h1></div>
          <div className="flex gap-2"><button onClick={exportToExcelGTC45} className="bg-emerald-600 px-3 py-1.5 text-xs rounded">📊 Exportar Excel</button><button onClick={handleNewFindingClick} className="bg-white text-indigo-900 px-3 py-1.5 text-xs rounded">➕ Nuevo Hallazgo</button></div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 bg-indigo-800 text-white p-5 rounded-xl"><h2 className="text-xl font-bold">Portal SST GTC 45</h2><p className="text-sm">Clasificación y control de riesgos laborales</p><div className="mt-3"><p className="text-xs">Progreso: {percentCerrados}%</p><div className="bg-indigo-950 h-2 rounded-full"><div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${percentCerrados}%` }}></div></div></div></div>
          <div className="bg-white p-4 rounded-xl shadow"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs">Total Hallazgos</div></div>
          <div className="bg-white p-4 rounded-xl shadow"><div className="text-2xl font-bold text-rose-600">{stats.criticos}</div><div className="text-xs">Críticos I y II</div></div>
          <div className="bg-white p-4 rounded-xl shadow"><div className="text-2xl font-bold text-amber-600">{stats.abiertos}</div><div className="text-xs">Abiertos</div></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow"><Search className="inline w-4 h-4 mr-2" /><input type="text" placeholder="Buscar hallazgos por ubicación, observador, peligros..." className="w-full p-2 border rounded" onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredFindings.length === 0 ? <div className="bg-white rounded-xl p-12 text-center">No se encontraron hallazgos</div> : filteredFindings.map(f => {
              let tierColor = "bg-emerald-50 text-emerald-800 border-emerald-200", bgIndicator = "bg-emerald-500", textColor = "text-emerald-700";
              if (f.riskTier === "I") { tierColor = "bg-rose-50 text-rose-800 border-rose-200"; bgIndicator = "bg-rose-600"; textColor = "text-rose-600"; }
              else if (f.riskTier === "II") { tierColor = "bg-amber-50 text-amber-800 border-amber-200"; bgIndicator = "bg-amber-500"; textColor = "text-amber-600"; }
              else if (f.riskTier === "III") { tierColor = "bg-yellow-50 text-yellow-800 border-yellow-200"; bgIndicator = "bg-yellow-500"; textColor = "text-yellow-600"; }
              return (
                <div key={f.id} className="bg-white rounded-xl shadow border overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50/80 border-b flex justify-between text-xs text-slate-500"><div className="flex gap-5"><span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{f.inspector}</span><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{f.date}</span></div><select value={f.status} onChange={(e) => setFindings(findings.map(item => item.id === f.id ? { ...item, status: e.target.value as any } : item))} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${f.status === "Abierto" ? "bg-red-50 text-red-700" : f.status === "En Proceso" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}><option>Abierto</option><option>En Proceso</option><option>Cerrado</option></select></div>
                  <div className="p-5 space-y-4"><div className="flex justify-between"><div><div className="flex items-center gap-1.5 text-xs font-bold uppercase"><MapPin className="w-3.5 h-3.5 text-indigo-600" />{f.location}</div><h4 className="text-base font-bold">{f.riskFactor}</h4><p className="text-xs italic">{f.riskDetail}</p></div><div className={`px-4 py-2 rounded-xl border ${tierColor}`}><div className="text-xs uppercase font-black">Riesgo Tipo {f.riskTier}</div><div className="font-extrabold">{f.riskLevelValue} VP</div><div className="text-[9px]">{f.riskAcceptability}</div></div></div>
                    {f.imageUrl && <div className="rounded-xl overflow-hidden max-h-48"><img src={f.imageUrl} className="w-full h-48 object-cover" /></div>}
                    <div><span className="text-[10px] uppercase font-bold">Descripción del Hallazgo</span><p className="text-sm">{f.description}</p></div>
                    <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-center"><div><span className="text-[9px] uppercase">Deficiencia (ND)</span><div className="text-sm font-black">{f.deficiencyLevel}</div></div><div><span className="text-[9px] uppercase">Exposición (NE)</span><div className="text-sm font-black">{f.exposureLevel}</div></div><div><span className="text-[9px] uppercase">Probabilidad (NP)</span><div className={`text-sm font-black ${textColor}`}>{f.probabilityLevel} <span className="text-[10px]">({f.probabilityLabel})</span></div></div><div><span className="text-[9px] uppercase">Consecuencia (NC)</span><div className="text-sm font-black">{f.consequenceLevel}</div></div></div>
                    <div><span className="text-[10px] uppercase font-bold">Medidas de Intervención Priorizadas</span><div className="grid grid-cols-2 gap-3 text-xs mt-2"><div className="space-y-2">{f.engineeringControls && <div><span className="bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] uppercase">Ingeniería</span><p>{f.engineeringControls}</p></div>}{f.administrativeControls && <div><span className="bg-amber-50 px-1.5 py-0.5 rounded text-[9px] uppercase">Admin</span><p>{f.administrativeControls}</p></div>}{f.eppControls && <div><span className="bg-pink-50 px-1.5 py-0.5 rounded text-[9px] uppercase">EPP</span><p>{f.eppControls}</p></div>}</div><div className="bg-indigo-50/45 p-3 rounded-xl"><span className="text-[9px] uppercase font-extrabold">Plan de Acción Sugerido</span><p className="italic">"{f.actionPlan}"</p></div></div></div></div>
                  <div className="bg-slate-50 px-5 py-3 border-t flex justify-between"><span className="text-[10px] font-mono">ID: {f.id}</span><div><button onClick={() => handleEditClick(f)} className="p-1.5 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDeleteClick(f.id)} className="p-1.5 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></div>
                </div>
              );
            })}
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow space-y-4"><div className="flex gap-2 text-indigo-600"><Sparkles className="w-5 h-5" /><h4 className="font-bold">Asistente Generador GTC 45</h4></div><p className="text-xs">Use IA externa para sugerir la clasificación del peligro</p><textarea value={technicalObservation} onChange={e => setTechnicalObservation(e.target.value)} placeholder="Ej: Trabajadores realizando maniobras en fachada sin arnés..." rows={4} className="w-full p-2 border rounded text-xs"></textarea><button onClick={() => setIsAICopierOpen(true)} className="w-full bg-indigo-600 text-white py-2 rounded text-xs flex items-center justify-center gap-2"><BrainCircuit className="w-4 h-4" /> Obtener Prompt GTC-45</button></div>
            <div className="bg-white p-6 rounded-xl shadow"><div className="flex gap-2"><BookOpen className="w-4.5 h-4.5 text-indigo-600" /><h4 className="font-bold text-sm">Guía de Parámetros GTC 45</h4></div><div className="space-y-3 text-xs mt-3"><div><div className="flex justify-between text-[11px] font-bold"><span>Nivel de Deficiencia (ND)</span><span>Valor</span></div><div className="bg-slate-50 p-2 rounded-lg"><div className="flex justify-between">Muy Alto<span>10</span></div><div className="flex justify-between">Alto<span>6</span></div><div className="flex justify-between">Medio<span>2</span></div><div className="flex justify-between">Bajo<span>0</span></div></div></div><div><div className="flex justify-between text-[11px] font-bold"><span>Nivel de Exposición (NE)</span><span>Valor</span></div><div className="bg-slate-50 p-2 rounded-lg"><div className="flex justify-between">Continua<span>4</span></div><div className="flex justify-between">Frecuente<span>3</span></div><div className="flex justify-between">Ocasional<span>2</span></div><div className="flex justify-between">Esporádica<span>1</span></div></div></div><div><div className="flex justify-between text-[11px] font-bold"><span>Nivel Consecuencias (NC)</span><span>Valor</span></div><div className="bg-slate-50 p-2 rounded-lg"><div className="flex justify-between">Mortal<span>100</span></div><div className="flex justify-between">Muy Grave<span>60</span></div><div className="flex justify-between">Grave<span>25</span></div><div className="flex justify-between">Leve<span>10</span></div></div></div></div></div>
            <div className="bg-slate-950 text-white p-6 rounded-xl"><div className="flex gap-2 text-indigo-400"><Database className="w-5 h-5" /><h4 className="font-bold">Respaldo y Almacenamiento</h4></div><div className="mt-3"><div className="flex justify-between text-[10px]"><span>Capacidad utilizada:</span><span>{storageUsage.usedKB} KB / 5120 KB ({storageUsage.percentage}%)</span></div><div className="bg-slate-800 h-2 rounded-full"><div className={`h-2 rounded-full ${storageUsage.percentage > 75 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${storageUsage.percentage}%` }}></div></div></div><div className="grid grid-cols-2 gap-2 mt-4"><button onClick={exportBackupJSON} className="bg-slate-800 text-indigo-300 py-1.5 text-xs rounded">💾 Copia JSON</button><button onClick={() => fileImportInputRef.current?.click()} className="bg-indigo-600 py-1.5 text-xs rounded">📂 Restaurar</button><input type="file" ref={fileImportInputRef} onChange={handleImportBackupJSON} accept=".json" className="hidden" /></div></div>
          </div>
        </div>
      </main>
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between"><div className="flex gap-2"><PlusCircle className="w-5 h-5 text-indigo-700" /><div><h3 className="font-bold">{editingFinding ? "Editar Hallazgo" : "Registrar Nuevo Hallazgo"}</h3><p className="text-[11px]">Guía Técnica Colombiana GTC 45</p></div></div><button onClick={() => setIsFormOpen(false)}>✕</button></div>
            <form onSubmit={handleSaveFinding} className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4"><div><label className="text-xs font-bold">Inspector:</label><input type="text" value={inspector} onChange={e => setInspector(e.target.value)} className="w-full p-2 text-xs border rounded" /></div><div><label className="text-xs font-bold">Fecha:</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 text-xs border rounded" /></div><div><label className="text-xs font-bold">Ubicación:</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="w-full p-2 text-xs border rounded" /></div></div>
              <div className="grid grid-cols-3 gap-6"><div className="col-span-2"><label className="text-xs font-bold">Observación técnica:</label><textarea value={technicalObservation} onChange={e => setTechnicalObservation(e.target.value)} required rows={4} className="w-full p-2 text-xs border rounded"></textarea><button type="button" onClick={() => setIsAICopierOpen(true)} className="text-indigo-600 text-[11px] mt-1">✨ Autocompletar con IA Externa</button></div><div><label className="text-xs font-bold">Fotografía:</label><div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer"><input type="file" ref={fileInputRef} onChange={handleImageUploaded} accept="image/*" className="hidden" />{isCompressing ? "🔄 Comprimiendo..." : imageUrl ? <img src={imageUrl} className="h-full object-cover" /> : "📸 Haga clic para cargar foto"}</div></div></div>
              <div className="bg-slate-50 p-4 rounded-xl"><span className="text-xs font-black uppercase">Clasificación Básica del Peligro</span><div className="grid grid-cols-2 gap-4 mt-2"><select value={riskFactor} onChange={e => handleRiskFactorChange(e.target.value)} className="p-2 text-xs border rounded">{Object.keys(RISK_FACTORS_MAP).map(f => <option key={f}>{f}</option>)}</select><select value={riskDetail} onChange={e => setRiskDetail(e.target.value)} className="p-2 text-xs border rounded">{RISK_FACTORS_MAP[riskFactor]?.map(d => <option key={d}>{d}</option>)}</select></div><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción extendida" className="w-full p-2 text-xs border rounded mt-2" rows={2}></textarea></div>
              <div className="grid grid-cols-2 gap-6 bg-indigo-50/30 p-5 rounded-xl"><div><span className="text-xs font-black">Metodología GTC 45</span><div className="grid grid-cols-3 gap-2 mt-2"><select value={deficiencyLevel} onChange={e => setDeficiencyLevel(Number(e.target.value))} className="p-2 text-xs border rounded"><option value={10}>10 (Muy Alto)</option><option value={6}>6 (Alto)</option><option value={2}>2 (Medio)</option><option value={0}>0 (Bajo)</option></select><select value={exposureLevel} onChange={e => setExposureLevel(Number(e.target.value))} className="p-2 text-xs border rounded"><option value={4}>4 (Continua)</option><option value={3}>3 (Frecuente)</option><option value={2}>2 (Ocasional)</option><option value={1}>1 (Esporádica)</option></select><select value={consequenceLevel} onChange={e => setConsequenceLevel(Number(e.target.value))} className="p-2 text-xs border rounded"><option value={100}>100 (Mortal)</option><option value={60}>60 (Muy Grave)</option><option value={25}>25 (Grave)</option><option value={10}>10 (Leve)</option></select></div></div><div><span className="text-xs font-black">Cálculos</span><div className="grid grid-cols-2 gap-2 mt-2"><div className="bg-white p-2 rounded"><div className="text-[10px] uppercase">NP</div><div className="font-black">{calculatedProb}</div><div className="text-[9px]">{calculatedProbLabel}</div></div><div className="bg-white p-2 rounded"><div className="text-[10px] uppercase">NR</div><div className="font-black">{calculatedRisk}</div><div className="text-[9px]">Tier {calculatedTier}</div></div></div><div className="bg-white p-2 rounded mt-2 flex justify-between"><div><div className="text-[10px] uppercase">Aceptabilidad</div><div className="text-xs font-bold">{calculatedAcceptability}</div></div><div className={`px-2 py-1 rounded-full text-[10px] text-white ${calculatedTier === "I" ? "bg-red-500" : calculatedTier === "II" ? "bg-amber-500" : calculatedTier === "III" ? "bg-yellow-500 text-black" : "bg-emerald-500"}`}>Nivel {calculatedTier}</div></div></div></div>
              {/* SECCIÓN DE MEDIDAS DE CONTROL - INTERFAZ SOLICITADA */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-slate-800 block">Determinación de Medidas de Control sugeridas (SST)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="text-xs font-bold">Eliminación:</label><input type="text" value={elimination} onChange={e => setElimination(e.target.value)} placeholder="e.g. Quitar o suprimir la viga inservible." className="w-full p-2 text-xs border rounded" /></div>
                  <div><label className="text-xs font-bold">Sustitución:</label><input type="text" value={substitution} onChange={e => setSubstitution(e.target.value)} placeholder="e.g. Cambiar disolventes nocivos por acuosos." className="w-full p-2 text-xs border rounded" /></div>
                  <div><label className="text-xs font-bold">Controles de Ingeniería:</label><input type="text" value={engineeringControls} onChange={e => setEngineeringControls(e.target.value)} placeholder="e.g. Guardas de piezas mecánicas en movimiento." className="w-full p-2 text-xs border rounded" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold">Controles Administrativos / Señalización:</label><input type="text" value={administrativeControls} onChange={e => setAdministrativeControls(e.target.value)} placeholder="e.g. Señalética, inducción sst, rutinas de inspección." className="w-full p-2 text-xs border rounded" /></div>
                  <div><label className="text-xs font-bold">EPP y Colectivos de Protección general:</label><input type="text" value={eppControls} onChange={e => setEppControls(e.target.value)} placeholder="e.g. Casco de seguridad dialéctica marcas homologadas." className="w-full p-2 text-xs border rounded" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-indigo-900">Plan de Acción &amp; Seguimiento Sugerido:</label><input type="text" value={actionPlan} onChange={e => setActionPlan(e.target.value)} required placeholder="e.g. Reorganizar de inmediato, cotizar sonometría..." className="w-full p-2 bg-indigo-50/30 border rounded text-xs font-semibold" /></div>
                  <div><label className="text-xs font-bold">Estado de Seguimiento Inicial:</label><select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 text-xs border rounded"><option>Abierto</option><option>En Proceso</option><option>Cerrado</option></select></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded text-xs">Cancelar</button><button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded text-xs">{editingFinding ? "Guardar" : "Agregar a la Matriz GTC 45"}</button></div>
            </form>
          </div>
        </div>
      )}
      {isAICopierOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6"><h4 className="font-bold">Copiar Prompt e Importar Respuesta IA</h4><textarea value={externalAIInput} onChange={e => setExternalAIInput(e.target.value)} placeholder="Pega aquí la respuesta de la IA..." rows={6} className="w-full p-2 border rounded mt-2 text-xs"></textarea><div className="flex gap-2 mt-4"><button onClick={handleCopyAIPrompt} className="flex-1 bg-indigo-600 text-white py-2 rounded text-xs">📋 Copiar Prompt</button><button onClick={handleApplyExternalAI} className="flex-1 bg-emerald-600 text-white py-2 rounded text-xs">🔄 Aplicar Análisis</button><button onClick={() => setIsAICopierOpen(false)} className="flex-1 border py-2 rounded text-xs">Cancelar</button></div></div>
        </div>
      )}
    </div>
  );
}
