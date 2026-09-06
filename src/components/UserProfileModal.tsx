import React, { useState } from 'react';
import { 
  User, 
  Crown, 
  Sparkles, 
  X, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Stethoscope, 
  ShieldCheck, 
  MessageSquare, 
  LogIn,
  UserPlus,
  RefreshCw,
  LogOut,
  ChevronRight,
  ExternalLink,
  Lock,
  Phone,
  MapPin,
  Building2,
  FileText,
  Save,
  Check,
  Printer
} from 'lucide-react';
import { UserAccount, SubscriptionPlan } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onUpdateUserAccount: (updated: Partial<UserAccount>) => void;
  onOpenSubscriptionModal?: () => void;
  onOpenLoginModal?: (tab?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onUpdateUserAccount,
  onOpenSubscriptionModal,
  onOpenLoginModal,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'consultorio' | 'gestao'>('consultorio');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states for editing
  const [formData, setFormData] = useState({
    name: userAccount.name || '',
    crn: userAccount.crn || '',
    specialty: userAccount.specialty || '',
    email: userAccount.email || '',
    phone: userAccount.phone || '',
    clinicName: userAccount.clinicName || '',
    clinicAddress: userAccount.clinicAddress || '',
    prescriptionFooter: userAccount.prescriptionFooter || ''
  });

  if (!isOpen) return null;

  const isFree = userAccount.plan === 'free';
  const planName = userAccount.plan === 'premium_anual' 
    ? 'Plano Premium Anual' 
    : userAccount.plan === 'premium_mensal' 
    ? 'Plano Premium Mensal' 
    : 'Plano Gratuito (Free)';

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const updatedData: Partial<UserAccount> = {
      name: formData.name.trim() || userAccount.name,
      crn: formData.crn.trim() || userAccount.crn,
      specialty: formData.specialty.trim() || userAccount.specialty,
      email: formData.email.trim() || userAccount.email,
      phone: formData.phone.trim(),
      clinicName: formData.clinicName.trim(),
      clinicAddress: formData.clinicAddress.trim(),
      prescriptionFooter: formData.prescriptionFooter.trim()
    };

    onUpdateUserAccount(updatedData);

    // Also update registered users in local storage if exists
    try {
      const registeredUsersRaw = localStorage.getItem('nutrink_registered_users');
      if (registeredUsersRaw) {
        const list = JSON.parse(registeredUsersRaw);
        const index = list.findIndex((u: any) => u.email?.toLowerCase() === userAccount.email?.toLowerCase() || u.id === userAccount.id);
        if (index >= 0) {
          list[index] = { ...list[index], ...updatedData };
          localStorage.setItem('nutrink_registered_users', JSON.stringify(list));
        }
      }
    } catch {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleLogoutAction = () => {
    setShowConfirmLogout(false);
    onClose();
    if (onLogout) {
      onLogout();
    } else if (onOpenLoginModal) {
      onOpenLoginModal('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-xl w-full text-white shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col my-auto shadow-purple-950/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Strip */}
        <div className="p-4 sm:p-5 bg-[#1e053a] border-b border-purple-800/50 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-fuchsia-950/50 border border-fuchsia-400/30 shrink-0">
              {formData.name ? formData.name.charAt(0) : 'P'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {formData.name || 'Perfil Profissional'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-fuchsia-300 font-bold">
                  {formData.crn || userAccount.crn || 'Registro Ativo'}
                </span>
                <span>• {formData.specialty || userAccount.specialty}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white bg-[#2b0852] hover:bg-[#390b6d] rounded-xl border border-purple-700/50 transition-all cursor-pointer"
            id="btn-close-profile-modal"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-purple-800/40 bg-[#17032c] px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('consultorio')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'consultorio'
                ? 'border-fuchsia-400 text-fuchsia-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Dados do Consultório & Receitas</span>
          </button>
          
          <button
            onClick={() => setActiveTab('perfil')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'perfil'
                ? 'border-fuchsia-400 text-fuchsia-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Plano & Assinatura</span>
          </button>

          <button
            onClick={() => setActiveTab('gestao')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gestao'
                ? 'border-fuchsia-400 text-fuchsia-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sessão & Contas</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">

          {/* TAB 1: DADOS DO CONSULTÓRIO & RECEITAS */}
          {activeTab === 'consultorio' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Informative Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#2a084e] to-indigo-950/70 border border-purple-700/50 text-purple-200 flex items-start gap-2.5">
                <Printer className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-relaxed">
                  <strong className="text-white">Personalização Automática de Impressos:</strong> Preencha ou atualize seus dados abaixo a qualquer momento. Quanto mais detalhes você incluir, mais ricas e personalizadas serão suas receitas, planos alimentares e atestados.
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Dados do consultório salvos e atualizados com sucesso!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Nome Completo do Profissional
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Dra. Larissa Mendes"
                    className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Registro Profissional (CRN / CRM)
                  </label>
                  <input
                    type="text"
                    value={formData.crn}
                    onChange={(e) => setFormData({ ...formData, crn: e.target.value })}
                    placeholder="Ex: CRN-3 45892/SP ou CRM-SP 123456"
                    className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Especialidade Principal
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ex: Nutrição Esportiva & Clínica"
                    className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Telefone / WhatsApp do Consultório
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Nome da Clínica / Consultório (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="Ex: Clínica NutriLife Saúde Integrada"
                    className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                    E-mail Profissional
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ex: contato@dralarissa.com.br"
                    className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Endereço do Consultório (Cabeçalho de Documentos)
                </label>
                <input
                  type="text"
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                  placeholder="Ex: Av. Paulista, 1000, Cj. 804 - Bela Vista, São Paulo - SP"
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Rodapé Personalizado para Receitas & Impressos (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.prescriptionFooter}
                  onChange={(e) => setFormData({ ...formData, prescriptionFooter: e.target.value })}
                  placeholder="Ex: Atendimento com agendamento prévio. Retorno recomendado em 30 a 45 dias para reavaliação física e ajustes do plano."
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-medium resize-none"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-2xl bg-[#120326] border border-purple-800/40 space-y-1 text-slate-300">
                <span className="text-[10px] uppercase font-bold text-fuchsia-400 block mb-1">
                  👁️ Prévia do Cabeçalho de Impressão
                </span>
                <div className="bg-white text-slate-900 p-2.5 rounded-lg text-[10px] space-y-0.5 border border-slate-300">
                  <div className="font-black text-xs text-purple-900">{formData.name || 'Nome do Profissional'}</div>
                  <div className="text-slate-600 font-semibold">{formData.crn || 'CRN / CRM'} • {formData.specialty || 'Especialidade'}</div>
                  {formData.clinicName && <div className="text-slate-700 font-bold">{formData.clinicName}</div>}
                  {formData.clinicAddress && <div className="text-slate-500">{formData.clinicAddress}</div>}
                  {formData.phone && <div className="text-slate-500">Tel: {formData.phone}</div>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-purple-300 hover:text-white font-bold transition-all"
                >
                  Voltar ao App
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-fuchsia-950/50 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] cursor-pointer"
                  id="btn-save-clinic-profile"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados do Consultório</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: PLANO & ASSINATURA */}
          {activeTab === 'perfil' && (
            <div className="space-y-4">
              
              {/* Plan Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isFree 
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
                  : 'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    isFree ? 'bg-amber-900/60 text-amber-300' : 'bg-fuchsia-900/60 text-fuchsia-300'
                  }`}>
                    {isFree ? <User className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                      Status da Assinatura
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {planName}
                    </span>
                  </div>
                </div>

                {isFree && onOpenSubscriptionModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubscriptionModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-950/50 shrink-0 cursor-pointer"
                  >
                    Fazer Upgrade
                  </button>
                )}
              </div>

              {/* Resource Access Information */}
              <div className="bg-[#1b0638] border border-purple-800/50 rounded-2xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Recursos do Seu Plano
                </h3>

                <div className="flex items-center justify-between py-1.5 border-b border-purple-900/40">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    Copiloto NUTRIA
                  </span>
                  <span className="font-bold text-fuchsia-300">
                    {isFree ? `${userAccount.dailyMessageCount} de ${userAccount.dailyMessageLimit} mensagens hoje` : 'Ilimitado (Sem limites)'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-purple-900/40">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Relatórios & Impressões
                  </span>
                  <span className="font-bold text-emerald-400">
                    {isFree ? 'Versão Essencial' : 'Completo & Personalizado'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-purple-900/40">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Data de Ativação
                  </span>
                  <span className="font-semibold text-white">{userAccount.activeSince || 'Ativo'}</span>
                </div>

                {userAccount.subscriptionExpiresAt && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-purple-300 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Próxima Renovação
                    </span>
                    <span className="font-bold text-amber-300">{userAccount.subscriptionExpiresAt}</span>
                  </div>
                )}
              </div>

              {onOpenSubscriptionModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscriptionModal();
                  }}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#2a084e] via-[#3d0b70] to-[#2a084e] hover:from-[#370b66] hover:to-[#370b66] border border-fuchsia-500/50 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Ver Todos os Planos & Comparativo Oficial</span>
                </button>
              )}

            </div>
          )}

          {/* TAB 3: GESTÃO DE SESSÃO & CONTAS */}
          {activeTab === 'gestao' && (
            <div className="space-y-4">
              
              <div className="bg-[#1b0638] border border-purple-800/50 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Alternância de Usuários & Contas
                </h3>
                <p className="text-xs text-purple-300 leading-relaxed">
                  Você pode alternar entre perfis profissionais já registrados ou criar um novo acesso com outro e-mail.
                </p>

                {onOpenLoginModal && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLoginModal('login');
                      }}
                      className="p-3 rounded-2xl bg-[#1d063a] hover:bg-[#2a0954] border border-purple-800/60 text-purple-200 hover:text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer group"
                      id="btn-profile-switch-account"
                    >
                      <RefreshCw className="w-4 h-4 text-fuchsia-400 group-hover:rotate-180 transition-transform" />
                      <span>🔄 Trocar de Conta</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenLoginModal('register');
                      }}
                      className="p-3 rounded-2xl bg-[#1d063a] hover:bg-[#2a0954] border border-purple-800/60 text-purple-200 hover:text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                      id="btn-profile-new-register"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>➕ Novo Cadastro</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Prominent Log Out */}
              {!showConfirmLogout ? (
                <button
                  onClick={() => setShowConfirmLogout(true)}
                  className="w-full p-3 rounded-2xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/50 hover:border-rose-500/80 text-rose-300 hover:text-rose-100 font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  id="btn-profile-logout"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>🚪 Sair da Conta / Encerrar Sessão</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600 text-center space-y-2.5 animate-in fade-in">
                  <p className="text-xs text-rose-200 font-bold">
                    Deseja realmente encerrar sua sessão profissional?
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handleLogoutAction}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                      id="btn-confirm-logout"
                    >
                      Sim, Encerrar Sessão
                    </button>
                    <button
                      onClick={() => setShowConfirmLogout(false)}
                      className="px-4 py-1.5 rounded-xl bg-[#26084c] text-purple-200 hover:text-white font-bold text-xs border border-purple-700/60 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
