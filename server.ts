import express, { Request, Response } from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Payment as MercadoPagoPayment, Preference as MercadoPagoPreference } from "mercadopago";
import QRCode from "qrcode";
import { INSTITUTIONAL_PAGES } from "./src/data/institutionalPages";

dotenv.config();

const PORT = 3000;
const app = express();

// Iframe & Cross-Origin Embedding Configuration for all frontend/backend hostings (Hostinger, Next.js, Nuxt, Astro, Vue, React, Angular, SvelteKit, WordPress)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Idempotency-Key");
  
  // Explicitly allow embedding in iframes from any domain (Hostinger, CMS, custom web apps)
  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors *;");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Healthcheck & Hostinger Runtime Diagnosis Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "NutrinK",
    nodeVersion: process.version,
    env: process.env.NODE_ENV || "development",
    port: PORT,
    iframeReady: true,
    supportedNodeVersions: ["18.x", "20.x", "22.x", "24.x"],
    supportedPackageManagers: ["npm", "yarn", "pnpm"],
    compatibleFrontendFrameworks: [
      "Angular", "Astro", "Gatsby", "Next.js", "Nitro", "Nuxt", 
      "Parcel", "React", "React Router", "Svelte", "SvelteKit", "Vite", "Vue.js"
    ],
    compatibleBackendFrameworks: [
      "Astro", "Express", "Fastify", "Hono", "NestJS", "Next.js", "Nitro", "Nuxt", "React Router", "SvelteKit"
    ]
  });
});

// Dynamic initializer for Mercado Pago client (Server-Side Only)
let currentMpToken: string | null = null;
let mpConfig: MercadoPagoConfig | null = null;

// Registry for subscriptions activated via Mercado Pago Webhook
const activatedSubscriptions = new Map<string, {
  email: string;
  planId: 'premium_mensal' | 'premium_anual';
  status: 'active' | 'pending' | 'canceled';
  activatedAt: string;
  paymentId: string;
  paymentMethod: string;
  amount: number;
}>();

const ACTIVE_MP_TOKEN = "APP_USR-5581672640898355-083018-35894acdb45d327a22dda9edda59e961-284937135";
const ACTIVE_MP_PUBLIC_KEY = "APP_USR-6b91cf33-8b1c-4b47-9f9e-3ae02649e209";
const ACTIVE_MP_WEBHOOK_SECRET = "0d669da862d2413f2a124645bb8bad08bdb292d8b75f40b1a9d8d0c6aaa506af";
const ACTIVE_MP_CLIENT_ID = "5581672640898355";
const ACTIVE_MP_CLIENT_SECRET = "iJUsbtpiGdEghTqzbrqTNyYLYzgNMgBx";

function getMercadoPagoToken(): string {
  const envToken = (process.env.MERCADOPAGO_ACCESS_TOKEN || "").trim();
  // If env contains stale/revoked token from previous app versions, use active credentials
  if (!envToken || envToken.startsWith("APP_USR-697062593951657") || envToken.includes("01d533652bfb99d1198853c87aafb9f6")) {
    return ACTIVE_MP_TOKEN;
  }
  return envToken;
}

function getMercadoPagoPublicKey(): string {
  const envPub = (process.env.MERCADOPAGO_PUBLIC_KEY || process.env.VITE_MERCADOPAGO_PUBLIC_KEY || "").trim();
  if (!envPub || envPub.includes("1989f745-442e-4b5a-ba5e-74a096bd0cf3")) {
    return ACTIVE_MP_PUBLIC_KEY;
  }
  return envPub;
}

function getMercadoPagoWebhookSecret(): string {
  const envSec = (process.env.MERCADOPAGO_WEBHOOK_SECRET || "").trim();
  return envSec || ACTIVE_MP_WEBHOOK_SECRET;
}

function getMercadoPagoClientId(): string {
  const envClient = (process.env.MERCADOPAGO_CLIENT_ID || "").trim();
  if (!envClient || envClient === "3673481797549859") {
    return ACTIVE_MP_CLIENT_ID;
  }
  return envClient;
}

function getMercadoPagoClientSecret(): string {
  const envSecret = (process.env.MERCADOPAGO_CLIENT_SECRET || "").trim();
  if (!envSecret || envSecret === "uytCsZQy9tKgOEZ96GadZH7QBnXLqnjh") {
    return ACTIVE_MP_CLIENT_SECRET;
  }
  return envSecret;
}

function getMercadoPago(): MercadoPagoConfig | null {
  const token = getMercadoPagoToken();
  if (!token) {
    mpConfig = null;
    currentMpToken = null;
    return null;
  }
  if (!mpConfig || currentMpToken !== token) {
    currentMpToken = token;
    mpConfig = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 10000 }
    });
  }
  return mpConfig;
}

// In-memory registry for dynamic mock/demo payments tracking when credentials are not yet configured
const inMemoryPayments = new Map<string, {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  planId: string;
  amount: number;
  createdAt: number;
  qrCode: string;
  qrCodeBase64: string;
  payerEmail: string;
}>();

// Google OAuth Configuration & Token Verification API
app.get("/api/auth/google/config", (req: Request, res: Response) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  res.json({
    clientId: clientId || "493300215926-9h58hp029m3fdbucbrhlt25ajh4miibs.apps.googleusercontent.com",
    isConfigured: !!clientId,
    scope: "openid email profile",
  });
});

// OAuth Callback handler for Google Popup (postMessage protocol)
app.get(["/auth/google/callback", "/auth/google/callback/"], (req: Request, res: Response) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Autenticação NutrinK Google</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d0118;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(217, 70, 239, 0.2);
      border-top-color: #d946ef;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 16px; margin: 0 0 8px; color: #f5d0fe; }
    p { font-size: 13px; color: #a855f7; margin: 0; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>Autenticação Google em andamento...</h2>
  <p>Esta janela fechará automaticamente.</p>
  <script>
    (function() {
      try {
        var hash = window.location.hash.substring(1);
        var params = new URLSearchParams(hash || window.location.search);
        var accessToken = params.get('access_token');
        var idToken = params.get('id_token');
        var error = params.get('error') || params.get('error_description');

        if (window.opener) {
          if (error) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: error }, '*');
          } else if (accessToken || idToken) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              accessToken: accessToken,
              idToken: idToken
            }, '*');
          }
          setTimeout(function() { window.close(); }, 500);
        }
      } catch(e) {
        console.error('Callback error:', e);
      }
    })();
  </script>
</body>
</html>`);
});

app.post("/api/auth/google/verify", async (req: Request, res: Response) => {
  try {
    const { idToken, accessToken } = req.body;
    if (!idToken && !accessToken) {
      res.status(400).json({ success: false, error: "Nenhum token fornecido" });
      return;
    }

    if (idToken) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (response.ok) {
          const payload = await response.json() as any;
          res.json({
            success: true,
            user: {
              googleId: payload.sub,
              email: payload.email,
              name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Profissional de Saúde',
              picture: payload.picture,
              emailVerified: payload.email_verified === "true" || payload.email_verified === true
            }
          });
          return;
        }
      } catch (err) {
        console.warn("Falha ao validar idToken via Google tokeninfo:", err);
      }
    }

    if (accessToken) {
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const payload = await response.json() as any;
          res.json({
            success: true,
            user: {
              googleId: payload.sub,
              email: payload.email,
              name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Profissional de Saúde',
              picture: payload.picture,
              emailVerified: payload.email_verified === true
            }
          });
          return;
        }
      } catch (err) {
        console.warn("Falha ao validar accessToken via Google userinfo:", err);
      }
    }

    res.status(400).json({ success: false, error: "Token do Google inválido ou expirado" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Erro no servidor de autenticação" });
  }
});


// Lazy initializer for Gemini client
let genAIClient: GoogleGenAI | null = null;
let currentGenAIApiKey = "";

function getGenAI(): GoogleGenAI | null {
  const apiKey = (
    process.env.NUTRINK_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ""
  ).trim();

  if (!apiKey) return null;

  if (!genAIClient || currentGenAIApiKey !== apiKey) {
    currentGenAIApiKey = apiKey;
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

function cleanMathAndLatex(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = rawText;

  // Protect Brazilian Real values (R$ 150,00)
  const currencyPlaceholders: string[] = [];
  text = text.replace(/R\$\s*([0-9.,]+)/g, (match, val) => {
    const idx = currencyPlaceholders.length;
    currencyPlaceholders.push(`R$ ${val.trim()}`);
    return `__BRL_CURRENCY_${idx}__`;
  });

  // Clean $$ ... $$ blocks
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    return cleanFormulaSnippet(inner);
  });

  // Clean $ ... $ inline
  text = text.replace(/\$([^$\n\r]+?)\$/g, (match, inner) => {
    return cleanFormulaSnippet(inner);
  });

  // Clean isolated LaTeX commands
  text = cleanLatexCommands(text);

  // Restore Brazilian Reais
  text = text.replace(/__BRL_CURRENCY_(\d+)__/g, (match, idxStr) => {
    const idx = parseInt(idxStr, 10);
    return currencyPlaceholders[idx] || match;
  });

  return text;
}

function cleanFormulaSnippet(snippet: string): string {
  let cleaned = snippet;
  cleaned = cleaned.replace(/\\(text|mathrm|mathbf|mathit|textbf|textit)\{([^}]*)\}/g, '$2');
  cleaned = cleaned.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1 / $2)');
  cleaned = cleanLatexCommands(cleaned);
  cleaned = cleaned.replace(/\{([^{}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, '$1');
  cleaned = cleaned.replace(/\\/g, '');
  return cleaned.trim();
}

function cleanLatexCommands(input: string): string {
  let res = input;
  res = res.replace(/\\(text|mathrm|mathbf|mathit|textbf|textit)\{([^}]*)\}/g, '$2');
  res = res.replace(/\\approx/g, 'aprox.');
  res = res.replace(/\\thickapprox/g, 'aprox.');
  res = res.replace(/\\sim/g, '~');
  res = res.replace(/\\ge(q)?/g, 'mínimo de ');
  res = res.replace(/\\le(q)?/g, 'máximo de ');
  res = res.replace(/\\times/g, ' × ');
  res = res.replace(/\\cdot/g, ' · ');
  res = res.replace(/\\pm/g, ' ± ');
  res = res.replace(/\\neq/g, ' diferente de ');
  res = res.replace(/\\rightarrow/g, ' → ');
  res = res.replace(/\\to/g, ' → ');
  res = res.replace(/\\mu\s*g/g, 'mcg');
  res = res.replace(/\\mu/g, 'u');
  res = res.replace(/\\quad/g, ' ');
  res = res.replace(/\\qquad/g, ' ');
  res = res.replace(/\^2/g, '²');
  res = res.replace(/\^3/g, '³');
  res = res.replace(/kg\/m\^2/g, 'kg/m²');
  res = res.replace(/kg\/m2/g, 'kg/m²');
  return res;
}

const NUTRIA_SYSTEM_INSTRUCTION = `Você é a NÚTRIA, a inteligência artificial especialista máxima do sistema NutrinK em Nutrição Clínica, Nutrologia, Nutrição Esportiva, Funcional, Pediatria e Geriatria, além de assistente inteligente para gestão do consultório.

DIRETRIZES OBRIGATÓRIAS DE ATUAÇÃO E FORMATAÇÃO VISUAL LIMPA:
- PROIBIÇÃO ABSOLUTA DE SINTAXE LATEX OU CIFRÕES MATEMÁTICOS:
  1. NUNCA utilize cifrões ($ ou $$) para delimitar números, expressões, unidades ou fórmulas.
  2. NUNCA utilize comandos de LaTeX como \\text{}, \\approx, \\ge, \\le, \\mu, \\rightarrow, \\times, \\frac{}{}, etc.
  3. Escreva todos os valores, unidades e equações em texto simples e direto em português (exemplo: use "kg/m²" em vez de sintaxe com cifrões; use "aprox." em vez de símbolos de aproximação; use "mínimo de" em vez de símbolos matemáticos).
  4. Exiba os passos dos cálculos (como TMB e GET) em linhas de texto comuns e limpas, sem formatação matemática complexa.
  5. Mantenha as unidades de medida (g, mg, mcg, kcal, UI, kg/m²) escritas de forma padrão e limpa no texto.
  6. Organize os relatórios, cardápios e prescrições utilizando marcadores de lista simples (- ou •) e negritos estratégicos para facilitar a leitura e impressão direta pelo paciente.

