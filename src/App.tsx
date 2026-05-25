import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, Download, Sparkles, Copy, Check, AlertTriangle, 
  Search, Filter, BookOpen, RefreshCw, PlusCircle, User, Calendar, 
  MapPin, ClipboardCheck, BrainCircuit, ExternalLink, Table
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
  status: '"'"'Abierto'"'"' | '"'"'En Proceso'"'"' | '"'"'Cerrado'"'"';
}

const RISK_FACTORS_MAP: Record<string, string[]> = {
  "Biológico": ["Virus", "Bacterias", "Hongos", "Parásitos"],
  "Físico": ["Ruido", "Iluminación", "Vibración", "Temperaturas extremas"],
  "Químico": ["Polvos", "Fibras", "Líquidos", "Gases y Vapores"],
  "Psicosocial": ["Gestión organizacional", "Carga mental", "Jornada laboral"],
  "Biomecánico": ["Postura", "Esfuerzo muscular", "Movimiento repetitivo", "Manipulación de cargas"],
  "Condiciones de seguridad": ["Mecánico", "Eléctrico", "Locativo", "Trabajo en alturas"],
  "Fenómenos naturales": ["Sismos", "Inundaciones", "Vendavales"]
};

const INITIAL_FINDINGS: Finding[] = [
  {
    id: "f-1", inspector: "Carlos Mario Restrepo", date: "2026-05-10",
    location: "Almacén Central", technicalObservation: "Estibamiento deficiente",
    riskFactor: "Condiciones de seguridad", riskDetail: "Locativo",
    description: "Almacenamiento inestable a más de 3 metros",
    deficiencyLevel: 6, exposureLevel: 3, probabilityLevel: 18, probabilityLabel: "Alto",
    consequenceLevel: 60, riskLevelValue: 1080, riskTier: "I", riskAcceptability: "Inaceptable",
    engineeringControls: "Instalar mallas de contención",
    administrativeControls: "Capacitación en almacenamiento",
    eppControls: "Casco y calzado de seguridad",
    actionPlan: "Reorganizar estantes", status: "En Proceso"
  },
  {
    id: "f-2", inspector: "Patricia Gómez", date: "2026-05-12",
    location: "Planta Producción", technicalObservation: "Ruido excesivo",
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
    location: "Oficinas", technicalObservation: "Dolores lumbares",
    riskFactor: "Biomecánico", riskDetail: "Postura",
    description: "Posturas estáticas prolongadas",
    deficiencyLevel: 2, exposureLevel: 4, probabilityLevel: 8, probabilityLabel: "Medio",
    consequenceLevel: 10, riskLevelValue: 80, riskTier: "III", riskAcceptability: "Aceptable",
    engineeringControls: "Sillas ergonómicas",
    administrativeControls: "Pausas activas",
    actionPlan: "Capacitación en higiene postural", status: "Cerrado"
  }
];

