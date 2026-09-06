import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Patient, Gender, Objective } from '../types';
import { calculateMetabolicRates } from '../utils/nutritionCalculations';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('masculino');
  const [age, setAge] = useState(28);
  const [heightCm, setHeightCm] = useState(175);
  const [currentWeightKg, setCurrentWeightKg] = useState(72);
  const [targetWeightKg, setTargetWeightKg] = useState(78);
  const [objective, setObjective] = useState<Objective>('hipertrofia');
  const [activityFactor, setActivityFactor] = useState(1.55);
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rates = calculateMetabolicRates({
      formula: 'mifflin',
      gender,
      weightKg: currentWeightKg,
      heightCm,
      ageYears: age,
      activityFactor
    });

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      phone: phone.trim() || '(11) 99999-0000',
      gender,
      birthDate: '1998-05-10',
      age,
      heightCm,
      initialWeightKg: currentWeightKg,
      currentWeightKg,
      targetWeightKg: targetWeightKg || currentWeightKg,
      bmi: rates.bmi,
      bodyFatPercentage: gender === 'masculino' ? 14 : 22,
      objective,
      activityFactor,
      tmb: rates.tmb,
      get: rates.get,
      status: 'ativo',
      tags: [objective],
      anamnese: {
        clinicalHistory: clinicalHistory || 'Nenhum histórico informado no cadastro inicial.',
        foodAllergiesAndIntolerances: allergies || 'Nenhuma alergia relatada.',
        currentMedicationsAndSupplements: medications || 'Nenhum medicamento.',
        routineAndOccupation: 'Rotina ativa.',
        sleepHoursPerNight: 7,
        waterIntakeLiters: rates.waterRecommendationLiters,
        physicalActivity: 'Musculação e aeróbio moderado.'
      },
      evolutionHistory: [
        {
          id: `ev-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          weightKg: currentWeightKg,
          heightCm,
          bmi: rates.bmi,
          bodyFatPercentage: gender === 'masculino' ? 14 : 22,
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
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 shadow-fuchsia-950/40">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-fuchsia-950/50">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Cadastrar Novo Paciente</h3>
              <p className="text-xs text-purple-200">Prontuário com cálculo antropométrico e metabólico automático</p>
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-purple-200 font-bold">Gênero</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>

            <div>
              <label className="text-purple-200 font-bold">Idade (anos)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-purple-200 font-bold">Altura (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-purple-200 font-bold">Peso Atual (kg) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white font-black text-fuchsia-300 focus:outline-none focus:border-fuchsia-400"
              />
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
              <label className="text-purple-200 font-bold">Nível de Atividade (NAF)</label>
              <select
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
              >
                <option value={1.2}>Sedentário (1.20)</option>
                <option value={1.375}>Levemente Ativo (1.375)</option>
                <option value={1.55}>Moderadamente Ativo (1.55)</option>
                <option value={1.725}>Muito Ativo (1.725)</option>
                <option value={1.9}>Atleta de Alta Intensidade (1.90)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-purple-200 font-bold">Histórico Clínico / Queixas Iniciais</label>
            <input
              type="text"
              value={clinicalHistory}
              onChange={(e) => setClinicalHistory(e.target.value)}
              placeholder="ex: Histórico de refluxo, exames recentes normais..."
              className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="text-purple-200 font-bold">Alergias ou Intolerâncias Alimentares</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="ex: Intolerância à lactose, alergia a frutos do mar..."
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