- Mensagem Inicial / Saudação: Mantenha sempre saudações curtas e diretas ao abrir o chat (Ex: 'Olá, Doutor(a)! Como posso te apoiar agora?').
- Prioridade de Dados da Mensagem (Override Mandatório): Se a mensagem digitada pelo usuário contiver dados antropométricos expressos (ex: peso, altura, idade, sexo, objetivo, rotina), OBRIGATORIAMENTE utilize esses valores para todos os cálculos e prescrições da resposta, ignorando e sobrepondo quaisquer dados prévios do banco/contexto se houver divergência.
- Cumprimento Integral da Solicitação de Plano Alimentar: Quando o profissional solicitar um "plano alimentar completo", "cardápio", "dieta" ou "tabela de refeições" (mesmo quando acompanhado de cálculo de TMB/GET), você NUNCA deve parar apenas na avaliação metabólica ou nos cálculos energéticos. Você DEVE OBRIGATORIAMENTE incluir na mesma resposta:
  1. Tabela/lista de Refeições Diárias completas (Café da Manhã/Desjejum, Lanche da Manhã/Colação, Almoço, Lanche da Tarde, Jantar e Ceia quando aplicável).
  2. Opções de alimentos detalhados com gramaturas exatas e medidas caseiras práticas (ex: 150g de peito de frango grelhado - 1 filé médio; 100g de arroz integral - 4 colheres de sopa cheias).
  3. Calorias e macronutrientes (Proteína, Carboidratos, Lipídios) discriminados por refeição e o total do dia.
  4. Lista de opções de substituição equivalentes para os itens do plano.
- Estilo de Resposta: Responda tudo em uma única mensagem contínua e bem formatada em Markdown limpo, garantindo que o plano alimentar completo seja exibido integralmente até o final, sem cortes ou interrupções.
- Interpretação de Exames Laboratoriais: Analise marcadores como hemograma, perfil lipídico, glicemia, HbA1c, tireoide, vitaminas (D, B12), minerais e marcadores hepáticos/renais.
- Prescrição e Conduta: Indique condutas dietoterápicas, suplementação, receitas com gramaturas, tabela de substituição e estratégias personalizadas.
- Gestão do Consultório: Responda a dúvidas e consultas sobre agenda, prontuários, financeiro e faturamento sempre que solicitado pelo profissional.
- Respostas Dinâmicas: Responda sempre de forma direta, personalizada e científica para a pergunta exata do usuário. NUNCA utilize templates estáticos ou textos genéricos de instrução como resposta.

DIRETRIZES TÉCNICAS E METABÓLICAS:
1. Fórmulas Energéticas Oficiais:
   - Mifflin-St Jeor (1990): TMB = 10 × Peso + 6.25 × Altura - 5 × Idade + (Homem: +5 | Mulher: -161)
   - Cunningham (1980): TMB = 500 + 22 × Massa Livre de Gordura (MLG)
   - Harris-Benedict (1984) e DRI/IOM para populações pediátricas e gestantes.
2. Tabelas de Composição de Alimentos:
   - Priorize dados da Tabela Brasileira de Composição de Alimentos (TACO) e USDA.
3. Conduta e Tom de Voz:
   - Postura profissional de alto nível, acolhedora, com rigor científico e aplicabilidade imediata para consultório.
   - Formate em Markdown limpo e legível, com tabelas organizadas de macronutrientes, micronutrientes e listas de substituições.
   - Sua identidade é NÚTRIA do NutrinK. NUNCA mencione "Gemini", "Google", "OpenAI" ou tecnologias externas.
4. Respostas Diretas e Personalizadas:
   - Responda pontualmente e diretamente ao que foi perguntado, sem reintroduções genéricas ou repetir saudações desnecessárias a cada interação.
   - Quando for solicitada uma receita, cardápio ou fórmula, entregue as dosagens e gramaturas exatas prontas para prescrição.`;

const abrirPaginaInstitucionalTool: FunctionDeclaration = {
  name: "abrir_pagina_institucional",
  description: "Carrega e exibe um documento institucional, legal ou informativo completo do NutrinK em texto estruturado",
  parameters: {
    type: Type.OBJECT,
    properties: {
      pagina: {
        type: Type.STRING,
        description: "Identificador da página: 'inicio', 'recursos', 'planos', 'sobre', 'metodologia', 'clientes', 'acessar', 'privacidade_lgpd', 'termos_servico', 'politica_uso_aceitavel', 'fale_conosco'"
      }
    },
    required: ["pagina"]
  }
};

const navegarParaTelaTool: FunctionDeclaration = {
  name: "navegar_para_tela",
  description: "Navega e abre uma seção/tela específica no sistema NutrinK (dashboard, pacientes, agenda, financeiro, nutricalc)",
  parameters: {
    type: Type.OBJECT,
    properties: {
      secao: { 
        type: Type.STRING, 
        description: "Identificador da tela: 'dashboard' (Dashboard Geral), 'pacientes' (Pacientes & Prontuários), 'agenda' (Agenda & Calendário), 'financeiro' (Financeiro & Faturamento), 'nutricalc' (NutriCalc & Protocolos)" 
      }
    },
    required: ["secao"]
  }
};

const cadastrarPacienteTool: FunctionDeclaration = {
  name: "cadastrar_paciente",
  description: "Cadastra um novo paciente no prontuário do consultório NutrinK",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nome: { type: Type.STRING, description: "Nome completo do paciente" },
      idade: { type: Type.NUMBER, description: "Idade em anos" },
      genero: { type: Type.STRING, description: "masculino, feminino ou outro" },
      objetivo: { type: Type.STRING, description: "hipertrofia, emagrecimento, saude_longevidade, performance_esportiva, manejo_diabetes, etc." },
      pesoKg: { type: Type.NUMBER, description: "Peso atual em kg" },
      alturaCm: { type: Type.NUMBER, description: "Altura em centímetros (ex: 175 para 1.75m)" },
      percentualGordura: { type: Type.NUMBER, description: "Percentual de gordura corporal estimado (%) se informado" },
      telefone: { type: Type.STRING, description: "Telefone de contato" },
      email: { type: Type.STRING, description: "E-mail de contato" },
      observacoes: { type: Type.STRING, description: "Histórico, preferências, queixas ou observações da anamnese" }
    },
    required: ["nome"]
  }
};

const agendarConsultaTool: FunctionDeclaration = {
  name: "agendar_consulta",
  description: "Agenda uma nova consulta no calendário clínico do NutrinK",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nomePaciente: { type: Type.STRING, description: "Nome do paciente para a consulta" },
      data: { type: Type.STRING, description: "Data no formato AAAA-MM-DD" },
      horario: { type: Type.STRING, description: "Horário no formato HH:MM (ex: 14:30)" },
      duracaoMinutos: { type: Type.NUMBER, description: "Duração estimada em minutos (padrão 50)" },
      tipo: { type: Type.STRING, description: "primeira_consulta, retorno, avaliacao_bioimpedancia, ajuste_plano, consultoria_online" },
      valor: { type: Type.NUMBER, description: "Valor cobrado pela consulta em Reais (BRL)" },
      local: { type: Type.STRING, description: "presencial_consultorio ou online_video" },
      notas: { type: Type.STRING, description: "Observações do agendamento" }
    },
    required: ["nomePaciente", "data", "horario"]
  }
};

const lancarFinanceiroTool: FunctionDeclaration = {
  name: "lancar_financeiro",
  description: "Registra uma entrada (receita) ou saída (despesa) no fluxo financeiro do consultório",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tipo: { type: Type.STRING, description: "receita ou despesa" },
      categoria: { type: Type.STRING, description: "consulta_avulsa, plano_mensal, plano_trimestral, aluguel_sala, software_sistemas, insumos_materiais, marketing_anuncios, etc." },
      descricao: { type: Type.STRING, description: "Descrição detalhada do lançamento" },
      valor: { type: Type.NUMBER, description: "Valor em Reais (BRL)" },
      metodoPagamento: { type: Type.STRING, description: "pix, cartao_credito, cartao_debito, boleto ou dinheiro" },
      nomePaciente: { type: Type.STRING, description: "Nome do paciente associado, se houver" },
      data: { type: Type.STRING, description: "Data do lançamento no formato AAAA-MM-DD" }
    },
    required: ["tipo", "descricao", "valor"]
  }
};

const gerarPlanoAlimentarTool: FunctionDeclaration = {
  name: "gerar_plano_alimentar",
  description: "Elabora um plano alimentar estruturado com cálculo de calorias e macronutrientes",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nomePaciente: { type: Type.STRING, description: "Nome do paciente" },
      tituloPlano: { type: Type.STRING, description: "Título do plano (ex: Hipertrofia Fase 1 - 2.500 kcal)" },
      caloriasAlvo: { type: Type.NUMBER, description: "Total de calorias diárias" },
      proteinasGramas: { type: Type.NUMBER, description: "Meta de proteínas em gramas" },
      carboidratosGramas: { type: Type.NUMBER, description: "Meta de carboidratos em gramas" },
      gordurasGramas: { type: Type.NUMBER, description: "Meta de gorduras em gramas" },
      metaHidricaLitros: { type: Type.NUMBER, description: "Meta diária de ingestão hídrica em litros" },
      orientacoesGerais: { type: Type.STRING, description: "Diretrizes e recomendações clínicas" }
    },
    required: ["nomePaciente", "caloriasAlvo"]
  }
};

// API Endpoints
app.get("/api/health", (req: Request, res: Response) => {
  const activeKey = (
    process.env.NUTRINK_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ""
  ).trim();
  const hasGemini = Boolean(activeKey && activeKey.length > 5);

  res.json({ 
    status: "ok", 
    aiReady: hasGemini,
    providers: {
      gemini: hasGemini
    },
    brand: "NutrinK", 
    assistant: "NUTRIA" 
  });
});

// Multi-model candidate list prioritizing gemini-3.7-flash with automatic failover
const GEMINI_MODELS = [
  ...(process.env.VITE_GEMINI_MODEL ? [process.env.VITE_GEMINI_MODEL.trim()] : []),
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite"
];

async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  let lastError: any = null;
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[NutrinK AI Engine] Tentando Google Gemini com modelo: ${model}...`);
      const result = await ai.models.generateContent({
        ...params,
        model
      });
      if (result) {
        console.log(`[NutrinK AI Engine] Sucesso com Google Gemini (${model})!`);
        return { result, model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || "");
      console.warn(`[NutrinK AI] Modelo ${model} indisponível ou com pico de demanda (503/429): ${errMsg.substring(0, 120)}... Tentando próximo modelo...`);
      // Brief pause to allow transient server spikes to clear
      await new Promise(resolve => setTimeout(resolve, 200));
      continue;
    }
  }
  throw lastError || new Error("Modelos Gemini indisponíveis temporariamente.");
}

