import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Video,
  DollarSign, 
  Calculator, 
  Bot,
  Crown,
  Sparkles,
  Radio
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'patients' | 'calendar' | 'telemedicine' | 'finance' | 'nutricalc' | 'nutria_hub' | 'plans';

interface NavigationProps {
  activeTab?: ActiveTab;
  currentTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onChangeTab?: (tab: ActiveTab) => void;
  onOpenSubscriptionModal?: () => void;
  unreadNutriaAlerts?: number;
  todayAppointmentsCount?: number;
  pendingAppointmentsCount?: number;
  isTelemedicineActive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  currentTab,
  setActiveTab,
  onChangeTab,
  onOpenSubscriptionModal,
  todayAppointmentsCount,
  pendingAppointmentsCount,
  isTelemedicineActive
}) => {
  const current = activeTab || currentTab || 'dashboard';
  const handleSelect = (tab: ActiveTab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onChangeTab) onChangeTab(tab);
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Geral',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'patients' as ActiveTab,
      label: 'Pacientes & Prontuários',
      icon: Users,
      badge: null
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Agenda & Calendário',
      icon: CalendarDays,
      badge: (todayAppointmentsCount || pendingAppointmentsCount) ? (todayAppointmentsCount || pendingAppointmentsCount) : null
    },
    {
      id: 'telemedicine' as ActiveTab,
      label: 'Telemedicina & Vídeo',
      icon: Video,
      badge: isTelemedicineActive ? 'AO VIVO' : 'HD',
      isLive: isTelemedicineActive
    },
    {
      id: 'finance' as ActiveTab,
      label: 'Financeiro & Faturamento',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'nutricalc' as ActiveTab,
      label: 'NutriCalc & Protocolos',
      icon: Calculator,
      badge: 'Cálculos'
    },
    {
      id: 'nutria_hub' as ActiveTab,
      label: 'Copiloto NUTRIA (IA)',
      icon: Bot,
      isSpecial: true
    },
    {
      id: 'plans' as ActiveTab,
      label: 'Planos e Assinaturas',
      icon: Crown,
      badge: 'PRO'
    }
  ];

  return (
    <nav className="bg-[#140327] border-b border-purple-900/40 px-3 sm:px-6 lg:px-8 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-2 sm:py-2.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;
          
          if (item.id === 'nutria_hub') {
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50' 
                    : 'bg-[#29094e] text-fuchsia-200 border border-purple-700/50 hover:bg-[#360d66] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-fuchsia-400 animate-pulse'}`} />
                <span>{item.label}</span>
                <span className="flex h-2 w-2 rounded-full bg-fuchsia-400"></span>
              </button>
            );
          }

          if (item.id === 'plans') {
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-md ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-fuchsia-500 text-slate-950 border-2 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-950/60 font-black' 
                    : 'bg-gradient-to-r from-amber-500/25 via-[#2b0852] to-fuchsia-950/70 hover:from-amber-500/40 hover:to-fuchsia-900/90 text-amber-200 hover:text-white border border-amber-400/60 shadow-purple-950/50'
                }`}
              >
                <Crown className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950 fill-slate-950' : 'text-amber-400 fill-amber-400'}`} />
                <span className={isActive ? 'font-black text-slate-950' : 'font-extrabold text-amber-200'}>{item.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'}`}>
                  {isActive ? 'ATIVO' : 'UPGRADE'}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#26084c] text-white border border-fuchsia-500/40 shadow-sm'
                  : 'text-purple-200 hover:text-white hover:bg-[#1f063e]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-fuchsia-400' : 'text-purple-300'}`} />
              <span className={isActive ? 'text-white font-bold' : 'text-purple-200'}>{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  (item as any).isLive
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/80 animate-pulse flex items-center gap-1'
                    : typeof item.badge === 'number'
                    ? 'bg-fuchsia-900/90 text-fuchsia-200 border border-fuchsia-500/60'
                    : 'bg-[#2e0b59] text-purple-200 border border-purple-700/50'
                }`}>
                  {(item as any).isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
