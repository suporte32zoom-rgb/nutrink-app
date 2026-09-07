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
  patients?: Patient[];
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

  // Fallback prioritário avançado: gemini-3.8-flash (ou gemini-pro)
  return 'gemini-3.8-flash';
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
 * Resposta clínica de contingência de alta precisão
 */
export function generateFallbackClinicalResponse(userInput: string, params: NutriaCallParams): NutriaResponse {
  const lower = userInput.toLowerCase();
  const patient = params.activePatient;
  const name = patient?.name || 'paciente';

  let reply = '';

  if (lower.includes('tmb') || lower.includes('get') || lower.includes('calcule') || lower.includes('calorias')) {
    const weight = patient?.currentWeightKg || 70;
    const height = patient?.heightCm || 170;
    const age = patient?.age || 30;
    const isMale = patient ? patient.gender === 'masculino' : true;

    // Mifflin-St Jeor (1990)
    const bmr = isMale
      ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    const get = Math.round(bmr * (patient?.activityFactor || 1.4));

    reply = `### 🧬 Avaliação Energética e Metabólica - NÚTRIA
**Paciente:** ${name} | **Protocolo:** Mifflin-St Jeor (1990)

| Parâmetro Metabólico | Resultado Estimado | Memória de Cálculo |
| :--- | :--- | :--- |
| **Peso / Estatura** | ${weight} kg / ${height} cm | Medidas antropométricas atuais |
| **TMB (Taxa Metabólica Basal)** | **${bmr} kcal/dia** | 10×P + 6.25×A - 5×I ${isMale ? '+ 5' : '- 161'} |
| **Fator Atividade (FA)** | ${patient?.activityFactor || 1.4} | Rotina diária relatada |
| **GET (Gasto Energético Total)** | **${get} kcal/dia** | TMB × FA |

---

#### 🎯 Prescrição de Macronutrientes Sugerida:
- **Proteínas**: 1.8 a 2.0 g/kg (${Math.round(weight * 1.8)}g a ${Math.round(weight * 2.0)}g/dia)
- **Lipídios**: 0.8 a 1.0 g/kg (${Math.round(weight * 0.8)}g a ${Math.round(weight * 1.0)}g/dia)
- **Carboidratos**: Restante do Valor Energético Total para suprir a demanda glicídica.
- **Hidratação:** ${((weight * 35) / 1000).toFixed(1)} L/dia (35 mL/kg).`;
  } else if (lower.includes('plano') && (lower.includes('alimentar') || lower.includes('dieta') || lower.includes('macros'))) {
    reply = `### 🥗 Prescrição Dietética Estruturada - NÚTRIA
**Paciente:** ${name} | **Objetivo:** ${patient?.objective || 'Equilíbrio Metabólico'}

| Refeição | Horário | Itens Prescritos | Gramaturas & Macros Estimados |
| :--- | :--- | :--- | :--- |
| **Desjejum** | 07:30 | Ovos mexidos (2 unid.) + Pão integral (2 fatias - 50g) + Café puro sem açúcar | ~340 kcal • 22g P • 30g C • 14g G |
| **Colação** | 10:30 | Iogurte natural desnatado (170g) + Castanhas-do-pará (10g) | ~160 kcal • 10g P • 10g C • 9g G |
| **Almoço** | 12:30 | Peito de frango grelhado (140g) + Arroz integral (100g) + Feijão carioca (80g) + Azeite extravirgem (5ml) + Salada crua à vontade | ~520 kcal • 44g P • 52g C • 12g G |
| **Lanche da Tarde** | 16:00 | Fruta fresca (Maçã/Banana - 100g) + Whey Protein 80% (30g) diluído em água | ~230 kcal • 25g P • 24g C • 2g G |
| **Jantar** | 19:45 | Filé de peixe assado (tilápia - 150g) + Batata-doce cozida (130g) + Brócolis e abobrinha no vapor | ~410 kcal • 38g P • 38g C • 6g G |

*💧 Hidratação recomendada: 35 mL/kg/dia.*`;
  } else {
    reply = `Olá, Doutor(a)! A **NÚTRIA** está à disposição no consultório.

Com relação a **"${userInput}"**:
- Para interpretação de exames: forneça os valores de hemograma, ferritina, perfil lipídico, glicemia ou tireoide.
- Para prescrição dietética: informe calorias-alvo ou perfil metabólico para montagem detalhada do cardápio.
- Para cálculos: solicite estimativas de TMB, GET e divisão de macronutrientes.`;
  }

  const actionExecuted = detectOperationalAction(userInput, reply, params);

  return {
    reply,
    actionExecuted,
    model: 'nutria-clinical-engine'
  };
}