export default function App() {
  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem('"'"'gtc45_findings'"'"');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [searchTerm, setSearchTerm] = useState('"'"'"'"');
  const [factorFilter, setFactorFilter] = useState('"'"'Todos'"'"');
  const [tierFilter, setTierFilter] = useState('"'"'Todos'"'"');
  const [statusFilter, setStatusFilter] = useState('"'"'Todos'"'"');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [inspector, setInspector] = useState('"'"'"'"');
  const [date, setDate] = useState(() => new Date().toISOString().split('"'"'T'"'"')[0]);
  const [location, setLocation] = useState('"'"'"'"');
  const [technicalObservation, setTechnicalObservation] = useState('"'"'"'"');
  const [imageUrl, setImageUrl] = useState('"'"'"'"');
  const [riskFactor, setRiskFactor] = useState('"'"'"'"');
  const [riskDetail, setRiskDetail] = useState('"'"'"'"');
  const [description, setDescription] = useState('"'"'"'"');
  const [deficiencyLevel, setDeficiencyLevel] = useState<number>(2);
  const [exposureLevel, setExposureLevel] = useState<number>(2);
  const [consequenceLevel, setConsequenceLevel] = useState<number>(25);
  const [elimination, setElimination] = useState('"'"'"'"');
  const [substitution, setSubstitution] = useState('"'"'"'"');
  const [engineeringControls, setEngineeringControls] = useState('"'"'"'"');
  const [administrativeControls, setAdministrativeControls] = useState('"'"'"'"');
  const [eppControls, setEppControls] = useState('"'"'"'"');
  const [actionPlan, setActionPlan] = useState('"'"'"'"');
  const [status, setStatus] = useState<'Abierto' | 'En Proceso' | 'Cerrado'>('"'"'Abierto'"'"');
  const [isAICopierOpen, setIsAICopierOpen] = useState(false);
  const [externalAIInput, setExternalAIInput] = useState('"'"'"'"');
  const [copiedPromptStatus, setCopiedPromptStatus] = useState(false);
  const [calculatedProb, setCalculatedProb] = useState(4);
  const [calculatedProbLabel, setCalculatedProbLabel] = useState('"'"'Bajo'"'"');
  const [calculatedRisk, setCalculatedRisk] = useState(100);
  const [calculatedTier, setCalculatedTier] = useState('"'"'III'"'"');
  const [calculatedAcceptability, setCalculatedAcceptability] = useState('"'"'Aceptable'"'"');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const findingsToSave = findings.slice(0, 30);
      localStorage.setItem('"'"'gtc45_findings'"'"', JSON.stringify(findingsToSave));
    } catch (error) {
      console.error('"'"'Error al guardar:'"'"', error);
      if (error instanceof DOMException && error.name === '"'"'QuotaExceededError'"'"') {
        const findingsWithoutImages = findings.map(f => ({ ...f, imageUrl: undefined }));
        localStorage.setItem('"'"'gtc45_findings'"'"', JSON.stringify(findingsWithoutImages.slice(0, 30)));
        alert('"'"'Las imágenes se eliminaron por exceder el límite de almacenamiento.'"'"');
      }
    }
  }, [findings]);

  useEffect(() => {
    const np = deficiencyLevel * exposureLevel;
    setCalculatedProb(np);
    let label = '"'"'Bajo'"'"';
    if (np >= 24 && np <= 40) label = '"'"'Muy Alto (MA)'"'"';
    else if (np >= 10 && np <= 20) label = '"'"'Alto (A)'"'"';
    else if (np >= 6 && np <= 8) label = '"'"'Medio (M)'"'"';
    setCalculatedProbLabel(label);
    const nr = np * consequenceLevel;
    setCalculatedRisk(nr);
    let tier = '"'"'IV'"'"', acceptability = '"'"'Aceptable'"'"';
    if (nr >= 600 && nr <= 4000) { tier = '"'"'I'"'"'; acceptability = '"'"'Inaceptable'"'"'; }
    else if (nr >= 120 && nr <= 500) { tier = '"'"'II'"'"'; acceptability = '"'"'Inaceptable o Aceptable con control específico'"'"'; }
    else if (nr >= 50 && nr <= 100) { tier = '"'"'III'"'"'; acceptability = '"'"'Aceptable'"'"'; }
    setCalculatedTier(tier);
    setCalculatedAcceptability(acceptability);
  }, [deficiencyLevel, exposureLevel, consequenceLevel]);

  const handleRiskFactorChange = (f: string) => {
    setRiskFactor(f);
    setRiskDetail(RISK_FACTORS_MAP[f]?.[0] || '"'"'"'"');
  };

  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => { if (event.target?.result) setImageUrl(event.target.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleNewFindingClick = () => {
    setEditingFinding(null);
    setInspector('"'"'Ing. Inspector de Seguridad'"'"');
    setDate(new Date().toISOString().split('"'"'T'"'"')[0]);
    setLocation('"'"'"'"');
    setTechnicalObservation('"'"'"'"');
    setImageUrl('"'"'"'"');
    setRiskFactor(Object.keys(RISK_FACTORS_MAP)[0]);
    setRiskDetail(RISK_FACTORS_MAP[Object.keys(RISK_FACTORS_MAP)[0]][0]);
    setDescription('"'"'"'"');
    setDeficiencyLevel(6);
    setExposureLevel(3);
    setConsequenceLevel(25);
    setElimination('"'"'"'"');
    setSubstitution('"'"'"'"');
    setEngineeringControls('"'"'"'"');
    setAdministrativeControls('"'"'"'"');
    setEppControls('"'"'"'"');
    setActionPlan('"'"'"'"');
    setStatus('"'"'Abierto'"'"');
    setIsFormOpen(true);
  };

  const handleEditClick = (f: Finding) => {
    setEditingFinding(f);
    setInspector(f.inspector);
    setDate(f.date);
    setLocation(f.location);
    setTechnicalObservation(f.technicalObservation);
    setImageUrl(f.imageUrl || '"'"'"'"');
    setRiskFactor(f.riskFactor);
    setRiskDetail(f.riskDetail);
    setDescription(f.description);
    setDeficiencyLevel(f.deficiencyLevel);
    setExposureLevel(f.exposureLevel);
    setConsequenceLevel(f.consequenceLevel);
    setElimination(f.elimination || '"'"'"'"');
    setSubstitution(f.substitution || '"'"'"'"');
    setEngineeringControls(f.engineeringControls || '"'"'"'"');
    setAdministrativeControls(f.administrativeControls || '"'"'"'"');
    setEppControls(f.eppControls || '"'"'"'"');
    setActionPlan(f.actionPlan);
    setStatus(f.status);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('"'"'¿Está seguro de eliminar este hallazgo?'"'"')) {
      setFindings(findings.filter(f => f.id !== id));
    }
  };

  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) { alert('"'"'Ingrese la ubicación'"'"'); return; }
    if (!technicalObservation.trim()) { alert('"'"'Ingrese la observación técnica'"'"'); return; }
    if (!editingFinding && findings.length >= 30) {
      alert('"'"'Límite máximo de 30 hallazgos alcanzado'"'"');
      return;
    }
    const findingData: Finding = {
      id: editingFinding ? editingFinding.id : `f-${Date.now()}`,
      inspector: inspector || '"'"'Inspector SST'"'"',
      date: date || new Date().toISOString().split('"'"'T'"'"')[0],
      location, imageUrl: imageUrl || undefined, technicalObservation,
      riskFactor, riskDetail, description: description || technicalObservation,
      deficiencyLevel, exposureLevel, probabilityLevel: calculatedProb,
      probabilityLabel: calculatedProbLabel, consequenceLevel,
      riskLevelValue: calculatedRisk, riskTier: calculatedTier,
      riskAcceptability: calculatedAcceptability, elimination, substitution,
      engineeringControls, administrativeControls, eppControls,
      actionPlan: actionPlan || '"'"'Realizar inspección periódica'"'"', status
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
    if (!externalAIInput.trim()) { alert('"'"'Pega el resultado de la IA'"'"'); return; }
    try {
      const startIdx = externalAIInput.indexOf('"'"'{'"'"');
      const endIdx = externalAIInput.lastIndexOf('"'"'}'"'"');
      let parsedData: any = {};
      if (startIdx !== -1 && endIdx !== -1) {
        parsedData = JSON.parse(externalAIInput.substring(startIdx, endIdx + 1));
      }
      if (parsedData.riskFactor) setRiskFactor(parsedData.riskFactor);
      if (parsedData.riskDetail) setRiskDetail(parsedData.riskDetail);
      if (parsedData.description) setDescription(parsedData.description);
      if (typeof parsedData.deficiencyLevel === '"'"'number'"'"' && [10, 6, 2, 0].includes(parsedData.deficiencyLevel)) setDeficiencyLevel(parsedData.deficiencyLevel);
      if (typeof parsedData.exposureLevel === '"'"'number'"'"' && [4, 3, 2, 1].includes(parsedData.exposureLevel)) setExposureLevel(parsedData.exposureLevel);
      if (typeof parsedData.consequenceLevel === '"'"'number'"'"' && [100, 60, 25, 10].includes(parsedData.consequenceLevel)) setConsequenceLevel(parsedData.consequenceLevel);
      if (parsedData.elimination) setElimination(parsedData.elimination);
      if (parsedData.substitution) setSubstitution(parsedData.substitution);
      if (parsedData.engineeringControls) setEngineeringControls(parsedData.engineeringControls);
      if (parsedData.administrativeControls) setAdministrativeControls(parsedData.administrativeControls);
      if (parsedData.eppControls) setEppControls(parsedData.eppControls);
      if (parsedData.actionPlan) setActionPlan(parsedData.actionPlan);
      confetti({ particleCount: 40, spread: 30, origin: { y: 0.5 } });
      setExternalAIInput('"'"'"'"');
      setIsAICopierOpen(false);
      alert('"'"'¡Análisis integrado con éxito!'"'"');
    } catch (e) {
      alert('"'"'No se pudo interpretar la respuesta de la IA'"'"');
    }
  };

  const exportToExcelGTC45 = () => {
    const tableData = findings.map((f, i) => ({
      '"'"'No.'"'"': i + 1, '"'"'ID'"'"': f.id, '"'"'Fecha'"'"': f.date,
      '"'"'Inspector'"'"': f.inspector, '"'"'Ubicación'"'"': f.location,
      '"'"'Observación'"'"': f.technicalObservation, '"'"'Factor'"'"': f.riskFactor,
      '"'"'ND'"'"': f.deficiencyLevel, '"'"'NE'"'"': f.exposureLevel,
      '"'"'NP'"'"': f.probabilityLevel, '"'"'NC'"'"': f.consequenceLevel,
      '"'"'NR'"'"': f.riskLevelValue, '"'"'Tier'"'"': f.riskTier,
      '"'"'Estado'"'"': f.status
    }));
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '"'"'Matriz_GTC45'"'"');
    XLSX.writeFile(wb, `Matriz_SST_GTC45_${new Date().toISOString().split('"'"'T'"'"')[0]}.xlsx`);
    alert(`✅ Exportados ${findings.length} hallazgos`);
  };

  const stats = {
    total: findings.length,
    abiertos: findings.filter(f => f.status === '"'"'Abierto'"'"').length,
    enProceso: findings.filter(f => f.status === '"'"'En Proceso'"'"').length,
    cerrados: findings.filter(f => f.status === '"'"'Cerrado'"'"').length,
    criticos: findings.filter(f => f.riskTier === '"'"'I'"'"' || f.riskTier === '"'"'II'"'"').length,
  };

  const filteredFindings = findings.filter(f => {
    const textToSearch = `${f.location} ${f.technicalObservation} ${f.riskFactor}`.toLowerCase();
    const matchesSearch = textToSearch.includes(searchTerm.toLowerCase());
    const matchesFactor = factorFilter === '"'"'Todos'"'"' || f.riskFactor === factorFilter;
    const matchesTier = tierFilter === '"'"'Todos'"'"' || f.riskTier === tierFilter;
    const matchesStatus = statusFilter === '"'"'Todos'"'"' || f.status === statusFilter;
    return matchesSearch && matchesFactor && matchesTier && matchesStatus;
  });

  const percentCerrados = stats.total > 0 ? Math.round((stats.cerrados / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 bg-indigo-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardCheck className="w-6 h-6" />
            <h1 className="font-bold text-lg">Matriz de Riesgos SST GTC 45</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={exportToExcelGTC45} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 rounded-md">
              <Download className="w-4 h-4 inline mr-1" /> Exportar Excel
            </button>
            <button onClick={handleNewFindingClick} className="px-4 py-2 text-xs font-bold bg-white text-indigo-900 rounded-md">
              <Plus className="w-4 h-4 inline mr-1" /> Nuevo Hallazgo
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-indigo-800 to-indigo-950 text-white p-6 rounded-2xl">
            <h2 className="text-2xl font-black">Portal SST</h2>
            <p className="text-sm">GTC 45 Colombia</p>
            <div className="mt-4">
              <p className="text-xs">{percentCerrados}% de Peligros Resueltos</p>
              <div className="w-full bg-indigo-950 h-2 rounded-full mt-1"><div className="bg-emerald-400 h-full rounded-full" style={{ width: `${percentCerrados}%` }}></div></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl"><span className="text-3xl font-black">{stats.total}</span><p className="text-xs">Total Hallazgos</p></div>
          <div className="bg-white p-5 rounded-2xl"><span className="text-3xl font-black text-rose-600">{stats.criticos}</span><p className="text-xs">Críticos I y II</p></div>
          <div className="bg-white p-5 rounded-2xl"><span className="text-2xl font-bold">{stats.abiertos}</span><p className="text-xs">Abiertos</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl mb-6">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="w-full p-2 border rounded-lg" />
        </div>
        <div className="space-y-4">
          {filteredFindings.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border p-5">
              <div className="flex justify-between items-start">
                <div><h3 className="font-bold">{f.location}</h3><p className="text-sm text-slate-500">{f.riskFactor} - {f.riskDetail}</p></div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditClick(f)}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteClick(f.id)}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm mt-2">{f.description}</p>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
                <div>ND: {f.deficiencyLevel}</div><div>NE: {f.exposureLevel}</div><div>NP: {f.probabilityLevel}</div><div>NR: {f.riskLevelValue}</div>
              </div>
              <div className="mt-2 text-xs text-slate-500">Plan: {f.actionPlan}</div>
            </div>
          ))}
        </div>
      </main>
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-bold text-lg mb-4">{editingFinding ? '"'"'Editar'"'"' : '"'"'Nuevo Hallazgo'"'"'}</h3>
            <form onSubmit={handleSaveFinding} className="space-y-4">
              <input type="text" placeholder="Ubicación" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 border rounded" required />
              <textarea placeholder="Observación técnica" value={technicalObservation} onChange={(e) => setTechnicalObservation(e.target.value)} className="w-full p-2 border rounded" rows={3} required></textarea>
              <select value={riskFactor} onChange={(e) => handleRiskFactorChange(e.target.value)} className="w-full p-2 border rounded">
                {Object.keys(RISK_FACTORS_MAP).map(f => <option key={f}>{f}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <select value={deficiencyLevel} onChange={(e) => setDeficiencyLevel(Number(e.target.value))} className="p-2 border rounded"><option value={10}>ND: Muy Alto</option><option value={6}>ND: Alto</option><option value={2}>ND: Medio</option><option value={0}>ND: Bajo</option></select>
                <select value={exposureLevel} onChange={(e) => setExposureLevel(Number(e.target.value))} className="p-2 border rounded"><option value={4}>NE: Continua</option><option value={3}>NE: Frecuente</option><option value={2}>NE: Ocasional</option><option value={1}>NE: Esporádica</option></select>
                <select value={consequenceLevel} onChange={(e) => setConsequenceLevel(Number(e.target.value))} className="p-2 border rounded"><option value={100}>NC: Mortal</option><option value={60}>NC: Muy Grave</option><option value={25}>NC: Grave</option><option value={10}>NC: Leve</option></select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg">Guardar</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="w-full border py-2 rounded-lg">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