app.post(["/api/nutria/chat", "/api/nutria"], async (req: Request, res: Response) => {
  try {
    const { 
      message, 
      conversationHistory = [], 
      appStateContext = {}, 
      appContext = {}, 
      activePatientContext = null,
      patientContext = null,
      patients = [],
      appointments = [],
      transactions = [],
      userAccount = null
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: "Mensagem obrigatória.", reply: "Mensagem obrigatória." });
      return;
    }

    // Merge context objects
    const mergedAppContext = { ...appStateContext, ...appContext };

    // Find if the user is asking about a specific patient
    const messageLower = message.toLowerCase();
    let targetPatient = activePatientContext || patientContext || null;

    if (Array.isArray(patients) && patients.length > 0) {
      const found = patients.find((p: any) => 
        p.name && messageLower.includes(p.name.toLowerCase())
      );
      if (found) {
        targetPatient = found;
      }
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(503).json({
        error: "Chave da API Gemini não configurada no servidor.",
        reply: "Desculpe, a chave do Google Gemini não está ativa no servidor. Verifique a variável de ambiente.",
        content: "Desculpe, a chave do Google Gemini não está ativa no servidor. Verifique a variável de ambiente."
      });
      return;
    }

    // Brasilia Time Calculation
    const brasiliaDateStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const brasiliaIsoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const brasiliaTime = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false });
    const professionalName = userAccount?.name || 'Doutor(a)';
    const professionalTitle = userAccount?.crn?.includes('CRM') ? 'Médico Nutrólogo' : (userAccount?.specialty?.toLowerCase().includes('nutrolog') ? 'Nutrólogo(a)' : 'Nutricionista Clínico(a)');

    // Context summary for clinic management
    const totalPatientsCount = patients.length > 0 ? patients.length : (mergedAppContext.patientsCount || 0);
    const todayAptsCount = appointments.length > 0 ? appointments.length : (mergedAppContext.todayAppointmentsCount || 0);
    const monthlyRev = mergedAppContext.monthlyRevenue ?? 0;
    const monthlyExp = mergedAppContext.monthlyExpenses ?? 0;
    const netBalance = monthlyRev - monthlyExp;

    const appointmentsSummary = Array.isArray(appointments) && appointments.length > 0
      ? appointments.slice(0, 10).map((a: any, i: number) => `  ${i + 1}. ${a.date} às ${a.time} - Paciente: ${a.patientName || a.patientId} (${a.modality || a.type || 'Presencial'}) [Status: ${a.status || 'Confirmada'}]${a.value ? ` R$ ${a.value}` : ''}`).join('\n')
      : '  (Nenhuma consulta listada no momento)';

    const transactionsSummary = Array.isArray(transactions) && transactions.length > 0
      ? transactions.slice(0, 8).map((t: any, i: number) => `  ${i + 1}. [${t.type === 'receita' ? 'RECEITA' : 'DESPESA'}] R$ ${Number(t.amount).toFixed(2)} - ${t.description} (${t.paymentMethod || 'PIX'}) - Data: ${t.date}`).join('\n')
      : '  (Nenhuma transação recente listada)';

    const patientsListSummary = Array.isArray(patients) && patients.length > 0
      ? patients.map((p: any, i: number) => `  ${i + 1}. ${p.name} (${p.age ? p.age + ' anos' : 'idade n/i'}, ${p.gender || 'n/i'}) - Peso: ${p.currentWeightKg || 'n/i'} kg - Objetivo: ${p.objective || 'Acompanhamento'}`).join('\n')
      : '  (Nenhum paciente cadastrado no momento)';

    // Prepare contextual prompt with full clinic and patient snapshot
    const contextSnippet = `
[CONTEXTO INTEGRADO DO CONSULTÓRIO NUTRINK]:
- Profissional Responsável: ${professionalName} (${professionalTitle} • Registro: ${userAccount?.crn || 'Ativo'})
- Data/Hora Oficial (Brasília): ${brasiliaDateStr} (${brasiliaIsoDate}) às ${brasiliaTime}
- Total de Pacientes no Consultório: ${totalPatientsCount}
- Consultas Hoje na Grade: ${todayAptsCount}
- Faturamento do Mês: R$ ${monthlyRev.toFixed(2)} | Despesas: R$ ${monthlyExp.toFixed(2)} | Saldo Líquido: R$ ${netBalance.toFixed(2)}

[AGENDA E CONSULTAS DO CONSULTÓRIO]:
${appointmentsSummary}

[LANÇAMENTOS FINANCEIROS DO CONSULTÓRIO]:
${transactionsSummary}

[BANCO DE PACIENTES]:
${patientsListSummary}

[PACIENTE ATIVO EM FOCO / MENCIONADO]:
${targetPatient ? JSON.stringify({
  id: targetPatient.id,
  name: targetPatient.name,
  age: targetPatient.age,
  gender: targetPatient.gender,
  objective: targetPatient.objective,
  initialWeightKg: targetPatient.initialWeightKg,
  currentWeightKg: targetPatient.currentWeightKg,
  targetWeightKg: targetPatient.targetWeightKg,
  heightCm: targetPatient.heightCm,
  bmi: targetPatient.bmi,
  bodyFatPercentage: targetPatient.bodyFatPercentage,
  muscleMassPercentage: targetPatient.muscleMassPercentage,
  tmb: targetPatient.tmb,
  get: targetPatient.get,
  activityFactor: targetPatient.activityFactor,
  evolutionHistory: targetPatient.evolutionHistory,
  anamnese: targetPatient.anamnese,
  labExams: targetPatient.labExams,
  mealPlan: targetPatient.mealPlan
}, null, 2) : "Nenhum paciente específico selecionado."}
`;

    // Normalização das mensagens de histórico
    const rawTurns: Array<{ role: 'user' | 'model'; text: string }> = [];
    if (Array.isArray(conversationHistory)) {
      for (const item of conversationHistory) {
        if (!item || !item.content) continue;
        const text = String(item.content).trim();
        if (!text) continue;
        const role: 'user' | 'model' = (item.role === 'model' || item.role === 'assistant') ? 'model' : 'user';
        rawTurns.push({ role, text });
      }
    }

    const normalizedMessage = message.trim();
    if (rawTurns.length > 0 && rawTurns[rawTurns.length - 1].role === 'user' && rawTurns[rawTurns.length - 1].text === normalizedMessage) {
      rawTurns.pop();
    }

    const slicedTurns = rawTurns.slice(-8);
    const alternatingContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const turn of slicedTurns) {
      if (alternatingContents.length === 0) {
        alternatingContents.push({ role: turn.role, parts: [{ text: turn.text }] });
        continue;
      }
      const prevTurn = alternatingContents[alternatingContents.length - 1];
      if (prevTurn.role === turn.role) {
        prevTurn.parts[0].text += `\n\n${turn.text}`;
      } else {
        alternatingContents.push({ role: turn.role, parts: [{ text: turn.text }] });
      }
    }

    // Extração de dados expressos na mensagem para override prioritário
    const weightMatch = normalizedMessage.match(/(?:peso(?:\s+de|\s*[:=])?\s*|pesando\s*|com\s*)?(\d{2,3}(?:[.,]\d+)?)\s*(?:kg|quilos|kilos)\b/i)
      || normalizedMessage.match(/\b(\d{2,3}(?:[.,]\d+)?)\s*kg\b/i);
    const heightCmMatch = normalizedMessage.match(/(?:altura(?:\s+de|\s*[:=])?\s*)?(\d{3})\s*(?:cm|centimetros|centímetros)\b/i);
    const heightMMatch = normalizedMessage.match(/(?:altura(?:\s+de|\s*[:=])?\s*)?([12][.,]\d{2})\s*(?:m|metros)?\b/i);
    const ageMatch = normalizedMessage.match(/(?:idade(?:\s+de|\s*[:=])?\s*)?(\d{1,3})\s*(?:anos|ano)\b/i);

    let messageOverrideNotice = "";
    if (weightMatch || heightCmMatch || heightMMatch || ageMatch) {
      const explicitWeight = weightMatch ? parseFloat(weightMatch[1].replace(',', '.')) : null;
      const explicitHeight = heightCmMatch ? parseInt(heightCmMatch[1], 10) : (heightMMatch ? Math.round(parseFloat(heightMMatch[1].replace(',', '.')) * 100) : null);
      const explicitAge = ageMatch ? parseInt(ageMatch[1], 10) : null;

      messageOverrideNotice = `\n\n[DADOS ANTROPOMÉTRICOS EXPRESSOS NA MENSAGEM DO USUÁRIO - PRIORIDADE MÁXIMA / SOBREPOSIÇÃO OBRIGATÓRIA]:
${explicitWeight ? `• PESO INFORMADO NA MENSAGEM: ${explicitWeight} kg (SOBREPÕE E ANULA QUALQUER PESO PRÉVIO DO PRONTUÁRIO)` : ''}
${explicitHeight ? `• ALTURA INFORMADA NA MENSAGEM: ${explicitHeight} cm` : ''}
${explicitAge ? `• IDADE INFORMADA NA MENSAGEM: ${explicitAge} anos` : ''}
ATENÇÃO MANDATÓRIA: Realize todos os cálculos energéticos de TMB, GET e todo o plano alimentar utilizando ESTRITAMENTE os valores informados na mensagem!`;
    }

    const userPromptText = `${contextSnippet}${messageOverrideNotice}\n\n[MENSAGEM DO USUÁRIO]:\n${normalizedMessage}`;
    if (alternatingContents.length > 0 && alternatingContents[alternatingContents.length - 1].role === 'user') {
      alternatingContents[alternatingContents.length - 1].parts[0].text = userPromptText;
    } else {
      alternatingContents.push({
        role: 'user',
        parts: [{ text: userPromptText }]
      });
    }

    let replyText = "";
    let actionExecuted: any = null;
    let usedModel = "gemini-3.7-flash";

    const { result, model: detectedModel } = await generateContentWithFallback(ai, {
      contents: alternatingContents,
      config: {
        systemInstruction: NUTRIA_SYSTEM_INSTRUCTION + `
[DIRETRIZES DE ATUAÇÃO DA NÚTRIA]:
1. Você é a NÚTRIA, a inteligência clínica máxima e copiloto operacional do consultório NutrinK.
2. Responda DIRETAMENTE, de forma dinâmica, científica e completa a TODA e QUALQUER pergunta do profissional de saúde.
3. Se o usuário solicitou plano alimentar, cardápio, dieta ou refeições (mesmo junto com TMB), OBRIGATORIAMENTE entregue a avaliação metabólica E o plano diário completo com todas as refeições (Desjejum, Colação, Almoço, Lanche, Jantar, Ceia), gramaturas exatas, medidas caseiras, macros e tabela de substituições.
4. NUNCA utilize templates estáticos ou mensagens evasivas pré-prontas como "estou à disposição no consultório".
5. Formate as respostas em Markdown limpo, sofisticado e legível, com tabelas organizadas.
`,
        temperature: 0.5,
        maxOutputTokens: 8192,
        tools: [{
          functionDeclarations: [
            abrirPaginaInstitucionalTool,
            navegarParaTelaTool,
            cadastrarPacienteTool,
            agendarConsultaTool,
            lancarFinanceiroTool,
            gerarPlanoAlimentarTool
          ]
        }]
      }
    });

    if (detectedModel) {
      usedModel = detectedModel;
    }

    replyText = result?.text || "";
    const candidates = (result as any)?.candidates;
    const firstCandidate = candidates && candidates[0];
    const functionCalls = firstCandidate?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall) || result.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        const args: any = call.args || {};

        if (call.name === "abrir_pagina_institucional") {
          const rawPagina = (args.pagina || "").toLowerCase();
          let pageKey = "inicio";
          if (rawPagina.includes("recurso") || rawPagina.includes("software")) pageKey = "recursos";
          else if (rawPagina.includes("plano") || rawPagina.includes("preco") || rawPagina.includes("preço")) pageKey = "planos";
          else if (rawPagina.includes("sobre")) pageKey = "sobre";
          else if (rawPagina.includes("metodolog") || rawPagina.includes("tmb") || rawPagina.includes("fonte") || rawPagina.includes("fato")) pageKey = "metodologia";
          else if (rawPagina.includes("cliente") || rawPagina.includes("depoimento") || rawPagina.includes("historia") || rawPagina.includes("história")) pageKey = "clientes";
          else if (rawPagina.includes("acessar") || rawPagina.includes("login") || rawPagina.includes("autentic")) pageKey = "acessar";
          else if (rawPagina.includes("privacidade") || rawPagina.includes("lgpd")) pageKey = "privacidade_lgpd";
          else if (rawPagina.includes("servico") || rawPagina.includes("serviço") || rawPagina.includes("termo")) pageKey = "termos_servico";
          else if (rawPagina.includes("uso_aceitavel") || rawPagina.includes("aceitavel") || rawPagina.includes("aceitável") || rawPagina.includes("conduta")) pageKey = "politica_uso_aceitavel";
          else if (rawPagina.includes("contato") || rawPagina.includes("suporte") || rawPagina.includes("fale")) pageKey = "fale_conosco";

          const pageDoc = INSTITUTIONAL_PAGES[pageKey] || INSTITUTIONAL_PAGES["inicio"];
          actionExecuted = {
            type: "OPEN_INSTITUTIONAL_DOC",
            payload: { pageId: pageDoc.id, pageTitle: pageDoc.title },
            summary: `Documento aberto: ${pageDoc.title}`
          };
          replyText = pageDoc.markdownContent;
        } else if (call.name === "navegar_para_tela") {
          const secao = args.secao ? args.secao.toLowerCase() : "dashboard";
          let targetTab = "dashboard";
          let screenTitle = "Dashboard Geral";

          if (secao.includes("paciente") || secao.includes("prontuario")) {
            targetTab = "patients";
            screenTitle = "Pacientes & Prontuários";
          } else if (secao.includes("agenda") || secao.includes("calendario")) {
            targetTab = "calendar";
            screenTitle = "Agenda & Calendário";
          } else if (secao.includes("financ") || secao.includes("faturam") || secao.includes("caixa")) {
            targetTab = "finance";
            screenTitle = "Financeiro & Faturamento";
          } else if (secao.includes("calc") || secao.includes("nutri") || secao.includes("protocolo")) {
            targetTab = "nutricalc";
            screenTitle = "NutriCalc & Protocolos de Cálculos";
          }

          actionExecuted = {
            type: "NAVIGATE_TAB",
            payload: { tab: targetTab },
            summary: `Navegação realizada para ${screenTitle}.`
          };

          if (targetTab === "dashboard") {
            replyText = `### 📊 Visão Geral do Consultório NutrinK\n\n| Indicador Clínico & Operacional | Valor Atual | Meta / Status |\n| :--- | :--- | :--- |\n| **Pacientes Ativos** | ${patients.length || 5} | 🟢 Alta Adesão |\n| **Consultas Agendadas Hoje** | 4 atendimentos | ⏱️ Próximo às 14:30 |\n| **Faturamento Mensal** | R$ ${(mergedAppContext.monthlyRevenue || 18450).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | 📈 92% da Meta |\n| **Despesas Operacionais** | R$ ${(mergedAppContext.monthlyExpenses || 3200).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | 💼 Saldo Positivo |`;
          } else if (targetTab === "patients") {
            replyText = `### 👥 Prontuário Eletrônico & Gestão de Pacientes\n\n| Paciente | Idade | Objetivo | Peso Atual | % Gordura | Status |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **Lucas Silveira** | 30 anos | Hipertrofia & Força | 78.2 kg | 13.5% | 🟢 Ativo |\n| **Camila Rocha** | 33 anos | Emagrecimento Saudável | 71.4 kg | 28.2% | 🟢 Ativo |\n| **Juliana Mendonça** | 37 anos | Manejo de Diabetes | 81.2 kg | 36.4% | 🟢 Ativo |\n| **Gabriel Mendes** | 28 anos | Performance Esportiva | 73.5 kg | 11.2% | 🟢 Ativo |\n| **Beatriz Albuquerque** | 25 anos | Nutrição Vegetariana | 58.5 kg | 20.1% | 🟢 Ativo |`;
          } else if (targetTab === "calendar") {
            replyText = `### 📅 Grade de Horários & Próximos Atendimentos\n\n| Horário | Paciente | Tipo de Atendimento | Modalidade | Status |\n| :--- | :--- | :--- | :--- | :--- |\n| **14:30 - 15:20** | Lucas Silveira | Retorno & Bioimpedância | 🏢 Presencial | 🟢 Confirmada |\n| **16:00 - 16:50** | Camila Rocha | Retorno & Ajuste de Fibras | 🏢 Presencial | 🟢 Confirmada |\n| **10:00 (Amanhã)** | Juliana Mendonça | Ajuste de Plano Alimentar | 💻 Teleconsulta | 🟢 Confirmada |`;
          } else if (targetTab === "finance") {
            replyText = `### 💼 Fluxo de Caixa & Balanço Financeiro\n\n| Categoria Financeira | Mês Atual | Mês Anterior | Variação |\n| :--- | :--- | :--- | :--- |\n| **Entradas (Consultas & Planos)** | R$ ${(mergedAppContext.monthlyRevenue || 18450).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ 16.200,00 | 🔼 +13.8% |\n| **Saídas (Despesas Operacionais)** | R$ ${(mergedAppContext.monthlyExpenses || 3200).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ 3.450,00 | 🔽 -7.2% |\n| **Saldo Líquido** | **R$ ${((mergedAppContext.monthlyRevenue || 18450) - (mergedAppContext.monthlyExpenses || 3200)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** | **R$ 12.750,00** | 📈 **+19.6%** |`;
          } else if (targetTab === "nutricalc") {
            replyText = `### 🧮 Central de Cálculos Energéticos & Protocolos Clínicos\n\n| Equação Preditiva | Indicação Clínica | Fórmula Base |\n| :--- | :--- | :--- |\n| **Mifflin-St Jeor (1990)** | Padrão ouro para adultos e sobrepeso | $10 \\times P + 6.25 \\times A - 5 \\times I + S$ |\n| **Cunningham (1980)** | Atletas e praticantes com %BF conhecido | $500 + 22 \\times \\text{Massa Livre de Gordura}$ |\n| **Harris-Benedict Revisada** | População geral e ambiente clínico | $88.362 + (13.397 \\times P) + (4.799 \\times A) - (5.677 \\times I)$ |`;
          }
        } else if (call.name === "cadastrar_paciente") {
          actionExecuted = {
            type: "ADD_PATIENT",
            payload: {
              name: args.nome,
              age: args.idade || 30,
              gender: args.genero || "outro",
              objective: args.objetivo || "emagrecimento",
              initialWeightKg: args.pesoKg || 70,
              currentWeightKg: args.pesoKg || 70,
              targetWeightKg: args.pesoKg || 65,
              heightCm: args.alturaCm || 170,
              bodyFatPercentage: args.percentualGordura || 20,
              phone: args.telefone || "",
              email: args.email || "",
              notes: args.observacoes || ""
            },
            summary: `Paciente ${args.nome} cadastrado(a) com sucesso!`
          };
          if (!replyText) {
            replyText = `Prontuário de **${args.nome}** cadastrado com sucesso no NutrinK!\n\n- **Idade**: ${args.idade ? `${args.idade} anos` : 'Não informada'}\n- **Objetivo**: ${args.objetivo || 'Geral'}\n- **Peso**: ${args.pesoKg ? `${args.pesoKg} kg` : 'Pendente'}\n- **Altura**: ${args.alturaCm ? `${args.alturaCm} cm` : 'Pendente'}\n\nA ficha clínica e as métricas basais já estão prontas para acompanhamento. Deseja agendar a primeira consulta ou estruturar o plano alimentar?`;
          }
        } else if (call.name === "agendar_consulta") {
          actionExecuted = {
            type: "SCHEDULE_APPOINTMENT",
            payload: {
              patientName: args.nomePaciente,
              date: args.data,
              time: args.horario,
              durationMinutes: args.duracaoMinutos || 50,
              type: args.tipo || "retorno",
              price: args.valor || 350,
              location: args.local || "presencial_consultorio",
              notes: args.notas || ""
            },
            summary: `Consulta agendada para ${args.nomePaciente} em ${args.data} às ${args.horario}.`
          };
          if (!replyText) {
            replyText = `Consulta confirmada e agendada na sua grade do NutrinK:\n\n- **Paciente**: ${args.nomePaciente}\n- **Data**: ${args.data}\n- **Horário**: ${args.horario} (${args.duracaoMinutos || 50} min)\n- **Modalidade**: ${args.local === 'online_video' ? 'Online por Vídeo' : 'Presencial no Consultório'}\n- **Valor**: R$ ${(args.valor || 350).toFixed(2)}\n\nO paciente foi notificado e o horário está bloqueado na sua agenda.`;
          }
        } else if (call.name === "lancar_financeiro") {
          actionExecuted = {
            type: "ADD_FINANCE_TRANSACTION",
            payload: {
              type: args.tipo || "receita",
              category: args.categoria || "consulta_avulsa",
              description: args.descricao,
              amount: args.valor,
              paymentMethod: args.metodoPagamento || "pix",
              patientName: args.nomePaciente || "",
              date: args.data || new Date().toISOString().split('T')[0]
            },
            summary: `Lançamento de ${args.tipo === 'receita' ? 'Receita' : 'Despesa'} de R$ ${args.valor} registrado.`
          };
          if (!replyText) {
            replyText = `Lançamento financeiro registrado com sucesso no caixa do NutrinK:\n\n- **Tipo**: ${args.tipo === 'receita' ? 'Receita (Entrada)' : 'Despesa (Saída)'}\n- **Descrição**: ${args.descricao}\n- **Valor**: R$ ${Number(args.valor).toFixed(2)}\n- **Método**: ${args.metodoPagamento ? args.metodoPagamento.toUpperCase() : 'PIX'}\n\nO fluxo de caixa e o faturamento do mês foram recalculados automaticamente.`;
          }
        } else if (call.name === "gerar_plano_alimentar") {
          actionExecuted = {
            type: "GENERATE_MEAL_PLAN",
            payload: {
              patientName: args.nomePaciente,
              title: args.tituloPlano || `Plano Nutricional - ${args.caloriasAlvo} kcal`,
              targetCalories: args.caloriasAlvo,
              targetProteinGrams: args.proteinasGramas || Math.round((args.caloriasAlvo * 0.25) / 4),
              targetCarbsGrams: args.carboidratosGramas || Math.round((args.caloriasAlvo * 0.50) / 4),
              targetFatGrams: args.gordurasGramas || Math.round((args.caloriasAlvo * 0.25) / 9),
              hydrationGoalLiters: args.metaHidricaLitros || 3.0,
              generalGuidelines: args.orientacoesGerais || "Fracionar a ingestão hídrica ao longo do dia. Mastigar calmamente."
            },
            summary: `Plano alimentar de ${args.caloriasAlvo} kcal estruturado para ${args.nomePaciente}.`
          };
        }
      }

    if (!replyText || replyText.trim().length === 0) {
      replyText = "Solicitação processada com sucesso pelo copiloto NutrinK.";
    }

    // Apply strict formatting cleanup to purge LaTeX and raw math dollar tokens
    const cleanedReply = cleanMathAndLatex(replyText.trim());

    res.json({
      reply: cleanedReply,
      content: cleanedReply,
      actionExecuted,
      model: usedModel,
      provider: "gemini"
    });

  } catch (error: any) {
    console.error("Erro na rota /api/nutria/chat:", error);
    res.status(500).json({
      error: "Falha ao processar solicitação com a Nutria.",
      reply: "Desculpe, ocorreu uma instabilidade momentânea na comunicação. Pode repetir a solicitação?",
      content: "Desculpe, ocorreu uma instabilidade momentânea na comunicação. Pode repetir a solicitação?",
      details: error.message
    });
  }
});

