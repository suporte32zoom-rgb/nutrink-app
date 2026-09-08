/**
 * NUTRIA AI - Integração Direta com a API do Google Gemini (Client-Side & SDK Oficial)
 * 
 * Configuração definitiva da NÚTRIA:
 * 1. Definição Dinâmica do Modelo na API (process.env.VITE_GEMINI_MODEL / import.meta.env.VITE_GEMINI_MODEL com fallback Pro / 3.8 Flash).
 * 2. System Instructions Permanentes com autoridade clínica máxima (CFN/CFM, Nutrologia, Bioquímica, Exames e Prescrições).
 * 3. Contexto Dinâmico do Paciente Ativo em tela (Nome, Idade, Gênero, Antropometria, Exames Anexados, Histórico Clínico e Alergias).
 * 4. Correção Definitiva do Loop de Repetição do Chat (alternância estrita user/model no padrão do SDK sem duplicar perguntas).
 */

import { GoogleGenAI } from '@google/genai';
import { NutriaActionExecution, Patient, Appointment, UserAccount } from '../types';

export interface NutriaCallParams {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  activePatient?: Patient | null;
  patientContext?: any;
  patients?: Patient[];
  appointments?: any[];
  transactions?: any[];
  userAccount?: UserAccount;
  appContext?: {
    patientsCount?: number;
    todayAppointmentsCount?: number;
    monthlyRevenue?: number;
    monthlyExpenses?: number;
    userPlan?: string;
  };
}

export interface NutriaResponse {
  reply: string;
  actionExecuted?: NutriaActionExecution;
  model: string;
}

/**
 * 1. DEFINIÇÃO DINÂMICA DO MODELO NA API:
 * Lê prioritariamente de process.env.VITE_GEMINI_MODEL ou import.meta.env.VITE_GEMINI_MODEL.
 * Caso não definido, utiliza o modelo mais avançado configurado (gemini-3.8-flash ou gemini-pro).
 */
export function getClientGeminiModel(): string {
  // 1. Vite Environment
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) {
      const modelEnv = String(import.meta.env.VITE_GEMINI_MODEL).trim();
      if (modelEnv.length > 0) return modelEnv;
    }
  } catch {}

  // 2. Node / Process Environment
  try {
    if (typeof process !== 'undefined') {
      if (process.env?.VITE_GEMINI_MODEL) {
        const modelEnv = String(process.env.VITE_GEMINI_MODEL).trim();
        if (modelEnv.length > 0) return modelEnv;
      }
      if (process.env?.NEXT_PUBLIC_GEMINI_MODEL) {
        const modelEnv = String(process.env.NEXT_PUBLIC_GEMINI_MODEL).trim();
        if (modelEnv.length > 0) return modelEnv;
      }
      if (process.env?.GEMINI_MODEL) {
        const modelEnv = String(process.env.GEMINI_MODEL).trim();
        if (modelEnv.length > 0) return modelEnv;
      }
    }
  } catch {}

  // 3. Browser Window ou LocalStorage
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.VITE_GEMINI_MODEL && typeof win.VITE_GEMINI_MODEL === 'string') {
      return win.VITE_GEMINI_MODEL.trim();
    }
    if (win.process?.env?.VITE_GEMINI_MODEL) {
      return String(win.process.env.VITE_GEMINI_MODEL).trim();
    }
    try {
      const stored = localStorage.getItem('nutrink_gemini_model') || localStorage.getItem('gemini_model');
      if (stored && stored.trim()) return stored.trim();
    } catch {}
  }

  // Fallback prioritário estável e rápido: gemini-3.1-flash-lite
  return 'gemini-3.1-flash-lite';
}

/**
 * Obtém a chave da API do Gemini a partir do ambiente do cliente
 */
