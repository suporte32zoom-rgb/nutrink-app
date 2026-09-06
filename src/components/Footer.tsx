import React from 'react';
import { 
  Home, 
  Layers, 
  CreditCard, 
  Info, 
  BookOpen, 
  Award, 
  LogIn, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Headphones, 
  Bot, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ArrowUpRight,
  HeartPulse
} from 'lucide-react';
import { NutrinKLogo } from './NutrinKLogo';

interface FooterProps {
  onOpenPage: (pageId: string) => void;
  onOpenLoginModal?: () => void;
  onOpenLogin?: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenPlans?: () => void;
  onScrollToTop?: () => void;
  onOpenNutriaPrompt?: (prompt: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPage,
  onOpenLoginModal,
  onOpenLogin,
  onOpenSubscriptionModal,
  onOpenPlans,
  onScrollToTop,
  onOpenNutriaPrompt
}) => {
  const triggerLogin = onOpenLoginModal || onOpenLogin || (() => {});
  const triggerPlans = onOpenSubscriptionModal || onOpenPlans || (() => {});
  const handleLinkClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'inicio') {
      if (onScrollToTop) onScrollToTop();
      onOpenPage('inicio');
    } else if (id === 'planos') {
      onOpenPage('planos');
    } else if (id === 'acessar') {
      triggerLogin();
    } else {
      onOpenPage(id);
    }
  };

  return (
    <footer className="bg-[#0b0217] text-slate-300 border-t border-purple-900/60 mt-16 pt-12 pb-28 shadow-2xl relative z-10">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Copilot summary */}
          <div className="space-y-4">
            <NutrinKLogo size="md" withGlow={true} />
            <p className="text-xs text-purple-200/80 leading-relaxed">
              O ecossistema completo de inteligência clínica e operacional para nutricionistas e nutrólogos de alta performance.
            </p>

            <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-fuchsia-300">
                <Bot className="w-4 h-4 text-fuchsia-400" />
                <span>NUTRIA AI • Copiloto Ativo</span>
              </div>
              <p className="text-[11px] text-purple-300/70">
                Prontuários estruturados, cálculos TMB/GET e protocolos clínicos baseados em evidências.
              </p>
              {onOpenNutriaPrompt && (
                <button
                  onClick={() => onOpenNutriaPrompt("Quais são todos os recursos e diferenciais do NutrinK?")}
                  className="text-[11px] text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Perguntar à Nutria</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sistemas & Cálculos 100% Operacionais</span>
            </div>
          </div>

          {/* Column 2: PRODUTO & RECURSOS */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-fuchsia-400 mb-4 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>PRODUTO & RECURSOS</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={(e) => handleLinkClick('inicio', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-inicio"
                >
                  <Home className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Início (Topo)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('recursos', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-recursos"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Recursos / Software para Nutricionistas e Nutrólogos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('planos', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-planos"
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span className="font-semibold text-amber-300/90 group-hover:text-amber-300">Planos e Preços (R$ 39,00 à vista via PIX)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: CONTEÚDOS & SOBRE */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-4 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>CONTEÚDOS & SOBRE</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={(e) => handleLinkClick('sobre', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-sobre"
                >
                  <Info className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Sobre o Nutrink / Por que escolher o Nutrink</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('metodologia', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-metodologia"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Fatos, Fontes e Metodologia TMB/GET</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('clientes', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-clientes"
                >
                  <Award className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Clientes e Histórias de Sucesso</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('acessar', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-acessar"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  <span className="font-bold text-emerald-300">Acessar o NutrinK (Login)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: CENTRAL LEGAL & CONTATO */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CENTRAL LEGAL & CONTATO</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={(e) => handleLinkClick('privacidade_lgpd', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-lgpd"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  <span>Central Legal / Política de Privacidade (LGPD)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('termos_servico', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-termos"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Termos de Serviço</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('politica_uso_aceitavel', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-uso-aceitavel"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Política de Uso Aceitável</span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick('fale_conosco', e)}
                  className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors group text-left"
                  id="footer-link-fale-conosco"
                >
                  <Headphones className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span>Fale Conosco / Contato / Suporte</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Security and Compliance Banner */}
        <div className="border-t border-purple-900/40 pt-6 pb-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-purple-300/80">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              Criptografia AES-256 & TLS 1.3
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Em Conformidade com LGPD (Lei 13.709/2018)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <HeartPulse className="w-3 h-3 text-fuchsia-400" />
              Alinhado aos Conselhos de Nutrição e Medicina
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenPage('privacidade_lgpd')}
              className="text-purple-300 hover:text-white underline transition-colors"
            >
              Privacidade
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPage('termos_servico')}
              className="text-purple-300 hover:text-white underline transition-colors"
            >
              Termos
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPage('fale_conosco')}
              className="text-purple-300 hover:text-white underline transition-colors"
            >
              Suporte Técnico
            </button>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="border-t border-purple-950 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-purple-400/60">
          <p>© 2026 NutrinK Tecnologia em Saúde Ltda. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Desenvolvido para máxima precisão clínica com</span>
            <span className="text-fuchsia-400 font-bold">NUTRIA Copilot</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