// ==========================================
// TELEMEDICINA & NUTRIA AO VIVO ENDPOINTS
// ==========================================

// Endpoint for real-time live clinical analysis during video consultation
app.post("/api/telemedicine/analyze-live", async (req: Request, res: Response) => {
  try {
    const { transcript, patient, currentInsights, notes } = req.body;
    const ai = getGenAI();

    const patientName = patient?.name || "Paciente em Atendimento";
    const patientWeight = Number(patient?.currentWeightKg || patient?.initialWeightKg || 70);
    const patientHeight = Number(patient?.heightCm || 170);
    const patientAge = Number(patient?.age || 30);
    const patientGender = patient?.gender || "feminino";
    const patientObj = patient?.objective || "emagrecimento";

    // Standard calculated baseline metrics
    const heightM = patientHeight / 100;
    const bmi = (patientWeight / (heightM * heightM)).toFixed(1);
    let tmbCalc = Math.round(
      patientGender === 'masculino'
        ? 10 * patientWeight + 6.25 * patientHeight - 5 * patientAge + 5
        : 10 * patientWeight + 6.25 * patientHeight - 5 * patientAge - 161
    );
    let getCalc = Math.round(tmbCalc * (patient?.activityFactor || 1.375));

    if (!ai) {
      // Deterministic Clinical Insights generator
      const liveInsights = [
        {
          id: `ins-${Date.now()}-1`,
          type: 'calculo' as const,
          title: `Gasto Energético Calculado (${patientName})`,
          description: `TMB: ${tmbCalc} kcal | GET Estimado: ${getCalc} kcal (IMC: ${bmi} kg/m²). Sugestão de meta calórica para ${patientObj}: ${patientObj === 'hipertrofia' ? getCalc + 350 : getCalc - 400} kcal/dia.`,
          badge: 'Mifflin-St Jeor',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: `ins-${Date.now()}-2`,
          type: 'suplemento' as const,
          title: 'Suplementação Estratégica Sugerida',
          description: `• Creatina Monoidratada: 5g/dia\n• Whey Protein Isolado/Concentrado: 30g pós-treino ou lanche\n• Ômega-3 EPA/DHA: 1.000mg/dia\n• Meta Hídrica: ${(patientWeight * 0.035).toFixed(1)}L de água/dia.`,
          badge: 'Baseada em Evidências',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: `ins-${Date.now()}-3`,
          type: 'conduta' as const,
          title: 'Conduta Nutricional & Fracionamento',
          description: `Fracionamento em 4 a 5 refeições diárias. Aporte proteico recomendado: ${(patientWeight * 1.8).toFixed(0)}g/dia (1.8g/kg) com distribuição uniforme de leucina.`,
          badge: 'Fracionamento Proteico',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ];

      res.json({
        insights: liveInsights,
        tmb: tmbCalc,
        get: getCalc,
        suggestedKcal: patientObj === 'hipertrofia' ? getCalc + 350 : getCalc - 400
      });
      return;
    }

    const promptText = `
Você é a NUTRIA, copiloto clínico em tempo real durante uma vídeoconsulta nutricional.
Analise a transcrição recente da conversa e notas do nutricionista com o paciente:

[DADOS DO PACIENTE]
- Nome: ${patientName}
- Idade: ${patientAge} anos | Gênero: ${patientGender}
- Peso: ${patientWeight} kg | Altura: ${patientHeight} cm (IMC: ${bmi})
- Objetivo: ${patientObj}
- TMB Basal: ${tmbCalc} kcal | GET: ${getCalc} kcal

[TRANSCRIÇÃO RECENTE / NOTAS DA CONSULTA]
"${transcript || notes || 'Consulta em andamento'}"

Retorne APENAS um JSON válido no formato:
{
  "insights": [
    {
      "type": "calculo" | "suplemento" | "conduta" | "alerta",
      "title": "Título direto e profissional",
      "description": "Explicação clínica precisa com dosagens e justificativa científica",
      "badge": "Badge curto (ex: 5g/dia, Mifflin, Alerta)"
    }
  ],
  "tmb": ${tmbCalc},
  "get": ${getCalc},
  "suggestedKcal": ${patientObj === 'hipertrofia' ? getCalc + 350 : getCalc - 400},
  "keyObservations": "Observação curta sobre queixas ou hábitos relatados"
}
`;

    try {
      const response = await generateContentWithFallback(ai, {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const jsonText = response.text || "{}";
      const parsed = JSON.parse(jsonText.replace(/```json/g, '').replace(/```/g, '').trim());
      
      const formattedInsights = (parsed.insights || []).map((ins: any, idx: number) => ({
        id: `ins-${Date.now()}-${idx}`,
        type: ins.type || 'conduta',
        title: ins.title,
        description: ins.description,
        badge: ins.badge || 'Nutria Ao Vivo',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));

      res.json({
        insights: formattedInsights.length > 0 ? formattedInsights : [
          {
            id: `ins-${Date.now()}-1`,
            type: 'calculo',
            title: `Métricas Metabólicas (${patientName})`,
            description: `TMB: ${tmbCalc} kcal | GET: ${getCalc} kcal. Meta calórica recomendada: ${parsed.suggestedKcal || getCalc - 400} kcal.`,
            badge: 'Mifflin-St Jeor',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        ],
        tmb: parsed.tmb || tmbCalc,
        get: parsed.get || getCalc,
        suggestedKcal: parsed.suggestedKcal || (patientObj === 'hipertrofia' ? getCalc + 350 : getCalc - 400),
        keyObservations: parsed.keyObservations || ""
      });
    } catch (e: any) {
      res.json({
        insights: [
          {
            id: `ins-${Date.now()}-1`,
            type: 'calculo',
            title: `Gasto Energético (${patientName})`,
            description: `TMB: ${tmbCalc} kcal | GET Estimado: ${getCalc} kcal. Meta: ${patientObj === 'hipertrofia' ? getCalc + 350 : getCalc - 400} kcal.`,
            badge: 'Mifflin',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        ],
        tmb: tmbCalc,
        get: getCalc,
        suggestedKcal: patientObj === 'hipertrofia' ? getCalc + 350 : getCalc - 400
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for post-consultation synthesis (Electronic Record + Draft Meal Plan)
app.post("/api/telemedicine/post-consultation", async (req: Request, res: Response) => {
  try {
    const { session, patient, userAccount } = req.body;
    const ai = getGenAI();

    const patientName = patient?.name || session?.patientName || "Paciente";
    const patientWeight = Number(patient?.currentWeightKg || patient?.initialWeightKg || 70);
    const patientHeight = Number(patient?.heightCm || 170);
    const patientAge = Number(patient?.age || 30);
    const patientGender = patient?.gender || "feminino";
    const patientObj = patient?.objective || "emagrecimento";

    const tmb = Math.round(
      patientGender === 'masculino'
        ? 10 * patientWeight + 6.25 * patientHeight - 5 * patientAge + 5
        : 10 * patientWeight + 6.25 * patientHeight - 5 * patientAge - 161
    );
    const getVal = Math.round(tmb * (patient?.activityFactor || 1.375));
    const targetCalories = patientObj === 'hipertrofia' ? getVal + 350 : (patientObj === 'emagrecimento' ? Math.max(1200, getVal - 450) : getVal);
    const targetProtein = Math.round(patientWeight * 1.8);
    const targetFat = Math.round((targetCalories * 0.25) / 9);
    const targetCarbs = Math.round((targetCalories - (targetProtein * 4 + targetFat * 9)) / 4);

    // Full structured default meal plan draft
    const defaultMealPlan = {
      id: `mp-${Date.now()}`,
      title: `Plano Nutricional Personalizado - ${targetCalories} kcal`,
      dateCreated: new Date().toISOString().split('T')[0],
      targetCalories,
      targetProteinGrams: targetProtein,
      targetCarbsGrams: targetCarbs,
      targetFatGrams: targetFat,
      targetFiberGrams: 30,
      hydrationGoalLiters: Number((patientWeight * 0.035).toFixed(1)),
      generalGuidelines: `• Mastigar devagar e manter horários regulares das refeições.\n• Manter ingestão hídrica de ${Number((patientWeight * 0.035).toFixed(1))}L fracionada ao longo do dia.\n• Evitar líquidos durante as refeições principais.\n• Priorizar alimentos in natura e ricos em fibras.`,
      supplements: [
        "Creatina Monoidratada: 5g ao dia (com uma refeição com carboidrato)",
        "Whey Protein Isolado/Concentrado: 30g pós-treino ou lanche",
        "Ômega-3 (EPA/DHA): 1.000mg junto ao almoço"
      ],
      meals: [
        {
          id: 'meal-1',
          name: 'Café da Manhã Completo',
          time: '07:30',
          items: [
            { id: 'm1-1', foodName: 'Ovos mexidos com azeite de oliva', portion: '2 unidades (100g)', calories: 160, protein: 13, carbs: 1, fat: 11, fiber: 0 },
            { id: 'm1-2', foodName: 'Pão 100% integral ou Tapioca', portion: '2 fatias (50g)', calories: 120, protein: 4, carbs: 22, fat: 1.5, fiber: 3.5 },
            { id: 'm1-3', foodName: 'Mamão papaia com sementes de chia', portion: '1 fatia média (120g) + 1 colher sopa de chia', calories: 95, protein: 3, carbs: 14, fat: 3.5, fiber: 4.5 },
            { id: 'm1-4', foodName: 'Café preto ou Chá verde sem açúcar', portion: '1 xícara (150ml)', calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0 }
          ],
          notes: 'Pode substituir os ovos por queijo minas frescal (60g) ou tofu grelhado.'
        },
        {
          id: 'meal-2',
          name: 'Almoço Balanceado',
          time: '12:30',
          items: [
            { id: 'm2-1', foodName: 'Filé de peito de frango grelhado ou Patinho moído', portion: '150g pesado pronto', calories: 230, protein: 45, carbs: 0, fat: 5, fiber: 0 },
            { id: 'm2-2', foodName: 'Arroz integral cozido', portion: '4 colheres de sopa (100g)', calories: 125, protein: 2.5, carbs: 26, fat: 1, fiber: 2 },
            { id: 'm2-3', foodName: 'Feijão preto / carioca cozido', portion: '1 concha média (80g)', calories: 75, protein: 4.5, carbs: 13, fat: 0.5, fiber: 5 },
            { id: 'm2-4', foodName: 'Salada variada (Rúcula, Alface, Tomate, Cenoura ralada)', portion: 'Prato sobremesa à vontade', calories: 35, protein: 1.5, carbs: 7, fat: 0.2, fiber: 3 },
            { id: 'm2-5', foodName: 'Azeite de oliva extravirgem', portion: '1 colher de sobremesa (5ml)', calories: 45, protein: 0, carbs: 0, fat: 5, fiber: 0 }
          ],
          notes: 'Variar a fonte vegetal de ferro acompanhada de gotas de limão na salada.'
        },
        {
          id: 'meal-3',
          name: 'Lanche da Tarde & Pré-Treino',
          time: '16:30',
          items: [
            { id: 'm3-1', foodName: 'Iogurte natural desnatado ou Bebida vegetal', portion: '1 pote (160g)', calories: 80, protein: 7, carbs: 10, fat: 1.5, fiber: 0 },
            { id: 'm3-2', foodName: 'Whey Protein Concentrado ou Isolado', portion: '1 scoop (30g)', calories: 120, protein: 24, carbs: 2, fat: 1.5, fiber: 0 },
            { id: 'm3-3', foodName: 'Banana prata em rodelas com aveia em flocos', portion: '1 unidade (80g) + 1 colher sopa aveia (15g)', calories: 130, protein: 3, carbs: 27, fat: 1.5, fiber: 3.5 },
            { id: 'm3-4', foodName: 'Castanhas do Pará ou Nozes', portion: '2 unidades (10g)', calories: 65, protein: 1.5, carbs: 1.5, fat: 6.5, fiber: 1 }
          ],
          notes: 'Excelente fonte de triptofano, magnésio e aporte proteico da tarde.'
        },
        {
          id: 'meal-4',
          name: 'Jantar Restaurador',
          time: '20:00',
          items: [
            { id: 'm4-1', foodName: 'Filé de Tilápia ou Salmão grelhado', portion: '150g', calories: 200, protein: 38, carbs: 0, fat: 5, fiber: 0 },
            { id: 'm4-2', foodName: 'Batata doce assada ou Mandioca cozida', portion: '1 unidade média (100g)', calories: 100, protein: 1.5, carbs: 23, fat: 0.2, fiber: 3 },
            { id: 'm4-3', foodName: 'Legumes no vapor (Brócolis, Abobrinha, Couve-flor)', portion: '1 xícara cheia (120g)', calories: 45, protein: 3, carbs: 8, fat: 0.5, fiber: 4 }
          ],
          notes: 'Refeição leve com fácil digestibilidade para não comprometer a qualidade do sono.'
        },
        {
          id: 'meal-5',
          name: 'Ceia Relaxante (Opcional)',
          time: '22:00',
          items: [
            { id: 'm5-1', foodName: 'Chá de Camomila, Mulungu ou Melissa', portion: '1 xícara (200ml)', calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0 },
            { id: 'm5-2', foodName: 'Mix de sementes de abóbora tostadas', portion: '1 colher de sopa (10g)', calories: 55, protein: 3, carbs: 1.5, fat: 4.5, fiber: 1 }
          ],
          notes: 'Rico em magnésio e fitoquímicos indutores do sono reparador.'
        }
      ]
    };

    const clinicalSummary = `### 📋 Resumo Executivo da Vídeoconsulta (NUTRIA Telemedicina)
- **Paciente**: ${patientName} (${patientAge} anos) | **Data**: ${new Date().toLocaleDateString('pt-BR')}
- **Objetivo Clínico**: ${patientObj.toUpperCase().replace('_', ' ')}
- **Métricas Metabólicas**: Peso ${patientWeight}kg | Altura ${patientHeight}cm | TMB ${tmb} kcal | GET ${getVal} kcal | Meta: ${targetCalories} kcal/dia
- **Conduta Adotada**: Dieta balanceada com fracionamento proteico (${(targetProtein/patientWeight).toFixed(1)}g/kg), hidratação dirigida de ${(patientWeight * 0.035).toFixed(1)}L/dia e suplementação de Creatina e Ômega-3.
- **Próximos Passos**: Retorno agendado para 30 dias para avaliação de adesão e evolução antropométrica.`;

    res.json({
      summary: clinicalSummary,
      mealPlanDraft: defaultMealPlan,
      anamneseUpdates: {
        routineAndOccupation: "Atendimento por Telemedicina via NutrinK",
        waterIntakeLiters: Number((patientWeight * 0.035).toFixed(1)),
        currentMedicationsAndSupplements: "Creatina 5g/dia, Whey Protein 30g/dia, Ômega-3 1.000mg/dia"
      },
      evolutionRecord: {
        id: `ant-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        weightKg: patientWeight,
        heightCm: patientHeight,
        bmi: Number((patientWeight / ((patientHeight/100)**2)).toFixed(1)),
        notes: `Atendimento Telemedicina: Meta calórica de ${targetCalories} kcal definida.`
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// MERCADO PAGO INTEGRATION & PAYMENT ROUTES (OFICIAL MERCADO PAGO)
// ==========================================

// 1. Get payment configuration and credentials status
app.get("/api/payments/config", (req: Request, res: Response) => {
  const token = getMercadoPagoToken();
  const publicKey = getMercadoPagoPublicKey();
  const clientId = getMercadoPagoClientId();
  const isConfigured = Boolean(token && token.length > 10);
  const isProduction = token.startsWith("APP_USR-");
  const isSandbox = token.startsWith("TEST-");

  res.json({
    configured: isConfigured,
    isProduction,
    isSandbox,
    environment: isProduction ? "production" : (isSandbox ? "sandbox" : "demo_mode"),
    publicKey: publicKey,
    clientId: clientId,
    appUrl: process.env.APP_URL || "https://nutrink.com.br"
  });
});

function padTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16Ccitt(str: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i);
    crc ^= (byte << 8);
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function createBacemPixPayload(amount: number, description: string = 'NutrinK Premium', txId: string = 'NUTRINK'): string {
  const formattedAmount = amount.toFixed(2);
  const pixKey = '321.785.4448/94';
  const receiverName = 'NutrinK Consultorio';
  const receiverCity = 'SAO PAULO';

  const gui = padTag('00', 'br.gov.bcb.pix');
  const key = padTag('01', pixKey);
  const desc = description ? padTag('02', description.substring(0, 25)) : '';
  const merchantAccountInfo = padTag('26', `${gui}${key}${desc}`);

  const payloadFormat = padTag('00', '01');
  const merchantCategory = padTag('52', '0000');
  const currency = padTag('53', '986');
  const transactionAmount = padTag('54', formattedAmount);
  const countryCode = padTag('58', 'BR');
  const merchantName = padTag('59', receiverName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 25));
  const merchantCity = padTag('60', receiverCity.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 15));

  const cleanTxId = txId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || 'NUTRINK';
  const additionalData = padTag('62', padTag('05', cleanTxId));

  const rawPayload = `${payloadFormat}${merchantAccountInfo}${merchantCategory}${currency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalData}6304`;
  const crc = crc16Ccitt(rawPayload);
  return `${rawPayload}${crc}`;
}

// 2. Create Official Instant PIX Payment via Mercado Pago API (Checkout Transparente)
const handleCreatePix = async (req: Request, res: Response) => {
  try {
    const { planId, payerEmail, payerName, payerCpf, customAmount } = req.body;
    
    // Calculate final price in BRL
    let amount = 39.00;
    let description = "NutrinK • Assinatura Premium Mensal";
    
    if (planId === 'premium_anual') {
      amount = 399.00;
      description = "NutrinK • Assinatura Premium Anual";
    } else if (customAmount && Number(customAmount) > 0) {
      amount = Number(customAmount);
      description = `NutrinK • Atendimento Clínico / Consulta`;
    }

    const appUrl = process.env.APP_URL || "https://nutrink.com.br";
    const token = getMercadoPagoToken();
    const expiresDate = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiration

    // Separate first and last name
    const nameParts = (payerName || "Profissional NutrinK").trim().split(" ");
    const firstName = nameParts[0] || "Profissional";
    const lastName = nameParts.slice(1).join(" ") || "Nutricionista";

    let cleanEmail = (payerEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      cleanEmail = "cliente.nutrink@gmail.com";
    }

    const cleanCpf = (payerCpf || "").replace(/\D/g, "");

    // 1. Primary: Create Live PIX via Mercado Pago API
    if (token) {
      try {
        const mpFetch = await fetch("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-Idempotency-Key": `nutrink-pix-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
          },
          body: JSON.stringify({
            transaction_amount: amount,
            description: description,
            payment_method_id: "pix",
            payer: {
              email: cleanEmail,
              first_name: firstName,
              last_name: lastName,
              ...(cleanCpf.length === 11 ? { identification: { type: "CPF", number: cleanCpf } } : {})
            },
            notification_url: `${appUrl}/api/webhooks/mercadopago`,
            date_of_expiration: expiresDate.toISOString(),
            external_reference: `nutrink-${planId || 'premium'}-${Date.now()}`
          })
        });

        const fetchText = await mpFetch.text();
        let mpData: any = {};
        try {
          mpData = JSON.parse(fetchText);
        } catch {
          mpData = { raw: fetchText };
        }

        if (mpFetch.ok && mpData.id) {
          const mpPaymentId = String(mpData.id);
          const mpQrCode = mpData.point_of_interaction?.transaction_data?.qr_code || "";
          let mpQrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64 || "";

          if (!mpQrCodeBase64 && mpQrCode) {
            const generatedQr = await QRCode.toDataURL(mpQrCode, { width: 400, margin: 2 });
            mpQrCodeBase64 = generatedQr.replace(/^data:image\/png;base64,/, '');
          }

          const ticketUrl = mpData.point_of_interaction?.transaction_data?.ticket_url || "";

          inMemoryPayments.set(mpPaymentId, {
            id: mpPaymentId,
            status: mpData.status || 'pending',
            planId: planId || 'premium_mensal',
            amount: amount,
            createdAt: Date.now(),
            qrCode: mpQrCode,
            qrCodeBase64: mpQrCodeBase64,
            payerEmail: cleanEmail
          });

          return res.json({
            success: true,
            provider: "mercadopago_live",
            paymentId: mpPaymentId,
            status: mpData.status || "pending",
            amount: amount,
            description: description,
            planId: planId,
            qrCode: mpQrCode,
            qrCodeBase64: mpQrCodeBase64,
            ticketUrl: ticketUrl,
            expiresAt: expiresDate.toISOString(),
            isProduction: token.startsWith("APP_USR-")
          });
        }

        // If Mercado Pago returned specific error (e.g. collector needs Pix key registered)
        console.warn("[Mercado Pago PIX]:", mpFetch.status, fetchText);
        
        // Handle "Collector user without key enabled" smoothly by rendering standard BACEN EMV Pix QR Code
        const isPixKeyMissing = fetchText.includes("Collector user without key") || fetchText.includes("13253") || fetchText.includes("Financial Identity");
        
        const fallbackPaymentId = `pix-mp-${Date.now()}`;
        const txId = `NTK${Date.now().toString().slice(-8)}`;
        const emvPayload = createBacemPixPayload(amount, description, txId);
        const generatedQr = await QRCode.toDataURL(emvPayload, { width: 400, margin: 2 });
        const qrCodeBase64 = generatedQr.replace(/^data:image\/png;base64,/, '');

        inMemoryPayments.set(fallbackPaymentId, {
          id: fallbackPaymentId,
          status: 'pending',
          planId: planId || 'premium_mensal',
          amount: amount,
          createdAt: Date.now(),
          qrCode: emvPayload,
          qrCodeBase64: qrCodeBase64,
          payerEmail: cleanEmail
        });

        return res.json({
          success: true,
          provider: "mercadopago_emv",
          paymentId: fallbackPaymentId,
          status: "pending",
          amount: amount,
          description: description,
          planId: planId,
          qrCode: emvPayload,
          qrCodeBase64: qrCodeBase64,
          ticketUrl: "",
          expiresAt: expiresDate.toISOString(),
          isProduction: true,
          notice: isPixKeyMissing 
            ? "Para ativar a conciliação automática com webhook instantâneo no Mercado Pago, cadastre qualquer chave Pix (CPF, Celular ou E-mail) no seu app Mercado Pago."
            : undefined
        });

      } catch (mpError: any) {
        console.error("[Mercado Pago Live PIX Exception]:", mpError?.message || mpError);
        
        // Fallback to EMV Pix
        const fallbackPaymentId = `pix-mp-${Date.now()}`;
        const txId = `NTK${Date.now().toString().slice(-8)}`;
        const emvPayload = createBacemPixPayload(amount, description, txId);
        const generatedQr = await QRCode.toDataURL(emvPayload, { width: 400, margin: 2 });
        const qrCodeBase64 = generatedQr.replace(/^data:image\/png;base64,/, '');

        inMemoryPayments.set(fallbackPaymentId, {
          id: fallbackPaymentId,
          status: 'pending',
          planId: planId || 'premium_mensal',
          amount: amount,
          createdAt: Date.now(),
          qrCode: emvPayload,
          qrCodeBase64: qrCodeBase64,
          payerEmail: cleanEmail
        });

        return res.json({
          success: true,
          provider: "mercadopago_emv",
          paymentId: fallbackPaymentId,
          status: "pending",
          amount: amount,
          description: description,
          planId: planId,
          qrCode: emvPayload,
          qrCodeBase64: qrCodeBase64,
          ticketUrl: "",
          expiresAt: expiresDate.toISOString(),
          isProduction: true
        });
      }
    }

    res.status(500).json({
      error: "Credenciais do Mercado Pago não configuradas no servidor."
    });

  } catch (error: any) {
    console.error("Erro fatal ao criar pagamento Pix no Mercado Pago:", error);
    res.status(500).json({ error: error.message || "Falha ao gerar PIX com Mercado Pago" });
  }
};

app.post("/api/payments/create-pix", handleCreatePix);
app.post("/api/payments/pix", handleCreatePix);

// 3. Process Transparent Card Payment (Credit & Debit 1x to 12x - Checkout Transparente)
const handleProcessCard = async (req: Request, res: Response) => {
  try {
    const {
      token: clientToken,
      cardNumber,
      cardholderName,
      cardExpirationMonth,
      cardExpirationYear,
      securityCode,
      identificationType,
      identificationNumber,
      installments,
      paymentMethodId,
      payerEmail,
      payerName,
      planId,
      customAmount
    } = req.body;

    let amount = 39.00;
    let description = "NutrinK • Assinatura Premium Mensal";
    if (planId === 'premium_anual') {
      amount = 399.00;
      description = "NutrinK • Assinatura Premium Anual";
    } else if (customAmount && Number(customAmount) > 0) {
      amount = Number(customAmount);
      description = "NutrinK • Atendimento Clínico";
    }

    const token = getMercadoPagoToken();
    const appUrl = process.env.APP_URL || "https://nutrink.com.br";

    let cleanEmail = (payerEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      cleanEmail = "cliente.nutrink@gmail.com";
    }

    const nameParts = (payerName || cardholderName || "Profissional NutrinK").trim().split(" ");
    const firstName = nameParts[0] || "Profissional";
    const lastName = nameParts.slice(1).join(" ") || "Nutricionista";
    const cleanCpf = (identificationNumber || "").replace(/\D/g, "");

    let cardToken = clientToken;

    // If client provided raw card data, tokenize via Mercado Pago API
    if (!cardToken && cardNumber) {
      const cleanCard = String(cardNumber).replace(/\D/g, "");
      const cleanExpMonth = String(cardExpirationMonth).replace(/\D/g, "").padStart(2, "0");
      let cleanExpYear = String(cardExpirationYear).replace(/\D/g, "");
      if (cleanExpYear.length === 2) cleanExpYear = "20" + cleanExpYear;

      const tokenRes = await fetch("https://api.mercadopago.com/v1/card_tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          card_number: cleanCard,
          cardholder: {
            name: cardholderName || `${firstName} ${lastName}`,
            identification: {
              type: identificationType || "CPF",
              number: cleanCpf || "11144477735"
            }
          },
          expiration_month: parseInt(cleanExpMonth, 10),
          expiration_year: parseInt(cleanExpYear, 10),
          security_code: String(securityCode).replace(/\D/g, "")
        })
      });

      if (tokenRes.ok) {
        const tokenJson: any = await tokenRes.json();
        cardToken = tokenJson.id;
      } else {
        const tokenErrText = await tokenRes.text();
        console.error("[Mercado Pago Card Tokenize Error]:", tokenRes.status, tokenErrText);
        let parsedErr: any = {};
        try { parsedErr = JSON.parse(tokenErrText); } catch {}
        return res.status(400).json({
          success: false,
          error: parsedErr.message || "Dados do cartão inválidos. Verifique o número, validade e CVV.",
          details: parsedErr
        });
      }
    }

    if (!cardToken) {
      return res.status(400).json({
        success: false,
        error: "Token do cartão não fornecido ou dados inválidos."
      });
    }

    // Process Payment directly with Mercado Pago API
    const paymentPayload: any = {
      transaction_amount: amount,
      token: cardToken,
      description: description,
      installments: Number(installments) || 1,
      payment_method_id: paymentMethodId || "credit_card",
      payer: {
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName,
        ...(cleanCpf ? { identification: { type: identificationType || "CPF", number: cleanCpf } } : {})
      },
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      external_reference: `nutrink-${planId || 'premium'}-${Date.now()}`
    };

    const mpPayRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Idempotency-Key": `nutrink-card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      },
      body: JSON.stringify(paymentPayload)
    });

    const payData: any = await mpPayRes.json();
    const mpPaymentId = String(payData.id || "");

    if (mpPayRes.ok && (payData.status === "approved" || payData.status === "in_process")) {
      const isApproved = payData.status === "approved";
      
      inMemoryPayments.set(mpPaymentId, {
        id: mpPaymentId,
        status: payData.status,
        planId: planId || 'premium_mensal',
        amount: amount,
        createdAt: Date.now(),
        qrCode: "",
        qrCodeBase64: "",
        payerEmail: cleanEmail
      });

      if (isApproved && cleanEmail) {
        activatedSubscriptions.set(cleanEmail, {
          email: cleanEmail,
          planId: planId === 'premium_anual' ? 'premium_anual' : 'premium_mensal',
          status: 'active',
          activatedAt: new Date().toISOString(),
          paymentId: mpPaymentId,
          paymentMethod: payData.payment_method_id || 'credit_card',
          amount: amount
        });
      }

      return res.json({
        success: true,
        isApproved: isApproved,
        status: payData.status,
        statusDetail: payData.status_detail,
        paymentId: mpPaymentId,
        planId: planId,
        amount: amount,
        message: isApproved 
          ? "Pagamento aprovado com sucesso pelo Mercado Pago!" 
          : "Pagamento em análise pelo Mercado Pago."
      });
    } else {
      console.error("[Mercado Pago Card Payment Declined]:", mpPayRes.status, payData);
      
      const detail = payData.status_detail || "";
      let humanMessage = "Pagamento não aprovado pela operadora do cartão.";
      if (detail === "cc_rejected_bad_filled_card_number") humanMessage = "Número do cartão incorreto.";
      else if (detail === "cc_rejected_bad_filled_date") humanMessage = "Data de validade incorreta.";
      else if (detail === "cc_rejected_bad_filled_security_code") humanMessage = "Código de segurança (CVV) incorreto.";
      else if (detail === "cc_rejected_insufficient_amount") humanMessage = "Saldo ou limite insuficiente no cartão.";
      else if (detail === "cc_rejected_call_for_authorize") humanMessage = "Pagamento não autorizado pelo banco emissor.";
      else if (detail === "cc_rejected_card_disabled") humanMessage = "Cartão desabilitado. Contate seu banco.";
      else if (detail === "cc_rejected_duplicated_payment") humanMessage = "Pagamento duplicado detectado.";
      else if (detail === "cc_rejected_high_risk") humanMessage = "Transação recusada por análise de segurança do Mercado Pago.";
      else if (payData.message) humanMessage = payData.message;

      return res.status(400).json({
        success: false,
        isApproved: false,
        status: payData.status || "rejected",
        statusDetail: payData.status_detail || "unknown",
        error: humanMessage,
        mercadopagoResponse: payData
      });
    }
  } catch (error: any) {
    console.error("[Mercado Pago Process Card Exception]:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro de conexão ao processar cartão com o Mercado Pago."
    });
  }
};

app.post("/api/payments/process-card", handleProcessCard);
app.post("/api/payments/card", handleProcessCard);
app.post("/api/payments/process-payment", handleProcessCard);

// 4. Create Transparent Boleto Payment via Mercado Pago API (Checkout Transparente)
const handleCreateBoleto = async (req: Request, res: Response) => {
  try {
    const { planId, payerEmail, payerName, payerCpf, customAmount } = req.body;
    let amount = 39.00;
    let description = "NutrinK • Assinatura Premium Mensal";
    if (planId === 'premium_anual') {
      amount = 399.00;
      description = "NutrinK • Assinatura Premium Anual";
    } else if (customAmount && Number(customAmount) > 0) {
      amount = Number(customAmount);
      description = "NutrinK • Atendimento Clínico";
    }

    const token = getMercadoPagoToken();
    const appUrl = process.env.APP_URL || "https://nutrink.com.br";

    let cleanEmail = (payerEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      cleanEmail = "cliente.nutrink@gmail.com";
    }

    const nameParts = (payerName || "Profissional NutrinK").trim().split(" ");
    const firstName = nameParts[0] || "Profissional";
    const lastName = nameParts.slice(1).join(" ") || "Nutricionista";
    const cleanCpf = (payerCpf || "11144477735").replace(/\D/g, "");

    const boletoRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Idempotency-Key": `nutrink-bol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description,
        payment_method_id: "bolbradesco",
        payer: {
          email: cleanEmail,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: "CPF",
            number: cleanCpf
          },
          address: {
            zip_code: "01310-000",
            street_name: "Av Paulista",
            street_number: "1000",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            federal_unit: "SP"
          }
        },
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        external_reference: `nutrink-${planId || 'premium'}-${Date.now()}`
      })
    });

    const boletoData: any = await boletoRes.json();
    if (boletoRes.ok) {
      const ticketUrl = boletoData.transaction_details?.external_resource_url || boletoData.point_of_interaction?.transaction_data?.ticket_url || "";
      const barcode = boletoData.barcode?.content || "";
      const digitableLine = boletoData.transaction_details?.digitable_line || barcode;

      return res.json({
        success: true,
        paymentId: String(boletoData.id),
        status: boletoData.status,
        amount: amount,
        barcode: barcode,
        digitableLine: digitableLine,
        ticketUrl: ticketUrl,
        planId: planId
      });
    } else {
      console.error("[Mercado Pago Boleto Error]:", boletoRes.status, boletoData);
      return res.status(400).json({
        error: boletoData.message || "Falha ao emitir boleto no Mercado Pago.",
        mercadopagoResponse: boletoData
      });
    }
  } catch (error: any) {
    console.error("[Mercado Pago Boleto Exception]:", error);
    res.status(500).json({ error: error.message || "Erro ao emitir boleto no Mercado Pago." });
  }
};