export function getClientGeminiApiKey(): string {
  // 1. Variável Vite padrão NUTRINK ou GEMINI
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const nutriaKey = (import.meta.env as any).VITE_NUTRINK_GEMINI_API_KEY || (import.meta.env as any).NUTRINK_GEMINI_API_KEY;
      if (nutriaKey && String(nutriaKey).trim().length > 5) return String(nutriaKey).trim();

      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || (import.meta.env as any).GEMINI_API_KEY;
      if (geminiKey && String(geminiKey).trim().length > 5) return String(geminiKey).trim();
    }
  } catch {}

  // 2. Variável process.env pública ou embutida
  try {
    if (typeof process !== 'undefined' && process.env) {
      const nutriaKey = process.env.NUTRINK_GEMINI_API_KEY || (process.env as any).NEXT_PUBLIC_NUTRINK_GEMINI_API_KEY;
      if (nutriaKey && String(nutriaKey).trim().length > 5) return String(nutriaKey).trim();

      const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (key && String(key).trim().length > 5) return String(key).trim();
    }
  } catch {}

  // 3. Injeção global no window ou localStorage
  if (typeof window !== 'undefined') {
    const win = window as any;
    const winKey = win.NUTRINK_GEMINI_API_KEY || win.VITE_NUTRINK_GEMINI_API_KEY || win.NEXT_PUBLIC_GEMINI_API_KEY || win.VITE_GEMINI_API_KEY;
    if (winKey && typeof winKey === 'string' && winKey.trim().length > 5) {
      return winKey.trim();
    }
    if (win.process?.env?.NUTRINK_GEMINI_API_KEY) {
      return String(win.process.env.NUTRINK_GEMINI_API_KEY).trim();
    }
    if (win.process?.env?.NEXT_PUBLIC_GEMINI_API_KEY) {
      return String(win.process.env.NEXT_PUBLIC_GEMINI_API_KEY).trim();
    }
    try {
      const localKey = localStorage.getItem('nutrink_gemini_api_key') || localStorage.getItem('gemini_api_key');
      if (localKey && localKey.trim().length > 5) {
        return localKey.trim();
      }
    } catch {}
  }

  return '';
}

/**
 * 2. SYSTEM INSTRUCTIONS PERMANENTES (ESPECIALISTA CLÍNICA MÁXIMA):
 * Diretrizes clínicas e científicas mandatórias do ecossistema NutrinK.
 */
export const NUTRIA_SYSTEM_INSTRUCTION = `Você é a NÚTRIA, a inteligência artificial especialista máxima do sistema NutrinK em Nutrição Clínica, Nutrologia, Nutrição Esportiva, Funcional, Pediatria e Geriatria.

DIRETRIZES OBRIGATÓRIAS DE ATUAÇÃO:
- Interpretação de Exames Laboratoriais: Analise marcadores como hemograma, perfil lipídico, glicemia, HbA1c, tireoide, vitaminas (D, B12), minerais (ferro, ferritina) e marcadores hepáticos/renais, correlacionando com sinais clínicos.
- Diagnóstico e Conduta Nutrológica/Nutricional: Indique condutas dietoterápicas, manejo de patologias (síndrome metabólica, doença celíaca, SII, esteatose, hipertensão, intolerâncias/alergias) e estratégias para hipertrofia e emagrecimento.
- Prescrição de Fórmulas e Suplementação: Sugira dosagens adequadas de fitoterápicos, micronutrientes, proteicos, manipulados e aminoácidos baseados em evidências.
- Receitas e Planos Alimentares: Forneça cardápios detalhados, receitas exatas com tabela de substituição, gramaturas, horários e modo de preparo.
- Resolução Total de Dúvidas: Responda a QUALQUER pergunta técnica formulada pelo profissional de saúde com fundamentação científica e aplicabilidade prática. NUNCA dê respostas evasivas, incompletas ou repetitivas.

DIRETRIZES TÉCNICAS E METABÓLICAS:
1. Fórmulas Energéticas Oficiais:
   - Mifflin-St Jeor (1990): TMB = 10×Peso + 6.25×Altura - 5×Idade + (Homem: +5 | Mulher: -161)
   - Cunningham (1980): TMB = 500 + 22×Massa Livre de Gordura (MLG)
   - Harris-Benedict (1984) e DRI/IOM para populações pediátricas e gestantes.
2. Tabelas de Composição de Alimentos:
   - Priorize dados da Tabela Brasileira de Composição de Alimentos (TACO) e USDA.
3. Conduta e Tom de Voz:
   - Postura profissional de alto nível, acolhedora, com rigor científico e aplicabilidade imediata para consultório.
   - Formato visual limpo e legível em Markdown, tabelas organizadas de macronutrientes, micronutrientes e listas de substituições.
   - NUNCA mencione "Gemini", "OpenAI" ou tecnologias externas; você é a NÚTRIA, do NutrinK.
4. Prevenção de Respostas Repetitivas:
   - Responda pontualmente e diretamente ao que foi perguntado, sem reintroduções genéricas ou repetir saudações desnecessárias a cada interação.
   - Quando for solicitada uma receita, cardápio ou fórmula, entregue as dosagens e gramaturas exatas prontas para prescrição.`;

