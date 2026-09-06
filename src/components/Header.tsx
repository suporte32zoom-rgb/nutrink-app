import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  UserPlus, 
  DollarSign, 
  Search, 
  Bot, 
  Crown, 
  UserCheck, 
  LogIn, 
  ShieldCheck, 
  ChevronDown, 
  Boxes,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarDays,
  Video,
  Calculator
} from 'lucide-react';
import { NutrinKLogo } from './NutrinKLogo';
import { UserAccount } from '../types';

interface HeaderProps {
  onOpenNutriaChat: () => void;
  onOpenNewPatient: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewTransaction: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenLoginModal?: () => void;
  userAccount?: UserAccount;
  globalSearch?: string;
  setGlobalSearch?: (q: string) => void;
  activePatientCount?: number;
  currentTab?: string;
  onChangeTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNutriaChat,
  onOpenNewPatient,
  onOpenNewAppointment,
  onOpenNewTransaction,
  onOpenSubscriptionModal,
  onOpenProfileModal,
  onOpenLoginModal,
  userAccount,
  globalSearch = '',
  setGlobalSearch,
  activePatientCount,
  currentTab = 'dashboard',
  onChangeTab
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFree = !userAccount || userAccount.plan === 'free';
  const planLabel = userAccount?.plan === 'premium_anual' 
    ? 'ANUAL PRO' 
    : userAccount?.plan === 'premium_mensal' 
    ? 'MENSAL PRO' 
    : 'FREE';