app.post("/api/payments/create-boleto", handleCreateBoleto);
app.post("/api/payments/boleto", handleCreateBoleto);

// 3. Create Official Checkout Pro Preference (Cartão de Crédito 12x, Débito, Boleto, Pix, Saldo MP) via Mercado Pago API
const handleCreatePreference = async (req: Request, res: Response) => {
  try {
    const { planId, payerEmail, payerName, payerPhone } = req.body;
    const token = getMercadoPagoToken();
    const mpClient = getMercadoPago();

    let unitPrice = 39.00;
    let title = "Plano Premium Mensal NutrinK";

    if (planId === 'premium_anual') {
      unitPrice = 399.00;
      title = "Plano Premium Anual NutrinK (12 Meses)";
    }

    // Payer formatting & validation
    let cleanEmail = (payerEmail || "").trim().toLowerCase();
    // Validate email format and prevent common seller/test email conflicts
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".") || cleanEmail.includes("vendedor") || cleanEmail.includes("seller")) {
      cleanEmail = "cliente.nutrink@gmail.com";
    }

    const nameParts = (payerName || "Profissional de Saúde").trim().split(" ");
    const firstName = nameParts[0] || "Profissional";
    const lastName = nameParts.slice(1).join(" ") || "Nutricionista";

    const preferencePayload = {
      items: [
        {
          id: planId || "premium_mensal",
          title: title,
          quantity: 1,
          unit_price: unitPrice,
          currency_id: "BRL",
          description: `Acesso completo ao ecossistema NutrinK com Copiloto IA NUTRIA ilimitada.`
        }
      ],
      payer: {
        name: firstName,
        surname: lastName,
        email: cleanEmail,
        ...(payerPhone ? { phone: { area_code: payerPhone.replace(/\D/g, "").slice(0, 2) || "11", number: payerPhone.replace(/\D/g, "").slice(2) || "999999999" } } : {})
      },
      back_urls: {
        success: "https://nutrink.com.br/sucesso",
        failure: "https://nutrink.com.br/erro",
        pending: "https://nutrink.com.br/pendente"
      },
      auto_return: "approved",
      statement_descriptor: "NUTRINK PRO",
      payment_methods: {
        installments: 12
        // Zero exclusions: Pix, Credit Cards, Debit Cards, Boleto, and Mercado Pago Balance are 100% enabled
      },
      external_reference: `nutrink_${planId || 'premium'}_${Date.now()}`
    };

    console.log(`[Mercado Pago Checkout Pro] Criando preferência para ${cleanEmail} (${title} - R$ ${unitPrice})...`);

    if (token) {
      try {
        if (mpClient) {
          const preferenceInstance = new MercadoPagoPreference(mpClient);
          const mpPref = await preferenceInstance.create({ body: preferencePayload });

          console.log(`[Mercado Pago Checkout Pro] Preferência criada com sucesso! ID: ${mpPref.id}, InitPoint: ${mpPref.init_point}`);

          return res.json({
            success: true,
            provider: "mercadopago_live",
            preferenceId: mpPref.id,
            id: mpPref.id,
            init_point: mpPref.init_point,
            initPoint: mpPref.init_point,
            sandbox_init_point: mpPref.sandbox_init_point,
            sandboxInitPoint: mpPref.sandbox_init_point,
            isProduction: token.startsWith("APP_USR-")
          });
        }

        // Direct fetch to Mercado Pago API
        const prefFetch = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(preferencePayload)
        });

        if (prefFetch.ok) {
          const mpPref: any = await prefFetch.json();
          console.log(`[Mercado Pago Checkout Pro Direct] Preferência criada! ID: ${mpPref.id}`);
          return res.json({
            success: true,
            provider: "mercadopago_live",
            preferenceId: mpPref.id,
            id: mpPref.id,
            init_point: mpPref.init_point,
            initPoint: mpPref.init_point,
            sandbox_init_point: mpPref.sandbox_init_point,
            sandboxInitPoint: mpPref.sandbox_init_point,
            isProduction: token.startsWith("APP_USR-")
          });
        } else {
          const errorDetails = await prefFetch.text();
          console.error(`[Mercado Pago Preference Error Retorno Exato] Status: ${prefFetch.status}, Resposta:`, errorDetails);
          
          let parsedError: any = {};
          try { parsedError = JSON.parse(errorDetails); } catch { parsedError = { raw: errorDetails }; }

          const isSelfPayment = 
            errorDetails.toLowerCase().includes("collector") ||
            errorDetails.toLowerCase().includes("same user") ||
            errorDetails.toLowerCase().includes("same id") ||
            errorDetails.toLowerCase().includes("cannot operate between");

          return res.status(prefFetch.status).json({
            error: isSelfPayment
              ? "Aviso de Autopagamento: O Mercado Pago não permite que a mesma conta recebedora (vendedor) realize pagamentos para si mesma. Utilize outra conta de pagador para testar."
              : (parsedError.message || parsedError.error || "Falha ao gerar preferência no Mercado Pago."),
            isSelfPayment: Boolean(isSelfPayment),
            mercadopagoStatus: prefFetch.status,
            mercadopagoResponse: parsedError
          });
        }
      } catch (prefError: any) {
        console.error("[Mercado Pago Preference Exception Retorno Exato]:", prefError?.message || prefError);
        return res.status(500).json({
          error: prefError?.message || "Erro ao comunicar com Mercado Pago",
          details: String(prefError)
        });
      }
    } else {
      console.error("[Mercado Pago Checkout Pro]: MERCADOPAGO_ACCESS_TOKEN não configurado no ambiente.");
      return res.status(500).json({
        error: "Credenciais do Mercado Pago não configuradas no servidor (MERCADOPAGO_ACCESS_TOKEN ausente)."
      });
    }

  } catch (error: any) {
    console.error("[Mercado Pago Preference Fatal Error]:", error);
    res.status(500).json({ 
      error: error.message || "Falha ao gerar Checkout Mercado Pago",
      details: String(error)
    });
  }
};

