import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  Filter, 
  BookOpen, 
  ArrowRight, 
  RefreshCw, 
  PlusCircle, 
  Compass, 
  User, 
  Calendar, 
  MapPin, 
  ClipboardCheck, 
  BrainCircuit, 
  ExternalLink,
  Table,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';

// Types representing a GTC 45 SST Hazard Finding
interface Finding {
  id: string;
  inspector: string;
  date: string;
  location: string;
  imageUrl?: string;
  technicalObservation: string;
  
  // Danger Classification GTC 45
  riskFactor: string; // e.g. Biomecánico, Condiciones de Seguridad, Físico, etc.
  riskDetail: string;  // e.g. Posturas forzadas, Eléctrico, Ruido, etc.
  description: string; // AI generated or self-edited detail
  
  // GTC 45 Matrices Math
  deficiencyLevel: number; // ND (0, 2, 6, 10)
  exposureLevel: number;   // NE (1, 2, 3, 4)
  probabilityLevel: number; // NP = ND * NE
  probabilityLabel: string; // Muy Alto (MA), Alto (A), Medio (M), Bajo (B)
  consequenceLevel: number; // NC (10, 25, 60, 100)
  riskLevelValue: number;   // NR = NP * NC
  riskTier: string;        // I, II, III, IV
  riskAcceptability: string; // Inaceptable, Aceptable con control específico, Aceptable, etc.
  
  // Controls & Intervention Measures
  elimination?: string;
  substitution?: string;
  engineeringControls?: string;
  administrativeControls?: string;
  eppControls?: string; // Equipos de Protección Personal
  
  actionPlan: string;
  status: 'Abierto' | 'En Proceso' | 'Cerrado';
}

// Danger guide and options configuration based on GTC 45
const RISK_FACTORS_MAP: Record<string, string[]> = {
  "Biológico": ["Virus (e.g. Influenza, COVID-19)", "Bacterias", "Hongos", "Rickettsias", "Parásitos", "Picaduras", "Mordeduras", "Fluidos o Excrementos"],
  "Físico": ["Ruido (continuo, intermitente, de impacto)", "Iluminación (deficiente o de exceso)", "Vibración (cuerpo entero, segmentaria)", "Temperaturas extremas (calor o frío)", "Presión atmosférica (normal o ajustada)", "Radiaciones ionizantes (Rayos X, gama, etc.)", "Radiaciones no ionizantes (Láser, UV, infrarroja, RF)"],
  "Químico": ["Polvos orgánicos o inorgánicos", "Fibras", "Líquidos (nieblas, rocíos)", "Gases y Vapores", "Humos metálicos, no metálicos", "Material particulado"],
  "Psicosocial": ["Gestión organizacional (estilo mando, pago, etc.)", "Características del grupo social de trabajo", "Condiciones de la tarea (carga mental, contenido)", "Interfase persona-tarea (conocimientos, tecnología)", "Jornación de trabajo (turnos, rotación, extras)"],
  "Biomecánico": ["Postura (prolongada, mantenida, forzada, antigravitacional)", "Esfuerzo muscular extremo", "Movimiento repetitivo (miembros superiores)", "Manipulación manual de cargas"],
  "Condiciones de seguridad": ["Mecánico (máquinas, herramientas, piezas a trabajar)", "Eléctrico (alta y baja tensión, estática)", "Locativo (sistemas y medios de almacenamiento, orden)", "Tecnológico (explosión, fuga, derrame, incendio)", "Accidentes de tránsito", "Públicos (robos, atracos, asaltos, orden público)", "Trabajo en alturas", "Espacios confinados"],
  "Fenómenos naturales": ["Sismos / Terremotos", "Vendavales", "Inundaciones", "Derrumbes", "Precipitaciones (lluvias, granizadas)"]
};

// Initial realistic Colombian SST Inspection data
const INITIAL_FINDINGS: Finding[] = [
  {
    id: "f-1",
    inspector: "Carlos Mario Restrepo",
    date: "2026-05-10",
    location: "Almacén Central - Bahía de Cargue",
    technicalObservation: "Se observa estibamiento deficiente con cajas pesadas en el tercer nivel del estante sin barandilla de contención ni amarre.",
    riskFactor: "Condiciones de seguridad",
    riskDetail: "Locativo (sistemas y medios de almacenamiento, orden)",
    description: "Almacenamiento de mercancía inestable a más de 3 metros de altura con potencial de caída de objetos pesados sobre personal transitable.",
    deficiencyLevel: 6,
    exposureLevel: 3,
    probabilityLevel: 18,
    probabilityLabel: "Alto",
    consequenceLevel: 60,
    riskLevelValue: 1080,
    riskTier: "I",
    riskAcceptability: "Inaceptable",
    engineeringControls: "Instalar malla de contención y barandillas frontales de contención en racks elevados.",
    administrativeControls: "Capacitación en técnicas seguras de almacenamiento y demarcación de línea de seguridad en piso.",
    eppControls: "Obligatoriedad de uso de casco y calzado de seguridad con punta de acero en la zona.",
    actionPlan: "Reorganizar estantes de inmediato ubicando cargas más pesadas en niveles inferiores y colocar mallas.",
    status: "En Proceso"
  },
  {
    id: "f-2",
    inspector: "Patricia Gómez",
    date: "2026-05-12",
    location: "Planta de Producción - Línea de Inyección",
    technicalObservation: "Niveles de ruido medidos de manera cualitativa muy altos en máquina inyectora #4. Los operarios deben gritar para comunicarse a menos de 1 metro.",
    riskFactor: "Físico",
    riskDetail: "Ruido (continuo, intermitente, de impacto)",
    description: "Exposición ocupacional a niveles elevados de presión sonora generados por el motor de inyectora plástica.",
    deficiencyLevel: 6,
    exposureLevel: 4,
    probabilityLevel: 24,
    probabilityLabel: "Muy Alto",
    consequenceLevel: 25,
    riskLevelValue: 600,
    riskTier: "I",
    riskAcceptability: "Inaceptable",
    engineeringControls: "Aislamiento acústico de la bomba hidráulica de la inyectora #4 mediante cabina modular.",
    administrativeControls: "Rotación de turnos del personal y señalización de área de uso obligatorio de protección auditiva.",
    eppControls: "Suministrar e inspeccionar protectores auditivos de tipo copa con atenuación superior a 25dB.",
    actionPlan: "Realizar sonometría oficial en el área y suministrar protectores auditivos de doble protección si es necesario.",
    status: "Abierto"
  },
  {
    id: "f-3",
    inspector: "Carlos Mario Restrepo",
    date: "2026-05-15",
    location: "Oficinas Administrativas - Piso 2",
    technicalObservation: "Personal de call center manifiesta dolores lumbares frecuentes. Sillas de oficina no tienen soporte lumbar ajustable ni apoyabrazos regulables.",
    riskFactor: "Biomecánico",
    riskDetail: "Postura (prolongada, mantenida, forzada, antigravitacional)",
    description: "Posturas estáticas e inadecuadas prolongadas durante la ejecución de tareas de oficina por mobiliario no ergonómico.",
    deficiencyLevel: 2,
    exposureLevel: 4,
    probabilityLevel: 8,
    probabilityLabel: "Medio",
    consequenceLevel: 10,
    riskLevelValue: 80,
    riskTier: "III",
    riskAcceptability: "Aceptable",
    engineeringControls: "Cambio progresivo de silletería convencional a silletería con certificación ergonómica.",
    administrativeControls: "Implementación estricta de pausas activas programadas cada dos horas guiadas por el líder SST.",
    actionPlan: "Capacitaciones de higiene postural e implementar pausas activas por medio de recordatorios en PC.",
    status: "Cerrado"
  }
];

