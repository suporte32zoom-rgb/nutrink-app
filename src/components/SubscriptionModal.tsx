import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  X, 
  CreditCard, 
  Wallet, 
  Barcode, 
  ExternalLink, 
  Repeat,
  ChevronDown,
  ChevronUp,
  Bot,
  Users,
  Calendar,
  FileText,
  HelpCircle,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionPlan, UserAccount } from '../types';
import { MercadoPagoLogo } from './MercadoPagoLogo';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onSelectPlan?: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual', registeredUser?: Partial<UserAccount>) => void;
  isAuthenticated?: boolean;
  onOpenLoginModal?: (tab?: 'login' | 'register') => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Como funciona a assinatura do NutrinK?',
    answer: 'O acesso a todas as ferramentas premium e à IA NÚTRIA é liberado instantaneamente após a confirmação do pagamento.'
  },
  {
    question: 'Quais são as formas de pagamento aceitas?',
    answer: 'Aceitamos Cartão de Crédito, Pix e Boleto Bancário através do Mercado Pago.'
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! O plano mensal não possui fidelidade e pode ser cancelado a qualquer momento direto pelo painel ou suporte.'
  },
  {
    question: 'O pagamento é seguro?',
    answer: 'Sim. Toda a transação é processada e criptografada pelo ambiente oficial do Mercado Pago.'
  },
  {
    question: 'Terei acesso a suporte?',
    answer: 'Sim, assinantes Pro possuem suporte prioritário via WhatsApp e e-mail.'
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userAccount
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const MP_LINKS = {
    annual: 'https://mpago.la/1ZYT8kZ',
    monthly: 'https://mpago.la/1Y7wbXw'
  };

  if (!isOpen) return null;

  const handleOpenCheckout = (cycle: 'annual' | 'monthly') => {
    const targetLink = cycle === 'annual' ? MP_LINKS.annual : MP_LINKS.monthly;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 }
    });
    window.open(targetLink, '_blank', 'noopener,noreferrer');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn" id="subscription-modal">
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-4xl w-full text-white shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col my-auto shadow-purple-950/80">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#45147C] via-[#620EAB] to-[#440974] p-5 sm:p-6 text-center relative border-b border-purple-800/50 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-purple-200 hover:text-white bg-[#220743]/80 hover:bg-[#2e0b59] rounded-xl transition-all font-bold text-sm cursor-pointer"
            aria-label="Fechar modal de planos"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-400/50 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>NutrinK Pro + Copiloto NÚTRIA</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Planos e Assinaturas <span className="text-[#15DEC0]">NutrinK</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl mx-auto font-normal">
            Escolha o plano ideal e tenha acesso imediato a todas as ferramentas clínicas, prontuário ilimitado e a IA NÚTRIA.
          </p>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 space-y-7 overflow-y-auto flex-1">
          
          {/* 1. Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            
            {/* Plano Anual Pro Card */}
            <div className="bg-gradient-to-b from-[#2a0b54] via-[#1d063b] to-[#14032b] border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative shadow-xl shadow-purple-950/80 hover:border-amber-300 transition-all">
              
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
                <span>ECONOMIZE 16% • MAIS RECOMENDADO</span>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Assinatura Anual</span>
                    <h3 className="text-lg sm:text-xl font-black text-white">Plano Anual Pro</h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Crown className="w-4 h-4 fill-amber-300" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#15032a] border border-amber-400/30 space-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">R$ 399,00</span>
                    <span className="text-xs text-purple-300 font-semibold">/ ano</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold">
                    Equivalente a R$ 33,25/mês à vista
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Acesso total e irrestrito</strong> por 12 meses</span>
                  </div>
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Copiloto NÚTRIA ILIMITADA</strong> (Consultas e Exames)</span>
                  </div>
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Prontuários e Pacientes Ilimitados</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Suporte prioritário VIP WhatsApp e E-mail</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenCheckout('annual')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#009EE3] via-[#0089C7] to-[#0070A3] hover:from-[#0089C7] hover:to-[#005f8c] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/70 border border-cyan-300/60 transition-all cursor-pointer"
                  id="modal-btn-checkout-mp-anual"
                >
                  <MercadoPagoLogo variant="icon" className="w-4 h-4 shrink-0" />
                  <span>Assinar Plano Anual • Mercado Pago</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                </button>
              </div>

            </div>

            {/* Plano Mensal Pro Card */}
            <div className="bg-[#17042f] border border-purple-700/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative shadow-xl shadow-purple-950/70 hover:border-fuchsia-500/50 transition-all">
              
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-purple-900 border border-purple-500/60 text-purple-200 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                <Repeat className="w-3 h-3 text-fuchsia-400" />
                <span>SEM FIDELIDADE</span>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider block">Assinatura Mensal</span>
                    <h3 className="text-lg sm:text-xl font-black text-white">Plano Mensal Pro</h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300">
                    <Repeat className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#110223] border border-purple-800/60 space-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">R$ 39,00</span>
                    <span className="text-xs text-purple-300 font-semibold">/ mês</span>
                  </div>
                  <div className="text-[11px] text-purple-300 font-medium">
                    Cobrança recorrente sem carência
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Copiloto NÚTRIA ILIMITADA</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Prontuário Eletrônico Ilimitado</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Agendamento e Controle Financeiro</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-purple-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Suporte via WhatsApp e E-mail</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenCheckout('monthly')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/70 border border-fuchsia-400/50 transition-all cursor-pointer"
                  id="modal-btn-checkout-mp-mensal"
                >
                  <MercadoPagoLogo variant="icon" className="w-4 h-4 shrink-0" />
                  <span>Assinar Plano Mensal • Mercado Pago</span>
                  <ExternalLink className="w-3.5 h-3.5 text-fuchsia-200 shrink-0" />
                </button>
              </div>

            </div>

          </div>

          {/* Payment Methods Strip */}
          <div className="bg-[#140328] border border-purple-800/60 rounded-xl p-3 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-purple-200">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pix Instantâneo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#009EE3] shrink-0" />
              <span>Cartão até 12x</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
              <span>Saldo Mercado Pago</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Barcode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Boleto Bancário</span>
            </div>
          </div>

          {/* 2. Benefícios do NutrinK Pro + NÚTRIA */}
          <div className="bg-[#180430] border border-purple-800/60 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-bold text-white">Benefícios do NutrinK Pro + NÚTRIA</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 text-purple-100 bg-[#210743] p-2.5 rounded-xl border border-purple-800/40">
                <Bot className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Copiloto NÚTRIA</strong>
                  <span className="text-purple-300 text-[11px]">IA clínica com análise avançada de exames e condutas.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-purple-100 bg-[#210743] p-2.5 rounded-xl border border-purple-800/40">
                <Users className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Prontuário Ilimitado</strong>
                  <span className="text-purple-300 text-[11px]">Gestão de pacientes e fichas de anamnese completas.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-purple-100 bg-[#210743] p-2.5 rounded-xl border border-purple-800/40">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Agenda & Financeiro</strong>
                  <span className="text-purple-300 text-[11px]">Agendamento, fluxo de caixa e relatórios de faturamento.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-purple-100 bg-[#210743] p-2.5 rounded-xl border border-purple-800/40">
                <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Prescrições & Dietas</strong>
                  <span className="text-purple-300 text-[11px]">Cálculo exato de macronutrientes e exportação em PDF.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. FAQ Accordion */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-300" />
              <h3 className="text-sm font-bold text-white">Perguntas Frequentes (FAQ)</h3>
            </div>

            <div className="space-y-2">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index}
                    className="bg-[#1c0739] border border-purple-800/60 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full p-3 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-white hover:text-fuchsia-300 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-900 text-fuchsia-300 text-[10px] flex items-center justify-center shrink-0 font-bold">
                          {index + 1}
                        </span>
                        <span>{item.question}</span>
                      </span>
                      <span className="text-purple-300 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-3 pt-1 text-xs text-purple-200/90 leading-relaxed border-t border-purple-800/40 bg-[#16042e]">
                        <p className="pl-7">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#110223] border-t border-purple-800/50 p-4 text-center text-xs text-purple-300 font-medium shrink-0">
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <span>🔒</span>
            <span><strong>Pagamento 100% seguro via Mercado Pago</strong> • Ativação imediata • Cancele quando quiser</span>
          </p>
        </div>

      </div>
    </div>
  );
};
