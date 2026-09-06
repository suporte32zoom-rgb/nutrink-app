import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  QrCode,
  X, 
  Lock, 
  Bot, 
  FileText, 
  Calculator,
  ArrowRight,
  CreditCard,
  Wallet,
  Barcode,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Repeat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionPlan, UserAccount } from '../types';
import { MercadoPagoCheckoutModal } from './MercadoPagoCheckoutModal';
import { MercadoPagoLogo } from './MercadoPagoLogo';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onSelectPlan: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual', registeredUser?: Partial<UserAccount>) => void;
  isAuthenticated?: boolean;
  onOpenLoginModal?: (tab?: 'login' | 'register') => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onSelectPlan,
  isAuthenticated = false,
  onOpenLoginModal
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanId, setSelectedPlanId] = useState<'free' | 'premium'>('premium');
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);
  const [isLoadingCheckoutPro, setIsLoadingCheckoutPro] = useState(false);

  const MP_LINKS = {
    annual: 'https://mpago.la/1ZYT8kZ',
    monthly: 'https://mpago.la/1Y7wbXw'
  };

  if (!isOpen) return null;

  const handleOpenDirectSubscription = (cycle: 'annual' | 'monthly') => {
    const targetLink = cycle === 'annual' ? MP_LINKS.annual : MP_LINKS.monthly;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });
    window.open(targetLink, '_blank', 'noopener,noreferrer');
  };

  const handleSelectFreePlan = () => {
    onSelectPlan('free', billingCycle);
    onClose();
  };

  const isCurrentPlan = (planCheck: SubscriptionPlan) => {
    return userAccount.plan === planCheck;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-4xl w-full text-white shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col my-auto shadow-purple-950/80">
        
        {/* Top Gradient Banner with NutrinK Purple Colors */}
        <div className="bg-gradient-to-r from-[#45147C] via-[#620EAB] to-[#440974] p-5 sm:p-6 text-center relative border-b border-purple-800/50 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-purple-200 hover:text-white bg-[#220743]/80 hover:bg-[#2e0b59] rounded-xl transition-all font-bold text-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-400/50 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Ecossistema NutrinK • Planos & Assinaturas</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Eleve sua Prática Clínica com o <span className="text-[#15DEC0]">Plano Premium</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl mx-auto font-medium">
            Desbloqueie conversas ilimitadas com a copiloto <strong>NUTRIA</strong>, relatórios completos e calculadoras metabólicas avançadas.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 bg-[#18042f] rounded-2xl border border-purple-700/60 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Mensal (R$ 39,00/mês)
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <span>Anual (R$ 399,00/ano)</span>
              <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-950 text-[10px] font-black rounded-md uppercase">
                -16% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          
          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Free Plan Card */}
            <div 
              onClick={() => setSelectedPlanId('free')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                selectedPlanId === 'free'
                  ? 'bg-[#220743] border-fuchsia-500/60 ring-2 ring-fuchsia-500/40 shadow-lg shadow-purple-950/60'
                  : 'bg-[#18042f] border-purple-900/50 hover:border-purple-700/60'
              }`}
            >
              {isCurrentPlan('free') && (
                <span className="absolute top-4 right-4 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700">
                  Seu Plano Atual
                </span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm text-purple-200">Plano Gratuito</span>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="text-2xl sm:text-3xl font-black text-white">R$ 0,00</span>
                <span className="text-xs text-purple-300">/ para sempre</span>
              </div>

              <p className="text-xs text-purple-300 mb-4 leading-relaxed">
                Recursos essenciais para pequenos atendimentos e organização inicial do consultório.
              </p>

              <div className="space-y-2 text-xs border-t border-purple-900/50 pt-3">
                <div className="flex items-center gap-2 text-purple-200">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Dashboard Geral e Agenda de Consultas</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Cadastro Básico de Pacientes e Prontuários</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Mensagens diárias com a Nutria (30/dia)</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Relatórios e pareceres em versão simplificada</span>
                </div>
              </div>
            </div>

            {/* Premium Plan Card */}
            <div 
              onClick={() => setSelectedPlanId('premium')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                selectedPlanId === 'premium'
                  ? 'bg-gradient-to-b from-[#2e0b59] to-[#1e073c] border-fuchsia-400 ring-2 ring-fuchsia-400 shadow-xl shadow-fuchsia-950/60'
                  : 'bg-[#1c0536] border-purple-800 hover:border-purple-600'
              }`}
            >
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                ⭐ Mais Recomendado
              </div>

              {isCurrentPlan('premium_mensal') || isCurrentPlan('premium_anual') ? (
                <span className="absolute top-4 right-4 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-fuchsia-900/80 text-fuchsia-200 border border-fuchsia-400">
                  Seu Plano Ativo
                </span>
              ) : null}

              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-sm text-fuchsia-300">
                  Plano Premium {billingCycle === 'annual' ? 'Anual' : 'Mensal'}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 my-3">
                {billingCycle === 'annual' ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-white">R$ 399,00</span>
                    <span className="text-xs text-purple-200 font-medium">à vista / ano</span>
                    <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md ml-1">
                      Economia de 2 meses
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-white">R$ 39,00</span>
                    <span className="text-xs text-purple-200 font-medium">à vista / mês</span>
                  </>
                )}
              </div>

              <p className="text-xs text-purple-200 mb-4 leading-relaxed">
                Potência clínica máxima com inteligência artificial, cálculos e emissão ilimitada.
              </p>

              <div className="space-y-2 text-xs border-t border-purple-800/60 pt-3">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Mensagens ILIMITADAS</strong> com a Nutria</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Relatórios Clínicos COMPLETOS</strong> com exportação</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>NutriCalc & Protocolos Clínicos</strong> com acesso total</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interpretação de Exames e condutas dietoterápicas</span>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Gateways Bar - Centered Mercado Pago Official Card */}
          {selectedPlanId === 'premium' && (
            <div className="bg-gradient-to-r from-[#17032c] via-[#20053d] to-[#120223] border border-cyan-500/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
              
              {/* Card Header with Official Mercado Pago Logo & Value */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/60 pb-4">
                <div className="flex items-center gap-3">
                  <MercadoPagoLogo variant="full" />
                  <div className="h-6 w-px bg-purple-800/80 hidden sm:block" />
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ambiente Seguro SSL</span>
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-purple-300 block font-medium">
                    {billingCycle === 'annual' ? 'Total do Plano Anual:' : 'Valor do Plano Mensal:'}
                  </span>
                  <div className="flex items-baseline gap-1.5 sm:justify-end">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {billingCycle === 'annual' ? 'R$ 399,00' : 'R$ 39,00'}
                    </span>
                    <span className="text-xs text-purple-300 font-semibold">
                      {billingCycle === 'annual' ? '/ano' : '/mês'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supported payment icons badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-purple-200">
                <div className="bg-[#120224] p-2.5 rounded-xl border border-purple-800/50 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">Pix Instantâneo</span>
                </div>
                <div className="bg-[#120224] p-2.5 rounded-xl border border-purple-800/50 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#009EE3] shrink-0" />
                  <span className="font-medium">Cartão até 12x</span>
                </div>
                <div className="bg-[#120224] p-2.5 rounded-xl border border-purple-800/50 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-medium">Débito / Saldo MP</span>
                </div>
                <div className="bg-[#120224] p-2.5 rounded-xl border border-purple-800/50 flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium">Boleto Bancário</span>
                </div>
              </div>

              {/* Centered Main Subscription Action */}
              <div className="pt-2 flex flex-col items-center justify-center text-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMercadoPagoModalOpen(true)}
                  className="w-full sm:w-auto min-w-[280px] sm:min-w-[380px] px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#009EE3] hover:from-emerald-500 hover:to-[#0089C7] text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/70 border border-emerald-300/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  id="btn-mp-checkout-transparente"
                >
                  <MercadoPagoLogo variant="icon" className="w-6 h-6 shrink-0" />
                  <span>
                    {billingCycle === 'annual' 
                      ? 'Checkout Transparente • Pagar R$ 399,00' 
                      : 'Checkout Transparente • Pagar R$ 39,00'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-200 shrink-0" />
                </button>

                <div className="flex items-center gap-3 w-full max-w-sm justify-center">
                  <div className="h-px bg-purple-800/80 flex-1"></div>
                  <span className="text-[11px] text-purple-400 font-bold uppercase">ou</span>
                  <div className="h-px bg-purple-800/80 flex-1"></div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDirectSubscription(billingCycle)}
                  className="w-full sm:w-auto min-w-[280px] sm:min-w-[340px] px-6 py-2.5 rounded-xl bg-[#220640] hover:bg-[#2f0857] text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-purple-700/60 transition-all"
                  id="btn-mp-assinar-plano-custom"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    {billingCycle === 'annual' 
                      ? 'Assinar via link direto Mercado Pago (R$ 399,00/ano)' 
                      : 'Assinar via link direto Mercado Pago (R$ 39,00/mês)'}
                  </span>
                </button>

                <p className="text-[11px] text-purple-300/90 flex items-center gap-1.5 font-medium mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {billingCycle === 'annual' 
                      ? 'Economia de 16% no plano anual • Pagamento processado com segurança pelo Mercado Pago'
                      : 'Cobrança mensal automática • Cancele quando quiser diretamente no Mercado Pago'}
                  </span>
                </p>
              </div>

            </div>
          )}

          {/* Clean Unified Footer Actions */}
          <div className="pt-2 pb-1 flex items-center justify-center">
            {selectedPlanId === 'free' ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectFreePlan}
                  className="px-6 py-2.5 rounded-xl bg-[#250847] hover:bg-[#340b63] border border-purple-700/60 text-white font-bold text-xs sm:text-sm transition-all"
                >
                  Manter Plano Gratuito
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-purple-300 hover:text-white transition-all text-center"
                >
                  Voltar ao Consultório
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-purple-300 hover:text-white hover:bg-[#250847] transition-all text-center flex items-center gap-1.5"
              >
                <span>Voltar ao Consultório</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Full Mercado Pago Multi-method Modal */}
      {isMercadoPagoModalOpen && (
        <MercadoPagoCheckoutModal
          isOpen={isMercadoPagoModalOpen}
          onClose={() => setIsMercadoPagoModalOpen(false)}
          planId={billingCycle === 'annual' ? 'premium_anual' : 'premium_mensal'}
          billingCycle={billingCycle}
          userAccount={userAccount}
          onPaymentSuccess={(plan) => {
            setIsMercadoPagoModalOpen(false);
            onSelectPlan(plan, billingCycle);
            onClose();
          }}
        />
      )}
    </div>
  );
};


