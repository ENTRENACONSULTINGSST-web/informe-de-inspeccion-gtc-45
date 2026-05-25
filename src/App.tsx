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
  "Biológico": ["Virus", "Bacterias", "Hongos", "Parásitos"],
  "Físico": ["Ruido", "Iluminación", "Vibración", "Temperaturas extremas"],
  "Químico": ["Polvos", "Gases", "Líquidos", "Vapores"],
  "Psicosocial": ["Estrés laboral", "Carga mental", "Jornada extensa"],
  "Biomecánico": ["Postura forzada", "Movimiento repetitivo", "Manipulación de cargas"],
  "Condiciones de seguridad": ["Mecánico", "Eléctrico", "Locativo", "Trabajo en alturas"],
  "Fenómenos naturales": ["Sismos", "Inundaciones", "Vendavales"]
};

const INITIAL_FINDINGS: Finding[] = [
  {
    id: "f-1", inspector: "Carlos Mario Restrepo", date: "2026-05-10",
    location: "Almacén Central - Bahía de Cargue",
    technicalObservation: "Estibamiento deficiente con cajas pesadas en tercer nivel sin barandilla",
    riskFactor: "Condiciones de seguridad", riskDetail: "Locativo",
    description: "Almacenamiento inestable a más de 3 metros con riesgo de caída de objetos",
    deficiencyLevel: 6, exposureLevel: 3, probabilityLevel: 18, probabilityLabel: "Alto",
    consequenceLevel: 60, riskLevelValue: 1080, riskTier: "I", riskAcceptability: "Inaceptable",
    engineeringControls: "Instalar mallas de contención",
    administrativeControls: "Capacitación en almacenamiento seguro",
    eppControls: "Casco y calzado de seguridad",
    actionPlan: "Reorganizar estantes", status: "En Proceso"
  },
  {
    id: "f-2", inspector: "Patricia Gómez", date: "2026-05-12",
    location: "Planta de Producción - Línea de Inyección",
    technicalObservation: "Ruido excesivo en máquina inyectora, operarios deben gritar",
    riskFactor: "Físico", riskDetail: "Ruido",
    description: "Exposición a niveles elevados de presión sonora",
    deficiencyLevel: 6, exposureLevel: 4, probabilityLevel: 24, probabilityLabel: "Muy Alto",
    consequenceLevel: 25, riskLevelValue: 600, riskTier: "I", riskAcceptability: "Inaceptable",
    engineeringControls: "Aislamiento acústico",
    administrativeControls: "Rotación de personal",
    eppControls: "Protectores auditivos",
    actionPlan: "Realizar sonometría", status: "Abierto"
  },
  {
    id: "f-3", inspector: "Carlos Mario Restrepo", date: "2026-05-15",
    location: "Oficinas Administrativas - Piso 2",
    technicalObservation: "Dolores lumbares frecuentes, sillas sin soporte lumbar",
    riskFactor: "Biomecánico", riskDetail: "Postura",
    description: "Posturas estáticas prolongadas con mobiliario no ergonómico",
    deficiencyLevel: 2, exposureLevel: 4, probabilityLevel: 8, probabilityLabel: "Medio",
    consequenceLevel: 10, riskLevelValue: 80, riskTier: "III", riskAcceptability: "Aceptable",
    engineeringControls: "Sillas ergonómicas",
    administrativeControls: "Pausas activas",
    actionPlan: "Capacitación en higiene postural", status: "Cerrado"
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { localStorage.setItem("gtc45_findings", JSON.stringify(findings.slice(0, 30))); }
    catch { console.error("Storage error"); }
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

  const handleImageUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.match("image.*")) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
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
      actionPlan: actionPlan || "Realizar seguimiento", status
    };

    if (editingFinding) {
      setFindings(findings.map(f => f.id === editingFinding.id ? findingData : f));
    } else {
      setFindings([findingData, ...findings]);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.85 } });
    }
    setIsFormOpen(false);
  };

  const generatedAIPrompt = "Analiza este hallazgo según GTC 45...";

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
      No: i + 1, ID: f.id, Fecha: f.date, Inspector: f.inspector,
      Ubicación: f.location, Observación: f.technicalObservation,
      Factor: f.riskFactor, ND: f.deficiencyLevel, NE: f.exposureLevel,
      NP: f.probabilityLevel, NC: f.consequenceLevel, NR: f.riskLevelValue,
      Tier: f.riskTier, Estado: f.status
    }));
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriz_GTC45");
    XLSX.writeFile(wb, `Matriz_SST_GTC45_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert(`Exportados ${findings.length} hallazgos`);
  };

  const stats = {
    total: findings.length,
    abiertos: findings.filter(f => f.status === "Abierto").length,
    cerrados: findings.filter(f => f.status === "Cerrado").length,
    criticos: findings.filter(f => f.riskTier === "I" || f.riskTier === "II").length,
  };

  const percentCerrados = stats.total > 0 ? Math.round((stats.cerrados / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-indigo-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2"><ClipboardCheck className="w-6 h-6" /><h1 className="font-bold text-lg">Matriz de Riesgos SST • GTC 45 Colombia</h1></div>
          <div><button onClick={exportToExcelGTC45} className="bg-emerald-600 px-3 py-1 rounded mr-2 text-sm">📊 Exportar Excel</button><button onClick={handleNewFindingClick} className="bg-white text-indigo-900 px-3 py-1 rounded text-sm">➕ Nuevo Hallazgo</button></div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 text-white p-4 rounded-xl"><div className="text-2xl font-bold">{stats.total}</div><div>Total Hallazgos</div><div className="mt-2 bg-indigo-950 rounded-full h-2"><div className="bg-emerald-400 rounded-full h-2" style={{ width: `${percentCerrados}%` }}></div></div><div className="text-xs mt-1">Progreso: {percentCerrados}%</div></div>
          <div className="bg-white p-4 rounded-xl shadow"><div className="text-2xl font-bold text-rose-600">{stats.criticos}</div><div>Críticos I y II</div></div>
          <div className="bg-white p-4 rounded-xl shadow"><div className="text-2xl font-bold text-amber-600">{stats.abiertos}</div><div>Abiertos</div></div>
          <div className="bg-white p-4 rounded-xl shadow"><div className="text-2xl font-bold text-emerald-600">{stats.cerrados}</div><div>Cerrados</div></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow mb-4"><Search className="inline w-4 h-4 mr-2" /><input type="text" placeholder="Buscar hallazgos..." className="w-full p-2 border rounded" onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {findings.filter(f => f.location.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
              <div key={f.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between"><div><h3 className="font-bold text-lg">{f.location}</h3><p className="text-indigo-600 text-sm">{f.riskFactor}</p><p className="text-sm text-slate-600 mt-1">{f.description}</p></div><div><button onClick={() => handleEditClick(f)} className="text-blue-600 mr-2">✏️</button><button onClick={() => handleDeleteClick(f.id)} className="text-red-600">🗑️</button></div></div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs mt-3"><div>ND: {f.deficiencyLevel}</div><div>NE: {f.exposureLevel}</div><div>NP: {f.probabilityLevel}</div><div>NR: {f.riskLevelValue}</div></div>
                <div className="text-xs text-slate-500 mt-2">Plan: {f.actionPlan}</div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow"><div className="flex items-center gap-2 text-indigo-600"><Sparkles className="w-5 h-5" /><h4 className="font-bold">Asistente IA GTC 45</h4></div><p className="text-xs text-slate-500 mt-2">Use IA externa para sugerir la clasificación del peligro</p><textarea className="w-full p-2 border rounded text-sm mt-3" rows={3} placeholder="Describe el hallazgo..." value={technicalObservation} onChange={e => setTechnicalObservation(e.target.value)}></textarea><button onClick={() => setIsAICopierOpen(true)} className="w-full bg-indigo-600 text-white py-2 rounded mt-3">🤖 Obtener Prompt IA</button></div>
          </div>
        </div>
      </main>
      {isFormOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"><h3 className="font-bold text-lg mb-4">{editingFinding ? "Editar" : "Nuevo"} Hallazgo</h3><form onSubmit={handleSaveFinding} className="space-y-3"><input className="w-full p-2 border rounded" placeholder="Ubicación" value={location} onChange={e => setLocation(e.target.value)} required /><textarea className="w-full p-2 border rounded" rows={3} placeholder="Observación técnica" value={technicalObservation} onChange={e => setTechnicalObservation(e.target.value)} required /><div className="border-2 border-dashed p-4 text-center cursor-pointer rounded" onClick={() => fileInputRef.current?.click()}><input type="file" ref={fileInputRef} onChange={handleImageUploaded} accept="image/*" className="hidden" />{isCompressing ? "🔄 Comprimiendo..." : imageUrl ? <img src={imageUrl} className="max-h-32 mx-auto" /> : "📸 Haga clic para subir foto"}</div><select className="w-full p-2 border rounded" value={riskFactor} onChange={e => handleRiskFactorChange(e.target.value)}>{Object.keys(RISK_FACTORS_MAP).map(f => <option key={f}>{f}</option>)}</select><div className="grid grid-cols-3 gap-2"><select className="p-2 border rounded" value={deficiencyLevel} onChange={e => setDeficiencyLevel(Number(e.target.value))}><option value={10}>ND: Muy Alto</option><option value={6}>ND: Alto</option><option value={2}>ND: Medio</option><option value={0}>ND: Bajo</option></select><select className="p-2 border rounded" value={exposureLevel} onChange={e => setExposureLevel(Number(e.target.value))}><option value={4}>NE: Continua</option><option value={3}>NE: Frecuente</option><option value={2}>NE: Ocasional</option><option value={1}>NE: Esporádica</option></select><select className="p-2 border rounded" value={consequenceLevel} onChange={e => setConsequenceLevel(Number(e.target.value))}><option value={100}>NC: Mortal</option><option value={60}>NC: Muy Grave</option><option value={25}>NC: Grave</option><option value={10}>NC: Leve</option></select></div><input className="w-full p-2 border rounded" placeholder="Plan de acción" value={actionPlan} onChange={e => setActionPlan(e.target.value)} /><button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Guardar</button><button type="button" onClick={() => setIsFormOpen(false)} className="w-full border py-2 rounded">Cancelar</button></form></div></div>}
      {isAICopierOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-xl p-6 max-w-2xl w-full"><h4 className="font-bold">Asistente IA</h4><textarea className="w-full p-2 border rounded mt-2" rows={6} placeholder="Pega respuesta IA aquí..." value={externalAIInput} onChange={e => setExternalAIInput(e.target.value)}></textarea><div className="flex gap-2 mt-4"><button onClick={handleCopyAIPrompt} className="flex-1 bg-indigo-600 text-white py-2 rounded">📋 Copiar Prompt</button><button onClick={handleApplyExternalAI} className="flex-1 bg-emerald-600 text-white py-2 rounded">🔄 Aplicar</button><button onClick={() => setIsAICopierOpen(false)} className="flex-1 border py-2 rounded">Cancelar</button></div></div></div>}
    </div>
  );
}
