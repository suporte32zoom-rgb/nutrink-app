import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Appointment, Patient, AppointmentType, LocationType } from '../types';
import { getBrasiliaTodayISODate } from '../utils/dateUtils';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  preSelectedPatient?: Patient | null;
  onSaveAppointment: (appointment: Appointment) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  preSelectedPatient,
  onSaveAppointment
}) => {
  const [patientId, setPatientId] = useState(preSelectedPatient?.id || (patients[0]?.id || ''));
  const [patientName, setPatientName] = useState(preSelectedPatient?.name || (patients[0]?.name || ''));
  const [date, setDate] = useState(getBrasiliaTodayISODate());
  const [time, setTime] = useState('14:30');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [type, setType] = useState<AppointmentType>('retorno');
  const [location, setLocation] = useState<LocationType>('presencial_consultorio');
  const [price, setPrice] = useState(350);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handlePatientChange = (id: string) => {
    setPatientId(id);
    const pat = patients.find(p => p.id === id);
    if (pat) setPatientName(pat.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patientId || undefined,
      patientName: patientName.trim(),
      date,
      time,
      durationMinutes,
      type,
      status: 'confirmada',
      location,
      price,
      paymentStatus: 'pendente',
      notes: notes.trim() || undefined
    };

    onSaveAppointment(newApt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0217]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 shadow-fuchsia-950/40 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-fuchsia-950/50">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Agendar Consulta</h3>
              <p className="text-xs text-purple-200">NutrinK Calendário Clínico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1.5 rounded-xl hover:bg-[#250847] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="text-purple-200 font-bold">Paciente *</label>
            {patients.length > 0 ? (
              <select
                value={patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400 font-medium"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Nome do Paciente"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400 font-medium"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-purple-200 font-bold">Data da Consulta</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400 font-bold"
              />
            </div>

            <div>
              <label className="text-purple-200 font-bold">Horário</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white font-black text-fuchsia-300 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-purple-200 font-bold">Tipo de Consulta</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
              >
                <option value="primeira_consulta">Primeira Consulta (Anamnese)</option>
                <option value="retorno">Retorno / Acompanhamento</option>
                <option value="avaliacao_bioimpedancia">Bioimpedância / Medidas</option>
                <option value="urgencia_ajuste">Ajuste de Cardápio</option>
              </select>
            </div>

            <div>
              <label className="text-purple-200 font-bold">Formato / Local</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as LocationType)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
              >
                <option value="presencial_consultorio">Presencial (Consultório)</option>
                <option value="teleconsulta_online">Online (Teleconsulta)</option>
                <option value="domiciliar">Atendimento Domiciliar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-purple-200 font-bold">Duração (minutos)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-purple-200 font-bold">Valor (R$)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          <div>
            <label className="text-purple-200 font-bold">Observações / Motivo</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Avaliar exames e ajustar plano pré-treino..."
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
              <Calendar className="w-4 h-4" />
              <span>Confirmar Agendamento</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
