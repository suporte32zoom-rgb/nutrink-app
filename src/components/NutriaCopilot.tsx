import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Calendar, 
  UserPlus, 
  DollarSign, 
  Calculator, 
  Flame, 
  RefreshCw, 
  Layers, 
  ArrowRight, 
  FileText, 
  HeartPulse, 
  Crown, 
  Lock, 
  Volume2,
  VolumeX
} from 'lucide-react';
import { NutriaMessage, Patient, Appointment, UserAccount } from '../types';
import { speakText, stopSpeech } from '../utils/voiceUtils';
import { callNutriaDirect } from '../services/nutriaGeminiDirect';

interface NutriaCopilotProps {
  messages?: NutriaMessage[];
  onSendMessage?: (msg: string) => Promise<void> | void;
  isLoading?: boolean;
  activePatient?: Patient | null;
  patientContext?: any;
  todayAppointments?: Appointment[];
  patientsCount?: number;
  monthlyRevenue?: number;
  monthlyExpenses?: number;
  isFloating?: boolean;
  onCloseFloating?: () => void;
  userAccount?: UserAccount;
  onOpenSubscriptionModal?: () => void;
  onOpenLoginModal?: (tab?: 'login' | 'register') => void;
  onActionExecuted?: (action: any) => void;
}

const DEFAULT_WELCOME_MESSAGE: NutriaMessage = {
  id: 'msg-init-1',
  role: 'assistant',
  content: `Olá, Doutor(a)! Eu sou a **NUTRIA**, copiloto clínico e cérebro operacional do ecossistema NutrinK.

Como posso otimizar seu atendimento hoje? Você pode me solicitar:
- **Clínica & Cálculos**: *"Calcule a TMB e GET de um paciente de 78kg e 180cm"*, *"Sugira distribuição de macronutrientes para hipertrofia"*, *"Interprete exames de ferritina e B12"*.
- **Rotina & Gestão**: *"Cadastre um novo paciente"*, *"Agende consulta para amanhã"*, *"Lance uma receita de R$ 350 via PIX"*.
- **Planos & Assinaturas**: *"Quais são os planos do NutrinK?"*`,
  timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
};

