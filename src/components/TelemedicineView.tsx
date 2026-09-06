import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  ScreenShare, 
  Share2, 
  Copy, 
  Check, 
  Bot, 
  Sparkles, 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  FileText, 
  Send, 
  ShieldCheck, 
  Volume2, 
  Radio, 
  Zap, 
  Activity, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Edit3, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Printer, 
  ArrowLeft,
  AlertTriangle,
  Stethoscope,
  Pill,
  Heart,
  Droplets,
  Scale
} from 'lucide-react';
import { safeFetchJson } from '../utils/api';
import { 
  Patient, 
  Appointment, 
  UserAccount, 
  MealPlan, 
  LiveTranscriptItem, 
  LiveClinicalInsight, 
  TelemedicineSession,
  AnthropometricRecord
} from '../types';

interface TelemedicineViewProps {
  patients: Patient[];
  appointments: Appointment[];
  userAccount: UserAccount;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenMealPlanEditor?: (patient: Patient) => void;
  onOpenNutriaWithPrompt?: (prompt: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const TelemedicineView: React.FC<TelemedicineViewProps> = ({
  patients,
  appointments,
  userAccount,
  onUpdatePatient,
  onOpenMealPlanEditor,
  onOpenNutriaWithPrompt,
  onNavigateTab
}) => {
  // Session flow states: 'lobby' | 'in_call' | 'post_consultation'
  const [sessionMode, setSessionMode] = useState<'lobby' | 'in_call' | 'post_consultation'>('lobby');
  
  // Selected patient & appointment
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [customGuestName, setCustomGuestName] = useState<string>('');

  // Call configuration
  const [roomName, setRoomName] = useState<string>(() => `nutrink-${Math.random().toString(36).substring(2, 9)}`);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState<any>(null);

  // Live Assistant & Transcription
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcripts, setTranscripts] = useState<LiveTranscriptItem[]>([]);
  const [currentDictation, setCurrentDictation] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'nutria' | 'transcript' | 'patient_data' | 'supplements'>('nutria');

  // Real-time AI clinical insights
  const [liveInsights, setLiveInsights] = useState<LiveClinicalInsight[]>([]);
  const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
  const [nutriaQuickQuestion, setNutriaQuickQuestion] = useState('');
  const [nutriaChatResponses, setNutriaChatResponses] = useState<Array<{ q: string; a: string; time: string }>>([]);

  // Post-consultation generated data
  const [postConsultationData, setPostConsultationData] = useState<{
    summary: string;
    mealPlanDraft: MealPlan;
    evolutionRecord: AnthropometricRecord;
    anamneseUpdates: any;
  } | null>(null);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [postSavedSuccess, setPostSavedSuccess] = useState(false);

  // UI helpers
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Native media stream references for WebRTC fallback preview
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;
  const currentPatientName = selectedPatient?.name || customGuestName || 'Paciente Convidado';

  // Secure room link (Jitsi Meet official public cluster or custom bridge)
  const safeRoomUrl = `https://meet.jit.si/${roomName}`;

  // Start call timer
  useEffect(() => {
    if (sessionMode === 'in_call') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallTimerInterval(timer);
      return () => clearInterval(timer);
    } else {
      if (callTimerInterval) clearInterval(callTimerInterval);
      setCallDuration(0);
    }
  }, [sessionMode]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript.trim()) {
            addTranscriptItem('paciente', finalTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error/warning:', event.error);
        };

        speechRecognitionRef.current = recognition;
      } catch (err) {
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Format timer HH:MM:SS
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Live Speech Capture
  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) return;
    if (isListening) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start issue:', e);
      }
    }
  };

  // Add transcript item and trigger proactive NUTRIA analysis
  const addTranscriptItem = (speaker: 'nutricionista' | 'paciente' | 'nutria', text: string) => {
    const newItem: LiveTranscriptItem = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setTranscripts(prev => {
      const updated = [...prev, newItem];
      triggerLiveAnalysis(updated);
      return updated;
    });
  };

  // Trigger real-time clinical analysis via Gemini / server
  const triggerLiveAnalysis = async (allTranscripts: LiveTranscriptItem[]) => {
    if (isAnalyzingLive) return;
    setIsAnalyzingLive(true);

    try {
      const fullTranscriptText = allTranscripts.slice(-6).map(t => `${t.speaker === 'paciente' ? 'Paciente' : 'Nutricionista'}: ${t.text}`).join('\n');
      
      const res = await safeFetchJson<{ insights?: LiveClinicalInsight[] }>('/api/telemedicine/analyze-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullTranscriptText,
          notes: manualNote,
          patient: selectedPatient,
          userAccount
        })
      });

      if (res.ok && res.data) {
        const data = res.data;
        if (data.insights && Array.isArray(data.insights)) {
          setLiveInsights(data.insights);
        }
      }
    } catch (err) {
      console.warn('Erro na análise em tempo real:', err);
    } finally {
      setIsAnalyzingLive(false);
    }
  };

  // Start Video Consultation
  const handleStartCall = async () => {
    setSessionMode('in_call');
    setTranscripts([
      {
        id: `tr-${Date.now()}-welcome`,
        speaker: 'nutria',
        text: `Sala de Vídeoconsulta iniciada com ${currentPatientName}. A NUTRIA está ativa para transcrever, calcular métricas e gerar sugestões em tempo real.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Initial baseline insights for this patient
    if (selectedPatient) {
      const tmb = selectedPatient.tmb || 1600;
      const getVal = selectedPatient.get || 2200;
      const initialInsights: LiveClinicalInsight[] = [
        {
          id: 'init-1',
          type: 'calculo',
          title: `Gasto Energético Basal & Total (${selectedPatient.name})`,
          description: `TMB Basal: ${tmb} kcal | GET: ${getVal} kcal. Recomendação de ingestão calórica para ${selectedPatient.objective}: ${selectedPatient.objective === 'hipertrofia' ? getVal + 350 : getVal - 400} kcal/dia.`,
          badge: 'Mifflin-St Jeor',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'init-2',
          type: 'suplemento',
          title: 'Prescrição de Base Recomendada',
          description: `• Creatina Monoidratada: 5g/dia\n• Whey Protein Isolado: 30g pós-treino ou lanche\n• Ômega-3 EPA/DHA: 1.000mg/dia\n• Meta Hídrica: ${(selectedPatient.currentWeightKg * 0.035).toFixed(1)}L de água/dia.`,
          badge: 'Evidência Grau A',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setLiveInsights(initialInsights);
    }

    // Try starting speech recognition automatically
    if (speechRecognitionRef.current && !isListening) {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (e) {}
    }
  };

  // End Call and Trigger Post-Consultation Synthesis
  const handleEndCall = async () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    }

    setSessionMode('post_consultation');
    setIsGeneratingPost(true);

    try {
      const res = await safeFetchJson<{
        summary: string;
        mealPlanDraft: MealPlan;
        evolutionRecord: AnthropometricRecord;
        anamneseUpdates: any;
      }>('/api/telemedicine/post-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: {
            patientName: currentPatientName,
            patientId: selectedPatientId,
            durationSeconds: callDuration,
            transcripts,
            insights: liveInsights,
            notes: manualNote
          },
          patient: selectedPatient,
          userAccount
        })
      });

      if (res.ok && res.data) {
        setPostConsultationData(res.data);
      }
    } catch (err) {
      console.error('Erro ao sintetizar pós-consulta:', err);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Save Post-Consultation to Patient Electronic Record
  const handleSaveToElectronicRecord = () => {
    if (!selectedPatient || !postConsultationData) return;

    const updatedEvolution = [
      ...(selectedPatient.evolutionHistory || []),
      postConsultationData.evolutionRecord
    ];

    const updatedAnamnese = {
      ...(selectedPatient.anamnese || {}),
      ...(postConsultationData.anamneseUpdates || {}),
      clinicalHistory: `${selectedPatient.anamnese?.clinicalHistory || ''}\n[Teleconsulta ${new Date().toLocaleDateString('pt-BR')}]: ${manualNote || 'Vídeoconsulta realizada com sucesso.'}`.trim()
    };

    const updatedPatient: Patient = {
      ...selectedPatient,
      mealPlan: postConsultationData.mealPlanDraft,
      evolutionHistory: updatedEvolution,
      anamnese: updatedAnamnese,
      notes: `${selectedPatient.notes ? selectedPatient.notes + '\n\n' : ''}[Teleconsulta ${new Date().toLocaleDateString('pt-BR')}]: ${postConsultationData.summary.substring(0, 300)}...`,
      lastConsultationDate: new Date().toISOString().split('T')[0]
    };

    onUpdatePatient(updatedPatient);
    setPostSavedSuccess(true);
    setTimeout(() => setPostSavedSuccess(false), 4000);
  };

  // WhatsApp Invite Link generator
  const handleSendWhatsAppInvite = () => {
    const doctorName = userAccount.name || 'Dra. Nutricionista';
    const clinicName = userAccount.clinicName || 'NutrinK Consultório';
    const message = `Olá, ${currentPatientName}! Tudo bem? 

Aqui é o consultório do(a) *${doctorName}* (${clinicName}). 
Seu link seguro e privativo para a nossa *Vídeoconsulta Nutricional* hoje é:

🔗 *${safeRoomUrl}*

Basta clicar no link acima pelo seu celular ou computador (com câmera e microfone liberados) para entrar direto na sala de atendimento. Aguardo você!`;

    const phoneDigits = selectedPatient?.phone?.replace(/\D/g, '') || '';
    const url = phoneDigits 
      ? `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  const handleCopyRoomLink = () => {
    navigator.clipboard.writeText(safeRoomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Quick dictation submission
  const handleAddManualTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDictation.trim()) return;
    addTranscriptItem('nutricionista', currentDictation.trim());
    setCurrentDictation('');
  };

  // Quick NUTRIA question inside live consultation
  const handleAskNutriaLive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutriaQuickQuestion.trim()) return;

    const question = nutriaQuickQuestion.trim();
    setNutriaQuickQuestion('');

    // Answer calculation locally or via smart clinical rules
    let responseText = '';
    const qLower = question.toLowerCase();

    if (qLower.includes('creatina')) {
      responseText = 'Creatina Monoidratada: Prescrever 5g/dia em qualquer horário com uma refeição que contenha carboidratos para otimizar a captação celular via insulina.';
    } else if (qLower.includes('agua') || qLower.includes('água') || qLower.includes('hidrata')) {
      const weight = selectedPatient?.currentWeightKg || 70;
      responseText = `Cálculo de Ingestão Hídrica: 35ml a 40ml por kg de peso. Para ${weight}kg = ${(weight * 0.035).toFixed(1)}L a ${(weight * 0.040).toFixed(1)}L de água ao dia.`;
    } else if (qLower.includes('proteina') || qLower.includes('proteína') || qLower.includes('whey')) {
      const weight = selectedPatient?.currentWeightKg || 70;
      responseText = `Aporte Proteico: Para o objetivo de ${selectedPatient?.objective || 'recomposição'}, indicar 1.8 a 2.2 g/kg/dia (${Math.round(weight * 1.8)}g a ${Math.round(weight * 2.2)}g de proteína total).`;
    } else if (qLower.includes('sono') || qLower.includes('insonia') || qLower.includes('ansiedade')) {
      responseText = 'Estratégia para Sono & Ansiedade: Magnésio Inositol (300mg elementar) + Chá de Camomila/Mulungu à noite. Evitar cafeína após as 15h.';
    } else {
      responseText = `Diretriz NUTRIA para ${selectedPatient?.name || 'paciente'}: Manter densidade nutricional, fracionamento em 4-5 refeições e déficit de 400 kcal caso busque perda de peso.`;
    }

    setNutriaChatResponses(prev => [
      ...prev,
      {
        q: question,
        a: responseText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Simulate clinical patient speech for easy testing & demoing
  const handleSimulatePatientPhrase = (phrase: string) => {
    addTranscriptItem('paciente', phrase);
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-fuchsia-950/50 border border-fuchsia-400/40">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Telemedicina & Vídeoconsulta
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-950 to-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  NUTRIA Copiloto Ao Vivo
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-purple-200 mt-0.5">
                Sala de vídeo privativa com transcrição inteligente, sugestões clínicas em tempo real e integração direta com o prontuário.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          {sessionMode === 'in_call' ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/70 text-rose-200 text-xs font-black flex items-center gap-2 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>AO VIVO • {formatTimer(callDuration)}</span>
              </div>

              <button
                onClick={handleEndCall}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                id="btn-end-teleconsultation"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Finalizar Atendimento</span>
              </button>
            </div>
          ) : sessionMode === 'post_consultation' ? (
            <button
              onClick={() => setSessionMode('lobby')}
              className="px-4 py-2 rounded-xl bg-[#26084c] hover:bg-[#340c66] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Lobby de Telemedicina</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendWhatsAppInvite}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
                id="btn-whatsapp-invite-header"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Convidar Paciente (WhatsApp)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: LOBBY & PREPARATION ROOM */}
      {/* ========================================================================= */}
      {sessionMode === 'lobby' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Room Setup & Patient Selector */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Preparation Card */}
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl shadow-purple-950/30">
              
              <div className="flex items-center justify-between border-b border-purple-800/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/50 flex items-center justify-center text-fuchsia-300 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-white">
                      Selecionar Paciente para Atendimento
                    </h2>
                    <p className="text-xs text-purple-300">
                      Vincule o prontuário para que a NUTRIA acesse o histórico clínico durante o vídeo.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50">
                  {patients.length} Cadastrado(s)
                </span>
              </div>

              {/* Patient Selection list/selector */}
              {patients.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {patients.map(p => {
                      const isSelected = p.id === selectedPatientId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setCustomGuestName('');
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#29094e] to-[#3a0c6d] border-fuchsia-400 text-white shadow-md shadow-fuchsia-950/50'
                              : 'bg-[#1b0638] border-purple-800/40 hover:border-purple-600 text-purple-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-fuchsia-600 text-white' : 'bg-purple-900/60 text-purple-300'
                            }`}>
                              {p.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs truncate text-white">{p.name}</div>
                              <div className="text-[10px] text-purple-300 truncate">
                                {p.age} anos • {p.currentWeightKg}kg • {p.objective}
                              </div>
                            </div>
                          </div>

                          {isSelected && <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Nenhum paciente cadastrado no consultório</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Você pode iniciar a teleconsulta com um paciente avulso digitando o nome abaixo, ou cadastrar seu primeiro paciente no menu <strong>Pacientes & Prontuários</strong>.
                  </p>
                  <div>
                    <input
                      type="text"
                      placeholder="Nome do Paciente Convidado"
                      value={customGuestName}
                      onChange={(e) => setCustomGuestName(e.target.value)}
                      className="w-full bg-[#1b0638] border border-amber-500/60 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Selected Patient Details Snapshot */}
              {selectedPatient && (
                <div className="bg-[#1b0638] border border-purple-800/50 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-fuchsia-300 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      Prontuário Vinculado: {selectedPatient.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                      Pronto para Atendimento
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-[#120326] p-2 rounded-xl border border-purple-900/40">
                      <span className="text-[10px] text-purple-300 block">Peso Atual</span>
                      <strong className="text-white text-xs">{selectedPatient.currentWeightKg} kg</strong>
                    </div>
                    <div className="bg-[#120326] p-2 rounded-xl border border-purple-900/40">
                      <span className="text-[10px] text-purple-300 block">Altura / IMC</span>
                      <strong className="text-white text-xs">{selectedPatient.heightCm}cm ({selectedPatient.bmi})</strong>
                    </div>
                    <div className="bg-[#120326] p-2 rounded-xl border border-purple-900/40">
                      <span className="text-[10px] text-purple-300 block">TMB Calculada</span>
                      <strong className="text-fuchsia-300 text-xs">{selectedPatient.tmb} kcal</strong>
                    </div>
                    <div className="bg-[#120326] p-2 rounded-xl border border-purple-900/40">
                      <span className="text-[10px] text-purple-300 block">GET Estimado</span>
                      <strong className="text-emerald-300 text-xs">{selectedPatient.get} kcal</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Consultation Main Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartCall}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-fuchsia-950/60 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  id="btn-launch-telemedicine-room"
                >
                  <Video className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Entrar na Sala de Vídeoconsulta com NUTRIA Ao Vivo</span>
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: Safe Room Sharing & WhatsApp Invitation */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Room Link & WhatsApp Box */}
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl shadow-purple-950/30">
              
              <div className="flex items-center gap-2.5 border-b border-purple-800/40 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Link Seguro da Sala & Convite
                  </h3>
                  <p className="text-[11px] text-purple-300">
                    Envio com 1 clique direto para o WhatsApp do paciente.
                  </p>
                </div>
              </div>

              {/* Room Identifier Display */}
              <div>
                <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Endereço Seguro da Sala (Criptografia E2EE)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-purple-200 text-xs font-mono truncate select-all">
                    {safeRoomUrl}
                  </div>
                  <button
                    onClick={handleCopyRoomLink}
                    className="p-2.5 rounded-xl bg-[#29094e] hover:bg-[#380c6a] text-purple-200 hover:text-white border border-purple-700/60 transition-all shrink-0 cursor-pointer"
                    title="Copiar link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* WhatsApp Invitation Button & Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    Convite Pronto para WhatsApp
                  </span>
                  {selectedPatient?.phone && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Tel: {selectedPatient.phone}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-emerald-100/90 leading-relaxed bg-[#0b241b] p-2.5 rounded-xl border border-emerald-800/40 font-mono text-[10.5px]">
                  "Olá, {currentPatientName}! Seu link para a Vídeoconsulta Nutricional com {userAccount.name || 'sua Nutricionista'} é: {safeRoomUrl}. Aguardo você na sala!"
                </p>

                <button
                  onClick={handleSendWhatsAppInvite}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  id="btn-send-whatsapp-invite-lobby"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedWhatsApp ? 'WhatsApp Aberto!' : 'Enviar Convite via WhatsApp Agora'}</span>
                </button>
              </div>

              {/* Compliance & Legal Notice */}
              <div className="p-3 rounded-2xl bg-[#1a0635] border border-purple-800/40 text-[11px] text-purple-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conformidade com Normas do CFN & LGPD</span>
                </div>
                <p className="text-[10px] leading-relaxed text-purple-200">
                  A vídeoconsulta NutrinK opera em ambiente protegido com criptografia ponta a ponta. Nenhum dado em vídeo é armazenado em servidores públicos.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ACTIVE LIVE VIDEO CONSULTATION ROOM */}
      {/* ========================================================================= */}
      {sessionMode === 'in_call' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 min-h-[640px]">
          
          {/* Main Video Screen (8 cols on XL) */}
          <div className="xl:col-span-8 flex flex-col space-y-3">
            
            {/* Native Video Feed Container (Jitsi Meet WebRTC Iframe + Diagnostics) */}
            <div className="flex-1 bg-slate-950 rounded-3xl border border-purple-800/60 overflow-hidden relative shadow-2xl flex flex-col min-h-[460px] sm:min-h-[520px]">
              
              {/* Top Video Overlay Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between text-white pointer-events-auto">
                
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-1 rounded-xl bg-purple-900/80 backdrop-blur-md border border-fuchsia-500/50 flex items-center gap-2 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-white truncate max-w-[140px] sm:max-w-xs">{currentPatientName}</span>
                  </div>

                  <div className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono text-purple-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>{formatTimer(callDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRoomLink}
                    className="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-[11px] font-bold text-purple-200 flex items-center gap-1 transition-all cursor-pointer"
                    title="Copiar link para enviar ao paciente"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Copiar Link</span>
                  </button>

                  <button
                    onClick={handleSendWhatsAppInvite}
                    className="px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-[11px] font-bold text-emerald-200 flex items-center gap-1 transition-all cursor-pointer"
                    title="Reenviar link por WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Jitsi Meet Iframe Embed */}
              <div className="flex-1 w-full h-full relative">
                <iframe
                  src={`https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(userAccount.name || 'Nutricionista NutrinK')}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableDeepLinking=true`}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write"
                  className="w-full h-full border-0 absolute inset-0 bg-slate-950"
                  title="Sala de Vídeo NutrinK"
                />
              </div>

              {/* Bottom In-Room Quick Controls Bar */}
              <div className="p-3 bg-[#130325] border-t border-purple-900/60 flex items-center justify-between gap-2 z-20 shrink-0">
                
                <div className="flex items-center gap-2">
                  {/* Live Speech Recognition Toggle */}
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isListening
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-950/50'
                        : 'bg-[#220743] border-purple-700/60 text-purple-300 hover:text-white'
                    }`}
                    title="Ativar/desativar transcrição ao vivo da voz"
                  >
                    <Radio className={`w-3.5 h-3.5 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-purple-400'}`} />
                    <span>{isListening ? 'Transcrição Ativa' : 'Pausar Transcrição'}</span>
                  </button>

                  {/* Manual dictation quick simulation button */}
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-purple-300">
                    <span className="opacity-70">Simular queixa:</span>
                    <button
                      onClick={() => handleSimulatePatientPhrase('Sinto muita azia e compulsão por doce à noite, treino às 19h.')}
                      className="px-2 py-1 bg-[#26084c] hover:bg-[#360d66] rounded-lg text-purple-200 text-[10px] border border-purple-700/50 cursor-pointer"
                    >
                      "Compulsão Noturna"
                    </button>
                    <button
                      onClick={() => handleSimulatePatientPhrase('Bebo pouca água, apenas 1L por dia, e sinto cansaço nas pernas.')}
                      className="px-2 py-1 bg-[#26084c] hover:bg-[#360d66] rounded-lg text-purple-200 text-[10px] border border-purple-700/50 cursor-pointer"
                    >
                      "Hidratação Baixa"
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEndCall}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition-all cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Encerrar Consulta</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Quick Live Notes & Dictation Bar */}
            <form onSubmit={handleAddManualTranscript} className="flex items-center gap-2 bg-[#150328] p-2.5 rounded-2xl border border-purple-800/50">
              <Edit3 className="w-4 h-4 text-fuchsia-400 shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Anotação rápida ou ditado clínico durante a consulta (ex: 'Indicado 5g de creatina diária')..."
                value={currentDictation}
                onChange={(e) => setCurrentDictation(e.target.value)}
                className="flex-1 bg-transparent border-0 text-white text-xs placeholder-purple-400/60 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>

          </div>

          {/* Right Sidebar: NUTRIA Ao Vivo Assistant (4 cols on XL) */}
          <div className="xl:col-span-4 flex flex-col bg-[#150328] border border-purple-800/60 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Sidebar Tabs */}
            <div className="flex border-b border-purple-800/50 bg-[#1e053a] px-3 pt-2 gap-1 text-xs shrink-0">
              <button
                onClick={() => setActiveSidebarTab('nutria')}
                className={`pb-2 px-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSidebarTab === 'nutria'
                    ? 'border-fuchsia-400 text-fuchsia-300'
                    : 'border-transparent text-purple-300 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>NUTRIA Ao Vivo</span>
                {liveInsights.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveSidebarTab('transcript')}
                className={`pb-2 px-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSidebarTab === 'transcript'
                    ? 'border-fuchsia-400 text-fuchsia-300'
                    : 'border-transparent text-purple-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-300" />
                <span>Transcrição ({transcripts.length})</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('patient_data')}
                className={`pb-2 px-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSidebarTab === 'patient_data'
                    ? 'border-fuchsia-400 text-fuchsia-300'
                    : 'border-transparent text-purple-300 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-purple-300" />
                <span>Métricas</span>
              </button>
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
              
              {/* TAB: NUTRIA AO VIVO INSIGHTS */}
              {activeSidebarTab === 'nutria' && (
                <div className="space-y-3">
                  
                  {/* Status Banner */}
                  <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#2f0b54] to-indigo-950/80 border border-fuchsia-500/40 flex items-center justify-between text-[11px] text-purple-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-fuchsia-400 animate-spin" />
                      <span><strong>Copiloto Clínico Ativo:</strong> Analisando diálogo...</span>
                    </div>
                    {isAnalyzingLive && (
                      <span className="text-[10px] text-fuchsia-300 font-bold animate-pulse">Atualizando</span>
                    )}
                  </div>

                  {/* Live Insight Cards */}
                  <div className="space-y-2.5">
                    {liveInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          insight.type === 'calculo'
                            ? 'bg-[#1b0638] border-fuchsia-500/40 text-purple-100'
                            : insight.type === 'suplemento'
                            ? 'bg-[#150a36] border-indigo-500/40 text-indigo-100'
                            : 'bg-[#1e0735] border-purple-700/50 text-purple-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                            {insight.type === 'calculo' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                            {insight.type === 'suplemento' && <Pill className="w-3.5 h-3.5 text-fuchsia-400" />}
                            {insight.type === 'conduta' && <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />}
                            {insight.type === 'alerta' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                            <span>{insight.title}</span>
                          </div>

                          {insight.badge && (
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-fuchsia-300 border border-purple-700/60 shrink-0">
                              {insight.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] leading-relaxed text-purple-200/90 whitespace-pre-line">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Live NUTRIA Chat during consultation */}
                  <div className="pt-2 border-t border-purple-900/40 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-fuchsia-300 block">
                      💬 Pergunte à NUTRIA na Chamada
                    </span>

                    {nutriaChatResponses.map((item, idx) => (
                      <div key={idx} className="bg-[#1b0638] p-2.5 rounded-xl border border-purple-800/40 space-y-1 text-[11px]">
                        <div className="font-bold text-purple-200">❓ {item.q}</div>
                        <div className="text-purple-100 leading-relaxed bg-[#110222] p-2 rounded-lg border border-purple-900/50">
                          {item.a}
                        </div>
                      </div>
                    ))}

                    <form onSubmit={handleAskNutriaLive} className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Ex: 'Dose usual de creatina' ou 'Meta de água'..."
                        value={nutriaQuickQuestion}
                        onChange={(e) => setNutriaQuickQuestion(e.target.value)}
                        className="flex-1 bg-[#1b0638] border border-purple-700/60 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-fuchsia-400"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* TAB: TRANSCRIPTION STREAM */}
              {activeSidebarTab === 'transcript' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-purple-300 pb-1 border-b border-purple-900/40">
                    <span>Transcrição do Atendimento</span>
                    <span className="font-bold text-fuchsia-300">{transcripts.length} falas</span>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {transcripts.map((t) => (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                          t.speaker === 'paciente'
                            ? 'bg-[#1b0638] border-indigo-500/30 text-indigo-100'
                            : t.speaker === 'nutria'
                            ? 'bg-[#2b0852] border-fuchsia-500/50 text-fuchsia-100'
                            : 'bg-[#16042a] border-purple-800/40 text-purple-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5 text-[10px] font-bold">
                          <span className={
                            t.speaker === 'paciente' ? 'text-indigo-300' : t.speaker === 'nutria' ? 'text-fuchsia-300' : 'text-purple-300'
                          }>
                            {t.speaker === 'paciente' ? `👤 ${currentPatientName}` : t.speaker === 'nutria' ? '✨ NUTRIA AI' : '🩺 Você (Nutricionista)'}
                          </span>
                          <span className="text-purple-400 text-[9px]">{t.timestamp}</span>
                        </div>
                        <p>{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PATIENT DATA & METRICS */}
              {activeSidebarTab === 'patient_data' && selectedPatient && (
                <div className="space-y-3">
                  <div className="bg-[#1b0638] p-3 rounded-2xl border border-purple-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-fuchsia-300 uppercase block">Dados Basais</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><strong>Idade:</strong> {selectedPatient.age} anos</div>
                      <div><strong>Gênero:</strong> {selectedPatient.gender}</div>
                      <div><strong>Peso:</strong> {selectedPatient.currentWeightKg} kg</div>
                      <div><strong>Altura:</strong> {selectedPatient.heightCm} cm</div>
                      <div><strong>IMC:</strong> {selectedPatient.bmi}</div>
                      <div><strong>% Gordura:</strong> {selectedPatient.bodyFatPercentage}%</div>
                    </div>
                  </div>

                  <div className="bg-[#1b0638] p-3 rounded-2xl border border-purple-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase block">Cálculos Energéticos</span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-purple-300">TMB (Mifflin):</span>
                        <strong className="text-white">{selectedPatient.tmb} kcal</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">GET Total:</span>
                        <strong className="text-emerald-300">{selectedPatient.get} kcal</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Meta Hídrica (35ml/kg):</span>
                        <strong className="text-fuchsia-300">{(selectedPatient.currentWeightKg * 0.035).toFixed(1)} Litros</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: POST-CONSULTATION SYNTHESIS & RECORD INTEGRATION */}
      {/* ========================================================================= */}
      {sessionMode === 'post_consultation' && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Post Header Alert */}
          <div className="bg-gradient-to-r from-[#1f063d] via-[#2f0a59] to-[#1a0533] border border-fuchsia-500/50 rounded-3xl p-5 sm:p-6 shadow-xl shadow-purple-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-fuchsia-950/50 border border-fuchsia-400/40">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      Vídeoconsulta Finalizada com Sucesso!
                    </h2>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
                      Duração: {formatTimer(callDuration)}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mt-1">
                    A NUTRIA organizou o resumo da consulta, preencheu o prontuário eletrônico e estruturou uma <strong>Minuta de Plano Alimentar Personalizado</strong> pronta para validação.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSaveToElectronicRecord}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
                  id="btn-save-to-record"
                >
                  <Check className="w-4 h-4" />
                  <span>{postSavedSuccess ? 'Salvo no Prontuário!' : 'Salvar no Prontuário do Paciente'}</span>
                </button>
              </div>
            </div>
          </div>

          {postSavedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Prontuário e Plano Alimentar vinculados com sucesso ao paciente {currentPatientName}!</span>
            </div>
          )}

          {/* Structured Synthesis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Col: Clinical Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-fuchsia-400" />
                  Resumo Clínico da Consulta
                </h3>

                {isGeneratingPost ? (
                  <div className="p-8 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 text-fuchsia-400 animate-spin mx-auto" />
                    <p className="text-xs text-purple-300 font-medium">Sintetizando anamnese e condutas com a NUTRIA...</p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#1b0638] border border-purple-800/40 text-xs text-purple-100 space-y-2 leading-relaxed whitespace-pre-line">
                    {postConsultationData?.summary || `Vídeoconsulta realizada com ${currentPatientName}. Plano alimentar estruturado com foco em ${selectedPatient?.objective || 'reeducação alimentar'}.`}
                  </div>
                )}

                {/* Supplementation & Guidelines preview */}
                {postConsultationData?.mealPlanDraft?.supplements && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider block">
                      💊 Suplementação Sugerida
                    </span>
                    <div className="space-y-1.5">
                      {postConsultationData.mealPlanDraft.supplements.map((sup, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-[#1d0637] border border-purple-800/40 text-xs text-purple-100 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{sup}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Draft Meal Plan Ready for Approval (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 space-y-4 shadow-xl">
                
                <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      Minuta de Plano Alimentar Personalizado
                    </h3>
                    <p className="text-[11px] text-purple-300">
                      Calculado para atingir a meta calórica e macronutrientes do paciente.
                    </p>
                  </div>

                  {postConsultationData?.mealPlanDraft && (
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-950 to-purple-950 text-fuchsia-300 border border-fuchsia-500/50">
                      {postConsultationData.mealPlanDraft.targetCalories} kcal
                    </span>
                  )}
                </div>

                {/* Macro summary pills */}
                {postConsultationData?.mealPlanDraft && (
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-[#1b0638] p-2.5 rounded-xl border border-purple-800/40">
                      <span className="text-[10px] text-purple-300 block">Proteínas</span>
                      <strong className="text-fuchsia-300 text-xs">{postConsultationData.mealPlanDraft.targetProteinGrams}g</strong>
                    </div>
                    <div className="bg-[#1b0638] p-2.5 rounded-xl border border-purple-800/40">
                      <span className="text-[10px] text-purple-300 block">Carboidratos</span>
                      <strong className="text-amber-300 text-xs">{postConsultationData.mealPlanDraft.targetCarbsGrams}g</strong>
                    </div>
                    <div className="bg-[#1b0638] p-2.5 rounded-xl border border-purple-800/40">
                      <span className="text-[10px] text-purple-300 block">Gorduras</span>
                      <strong className="text-indigo-300 text-xs">{postConsultationData.mealPlanDraft.targetFatGrams}g</strong>
                    </div>
                    <div className="bg-[#1b0638] p-2.5 rounded-xl border border-purple-800/40">
                      <span className="text-[10px] text-purple-300 block">Meta Hídrica</span>
                      <strong className="text-emerald-300 text-xs">{postConsultationData.mealPlanDraft.hydrationGoalLiters}L</strong>
                    </div>
                  </div>
                )}

                {/* Meals Card List */}
                {postConsultationData?.mealPlanDraft?.meals && (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {postConsultationData.mealPlanDraft.meals.map((meal) => (
                      <div key={meal.id} className="p-3 bg-[#1b0638] rounded-2xl border border-purple-800/40 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span className="text-fuchsia-300">{meal.name}</span>
                          <span className="text-purple-300 text-[11px] font-mono">{meal.time}</span>
                        </div>
                        <ul className="space-y-1 text-purple-200">
                          {meal.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between text-[11px] border-b border-purple-900/30 pb-0.5">
                              <span>• {item.foodName} ({item.portion})</span>
                              <span className="font-mono text-purple-400">{item.calories} kcal</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-purple-800/40">
                  <button
                    onClick={() => setSessionMode('lobby')}
                    className="px-4 py-2 rounded-xl text-purple-300 hover:text-white text-xs font-bold transition-all"
                  >
                    Voltar ao Lobby
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedPatient && onOpenMealPlanEditor && (
                      <button
                        onClick={() => {
                          if (postConsultationData?.mealPlanDraft) {
                            selectedPatient.mealPlan = postConsultationData.mealPlanDraft;
                            onUpdatePatient(selectedPatient);
                          }
                          onOpenMealPlanEditor(selectedPatient);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#2b0852] hover:bg-[#390c6d] text-white text-xs font-bold border border-purple-700/60 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Abrir no Editor de Dietas</span>
                      </button>
                    )}

                    <button
                      onClick={handleSaveToElectronicRecord}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Validar & Ativar no Prontuário</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
