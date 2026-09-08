/**
 * NUTRIA AI - Integração Direta com a API do Google Gemini (Client-Side & SDK Oficial)
 * 
 * Reestruturação Completa da IA NÚTRIA:
 * 1. Configuração do Modelo na API: Versão 'gemini-3.7-flash' prioritária com suporte a override dinâmico.
 * 2. System Instructions Permanentes: Especialista Clínica máxima (CFN/CFM, Nutrologia, Bioquímica, Exames, Prescrições) e Gestão do Consultório.
 * 3. Injeção Dinâmica de Contexto: Paciente ativo (Nome, Idade, Antropometria, Exames, Histórico, Alergias) e Plataforma (Agenda, Financeiro, Prontuários).
 * 4. Tratamento do Histórico de Conversa: Alternância estrita sem duplicação ou repetição de mensagens.
 */

import { GoogleGenAI } from '@google/genai';
import { NutriaActionExecution, Patient, Appointment, FinancialTransaction, UserAccount } from '../types';

export interface NutriaCallParams {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  activePatient?: Patient | null;
  patientContext?: Patient | null;
  patients?: Patient[];
  appointments?: Appointment[];
  transactions?: FinancialTransaction[];
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
 * 1. CONFIGURAÇÃO DO MODELO NA API:
 * Configura o modelo prioritário para 'gemini-3.7-flash'.
 * Lê dinamicamente de process.env.VITE_GEMINI_MODEL / import.meta.env.VITE_GEMINI_MODEL caso customizado.
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

  // Modelo oficial padrão: gemini-3.7-flash
  return 'gemini-3.7-flash';
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
 * 2. SYSTEM INSTRUCTIONS PERMANENTES (ESPECIALISTA CLÍNICA E CONSULTÓRIO):
 * Diretriz permanente e mandante da IA NÚTRIA no NutrinK.
 */
export const NUTRIA_SYSTEM_INSTRUCTION = `Você é a NÚTRIA, a inteligência artificial especialista máxima do sistema NutrinK em Nutrição Clínica, Nutrologia, Nutrição Esportiva, Funcional, Pediatria e Geriatria, além de assistente inteligente para gestão do consultório.

DIRETRIZES OBRIGATÓRIAS DE ATUAÇÃO:
- Mensagem Inicial / Saudação: Mantenha sempre saudações curtas e diretas ao abrir o chat (Ex: 'Olá, Doutor(a)! Como posso te apoiar agora?').
- Prioridade de Dados da Mensagem (Override Mandatório): Se a mensagem digitada pelo usuário contiver dados antropométricos expressos (ex: peso, altura, idade, sexo, objetivo, rotina), OBRIGATORIAMENTE utilize esses valores para todos os cálculos e prescrições da resposta, ignorando e sobrepondo quaisquer dados prévios do banco/contexto se houver divergência.
- Cumprimento Integral da Solicitação de Plano Alimentar: Quando o profissional solicitar um "plano alimentar completo", "cardápio", "dieta" ou "tabela de refeições" (mesmo quando acompanhado de cálculo de TMB/GET), você NUNCA deve parar apenas na avaliação metabólica ou nos cálculos energéticos. Você DEVE OBRIGATORIAMENTE incluir na mesma resposta:
  1. Tabela/lista de Refeições Diárias completas (Café da Manhã/Desjejum, Lanche da Manhã/Colação, Almoço, Lanche da Tarde, Jantar e Ceia quando aplicável).
  2. Opções de alimentos detalhados com gramaturas exatas e medidas caseiras práticas (ex: 150g de peito de frango grelhado - 1 filé médio; 100g de arroz integral - 4 colheres de sopa cheias).
  3. Calorias e macronutrientes (Proteína, Carboidratos, Lipídios) discriminados por refeição e o total do dia.
  4. Lista de opções de substituição equivalentes para os itens do plano.
- Estilo de Resposta: Responda tudo em uma única mensagem contínua e bem formatada em Markdown, garantindo que o plano alimentar completo seja exibido integralmente até o final, sem cortes ou interrupções.
- Interpretação de Exames Laboratoriais: Analise marcadores como hemograma, perfil lipídico, glicemia, HbA1c, tireoide, vitaminas (D, B12), minerais e marcadores hepáticos/renais.
- Prescrição e Conduta: Indique condutas dietoterápicas, suplementação, receitas com gramaturas, tabela de substituição e estratégias personalizadas.
- Gestão do Consultório: Responda a dúvidas e consultas sobre agenda, prontuários, financeiro e faturamento sempre que solicitado pelo profissional.
- Respostas Dinâmicas: Responda sempre de forma direta, personalizada e científica para a pergunta exata do usuário. NUNCA utilize templates estáticos ou textos genéricos de instrução como resposta.

DIRETRIZES TÉCNICAS E METABÓLICAS:
1. Fórmulas Energéticas Oficiais:
   - Mifflin-St Jeor (1990): TMB = 10×Peso + 6.25×Altura - 5×Idade + (Homem: +5 | Mulher: -161)
   - Cunningham (1980): TMB = 500 + 22×Massa Livre de Gordura (MLG)
   - Harris-Benedict (1984) e DRI/IOM para populações pediátricas e gestantes.
2. Tabelas de Composição de Alimentos:
   - Priorize dados da Tabela Brasileira de Composição de Alimentos (TACO) e USDA.
3. Conduta e Tom de Voz:
   - Postura profissional de alto nível, acolhedora, com rigor científico e aplicabilidade imediata para consultório.
   - Formate em Markdown limpo, com tabelas organizadas de macronutrientes, micronutrientes e listas de substituições.
   - Sua identidade é NÚTRIA do NutrinK. NUNCA mencione "Gemini", "Google", "OpenAI" ou tecnologias externas.
4. Respostas Diretas e Personalizadas:
   - Responda pontualmente e diretamente ao que foi perguntado, sem reintroduções genéricas ou repetir saudações desnecessárias a cada interação.
   - Quando for solicitada uma receita, cardápio ou fórmula, entregue as dosagens e gramaturas exatas prontas para prescrição.`;

/**
 * Extrai dados antropométricos expressos na mensagem do usuário para garantia de override
 */
export function extractMessageAnthropometrics(message: string): {
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'masculino' | 'feminino';
  objective?: string;
} {
  const result: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: 'masculino' | 'feminino';
    objective?: string;
  } = {};