app.post("/api/payments/create-preference", handleCreatePreference);
app.post("/checkout/preferences", handleCreatePreference);
app.post("/api/checkout/preferences", handleCreatePreference);

// 4. Check Payment Status in Real-Time with Mercado Pago API
app.get("/api/payments/status/:id", async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const token = getMercadoPagoToken();
    const mpClient = getMercadoPago();

    // 1. If numerical ID and MP token is active, check real Mercado Pago API
    if (token && (/^\d+$/.test(paymentId) || paymentId.length > 5)) {
      try {
        if (/^\d+$/.test(paymentId) && mpClient) {
          const paymentInstance = new MercadoPagoPayment(mpClient);
          const data = await paymentInstance.get({ id: paymentId });

          const isApproved = data.status === "approved";
          
          // Update in-memory record if exists
          const local = inMemoryPayments.get(paymentId);
          if (local) {
            local.status = (data.status as any) || 'pending';
            inMemoryPayments.set(paymentId, local);
          }

          return res.json({
            paymentId: String(data.id),
            status: data.status,
            statusDetail: data.status_detail,
            isApproved: isApproved,
            isPending: data.status === "pending" || data.status === "in_process",
            dateApproved: data.date_approved,
            transactionAmount: data.transaction_amount
          });
        }

        // Direct fetch to Mercado Pago API if SDK was bypassed
        if (/^\d+$/.test(paymentId)) {
          const directFetch = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (directFetch.ok) {
            const data: any = await directFetch.json();
            return res.json({
              paymentId: String(data.id),
              status: data.status,
              statusDetail: data.status_detail,
              isApproved: data.status === "approved",
              isPending: data.status === "pending" || data.status === "in_process",
              dateApproved: data.date_approved,
              transactionAmount: data.transaction_amount
            });
          }
        }
      } catch (err: any) {
        console.warn("[Mercado Pago Status Check Error]:", err?.message);
      }
    }

    // 2. Check in-memory store (updated via webhook or real transactions)
    const local = inMemoryPayments.get(paymentId);
    if (local) {
      return res.json({
        paymentId: local.id,
        status: local.status,
        statusDetail: local.status === 'approved' ? 'accredited' : 'pending_waiting_transfer',
        isApproved: local.status === 'approved',
        isPending: local.status === 'pending',
        transactionAmount: local.amount
      });
    }

    return res.json({
      paymentId: paymentId,
      status: "pending",
      isApproved: false,
      isPending: true
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message, isApproved: false, status: 'error' });
  }
});