  const handleNavClick = (tab: string) => {
    if (onChangeTab) {
      onChangeTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes & Prontuários', icon: Users },
    { id: 'calendar', label: 'Agenda & Calendário', icon: CalendarDays },
    { id: 'telemedicine', label: 'Telemedicina & Vídeo', icon: Video },
    { id: 'finance', label: 'Financeiro & Faturamento', icon: DollarSign },
    { id: 'nutricalc', label: 'NutriCalc & Protocolos', icon: Calculator },
    { id: 'nutria_hub', label: 'Copiloto NUTRIA (IA)', icon: Bot },
    { id: 'plans', label: 'Planos & Assinaturas', icon: Crown }
  ];

  return (
    <header 
      className="bg-[#120326] text-white border-b border-purple-900/50 sticky top-0 shadow-lg shadow-purple-950/40 pt-2 sm:pt-3 pb-2 sm:pb-3 px-3 sm:px-6 lg:px-8 transition-all"
      style={{ zIndex: 1000 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[3.25rem]">
          
          {/* Mobile Hamburger Menu Button (z-index: 1000) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            style={{ zIndex: 1000 }}
            className="md:hidden p-2 rounded-xl bg-[#220743] hover:bg-[#2e0b59] text-purple-200 hover:text-white border border-purple-700/60 transition-all flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Abrir Menu de Navegação"
            title="Menu Principal"
            id="btn-header-hamburger-menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-fuchsia-400" /> : <Menu className="w-5 h-5 text-purple-200" />}
          </button>

          {/* Official NutrinK Original Logo with NUTRIA indicator */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NutrinKLogo size="md" withGlow={true} className="shrink-0" />
            
            {/* Plan Badge (Desktop/Tablet) */}
            {isFree ? (
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 hover:bg-amber-900/80 transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                title="Plano Gratuito • Clique para fazer Upgrade"
                id="header-plan-badge-free"
              >
                <span>FREE ({userAccount?.dailyMessageCount || 0}/{userAccount?.dailyMessageLimit || 30})</span>
                <span className="text-amber-400 font-extrabold underline">Upgrade</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-fuchsia-950 via-purple-950 to-indigo-950 text-fuchsia-300 border border-fuchsia-500/50 hover:border-fuchsia-400 transition-all uppercase tracking-wider shadow-sm"
                title="Plano Premium Ativo • Clique para gerenciar"
                id="header-plan-badge-premium"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{planLabel}</span>
              </button>
            )}

            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-purple-200 border-l border-purple-800/60 pl-3">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
              <span>Copiloto <strong>NUTRIA</strong> Ativo</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
                placeholder="Buscar paciente, prontuário..."
                className="w-full bg-[#1e073c] border border-purple-700/50 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/50 transition-all"
              />
            </div>
          </div>

          {/* Quick Action Buttons & User Header Identity */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Botão de Destaque Superior: FAZER UPGRADE / PLANOS E ASSINATURAS */}
            {onOpenSubscriptionModal && (
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black rounded-xl transition-all shadow-lg active:scale-95 shrink-0 border bg-gradient-to-r from-amber-400 via-amber-300 to-fuchsia-500 hover:from-amber-300 hover:to-fuchsia-400 text-slate-950 border-amber-200/90 shadow-amber-950/50 hover:shadow-amber-500/30 ring-2 ring-amber-400/60 animate-pulse hover:animate-none"
                title="Ver Planos e Assinaturas - Fazer Upgrade"
                id="btn-header-upgrade-cta"
              >
                <Crown className="w-4 h-4 text-slate-950 fill-slate-950 shrink-0" />
                <span className="font-black tracking-tight">Fazer Upgrade</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-950 hidden sm:inline-block shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNewPatient}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#220743] hover:bg-[#2e0b59] text-purple-100 border border-purple-700/60 rounded-xl transition-all shadow-sm hover:border-fuchsia-400/50"
              title="Cadastrar Novo Paciente"
            >
              <UserPlus className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>Paciente</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewAppointment}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#220743] hover:bg-[#2e0b59] text-purple-100 border border-purple-700/60 rounded-xl transition-all shadow-sm hover:border-fuchsia-400/50"
              title="Agendar Consulta"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-300" />
              <span>Consulta</span>
            </button>

            {/* NUTRIA Assistant Trigger Button with original brand gradient */}
            <button
              type="button"
              onClick={onOpenNutriaChat}
              className="relative inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-fuchsia-950/50 transition-all transform hover:scale-[1.03] active:scale-[0.98] border border-fuchsia-400/40 shrink-0"
              title="Falar com Copiloto IA NUTRIA"
              id="btn-header-nutria-chat"
            >
              <Bot className="w-4 h-4 text-fuchsia-100 shrink-0" />
              <span className="hidden sm:inline">NUTRIA</span>
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-200"></span>
              </span>
            </button>

            {/* User Profile Badge if authenticated, or Cadastrar/Entrar button if guest */}
            {userAccount && userAccount.email && userAccount.id !== 'usr-unauthenticated' ? (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#220743] hover:bg-[#2e0b59] border border-purple-700/60 text-purple-200 hover:text-white transition-all shadow-sm group shrink-0"
                title={`Profissional: ${userAccount.name} • ${userAccount.crn} • ${userAccount.specialty} • Plano: ${planLabel}`}
                id="btn-header-user-profile"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-fuchsia-400/30 shrink-0">
                  {userAccount.name.charAt(0)}
                </div>
                
                {/* Professional Name, Title (Nutrólogo/Nutricionista), Registry and Plan Tag */}
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-bold text-white truncate max-w-[130px] flex items-center gap-1">
                    <span>{userAccount.name.split(' ')[0]} {userAccount.name.split(' ')[1] || ''}</span>
                  </div>
                  <div className="text-[10px] text-purple-300 font-medium flex items-center gap-1.5">
                    <span className="truncate max-w-[95px] text-fuchsia-300 font-semibold">
                      {userAccount.crn?.includes('CRM') ? 'Nutrólogo' : 'Nutricionista'}
                    </span>
                    <span className={`px-1 rounded text-[8px] font-extrabold uppercase ${
                      userAccount.plan === 'premium_anual' ? 'bg-amber-950 text-amber-300 border border-amber-500/50' :
                      userAccount.plan === 'premium_mensal' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50' :
                      'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}>
                      {planLabel}
                    </span>
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-300 transition-transform shrink-0" />
              </button>
            ) : onOpenLoginModal ? (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 border border-purple-500/50 transition-all shadow-md shrink-0 active:scale-95"
                title="Cadastrar ou acessar sua conta profissional"
                id="btn-header-login-prompt"
              >
                <LogIn className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" />
                <span className="hidden sm:inline">Entrar / Cadastrar</span>
                <span className="sm:hidden font-bold text-[11px]">Entrar</span>
              </button>
            ) : null}

            {/* Quick Login / Switch Account Button for logged in users */}
            {userAccount && userAccount.email && userAccount.id !== 'usr-unauthenticated' && onOpenLoginModal && (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="hidden 2xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-purple-300 hover:text-white bg-[#1b0537] hover:bg-[#27084e] border border-purple-800/50 transition-all shrink-0"
                title="Acessar outra conta / Cadastrar novo profissional"
              >
                <LogIn className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Trocar</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu (z-index: 1000) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden mt-3 pt-3 border-t border-purple-800/60 space-y-2 bg-[#17042f]/95 p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-fadeIn"
          style={{ zIndex: 1000 }}
        >
          {/* Quick Search on Mobile */}
          <div className="relative w-full mb-3">
            <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
              placeholder="Buscar paciente, prontuário..."
              className="w-full bg-[#1e073c] border border-purple-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl font-medium transition-all text-left ${
                    isActive 
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold shadow-md shadow-fuchsia-950/40' 
                      : 'bg-[#220743]/80 hover:bg-[#2d0959] text-purple-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-fuchsia-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons inside Mobile Menu */}
          <div className="pt-2 border-t border-purple-800/40 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onOpenNewPatient();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 min-w-[120px] py-2 px-2.5 rounded-xl bg-[#220743] hover:bg-[#2d0959] text-purple-100 border border-purple-700/50 flex items-center justify-center gap-1.5 font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>+ Paciente</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenNewAppointment();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 min-w-[120px] py-2 px-2.5 rounded-xl bg-[#220743] hover:bg-[#2d0959] text-purple-100 border border-purple-700/50 flex items-center justify-center gap-1.5 font-semibold"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-300" />
              <span>+ Consulta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenNewTransaction();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 min-w-[120px] py-2 px-2.5 rounded-xl bg-[#220743] hover:bg-[#2d0959] text-purple-100 border border-purple-700/50 flex items-center justify-center gap-1.5 font-semibold"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
              <span>+ Receita</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