/**
 * 3. CONTEXTO DINÂMICO DO PACIENTE ATIVO:
 * Injeta os dados clínicos, antropométricos, exames laboratoriais e histórico do paciente ativo.
 */
export function buildNutriaSystemInstruction(params: NutriaCallParams): string {
  let fullPrompt = NUTRIA_SYSTEM_INSTRUCTION;

  if (params.activePatient) {
    const p = params.activePatient;
    const anamnese = p.anamnese || {};
    const labExams = Array.isArray(p.labExams) ? p.labExams : [];
    const evolution = Array.isArray(p.evolutionHistory) && p.evolutionHistory.length > 0
      ? p.evolutionHistory[p.evolutionHistory.length - 1]
      : null;

    fullPrompt += `\n\n[CONTEXTO DINÂMICO DO PACIENTE ATIVO EM TELA]:
- Nome: ${p.name || 'Paciente em Atendimento'}
- Idade: ${p.age ? p.age + ' anos' : 'Não informada'} | Gênero: ${p.gender === 'masculino' ? 'Masculino' : p.gender === 'feminino' ? 'Feminino' : 'Outro'}
- Objetivo Clínico: ${p.objective || 'Acompanhamento Nutricional / Nutrológico'}
- Antropometria Atual:
  • Peso Atual: ${p.currentWeightKg || 70} kg (Inicial: ${p.initialWeightKg || p.currentWeightKg || 70} kg | Meta: ${p.targetWeightKg || 'Manutenção'} kg)
  • Altura: ${p.heightCm || 170} cm
  • IMC: ${p.bmi ? p.bmi.toFixed(1) : (p.currentWeightKg / ((p.heightCm / 100) ** 2)).toFixed(1)} kg/m²
  • % de Gordura: ${p.bodyFatPercentage ? p.bodyFatPercentage + '%' : 'Não aferido'}
  • % Massa Muscular: ${p.muscleMassPercentage ? p.muscleMassPercentage + '%' : 'Não aferido'}
  • TMB Registrada: ${p.tmb ? p.tmb + ' kcal/dia' : 'Calculada via Mifflin-St Jeor'}
  • Gasto Energético Total (GET): ${p.get ? p.get + ' kcal/dia' : 'Estimado'}
  • Fator de Atividade: ${p.activityFactor || 1.4}
${evolution ? `  • Medidas Mais Recentes: Cintura: ${evolution.waistCircumferenceCm || '-'} cm, Quadril: ${evolution.hipCircumferenceCm || '-'} cm, Braço: ${evolution.armCircumferenceCm || '-'} cm, Dobra Tricipital: ${evolution.tricepsFoldMm || '-'} mm, Subescapular: ${evolution.subscapularFoldMm || '-'} mm` : ''}

- Alergias e Intolerâncias:
  ${anamnese.foodAllergiesAndIntolerances || 'Nenhuma alergia ou intolerância registrada.'}

- Histórico Clínico & Patologias:
  ${anamnese.clinicalHistory || 'Sem patologias prévias relatadas.'}

- Medicamentos e Suplementos em Uso:
  ${anamnese.currentMedicationsAndSupplements || 'Nenhum medicamento ou suplemento informado.'}

- Hábitos, Rotina & Estilo de Vida:
  • Atividade Física: ${anamnese.physicalActivity || 'Não informada'}
  • Ingestão Hídrica: ${anamnese.waterIntakeLiters ? anamnese.waterIntakeLiters + ' L/dia' : '2.0 L/dia'}
  • Qualidade do Sono: ${anamnese.sleepHoursPerNight ? anamnese.sleepHoursPerNight + 'h por noite' : 'Normal'}
  • Hábito Intestinal: ${anamnese.bowelHabit || 'Regular'}
  • Preferências Alimentares: ${anamnese.dietaryPreferences || 'Não informadas'}
  • Aversões Alimentares: ${anamnese.dietaryAversions || 'Nenhuma registrada'}

- Exames Laboratoriais Anexados (${labExams.length} exames cadastrados):
${labExams.length > 0 
  ? labExams.map(ex => {
      const markersList = Array.isArray(ex.markers)
        ? ex.markers.map(m => `    • ${m.marker}: ${m.value} ${m.unit} (Ref: ${m.referenceRange || 'N/A'}) [Status: ${m.status.toUpperCase()}]`).join('\n')
        : '    • Sem marcadores cadastrados';
      return `  * ${ex.title} (${ex.date || 'Recente'}):\n${markersList}${ex.nutriaClinicalReview ? `\n    Observações Clínicas: ${ex.nutriaClinicalReview}` : ''}`;
    }).join('\n')
  : '  (Nenhum exame laboratorial anexado no momento)'}

${p.mealPlan ? `- Plano Alimentar Vigente: ${p.mealPlan.title || 'Plano Cadastrado'} (${p.mealPlan.targetCalories || 2000} kcal | P: ${p.mealPlan.targetProteinGrams || 140}g | C: ${p.mealPlan.targetCarbsGrams || 220}g | G: ${p.mealPlan.targetFatGrams || 65}g)` : ''}

ORIENTAÇÃO OBRIGATÓRIA: Qualquer cálculo calórico, conduta, prescrição ou receita deve considerar integralmente os dados do(a) paciente ${p.name}, suas restrições e exames anexados.`;
  }

  if (params.userAccount) {
    const u = params.userAccount;
    fullPrompt += `\n\n[PROFISSIONAL DE SAÚDE EM ATENDIMENTO]:
- Nome: ${u.name || 'Profissional'} | Registro: ${u.crn || 'CRN/CRM Ativo'}
- Especialidade: ${u.specialty || 'Nutrição Clínica & Funcional'}
- Plano NutrinK: ${u.plan.toUpperCase()}`;
  }

  if (params.appContext) {
    const ctx = params.appContext;
    fullPrompt += `\n\n[ESTADO DO CONSULTÓRIO]:
- Total de Pacientes Ativos: ${ctx.patientsCount ?? 0}
- Consultas Hoje: ${ctx.todayAppointmentsCount ?? 0}
- Faturamento do Mês: R$ ${(ctx.monthlyRevenue ?? 0).toFixed(2)}`;
  }

  return fullPrompt;
}