export default function App() {
  // Findings state loaded from localStorage or default template
  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem('gtc45_findings');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [factorFilter, setFactorFilter] = useState('Todos');
  const [tierFilter, setTierFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Form states for creating/editing findings
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  
  // Primary custom inputs state
  const [inspector, setInspector] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [technicalObservation, setTechnicalObservation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [riskFactor, setRiskFactor] = useState('');
  const [riskDetail, setRiskDetail] = useState('');
  const [description, setDescription] = useState('');
  
  // GTC 45 Values & Inputs
  const [deficiencyLevel, setDeficiencyLevel] = useState<number>(2); // Default 'Medio' (2)
  const [exposureLevel, setExposureLevel] = useState<number>(2);     // Default 'Ocasional' (2)
  const [consequenceLevel, setConsequenceLevel] = useState<number>(25); // Default 'Grave' (25)
  
  // Controls
  const [elimination, setElimination] = useState('');
  const [substitution, setSubstitution] = useState('');
  const [engineeringControls, setEngineeringControls] = useState('');
  const [administrativeControls, setAdministrativeControls] = useState('');
  const [eppControls, setEppControls] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [status, setStatus] = useState<'Abierto' | 'En Proceso' | 'Cerrado'>('Abierto');

  // External AI Copy-Paste Helper State
  const [isAICopierOpen, setIsAICopierOpen] = useState(false);
  const [externalAIInput, setExternalAIInput] = useState('');
  const [copiedPromptStatus, setCopiedPromptStatus] = useState(false);

  // Auto-calculated GTC 45 Values
  const [calculatedProb, setCalculatedProb] = useState(4);
  const [calculatedProbLabel, setCalculatedProbLabel] = useState('Bajo');
  const [calculatedRisk, setCalculatedRisk] = useState(100);
  const [calculatedTier, setCalculatedTier] = useState('III');
  const [calculatedAcceptability, setCalculatedAcceptability] = useState('Aceptable');

  // Image Upload helper file reader
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('gtc45_findings', JSON.stringify(findings));
  }, [findings]);

  // Recalculate GTC 45 values on any input change
  useEffect(() => {
    // Probability level math in GTC 45: ND * NE
    const np = deficiencyLevel * exposureLevel;
    setCalculatedProb(np);

    // Probability label based on interval (GTC 45 Tabla IV)
    let label = 'Bajo';
    if (np >= 24 && np <= 40) label = 'Muy Alto (MA)';
    else if (np >= 10 && np <= 20) label = 'Alto (A)';
    else if (np >= 6 && np <= 8) label = 'Medio (M)';
    else if (np >= 2 && np <= 4) label = 'Bajo (B)';
    setCalculatedProbLabel(label);

    // Risk level math: Probability Level (NP) * Consequence Level (NC)
    const nr = np * consequenceLevel;
    setCalculatedRisk(nr);

    // Risk Level Tier (I, II, III, IV) & Acceptability (GTC 45 Tabla VIII)
    let tier = 'IV';
    let acceptability = 'Aceptable';

    if (nr >= 600 && nr <= 4000) {
      tier = 'I';
      acceptability = 'Inaceptable';
    } else if (nr >= 120 && nr <= 500) {
      tier = 'II';
      acceptability = 'Inaceptable o Aceptable con control específico';
    } else if (nr >= 50 && nr <= 100) {
      tier = 'III';
      acceptability = 'Aceptable';
    } else if (nr < 50) {
      tier = 'IV';
      acceptability = 'Aceptable';
    }

    setCalculatedTier(tier);
    setCalculatedAcceptability(acceptability);
  }, [deficiencyLevel, exposureLevel, consequenceLevel]);

  // Handle Risk Factor modification dynamically updates Risk Details
  const handleRiskFactorChange = (f: string) => {
    setRiskFactor(f);
    const options = RISK_FACTORS_MAP[f] || [];
    setRiskDetail(options[0] || '');
  };

  // Image loader function
  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Form for creating new finding
  const handleNewFindingClick = () => {
    setEditingFinding(null);
    setInspector('Ing. Inspector de Seguridad');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setTechnicalObservation('');
    setImageUrl('');
    setRiskFactor(Object.keys(RISK_FACTORS_MAP)[0]);
    setRiskDetail(RISK_FACTORS_MAP[Object.keys(RISK_FACTORS_MAP)[0]][0]);
    setDescription('');
    setDeficiencyLevel(6); // Default high-risk initial setup for typical findings
    setExposureLevel(3);
    setConsequenceLevel(25);
    setElimination('');
    setSubstitution('');
    setEngineeringControls('');
    setAdministrativeControls('');
    setEppControls('');
    setActionPlan('');
    setStatus('Abierto');
    setIsFormOpen(true);
  };

  // Open Form for editing existing finding
  const handleEditClick = (f: Finding) => {
    setEditingFinding(f);
    setInspector(f.inspector);
    setDate(f.date);
    setLocation(f.location);
    setTechnicalObservation(f.technicalObservation);
    setImageUrl(f.imageUrl || '');
    setRiskFactor(f.riskFactor);
    setRiskDetail(f.riskDetail);
    setDescription(f.description);
    setDeficiencyLevel(f.deficiencyLevel);
    setExposureLevel(f.exposureLevel);
    setConsequenceLevel(f.consequenceLevel);
    setElimination(f.elimination || '');
    setSubstitution(f.substitution || '');
    setEngineeringControls(f.engineeringControls || '');
    setAdministrativeControls(f.administrativeControls || '');
    setEppControls(f.eppControls || '');
    setActionPlan(f.actionPlan);
    setStatus(f.status);
    setIsFormOpen(true);
  };

  // Delete finding handler
  const handleDeleteClick = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este hallazgo de inspección? Esta acción no se puede deshacer.')) {
      setFindings(findings.filter(f => f.id !== id));
    }
  };

  // Save finding handler
  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('Por favor ingrese la ubicación o área del hallazgo.');
      return;
    }
    if (!technicalObservation.trim()) {
      alert('Por favor ingrese la observación técnica del inspector.');
      return;
    }

    const findingData: Finding = {
      id: editingFinding ? editingFinding.id : `f-${Date.now()}`,
      inspector: inspector || 'Inspector SST',
      date: date || new Date().toISOString().split('T')[0],
      location,
      imageUrl,
      technicalObservation,
      riskFactor,
      riskDetail,
      description: description || technicalObservation,
      deficiencyLevel,
      exposureLevel,
      probabilityLevel: calculatedProb,
      probabilityLabel: calculatedProbLabel,
      consequenceLevel,
      riskLevelValue: calculatedRisk,
      riskTier: calculatedTier,
      riskAcceptability: calculatedAcceptability,
      elimination,
      substitution,
      engineeringControls,
      administrativeControls,
      eppControls,
      actionPlan: actionPlan || 'Realizar inspección periódica y aplicar controles.',
      status
    };

    if (editingFinding) {
      setFindings(findings.map(f => f.id === editingFinding.id ? findingData : f));
    } else {
      setFindings([findingData, ...findings]);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 }
      });
    }

    setIsFormOpen(false);
  };

  // Build raw GTC 45 Prompt for copying
  const generatedAIPrompt = `Analiza esta evidencia según GTC 45 (Guía Técnica Colombiana para la valoración de riesgos de Seguridad y Salud en el Trabajo).

Observación Técnica del Inspector:
"${technicalObservation || 'Viga en mal estado, cables expuestos sin entubar o herramientas inseguras en área laboral.'}"

Ubicación del Hallazgo:
"${location || 'Planta de producción o bodega principal'}"

Por favor, categoriza minuciosamente el peligro basándote en la GTC 45. Asegúrate de clasificarlo exactamente en uno de los siguientes factores de riesgo básicos colombianos:
- Biológico
- Físico
- Químico
- Psicosocial
- Biomecánico
- Condiciones de seguridad
- Fenómenos naturales

Genera un formato de respuesta únicamente como un objeto JSON crudo en español. No agregues introducciones ni explicaciones de Markdown externas al JSON. La estructura obligatoria de salida es:
{
  "riskFactor": "Factor de riesgo determinado",
  "riskDetail": "Detalle del riesgo específico según la GTC 45",
  "description": "Explicación profesional extendida de las condiciones identificadas, causas probables y consecuencias ocupacionales.",
  "deficiencyLevel": 10,  // (Indica si es: 10 para Muy Alto, 6 para Alto, 2 para Medio, 0 para Bajo)
  "exposureLevel": 4,    // (Indica si es: 4 para Continua, 3 para Frecuente, 2 para Ocasional, 1 para Esporádica)
  "consequenceLevel": 60, // (Indica si es: 100 para Mortal, 60 para Muy Grave, 25 para Grave, 10 para Leve)
  "elimination": "Opción viable de eliminación del peligro si aplica (o dejar vacío)",
  "substitution": "Opción viable de sustitución si aplica (o dejar vacío)",
  "engineeringControls": "Medidas técnicas o de ingeniería requeridas en orden de prioridad",
  "administrativeControls": "Controles administrativos, señalización, inducción o rotación requeridos",
  "eppControls": "Equipos de protección personal (EPP) y elementos sugeridos",
  "actionPlan": "Acción inmediata de control y plan de seguimiento sugerido para subsanar el hallazgo"
}`;

  // Copy standard GTC 45 prompt to clipboard
  const handleCopyAIPrompt = () => {
    navigator.clipboard.writeText(generatedAIPrompt);
    setCopiedPromptStatus(true);
    setTimeout(() => setCopiedPromptStatus(false), 2000);
  };

  // Parse external AI output (JSON or Regex)
  const handleApplyExternalAI = () => {
    if (!externalAIInput.trim()) {
      alert('Por favor, pega el resultado de la inteligencia artificial antes de aplicar.');
      return;
    }

    try {
      // Find the first occurrence of '{' and last '{' to extract JSON block cleanly in case there is some markdown around it
      const startIdx = externalAIInput.indexOf('{');
      const endIdx = externalAIInput.lastIndexOf('}');
      
      let parsedData: any = {};

      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = externalAIInput.substring(startIdx, endIdx + 1);
        parsedData = JSON.parse(jsonStr);
      } else {
        // Fallback robust line-by-line regex if pasting unstructured AI outputs
        const cleanLines = externalAIInput.split('\n');
        
        const getValue = (label: string) => {
          const regex = new RegExp(`${label}\\s*[:\\-=\\s]\\s*(.+)`, 'i');
          for (const line of cleanLines) {
            const match = line.match(regex);
            if (match) return match[1].trim().replace(/^["']|["']$/g, '');
          }
          return '';
        };

        const getNumber = (label: string) => {
          const val = getValue(label);
          const num = parseInt(val.replace(/\D/g, ''), 10);
          return isNaN(num) ? null : num;
        };

        parsedData = {
          riskFactor: getValue('Factor(?:\\s*de\\s*riesgo)?') || getValue('riskFactor'),
          riskDetail: getValue('Detalle(?:\\s*del\\s*riesgo)?') || getValue('riskDetail'),
          description: getValue('descripci(?:o|ó)n') || getValue('description'),
          deficiencyLevel: getNumber('deficiencia') || getNumber('deficiencyLevel'),
          exposureLevel: getNumber('exposici(?:o|ó)n') || getNumber('exposureLevel'),
          consequenceLevel: getNumber('consecuencia') || getNumber('consequenceLevel'),
          elimination: getValue('eliminaci(?:o|ó)n') || getValue('elimination'),
          substitution: getValue('sustituci(?:o|ó)n') || getValue('substitution'),
          engineeringControls: getValue('controlesIngenieria') || getValue('ingenier(?:i|í)a') || getValue('engineeringControls'),
          administrativeControls: getValue('controlesAdministrativos') || getValue('administrativos') || getValue('administrativeControls'),
          eppControls: getValue('epp') || getValue('eppControls') || getValue('protecci(?:o|ó)n\\s*personal'),
          actionPlan: getValue('plan(?:\\s*de\\s*acci(?:o|ó)n)?') || getValue('actionPlan')
        };
      }

      // Populate form state safely
      if (parsedData.riskFactor) {
        // Enforce spelling matching our pre-defined keys
        const potentialKey = Object.keys(RISK_FACTORS_MAP).find(
          k => k.toLowerCase() === parsedData.riskFactor.toLowerCase() || 
               parsedData.riskFactor.toLowerCase().includes(k.toLowerCase())
        );
        if (potentialKey) {
          handleRiskFactorChange(potentialKey);
        } else {
          setRiskFactor(parsedData.riskFactor);
        }
      }

      if (parsedData.riskDetail) setRiskDetail(parsedData.riskDetail);
      if (parsedData.description) setDescription(parsedData.description);
      
      // Deficiencies (GTC 45 acceptable: 10, 6, 2, 0)
      if (typeof parsedData.deficiencyLevel === 'number') {
        const nd = parsedData.deficiencyLevel;
        if ([10, 6, 2, 0].includes(nd)) setDeficiencyLevel(nd);
      }
      
      // Exposure (GTC 45 acceptable: 4, 3, 2, 1)
      if (typeof parsedData.exposureLevel === 'number') {
        const ne = parsedData.exposureLevel;
        if ([4, 3, 2, 1].includes(ne)) setExposureLevel(ne);
      }

      // Consequence (GTC 45 acceptable: 100, 60, 25, 10)
      if (typeof parsedData.consequenceLevel === 'number') {
        const nc = parsedData.consequenceLevel;
        if ([100, 60, 25, 10].includes(nc)) setConsequenceLevel(nc);
      }

      if (parsedData.elimination) setElimination(parsedData.elimination);
      if (parsedData.substitution) setSubstitution(parsedData.substitution);
      if (parsedData.engineeringControls) setEngineeringControls(parsedData.engineeringControls);
      if (parsedData.administrativeControls) setAdministrativeControls(parsedData.administrativeControls);
      if (parsedData.eppControls) setEppControls(parsedData.eppControls);
      if (parsedData.actionPlan) setActionPlan(parsedData.actionPlan);

      // Successfully processed feedback
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.5 }
      });

      setExternalAIInput('');
      setIsAICopierOpen(false);
      alert('¡Análisis de GTC 45 integrado con éxito! Por favor revise los campos calculados y complete su reporte.');

    } catch (e: any) {
      console.error(e);
      alert('No se pudo interpretar el resultado de la IA de manera automática. Intente copiar solo el bloque de llaves JSON { ... } o asigne los campos calculados manualmente.');
    }
  };

  // Professional XLS Export (GTC 45 Matriz de Riesgo Completa format!)
  const exportToExcelGTC45 = () => {
    // Columns aligned with complete GTC 45 matrix standard in Colombian companies
    const tableData = findings.map((f, i) => ({
      'ID Hallazgo': f.id,
      'Consecutivo': i + 1,
      'Fecha Siniestro/Inspección': f.date,
      'Nombre del Inspector': f.inspector,
      'Ubicación / Área Geográfica': f.location,
      'Descripción Detallada del Peligro': f.description,
      'Peligro - Factor de Riesgo (GTC-45)': f.riskFactor,
      'Peligro - Detalle Específico': f.riskDetail,
      'Efectos Posibles en la Salud': f.technicalObservation,
      'Nivel Deficiencia (ND)': f.deficiencyLevel,
      'Nivel Exposición (NE)': f.exposureLevel,
      'Nivel Probabilidad (NP)': f.probabilityLevel,
      'Clasificación Probabilidad': f.probabilityLabel,
      'Nivel Consecuencias (NC)': f.consequenceLevel,
      'Nivel de Riesgo (NR) e Intervención': f.riskLevelValue,
      'Interpretación Nivel Riesgo (Tier)': f.riskTier,
      'Aceptabilidad del Riesgo (GTC 45)': f.riskAcceptability,
      'Eliminación': f.elimination || 'No aplica',
      'Sustitución': f.substitution || 'No aplica',
      'Controles de Ingeniería': f.engineeringControls || 'No aplica',
      'Controles Administrativos / Señalización': f.administrativeControls || 'No aplica',
      'Equipos o Elementos de Protección': f.eppControls || 'No aplica',
      'Plan de Acción Sostenible': f.actionPlan,
      'Estado Actual': f.status
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);

    // Setup beautiful column widths
    const colWidths = [
      { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 28 }, 
      { wch: 45 }, { wch: 25 }, { wch: 25 }, { wch: 45 }, { wch: 22 }, 
      { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 32 }, 
      { wch: 30 }, { wch: 35 }, { wch: 25 }, { wch: 25 }, { wch: 35 }, 
      { wch: 40 }, { wch: 35 }, { wch: 40 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriz SST GTC 45");

    // Generate output file
    XLSX.writeFile(wb, `Matriz_SST_GTC45_Inspeccion_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Helper calculation for Stats Dashboard
  const stats = {
    total: findings.length,
    abiertos: findings.filter(f => f.status === 'Abierto').length,
    enProceso: findings.filter(f => f.status === 'En Proceso').length,
    cerrados: findings.filter(f => f.status === 'Cerrado').length,
    criticos: findings.filter(f => f.riskTier === 'I' || f.riskTier === 'II').length,
  };

  // Filtered list
  const filteredFindings = findings.filter(f => {
    const textToSearch = `${f.location} ${f.technicalObservation} ${f.riskFactor} ${f.riskDetail} ${f.inspector}`.toLowerCase();
    const matchesSearch = textToSearch.includes(searchTerm.toLowerCase());
    const matchesFactor = factorFilter === 'Todos' || f.riskFactor === factorFilter;
    const matchesTier = tierFilter === 'Todos' || f.riskTier === tierFilter;
    const matchesStatus = statusFilter === 'Todos' || f.status === statusFilter;
    return matchesSearch && matchesFactor && matchesTier && matchesStatus;
  });

  // Calculate percentage of closed findings for simple progress visual bar
  const percentCerrados = stats.total > 0 ? Math.round((stats.cerrados / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Upper Navigation & Banner */}
      <header className="sticky top-0 z-40 bg-indigo-900 text-white shadow-md border-b border-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-700 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">Matriz de Riesgos SST</h1>
              <span className="text-xs text-indigo-200">Inspecciones de Campo Integradas • GTC 45 Colombia</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToExcelGTC45}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-md transition"
              title="Descargar Reporte Completo en Formato Matriz GTC 45"
            >
              <Download className="w-4 h-4" />
              <span>Exportar XLS GTC-45</span>
            </button>
            <button
              onClick={handleNewFindingClick}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 rounded-md transition shadow"
            >
              <Plus className="w-4 h-4 text-indigo-900" />
              <span>Nuevo Hallazgo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5">
          
          {/* Welcome Dashboard Panel */}
          <div className="md:col-span-4 lg:col-span-2 bg-gradient-to-br from-indigo-800 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-950 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Gestión de Riesgos de Trabajo</span>
              <h2 className="text-2xl font-black">Portal Especializado SST</h2>
              <p className="text-sm text-indigo-100 font-light leading-relaxed">
                Herramienta ágil para la clasificación, cálculo e intervención inmediata de peligros laborales bajo la <strong>GTC 45 de Colombia</strong>. Use la asistencia de IA externa para potenciar sus análisis rápidos de hallazgos.
              </p>
            </div>
            <div className="pt-4 border-t border-indigo-700/50 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-300">Avance Total de Mitigación</p>
                <p className="text-sm font-bold">{percentCerrados}% de Peligros Resueltos</p>
              </div>
              <div className="w-24 bg-indigo-950 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${percentCerrados}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Micro Card Total */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Hallazgos</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Table className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{stats.total}</span>
              <p className="text-[11px] text-slate-400 mt-1">Registros actuales en el sistema</p>
            </div>
          </div>

          {/* Micro Card Critical */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">Críticos &amp; Muy Altos</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-rose-600 tracking-tight">{stats.criticos}</span>
              <p className="text-[11px] text-rose-500 font-semibold mt-1">Nivel de Riesgo I y II (No aceptables)</p>
            </div>
          </div>

          {/* Micro Card General State */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pendientes</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <div>
                <span className="text-2xl font-bold text-slate-700">{stats.abiertos}</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Abiertos</p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-2xl font-bold text-slate-700">{stats.enProceso}</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">En Proceso</p>
              </div>
            </div>
          </div>

        </div>

        {/* Filter Toolbar Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar hallazgos por ubicación, observador, peligros o descripción técnica GTC 45..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-500">Filtrar por:</span>
              </div>
              
              {/* Category Factor filter */}
              <select
                value={factorFilter}
                onChange={(e) => setFactorFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="Todos">Factores: Todos</option>
                {Object.keys(RISK_FACTORS_MAP).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="Todos">Estados: Todos</option>
                <option value="Abierto">Abierto</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Cerrado">Cerrado</option>
              </select>

              {/* Risk Tier (Rojo/Naranja/Verde) */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="Todos">Niveles de Riesgo: Todos</option>
                <option value="I">Nivel I (Catastrófico / Rojo)</option>
                <option value="II">Nivel II (Alto / Naranja)</option>
                <option value="III">Nivel III (Aceptable / Amarillo)</option>
                <option value="IV">Nivel IV (Bajo / Verde)</option>
              </select>

              {/* Reset Filters */}
              {(searchTerm || factorFilter !== 'Todos' || statusFilter !== 'Todos' || tierFilter !== 'Todos') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFactorFilter('Todos');
                    setStatusFilter('Todos');
                    setTierFilter('Todos');
                  }}
                  className="px-2.5 py-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Main Findings Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card Findings Listings (Left, spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span>Listado de Hallazgos</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                  {filteredFindings.length} mostrados
                </span>
              </h3>
              
              <p className="text-xs text-slate-400">Total registrados: {findings.length}</p>
            </div>

            {filteredFindings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">No se encontraron hallazgos</h4>
                  <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                    Intente modificando los filtros superiores o registre un nuevo hallazgo SST haciendo clic en el botón superior derecho.
                  </p>
                </div>
                <button
                  onClick={handleNewFindingClick}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Registrar Primer Hallazgo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFindings.map((f) => {
                  
                  // Color Scheme for Risk Tiers
                  let tierColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  let bgIndicator = 'bg-emerald-500';
                  let textColor = 'text-emerald-700';
                  
                  if (f.riskTier === 'I') {
                    tierColor = 'bg-rose-50 text-rose-800 border-rose-200';
                    bgIndicator = 'bg-rose-600';
                    textColor = 'text-rose-600';
                  } else if (f.riskTier === 'II') {
                    tierColor = 'bg-amber-50 text-amber-800 border-amber-200';
                    bgIndicator = 'bg-amber-500';
                    textColor = 'text-amber-600';
                  } else if (f.riskTier === 'III') {
                    tierColor = 'bg-yellow-50 text-yellow-800 border-yellow-200';
                    bgIndicator = 'bg-yellow-500';
                    textColor = 'text-yellow-600';
                  }

                  return (
                    <div 
                      key={f.id} 
                      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                    >
                      {/* Top ribbon containing inspector & date */}
                      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-5">
                          <span className="flex items-center space-x-1 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{f.inspector}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{f.date}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Status pill selector change directly */}
                          <select
                            value={f.status}
                            onChange={(e) => {
                              const updatedStatus = e.target.value as any;
                              setFindings(findings.map(item => item.id === f.id ? { ...item, status: updatedStatus } : item));
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition focus:outline-none cursor-pointer ${
                              f.status === 'Abierto' ? 'bg-red-50 text-red-700 border border-red-200' :
                              f.status === 'En Proceso' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <option value="Abierto">Abierto</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Cerrado">Cerrado</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 space-y-4">
                        
                        {/* Title/Location & Primary Danger category */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-700 text-xs tracking-wider uppercase">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{f.location}</span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 leading-snug">{f.riskFactor}</h4>
                            <p className="text-xs text-slate-500 font-medium italic">{f.riskDetail}</p>
                          </div>
                          
                          {/* Risk Rating Pill */}
                          <div className={`px-4 py-2 rounded-xl border ${tierColor} text-right flex sm:flex-col items-center justify-between sm:justify-start sm:items-end gap-3 sm:gap-1.5`}>
                            <div className="flex items-center space-x-1.5">
                              <span className={`w-3 h-3 rounded-full ${bgIndicator}`}></span>
                              <span className="text-xs uppercase font-black tracking-wide">Riesgo Tipo {f.riskTier}</span>
                            </div>
                            <div>
                              <span className="font-extrabold text-base tracking-tight">{f.riskLevelValue} VP</span>
                              <span className="text-[9px] uppercase tracking-wider block opacity-75">{f.riskAcceptability}</span>
                            </div>
                          </div>
                        </div>

                        {/* Image section if exists */}
                        {f.imageUrl && (
                          <div className="rounded-xl overflow-hidden max-h-48 shadow-inner border border-slate-100 bg-slate-50 relative group">
                            <img 
                              src={f.imageUrl} 
                              alt="Evidencia técnica SST" 
                              className="w-full h-48 object-cover object-center group-hover:scale-101 transition duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-slate-900/40 text-white px-2 py-1 rounded text-[10px] backdrop-blur">
                              Evidencia Visual
                            </div>
                          </div>
                        )}

                        {/* Deep description of core danger */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Descripción del Hallazgo</span>
                          <p className="text-sm text-slate-600 leading-relaxed font-light">{f.description}</p>
                        </div>

                        {/* Math breakdown row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Deficiencia (ND)</span>
                            <span className="text-sm font-black text-slate-700">{f.deficiencyLevel}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Exposición (NE)</span>
                            <span className="text-sm font-black text-slate-700">{f.exposureLevel}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Probabilidad (NP)</span>
                            <span className={`text-sm font-black ${textColor}`}>{f.probabilityLevel} <span className="text-[10px] font-normal font-sans">({f.probabilityLabel})</span></span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Consecuencia (NC)</span>
                            <span className="text-sm font-black text-slate-700">{f.consequenceLevel}</span>
                          </div>
                        </div>

                        {/* Controls & Action plan block */}
                        <div className="space-y-3 pt-3 border-t border-slate-150">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Medidas de Intervención Priorizadas</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                            
                            {/* Hierarchy Controls indicators */}
                            <div className="space-y-2">
                              {f.engineeringControls && (
                                <div className="flex items-start space-x-2">
                                  <span className="bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase shrink-0 mt-0.5">Ingeniería</span>
                                  <p className="leading-tight font-light">{f.engineeringControls}</p>
                                </div>
                              )}
                              {f.administrativeControls && (
                                <div className="flex items-start space-x-2">
                                  <span className="bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase shrink-0 mt-0.5">Admin</span>
                                  <p className="leading-tight font-light">{f.administrativeControls}</p>
                                </div>
                              )}
                              {f.eppControls && (
                                <div className="flex items-start space-x-2">
                                  <span className="bg-pink-50 text-pink-700 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase shrink-0 mt-0.5">EPP Colectivo</span>
                                  <p className="leading-tight font-light">{f.eppControls}</p>
                                </div>
                              )}
                              {(!f.engineeringControls && !f.administrativeControls && !f.eppControls) && (
                                <p className="text-slate-400 italic">No se especificaron controles de ingeniería o EPP.</p>
                              )}
                            </div>

                            {/* Plan de Acción */}
                            <div className="bg-indigo-50/45 p-3 rounded-xl border border-indigo-100 flex flex-col justify-between">
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-900 block">Plan de Acción Sugerido</span>
                                <p className="text-slate-700 leading-snug font-medium italic">"{f.actionPlan}"</p>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>

                      {/* Card Bottom Panel / Actions */}
                      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400/90 font-mono">ID: {f.id}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(f)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title="Editar este reporte"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(f.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Eliminar este reporte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reference Tool & Resources Column (Right, spans 1 col) */}
          <div className="space-y-8">
            
            {/* AI Assistant Quick Tool card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h4 className="font-bold text-slate-800 text-sm">Asistente Generador GTC 45</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                ¿No está seguro de cómo categorizar el factor de riesgo específico, los niveles de deficiencia de la GTC 45 o las medidas de ingeniería idóneas? Use la IA externa para sugerir todo de forma automática.
              </p>

              {/* Fast Observation box inside side panel */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Observación Rápida del Hallazgo:</label>
                <textarea
                  value={technicalObservation}
                  onChange={(e) => setTechnicalObservation(e.target.value)}
                  placeholder="Ej: Trabajadores realizando maniobras en la fachada del piso 3 sin arnés de seguridad ni línea de vida...."
                  rows={4}
                  className="w-full p-3 border border-slate-200 bg-slate-50 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAICopierOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>Obtener Prompt GTC-45</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center font-light">
                  Genera la plantilla JSON estructurada que interpretará el sistema.
                </p>
              </div>
            </div>

            {/* Quick Matriz Reference Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-slate-700">
                <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-sm">Guía de Parámetros GTC 45</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                
                {/* ND Section */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Nivel de Deficiencia (ND)</span>
                    <span className="text-indigo-600 font-semibold">Valor</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex justify-between"><span>Muy Alto (Peligro grave inminente)</span><span className="font-bold">10</span></div>
                    <div className="flex justify-between"><span>Alto (Factores de riesgo importantes)</span><span className="font-bold">6</span></div>
                    <div className="flex justify-between"><span>Medio (Factores moderados)</span><span className="font-bold">2</span></div>
                    <div className="flex justify-between"><span>Bajo (Sin deficiencias detectadas)</span><span className="font-bold">0</span></div>
                  </div>
                </div>

                {/* NE Section */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Nivel de Exposición (NE)</span>
                    <span className="text-indigo-600 font-semibold">Valor</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex justify-between"><span>Continua (Toda la jornada)</span><span className="font-bold">4</span></div>
                    <div className="flex justify-between"><span>Frecuente (Varias veces al día)</span><span className="font-bold">3</span></div>
                    <div className="flex justify-between"><span>Ocasional (Alguna vez al día)</span><span className="font-bold">2</span></div>
                    <div className="flex justify-between"><span>Esporádica (Alguna vez al mes)</span><span className="font-bold">1</span></div>
                  </div>
                </div>

                {/* NC Section */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Nivel Consecuencias (NC)</span>
                    <span className="text-indigo-600 font-semibold">Valor</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex justify-between"><span>Mortal o Catastrófico</span><span className="font-bold">100</span></div>
                    <div className="flex justify-between"><span>Muy Grave (Invalidez permanente)</span><span className="font-bold">60</span></div>
                    <div className="flex justify-between"><span>Grave (Invalidez temporal)</span><span className="font-bold">25</span></div>
                    <div className="flex justify-between"><span>Leve (Lesiones leves)</span><span className="font-bold">10</span></div>
                  </div>
                </div>

              </div>
            </div>

            {/* General App Footer inside column */}
            <div className="text-center space-y-1 text-slate-400 p-2">
              <p className="text-[10px]">Portal SST GTC-45 • Colombia</p>
              <p className="text-[9px] font-light">Versión Profesional Segura sin Cookies y con almacenamiento persistente local en el navegador.</p>
            </div>

          </div>

        </div>

      </main>

      {/* MODAL 1: CREATE / EDIT LOG REPORT FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            
            {/* Form Header */}
            <div className="sticky top-0 bg-white border-b border-slate-150 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {editingFinding ? 'Editar Hallazgo SST GTC 45' : 'Registrar Nuevo Hallazgo SST'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Guía Técnica Colombiana GTC 45 para valoración de riesgos</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition"
              >
                ✕
              </button>
            </div>

            {/* Form Formbody */}
            <form onSubmit={handleSaveFinding} className="p-6 space-y-6">
              
              {/* Top Row: Inspector details etc */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Nombre del Inspector:</label>
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    required
                    placeholder="Ingeniero SST"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Fecha de Registro:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Ubicación / Área Geográfica:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="E.g. Bodega Principal - Ala Sur"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

              </div>

              {/* Main Technical Observation & Image loader row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Observation */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600">Observación técnica detallada del inspector:</label>
                    <button
                      type="button"
                      onClick={() => setIsAICopierOpen(true)}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>¿Autocompletar con IA Externa?</span>
                    </button>
                  </div>
                  <textarea
                    value={technicalObservation}
                    onChange={(e) => setTechnicalObservation(e.target.value)}
                    required
                    rows={4}
                    placeholder="Ej. Tablero eléctrico general sin cerradura ni señalización de riesgo. Cables de alimentación primaria expuestos e indicios de sulfatación en bornes cerca de fuente de humedad constante."
                    className="w-full p-3 text-xs border border-slate-200 rounded-lg bg-slate-50/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  ></textarea>
                </div>

                {/* Evidence Image Loader */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Fotografía / Evidencia Visual:</label>
                  
                  {imageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 h-32 bg-slate-50">
                      <img src={imageUrl} alt="Cargada" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white p-1 rounded-md text-[10px]"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <span className="text-xs text-slate-400 font-medium">Haga clic para cargar foto (.png, .jpg)</span>
                      <span className="text-[10px] text-slate-400">Dimensión sugerida: Horizontal</span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUploaded}
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Danger Classification Group */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
                <span className="text-xs font-black uppercase text-indigo-900 block tracking-wider">Clasificación Básica del Peligro</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Factor de Riesgo:</label>
                    <select
                      value={riskFactor}
                      onChange={(e) => handleRiskFactorChange(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      {Object.keys(RISK_FACTORS_MAP).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Detalle Específico del Riesgo:</label>
                    <select
                      value={riskDetail}
                      onChange={(e) => setRiskDetail(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      {(RISK_FACTORS_MAP[riskFactor] || []).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Descripción Extendida (Sintetizada):</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Sintetice el peligro o use la descripción general."
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={2}
                  ></textarea>
                </div>
              </div>

              {/* GTC 45 Matriz Math Inputs & Calculations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/30 p-5 rounded-xl border border-indigo-100">
                
                {/* Manual Inputs dropdown */}
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase text-indigo-950 block tracking-wider">Metodología de Valoración GTC 45</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Deficiency Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">ND - Deficiencia:</label>
                      <select
                        value={deficiencyLevel}
                        onChange={(e) => setDeficiencyLevel(parseInt(e.target.value, 10))}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                      >
                        <option value={10}>10 (Muy Alto)</option>
                        <option value={6}>6 (Alto)</option>
                        <option value={2}>2 (Medio)</option>
                        <option value={0}>0 (Bajo)</option>
                      </select>
                    </div>

                    {/* Exposure Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">NE - Exposición:</label>
                      <select
                        value={exposureLevel}
                        onChange={(e) => setExposureLevel(parseInt(e.target.value, 10))}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                      >
                        <option value={4}>4 (Continua)</option>
                        <option value={3}>3 (Frecuente)</option>
                        <option value={2}>2 (Ocasional)</option>
                        <option value={1}>1 (Esporádica)</option>
                      </select>
                    </div>

                    {/* Consequence Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">NC - Consecuencia:</label>
                      <select
                        value={consequenceLevel}
                        onChange={(e) => setConsequenceLevel(parseInt(e.target.value, 10))}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                      >
                        <option value={100}>100 (Mortal)</option>
                        <option value={60}>60 (Muy Grave)</option>
                        <option value={25}>25 (Grave)</option>
                        <option value={10}>10 (Leve)</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Math output indicators */}
                <div className="border-t md:border-t-0 md:border-l border-indigo-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                  <span className="text-xs font-black uppercase text-indigo-950 block tracking-wider">Cálculos Matemáticos de la Guía</span>
                  
                  <div className="grid grid-cols-2 gap-4 my-2">
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-50 shadow-xs">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Nivel Probabilidad (NP)</span>
                      <span className="text-base font-black text-indigo-900">{calculatedProb}</span>
                      <span className="text-[9px] block text-slate-500">{calculatedProbLabel}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-indigo-50 shadow-xs">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Nivel Exposición de Riesgo (NR)</span>
                      <span className="text-base font-black text-indigo-900">{calculatedRisk}</span>
                      <span className="text-[9px] block text-slate-500">Tier: {calculatedTier}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-indigo-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Aceptabilidad GTC 45:</span>
                      <span className="text-xs font-extrabold text-slate-800 leading-tight">{calculatedAcceptability}</span>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white ${
                        calculatedTier === 'I' ? 'bg-red-500' :
                        calculatedTier === 'II' ? 'bg-amber-500' :
                        calculatedTier === 'III' ? 'bg-yellow-500 text-slate-800' :
                        'bg-emerald-500'
                      }`}>
                        Nivel {calculatedTier}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Hierarchy Intervention controls */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-slate-800 block tracking-wider">Determinación de Medidas de Control sugeridas (SST)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Eliminación:</label>
                    <input
                      type="text"
                      value={elimination}
                      onChange={(e) => setElimination(e.target.value)}
                      placeholder="e.g. Quitar o suprimir la viga inservible."
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Sustitución:</label>
                    <input
                      type="text"
                      value={substitution}
                      onChange={(e) => setSubstitution(e.target.value)}
                      placeholder="e.g. Cambiar disolventes nocivos por acuosos."
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Controles de Ingeniería:</label>
                    <input
                      type="text"
                      value={engineeringControls}
                      onChange={(e) => setEngineeringControls(e.target.value)}
                      placeholder="e.g. Guardas de piezas mecánicas en movimiento."
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Controles Administrativos / Señalización:</label>
                    <input
                      type="text"
                      value={administrativeControls}
                      onChange={(e) => setAdministrativeControls(e.target.value)}
                      placeholder="e.g. Señaléctica, inducción sst, rutinas de inspección."
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">EPP y Colectivos de Protección general:</label>
                    <input
                      type="text"
                      value={eppControls}
                      onChange={(e) => setEppControls(e.target.value)}
                      placeholder="e.g. Casco de seguridad dialéctrica marcas homologadas, protectores tipo copa."
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900">Plan de Acción &amp; Seguimiento Sugerido:</label>
                    <input
                      type="text"
                      value={actionPlan}
                      onChange={(e) => setActionPlan(e.target.value)}
                      required
                      placeholder="e.g. Reorganizar de inmediato, cotizar sonometría..."
                      className="w-full p-2 bg-indigo-50/30 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Estado de Seguimiento Inicial:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Abierto">Abierto</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Form Bottom Row with Save Button */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-end space-x-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow"
                >
                  {editingFinding ? 'Guardar Cambios Guardados' : 'Agregar a la Matriz GTC 45'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: EXTERNAL AI COPIER / CLIPBOARD INTERPRETER */}
      {isAICopierOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in space-y-4">
            
            {/* Header */}
            <div className="bg-indigo-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-bold text-sm tracking-tight">Copiar Prompt e Importar Respuesta IA</h4>
                  <p className="text-[10px] text-indigo-200">Compatible con ChatGPT, Gemini, Claude o Google AI Studio</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAICopierOpen(false)}
                className="text-white bg-indigo-900/40 hover:bg-indigo-900/80 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              
              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  Debido a limitaciones de alojamiento estático o si no cuenta con una API key directa, puede utilizar este asistente para que cualquier IA en la web realice la estructuración de la GTC 45 por usted en 2 clics:
                </p>
                
                <ol className="list-decimal pl-5 space-y-1 text-slate-500">
                  <li>Haga clic en <strong>"Copiar Prompt para la IA"</strong> para llevarse las instrucciones metodológicas.</li>
                  <li>Vaya a <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center space-x-0.5"><span>ChatGPT</span><ExternalLink className="w-2.5 h-2.5" /></a> o <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center space-x-0.5"><span>Gemini</span><ExternalLink className="w-2.5 h-2.5" /></a> y pegue las instrucciones.</li>
                  <li>Copie toda la respuesta que la IA genere y <strong>péguela en el cuadro inferior</strong>.</li>
                </ol>
              </div>

              {/* Box 1: Pre-Generated Prompt Output */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600">1. Prompt metodológico GTC-45 configurado:</label>
                  <button
                    type="button"
                    onClick={handleCopyAIPrompt}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold bg-indigo-50 border border-indigo-150 rounded text-indigo-700 hover:bg-indigo-100"
                  >
                    {copiedPromptStatus ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Prompt para la IA</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-205 rounded-lg max-h-36 overflow-y-auto select-all text-[10px] text-slate-500 font-mono whitespace-pre-wrap leading-tight">
                  {generatedAIPrompt}
                </div>
              </div>

              {/* Box 2: Feed response back input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-indigo-900 block">2. Pegar respuesta de la IA (JSON o texto estructurado):</label>
                <textarea
                  value={externalAIInput}
                  onChange={(e) => setExternalAIInput(e.target.value)}
                  placeholder={`Pegue aquí el bloque {...} resultante o todo el escrito. El sistema lo interpretará de inmediato para rellenar los controles y clasificaciones...`}
                  rows={6}
                  className="w-full p-3 font-mono text-[10.5px] border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                ></textarea>
              </div>

            </div>

            {/* Bottom operations */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Asociación GTC 45 con Inteligencia Ocupacional</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAICopierOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-650"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyExternalAI}
                  className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white shadow"
                >
                  Aplicar análisis de IA importado
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
