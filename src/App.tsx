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
      if (saved && Array.isArray(JSON.parse(saved))) {
        return JSON.parse(saved);
      }
    } catch (err) {}
    return INITIAL_FINDINGS;
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
      setStorageError(null);
      const dataStr = JSON.stringify(findings);
      const bytes = dataStr.length * 2;
      const kb = Math.round((bytes / 1024) * 10) / 10;
      const pct = Math.min(Math.round((kb / 5120) * 100), 100);
      setStorageUsage({ usedKB: kb, percentage: pct });
    } catch (err: any) {
      if (err.name === "QuotaExceededError") {
        setStorageError("Almacenamiento lleno. Exporte backup JSON y elimine hallazgos.");
      }
    }
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
      } catch (err) {
        console.error(err);
      } finally {
        setIsCompressing(false);
      }
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
    if (!editingFinding && findings.length >= 30) {
      alert("Límite máximo de 30 hallazgos alcanzado");
      return;
    }
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
    } catch (e) {
      alert("No se pudo interpretar la respuesta");
    }
  };

  const exportToExcelGTC45 = () => {
    const tableData = findings.map((f, i) => ({
      "ID Hallazgo": f.id, "Consecutivo": i + 1, "Fecha": f.date,
      "Inspector": f.inspector, "Ubicación": f.location,
      "Descripción": f.description, "Factor Riesgo": f.riskFactor,
      "ND": f.deficiencyLevel, "NE": f.exposureLevel, "NP": f.probabilityLevel,
      "NC": f.consequenceLevel, "NR": f.riskLevelValue, "Tier": f.riskTier,
      "Aceptabilidad": f.riskAcceptability, "Plan Acción": f.actionPlan, "Estado": f.status
    }));
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriz SST GTC 45");
    XLSX.writeFile(wb, `Matriz_SST_GTC45_${new Date().toISOString().split("T")[0]}.xlsx`);
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
            alert("Backup restaurado con éxito");
          }
        } catch (err) {
          alert("Archivo inválido");
        }
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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 bg-indigo-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardCheck className="w-6 h-6" />
            <h1 className="font-bold text-lg">Matriz de Riesgos SST • GTC 45 Colombia</h1>
          </div>
          <div className="flex space-x-2">
            <button onClick={exportToExcelGTC45} className="bg-emerald-600 px-3 py-1.5 text-xs rounded">📊 Exportar Excel</button>
            <button onClick={handleNewFindingClick} className="bg-white text-indigo-900 px-3 py-1.5 text-xs rounded">➕ Nuevo Hallazgo</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 bg-indigo-800 text-white p-5 rounded-xl">
            <h2 className="text-xl font-bold">Portal SST GTC 45</h2>
            <p className="text-sm">Clasificación y control de riesgos laborales</p>
            <div className="mt-3"><p className="text-xs">Progreso: {percentCerrados}%</p><div className="bg-indigo-950 h-2 rounded-full"><div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${percentCerrados}%` }}></div></div></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow"><span className="text-2xl font-bold">{stats.total}</span><p className="text-xs">Total Hallazgos</p></div>
          <div className="bg-white p-4 rounded-xl shadow"><span className="text-2xl font-bold text-rose-600">{stats.criticos}</span><p className="text-xs">Críticos I y II</p></div>
          <div className="bg-white p-4 rounded-xl shadow"><span className="text-2xl font-bold text-amber-600">{stats.abiertos}</span><p className="text-xs">Abiertos</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow"><Search className="inline w-4 h-4 mr-2" /><input type="text" placeholder="Buscar..." className="w-full p-2 border rounded" onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredFindings.map(f => (
              <div key={f.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between"><div><h3 className="font-bold">{f.location}</h3><p className="text-indigo-600 text-sm">{f.riskFactor}</p><p className="text-sm mt-1">{f.description}</p></div><div><button onClick={() => handleEditClick(f)} className="text-blue-600 mr-2">✏️</button><button onClick={() => handleDeleteClick(f.id)} className="text-red-600">🗑️</button></div></div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs mt-3"><div>ND: {f.deficiencyLevel}</div><div>NE: {f.exposureLevel}</div><div>NP: {f.probabilityLevel}</div><div>NR: {f.riskLevelValue}</div></div>
                <div className="text-xs text-slate-500 mt-2">Plan: {f.actionPlan}</div>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl shadow"><Sparkles className="text-indigo-600 w-5 h-5 mb-2" /><h4 className="font-bold">Asistente IA</h4><textarea className="w-full p-2 border rounded text-sm mt-2" rows={3} placeholder="Describe el hallazgo..." value={technicalObservation} onChange={e => setTechnicalObservation(e.target.value)}></textarea><button onClick={() => setIsAICopierOpen(true)} className="w-full bg-indigo-600 text-white py-2 rounded mt-2">🤖 Obtener Prompt</button></div>
            <div className="bg-slate-950 text-white p-5 rounded-xl"><Database className="w-5 h-5 mb-2" /><h4 className="font-bold">Almacenamiento</h4><div className="text-xs mt-2">Uso: {storageUsage.usedKB} KB / 5120 KB ({storageUsage.percentage}%)</div><div className="bg-slate-800 h-2 rounded-full mt-1"><div className={`h-2 rounded-full ${storageUsage.percentage > 75 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${storageUsage.percentage}%` }}></div></div><div className="grid grid-cols-2 gap-2 mt-3"><button onClick={exportBackupJSON} className="bg-slate-800 text-indigo-300 py-1.5 text-xs rounded">💾 Backup JSON</button><button onClick={() => fileImportInputRef.current?.click()} className="bg-indigo-600 py-1.5 text-xs rounded">📂 Restaurar</button><input type="file" ref={fileImportInputRef} onChange={handleImportBackupJSON} accept=".json" className="hidden" /></div></div>
          </div>
        </div>
      </main>
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h3 className="font-bold text-lg mb-4">{editingFinding ? "Editar" : "Nuevo"} Hallazgo</h3>
            <form onSubmit={handleSaveFinding} className="space-y-3">
              <input className="w-full p-2 border rounded" placeholder="Ubicación" value={location} onChange={e => setLocation(e.target.value)} required />
              <textarea className="w-full p-2 border rounded" rows={3} placeholder="Observación" value={technicalObservation} onChange={e => setTechnicalObservation(e.target.value)} required />
              <div className="border-2 border-dashed p-4 text-center cursor-pointer rounded" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} onChange={handleImageUploaded} accept="image/*" className="hidden" />
                {isCompressing ? "🔄 Comprimiendo..." : imageUrl ? "✅ Imagen cargada" : "📸 Clic para subir foto"}
              </div>
              <select className="w-full p-2 border rounded" value={riskFactor} onChange={e => handleRiskFactorChange(e.target.value)}>
                {Object.keys(RISK_FACTORS_MAP).map(f => <option key={f}>{f}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <select className="p-2 border rounded" value={deficiencyLevel} onChange={e => setDeficiencyLevel(Number(e.target.value))}><option value={10}>ND: Muy Alto</option><option value={6}>ND: Alto</option><option value={2}>ND: Medio</option><option value={0}>ND: Bajo</option></select>
                <select className="p-2 border rounded" value={exposureLevel} onChange={e => setExposureLevel(Number(e.target.value))}><option value={4}>NE: Continua</option><option value={3}>NE: Frecuente</option><option value={2}>NE: Ocasional</option><option value={1}>NE: Esporádica</option></select>
                <select className="p-2 border rounded" value={consequenceLevel} onChange={e => setConsequenceLevel(Number(e.target.value))}><option value={100}>NC: Mortal</option><option value={60}>NC: Muy Grave</option><option value={25}>NC: Grave</option><option value={10}>NC: Leve</option></select>
              </div>
              <input className="w-full p-2 border rounded" placeholder="Plan de acción" value={actionPlan} onChange={e => setActionPlan(e.target.value)} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Guardar</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="w-full border py-2 rounded">Cancelar</button>
            </form>
          </div>
        </div>
      )}
      {isAICopierOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h4 className="font-bold">Asistente IA</h4>
            <textarea className="w-full p-2 border rounded mt-2" rows={6} placeholder="Pega respuesta IA aquí..." value={externalAIInput} onChange={e => setExternalAIInput(e.target.value)}></textarea>
            <div className="flex gap-2 mt-4"><button onClick={handleCopyAIPrompt} className="flex-1 bg-indigo-600 text-white py-2 rounded">Copiar Prompt</button><button onClick={handleApplyExternalAI} className="flex-1 bg-emerald-600 text-white py-2 rounded">Aplicar</button><button onClick={() => setIsAICopierOpen(false)} className="flex-1 border py-2 rounded">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