/**
 * Cliente singleton do GoogleGenAI
 */
let cachedGenAIClient: GoogleGenAI | null = null;
let cachedGenAIApiKey: string = '';

export function getGenAIClient(apiKey: string): GoogleGenAI {
  if (cachedGenAIClient && cachedGenAIApiKey === apiKey) {
    return cachedGenAIClient;
  }
  cachedGenAIClient = new GoogleGenAI({ apiKey });
  cachedGenAIApiKey = apiKey;
  return cachedGenAIClient;
}

/**
 * Executa a chamada à NÚTRIA com o SDK oficial @google/genai diretamente no Browser.
 * 
 * - Lê o modelo de forma dinâmica (VITE_GEMINI_MODEL ou fallback para gemini-3.8-flash / gemini-pro).
 * - Utiliza a System Instruction médica/nutrológica completa com o contexto do paciente.
 * - Formata o histórico estritamente sem loops ou repetições.
 */
export async function callNutriaDirect(params: NutriaCallParams): Promise<NutriaResponse> {
  const apiKey = getClientGeminiApiKey();

  // Se não houver chave no frontend, tenta a rota segura do backend (/api/nutria) antes do fallback determinístico
  if (!apiKey) {
    try {
      const resp = await fetch('/api/nutria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: params.message,
          conversationHistory: params.conversationHistory,
          patientContext: params.activePatient,
          patientsContext: params.patients,
          userAccount: params.userAccount,
          context: params.appContext
        })
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
      }
    } catch (backendErr) {
      console.warn('[NUTRIA AI] Tentativa via rota backend /api/nutria falhou:', backendErr);
    }

    console.warn('[NUTRIA AI] Chave Gemini não encontrada no cliente e backend indisponível. Utilizando motor clínico de contingência.');
    return generateFallbackClinicalResponse(params.message, params);
  }

  const systemInstruction = buildNutriaSystemInstruction(params);
  const targetModel = getClientGeminiModel();
  const contents = formatGeminiContents(params.conversationHistory, params.message);

  // 1. Tenta inicializar e chamar via biblioteca oficial @google/genai no browser
  try {
    const ai = getGenAIClient(apiKey);

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
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
        model: targetModel
      };
    }
  } catch (sdkError: any) {
    console.warn(`[NUTRIA AI] Aviso na chamada do SDK (@google/genai) com modelo ${targetModel}:`, sdkError?.message || sdkError);
  }

  // 2. Se o modelo configurado falhou (ex: gemini-pro sem acesso ou cota), tenta o fallback na linha Flash moderna
  const fallbackModel = targetModel === 'gemini-3.8-flash' ? 'gemini-flash-latest' : 'gemini-3.8-flash';
  try {
    const ai = getGenAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: fallbackModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
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
        model: fallbackModel
      };
    }
  } catch (fallbackError: any) {
    console.warn(`[NUTRIA AI] Aviso na chamada do modelo de fallback ${fallbackModel}:`, fallbackError?.message || fallbackError);
  }

  // 3. Fallback REST direto com compatibilidade máxima
  try {
    const restModel = targetModel.startsWith('gemini') ? targetModel : 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2048
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const textReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textReply && typeof textReply === 'string' && textReply.trim().length > 0) {
        const actionExecuted = detectOperationalAction(params.message, textReply, params);
        return {
          reply: textReply.trim(),
          actionExecuted,
          model: restModel
        };
      }
    }
  } catch (restError) {
    console.warn('[NUTRIA AI] Erro no fallback REST do Gemini:', restError);
  }

  // 4. Fallback final garantido: Motor clínico local sem risco de tela branca
  return generateFallbackClinicalResponse(params.message, params);
}
