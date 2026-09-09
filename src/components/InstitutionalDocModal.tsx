import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  X, 
  Bot, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Layers, 
  Home, 
  CreditCard, 
  Info, 
  BookOpen, 
  Award, 
  LogIn, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Headphones,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  FileCheck2,
  Share2
} from 'lucide-react';
import { INSTITUTIONAL_PAGES, InstitutionalPage } from '../data/institutionalPages';
import { cleanMathAndLatex } from '../utils/cleanMarkdown';

interface InstitutionalDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPageId?: string;
  onOpenNutriaPrompt?: (prompt: string) => void;
  onOpenSubscriptionModal?: () => void;
  onSelectPlan?: () => void;
  onOpenLoginModal?: () => void;
  onOpenLogin?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
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
  Headphones
};

export const InstitutionalDocModal: React.FC<InstitutionalDocModalProps> = ({
  isOpen,
  onClose,
  initialPageId = 'recursos',
  onOpenNutriaPrompt,
  onOpenSubscriptionModal,
  onOpenLoginModal
}) => {
  // Navigation mode: 'document' (exibe o texto integral do documento) ou 'index' (exibe o índice geral com cards)
  const [viewMode, setViewMode] = useState<'document' | 'index'>('document');
  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId || 'recursos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      if (initialPageId && INSTITUTIONAL_PAGES[initialPageId]) {
        setSelectedPageId(initialPageId);
        setViewMode('document');
      } else {
        setViewMode('index');
      }
    }
  }, [initialPageId, isOpen]);

  if (!isOpen) return null;

  const pagesList = Object.values(INSTITUTIONAL_PAGES);
  const currentPage: InstitutionalPage = INSTITUTIONAL_PAGES[selectedPageId] || INSTITUTIONAL_PAGES['recursos'];

  // Current page index for next/prev navigation
  const currentIndex = pagesList.findIndex(p => p.id === currentPage.id);
  const prevPage = currentIndex > 0 ? pagesList[currentIndex - 1] : null;
  const nextPage = currentIndex < pagesList.length - 1 ? pagesList[currentIndex + 1] : null;

  const filteredPages = pagesList.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.markdownContent.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectDocument = (pageId: string) => {
    setSelectedPageId(pageId);
    setViewMode('document');
  };

  const handleAskNutria = () => {
    onClose();
    if (onOpenNutriaPrompt) {
      onOpenNutriaPrompt(`Explique os pontos-chave do documento oficial: "${currentPage.title}"`);
    }
  };

  const categories = [
    { key: 'all', label: 'Todos os Documentos' },
    { key: 'produto_recursos', label: 'Produto & Recursos' },
    { key: 'conteudos_sobre', label: 'Conteúdos & Sobre' },
    { key: 'central_legal_contato', label: 'Central Legal & Contato' }
  ];

  const CurrentIcon = ICON_MAP[currentPage.iconName] || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-[#120426] border border-purple-800/70 w-full max-w-5xl h-[92vh] max-h-[880px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-purple-900/60 bg-[#160530]">
          <div className="flex items-center gap-3">
            
            {viewMode === 'document' ? (
              <button
                onClick={() => setViewMode('index')}
                className="px-3 py-1.5 rounded-xl bg-[#26084c] hover:bg-[#390d6e] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                title="Voltar ao Índice de Documentos"
                id="btn-back-to-index-top"
              >
                <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
                <span>Voltar ao Índice</span>
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/50 text-fuchsia-400">
                <BookOpen className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {viewMode === 'document' ? currentPage.title : 'Central de Documentos & Páginas Institucionais'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-purple-950/80 text-fuchsia-300 border border-purple-700/60 hidden sm:inline">
                  {viewMode === 'document' ? currentPage.categoryLabel : 'NutrinK Docs'}
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80">
                {viewMode === 'document' 
                  ? 'Texto integral oficial em conformidade com as diretrizes clínicas e legais' 
                  : 'Selecione um documento para visualizar o conteúdo completo na íntegra'}
              </p>
            </div>

          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-purple-300 hover:text-white bg-[#18042f] rounded-xl hover:bg-[#2e0b59] border border-purple-900/40 transition-all"
              id="btn-close-institutional-modal"
              title="Fechar Janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL VIEW MODE 1: INDEX VIEW (Lista / Grade com Cards Interativos) */}
        {viewMode === 'index' ? (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 bg-[#0e021f]">
            
            {/* Search and Category Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por título, termo ou palavra-chave (ex: LGPD, TMB, Honorários, Responsabilidade Técnica)..."
                  className="w-full bg-[#170530] border border-purple-800/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400 transition-all"
                  id="input-search-institutional-docs"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategoryFilter === cat.key
                        ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950/60 border border-fuchsia-400/50'
                        : 'bg-[#1a0636] text-purple-300 hover:text-white hover:bg-[#25094d] border border-purple-800/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {filteredPages.length === 0 ? (
                <div className="text-center py-16 text-purple-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-purple-500/50" />
                  <p className="font-semibold text-sm">Nenhum documento encontrado para a pesquisa "{searchQuery}".</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('all'); }}
                    className="text-xs text-fuchsia-400 hover:underline font-bold"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredPages.map(page => {
                    const Icon = ICON_MAP[page.iconName] || FileText;
                    return (
                      <div
                        key={page.id}
                        onClick={() => handleSelectDocument(page.id)}
                        className="p-4 rounded-2xl bg-[#170530] border border-purple-800/50 hover:border-fuchsia-500/60 hover:bg-[#200743] transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-sm hover:shadow-purple-950/80"
                        id={`card-doc-${page.id}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-400">
                                {page.categoryLabel}
                              </span>
                            </div>
                            <span className="text-[10px] text-purple-400/80 font-mono">
                              Oficial 2026
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-fuchsia-200 transition-colors">
                            {page.title}
                          </h3>

                          <p className="text-xs text-purple-300/80 line-clamp-2 leading-relaxed">
                            {page.shortDescription}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between">
                          <span className="text-[11px] text-fuchsia-300 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Ler Documento Completo</span>
                            <ChevronRight className="w-3.5 h-3.5 text-fuchsia-400" />
                          </span>

                          <span className="text-[10px] text-purple-400 bg-[#100322] px-2 py-0.5 rounded-md border border-purple-900/60">
                            Texto Integral
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          
          /* MODAL VIEW MODE 2: FULL DOCUMENT VIEW (Texto Integral Formatado) */
          <div className="flex-1 flex flex-col bg-[#14042b] overflow-hidden">
            
            {/* Top Document Action Bar */}
            <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-purple-900/50 bg-[#180536] gap-2">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('index')}
                  className="px-3 py-1.5 rounded-xl bg-[#2b0a54] hover:bg-[#3a0e70] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  id="btn-back-to-index-bar"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Índice</span>
                </button>

                <div className="h-4 w-px bg-purple-800/60 mx-1"></div>

                <div className="flex items-center gap-2 text-xs">
                  <CurrentIcon className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <span className="font-bold text-white truncate max-w-[200px] sm:max-w-md">
                    {currentPage.title.split('/')[0].trim()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Ask Nutria AI */}
                {onOpenNutriaPrompt && (
                  <button
                    onClick={handleAskNutria}
                    className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/60 transition-all border border-fuchsia-400/40"
                    id="btn-open-in-nutria"
                  >
                    <Bot className="w-3.5 h-3.5 text-fuchsia-200" />
                    <span>Copiloto NUTRIA</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              
              {/* Top Banner with Navigation Breadcrumb */}
              <div className="bg-[#1b073b] border border-purple-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center text-fuchsia-400 shrink-0 mt-0.5 sm:mt-0">
                    <CurrentIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-fuchsia-300">
                        {currentPage.title.split('/')[0].trim()}
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/90 font-medium">
                      Categoria: <strong className="text-white">{currentPage.categoryLabel}</strong> • Versão Oficial NutrinK 2026
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setViewMode('index')}
                    className="px-3.5 py-2 rounded-xl bg-[#2a0952] hover:bg-[#380d6e] text-fuchsia-300 hover:text-white text-xs font-bold border border-purple-700/60 flex items-center gap-1.5 transition-all shadow-sm"
                    id="btn-back-to-index-banner"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Índice</span>
                  </button>

                  {currentPage.id === 'planos' && onOpenSubscriptionModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSubscriptionModal();
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md"
                    >
                      Assinar Plano PRO
                    </button>
                  )}

                  {currentPage.id === 'acessar' && onOpenLoginModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLoginModal();
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md"
                    >
                      Acessar Consultório
                    </button>
                  )}
                </div>

              </div>

              {/* Formatted Markdown Content Container */}
              <div className="bg-[#180635] border border-purple-900/60 rounded-3xl p-6 sm:p-10 shadow-inner">
                <div className="prose prose-invert prose-purple max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white border-b border-purple-800/60 pb-3 mb-5 mt-2 flex items-center gap-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-lg sm:text-xl font-bold text-fuchsia-300 mt-8 mb-3 flex items-center gap-2 border-b border-purple-900/40 pb-1" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-base sm:text-lg font-semibold text-purple-200 mt-5 mb-2" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-purple-100/90 leading-relaxed my-3" {...props} />
                      ),
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-5 rounded-2xl border border-purple-800/60 bg-[#120326] shadow-md">
                          <table className="w-full text-xs sm:text-sm text-left border-collapse" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-[#23094b] text-purple-200 uppercase font-bold text-[11px] border-b border-purple-800/80" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="p-3.5 font-extrabold border-r border-purple-900/40 last:border-r-0 text-white" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="p-3.5 border-b border-purple-900/40 border-r border-purple-900/40 last:border-r-0 text-purple-200" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-fuchsia-500 bg-purple-950/40 px-5 py-4 rounded-r-2xl italic text-purple-200 my-5 shadow-sm" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6 space-y-2 text-purple-100 my-3" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6 space-y-2 text-purple-100 my-3" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-sm sm:text-base leading-relaxed" {...props} />
                      ),
                      hr: ({ node, ...props }) => (
                        <hr className="border-purple-800/50 my-8" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-extrabold text-white" {...props} />
                      ),
                      code: ({ node, ...props }) => (
                        <code className="bg-[#120326] text-fuchsia-300 px-1.5 py-0.5 rounded border border-purple-800/50 font-mono text-xs" {...props} />
                      )
                    }}
                  >
                    {cleanMathAndLatex(currentPage.markdownContent)}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Bottom Pagination & Navigation Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-purple-900/50">
                
                <button
                  onClick={() => setViewMode('index')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#200742] hover:bg-[#2f0b5f] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  id="btn-back-to-index-bottom"
                >
                  <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
                  <span>← Voltar ao Índice de Documentos</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {prevPage && (
                    <button
                      onClick={() => handleSelectDocument(prevPage.id)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#190533] hover:bg-[#25084b] text-purple-300 hover:text-white border border-purple-800/50 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                      title={prevPage.title}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{prevPage.title.split('/')[0].trim()}</span>
                    </button>
                  )}

                  {nextPage && (
                    <button
                      onClick={() => handleSelectDocument(nextPage.id)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#190533] hover:bg-[#25084b] text-purple-300 hover:text-white border border-purple-800/50 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                      title={nextPage.title}
                    >
                      <span className="truncate max-w-[120px]">{nextPage.title.split('/')[0].trim()}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};