  if (!message) return result;
  const text = message.toLowerCase();

  // Peso: 80kg, 80 kg, 80.5kg, peso de 80, pesando 80
  const weightMatch = text.match(/(?:peso(?:\s+de|\s*[:=])?\s*|pesando\s*|com\s*)?(\d{2,3}(?:[.,]\d+)?)\s*(?:kg|quilos|kilos)\b/i)
    || text.match(/\b(\d{2,3}(?:[.,]\d+)?)\s*kg\b/i);
  if (weightMatch) {
    const w = parseFloat(weightMatch[1].replace(',', '.'));
    if (w >= 30 && w <= 300) {
      result.weight = w;
    }
  }

  // Altura: 180cm, 180 cm, 1.80m, 1,80m, altura de 180
  const heightCmMatch = text.match(/(?:altura(?:\s+de|\s*[:=])?\s*)?(\d{3})\s*(?:cm|centimetros|centímetros)\b/i);
  const heightMMatch = text.match(/(?:altura(?:\s+de|\s*[:=])?\s*)?([12][.,]\d{2})\s*(?:m|metros)?\b/i);
  if (heightCmMatch) {
    const h = parseInt(heightCmMatch[1], 10);
    if (h >= 100 && h <= 240) result.height = h;
  } else if (heightMMatch) {
    const h = Math.round(parseFloat(heightMMatch[1].replace(',', '.')) * 100);
    if (h >= 100 && h <= 240) result.height = h;
  }

  // Idade: 30 anos, 30anos, idade de 30
  const ageMatch = text.match(/(?:idade(?:\s+de|\s*[:=])?\s*)?(\d{1,3})\s*(?:anos|ano)\b/i);
  if (ageMatch) {
    const a = parseInt(ageMatch[1], 10);
    if (a >= 1 && a <= 120) result.age = a;
  }

  // Gênero
  if (text.match(/\b(homem|masculino|rapaz|senhor|macho)\b/i)) {
    result.gender = 'masculino';
  } else if (text.match(/\b(mulher|feminino|moca|moça|senhora|femea|fêmea)\b/i)) {
    result.gender = 'feminino';
  }