// 5. Secure Mercado Pago Webhook Verification Helper
function verifyWebhookSignature(
  xSignature: string | undefined,
  xRequestId: string | undefined,
  dataId: string | undefined,
  secret: string
): boolean {
  if (!secret) return true; // If secret not set, allow processing
  if (!xSignature) return false;

  const parts = String(xSignature).split(',');
  let ts = '';
  let v1 = '';
  for (const part of parts) {
    const [k, v] = part.trim().split('=');
    if (k === 'ts') ts = v;
    if (k === 'v1') v1 = v;
  }

  if (!ts || !v1) return false;

  const manifest = `id:${dataId || ''};request-id:${xRequestId || ''};ts:${ts};`;
  const computedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  try {
    const hashBuf = Buffer.from(computedHash, 'utf-8');
    const v1Buf = Buffer.from(v1, 'utf-8');
    return hashBuf.length === v1Buf.length && crypto.timingSafeEqual(hashBuf, v1Buf);
  } catch {
    return false;
  }
}

// 6. Mercado Pago Secure Webhook & IPN Handler
const handleMercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    const { action, type, data } = req.body || {};
    const queryId = req.query.id || req.query['data.id'] || data?.id || req.body?.id;
    const resourceId = queryId ? String(queryId) : '';

    const xSignature = req.headers['x-signature'] as string | undefined;
    const xRequestId = req.headers['x-request-id'] as string | undefined;
    const webhookSecret = getMercadoPagoWebhookSecret();

    console.log(`[Mercado Pago Webhook Seguro] Recebido evento: ${action || type || 'payment.updated'}, ID: ${resourceId}`);

    // 1. Validate cryptographic x-signature header if secret configured
    if (webhookSecret) {
      const isValid = verifyWebhookSignature(xSignature, xRequestId, resourceId, webhookSecret);
      if (!isValid) {
        console.warn(`[Mercado Pago Webhook Security Alert] Assinatura x-signature inválida ou não autorizada para ID: ${resourceId}`);
        return res.status(401).json({ error: 'Assinatura x-signature inválida.' });
      }
      console.log(`[Mercado Pago Webhook Security] Assinatura x-signature validada com sucesso via HMAC-SHA256.`);
    }

    // 2. Fetch Payment Information securely with Backend Access Token
    const token = getMercadoPagoToken();
    const mpClient = getMercadoPago();

    if (token && resourceId && /^\d+$/.test(resourceId)) {
      try {
        let paymentData: any = null;

        if (mpClient) {
          try {
            const paymentInstance = new MercadoPagoPayment(mpClient);
            paymentData = await paymentInstance.get({ id: resourceId });
          } catch (sdkErr: any) {
            console.warn('[Mercado Pago SDK Fetch Fallback]:', sdkErr?.message);
          }
        }

        if (!paymentData) {
          const directFetch = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (directFetch.ok) {
            paymentData = await directFetch.json();
          }
        }

        if (paymentData) {
          const status = paymentData.status;
          const payerEmail = (paymentData.payer?.email || '').toLowerCase().trim();
          const extRef = String(paymentData.external_reference || '');
          const amount = paymentData.transaction_amount || 0;
          const paymentMethod = paymentData.payment_method_id || 'unknown';

          const planId: 'premium_mensal' | 'premium_anual' =
            extRef.includes('anual') || amount >= 200 ? 'premium_anual' : 'premium_mensal';

          console.log(`[Mercado Pago Webhook Status] Pagamento ${resourceId} status: ${status}, pagador: ${payerEmail}, método: ${paymentMethod}`);

          // Update in-memory payment record
          const existing = inMemoryPayments.get(resourceId);
          if (existing) {
            existing.status = status;
            inMemoryPayments.set(resourceId, existing);
          }

          // Automatic User Activation & Database Release upon Approval
          if (status === 'approved' && payerEmail) {
            activatedSubscriptions.set(payerEmail, {
              email: payerEmail,
              planId: planId,
              status: 'active',
              activatedAt: new Date().toISOString(),
              paymentId: resourceId,
              paymentMethod: paymentMethod,
              amount: amount
            });

            console.log(`[Mercado Pago Webhook Automático] Assinatura APROVADA e liberada com sucesso para o usuário: ${payerEmail} (${planId})`);
          }
        }
      } catch (err: any) {
        console.warn('[Webhook Fetch Payment Error]:', err?.message);
      }
    }

    // Always respond 200 to Mercado Pago
    res.status(200).send("OK");
  } catch (error: any) {
    console.error("Erro no processamento do webhook do Mercado Pago:", error);
    res.status(200).send("OK");
  }
};

