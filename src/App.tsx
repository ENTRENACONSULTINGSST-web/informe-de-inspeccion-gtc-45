import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";

interface Finding {
  id: string;
  inspector: string;
  date: string;
  location: string;
  technicalObservation: string;
  riskFactor: string;
  description: string;
  deficiencyLevel: number;
  exposureLevel: number;
  consequenceLevel: number;
  actionPlan: string;
  status: "Abierto" | "En Proceso" | "Cerrado";
}

const RISK_FACTORS = ["Biológico", "Físico", "Químico", "Psicosocial", "Biomecánico", "Condiciones de seguridad", "Fenómenos naturales"];

const INITIAL_FINDINGS: Finding[] = [
  {
    id: "1", inspector: "Carlos Restrepo", date: "2026-05-10",
    location: "Almacén Central", technicalObservation: "Estibamiento deficiente",
    riskFactor: "Condiciones de seguridad", description: "Cajas mal apiladas",
    deficiencyLevel: 6, exposureLevel: 3, consequenceLevel: 60,
    actionPlan: "Reorganizar estantes", status: "En Proceso"
  }
];

export default function App() {
  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem("gtc45_findings");
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inspector, setInspector] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [technicalObservation, setTechnicalObservation] = useState("");
  const [riskFactor, setRiskFactor] = useState(RISK_FACTORS[0]);
  const [description, setDescription] = useState("");
  const [deficiencyLevel, setDeficiencyLevel] = useState(2);
  const [exposureLevel, setExposureLevel] = useState(2);
  const [consequenceLevel, setConsequenceLevel] = useState(25);
  const [actionPlan, setActionPlan] = useState("");
  const [status, setStatus] = useState<"Abierto" | "En Proceso" | "Cerrado">("Abierto");

  useEffect(() => {
    localStorage.setItem("gtc45_findings", JSON.stringify(findings.slice(0, 30)));
  }, [findings]);

  const calculateRisk = () => {
    const prob = deficiencyLevel * exposureLevel;
    const risk = prob * consequenceLevel;
    return { prob, risk };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) { alert("Ingrese ubicación"); return; }
    if (!technicalObservation.trim()) { alert("Ingrese observación"); return; }
    if (!editingId && findings.length >= 30) { alert("Máximo 30 hallazgos"); return; }

    const { prob, risk } = calculateRisk();
    const newFinding: Finding = {
      id: editingId || Date.now().toString(),
      inspector: inspector || "Inspector SST",
      date, location, technicalObservation, riskFactor,
      description: description || technicalObservation,
      deficiencyLevel, exposureLevel, consequenceLevel,
      actionPlan: actionPlan || "Realizar seguimiento", status
    };

    if (editingId) {
      setFindings(findings.map(f => f.id === editingId ? newFinding : f));
      setEditingId(null);
    } else {
      setFindings([newFinding, ...findings]);
      confetti({ particleCount: 80, spread: 60 });
    }
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setInspector(""); setLocation(""); setTechnicalObservation("");
    setDescription(""); setDeficiencyLevel(2); setExposureLevel(2);
    setConsequenceLevel(25); setActionPlan(""); setStatus("Abierto");
  };

  const handleEdit = (f: Finding) => {
    setEditingId(f.id);
    setInspector(f.inspector); setDate(f.date); setLocation(f.location);
    setTechnicalObservation(f.technicalObservation); setRiskFactor(f.riskFactor);
    setDescription(f.description); setDeficiencyLevel(f.deficiencyLevel);
    setExposureLevel(f.exposureLevel); setConsequenceLevel(f.consequenceLevel);
    setActionPlan(f.actionPlan); setStatus(f.status);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar hallazgo?")) setFindings(findings.filter(f => f.id !== id));
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(findings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hallazgos");
    XLSX.writeFile(wb, `SST_GTC45_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert(`Exportados ${findings.length} hallazgos`);
  };

  const stats = { total: findings.length, abiertos: findings.filter(f => f.status === "Abierto").length };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-indigo-900 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h1 className="text-xl font-bold">Matriz de Riesgos SST GTC 45</h1>
          <div>
            <button onClick={exportExcel} className="bg-emerald-600 px-3 py-1 rounded mr-2">📊 Exportar</button>
            <button onClick={() => { resetForm(); setEditingId(null); setIsFormOpen(true); }} className="bg-white text-indigo-900 px-3 py-1 rounded">➕ Nuevo</button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-b-xl shadow mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-100 p-3 rounded text-center">
              <span className="text-2xl font-bold">{stats.total}</span>
              <p className="text-sm">Total Hallazgos</p>
            </div>
            <div className="bg-amber-100 p-3 rounded text-center">
              <span className="text-2xl font-bold">{stats.abiertos}</span>
              <p className="text-sm">Abiertos</p>
            </div>
          </div>
        </div>

        {findings.map(f => (
          <div key={f.id} className="bg-white p-4 rounded-xl shadow mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{f.location}</h3>
                <p className="text-sm text-gray-600">{f.riskFactor}</p>
                <p className="text-xs text-gray-500 mt-1">{f.description}</p>
                <p className="text-xs mt-2">📋 {f.actionPlan}</p>
              </div>
              <div>
                <button onClick={() => handleEdit(f)} className="text-blue-600 mr-2">✏️</button>
                <button onClick={() => handleDelete(f.id)} className="text-red-600">🗑️</button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">Fecha: {f.date} | Inspector: {f.inspector}</div>
          </div>
        ))}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingId ? "Editar" : "Nuevo"} Hallazgo</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <input className="w-full p-2 border rounded" placeholder="Ubicación *" value={location} onChange={e => setLocation(e.target.value)} required />
                <textarea className="w-full p-2 border rounded" placeholder="Observación *" value={technicalObservation} onChange={e => setTechnicalObservation(e.target.value)} required />
                <select className="w-full p-2 border rounded" value={riskFactor} onChange={e => setRiskFactor(e.target.value)}>
                  {RISK_FACTORS.map(f => <option key={f}>{f}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <select className="p-2 border rounded" value={deficiencyLevel} onChange={e => setDeficiencyLevel(Number(e.target.value))}>
                    <option value={10}>ND: Muy Alto</option><option value={6}>ND: Alto</option><option value={2}>ND: Medio</option><option value={0}>ND: Bajo</option>
                  </select>
                  <select className="p-2 border rounded" value={exposureLevel} onChange={e => setExposureLevel(Number(e.target.value))}>
                    <option value={4}>NE: Continua</option><option value={3}>NE: Frecuente</option><option value={2}>NE: Ocasional</option><option value={1}>NE: Esporádica</option>
                  </select>
                  <select className="p-2 border rounded" value={consequenceLevel} onChange={e => setConsequenceLevel(Number(e.target.value))}>
                    <option value={100}>NC: Mortal</option><option value={60}>NC: Muy Grave</option><option value={25}>NC: Grave</option><option value={10}>NC: Leve</option>
                  </select>
                </div>
                <input className="w-full p-2 border rounded" placeholder="Plan de acción" value={actionPlan} onChange={e => setActionPlan(e.target.value)} />
                <select className="w-full p-2 border rounded" value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option>Abierto</option><option>En Proceso</option><option>Cerrado</option>
                </select>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Guardar</button>
                <button type="button" onClick={() => setIsFormOpen(false)} className="w-full border py-2 rounded">Cancelar</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
