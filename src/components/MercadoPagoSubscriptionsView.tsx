import React, { useState } from 'react';
import { 
  CreditCard, 
  Repeat, 
  Link2, 
  Laptop, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Crown, 
  Copy, 
  Check, 
  QrCode, 
  HelpCircle, 
  UserCheck, 
  Layers, 
  ChevronRight, 
  BadgeCheck, 
  Globe, 
  Wallet, 
  Barcode, 
  Zap,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, SubscriptionPlan } from '../types';
import { MercadoPagoLogo } from './MercadoPagoLogo';

interface MercadoPagoSubscriptionsViewProps {
  userAccount?: UserAccount;
  onOpenSubscriptionModal?: () => void;
  onSelectPlan?: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual') => void;
}

export const MercadoPagoSubscriptionsView: React.FC<MercadoPagoSubscriptionsViewProps> = ({
  userAccount,
  onOpenSubscriptionModal,
  onSelectPlan
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [selectedPlanTab, setSelectedPlanTab] = useState<'anual' | 'mensal'>('anual');

  const MP_LINKS = {
    anual: 'https://mpago.la/1ZYT8kZ',
    mensal: 'https://mpago.la/1Y7wbXw'
  };

  const handleCopyLink = (type: 'anual' | 'mensal', e: React.MouseEvent) => {
    e.stopPropagation();
    const link = MP_LINKS[type];
    navigator.clipboard.writeText(link);
    setCopiedLink(type);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.85 }
    });
    setTimeout(() => setCopiedLink(null), 3000);
  };

  const handleOpenLink = (type: 'anual' | 'mensal') => {
    const link = MP_LINKS[type];
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.75 }
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const renderDots = (amount: number, total: number = 4) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              index < amount ? 'bg-[#009EE3]' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const isUserPremium = userAccount?.plan === 'premium_anual' || userAccount?.plan === 'premium_mensal';

  return (
    <div className="space-y-10 pb-16 text-slate-100 animate-fadeIn" id="mercadopago-subscription-portal">
      
      {/* Quick Top Plan Selector & Active Status Card */}
      <div className="bg-gradient-to-r from-[#18042f] via-[#240845] to-[#120324] border border-fuchsia-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/70 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#009EE3]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-400/50 text-fuchsia-300 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Assinatura Oficial Mercado Pago • NutrinK</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Planos de Assinatura Recorrente <span className="text-[#15DEC0]">Mercado Pago</span>
            </h1>
            
            <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-normal">
              Cobranças automáticas seguras, sem complicações e com ativação instantânea para seu consultório de nutrição e nutrologia.
            </p>

            {isUserPremium ? (
              <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Seu consultório já possui um plano ativo ({userAccount?.plan === 'premium_anual' ? 'Plano Anual' : 'Plano Mensal'})</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Escolha entre o <strong>Plano Anual (com desconto)</strong> ou <strong>Plano Mensal</strong> abaixo para assinar agora.</span>
              </div>
            )}
          </div>

          {/* Quick Subscription Links Box */}
          <div className="bg-[#120324]/90 border border-cyan-500/40 p-4 sm:p-5 rounded-2xl flex flex-col gap-3 min-w-[300px] sm:min-w-[360px] shadow-2xl">
            <div className="flex items-center justify-between">
              <MercadoPagoLogo variant="full" />
              <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Oficial</span>
              </span>
            </div>

            {/* Anual Button / Link */}
            <div className="p-3.5 bg-[#1e073c] border border-amber-400/50 rounded-xl hover:border-amber-400 transition-all shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-black text-white">Plano Anual Pro</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                  Economize 16%
                </span>
              </div>
              <div className="text-xs text-purple-200 font-semibold mb-2.5">
                R$ 399,00 / ano <span className="text-emerald-400 font-bold">(R$ 33,25/mês)</span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenLink('anual')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#009EE3] via-[#0089C7] to-[#0070A3] hover:from-[#0089C7] hover:to-[#005f8c] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 border border-cyan-300/40"
                id="btn-mp-anual-direct"
              >
                <MercadoPagoLogo variant="icon" className="w-4 h-4 shrink-0" />
                <span>Mercado Pago Assinar Plano • R$ 399,00</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
              </button>
            </div>

            {/* Mensal Button / Link */}
            <div className="p-3.5 bg-[#1e073c] border border-purple-700/60 rounded-xl hover:border-fuchsia-400/50 transition-all shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span className="text-xs font-black text-white">Plano Mensal Pro</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-900 text-purple-200 border border-purple-600/40">
                  Recorrente
                </span>
              </div>
              <div className="text-xs text-purple-200 font-semibold mb-2.5">
                R$ 39,00 / mês <span className="text-purple-300 font-normal">(sem fidelidade)</span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenLink('mensal')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 border border-fuchsia-400/40"
                id="btn-mp-mensal-direct"
              >
                <MercadoPagoLogo variant="icon" className="w-4 h-4 shrink-0" />
                <span>Mercado Pago Assinar Plano • R$ 39,00</span>
                <ExternalLink className="w-3.5 h-3.5 text-fuchsia-200 shrink-0" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRODUCT LANDING HERO (Official Mercado Pago Architecture & Copy) */}
      {/* ========================================================================= */}
      <section className="bg-[#120326] border border-purple-900/60 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl" id="section-hero-mercadopago">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#009EE3]/15 border border-[#009EE3]/40 text-[#009EE3] text-xs font-extrabold uppercase tracking-wider">
            <MercadoPagoLogo variant="icon" className="w-4 h-4 shrink-0" />
            <span>Mercado Pago Soluções de Pagamento Recorrente</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Receba pagamentos recorrentes com <span className="text-[#009EE3]">Planos de assinatura</span>
          </h2>

          <p className="text-sm sm:text-lg text-purple-200/90 leading-relaxed font-normal max-w-3xl mx-auto">
            Esta solução permite gerenciar cobranças recorrentes direto pelo app ou site do Mercado Pago, facilitando a gestão do dia a dia e sem a necessidade de programação.
          </p>

          {/* 4 Pillars of Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <div className="bg-[#1c0638] border border-purple-800/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 hover:border-fuchsia-400/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300 group-hover:scale-110 transition-transform">
                <Repeat className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                Cobranças recorrentes
              </span>
            </div>

            <div className="bg-[#1c0638] border border-purple-800/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 hover:border-[#009EE3]/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#009EE3]/20 border border-[#009EE3]/40 flex items-center justify-center text-[#009EE3] group-hover:scale-110 transition-transform">
                <Link2 className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                Para pagamentos online
              </span>
            </div>

            <div className="bg-[#1c0638] border border-purple-800/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 hover:border-emerald-400/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <Laptop className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                Sem integração
              </span>
            </div>

            <div className="bg-[#1c0638] border border-purple-800/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 hover:border-amber-400/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                Periodicidade personalizável
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 rounded-2xl bg-[#180530] border border-purple-800/60 text-xs sm:text-sm text-purple-200 flex items-center justify-center gap-2 flex-wrap">
            <Info className="w-4 h-4 text-[#009EE3] shrink-0" />
            <span>Busca opções sem desenvolvimento?</span>
            <a 
              href="https://www.mercadopago.com.br/developers/pt/docs#online-payments" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#009EE3] hover:text-[#38bdf8] font-bold underline inline-flex items-center gap-1"
            >
              <span>Explore mais soluções</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRODUCT LANDING: O QUE OFERECE (What it offers) */}
      {/* ========================================================================= */}
      <section className="space-y-6" id="section-what-it-offers">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            O que oferece
          </h2>
          <p className="text-sm sm:text-base text-purple-200/80">
            Combine diversas funcionalidades para garantir a segurança e conversão das operações.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Facilidade de uso */}
          <div className="bg-[#15042a] border border-purple-800/60 rounded-3xl p-6 space-y-4 hover:border-fuchsia-400/50 transition-all flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-950 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Facilidade de uso
              </h3>
              <ul className="space-y-2.5 text-xs text-purple-200/90">
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 font-bold">•</span>
                  <span>Crie um plano de assinatura com sua conta do Mercado Pago.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 font-bold">•</span>
                  <span>Compartilhe seu plano de assinatura com um link ou adicione um botão em seu site.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 font-bold">•</span>
                  <span>Acompanhe as métricas das suas cobranças e compare com períodos anteriores.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Gestão centralizada */}
          <div className="bg-[#15042a] border border-purple-800/60 rounded-3xl p-6 space-y-4 hover:border-[#009EE3]/50 transition-all flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#009EE3]/20 border border-[#009EE3]/40 flex items-center justify-center text-[#009EE3]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Gestão centralizada
              </h3>
              <ul className="space-y-2.5 text-xs text-purple-200/90">
                <li className="flex items-start gap-2">
                  <span className="text-[#009EE3] font-bold">•</span>
                  <span>Gerencie seus planos de assinatura diretamente da sua conta do Mercado Pago.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#009EE3] font-bold">•</span>
                  <span>Cobre de forma automática por serviços, conteúdos, planos e outros tipos de ofertas.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Personalização */}
          <div className="bg-[#15042a] border border-purple-800/60 rounded-3xl p-6 space-y-4 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Personalização
              </h3>
              <ul className="space-y-2 text-xs text-purple-200/90">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Defina a periodicidade ideal e receba pagamentos semanais, mensais ou anuais.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Permita que assinantes escolham quanto pagar - ideal para doações.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Ofereça um período de teste gratuito para que seus clientes conheçam seu serviço ou produto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Defina a duração do seu plano de assinatura e a data de faturamento.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Redirecione seus clientes para uma URL personalizada assim que se inscreverem.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: Comunicação clara */}
          <div className="bg-[#15042a] border border-purple-800/60 rounded-3xl p-6 space-y-4 hover:border-emerald-400/50 transition-all flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Comunicação clara
              </h3>
              <ul className="space-y-2.5 text-xs text-purple-200/90">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Cobre de forma simples com ciclos de faturamento automático.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Os clientes são notificados sobre mudanças na assinatura e pagamentos pendentes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Os assinantes gerenciam suas assinaturas através do aplicativo ou do site do Mercado Pago.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PRODUCT LANDING: COMO FUNCIONA (How it works with GIF) */}
      {/* ========================================================================= */}
      <section className="bg-[#130327] border border-purple-900/60 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl" id="section-how-works">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-800">
            <span>Passo a Passo Oficial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Como funciona
          </h2>
          <p className="text-sm sm:text-base text-purple-200/80">
            Crie um plano de assinatura, defina valor e periodicidade, compartilhe o link e comece a cobrar automaticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Animated Demonstration GIF Container */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full bg-[#1c0638] border-2 border-purple-700/60 rounded-3xl overflow-hidden shadow-2xl relative group">
              <div className="bg-[#240847] px-4 py-2.5 border-b border-purple-800/80 flex items-center justify-between text-xs text-purple-300">
                <span className="font-bold flex items-center gap-2">
                  <Repeat className="w-3.5 h-3.5 text-[#009EE3]" />
                  <span>Demonstração de Criação de Plano de Assinatura</span>
                </span>
                <span className="text-[10px] bg-[#120324] px-2 py-0.5 rounded text-fuchsia-300 font-semibold">
                  GIF Oficial MP
                </span>
              </div>

              <div className="p-3 bg-[#0d011c] flex items-center justify-center">
                <img 
                  src="https://http2.mlstatic.com/storage/dx-devsite/docs-assets/custom-upload/2025/5/12/1749741479820-subscriptionspt.gif"
                  alt="Criar plano de assinatura Mercado Pago"
                  className="rounded-2xl max-h-[380px] w-full object-contain shadow-inner"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              <div className="p-4 bg-[#1e073c] border-t border-purple-800/60 flex items-center justify-between gap-3">
                <span className="text-xs text-purple-200 font-medium">
                  Interface nativa e fluida no ambiente Mercado Pago
                </span>
                <a
                  href="https://www.mercadopago.com.br/developers/pt/docs/subscription-plans/create-subscription-plan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#009EE3] hover:text-[#38bdf8] flex items-center gap-1 underline"
                >
                  <span>Guia de criação</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Process Timeline / Steps */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-fuchsia-400 tracking-wider">
                Fluxo de Cobrança
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Processo de venda
              </h3>
            </div>

            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="bg-[#1a0533] border border-purple-800/60 rounded-2xl p-4 flex items-start gap-3.5 hover:border-purple-600 transition-all">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Definição do Plano
                  </h4>
                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    Crie um plano de assinatura, definindo nome, valor e periodicidade das cobranças.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#1a0533] border border-purple-800/60 rounded-2xl p-4 flex items-start gap-3.5 hover:border-purple-600 transition-all">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Compartilhamento Rápido
                  </h4>
                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    Compartilhe o link de cobrança pelas redes sociais ou adicione-o como um botão no seu site.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#1a0533] border border-purple-800/60 rounded-2xl p-4 flex items-start gap-3.5 hover:border-purple-600 transition-all">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Recebimento Automático
                  </h4>
                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    Inicie o recebimento recorrente dos pagamentos dos assinantes de forma 100% automatizada.
                  </p>
                </div>
              </div>

            </div>

            {/* Direct Create Link Button */}
            <div className="pt-2">
              <a
                href="https://www.mercadopago.com.br/developers/pt/docs/subscription-plans/create-subscription-plan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#009EE3] to-[#0070a0] hover:from-[#0089C7] hover:to-[#005f88] text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-950/60 border border-cyan-400/40 transition-transform active:scale-95"
                id="btn-mp-create-subscription-docs"
              >
                <span>Criar plano de assinatura</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PRODUCT LANDING: QUAIS OS DIFERENCIAIS (Comparison Matrix) */}
      {/* ========================================================================= */}
      <section className="bg-[#110324] border border-purple-900/60 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl" id="section-differentials">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quais os diferenciais
          </h2>
          <p className="text-sm sm:text-base text-purple-200/80">
            Compare nossas soluções de pagamento online e escolha a que melhor se adapta ao seu negócio. Consulte as{' '}
            <a 
              href="https://www.mercadopago.com.br/ajuda/33399" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#009EE3] hover:underline font-bold"
            >
              taxas
            </a>.
          </p>
        </div>

        {/* Responsive Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-800/60 bg-[#16042c]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
            
            {/* Header Columns */}
            <thead>
              <tr className="border-b border-purple-800/80 bg-[#210744] text-white">
                <th className="p-4 sm:p-5 font-bold text-purple-300 w-1/4">
                  Recurso / Característica
                </th>
                
                {/* Column 1: Planos de assinatura */}
                <th className="p-4 sm:p-5 font-black text-emerald-300 bg-[#2b0a54]/90 border-x border-purple-800/80 w-1/4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-300" />
                      <span className="text-sm sm:text-base">Planos de assinatura</span>
                    </div>
                    <a
                      href="https://www.mercadopago.com.br/developers/pt/docs/subscription-plans/create-subscription-plan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#009EE3] text-white font-bold text-xs hover:bg-[#0089C7] transition-all"
                    >
                      <span>Como criar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </th>

                {/* Column 2: Link de pagamento */}
                <th className="p-4 sm:p-5 font-bold text-purple-200 w-1/4">
                  <div className="space-y-2">
                    <div className="text-sm sm:text-base font-bold text-white">Link de pagamento</div>
                    <a
                      href="https://www.mercadopago.com.br/ferramentas-para-vender/link-de-pagamento"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1f073d] text-purple-200 border border-purple-700/60 font-medium text-xs hover:text-white transition-all"
                    >
                      <span>Ir para o site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </th>

                {/* Column 3: Assinaturas (API) */}
                <th className="p-4 sm:p-5 font-bold text-purple-200 w-1/4">
                  <div className="space-y-2">
                    <div className="text-sm sm:text-base font-bold text-white">Assinaturas (API)</div>
                    <a
                      href="https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1f073d] text-purple-200 border border-purple-700/60 font-medium text-xs hover:text-white transition-all"
                    >
                      <span>Ir para o resumo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-purple-900/40 text-purple-200">
              
              {/* Row 1: Esforço de integração */}
              <tr className="hover:bg-purple-950/40 transition-colors">
                <td className="p-4 font-semibold text-white">
                  Esforço de integração
                </td>
                <td className="p-4 bg-[#2b0a54]/30 border-x border-purple-800/60">
                  <div className="flex items-center gap-2">
                    {renderDots(1, 4)}
                    <span className="text-[11px] text-emerald-300 font-bold">Mínimo (Sem código)</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {renderDots(1, 4)}
                    <span className="text-[11px] text-purple-300">Mínimo</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {renderDots(3, 4)}
                    <span className="text-[11px] text-amber-300">Desenvolvimento API</span>
                  </div>
                </td>
              </tr>

              {/* Row 2: Nível de personalização */}
              <tr className="hover:bg-purple-950/40 transition-colors">
                <td className="p-4 font-semibold text-white">
                  Nível de personalização
                </td>
                <td className="p-4 bg-[#2b0a54]/30 border-x border-purple-800/60">
                  <div className="flex items-center gap-2">
                    {renderDots(4, 4)}
                    <span className="text-[11px] text-emerald-300 font-bold">Completo</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {renderDots(1, 4)}
                    <span className="text-[11px] text-purple-300">Básico</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {renderDots(4, 4)}
                    <span className="text-[11px] text-emerald-300 font-bold">Total</span>
                  </div>
                </td>
              </tr>

              {/* Row 3: Experiência de pagamento */}
              <tr className="hover:bg-purple-950/40 transition-colors">
                <td className="p-4 font-semibold text-white">
                  Experiência de pagamento
                </td>
                <td className="p-4 bg-[#2b0a54]/30 border-x border-purple-800/60 font-semibold text-white">
                  Ambiente Mercado Pago
                </td>
                <td className="p-4">
                  Ambiente Mercado Pago
                </td>
                <td className="p-4">
                  Ambiente Mercado Pago / API
                </td>
              </tr>

              {/* Row 4: Pagamentos recorrentes */}
              <tr className="hover:bg-purple-950/40 transition-colors">
                <td className="p-4 font-semibold text-white">
                  Pagamentos recorrentes
                </td>
                <td className="p-4 bg-[#2b0a54]/30 border-x border-purple-800/60">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sim</span>
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>Não (Cobrança única)</span>
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sim</span>
                  </span>
                </td>
              </tr>

              {/* Row 5: Meios de pagamento */}
              <tr className="hover:bg-purple-950/40 transition-colors">
                <td className="p-4 font-semibold text-white">
                  Meios de pagamento
                </td>
                <td className="p-4 bg-[#2b0a54]/30 border-x border-purple-800/60 text-xs">
                  Dinheiro em conta, Pix, cartão de crédito ou débito, Linha de crédito, boleto.
                </td>
                <td className="p-4 text-xs">
                  Dinheiro em conta, Pix, cartão de crédito ou débito, Linha de crédito, boleto.
                </td>
                <td className="p-4 text-xs">
                  Dinheiro em conta, Pix, cartão de crédito ou débito, Linha de crédito, boleto.
                </td>
              </tr>

              {/* Row 6: Disponibilidade por país */}
              <tr className="hover:bg-purple-950/40 transition-colors">
                <td className="p-4 font-semibold text-white">
                  Disponibilidade por país
                </td>
                <td className="p-4 bg-[#2b0a54]/30 border-x border-purple-800/60">
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Brasil e América Latina</span>
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-purple-300">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Todos os países operantes</span>
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-purple-300">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Todos os países operantes</span>
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRODUCT LANDING: COMO UTILIZAR (How to integrate / Requirements) */}
      {/* ========================================================================= */}
      <section className="bg-[#120324] border border-purple-900/60 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl" id="section-how-integrate">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Como utilizar
          </h2>
          <p className="text-sm sm:text-base text-purple-200/80">
            Conheça as etapas necessárias para utilizar esta solução.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Requisitos prévios */}
          <div className="bg-[#1a0533] border border-purple-800/60 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/40">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Requisitos prévios</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              Conta de vendedor
            </h3>

            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Para utilizar planos de assinatura, é necessário ter uma conta de vendedor no Mercado Pago. Caso ainda não tenha, clique no botão abaixo para criar gratuitamente.
            </p>

            <a
              href="https://www.mercadopago.com.br/hub/registration/landing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#26084c] hover:bg-[#340c66] text-purple-100 hover:text-white border border-purple-700/60 text-xs font-bold transition-all"
            >
              <span>Criar Conta de Vendedor no Mercado Pago</span>
              <ExternalLink className="w-3.5 h-3.5 text-fuchsia-400" />
            </a>
          </div>

          {/* Processo de criação */}
          <div className="bg-[#1a0533] border border-purple-800/60 rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-950 text-fuchsia-300 text-xs font-bold uppercase tracking-wider border border-fuchsia-500/40">
                <Layers className="w-3.5 h-3.5" />
                <span>Processo de criação</span>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-purple-200">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>Criar um plano de assinatura.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>Personalizar o plano de assinatura.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Compartilhar a assinatura com os clientes.</span>
                </li>
              </ol>
            </div>

            <div className="pt-2">
              <a
                href="https://www.mercadopago.com.br/developers/pt/docs/subscription-plans/create-subscription-plan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <span>Quero criar um plano de assinatura</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION / MODAL TRIGGER SECTION */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-[#20063f] via-[#2d0959] to-[#170330] border border-amber-400/50 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/40">
          <Crown className="w-3.5 h-3.5" />
          <span>NutrinK Pro + NUTRIA Copiloto</span>
        </div>

        <h3 className="text-xl sm:text-3xl font-black text-white">
          Pronto para assinar o NutrinK Pro com Mercado Pago?
        </h3>

        <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto">
          Escolha seu plano e conclua a assinatura de forma 100% segura pelo ambiente oficial do Mercado Pago com ativação automática.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleOpenLink('anual')}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#009EE3] via-[#0089C7] to-[#0070A3] hover:from-[#0089C7] hover:to-[#005f8c] text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-950/60 border border-cyan-300/40 flex items-center gap-2.5 transition-transform active:scale-95"
            id="btn-cta-mp-anual"
          >
            <MercadoPagoLogo variant="icon" className="w-5 h-5 shrink-0" />
            <span>Mercado Pago Assinar Plano • R$ 399,00/ano</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenLink('mensal')}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md border border-fuchsia-400/40 flex items-center gap-2.5 transition-all active:scale-95"
            id="btn-cta-mp-mensal"
          >
            <MercadoPagoLogo variant="icon" className="w-5 h-5 shrink-0" />
            <span>Mercado Pago Assinar Plano • R$ 39,00/mês</span>
            <ExternalLink className="w-3.5 h-3.5 text-fuchsia-200 shrink-0" />
          </button>

          {onOpenSubscriptionModal && (
            <button
              onClick={onOpenSubscriptionModal}
              className="px-5 py-3.5 rounded-2xl bg-[#150329] hover:bg-[#20053d] border border-purple-800 text-purple-200 hover:text-white font-bold text-xs sm:text-sm transition-all"
            >
              <span>Ver Planos no Modal</span>
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