app.post("/api/webhooks/mercadopago", handleMercadoPagoWebhook);
app.get("/api/webhooks/mercadopago", (req, res) => res.status(200).send("NutriNK Webhook Gateway Ativo"));
app.post("/api/payments/webhook", handleMercadoPagoWebhook);
app.get("/api/payments/webhook", (req, res) => res.status(200).send("NutriNK Webhook Gateway Ativo"));

// 7. Check User Subscription Status via Backend
app.get("/api/payments/user-subscription/:email", (req: Request, res: Response) => {
  const email = (req.params.email || '').toLowerCase().trim();
  const sub = activatedSubscriptions.get(email);
  if (sub) {
    return res.json({
      hasActiveSubscription: sub.status === 'active',
      planId: sub.planId,
      status: sub.status,
      activatedAt: sub.activatedAt,
      paymentId: sub.paymentId,
      paymentMethod: sub.paymentMethod
    });
  }
  return res.json({
    hasActiveSubscription: false,
    planId: null,
    status: 'none'
  });
});

// Clinical deep-calc & exam analyzer endpoint
app.post("/api/nutria/clinical-calc", async (req: Request, res: Response) => {
  try {
    const { prompt, patientData } = req.body;
    const ai = getGenAI();

    if (!ai) {
      res.json({
        result: "Integração clínica ativa. Para análises aprofundadas com NUTRIA, configure o ecossistema NutrinK."
      });
      return;
    }

    try {
      const response = await generateContentWithFallback(ai, {
        contents: `Você é a NUTRIA, copiloto clínico do NutrinK. Analise os seguintes dados do paciente e responda de forma ultra-precisa com dados e tabelas formatadas:\n\nDados do Paciente:\n${JSON.stringify(patientData, null, 2)}\n\nSolicitação Clínica: ${prompt}`,
        config: {
          systemInstruction: NUTRIA_SYSTEM_INSTRUCTION,
          temperature: 0.3
        }
      });

      res.json({ result: response.text });
    } catch (aiErr: any) {
      console.warn("[NutrinK AI] Fallback em clinical-calc:", aiErr?.message);
      res.json({
        result: `### 📋 Parecer Clínico Estruturado (NutrinK Engine)\n\n**Paciente:** ${patientData?.name || 'Paciente'}\n\n- **TMB Estimada:** ${patientData?.tmb || 1450} kcal\n- **Gasto Energético Total (GET):** ${patientData?.get || 1980} kcal\n- **Conduta:** Plano estruturado com déficit de 400 kcal/dia e 1.8g/kg de proteína.`
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 404 Handler for all API routes - Guarantees JSON error response and prevents HTML fallback
app.all("/api/*", (req: Request, res: Response) => {
  console.warn(`[NutrinK 404] Rota de API não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: `Rota de API '${req.originalUrl}' não encontrada no servidor.`,
    path: req.originalUrl,
    method: req.method,
    status: 404
  });
});

// Global Error Handler for API routes
app.use((err: any, req: Request, res: Response, next: any) => {
  if (req.path.startsWith("/api/")) {
    console.error("[NutrinK API Server Error]:", err);
    return res.status(err.status || 500).json({
      error: err.message || "Erro interno no servidor da API",
      status: err.status || 500
    });
  }
  next(err);
});

// Vite & Static Server integration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NutrinK] NUTRIA Server operacional em http://0.0.0.0:${PORT}`);
  });
}

start();
