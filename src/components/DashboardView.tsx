import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Bot, 
  Activity, 
  ChevronRight, 
  Flame,
  UserPlus,
  CalendarPlus,
  ShieldCheck,
  FileSpreadsheet,
  Stethoscope,
  Apple,
  Award,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';
import { Patient, Appointment, FinancialTransaction, UserAccount } from '../types';
import { 
  getBrasiliaTodayISODate, 
  formatBrasiliaFullDate, 
  getGreetingByTime, 
  getBrasiliaTimeString 
} from '../utils/dateUtils';

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  transactions: FinancialTransaction[];
  userAccount?: UserAccount;
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatient: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewTransaction: () => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  onUpdateAppointmentStatus: (aptId: string, newStatus: Appointment['status']) => void;
  onOpenProfileModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  appointments,
  transactions,
  userAccount,
  onSelectPatient,
  onOpenNewPatient,
  onOpenNewAppointment,
  onOpenNewTransaction,
  onOpenNutriaWithPrompt,
  onUpdateAppointmentStatus,
  onOpenProfileModal
}) => {
  const [isBannerDismissed, setIsBannerDismissed] = React.useState(false);
  const currentDateStr = getBrasiliaTodayISODate();
  const formattedToday = formatBrasiliaFullDate();
  const greeting = getGreetingByTime();
  const currentTime = getBrasiliaTimeString();
  
  // Professional identity determination
  const isDoctor = userAccount?.crn?.includes('CRM') || userAccount?.specialty?.toLowerCase().includes('nutrolog') || userAccount?.name?.toLowerCase().includes('dr.');
  const professionalRoleLabel = userAccount?.crn?.includes('CRM') 
    ? 'Médico Nutrólogo' 
    : userAccount?.specialty?.toLowerCase().includes('nutrolog') 
    ? 'Nutrólogo(a)' 
    : 'Nutricionista Clínico(a)';

  // Calculations
  const todayAppointments = appointments.filter(a => a.date === currentDateStr);
  const totalRevenue = transactions
    .filter(t => t.type === 'receita' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'despesa' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  const completedAppointmentsCount = appointments.filter(a => a.status === 'realizada').length;
  const averageTicket = totalRevenue > 0 && completedAppointmentsCount > 0 
    ? Math.round(totalRevenue / completedAppointmentsCount) 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / NUTRIA Pulse Bar with Active Service Mode and Professional Registration */}
      <div className="bg-gradient-to-r from-[#1b0434] via-[#2a084e] to-[#17032c] border border-purple-800/50 rounded-3xl p-5 sm:p-7 shadow-xl shadow-purple-950/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              {/* Active Service Mode Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Modo de Atendimento Ativo</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/50 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                Copiloto NUTRIA • NutrinK AI
              </span>

              {/* Time & Brasilia Date Indicator */}
              <span className="inline-flex items-center gap-1 text-xs text-purple-200 bg-[#16032a] px-3 py-1 rounded-full border border-purple-800/60">
                <Clock className="w-3.5 h-3.5 text-purple-300" />
                <span className="capitalize">{formattedToday}</span>
                <span className="text-fuchsia-300 font-bold ml-1">({currentTime} • Horário de Brasília)</span>
              </span>
            </div>

            {/* Welcome greeting with registered professional name */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>{greeting}, {userAccount?.name || 'Profissional de Saúde'}!</span>
            </h1>

            {/* Professional Role & Registry Tag in Office Banner */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-fuchsia-200 bg-[#250849] px-2.5 py-1 rounded-lg border border-purple-700/60">
                {isDoctor ? <Stethoscope className="w-3.5 h-3.5 text-cyan-300" /> : <Apple className="w-3.5 h-3.5 text-fuchsia-300" />}
                <span>{professionalRoleLabel}</span>
              </span>

              {userAccount?.crn && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 bg-[#190432] px-2.5 py-1 rounded-lg border border-purple-800/50">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Registro: {userAccount.crn}</span>
                </span>
              )}

              {userAccount?.specialty && (
                <span className="text-xs text-purple-200/80 hidden sm:inline">
                  • {userAccount.specialty}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed max-w-2xl">
              {patients.length === 0 ? (
                <span>Bem-vindo(a) ao seu consultório inteligente. Seu prontuário eletrônico está pronto para receber os dados do seu primeiro paciente e emitir laudos com a inteligência clínica da NUTRIA.</span>
              ) : (
                <span>Você tem <strong className="text-fuchsia-300">{todayAppointments.length} consulta(s) hoje</strong> e <strong className="text-white">{patients.length} paciente(s) ativo(s)</strong> sob seu acompanhamento clínico no consultório.</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenNutriaWithPrompt(
                patients.length === 0 
                  ? `Nutria, como você pode me auxiliar na anamnese e prescrição dietoterápica do meu primeiro paciente como ${professionalRoleLabel}?`
                  : `Nutria, faça um briefing rápido das consultas de hoje (${currentTime} em Brasília) com o resumo de cada paciente.`
              )}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-[1.02]"
              id="btn-nutria-briefing-dashboard"
            >
              <Bot className="w-4 h-4 text-fuchsia-200" />
              <span>{patients.length === 0 ? 'Iniciar com a NUTRIA' : 'Briefing do Dia com NUTRIA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile & Clinic Customization Invitation Card (Optional & Non-blocking) */}
      {!isBannerDismissed && onOpenProfileModal && (
        <div className="bg-gradient-to-r from-[#1e073c] via-[#2d0a56] to-[#1a0535] border border-fuchsia-500/40 rounded-3xl p-4 sm:p-5 shadow-lg shadow-purple-950/40 relative overflow-hidden transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-fuchsia-950/60 border border-fuchsia-400/40 mt-0.5">
                <FileSpreadsheet className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Personalize suas Receitas & Documentos Impressos
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                    Sistema 100% Liberado
                  </span>
                  {userAccount?.plan !== 'free' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-400/50">
                      ⭐ Premium Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-200 leading-relaxed max-w-2xl">
                  Seu consultório já está totalmente operacional. Complete os dados do seu consultório (CRN/CRM, telefone, especialidade e endereço) a qualquer hora. <strong>Quanto mais informações você preencher, mais completos serão os cabeçalhos de receitas, planos alimentares e atestados que você emitir!</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={onOpenProfileModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-fuchsia-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                id="btn-dashboard-complete-profile"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Completar Dados do Consultório</span>
              </button>
              
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/40 transition-all cursor-pointer text-xs"
                title="Dispensar aviso"
              >
                ✕
              </button>
            </div>

          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pacientes Ativos */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Pacientes Ativos</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-fuchsia-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{patients.length}</span>
            {patients.length > 0 ? (
              <span className="text-xs font-bold text-fuchsia-300 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Ativos
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-purple-300">
                Aguardando pacientes
              </span>
            )}
          </div>
          <p className="text-xs text-purple-200/90 mt-1">
            {patients.length === 0 ? 'Base pronta para primeiro cadastro' : 'Base clínica sob monitoramento'}
          </p>
        </div>

        {/* Card 2: Agenda Hoje */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Consultas Hoje</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{todayAppointments.length}</span>
            <span className="text-xs font-semibold text-purple-200">
              {todayAppointments.length > 0 
                ? `${todayAppointments.filter(a => a.status === 'confirmada').length} confirmadas` 
                : 'Nenhum agendamento'}
            </span>
          </div>
          <p className="text-xs text-purple-200/90 mt-1">
            {todayAppointments.length > 0 
              ? `Próxima às ${todayAppointments[0]?.time}` 
              : 'Nenhuma consulta agendada para hoje'}
          </p>
        </div>

        {/* Card 3: Faturamento Líquido */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Faturamento (Mês)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-fuchsia-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-fuchsia-300 mt-1 font-bold">
            Saldo Líquido: R$ {netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Ticket Médio</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-amber-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-purple-200">por atendimento</span>
          </div>
          <p className="text-xs text-purple-200/90 mt-1">
            {completedAppointmentsCount > 0 ? `${completedAppointmentsCount} atendimentos realizados` : 'Sem atendimentos no período'}
          </p>
        </div>

      </div>

      {/* Main Grid: Agenda do Dia + Alertas da NUTRIA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Agenda de Atendimento Hoje */}
        <div className="lg:col-span-2 bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-fuchsia-400" />
                  Atendimentos de Hoje
                </h2>
                <p className="text-xs text-purple-200 mt-0.5">Grade diária de atendimentos presenciais e online</p>
              </div>
              <button
                onClick={onOpenNewAppointment}
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-[#25074a] hover:bg-[#340c66] text-fuchsia-300 border border-purple-700/60 rounded-xl transition-all shadow-sm"
                id="btn-quick-schedule"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agendar</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {todayAppointments.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-[#1d0637]/50 border border-purple-800/30">
                  <div className="w-12 h-12 rounded-2xl bg-[#28094f] text-purple-300 flex items-center justify-center mx-auto mb-3 border border-purple-700/50">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Nenhuma consulta agendada para hoje.
                  </h3>
                  <p className="text-xs text-purple-200 max-w-md mx-auto mb-4">
                    Clique em <strong>[+ Agendar]</strong> para cadastrar um horário ou utilize a <strong>NUTRIA</strong> para simular distribuições de horários e lembretes de WhatsApp.
                  </p>
                  <button
                    onClick={onOpenNewAppointment}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                    id="btn-empty-state-schedule"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>+ Agendar Primeira Consulta</span>
                  </button>
                </div>
              ) : (
                todayAppointments.map((apt, aptIdx) => {
                  return (
                    <div
                      key={apt.id ? `apt-${apt.id}` : `apt-idx-${aptIdx}`}
                      className="p-4 rounded-2xl bg-[#1d0637] border border-purple-800/40 hover:border-fuchsia-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-950/90 text-fuchsia-300 font-black text-sm flex flex-col items-center justify-center border border-fuchsia-500/30 shrink-0 shadow-inner">
                          <span>{apt.time}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => apt.patientId && onSelectPatient(apt.patientId)}
                              className="font-bold text-sm text-white hover:text-fuchsia-300 transition-colors text-left"
                            >
                              {apt.patientName}
                            </button>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#2e0b59] text-fuchsia-200 border border-purple-700/60">
                              {apt.type === 'primeira_consulta' ? '1ª Consulta' : apt.type === 'retorno' ? 'Retorno' : 'Avaliação'}
                            </span>
                          </div>
                          <p className="text-xs text-purple-200 mt-0.5 font-medium">
                            {apt.location === 'presencial_consultorio' ? 'Consultório Presencial' : 'Vídeo Online'} • R$ {apt.price} ({apt.paymentStatus === 'pago' ? 'Pago' : 'Pendente'})
                          </p>
                          {apt.notes && (
                            <p className="text-xs text-fuchsia-300 mt-1 italic font-medium">
                              "{apt.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <select
                          value={apt.status}
                          onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as Appointment['status'])}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition-colors ${
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

                        <button
                          onClick={() => apt.patientId ? onSelectPatient(apt.patientId) : null}
                          className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-[#2c0a54] transition-colors"
                          title="Ver Prontuário"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Alertas & Insights Clínicos da NUTRIA */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-fuchsia-400" />
                Insights Clínicos NUTRIA
              </h2>
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {patients.length === 0 ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-fuchsia-300">
                      <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                      Ecossistema Clínico Pronto
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      O motor da NUTRIA analisará automaticamente taxas de TMB/GET (Mifflin & Harris-Benedict), dobras cutâneas e alertas de micronutrientes assim que os primeiros pacientes forem inseridos.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      Prontuário Seguro & LGPD
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      Todos os registros, anamneses, condutas e prescrições são armazenados com criptografia de ponta a ponta e sigilo médico-nutricional.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-200">
                      <FileSpreadsheet className="w-4 h-4 text-purple-300 shrink-0" />
                      Tabela TACO & NutriCalc Integrados
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      Mais de 20 alimentos fundamentais cadastrados com valores de macro e micronutrientes para cálculo dietético imediato.
                    </p>
                  </div>
                </>
              ) : (
                patients.slice(0, 3).map((patient, pIdx) => (
                  <div key={`insight-${patient.id || pIdx}`} className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-fuchsia-300 mb-1">
                      <Flame className="w-4 h-4 text-fuchsia-400" />
                      Acompanhamento: {patient.name}
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      Objetivo: <strong>{patient.objective.replace('_', ' ')}</strong>. Peso Atual: <strong>{patient.currentWeightKg} kg</strong> (IMC: {patient.bmi}).
                    </p>
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="mt-2 text-[11px] font-bold text-fuchsia-300 hover:text-fuchsia-200 hover:underline inline-flex items-center gap-1"
                    >
                      Abrir ficha completa <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-purple-900/40">
            <button
              onClick={() => onOpenNutriaWithPrompt(
                patients.length === 0
                  ? "Nutria, como você recomenda estruturar a primeira consulta nutricional para maximizar a retenção do paciente?"
                  : "Nutria, sugira 3 intervenções clínicas prioritárias para os pacientes cadastrados."
              )}
              className="w-full py-2.5 px-3 rounded-xl bg-[#29094e] hover:bg-[#360c67] text-purple-100 font-bold text-xs border border-purple-700/60 flex items-center justify-center gap-2 transition-all hover:text-white shadow-sm"
              id="btn-nutria-ai-action-dash"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>{patients.length === 0 ? 'Pedir Dicas de Consulta à NUTRIA' : 'Solicitar Análise Global à NUTRIA'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Prontuários Recentes */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-fuchsia-400" />
              Prontuários Recentes
            </h2>
            <p className="text-xs text-purple-200 mt-0.5">Acesso rápido aos pacientes cadastrados na clínica</p>
          </div>
          <button
            onClick={onOpenNewPatient}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl shadow-sm transition-all border border-fuchsia-400/40"
            id="btn-top-add-patient-dash"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Novo Paciente</span>
          </button>
        </div>

        {patients.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-[#1d0637]/40 border border-purple-800/30 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600/20 to-purple-600/20 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <UserPlus className="w-7 h-7 text-fuchsia-300" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Nenhum paciente cadastrado no prontuário ainda
            </h3>
            <p className="text-xs text-purple-200 max-w-md mx-auto mb-5 leading-relaxed">
              Inicie seu consultório cadastrando o primeiro paciente. O NutrinK calculará automaticamente TMB, GET, IMC e gerará planos alimentares personalizados com a ajuda da NUTRIA.
            </p>
            <button
              onClick={onOpenNewPatient}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50 transition-all hover:scale-[1.02]"
              id="btn-cadastrar-primeiro-paciente"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cadastrar Primeiro Paciente</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.slice(0, 6).map((patient, pIdx) => (
              <div
                key={patient.id ? `patient-card-${patient.id}` : `pat-card-idx-${pIdx}`}
                onClick={() => onSelectPatient(patient.id)}
                className="p-4 rounded-2xl bg-[#1d0637] border border-purple-800/40 hover:border-fuchsia-500/60 cursor-pointer transition-all hover:translate-y-[-2px] group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-fuchsia-300 transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-purple-200 mt-0.5 font-medium">
                      {patient.age} anos • {patient.gender === 'masculino' ? 'Masc' : 'Fem'} • {patient.currentWeightKg} kg
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#2c0a52] text-fuchsia-200 border border-purple-700/60">
                    {patient.objective.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-purple-200 font-medium">
                  <div>
                    IMC: <span className="font-bold text-white">{patient.bmi}</span>
                  </div>
                  <div>
                    %Gord: <span className="font-bold text-white">{patient.bodyFatPercentage}%</span>
                  </div>
                  <div>
                    GET: <span className="font-bold text-white">{patient.get} kcal</span>
                  </div>
                </div>

                {patient.tags && patient.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {patient.tags.slice(0, 2).map((t, idx) => (
                      <span key={`${patient.id || pIdx}-tag-${idx}-${t}`} className="text-[10px] font-semibold px-2 py-0.5 bg-[#29094e] text-purple-200 rounded-md border border-purple-800/40">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
