import { Patient, Gender, PatientObjective } from '../types';

/**
 * Clean markdown and technical syntax into smooth, natural spoken Portuguese text.
 */
export function cleanTextForSpeech(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // Remove institutional / navigation tags if any
  text = text.replace(/(?:📍\s*)?\[.*?Loaded\]/gi, '');
  text = text.replace(/\[CONTEXTO.*?\]/gi, '');

  // Remove code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');

  // Handle Markdown tables: summarize them naturally instead of reading pipes
  text = text.replace(/\|([^\n]+)\|\n\|[-:\s|]+\|\n([\s\S]*?)(?=\n\n|$)/g, (match, header, body) => {
    return ' Conforme os dados calculados na tabela clínica em tela. ';
  });
  text = text.replace(/\|/g, ' ');

  // Remove markdown headings (#, ##, ###)
  text = text.replace(/#{1,6}\s+/g, '');

  // Remove blockquotes and list bullets
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/^[-*+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // Remove bold and italic markers
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // Remove links [text](url)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Replace common medical / nutrition abbreviations for natural pronunciation
  text = text.replace(/\bTMB\b/g, 'Taxa Metabólica Basal');
  text = text.replace(/\bGET\b/g, 'Gasto Energético Total');
  text = text.replace(/\bVET\b/g, 'Valor Energético Total');
  text = text.replace(/\bIMC\b/g, 'Índice de Massa Corporal');
  text = text.replace(/\b%BF\b/gi, 'percentual de gordura corporal');
  text = text.replace(/\bg\/kg\b/gi, 'gramas por quilo');
  text = text.replace(/\bkcal\/dia\b/gi, 'calorias por dia');
  text = text.replace(/\bkcal\b/gi, 'calorias');
  text = text.replace(/\bkg\b/gi, 'quilos');
  text = text.replace(/\bcm\b/gi, 'centímetros');
  text = text.replace(/\bmg\b/gi, 'miligramas');
  text = text.replace(/\bmcg\b/gi, 'microgramas');
  text = text.replace(/\bUI\b/g, 'unidades internacionais');
  text = text.replace(/\bL\/dia\b/gi, 'litros por dia');
  text = text.replace(/\bHOMA-IR\b/gi, 'índice Homa');
  text = text.replace(/\bHbA1c\b/gi, 'Hemoglobina Glicada');

  // Clean excessive spaces and newlines
  text = text.replace(/\n+/g, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();

  // If text is overly long for voice, extract introductory and conclusive sentences
  if (text.length > 450) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    if (sentences.length > 3) {
      text = sentences.slice(0, 3).join(' ') + ' O relatório completo e estruturado está disponível em tela para sua consulta.';
    }
  }

  return text;
}

/**
 * Text-to-Speech playback using Brazilian Portuguese Web Speech Synthesis
 */
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    rate?: number;
    pitch?: number;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis não é suportado neste navegador.');
    callbacks?.onError?.('SpeechSynthesis não suportado');
    return null;
  }

  // Cancel any ongoing speech before starting a new one
  window.speechSynthesis.cancel();

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText.trim()) {
    callbacks?.onEnd?.();
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = 'pt-BR';
  utterance.rate = callbacks?.rate ?? 1.05; // Slightly agile for high performance feel
  utterance.pitch = callbacks?.pitch ?? 1.0;

  // Try selecting a natural Brazilian Portuguese voice
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(
    v => (v.lang === 'pt-BR' || v.lang === 'pt_BR') && (v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Natural') || v.name.includes('Brazil'))
  ) || voices.find(v => v.lang.startsWith('pt'));

  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Erro na síntese de voz NUTRIA:', e);
    currentUtterance = null;
    callbacks?.onError?.(e);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

/**
 * Autonomous Patient Extraction from Voice or Text input
 */
export interface ExtractedPatientResult {
  isRegistration: boolean;
  patient?: Patient;
  extractedFields: string[];
  missingFields: string[];
  speechConfirmation: string;
  textConfirmation: string;
}

export function extractPatientFromVoiceOrText(input: string): ExtractedPatientResult {
  const normalized = input.trim();
  const lower = normalized.toLowerCase();

  // Check if intent is patient registration
  const registrationKeywords = [
    'cadastre o paciente',
    'cadastrar paciente',
    'cadastre a paciente',
    'cadastrar a paciente',
    'cadastre um paciente',
    'cadastre uma paciente',
    'cadastre paciente',
    'novo paciente',
    'nova paciente',
    'adicionar paciente',
    'adicione o paciente',
    'adicione a paciente',
    'registrar paciente',
    'registro de paciente',
    'crie a ficha do paciente',
    'crie o prontuário do paciente',
    'prontuário do paciente',
    'cadastre'
  ];

  const isRegistration = registrationKeywords.some(kw => lower.includes(kw)) &&
    (lower.includes('anos') || lower.includes('kg') || lower.includes('objetivo') || lower.includes('paciente') || lower.includes('altura') || lower.includes('peso'));

  if (!isRegistration) {
    return {
      isRegistration: false,
      extractedFields: [],
      missingFields: [],
      speechConfirmation: '',
      textConfirmation: ''
    };
  }

  const extractedFields: string[] = [];
  const missingFields: string[] = [];

  // 1. Name extraction
  let name = '';
  const nameMatch = normalized.match(/(?:cadastre|cadastrar|adicionar|adicione|novo|nova|paciente|prontuário)\s+(?:o|a|um|uma)?\s*(?:paciente)?\s*([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][a-záéíóúâêîôûãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][a-záéíóúâêîôûãõç]+)*)/i);
  
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].trim();
    // Clean common accidental words from name
    name = name.replace(/^(o|a|um|uma|paciente|novo|nova|doutor|dr|dra)\s+/i, '');
    if (name.length > 2) {
      extractedFields.push('Nome');
    }
  }

  if (!name || name.length < 2) {
    // Fallback: try finding capitalized words
    const capMatches = normalized.match(/([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][a-záéíóúâêîôûãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][a-záéíóúâêîôûãõç]+)+)/);
    if (capMatches && capMatches[1]) {
      name = capMatches[1].trim();
      extractedFields.push('Nome');
    } else {
      name = 'Paciente ' + new Date().toLocaleDateString('pt-BR');
      missingFields.push('Nome completo');
    }
  }

  // 2. Age extraction
  let age = 30;
  const ageMatch = lower.match(/(\d{1,3})\s*(?:anos|ano|a\.?|de idade)/i) || lower.match(/idade\s*(?:de|:)?\s*(\d{1,3})/i);
  if (ageMatch && ageMatch[1]) {
    age = parseInt(ageMatch[1], 10);
    extractedFields.push(`Idade (${age} anos)`);
  } else {
    missingFields.push('Idade');
  }

  // 3. Gender extraction
  let gender: Gender = 'masculino';
  if (lower.includes('feminino') || lower.includes('mulher') || lower.includes(' a paciente') || lower.includes('uma paciente') || lower.includes('gestante') || lower.includes('lactante')) {
    gender = 'feminino';
    extractedFields.push('Gênero Feminino');
  } else if (lower.includes('masculino') || lower.includes('homem') || lower.includes(' o paciente') || lower.includes('um paciente')) {
    gender = 'masculino';
    extractedFields.push('Gênero Masculino');
  } else {
    // Infer from female names ending in 'a'
    const firstName = name.split(' ')[0].toLowerCase();
    if (firstName.endsWith('a') && !['lucas', 'nicolas', 'mateus', 'elias', 'jonas', 'alexandre'].includes(firstName)) {
      gender = 'feminino';
    }
  }

  // 4. Weight extraction (kg)
  let weightKg = 70;
  const weightMatch = lower.match(/(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:kg|quilos|kilos)/i) || 
                      lower.match(/peso\s*(?:de|atual|:)?\s*(\d{2,3}(?:[.,]\d{1,2})?)/i) ||
                      lower.match(/pesando\s*(\d{2,3}(?:[.,]\d{1,2})?)/i);
  if (weightMatch && weightMatch[1]) {
    weightKg = parseFloat(weightMatch[1].replace(',', '.'));
    extractedFields.push(`Peso (${weightKg} kg)`);
  } else {
    missingFields.push('Peso corporal');
  }

  // 5. Height extraction (cm)
  let heightCm = gender === 'feminino' ? 165 : 175;
  const heightMatch = lower.match(/(1[.,]\d{2})\s*(?:m|metros|metro)?/i) ||
                      lower.match(/(1\s*metro\s*e\s*\d{2})/i) ||
                      lower.match(/(\d{3})\s*(?:cm|centimetros|centímetros)/i) ||
                      lower.match(/altura\s*(?:de|:)?\s*(1[.,]\d{2}|\d{3})/i);
  if (heightMatch && heightMatch[1]) {
    let rawH = heightMatch[1].replace(',', '.').replace(/\s*metro\s*e\s*/, '.');
    if (parseFloat(rawH) < 3) {
      heightCm = Math.round(parseFloat(rawH) * 100);
    } else {
      heightCm = Math.round(parseFloat(rawH));
    }
    extractedFields.push(`Altura (${heightCm} cm)`);
  } else {
    missingFields.push('Altura');
  }

  // 6. Clinical Objective extraction
  let objective: PatientObjective = 'emagrecimento';
  if (lower.includes('hipertrofia') || lower.includes('massa muscular') || lower.includes('ganhar massa') || lower.includes('ganho muscular')) {
    objective = 'hipertrofia';
    extractedFields.push('Objetivo: Hipertrofia');
  } else if (lower.includes('diabetes') || lower.includes('glicemia') || lower.includes('insulina') || lower.includes('diabético') || lower.includes('diabetico')) {
    objective = 'manejo_diabetes';
    extractedFields.push('Objetivo: Manejo do Diabetes');
  } else if (lower.includes('performance') || lower.includes('atleta') || lower.includes('corrida') || lower.includes('maratona') || lower.includes('crossfit')) {
    objective = 'performance_esportiva';
    extractedFields.push('Objetivo: Performance Esportiva');
  } else if (lower.includes('longevidade') || lower.includes('saúde') || lower.includes('saude') || lower.includes('qualidade de vida')) {
    objective = 'saude_longevidade';
    extractedFields.push('Objetivo: Saúde & Longevidade');
  } else if (lower.includes('intestinal') || lower.includes('constipação') || lower.includes('microbioma') || lower.includes('fodmap')) {
    objective = 'saude_intestinal';
    extractedFields.push('Objetivo: Saúde Intestinal');
  } else if (lower.includes('vegetariano') || lower.includes('vegano') || lower.includes('plant based')) {
    objective = 'vegetariano_vegano';
    extractedFields.push('Objetivo: Vegetariano/Vegano');
  } else if (lower.includes('emagrecimento') || lower.includes('perder peso') || lower.includes('secar') || lower.includes('emagrecer') || lower.includes('gordura')) {
    objective = 'emagrecimento';
    extractedFields.push('Objetivo: Emagrecimento');
  }

  // 7. Pathologies, Allergies & Notes
  const pathologies: string[] = [];
  if (lower.includes('hipertenso') || lower.includes('hipertensão') || lower.includes('pressão alta')) pathologies.push('Hipertensão Arterial');
  if (lower.includes('diabético') || lower.includes('diabetico') || lower.includes('diabetes')) pathologies.push('Diabetes Mellitus');
  if (lower.includes('colesterol') || lower.includes('dislipidemia')) pathologies.push('Dislipidemia');
  if (lower.includes('lactose') || lower.includes('intolerante')) pathologies.push('Intolerância a Lactose');
  if (lower.includes('glúten') || lower.includes('gluten') || lower.includes('celíaco') || lower.includes('celiaco')) pathologies.push('Sensibilidade/Doença Celíaca');
  if (lower.includes('esteatose') || lower.includes('gordura no fígado')) pathologies.push('Esteatose Hepática');
  if (lower.includes('gastrite') || lower.includes('refluxo')) pathologies.push('Gastrite / DRGE');

  if (pathologies.length > 0) {
    extractedFields.push(`Comorbidades: ${pathologies.join(', ')}`);
  }

  // Calculate Clinical Metrics
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  // Mifflin-St Jeor Formula for BMR (TMB)
  let tmb = 0;
  if (gender === 'masculino') {
    tmb = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
  } else {
    tmb = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
  }

  const activityFactor = 1.375;
  const getVal = Math.round(tmb * activityFactor);

  // Deurenberg Body Fat estimate (%)
  let bf = Math.round((1.20 * bmi) + (0.23 * age) - (10.8 * (gender === 'masculino' ? 1 : 0)) - 5.4);
  if (bf < 8) bf = 10;
  if (bf > 50) bf = 45;

  let targetWeightKg = weightKg;
  if (objective === 'emagrecimento') {
    targetWeightKg = parseFloat((weightKg * 0.90).toFixed(1)); // ~10% loss goal
  } else if (objective === 'hipertrofia') {
    targetWeightKg = parseFloat((weightKg * 1.05).toFixed(1)); // ~5% lean gain
  }

  const notes = [
    pathologies.length > 0 ? `Condições clínicas: ${pathologies.join(', ')}.` : '',
    `Cadastro autônomo realizado via comando de voz NUTRIA.`
  ].filter(Boolean).join(' ');

  const patient: Patient = {
    id: `pat-${Date.now()}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@email.com`,
    phone: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
    age,
    gender,
    objective,
    initialWeightKg: weightKg,
    currentWeightKg: weightKg,
    targetWeightKg,
    heightCm,
    bmi,
    bodyFatPercentage: bf,
    activityFactor,
    tmb,
    get: getVal,
    status: 'ativo',
    createdAt: new Date().toISOString().split('T')[0],
    tags: [objective.replace('_', ' '), ...pathologies],
    notes,
    evolutionHistory: [
      {
        id: `evo-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        weightKg,
        heightCm,
        bmi,
        bodyFatPercentage: bf,
        notes: 'Avaliação inicial cadastrada via Copiloto NUTRIA.'
      }
    ],
    labExams: [],
    anamnese: {
      clinicalHistory: pathologies.join(', ') || 'Sem comorbidades prévias relatadas.',
      physicalActivity: 'Nível moderado (NAF 1.375)',
      waterIntakeLiters: parseFloat(((weightKg * 35) / 1000).toFixed(1))
    }
  };

  // Build spoken confirmation
  let speechConfirmation = `Paciente ${name} cadastrado com sucesso no prontuário eletrônico. `;
  if (extractedFields.length > 0) {
    speechConfirmation += `Registrei idade de ${age} anos, peso de ${weightKg} quilos e objetivo para ${objective.replace('_', ' ')}. `;
  }
  if (missingFields.length > 0) {
    speechConfirmation += `Deseja que eu registre os dados de ${missingFields.join(' e ')} agora?`;
  } else {
    speechConfirmation += `A Taxa Metabólica Basal foi calculada em ${tmb} calorias. Deseja que eu estruture o plano alimentar?`;
  }

  // Build markdown text confirmation
  const textConfirmation = `# ✅ PACIENTE CADASTRADO COM SUCESSO!
**Prontuário Eletrônico:** ${name} | **Idade:** ${age} anos | **Gênero:** ${gender === 'feminino' ? 'Feminino' : 'Masculino'}  
**Data do Cadastro:** ${new Date().toLocaleDateString('pt-BR')} | **Copiloto Clínico:** NUTRIA AI  

---

### 📊 Parâmetros Clínicos & Antropometria Inicial

| Indicador Clínico | Valor Calculado | Classificação / Protocolo |
| :--- | :--- | :--- |
| **Nome Completo** | **${name}** | Identificação no Prontuário |
| **Peso Atual** | **${weightKg} kg** | ${missingFields.includes('Peso corporal') ? '⚠️ Padrão estimado (pendente)' : 'Informado'} |
| **Altura** | **${heightCm} cm** | ${missingFields.includes('Altura') ? '⚠️ Padrão estimado (pendente)' : 'Informado'} |
| **IMC** | **${bmi} kg/m²** | ${bmi < 25 ? 'Eutrofia / Normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidade'} |
| **% Gordura Estimado** | **${bf}%** | Protocolo Deurenberg |
| **Taxa Metabólica Basal (TMB)** | **${tmb} kcal/dia** | Equação Mifflin-St Jeor |
| **Gasto Energético Total (GET)** | **${getVal} kcal/dia** | NAF 1.375 (Atividade Moderada) |
| **Objetivo Clínico** | **${objective.replace('_', ' ').toUpperCase()}** | Conduta Personalizada |
${pathologies.length > 0 ? `| **Comorbidades / Alertas** | **${pathologies.join(', ')}** | Protocolo Clínico Específico |` : ''}

---

${missingFields.length > 0 ? `
> ⚠️ **Dados Pendentes Sugeridos:** ${missingFields.join(', ')}.  
> *Deseja ditar ou complementar esses dados agora para refinarmos o plano alimentar?*
` : `
> 💡 **Próximo Passo:** O prontuário está 100% ativo na aba **"Pacientes & Prontuários"**. Deseja que a NUTRIA elabore o plano alimentar de **${getVal} kcal** ou agende a primeira consulta?
`}`;

  return {
    isRegistration: true,
    patient,
    extractedFields,
    missingFields,
    speechConfirmation,
    textConfirmation
  };
}
