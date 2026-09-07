import React, { useState } from 'react';
import { X, UserPlus, Flame, Scale, Activity, Droplets } from 'lucide-react';
import { Patient, Gender, Objective } from '../types';
import { 
  normalizeHeightToCm, 
  normalizeHeightToMeters, 
  calculateBMI, 
  calculateMifflinTMB, 
  calculateGET, 
  calculateWaterRecommendation 
} from '../utils/nutritionCalculations';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSavePatient
}) => {
  // Campos de entrada iniciam vazios/zerados, aguardando preenchimento real
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('masculino');
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<string>(''); // Suporta cm (ex: 175) ou m (ex: 1.75)
  const [currentWeightKg, setCurrentWeightKg] = useState<string>('');
  const [targetWeightKg, setTargetWeightKg] = useState<string>('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState<string>('');
  const [objective, setObjective] = useState<Objective>('emagrecimento');
  const [activityFactor, setActivityFactor] = useState<string>('1.2');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');

  if (!isOpen) return null;

  // Conversões e cálculos matemáticos 100% dinâmicos em tempo real
  const numWeight = parseFloat(currentWeightKg) || 0;
  const numHeight = parseFloat(height.replace(',', '.')) || 0;
  const numAge = parseInt(age, 10) || 0;
  const numBf = parseFloat(bodyFatPercentage) || 0;
  const numTargetWeight = parseFloat(targetWeightKg) || (numWeight > 0 ? numWeight : 0);
  const numNaf = parseFloat(activityFactor) || 1.2;

  // Altura padronizada
  const heightM = normalizeHeightToMeters(numHeight);
  const heightCm = normalizeHeightToCm(numHeight);

  // Fórmulas dinâmicas
  const bmiData = calculateBMI(numWeight, numHeight);
  const tmb = calculateMifflinTMB(gender, numWeight, numHeight, numAge);
  const getVal = calculateGET(tmb, numNaf);
  const waterData = calculateWaterRecommendation(numWeight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      phone: phone.trim() || '(11) 99999-0000',
      gender,
      birthDate: '1998-05-10',
      age: numAge,
      heightCm,
      initialWeightKg: numWeight,
      currentWeightKg: numWeight,
      targetWeightKg: numTargetWeight || numWeight,
      bmi: bmiData.bmi,
      bodyFatPercentage: numBf,
      objective,
      activityFactor: numNaf,
      tmb,
      get: getVal,
      status: 'ativo',
      tags: [objective],
      anamnese: {
        clinicalHistory: clinicalHistory || 'Nenhum histórico informado no cadastro inicial.',
        foodAllergiesAndIntolerances: allergies || 'Nenhuma alergia relatada.',
        currentMedicationsAndSupplements: medications || 'Nenhum medicamento.',
        routineAndOccupation: 'Rotina informada em consulta.',
        sleepHoursPerNight: 7,
        waterIntakeLiters: waterData.liters,
        physicalActivity: `NAF ${numNaf} (${numNaf === 1.2 ? 'Sedentário' : numNaf <= 1.55 ? 'Moderado' : 'Ativo'})`
      },
      evolutionHistory: [
        {
          id: `ev-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          weightKg: numWeight,
          heightCm,
          bmi: bmiData.bmi,
          bodyFatPercentage: numBf,
          notes: 'Cadastro e avaliação antropométrica inicial.'
        }
      ],
      labExams: [],
      notes: 'Cadastro realizado via prontuário NutrinK.',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSavePatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0217]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 shadow-fuchsia-950/40">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-fuchsia-950/50">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Cadastrar Novo Paciente</h3>
              <p className="text-xs text-purple-200">Prontuário com cálculo antropométrico e metabólico em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1.5 rounded-xl hover:bg-[#250847] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Identificação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-purple-200 font-bold">Nome Completo do Paciente *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Marcela Albuquerque"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400 placeholder-purple-300/50 font-medium"
              />
            </div>

            <div>
              <label className="text-purple-200 font-bold">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@email.com"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400 placeholder-purple-300/50"
              />
            </div>

            <div>
              <label className="text-purple-200 font-bold">WhatsApp / Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400 placeholder-purple-300/50"
              />
            </div>
          </div>

          {/* Parâmetros Antropométricos (Campos Zerados/Vazios) */}
          <div className="p-4 bg-[#1a0533] border border-purple-800/40 rounded-2xl space-y-3">
            <span className="text-[11px] uppercase font-black text-fuchsia-300 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Parâmetros Físicos & Antropométricos
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-purple-200 font-bold">Gênero Biológico *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full mt-1 bg-[#120326] border border-purple-700/60 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-fuchsia-400"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>

              <div>
                <label className="text-purple-200 font-bold">Idade (anos) *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="0"
                  className="w-full mt-1 bg-[#120326] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400 placeholder-purple-400/40"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold">Altura (cm ou m) *</label>
                <input
                  type="text"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="ex: 175 ou 1.75"
                  className="w-full mt-1 bg-[#120326] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400 placeholder-purple-400/40"
                />
                {numHeight > 0 && (
                  <span className="text-[10px] text-fuchsia-300 mt-0.5 block">
                    {heightCm} cm • {heightM.toFixed(2)} m
                  </span>
                )}
              </div>

              <div>
                <label className="text-purple-200 font-bold">Peso Atual (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(e.target.value)}
                  placeholder="0.0"
                  className="w-full mt-1 bg-[#120326] border border-purple-700/60 rounded-xl p-2.5 text-white font-black text-fuchsia-300 focus:outline-none focus:border-fuchsia-400 placeholder-purple-400/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-purple-200 font-bold">% Gordura Corporal</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPercentage}
                  onChange={(e) => setBodyFatPercentage(e.target.value)}
                  placeholder="0.0 %"
                  className="w-full mt-1 bg-[#120326] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400 placeholder-purple-400/40"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold">Peso Meta (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value)}
                  placeholder={numWeight > 0 ? `${numWeight} kg` : '0.0'}
                  className="w-full mt-1 bg-[#120326] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400 placeholder-purple-400/40"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold">Nível de Atividade (NAF)</label>
                <select
                  value={activityFactor}
                  onChange={(e) => setActivityFactor(e.target.value)}
                  className="w-full mt-1 bg-[#120326] border border-purple-700/60 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-fuchsia-400"
                >
                  <option value="1.2">Sedentário (1.20)</option>
                  <option value="1.375">Levemente Ativo (1.375)</option>
                  <option value="1.55">Moderadamente Ativo (1.55)</option>
                  <option value="1.725">Muito Ativo (1.725)</option>
                  <option value="1.9">Atleta de Alta Intensidade (1.90)</option>
                </select>
              </div>
            </div>

            {/* Painel Dinâmico de Resultados em Tempo Real */}
            <div className="pt-3 border-t border-purple-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-purple-200 uppercase">
                  Recálculo Dinâmico Automático:
                </span>
                <span className="text-[10px] text-fuchsia-300 font-medium">
                  {numWeight > 0 && numHeight > 0 && numAge > 0 
                    ? 'Dados computados em tempo real' 
                    : 'Aguardando preenchimento'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#120326] p-2.5 rounded-xl border border-purple-800/60 text-center">
                  <span className="text-[10px] text-purple-300 block uppercase font-bold flex items-center justify-center gap-1">
                    <Scale className="w-3 h-3 text-purple-400" />
                    IMC Atual
                  </span>
                  <span className="text-base font-black text-white mt-0.5 block">
                    {bmiData.bmi > 0 ? bmiData.bmi : '-'}
                  </span>
                  <span className="text-[9px] text-fuchsia-300 truncate block">
                    {bmiData.classification !== '-' ? bmiData.classification.split(' ')[0] : 'Aguardando'}
                  </span>
                </div>

                <div className="bg-[#120326] p-2.5 rounded-xl border border-purple-800/60 text-center">
                  <span className="text-[10px] text-purple-300 block uppercase font-bold flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-fuchsia-400" />
                    TMB Basal
                  </span>
                  <span className="text-base font-black text-white mt-0.5 block">
                    {tmb > 0 ? `${tmb} kcal` : '0 kcal'}
                  </span>
                  <span className="text-[9px] text-purple-300 block">
                    Mifflin-St Jeor
                  </span>
                </div>

                <div className="bg-[#120326] p-2.5 rounded-xl border border-fuchsia-600/40 text-center bg-purple-950/30">
                  <span className="text-[10px] text-fuchsia-300 block uppercase font-bold flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-fuchsia-400" />
                    GET Total
                  </span>
                  <span className="text-base font-black text-fuchsia-200 mt-0.5 block">
                    {getVal > 0 ? `${getVal} kcal` : '0 kcal'}
                  </span>
                  <span className="text-[9px] text-fuchsia-300 block">
                    NAF {numNaf}
                  </span>
                </div>

                <div className="bg-[#120326] p-2.5 rounded-xl border border-purple-800/60 text-center">
                  <span className="text-[10px] text-purple-300 block uppercase font-bold flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    Meta Hídrica
                  </span>
                  <span className="text-base font-black text-white mt-0.5 block">
                    {waterData.ml > 0 ? `${waterData.ml} mL` : '0 mL'}
                  </span>
                  <span className="text-[9px] text-cyan-300 block">
                    {waterData.liters > 0 ? `${waterData.liters} L/dia` : '35 mL/kg'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-purple-200 font-bold">Objetivo Clínico</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as Objective)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white capitalize focus:outline-none focus:border-fuchsia-400"
              >
                <option value="emagrecimento">Emagrecimento</option>
                <option value="hipertrofia">Hipertrofia Muscular</option>
                <option value="performance_esportiva">Performance Esportiva</option>
                <option value="manejo_diabetes">Manejo Diabetes / Glicemia</option>
                <option value="saude_longevidade">Saúde & Longevidade</option>
                <option value="vegetariano_vegano">Vegetariano / Vegano</option>
                <option value="gestacao_lactacao">Gestação / Lactação</option>
              </select>
            </div>

            <div>
              <label className="text-purple-200 font-bold">Histórico Clínico / Queixas Iniciais</label>
              <input
                type="text"
                value={clinicalHistory}
                onChange={(e) => setClinicalHistory(e.target.value)}
                placeholder="Queixa principal, histórico..."
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          <div>
            <label className="text-purple-200 font-bold">Alergias ou Intolerâncias Alimentares</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="ex: Intolerância à lactose, glúten..."
              className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-purple-900/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-200 rounded-xl font-bold transition-all border border-purple-800/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl font-bold shadow-md shadow-fuchsia-950/60 flex items-center gap-1.5 border border-fuchsia-400/30 transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Paciente</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