/**
 * 4. CORREÇÃO DO LOOP DE REPETIÇÃO DO CHAT:
 * Formata as mensagens de histórico de forma limpa no padrão oficial do SDK do Gemini (role: 'user' e 'model'),
 * eliminando duplicações da pergunta atual, mesclando mensagens consecutivas de mesmo papel e
 * garantindo término estrito com a pergunta do usuário.
 */
export function formatGeminiContents(
  conversationHistory: Array<{ role: string; content: string }> = [],
  currentMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const normalizedCurrent = currentMessage.trim();
  const rawTurns: Array<{ role: 'user' | 'model'; text: string }> = [];

  // 1. Normaliza as mensagens anteriores do histórico
  for (const item of conversationHistory) {
    if (!item || !item.content) continue;
    const text = String(item.content).trim();
    if (!text) continue;

    const role: 'user' | 'model' = (item.role === 'model' || item.role === 'assistant') ? 'model' : 'user';
    rawTurns.push({ role, text });
  }

  // 2. Se a última mensagem do histórico já for a pergunta atual que o frontend pré-adicionou ao estado, removemos para não duplicar
  if (rawTurns.length > 0) {
    const lastTurn = rawTurns[rawTurns.length - 1];
    if (lastTurn.role === 'user' && lastTurn.text === normalizedCurrent) {
      rawTurns.pop();
    }
  }

  // 3. Pegamos até as últimas 8 interações para manter foco clínico e economia de tokens
  const slicedTurns = rawTurns.slice(-8);

  // 4. Garante alternância estrita entre 'user' e 'model'
  const alternatingContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const turn of slicedTurns) {
    if (alternatingContents.length === 0) {
      alternatingContents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
      continue;
    }

    const prevTurn = alternatingContents[alternatingContents.length - 1];
    if (prevTurn.role === turn.role) {
      // Mescla mensagens consecutivas do mesmo papel em vez de repetir o papel (evita erro de validação do SDK)
      prevTurn.parts[0].text += `\n\n${turn.text}`;
    } else {
      alternatingContents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    }
  }

  // 5. Adiciona a pergunta atual como a última mensagem com role: 'user'
  if (alternatingContents.length > 0 && alternatingContents[alternatingContents.length - 1].role === 'user') {
    // Se por acaso terminou em user, substitui ou combina para evitar dois 'user' seguidos
    alternatingContents[alternatingContents.length - 1] = {
      role: 'user',
      parts: [{ text: normalizedCurrent }]
    };
  } else {
    alternatingContents.push({
      role: 'user',
      parts: [{ text: normalizedCurrent }]
    });
  }

  return alternatingContents;
}

