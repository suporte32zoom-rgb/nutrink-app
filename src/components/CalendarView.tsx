import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Check, 
  MapPin, 
  Video, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Bot
} from 'lucide-react';
import { Appointment, Patient } from '../types';
import { getBrasiliaTodayISODate } from '../utils/dateUtils';

interface CalendarViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onOpenNewAppointment: () => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onSelectPatient: (patientId: string) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  onStartTelemedicine?: (patientId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  patients,
  onOpenNewAppointment,
  onUpdateAppointmentStatus,
  onSelectPatient,
  onOpenNutriaWithPrompt,
  onStartTelemedicine
}) => {
  const [selectedDate, setSelectedDate] = useState(getBrasiliaTodayISODate());
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAppointments = appointments.filter(a => {
    const matchesDate = viewMode === 'dia' ? a.date === selectedDate : true;
    const matchesStatus = statusFilter === 'todos' || a.status === statusFilter;
    return matchesDate && matchesStatus;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const handleCopyWhatsAppReminder = (apt: Appointment) => {
    const msg = `Olá, ${apt.patientName}! Tudo bem? Passando para confirmar sua consulta nutricional no NutrinK agendada para ${apt.date} às ${apt.time} (${apt.location === 'presencial_consultorio' ? 'Presencial no consultório' : 'Online por vídeo'}). Qualquer dúvida estamos à disposição!`;
    navigator.clipboard.writeText(msg);
    setCopiedId(apt.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-fuchsia-400" />
            Agenda & Calendário Clínico
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Controle completo de horários, confirmações e atendimentos do consultório.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNutriaWithPrompt(`Nutria, quais os horários vagos e consultas pendentes na minha agenda de ${selectedDate}?`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="w-4 h-4 text-fuchsia-300" />
            <span>Consultar Agenda com NUTRIA</span>
          </button>

          <button
            onClick={onOpenNewAppointment}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/50 transition-all border border-fuchsia-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Consulta</span>
          </button>
        </div>
      </div>

      {/* Date Navigator & Filters Strip */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        
        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 rounded-xl bg-[#220743] text-purple-200 hover:text-white border border-purple-700/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#1e073c] border border-purple-700/60 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-fuchsia-400"
          />

          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 rounded-xl bg-[#220743] text-purple-200 hover:text-white border border-purple-700/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate('2026-08-15')}
            className="px-3 py-1.5 rounded-xl bg-[#2b0a54] text-xs font-bold text-fuchsia-300 border border-purple-700/60 hover:bg-[#380d6b]"
          >
            Hoje
          </button>
        </div>

        {/* View Mode & Status Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-[#1e073c] rounded-xl p-1 border border-purple-800/50">
            {(['dia', 'semana', 'mes'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-sm'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                {mode === 'dia' ? 'Dia' : mode === 'semana' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-300" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1e073c] border border-purple-700/60 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-fuchsia-400"
            >
              <option value="todos">Todos os Status</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendente">Pendentes</option>
              <option value="realizada">Realizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>

      </div>

      {/* Appointments List for the selected Date */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-fuchsia-400" />
            {viewMode === 'dia' ? `Grade de Horários - ${selectedDate}` : `Consultas do Período`}
          </h2>
          <span className="text-xs text-purple-200 font-semibold">
            {filteredAppointments.length} agendamentos listados
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-purple-200 text-xs">
            <CalendarIcon className="w-10 h-10 mx-auto text-purple-400/40 mb-2" />
            Nenhuma consulta agendada para este dia/filtro.
            <div className="mt-3">
              <button
                onClick={onOpenNewAppointment}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Adicionar Consulta Agora
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 hover:border-fuchsia-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  
                  {/* Time badge */}
                  <div className="w-14 h-14 rounded-2xl bg-[#120326] border border-fuchsia-500/30 text-fuchsia-300 font-black text-sm flex flex-col items-center justify-center shrink-0 shadow-inner">
                    <span>{apt.time}</span>
                    <span className="text-[10px] text-purple-200 font-normal">{apt.durationMinutes}min</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => apt.patientId && onSelectPatient(apt.patientId)}
                        className="font-bold text-sm text-white hover:text-fuchsia-300 transition-colors text-left"
                      >
                        {apt.patientName}
                      </button>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#29094e] text-fuchsia-200 border border-purple-700/60">
                        {apt.type === 'primeira_consulta' ? 'Primeira Consulta' : apt.type === 'retorno' ? 'Retorno' : 'Avaliação'}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-[#29094e] text-purple-200 flex items-center gap-1 border border-purple-800/40">
                        {apt.location === 'presencial_consultorio' ? (
                          <><MapPin className="w-3 h-3 text-fuchsia-400" /> Presencial</>
                        ) : (
                          <><Video className="w-3 h-3 text-purple-300" /> Vídeo Online</>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-purple-200 mt-1 font-medium">
                      Valor: <strong className="text-white">R$ {apt.price}</strong> • Pagamento: <span className={apt.paymentStatus === 'pago' ? 'text-fuchsia-300 font-bold' : 'text-amber-300 font-bold'}>{apt.paymentStatus === 'pago' ? 'Confirmado / Pago' : 'Pendente'}</span>
                    </p>

                    {apt.notes && (
                      <p className="text-xs text-purple-100 mt-1 italic font-medium">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                  
                  {/* Telemedicine direct launch if online video */}
                  {apt.location === 'online_video' && onStartTelemedicine && apt.patientId && (
                    <button
                      onClick={() => onStartTelemedicine(apt.patientId)}
                      className="px-3 py-2 bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-fuchsia-950/60 transition-all border border-rose-400/40"
                      title="Entrar na sala de vídeo com NUTRIA"
                    >
                      <Video className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>Entrar no Vídeo</span>
                    </button>
                  )}

                  {/* WhatsApp Reminder copy */}
                  <button
                    onClick={() => handleCopyWhatsAppReminder(apt)}
                    className="p-2.5 bg-[#220743] hover:bg-[#2f0b5a] text-purple-200 hover:text-white rounded-xl border border-purple-700/60 transition-all text-xs inline-flex items-center gap-1.5"
                    title="Copiar mensagem de confirmação para WhatsApp"
                  >
                    {copiedId === apt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-fuchsia-300" />
                        <span className="text-fuchsia-300 font-bold text-[11px]">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-purple-300" />
                        <span className="text-[11px] font-semibold">Lembrete</span>
                      </>
                    )}
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={apt.status}
                    onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as Appointment['status'])}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none transition-colors ${
                      apt.status === 'realizada'
                        ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-600'
                        : apt.status === 'confirmada'
                        ? 'bg-purple-950 text-purple-200 border-purple-500'
                        : apt.status === 'cancelada'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : 'bg-amber-950 text-amber-200 border-amber-600'
                    }`}
                  >
                    <option value="confirmada">Confirmada</option>
                    <option value="realizada">Realizada</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