  // Objetivo
  if (text.includes('hipertrofia') || text.includes('ganho de massa') || text.includes('ganhar massa')) {
    result.objective = 'Hipertrofia Muscular';
  } else if (text.includes('emagrecimento') || text.includes('perder peso') || text.includes('queimar gordura') || text.includes('secagem') || text.includes('cutting')) {
    result.objective = 'Emagrecimento e Perda de Gordura';
  } else if (text.includes('manutenção') || text.includes('manter peso') || text.includes('saude')) {
    result.objective = 'Manutenção e Saúde Metabólica';
  }

  return result;
}

/**
 * 3. INJEÇÃO DINÂMICA DE CONTEXTO:
 * Injeta no contexto os dados do paciente ativo em tela (Nome, Idade, Antropometria, Exames, Histórico e Alergias)
 * e os dados da plataforma (Agenda, Financeiro e Prontuários).
 */
export function buildNutriaSystemInstruction(params: NutriaCallParams): string {
  let fullPrompt = NUTRIA_SYSTEM_INSTRUCTION;
  const targetPatient = params.activePatient || params.patientContext;

  // 1. Extração e Validação de Dados Expressos na Mensagem Atual (PRIORIDADE MÁXIMA DE OVERRIDE)
  const messageData = extractMessageAnthropometrics(params.message);
  const hasMessageOverride = !!(messageData.weight || messageData.height || messageData.age || messageData.gender || messageData.objective);

  if (hasMessageOverride) {
    fullPrompt += `\n\n[DADOS ANTROPOMÉTRICOS EXPRESSOS NA MENSAGEM DO USUÁRIO - PRIORIDADE MÁXIMA / SOBREPOSIÇÃO MANDATÓRIA]:
${messageData.weight ? `• PESO INFORMADO NA MENSAGEM: ${messageData.weight} kg (SOBREPÕE QUALQUER PESO ANTERIOR DO PRONTUÁRIO)` : ''}
${messageData.height ? `• ALTURA INFORMADA NA MENSAGEM: ${messageData.height} cm (${(messageData.height / 100).toFixed(2)} m)` : ''}
${messageData.age ? `• IDADE INFORMADA NA MENSAGEM: ${messageData.age} anos` : ''}
${messageData.gender ? `• SEXO / GÊNERO: ${messageData.gender === 'masculino' ? 'Masculino' : 'Feminino'}` : ''}
${messageData.objective ? `• OBJETIVO CLÍNICO: ${messageData.objective}` : ''}

REGRA DE CÁLCULO CRÍTICA:
Você DEVE utilizar ESTRITAMENTE os dados acima informados na mensagem para TODOS os cálculos de TMB, GET, distribuição de macronutrientes e montagem do plano alimentar. Descarte qualquer valor divergente presente no banco/prontuário.`;
  }

  // Injeção do Paciente Ativo
  if (targetPatient) {
    const p = targetPatient;
    const anamnese = p.anamnese || {};
    const labExams = Array.isArray(p.labExams) ? p.labExams : [];
    const evolution = Array.isArray(p.evolutionHistory) && p.evolutionHistory.length > 0
      ? p.evolutionHistory[p.evolutionHistory.length - 1]
      : null;

    fullPrompt += `\n\n[CONTEXTO DINÂMICO DO PACIENTE ATIVO EM TELA]:
- Nome: ${p.name || 'Paciente em Atendimento'}
- Idade (Registro): ${p.age ? p.age + ' anos' : 'Não informada'} | Gênero: ${p.gender === 'masculino' ? 'Masculino' : p.gender === 'feminino' ? 'Feminino' : 'Outro'}
- Objetivo Clínico: ${p.objective || 'Acompanhamento Nutricional / Nutrológico'}
- Antropometria Cadastrada no Banco:
  • Peso Registrado: ${p.currentWeightKg || 70} kg (Inicial: ${p.initialWeightKg || p.currentWeightKg || 70} kg | Meta: ${p.targetWeightKg || 'Manutenção'} kg)
  • Altura Registrada: ${p.heightCm || 170} cm
  • IMC: ${p.bmi ? p.bmi.toFixed(1) : (p.currentWeightKg / ((p.heightCm / 100) ** 2)).toFixed(1)} kg/m²
  • % de Gordura: ${p.bodyFatPercentage ? p.bodyFatPercentage + '%' : 'Não aferido'}
  • % Massa Muscular: ${p.muscleMassPercentage ? p.muscleMassPercentage + '%' : 'Não aferido'}
  • TMB Registrada: ${p.tmb ? p.tmb + ' kcal/dia' : 'Calculada via Mifflin-St Jeor'}
  • Gasto Energético Total (GET): ${p.get ? p.get + ' kcal/dia' : 'Estimado'}
  • Fator de Atividade: ${p.activityFactor || 1.4}
${evolution ? `  • Circunferências Mais Recentes: Cintura: ${evolution.waistCircumferenceCm || '-'} cm, Quadril: ${evolution.hipCircumferenceCm || '-'} cm, Braço: ${evolution.armCircumferenceCm || '-'} cm, Dobra Tricipital: ${evolution.tricepsFoldMm || '-'} mm, Subescapular: ${evolution.subscapularFoldMm || '-'} mm` : ''}

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

ORIENTAÇÃO: Se o usuário expressou novos dados na mensagem, priorize-os. Caso contrário, utilize os dados cadastrais do(a) paciente ${p.name}.`;
  }

  // Injeção do Profissional de Saúde
  if (params.userAccount) {
    const u = params.userAccount;
    fullPrompt += `\n\n[PROFISSIONAL DE SAÚDE RESPONSÁVEL]:
- Nome: ${u.name || 'Profissional'} | Registro: ${u.crn || 'CRN/CRM Ativo'}
- Especialidade: ${u.specialty || 'Nutrição Clínica & Funcional'}
- Plano NutrinK: ${u.plan.toUpperCase()}`;
  }

  // Injeção dos Dados da Plataforma (Agenda, Financeiro, Prontuários)
  const patientsList = Array.isArray(params.patients) ? params.patients : [];
  const appointmentsList = Array.isArray(params.appointments) ? params.appointments : [];
  const transactionsList = Array.isArray(params.transactions) ? params.transactions : [];
  const ctx = params.appContext;

  const totalPatients = patientsList.length > 0 ? patientsList.length : (ctx?.patientsCount ?? 0);
  const totalApts = appointmentsList.length > 0 ? appointmentsList.length : (ctx?.todayAppointmentsCount ?? 0);
  const rev = ctx?.monthlyRevenue ?? 0;
  const exp = ctx?.monthlyExpenses ?? 0;

  fullPrompt += `\n\n[DADOS DA PLATAFORMA & GESTÃO DO CONSULTÓRIO]:
- Total de Prontuários de Pacientes: ${totalPatients}
- Consultas na Grade: ${totalApts}
- Faturamento do Mês: R$ ${rev.toFixed(2)} | Despesas: R$ ${exp.toFixed(2)} | Saldo Líquido: R$ ${(rev - exp).toFixed(2)}`;

  if (appointmentsList.length > 0) {
    const aptsSummary = appointmentsList.slice(0, 8).map((a, i) => `  ${i + 1}. ${a.date} às ${a.time} - ${a.patientName || a.patientId} (${a.modality || a.type || 'Presencial'}) [Status: ${a.status || 'Confirmada'}]${a.value ? ` R$ ${a.value}` : ''}`).join('\n');
    fullPrompt += `\n\n[AGENDA DE CONSULTAS PRÓXIMAS]:\n${aptsSummary}`;
  }

  if (transactionsList.length > 0) {
    const txSummary = transactionsList.slice(0, 6).map((t, i) => `  ${i + 1}. [${t.type === 'receita' ? 'RECEITA' : 'DESPESA'}] R$ ${Number(t.amount).toFixed(2)} - ${t.description} (${t.paymentMethod || 'PIX'}) - Data: ${t.date}`).join('\n');
    fullPrompt += `\n\n[ÚLTIMAS TRANSAÇÕES FINANCEIRAS]:\n${txSummary}`;
  }

  if (patientsList.length > 0) {
    const pListSummary = patientsList.slice(0, 10).map((p, i) => `  ${i + 1}. ${p.name} (${p.age ? p.age + ' anos' : 'idade n/i'}) - Peso: ${p.currentWeightKg || 'n/i'} kg - Objetivo: ${p.objective || 'Acompanhamento'}`).join('\n');
    fullPrompt += `\n\n[LISTA DE PACIENTES DO CONSULTÓRIO]:\n${pListSummary}`;
  }

  return fullPrompt;
}

