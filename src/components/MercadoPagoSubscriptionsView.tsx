import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  CreditCard, 
  QrCode, 
  Wallet, 
  Barcode, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  HeartPulse, 
  CheckCircle2,
  Lock,
  MessageSquare,
  HelpCircle,
  Zap,
  Repeat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, SubscriptionPlan } from '../types';
import { MercadoPagoLogo } from './MercadoPagoLogo';

interface MercadoPagoSubscriptionsViewProps {
  userAccount?: UserAccount;
  onOpenSubscriptionModal?: () => void;
  onSelectPlan?: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual') => void;
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

export const MercadoPagoSubscriptionsView: React.FC<MercadoPagoSubscriptionsViewProps> = ({
  userAccount,
  onOpenSubscriptionModal,
  onSelectPlan
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const MP_LINKS = {
    annual: 'https://mpago.la/1ZYT8kZ',
    monthly: 'https://mpago.la/1Y7wbXw'
  };

  const handleOpenCheckout = (cycle: 'annual' | 'monthly') => {
    const link = cycle === 'annual' ? MP_LINKS.annual : MP_LINKS.monthly;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 }
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  const isUserPremium = userAccount?.plan === 'premium_anual' || userAccount?.plan === 'premium_mensal' || userAccount?.isSubscribed;

  return (
    <div className="space-y-10 pb-12 text-slate-100 animate-fadeIn max-w-5xl mx-auto" id="plans-subscriptions-page">
      
      {/* 1. Header / Hero Section */}
      <div className="text-center space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fuchsia-950/80 border border-fuchsia-400/50 text-fuchsia-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-950/50">
          <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>NutrinK Pro + Copiloto NÚTRIA</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Planos e Assinaturas <span className="text-[#15DEC0]">NutrinK</span>
        </h1>

        <p className="text-sm sm:text-base text-purple-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
          Transforme sua prática em Nutrição e Nutrologia com prontuário ilimitado, gestão completa e o poder clínico da IA NÚTRIA.
        </p>

        {isUserPremium && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Assinatura Ativa: {userAccount?.plan === 'premium_anual' ? 'Plano Anual Pro' : 'Plano Mensal Pro'}</span>
          </div>
        )}
      </div>

      {/* 2. Pricing Cards Grid (Plano Anual Pro & Plano Mensal Pro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Plano Anual Pro Card (Destaque / Mais Recomendado) */}
        <div className="bg-gradient-to-b from-[#2a0b54] via-[#1d063b] to-[#14032b] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl shadow-purple-950/90 hover:border-amber-300 transition-all group">
          
          {/* Badge Economize 16% */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>ECONOMIZE 16% • MAIS RECOMENDADO</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Assinatura Anual</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">Plano Anual Pro</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Crown className="w-5 h-5 fill-amber-300" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              O melhor custo-benefício para nutricionistas e nutrólogos que buscam excelência clínica contínua.
            </p>

            <div className="p-4 rounded-2xl bg-[#15032a] border border-amber-400/30 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">R$ 399,00</span>
                <span className="text-xs sm:text-sm text-purple-300 font-semibold">/ ano</span>
              </div>
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span>Equivalente a apenas R$ 33,25/mês à vista</span>
              </div>
            </div>

            {/* List of included items in the plan */}
            <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Acesso total e irrestrito</strong> por 12 meses</span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Copiloto NÚTRIA ILIMITADA</strong> (Consultas e Análise de Exames)</span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Prontuários e Pacientes Ilimitados</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Agenda, Financeiro e NutriCalc</strong> integrados</span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Suporte prioritário VIP via WhatsApp e E-mail</span>
              </div>
            </div>
          </div>

          {/* Checkout Direct Button */}
          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={() => handleOpenCheckout('annual')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#009EE3] via-[#0089C7] to-[#0070A3] hover:from-[#0089C7] hover:to-[#005f8c] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-950/70 border border-cyan-300/60 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="btn-checkout-mp-anual"
            >
              <MercadoPagoLogo variant="icon" className="w-5 h-5 shrink-0" />
              <span>Assinar Plano Anual • Mercado Pago</span>
              <ExternalLink className="w-4 h-4 text-cyan-200 shrink-0" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checkout seguro Mercado Pago • Pix, Cartão em até 12x ou Boleto</span>
            </div>
          </div>

        </div>

        {/* Plano Mensal Pro Card (Sem Fidelidade) */}
        <div className="bg-[#17042f] border border-purple-700/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-purple-950/70 hover:border-fuchsia-500/50 transition-all group">
          
          {/* Badge Sem Fidelidade */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>SEM FIDELIDADE • CANCELE QUANDO QUISER</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider block">Assinatura Mensal</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">Plano Mensal Pro</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300">
                <Repeat className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Flexibilidade total com renovação mensal automática e liberdade para cancelar a qualquer instante.
            </p>

            <div className="p-4 rounded-2xl bg-[#110223] border border-purple-800/60 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">R$ 39,00</span>
                <span className="text-xs sm:text-sm text-purple-300 font-semibold">/ mês</span>
              </div>
              <div className="text-xs text-purple-300 font-medium">
                Cobrança recorrente mensal sem contrato de fidelidade
              </div>
            </div>

            {/* List of included items in the plan */}
            <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Copiloto NÚTRIA ILIMITADA</strong> (Consultas e Prescrições)</span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Prontuário Eletrônico Ilimitado</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Agendamento e Controle Financeiro</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>NutriCalc & Protocolos Clínicos</strong> completos</span>
              </div>
              <div className="flex items-start gap-2.5 text-purple-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Suporte via WhatsApp e E-mail</span>
              </div>
            </div>
          </div>

          {/* Checkout Direct Button */}
          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={() => handleOpenCheckout('monthly')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/70 border border-fuchsia-400/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="btn-checkout-mp-mensal"
            >
              <MercadoPagoLogo variant="icon" className="w-5 h-5 shrink-0" />
              <span>Assinar Plano Mensal • Mercado Pago</span>
              <ExternalLink className="w-4 h-4 text-fuchsia-200 shrink-0" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checkout seguro Mercado Pago • Ativação instantânea</span>
            </div>
          </div>

        </div>

      </div>

      {/* Payment methods badges strip */}
      <div className="bg-[#140328] border border-purple-800/60 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-purple-200">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">Pix Instantâneo</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#009EE3] shrink-0" />
          <span className="font-semibold">Cartão de Crédito em até 12x</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-fuchsia-400 shrink-0" />
          <span className="font-semibold">Saldo Mercado Pago</span>
        </div>
        <div className="flex items-center gap-2">
          <Barcode className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">Boleto Bancário</span>
        </div>
      </div>

      {/* 3. Benefícios do NutrinK Pro + NÚTRIA Section */}
      <section className="bg-[#16042d] border border-purple-800/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl" id="section-nutrink-benefits">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-800">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Tudo Incluso em sua Assinatura</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Benefícios do NutrinK Pro + NÚTRIA
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80">
            Uma plataforma completa desenvolvida especificamente para a rotina de nutricionistas e médicos nutrólogos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Benefício 1 */}
          <div className="bg-[#1f073d] border border-purple-700/50 rounded-2xl p-5 space-y-3 hover:border-fuchsia-400/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              Copiloto NÚTRIA com IA Clínica de Alta Precisão
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Interpretação minuciosa de exames laboratoriais, cálculos clínicos e sugestões terapêuticas personalizadas.
            </p>
          </div>

          {/* Benefício 2 */}
          <div className="bg-[#1f073d] border border-purple-700/50 rounded-2xl p-5 space-y-3 hover:border-fuchsia-400/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              Prontuário Eletrônico Ilimitado & Pacientes
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Armazenamento seguro de fichas de anamnese, histórico de evolução antropométrica e dados cadastrais.
            </p>
          </div>

          {/* Benefício 3 */}
          <div className="bg-[#1f073d] border border-purple-700/50 rounded-2xl p-5 space-y-3 hover:border-fuchsia-400/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              Agendamento, Controle Financeiro e Faturamento
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Gestão da grade de horários, fluxo de caixa do consultório, receitas, despesas e métricas consolidadas.
            </p>
          </div>

          {/* Benefício 4 */}
          <div className="bg-[#1f073d] border border-purple-700/50 rounded-2xl p-5 space-y-3 hover:border-fuchsia-400/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              Prescrição de Dietas e Relatórios Automatizados
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Geração de planos alimentares com cálculo exato de macronutrientes, tabelas de substituição e relatórios em PDF.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Seção de Perguntas Frequentes (FAQ Accordion) */}
      <section className="bg-[#140328] border border-purple-800/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl" id="section-faq-accordion">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-800">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
            <span>Dúvidas Frequentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80">
            Tire suas dúvidas sobre o funcionamento, formas de pagamento e suporte do NutrinK.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 max-w-3xl mx-auto pt-2">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className="bg-[#1c0739] border border-purple-800/60 rounded-2xl overflow-hidden transition-all hover:border-purple-600"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-fuchsia-300 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-900/80 text-fuchsia-300 text-xs flex items-center justify-center shrink-0 font-black border border-purple-700/60">
                      {index + 1}
                    </span>
                    <span>{item.question}</span>
                  </span>
                  <span className="p-1 rounded-lg bg-[#2b0c50] text-purple-300 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-purple-200/90 leading-relaxed border-t border-purple-800/40 bg-[#16042e]">
                    <p className="pl-9">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Rodapé e Políticas */}
      <div className="text-center pt-4 pb-2 text-xs sm:text-sm text-purple-300/90 font-medium">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-base">🔒</span>
          <span><strong>Pagamento 100% seguro via Mercado Pago</strong> • Ativação imediata • Cancele quando quiser</span>
        </p>
      </div>

    </div>
  );
};