export const NutriaCopilot: React.FC<NutriaCopilotProps> = ({
  messages: initialMessages,
  onSendMessage,
  isLoading: externalLoading = false,
  activePatient,
  patientContext,
  isFloating = false,
  onCloseFloating,
  userAccount,
  onOpenSubscriptionModal,
  onOpenLoginModal,
  onActionExecuted
}) => {
  // Estado local gerenciado das mensagens da conversa
  const [messages, setMessages] = useState<NutriaMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputText, setInputText] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = internalLoading || externalLoading;

  // Sincroniza mensagens externas se o pai enviar novas mensagens (ex: ativação de plano ou boas-vindas)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      // Se a contagem externa for maior que a local, atualiza
      setMessages(prev => {
        if (initialMessages.length > prev.length) {
          return initialMessages;
        }
        return prev;
      });
    }
  }, [initialMessages]);

  const handleToggleSpeak = (msgId: string, content: string) => {
    if (speakingMessageId === msgId) {
      stopSpeech();
      setSpeakingMessageId(null);
    } else {
      stopSpeech();
      setSpeakingMessageId(msgId);
      speakText(content, {
        onStart: () => setSpeakingMessageId(msgId),
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null)
      });
    }
  };

  const isFree = !userAccount || userAccount.plan === 'free';
  const isMessageLimitReached = isFree && !!userAccount && userAccount.dailyMessageCount >= userAccount.dailyMessageLimit;

  // Reconhecimento de fala (Speech-to-Text)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Aviso no reconhecimento de voz:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Falha ao acionar microfone:', err);
      }
    }
  };

  const handleCopyMarkdown = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const handleDownloadReport = (content: string, id: string) => {
    const header = `# NUTRINK - PARECER CLÍNICO NUTRIA\nEmitido em: ${new Date().toLocaleString('pt-BR')}\n---\n\n`;
    const fullText = header + content;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_NutrinK_NUTRIA_${id.slice(-6)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const parsedHtml = marked.parse(content);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NutrinK - Relatório Clínico</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e1b4b; line-height: 1.7; max-width: 860px; margin: 0 auto; }
            h1 { color: #5112a6; font-size: 22px; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #a855f7; padding-bottom: 8px; }
            h2 { color: #6b21a8; font-size: 16px; margin-top: 24px; margin-bottom: 12px; }
            h3 { color: #7e22ce; font-size: 14px; margin-top: 18px; margin-bottom: 8px; }
            p { margin-bottom: 12px; font-size: 13.5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 8px; overflow: hidden; }
            th, td { border: 1px solid #e9d5ff; padding: 10px 14px; text-align: left; }
            th { background-color: #f3e8ff; font-weight: bold; color: #581c87; }
            tr:nth-child(even) { background-color: #faf5ff; }
            hr { border: none; border-top: 1px solid #d8b4fe; margin: 24px 0; }
            blockquote { border-left: 4px solid #a855f7; margin: 16px 0; padding: 10px 16px; background-color: #faf5ff; color: #581c87; font-style: italic; border-radius: 0 8px 8px 0; }
            ul, ol { padding-left: 24px; margin-bottom: 14px; font-size: 13.5px; }
            li { margin-bottom: 6px; }
            strong { color: #1e1b4b; font-weight: bold; }
            @media print {
              body { padding: 20px; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div>${parsedHtml}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /**
   * Envia mensagem do usuário diretamente para a NUTRIA AI via Gemini 3.7 Flash
   * (Sem servidor intermediário, sem risco de tela em branco)
   */
  const handleSendMessage = async (rawInput: string) => {
    const input = rawInput.trim();
    if (!input || isLoading) return;

    // Se o componente pai fornecer callback onSendMessage, delega para a gestão central
    if (onSendMessage) {
      setInputText('');
      try {
        await onSendMessage(input);
      } catch (callbackErr) {
        console.warn('Aviso na execução do callback pai onSendMessage:', callbackErr);
      }
      return;
    }

    // 1. Adiciona imediatamente a mensagem do usuário ao estado local de mensagens
    const userMsg: NutriaMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setInternalLoading(true);

    try {
      const patientData = activePatient || patientContext || null;

      // 2. Chamada REST direta para a API oficial do Gemini 3.7 Flash
      const result = await callNutriaDirect({
        message: input,
        activePatient: patientData,
        userAccount: userAccount,
        conversationHistory: [...messages, userMsg].slice(-6).map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const replyText = result.reply || "Solicitação processada com sucesso no ecossistema NutrinK.";

      const assistantMsg: NutriaMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: result.actionExecuted
      };

      // Adiciona ao estado do chat sem sobrescrever a tela
      setMessages(prev => [...prev, assistantMsg]);

      // Se houver uma ação executada retornada pela IA (ex: agendamento, cadastro), notifica
      if (result.actionExecuted && onActionExecuted) {
        onActionExecuted(result.actionExecuted);
      }
    } catch (err: any) {
      console.error('Erro na comunicação com a NUTRIA AI:', err);

      const errorMessage: NutriaMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu uma instabilidade momentânea na conexão. Por favor, tente enviar sua mensagem novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    await handleSendMessage(inputText);
  };

  const clinicalPromptTemplates = [
    {
      title: "Dashboard Geral",
      icon: Layers,
      prompt: "Nutria, carregue o painel visual do Dashboard Geral em formato de texto estruturado."
    },
    {
      title: "Pacientes & Prontuários",
      icon: UserPlus,
      prompt: "Nutria, carregue a seção de Pacientes & Prontuários com tabela e atalhos."
    },
    {
      title: "Agenda & Calendário",
      icon: Calendar,
      prompt: "Nutria, carregue a grade de horários e próximos agendamentos da Agenda & Calendário."
    },
    {
      title: "Financeiro & Faturamento",
      icon: DollarSign,
      prompt: "Nutria, carregue o balanço financeiro e extrato em texto estruturado."
    },
    {
      title: "NutriCalc & Cálculos",
      icon: Calculator,
      prompt: "Nutria, carregue a central do NutriCalc & Protocolos de Cálculos."
    },
    {
      title: "Planos & Assinaturas",
      icon: Crown,
      prompt: "Nutria, quais são os planos de assinatura do NutrinK e valores?"
    },
    {
      title: "Plano Alimentar & Macros",
      icon: Flame,
      prompt: activePatient 
        ? `Nutria, elabore um plano alimentar completo e estruturado em tabelas markdown para ${activePatient.name}, com meta de ${activePatient.get || 2000} kcal e distribuição de macronutrientes para ${activePatient.objective || 'Geral'}.`
        : "Nutria, gere um plano alimentar completo com tabela de refeições, calorias e macros para um homem de 30 anos, 80kg e meta de hipertrofia."
    },
    {
      title: "Interpretação de Exames",
      icon: HeartPulse,
      prompt: "Nutria, faça uma interpretação clínica completa dos seguintes exames: Ferritina 18 ng/mL, Vitamina B12 210 pg/mL, Vitamina D 22 ng/mL, Glicemia de Jejum 98 mg/dL e Insulina 14 uIU/mL (calculando HOMA-IR)."
    }
  ];

  return (
    <div className={`flex flex-col bg-[#150328] border border-purple-900/50 rounded-3xl shadow-2xl overflow-hidden ${isFloating ? 'h-[640px] max-h-[88vh]' : 'h-[760px] max-h-[88vh]'}`}>
      
      {/* Header Bar */}
      <div className="bg-[#1b0534] border-b border-purple-900/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-white tracking-wide">NUTRIA • Copiloto NutrinK</h2>
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-purple-200 font-medium">
              {activePatient ? `Contexto Ativo: ${activePatient.name} (${activePatient.objective || 'Clínico'})` : 'Inteligência Artificial & Copiloto Clínico em Tempo Real'}
            </p>
          </div>
        </div>

        {isFloating && onCloseFloating && (
          <button
            onClick={onCloseFloating}
            className="p-1.5 text-purple-300 hover:text-white rounded-xl hover:bg-[#250847] text-sm font-bold cursor-pointer transition-all"
            title="Fechar chat flutuante"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Clinical Shortcuts Strip */}
      <div className="bg-[#120326] border-b border-purple-900/40 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold uppercase text-purple-300 shrink-0">Modelos Clínicos:</span>
        {clinicalPromptTemplates.map((template, idx) => {
          const Icon = template.icon;
          return (
            <button
              key={idx}
              onClick={() => setInputText(template.prompt)}
              className="px-3 py-1 rounded-xl bg-[#220743] hover:bg-[#2f0b5a] border border-purple-700/50 text-[11px] font-bold text-purple-200 hover:text-fuchsia-300 whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Icon className="w-3 h-3 text-fuchsia-400" />
              <span>{template.title}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area - Renderiza a lista de balões entre Usuário e Assistente */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
        
        {messages.length === 0 ? (
          <div className="py-8 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-fuchsia-500/40 text-fuchsia-400 flex items-center justify-center mx-auto shadow-md shadow-fuchsia-950/40">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">NUTRIA: Copiloto de Documentos & Clínica</h3>
              <p className="text-xs text-purple-200 mt-1 leading-relaxed font-medium">
                Todas as respostas são geradas em <strong className="text-white">texto estruturado em tempo real</strong>, tabelas de macronutrientes, cálculos metabólicos e pareceres prontos para exportação em Markdown ou impressão em PDF.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2 pt-2 text-left">
              <span className="text-[11px] font-bold uppercase text-purple-300 block text-center">
                Exemplos de Comandos Clínicos e Operacionais:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {clinicalPromptTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(tmpl.prompt);
                    }}
                    className="p-3 rounded-2xl bg-[#1d0637] hover:bg-[#250847] border border-purple-800/40 text-left text-xs text-purple-100 transition-all flex items-center justify-between group shadow-sm cursor-pointer"
                  >
                    <span className="truncate pr-2 font-medium">{tmpl.prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-700 flex items-center justify-center text-white text-xs shrink-0 shadow-md font-black border border-fuchsia-400/40">
                    N
                  </div>
                )}

                <div className={`max-w-[90%] sm:max-w-[85%] rounded-3xl p-4 space-y-3 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-tr-none border border-fuchsia-400/30'
                    : 'bg-[#1d0637] text-purple-100 border border-purple-800/50 rounded-tl-none'
                }`}>
                  
                  {/* Message Content formatted with Markdown tables */}
                  <div className="leading-relaxed text-xs sm:text-sm font-sans text-purple-100 space-y-2.5">
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      <div className="markdown-content space-y-3">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-base sm:text-lg font-black text-fuchsia-300 border-b border-purple-700/60 pb-2 mt-4 mb-3 flex items-center gap-1.5" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-sm sm:text-base font-bold text-white mt-4 mb-2 flex items-center gap-1.5" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xs sm:text-sm font-bold text-fuchsia-200 mt-3 mb-1.5" {...props} />,
                            p: ({ node, ...props }) => <p className="leading-relaxed text-purple-100 text-xs sm:text-sm my-1.5" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                            em: ({ node, ...props }) => <em className="italic text-purple-200" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1.5 text-purple-200 my-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1.5 text-purple-200 my-2" {...props} />,
                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                            hr: ({ node, ...props }) => <hr className="border-purple-800/70 my-3.5" {...props} />,
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-3.5 rounded-xl border border-purple-700/60 bg-[#120326] shadow-sm">
                                <table className="w-full text-left text-[11px] sm:text-xs border-collapse" {...props} />
                              </div>
                            ),
                            thead: ({ node, ...props }) => <thead className="bg-[#280a4f] text-fuchsia-300 font-bold border-b border-purple-700/80" {...props} />,
                            tbody: ({ node, ...props }) => <tbody className="divide-y divide-purple-900/50" {...props} />,
                            tr: ({ node, ...props }) => <tr className="hover:bg-purple-950/40 transition-colors" {...props} />,
                            th: ({ node, ...props }) => <th className="py-2.5 px-3 font-bold text-fuchsia-300 text-left border-r border-purple-800/40 last:border-r-0 whitespace-nowrap" {...props} />,
                            td: ({ node, ...props }) => <td className="py-2 px-3 text-purple-100 border-r border-purple-900/40 last:border-r-0" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-[#120326] px-1.5 py-0.5 rounded text-fuchsia-300 text-[11px] font-mono border border-purple-800/50" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-fuchsia-500 pl-3.5 py-1.5 bg-purple-950/40 text-purple-100 italic my-3 rounded-r-xl border-y border-r border-purple-900/30 text-xs sm:text-sm" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>

                        {/* Interactive Upgrade CTA Button if message deals with plans */}
                        {(msg.content.includes('limite de mensagens do Plano Gratuito') || 
                          msg.content.includes('Planos de Assinatura') || 
                          msg.content.includes('Plano Premium') ||
                          msg.content.includes('Painel de Assinaturas')) && onOpenSubscriptionModal && (
                          <div className="mt-4 pt-3 border-t border-purple-800/50 flex flex-wrap items-center gap-2.5">
                            <button
                              onClick={onOpenSubscriptionModal}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-fuchsia-600 to-purple-600 hover:from-amber-400 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/60 border border-fuchsia-400/40 transition-all cursor-pointer"
                            >
                              <Crown className="w-4 h-4 text-amber-200" />
                              <span>Ver Planos & Desbloquear Acesso Completo</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] text-purple-300">
                              A partir de <strong>R$ 39,90/mês</strong> ou <strong>R$ 399,90/ano</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Visual Tool Action Confirmation Badge if executed */}
                  {msg.actionExecuted && (
                    <div className="mt-3 p-3 rounded-2xl bg-[#120326] border border-fuchsia-500/50 text-xs text-fuchsia-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-fuchsia-400" />
                        <span>Ação Executada no NutrinK:</span>
                      </div>
                      <p className="text-purple-200">{msg.actionExecuted.summary}</p>
                    </div>
                  )}

                  {/* Message Footer with Document Export Tools */}
                  <div className="flex items-center justify-between text-[11px] text-purple-300 pt-2 border-t border-purple-900/40">
                    <span className="font-medium">{msg.timestamp}</span>
                    
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {/* Audio TTS Speech Playback */}
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all font-semibold cursor-pointer ${
                            speakingMessageId === msg.id
                              ? 'bg-fuchsia-600 text-white animate-pulse'
                              : 'text-purple-300 hover:text-white hover:bg-[#250847]'
                          }`}
                          title={speakingMessageId === msg.id ? 'Parar leitura de voz' : 'Ouvir parecer com voz humanizada'}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-white" />
                              <span className="text-[10px]">Ouvindo</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Ouvir Voz</span>
                            </>
                          )}
                        </button>

                        {/* Copy Markdown */}
                        <button
                          onClick={() => handleCopyMarkdown(msg.id, msg.content)}
                          className="hover:text-fuchsia-300 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-[#250847] transition-all font-semibold cursor-pointer"
                          title="Copiar texto em Markdown limpo"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-fuchsia-300" />
                              <span className="text-fuchsia-300 font-bold text-[10px]">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Copiar</span>
                            </>
                          )}
                        </button>

                        {/* Download as Markdown file */}
                        <button
                          onClick={() => handleDownloadReport(msg.content, msg.id)}
                          className="hover:text-fuchsia-300 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-[#250847] transition-all font-semibold cursor-pointer"
                          title="Baixar como arquivo .md formatado"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Baixar</span>
                        </button>

                        {/* Print Document */}
                        <button
                          onClick={() => handlePrintReport(msg.content)}
                          className="hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-[#250847] transition-all font-semibold cursor-pointer"
                          title="Imprimir ou salvar como PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Imprimir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold animate-pulse">
              N
            </div>
            <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-xs text-purple-200 flex items-center gap-2 font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
              <span>NUTRIA processando em tempo real com o modelo Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Speech Dictation Input */}
      <div className="p-3 sm:p-4 bg-[#1b0534] border-t border-purple-900/40">
        
        {/* Limit Warning Banner for Free Plan */}
        {isMessageLimitReached && (
          <div className="mb-3 p-3 bg-gradient-to-r from-amber-950/90 via-[#2f0b54] to-purple-950/90 border border-amber-500/60 text-amber-200 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg shadow-black/40 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Limite diário atingido ({userAccount?.dailyMessageCount || 30}/{userAccount?.dailyMessageLimit || 30} mensagens).</span>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  {!userAccount?.email || userAccount.id === 'usr-unauthenticated'
                    ? 'Crie sua conta profissional gratuita ou assine o Plano Premium para acesso ilimitado.'
                    : 'Assine o Plano Premium para conversas ilimitadas e relatórios clínicos completos.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(!userAccount?.email || userAccount.id === 'usr-unauthenticated') && onOpenLoginModal && (
                <button
                  onClick={() => onOpenLoginModal('register')}
                  className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer border border-purple-400/40"
                >
                  Cadastrar Conta Grátis
                </button>
              )}
              {onOpenSubscriptionModal && (
                <button
                  onClick={onOpenSubscriptionModal}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 text-slate-950 font-black text-xs shadow-md shrink-0 cursor-pointer"
                >
                  Fazer Upgrade ⭐
                </button>
              )}
            </div>
          </div>
        )}

        {isRecording && (
          <div className="mb-2 p-2 bg-rose-950/90 border border-rose-600 text-rose-200 rounded-2xl text-xs flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              Ditando comando para o texto... Fale com a Nutria.
            </span>
            <button onClick={toggleRecording} className="font-bold underline text-white cursor-pointer">
              Parar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-[#220743] text-purple-200 hover:text-white border-purple-700/60 hover:bg-[#2f0b5a]'
              }`}
              title={isRecording ? 'Parar gravação' : 'Ditar comando de voz para a NUTRIA'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isMessageLimitReached 
                ? '🔒 Limite do Plano Free atingido. Digite para ver planos ou clique em Upgrade...'
                : (isRecording ? 'Ouvindo...' : 'Solicite prontuários, planos alimentares, exames ou cálculos clínicos à NUTRIA...')
            }
            disabled={isLoading}
            className="flex-1 bg-[#120326] border border-purple-700/60 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-fuchsia-950/60 transition-all flex items-center justify-center shrink-0 border border-fuchsia-400/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-purple-300/80 mt-2 px-1 font-medium">
          <div className="flex items-center gap-2">
            <span>NutrinK AI Ecosystem • Respostas em tempo real</span>
            {isFree && userAccount && (
              <span className="text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                {userAccount.dailyMessageCount}/{userAccount.dailyMessageLimit} msgs hoje
              </span>
            )}
          </div>
          <span>NUTRIA v2.5</span>
        </div>
      </div>

    </div>
  );
};