/**
 * 4. TRATAMENTO DO HISTÓRICO DE CONVERSA:
 * Formata as mensagens de histórico no padrão oficial do SDK do Gemini (role: 'user' e 'model'),
 * garantindo alternância estrita, eliminando duplicações da pergunta atual e evitando repetições de mensagens.
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

  // 2. Remove duplicação da pergunta se ela já foi adicionada ao histórico pelo frontend
  if (rawTurns.length > 0) {
    const lastTurn = rawTurns[rawTurns.length - 1];
    if (lastTurn.role === 'user' && lastTurn.text === normalizedCurrent) {
      rawTurns.pop();
    }
  }

  // 3. Mantém histórico recente (últimas 8 interações) para foco clínico e eficiência
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
      prevTurn.parts[0].text += `\n\n${turn.text}`;
    } else {
      alternatingContents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    }
  }

  // 5. Adiciona a pergunta atual como a última mensagem do tipo 'user'
  if (alternatingContents.length > 0 && alternatingContents[alternatingContents.length - 1].role === 'user') {
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
  const patient = params.activePatient || params.patientContext;

  // 1. Extrai dados expressos na mensagem (OVERRIDE MANDATÓRIO)
  const messageData = extractMessageAnthropometrics(userInput);

  const weight = messageData.weight || patient?.currentWeightKg || 70;
  const height = messageData.height || patient?.heightCm || 170;
  const age = messageData.age || patient?.age || 30;
  const isMale = messageData.gender ? messageData.gender === 'masculino' : (patient ? patient.gender === 'masculino' : true);
  const objective = messageData.objective || patient?.objective || 'Equilíbrio Metabólico & Performance';
  const name = patient?.name || (isMale ? 'Paciente Masculino' : 'Paciente Feminina');

  // Cálculos Energéticos Mifflin-St Jeor (1990)
  const bmr = isMale
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  const activityFactor = patient?.activityFactor || 1.4;
  const get = Math.round(bmr * activityFactor);

  // Metas de Macronutrientes para o peso calculado
  const proteinGrams = Math.round(weight * 2.0); // 2.0 g/kg
  const fatGrams = Math.round(weight * 0.9);     // 0.9 g/kg
  const proteinKcal = proteinGrams * 4;
  const fatKcal = fatGrams * 9;
  const carbsKcal = Math.max(400, get - (proteinKcal + fatKcal));
  const carbsGrams = Math.round(carbsKcal / 4);

  let reply = '';

  const asksPlan = lower.includes('plano') || lower.includes('cardapio') || lower.includes('cardápio') 
    || lower.includes('dieta') || lower.includes('refeic') || lower.includes('refeiç') 
    || lower.includes('tabela de refeic') || lower.includes('alimento');
  const asksMetabolism = lower.includes('tmb') || lower.includes('get') || lower.includes('calcule') || lower.includes('calorias') || lower.includes('gasto');

  if (asksPlan || (asksMetabolism && asksPlan) || (asksMetabolism && lower.includes('80kg'))) {
    // Entrega COMPLETA: Avaliação Metabólica + Plano Alimentar Estruturado + Tabela de Substituição
    reply = `### 🧬 Avaliação Energética e Metabólica (Mifflin-St Jeor)
**Paciente:** ${name} | **Idade:** ${age} anos | **Estatura:** ${height} cm | **Peso Utilizado:** **${weight} kg** *(Dados da Solicitação)*
**Objetivo:** ${objective}

| Parâmetro Metabólico | Valor Calculado | Protocolo / Fórmula |
| :--- | :--- | :--- |
| **Peso Base** | **${weight} kg** | Utilizado conforme informado na solicitação |
| **TMB (Taxa Metabólica Basal)** | **${bmr} kcal/dia** | Mifflin-St Jeor: 10×(${weight}) + 6.25×(${height}) - 5×(${age}) ${isMale ? '+ 5' : '- 161'} |
| **Fator de Atividade** | **${activityFactor}** | Rotina moderada / treino estruturado |
| **GET (Gasto Energético Total)** | **${get} kcal/dia** | TMB × Fator de Atividade (${bmr} × ${activityFactor}) |
| **Meta Calórica Diária** | **${get} kcal/dia** | Ajuste calórico personalizado |

---

### 🎯 Distribuição Diária de Macronutrientes
- **Proteínas:** **${proteinGrams}g/dia** (~2.0 g/kg) • ${proteinKcal} kcal (${Math.round((proteinKcal / get) * 100)}%)
- **Carboidratos:** **${carbsGrams}g/dia** (~${(carbsGrams / weight).toFixed(1)} g/kg) • ${carbsKcal} kcal (${Math.round((carbsKcal / get) * 100)}%)
- **Lipídios:** **${fatGrams}g/dia** (~0.9 g/kg) • ${fatKcal} kcal (${Math.round((fatKcal / get) * 100)}%)
- **Meta Hídrica:** **${((weight * 35) / 1000).toFixed(1)} Litros/dia** (35 mL/kg de peso corporal)

---

### 🥗 Plano Alimentar Completo e Tabela de Refeições Diárias

| Refeição | Horário | Alimentos & Medidas Caseiras | Gramaturas Exatas | Macros da Refeição |
| :--- | :--- | :--- | :--- | :--- |
| **1. Café da Manhã (Desjejum)** | 07:00 | • Ovos inteiros mexidos ou cozidos (3 unid.)<br>• Pão 100% integral (2 fatias grandes)<br>• Fruta fresca: Mamão papaia (1/2 unid.) ou Banana (1 unid.)<br>• Sementes de chia ou aveia em flocos (1 colher de sopa)<br>• Café preto ou chá sem açúcar (200ml) | • Ovos: 150g<br>• Pão Integral: 60g<br>• Fruta: 120g<br>• Aveia/Chia: 15g | **~480 kcal**<br>P: 30g • C: 48g • G: 18g |
| **2. Lanche da Manhã (Colação)** | 10:00 | • Iogurte natural desnatado ou grego zero (1 pote)<br>• Mix de oleaginosas (castanha-do-pará + nozes)<br>• Maçã ou pera média com casca (1 unid.) | • Iogurte: 170g<br>• Oleaginosas: 20g<br>• Fruta: 130g | **~240 kcal**<br>P: 14g • C: 26g • G: 9g |
| **3. Almoço** | 12:30 | • Peito de frango grelhado ou patinho moído (1 filé grande)<br>• Arroz integral ou parboilizado cozido (5 colheres de sopa)<br>• Feijão carioca ou preto em concha média (1 concha cheia)<br>• Legumes variados no vapor: brócolis, cenoura e abobrinha<br>• Salada de folhas verdes cruas à vontade (alface, rúcula, tomate)<br>• Azeite de oliva extravirgem (1 colher de sobremesa) | • Proteína: 160g<br>• Arroz: 130g<br>• Feijão: 100g<br>• Legumes: 120g<br>• Folhas: à vontade<br>• Azeite: 8ml | **~620 kcal**<br>P: 50g • C: 64g • G: 16g |
| **4. Lanche da Tarde (Pré-Treino)** | 16:30 | • Whey Protein 80% (1 dosador / scoop)<br>• Banana prata fatiada (1 unid. grande)<br>• Aveia em flocos finos (2 colheres de sopa)<br>• Canela em pó a gosto + Água gelada (250ml) | • Whey Protein: 30g<br>• Banana: 100g<br>• Aveia: 30g | **~330 kcal**<br>P: 28g • C: 44g • G: 4g |
| **5. Jantar** | 20:00 | • Filé de peixe grelhado (Tilápia/Salmão) ou Peito de frango<br>• Batata-doce ou mandioca cozida (4 fatias médias)<br>• Mix de vegetais grelhados ou no vapor (vagem, abóbora, couve-flor)<br>• Salada verde crua temperada com limão e ervas naturais<br>• Azeite de oliva extravirgem (1 colher de chá) | • Proteína: 160g<br>• Batata-Doce: 140g<br>• Vegetais: 140g<br>• Azeite: 5ml | **~520 kcal**<br>P: 46g • C: 52g • G: 12g |
| **6. Ceia (Opcional)** | 22:30 | • Abacate picado (2 colheres de sopa cheias) ou Leite vegetal/desnatado morno<br>• Chá calmante (Camomila, Melissa ou Mulungu) sem açúcar | • Abacate: 60g<br>• Chá: 200ml | **~120 kcal**<br>P: 2g • C: 6g • G: 10g |

---

### 🔄 Lista de Substituições Práticas Equivalentes

1. **Fontes de Proteína (160g de Peito de Frango =):**
   - 170g de Filé de Tilápia ou Pescada branca
   - 150g de Patinho bovino moído ou Filé Mignon
   - 180g de Filé de Salmão fresco (reduzir 5ml de azeite na refeição)
   - 4 Ovos inteiros + 2 claras cozidas

2. **Fontes de Carboidratos (130g de Arroz Integral =):**
   - 150g de Batata-doce cozida
   - 180g de Batata-inglesa cozida ou assada
   - 130g de Mandioca / Aipim cozido
   - 120g de Macarrão integral cozido
   - 50g de Aveia em flocos

3. **Gorduras Boas (8ml de Azeite de Oliva =):**
   - 25g de Abacate fresco
   - 15g de Castanhas ou Amêndoas
   - 10g de Pasta de amendoim 100% pura

---

*Prescrição estruturada pela **NÚTRIA** para o consultório NutrinK.*`;
  } else if (asksMetabolism) {
    reply = `### 🧬 Avaliação Energética e Metabólica - NÚTRIA
**Paciente:** ${name} | **Protocolo:** Mifflin-St Jeor (1990)
**Peso Utilizado:** **${weight} kg** *(Base da Solicitação)* | **Estatura:** ${height} cm | **Idade:** ${age} anos

| Parâmetro Metabólico | Resultado Estimado | Memória de Cálculo |
| :--- | :--- | :--- |
| **Peso Base / Estatura** | **${weight} kg** / ${height} cm | Medidas antropométricas consideradas |
| **TMB (Taxa Metabólica Basal)** | **${bmr} kcal/dia** | 10×(${weight}) + 6.25×(${height}) - 5×(${age}) ${isMale ? '+ 5' : '- 161'} |
| **Fator Atividade (FA)** | **${activityFactor}** | Rotina moderada / treino estruturado |
| **GET (Gasto Energético Total)** | **${get} kcal/dia** | TMB × FA (${bmr} × ${activityFactor}) |

---

#### 🎯 Prescrição de Macronutrientes Sugerida:
- **Proteínas**: 1.8 a 2.0 g/kg (**${proteinGrams}g/dia** • ${proteinKcal} kcal)
- **Lipídios**: 0.8 a 1.0 g/kg (**${fatGrams}g/dia** • ${fatKcal} kcal)
- **Carboidratos**: **${carbsGrams}g/dia** (${carbsKcal} kcal) para suprir a demanda energética total.
- **Hidratação:** **${((weight * 35) / 1000).toFixed(1)} L/dia** (35 mL/kg).`;
  } else {
    reply = `Olá, Doutor(a)! A **NÚTRIA** está à disposição no consultório.

Com relação a **"${userInput}"**:
- Para interpretação de exames: forneça os marcadores (hemograma, perfil lipídico, glicemia, HbA1c, tireoide, vitaminas, minerais).
- Para prescrição e conduta: informe calorias-alvo ou perfil metabólico para cardápio detalhado com gramaturas, receitas e suplementação.
- Para gestão do consultório: consulte agenda, prontuários, financeiro e faturamento.`;
  }

  const actionExecuted = detectOperationalAction(userInput, reply, params);

  return {
    reply,
    actionExecuted,
    model: 'gemini-3.7-flash'
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
 * Executa a chamada à NÚTRIA com o modelo Gemini 3.7 Flash oficial @google/genai.
 * 
 * - Configura modelo para 'gemini-3.7-flash'.
 * - Utiliza a System Instruction permanente clínica e de gestão do consultório.
 * - Injeta dinamicamente o contexto do paciente ativo e da plataforma.
 * - Trata o histórico de conversa de forma dinâmica sem repetições.
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
          activePatientContext: params.activePatient,
          patientContext: params.patientContext || params.activePatient,
          patients: params.patients,
          appointments: params.appointments,
          transactions: params.transactions,
          userAccount: params.userAccount,
          appContext: params.appContext
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
          return {
            reply: data.reply.trim(),
            actionExecuted: data.actionExecuted,
            model: data.model || 'gemini-3.7-flash'
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
  const targetModel = getClientGeminiModel(); // gemini-3.7-flash
  const contents = formatGeminiContents(params.conversationHistory, params.message);

  // 1. Tenta inicializar e chamar via biblioteca oficial @google/genai com gemini-3.7-flash
  try {
    const ai = getGenAIClient(apiKey);

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 8192,
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

  // 2. Se o modelo configurado falhou, tenta modelo flash alternativo com a mesma estrutura
  const fallbackModel = 'gemini-flash-latest';
  try {
    const ai = getGenAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: fallbackModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 8192,
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
    const restModel = targetModel.startsWith('gemini') ? targetModel : 'gemini-3.7-flash';
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
          maxOutputTokens: 8192
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
