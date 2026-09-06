import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Video,
  Phone, 
  Mail, 
  Activity, 
  FileText, 
  Sparkles, 
  Bot, 
  ChevronRight, 
  ArrowLeft,
  Flame,
  Heart,
  Scale,
  Award,
  Download,
  Printer,
  ShoppingBag
} from 'lucide-react';
import { Patient, AnthropometricRecord, FoodItem, UserAccount } from '../types';
import { MealPlanEditor } from './MealPlanEditor';
import { printMealPlanPdf, sendMealPlanViaWhatsApp } from '../utils/pdfExportUtils';

interface PatientsViewProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string | null) => void;
  onOpenNewPatient: () => void;
  onOpenNewAppointmentWithPatient: (patient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  foodDatabase: FoodItem[];
  userAccount?: UserAccount;
  onStartTelemedicine?: (patientId: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenNewPatient,
  onOpenNewAppointmentWithPatient,
  onOpenNutriaWithPrompt,
  onUpdatePatient,
  foodDatabase,
  userAccount,
  onStartTelemedicine
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'anamnese' | 'antropometria' | 'plano' | 'exames' | 'evolucao'>('anamnese');
  
  // New Anthropometry Modal State
  const [isAddingAntro, setIsAddingAntro] = useState(false);
  const [newAntroWeight, setNewAntroWeight] = useState('');
  const [newAntroBf, setNewAntroBf] = useState('');
  const [newAntroWaist, setNewAntroWaist] = useState('');
  const [newAntroNotes, setNewAntroNotes] = useState('');

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesObjective = objectiveFilter === 'todos' || p.objective === objectiveFilter;
    return matchesSearch && matchesObjective;
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Handler for adding new anthropometry record
  const handleSaveAnthropometry = () => {
    if (!selectedPatient || !newAntroWeight) return;
    const weightNum = parseFloat(newAntroWeight);
    const heightM = selectedPatient.heightCm / 100;
    const newBmi = Number((weightNum / (heightM * heightM)).toFixed(1));
    const bfNum = newAntroBf ? parseFloat(newAntroBf) : selectedPatient.bodyFatPercentage;

    const newRecord: AnthropometricRecord = {
      id: `ev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: weightNum,
      heightCm: selectedPatient.heightCm,
      bmi: newBmi,
      bodyFatPercentage: bfNum,
      waistCircumferenceCm: newAntroWaist ? parseFloat(newAntroWaist) : undefined,
      notes: newAntroNotes || 'Registro de acompanhamento de rotina.'
    };

    const updated: Patient = {
      ...selectedPatient,
      currentWeightKg: weightNum,
      bmi: newBmi,
      bodyFatPercentage: bfNum,
      evolutionHistory: [newRecord, ...(selectedPatient.evolutionHistory || [])]
    };

    onUpdatePatient(updated);
    setIsAddingAntro(false);
    setNewAntroWeight('');
    setNewAntroBf('');
    setNewAntroWaist('');
    setNewAntroNotes('');
  };

  // If patient dossier is selected
  if (selectedPatient) {
    return (
      <div className="space-y-6 pb-12">
        
        {/* Back and Patient Header Dossier */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-7 shadow-xl shadow-purple-950/40">
          <button
            onClick={() => onSelectPatient(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-200 hover:text-fuchsia-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de Pacientes</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-fuchsia-950/60 shrink-0 border border-fuchsia-400/40">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {selectedPatient.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 uppercase">
                    {selectedPatient.objective.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#28094c] text-purple-200 border border-purple-700/50">
                    Status: {selectedPatient.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-purple-200 mt-2 flex-wrap font-medium">
                  <span><strong>{selectedPatient.age} anos</strong> ({selectedPatient.gender})</span>
                  <span>•</span>
                  <span><Phone className="w-3 h-3 inline mr-1 text-purple-300" />{selectedPatient.phone}</span>
                  <span>•</span>
                  <span><Mail className="w-3 h-3 inline mr-1 text-purple-300" />{selectedPatient.email}</span>
                </div>
              </div>
            </div>

            {/* Top Dossier Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {onStartTelemedicine && (
                <button
                  onClick={() => onStartTelemedicine(selectedPatient.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md shadow-fuchsia-950/60 transition-all border border-rose-400/40"
                  id="btn-patient-start-telemedicine"
                >
                  <Video className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Telemedicina com Paciente</span>
                </button>
              )}

              <button
                onClick={() => onOpenNewAppointmentWithPatient(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-300" />
                <span>Agendar Consulta</span>
              </button>

              <button
                onClick={() => onOpenNutriaWithPrompt(`Nutria, analise o prontuário de ${selectedPatient.name} (Objetivo: ${selectedPatient.objective}, Peso: ${selectedPatient.currentWeightKg}kg, BF: ${selectedPatient.bodyFatPercentage}%) e sugira os melhores ajustes nutricionais.`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-105"
              >
                <Bot className="w-3.5 h-3.5 text-fuchsia-200" />
                <span>Copiloto NUTRIA neste Paciente</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-purple-900/40">
            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">Peso Atual</span>
              <p className="text-lg font-black text-white mt-0.5">{selectedPatient.currentWeightKg} kg</p>
              <span className="text-[10px] text-purple-200">Meta: {selectedPatient.targetWeightKg} kg</span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">Altura</span>
              <p className="text-lg font-black text-white mt-0.5">{selectedPatient.heightCm} cm</p>
              <span className="text-[10px] text-purple-200">({(selectedPatient.heightCm / 100).toFixed(2)} m)</span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">IMC Atual</span>
              <p className="text-lg font-black text-white mt-0.5">{selectedPatient.bmi}</p>
              <span className="text-[10px] text-fuchsia-300 font-bold">
                {selectedPatient.bmi < 25 ? 'Eutrofia' : 'Sobrepeso'}
              </span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">% Gordura</span>
              <p className="text-lg font-black text-white mt-0.5">{selectedPatient.bodyFatPercentage}%</p>
              <span className="text-[10px] text-purple-200">Bioimpedância</span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">TMB (Basal)</span>
              <p className="text-lg font-black text-white mt-0.5">{selectedPatient.tmb} kcal</p>
              <span className="text-[10px] text-purple-200">Mifflin-St Jeor</span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">GET Total</span>
              <p className="text-lg font-black text-fuchsia-300 mt-0.5">{selectedPatient.get} kcal</p>
              <span className="text-[10px] text-purple-200">NAF: {selectedPatient.activityFactor || 1.55}</span>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-purple-900/40 overflow-x-auto scrollbar-none">
            {[
              { id: 'anamnese', label: '1. Anamnese & Hábitos' },
              { id: 'antropometria', label: '2. Antropometria & Evolução' },
              { id: 'plano', label: '3. Plano Alimentar & Macros' },
              { id: 'exames', label: `4. Exames (${selectedPatient.labExams?.length || 0})` },
              { id: 'evolucao', label: '5. Parecer & Resumo Clínico' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-fuchsia-400 text-fuchsia-300 bg-[#29094e] rounded-t-xl'
                    : 'border-transparent text-purple-200 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Anamnese & Hábitos */}
        {activeTab === 'anamnese' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-purple-900/40 pb-3">
                <FileText className="w-4 h-4 text-fuchsia-400" />
                Histórico Clínico & Queixas
              </h3>
              <div>
                <span className="text-xs text-purple-200 font-bold">Histórico de Doenças / Patologias:</span>
                <p className="text-sm text-white mt-1 leading-relaxed font-medium">
                  {selectedPatient.anamnese?.clinicalHistory || 'Sem histórico de patologias prévias.'}
                </p>
              </div>
              <div>
                <span className="text-xs text-purple-200 font-bold">Alergias e Intolerâncias Alimentares:</span>
                <p className="text-sm text-amber-300 mt-1 font-semibold">
                  {selectedPatient.anamnese?.foodAllergiesAndIntolerances || 'Nenhuma informada.'}
                </p>
              </div>
              <div>
                <span className="text-xs text-purple-200 font-bold">Medicamentos e Suplementos em Uso:</span>
                <p className="text-sm text-white mt-1 font-medium">
                  {selectedPatient.anamnese?.currentMedicationsAndSupplements || 'Nenhum.'}
                </p>
              </div>
              <div>
                <span className="text-xs text-purple-200 font-bold">Relação Emocional com a Comida:</span>
                <p className="text-sm text-white mt-1 font-medium">
                  {selectedPatient.anamnese?.emotionalRelationshipWithFood || 'Equilibrada.'}
                </p>
              </div>
            </div>

            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-purple-900/40 pb-3">
                <Activity className="w-4 h-4 text-purple-300" />
                Rotina, Sono & Hábitos de Vida
              </h3>
              <div>
                <span className="text-xs text-purple-200 font-bold">Rotina Diária & Ocupação:</span>
                <p className="text-sm text-white mt-1 font-medium">
                  {selectedPatient.anamnese?.routineAndOccupation || 'Não informado.'}
                </p>
              </div>
              <div>
                <span className="text-xs text-purple-200 font-bold">Nível de Atividade Física:</span>
                <p className="text-sm text-white mt-1 font-medium">
                  {selectedPatient.anamnese?.physicalActivity || 'Sedentário.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-[11px] text-purple-200 font-bold">Sono por Noite</span>
                  <p className="text-sm font-black text-white mt-0.5">{selectedPatient.anamnese?.sleepHoursPerNight || 7} horas</p>
                </div>
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-[11px] text-purple-200 font-bold">Ingestão Hídrica</span>
                  <p className="text-sm font-black text-fuchsia-300 mt-0.5">{selectedPatient.anamnese?.waterIntakeLiters || 2} Litros/dia</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-purple-200 font-bold">Preferências / Aversões Alimentares:</span>
                <p className="text-xs text-purple-100 mt-1 leading-relaxed">
                  <strong className="text-white">Gosta:</strong> {selectedPatient.anamnese?.dietaryPreferences || 'Variadas'}<br />
                  <strong className="text-white">Evita:</strong> {selectedPatient.anamnese?.dietaryAversions || 'Nenhuma'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Antropometria & Composição Corporal */}
        {activeTab === 'antropometria' && (
          <div className="space-y-6">
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4 text-fuchsia-400" />
                    Histórico de Avaliações Antropométricas
                  </h3>
                  <p className="text-xs text-purple-200 mt-0.5">Acompanhe a curva de peso, % de gordura e medidas</p>
                </div>
                <button
                  onClick={() => setIsAddingAntro(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Medição</span>
                </button>
              </div>

              {/* Form to add anthropometry if open */}
              {isAddingAntro && (
                <div className="mt-4 p-4 bg-[#1d0637] rounded-2xl border border-fuchsia-500/50 space-y-3 shadow-md">
                  <h4 className="text-xs font-bold text-fuchsia-300 uppercase">Adicionar Nova Avaliação Antropométrica</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-purple-200 font-semibold">Peso Atual (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newAntroWeight}
                        onChange={(e) => setNewAntroWeight(e.target.value)}
                        placeholder="ex: 78.5"
                        className="w-full mt-1 bg-[#120326] border border-purple-700 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-purple-200 font-semibold">% Gordura Corporal</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newAntroBf}
                        onChange={(e) => setNewAntroBf(e.target.value)}
                        placeholder="ex: 14.5"
                        className="w-full mt-1 bg-[#120326] border border-purple-700 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-purple-200 font-semibold">Circunferência Cintura (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newAntroWaist}
                        onChange={(e) => setNewAntroWaist(e.target.value)}
                        placeholder="ex: 82.0"
                        className="w-full mt-1 bg-[#120326] border border-purple-700 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-purple-200 font-semibold">Notas da Avaliação</label>
                    <input
                      type="text"
                      value={newAntroNotes}
                      onChange={(e) => setNewAntroNotes(e.target.value)}
                      placeholder="Observações clínicas, aderência..."
                      className="w-full mt-1 bg-[#120326] border border-purple-700 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingAntro(false)}
                      className="px-3 py-1.5 text-xs text-purple-200 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveAnthropometry}
                      className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold"
                    >
                      Salvar Registro
                    </button>
                  </div>
                </div>
              )}

              {/* Table of Records */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-purple-100">
                  <thead className="bg-[#1d0637] text-purple-200 uppercase font-bold border-b border-purple-900/40">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Peso (kg)</th>
                      <th className="p-3">IMC</th>
                      <th className="p-3">% Gordura</th>
                      <th className="p-3">Cintura</th>
                      <th className="p-3">Observações Clínicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {(selectedPatient.evolutionHistory || []).map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#1d0637]/60">
                        <td className="p-3 font-bold text-white">{rec.date}</td>
                        <td className="p-3 font-black text-fuchsia-300">{rec.weightKg} kg</td>
                        <td className="p-3 font-semibold">{rec.bmi}</td>
                        <td className="p-3 font-semibold">{rec.bodyFatPercentage ? `${rec.bodyFatPercentage}%` : '-'}</td>
                        <td className="p-3 font-semibold">{rec.waistCircumferenceCm ? `${rec.waistCircumferenceCm} cm` : '-'}</td>
                        <td className="p-3 text-purple-200 italic">{rec.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Plano Alimentar & Macros com Tabela TACO, PDF e Lista de Compras */}
        {activeTab === 'plano' && (
          <MealPlanEditor
            patient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
            userAccount={userAccount}
          />
        )}

        {/* Tab 4: Exames Laboratoriais */}
        {activeTab === 'exames' && (
          <div className="space-y-6">
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-fuchsia-400" />
                    Painel de Exames Bioquímicos & Hormonais
                  </h3>
                  <p className="text-xs text-purple-200 mt-0.5">Marcadores laboratoriais com interpretação clínica</p>
                </div>
                <button
                  onClick={() => onOpenNutriaWithPrompt(`Nutria, quais exames complementares e marcadores laboratoriais você recomenda solicitar para o paciente ${selectedPatient.name} (Objetivo: ${selectedPatient.objective})?`)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sugerir Exames com NUTRIA</span>
                </button>
              </div>

              {selectedPatient.labExams && selectedPatient.labExams.length > 0 ? (
                selectedPatient.labExams.map((exam) => (
                  <div key={exam.id} className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{exam.title}</h4>
                        <span className="text-xs text-purple-200">{exam.date} • {exam.laboratory}</span>
                      </div>
                    </div>

                    {exam.nutriaClinicalReview && (
                      <div className="p-3.5 bg-[#120326] rounded-2xl border border-purple-800/60 text-xs text-purple-100 leading-relaxed font-medium">
                        <span className="font-bold text-fuchsia-300 block mb-1">Parecer Clínico da NUTRIA:</span>
                        {exam.nutriaClinicalReview}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {exam.markers.map((m) => (
                        <div key={m.id} className="p-3.5 bg-[#120326] rounded-xl border border-purple-800/40 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-white block">{m.marker}</span>
                            <span className="text-[11px] text-purple-200">Ref: {m.referenceRange}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-sm text-white block">{m.value} {m.unit}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              m.status === 'normal'
                                ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-600/40'
                                : m.status === 'elevado'
                                ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                                : 'bg-rose-950 text-rose-300 border border-rose-600/40'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-purple-200 text-xs">
                  Nenhum exame cadastrado no momento para este paciente.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Parecer & Resumo Clínico de Evolução */}
        {activeTab === 'evolucao' && (
          <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-fuchsia-400" />
                  Dossiê e Parecer Clínico Estruturado
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Documento formatado para exportação em Markdown ou impressão direta em PDF
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printMealPlanPdf(selectedPatient, userAccount)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  title="Gerar impressão ou PDF do Dossiê"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Imprimir / Gerar PDF</span>
                </button>

                <button
                  onClick={() => onOpenNutriaWithPrompt(`Nutria, elabore um relatório clínico minucioso e estruturado em tabelas markdown do paciente ${selectedPatient.name}, detalhando evolução antropométrica, adequação de micronutrientes, distribuição de macros e parecer final.`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gerar Laudo com NUTRIA</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-3 text-xs text-purple-100 leading-relaxed font-mono">
              <h4 className="font-bold text-sm text-fuchsia-300 font-sans">Visualização do Dossiê do Paciente:</h4>
              <p>
                <strong className="text-white">PACIENTE:</strong> {selectedPatient.name} ({selectedPatient.age} anos) • <strong className="text-white">OBJETIVO:</strong> {selectedPatient.objective.toUpperCase()}
              </p>
              <p>
                <strong className="text-white">ANTROPOMETRIA:</strong> Peso inicial {selectedPatient.initialWeightKg} kg ➔ Peso Atual {selectedPatient.currentWeightKg} kg ({selectedPatient.currentWeightKg - selectedPatient.initialWeightKg > 0 ? '+' : ''}{(selectedPatient.currentWeightKg - selectedPatient.initialWeightKg).toFixed(1)} kg) • IMC {selectedPatient.bmi} • BF {selectedPatient.bodyFatPercentage}%
              </p>
              <p>
                <strong className="text-white">GASTO ENERGÉTICO:</strong> TMB {selectedPatient.tmb} kcal | GET {selectedPatient.get} kcal | Meta Hídrica {((selectedPatient.currentWeightKg * 35) / 1000).toFixed(1)} L/dia
              </p>
              <p className="font-sans text-purple-200 pt-2 border-t border-purple-800/40">
                <strong className="text-white">Conduta Clínica:</strong> {selectedPatient.notes || 'Acompanhamento nutricional focado em otimização de composição corporal e estilo de vida.'}
              </p>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Default: Patient List View
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-fuchsia-400" />
            Gestão de Pacientes & Prontuários
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Total de <strong className="text-white">{patients.length} pacientes</strong> cadastrados no prontuário eletrônico do NutrinK.
          </p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/50 transition-all self-start sm:self-auto border border-fuchsia-400/40"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou email..."
            className="w-full bg-[#1e073c] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
          <Filter className="w-4 h-4 text-purple-300 shrink-0" />
          <span className="text-xs text-purple-200 font-bold shrink-0">Objetivo:</span>
          {['todos', 'hipertrofia', 'emagrecimento', 'manejo_diabetes', 'performance_esportiva', 'vegetariano_vegano'].map((obj) => (
            <button
              key={obj}
              onClick={() => setObjectiveFilter(obj)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                objectiveFilter === obj
                  ? 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-500/60 shadow-sm'
                  : 'bg-[#220743] text-purple-200 hover:text-white border border-purple-800/40'
              }`}
            >
              {obj === 'todos' ? 'Todos' : obj.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.length === 0 ? (
          <div className="col-span-full py-16 px-6 text-center bg-[#150328] border border-purple-900/50 rounded-3xl space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-fuchsia-400 flex items-center justify-center mx-auto shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-white">Sua lista de pacientes está vazia</h3>
              <p className="text-xs sm:text-sm text-purple-200">
                Cadastre seu primeiro paciente para iniciar o prontuário eletrônico, histórico antropométrico, exames laboratoriais e acompanhamento dietoterápico com o copiloto NUTRIA.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenNewPatient}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-105"
                id="btn-cadastrar-primeiro-paciente"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Paciente</span>
              </button>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-purple-200 bg-[#150328] border border-purple-900/50 rounded-3xl">
            Nenhum paciente encontrado com os filtros aplicados.
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="bg-[#150328] border border-purple-900/50 hover:border-fuchsia-500/60 rounded-3xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] group relative shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-950/60 border border-fuchsia-400/30">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-fuchsia-300 transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-purple-200 mt-0.5 font-medium">
                      {patient.age} anos • {patient.gender === 'masculino' ? 'Masc' : 'Fem'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#29094e] text-fuchsia-200 border border-purple-700/60">
                  {patient.objective.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-purple-900/40 text-center">
                <div className="bg-[#1d0637] p-2 rounded-xl">
                  <span className="text-[10px] text-purple-200 font-semibold block">Peso</span>
                  <span className="text-xs font-black text-white">{patient.currentWeightKg} kg</span>
                </div>
                <div className="bg-[#1d0637] p-2 rounded-xl">
                  <span className="text-[10px] text-purple-200 font-semibold block">IMC</span>
                  <span className="text-xs font-black text-fuchsia-300">{patient.bmi}</span>
                </div>
                <div className="bg-[#1d0637] p-2 rounded-xl">
                  <span className="text-[10px] text-purple-200 font-semibold block">% Gordura</span>
                  <span className="text-xs font-black text-white">{patient.bodyFatPercentage}%</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-purple-200 pt-2 border-t border-purple-900/30 font-medium">
                <span className="truncate max-w-[200px]">{patient.phone}</span>
                <span className="text-fuchsia-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver Ficha <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