/**
 * Detecta intenções de ações operacionais clínicas para sincronização com o estado do app
 */
export function detectOperationalAction(userInput: string, aiReply: string, params: NutriaCallParams): NutriaActionExecution | undefined {
  const lower = userInput.toLowerCase();

  // 1. Ação de cadastrar paciente
  if (lower.includes('cadastrar paciente') || lower.includes('cadastre o paciente') || lower.includes('novo paciente')) {
    const match = userInput.match(/(?:paciente|nome)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/i);
    const patientName = match ? match[1] : 'Novo Paciente';
    return {
      type: 'patient_created',
      payload: {
        id: `pat-${Date.now()}`,
        name: patientName,
        age: 30,
        gender: 'masculino',
        currentWeightKg: 70,
        heightCm: 175,
        objective: 'Acompanhamento Nutricional',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      summary: `Paciente ${patientName} pré-cadastrado no prontuário.`
    };
  }

  // 2. Ação de agendar consulta
  if (lower.includes('agendar consulta') || lower.includes('agende consulta') || lower.includes('marcar consulta')) {
    return {
      type: 'appointment_scheduled',
      payload: {
        id: `apt-${Date.now()}`,
        patientId: params.activePatient?.id || 'pat-1',
        patientName: params.activePatient?.name || 'Consulta Nutricional',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        type: 'presencial',
        status: 'confirmed',
        modality: 'presencial',
        value: 250
      },
      summary: 'Consulta agendada no calendário NutrinK.'
    };
  }

  // 3. Ação de lançar financeiro
  if (lower.includes('lançar receita') || lower.includes('lance uma receita') || lower.includes('registrar pagamento')) {
    const valueMatch = userInput.match(/(?:r\$|reais)\s*(\d+(?:[.,]\d+)?)/i) || userInput.match(/(\d+(?:[.,]\d+)?)\s*(?:reais|via pix)/i);
    const amount = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 250;
    return {
      type: 'transaction_logged',
      payload: {
        id: `tx-${Date.now()}`,
        description: 'Consulta Nutricional - NUTRIA',
        type: 'income',
        amount: amount,
        category: 'consultas',
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: 'pix'
      },
      summary: `Receita de R$ ${amount.toFixed(2)} lançada no Financeiro.`
    };
  }

  // 4. Ação de navegação para planos
  if (lower.includes('abrir planos') || lower.includes('ver planos') || lower.includes('assinar') || lower.includes('upgrade')) {
    return {
      type: 'NAVIGATE_TAB',
      payload: { tab: 'plans' },
      summary: 'Abertura do painel de Planos e Assinaturas.'
    };
  }

  return undefined;
}

/**
 * Executa a chamada à NÚTRIA diretamente via Google Gemini.
 * 
 * - Prioriza a rota backend segura /api/nutria com failover multi-modelo e injeção completa de dados do consultório e do paciente ativo.
 * - Toda e qualquer mensagem digitada é processada dinamicamente pela IA.
 * - Sem templates fictícios ou respostas estáticas prontas.
 */
export async function callNutriaDirect(params: NutriaCallParams): Promise<NutriaResponse> {
  const payload = {
    message: params.message,
    conversationHistory: params.conversationHistory || [],
    activePatient: params.activePatient || params.patientContext || null,
    patientContext: params.activePatient || params.patientContext || null,
    patients: params.patients || [],
    patientsContext: params.patients || [],
    appointments: params.appointments || [],
    todayAppointments: params.appointments || [],
    transactions: params.transactions || [],
    userAccount: params.userAccount || null,
    appContext: params.appContext || {},
    appStateContext: params.appContext || {}
  };

  // 1. Tenta a rota backend segura /api/nutria
  try {
    const resp = await fetch('/api/nutria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        return {
          reply: data.reply.trim(),
          actionExecuted: data.actionExecuted,
          model: data.model || 'gemini'
        };
      }
    } else {
      const errJson = await resp.json().catch(() => null);
      if (errJson?.reply && typeof errJson.reply === 'string') {
        return {
          reply: errJson.reply,
          actionExecuted: errJson.actionExecuted,
          model: 'error'
        };
      }
    }
  } catch (backendErr) {
    console.warn('[NUTRIA AI] Rota backend /api/nutria falhou, tentando fallback cliente se configurado:', backendErr);
  }

  // 2. Se backend falhou e há chave no cliente, tenta chamada direta via SDK @google/genai
  const apiKey = getClientGeminiApiKey();
  if (apiKey) {
    const systemInstruction = buildNutriaSystemInstruction(params);
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    const contents = formatGeminiContents(params.conversationHistory, params.message);

    for (const model of candidateModels) {
      try {
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.5,
            maxOutputTokens: 2048,
          }
        });

        const textReply = response.text || (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textReply && typeof textReply === 'string' && textReply.trim().length > 0) {
          const actionExecuted = detectOperationalAction(params.message, textReply, params);
          return {
            reply: textReply.trim(),
            actionExecuted,
            model
          };
        }
      } catch (err) {
        console.warn(`[NUTRIA AI] Falha com modelo ${model} no cliente:`, err);
        continue;
      }
    }
  }

  // 3. Caso a chamada falhe, informa erro genuíno sem nunca devolver template fixo
  return {
    reply: "Desculpe, Doutor(a). Ocorreu uma instabilidade temporária na conexão com a inteligência artificial. Por favor, tente enviar sua mensagem novamente.",
    model: 'error'
  };
}
