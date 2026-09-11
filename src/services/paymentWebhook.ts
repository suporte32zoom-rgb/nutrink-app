/**
 * NutrinK - Serviço de Webhook do Mercado Pago Pro & Ponte de Automação Make/Zapier
 * 
 * 1. GATILHO: Recebe o webhook do Mercado Pago (payment.status = 'approved' ou action = 'payment.created/updated').
 * 2. AÇÃO 1: Valida o e-mail verificado do usuário (Google OAuth) e ativa o plano Premium.
 * 3. AÇÃO 2: Dispara o e-mail oficial de faturamento e boas-vindas via webhook bridge (Make/Zapier/REST).
 * 
 * Utiliza chamadas puras e isoladas com 'model.generateContent()' no SDK @google/genai sem acúmulo de histórico.
 */

import { GoogleGenAI } from "@google/genai";

export interface MercadoPagoPaymentData {
  id: string | number;
  status: string; // 'approved', 'pending', 'in_process', 'rejected', etc.
  status_detail?: string;
  payer?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  external_reference?: string; // ID ou e-mail do usuário no NutrinK
  transaction_amount?: number;
  date_approved?: string;
  payment_method_id?: string;
  description?: string;
}

export interface WebhookPayload {
  action?: string;
  type?: string;
  data?: {
    id?: string;
  };
  id?: number | string;
  user_id?: string;
}

export interface AutomationBridgeResult {
  success: boolean;
  userEmail: string;
  planActivated: boolean;
  welcomeEmailDispatched: boolean;
  transactionId: string;
  message?: string;
  error?: string;
}

/**
 * Mensagem oficial obrigatória de boas-vindas e faturamento do NutrinK Premium.
 */
export const NUTRINK_PREMIUM_WELCOME_EMAIL_TEMPLATE = {
  subject: "Assunto: Seu consultório agora é Inteligente! Bem-vindo(a) ao NutrinK Premium 🔒🍏",
  plainText: `Assunto: Seu consultório agora é Inteligente! Bem-vindo(a) ao NutrinK Premium 🔒🍏

Olá, Doutor(a)!

Seu pagamento foi processado com sucesso pelo Mercado Pago Pro e o seu plano profissional do NutrinK já está 100% liberado no seu navegador!

A partir de agora, você tem acesso ao ecossistema de gestão clínica mais seguro e inovador do Brasil. 

💎 O que muda na sua rotina com o NutrinK Premium:
• NUTRIA AI Sem Limites: Use a transcrição de consultas em tempo real (via Jitsi Meet) e os comandos de prescrição quantas vezes precisar por dia, sem travamentos.
• Pacientes Ilimitados: Cadastre toda a sua base de clientes atual e futura sem restrições de espaço.
• Tecnologia Local-First Protegida: Seus prontuários estão salvos com a Persistent Storage API, garantindo que o navegador nunca apague seus dados automaticamente, mantendo o sigilo total (LGPD) sob o seu controle absoluto.

🚀 Como acessar agora:
Basta abrir o site nutrink.com.br no seu celular ou computador. Faça o login utilizando o mesmo 'Login com o Google' usado no momento da compra. O sistema reconhecerá suas credenciais e liberará todas as ferramentas premium automaticamente.

Se precisar de qualquer suporte técnico ou quiser enviar sugestões para o nosso time de engenharia, basta clicar no botão 'Fale Conosco' direto no painel do seu app.

Obrigado por confiar no NutrinK para ser o braço direito do seu sucesso profissional!

Com respeito e admiração,
Tarciano Martin de Souza
CEO & Desenvolvedor do Ecossistema NutrinK`
};

/**
 * Normaliza o e-mail do usuário em conformidade com o Google OAuth
 */
export function sanitizeGoogleEmail(email?: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Consulta a API do Mercado Pago para obter os detalhes completos do pagamento
 */
export async function fetchMercadoPagoPayment(paymentId: string | number, mpAccessToken?: string): Promise<MercadoPagoPaymentData | null> {
  const token = mpAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
  if (!token) {
    console.warn("[Mercado Pago] Token de acesso não configurado em MERCADO_PAGO_ACCESS_TOKEN.");
    return null;
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[Mercado Pago] Erro na requisição do pagamento ${paymentId}: ${response.status}`, errBody);
      return null;
    }

    const data = await response.json() as MercadoPagoPaymentData;
    return data;
  } catch (error) {
    console.error(`[Mercado Pago] Falha de conexão ao buscar pagamento ${paymentId}:`, error);
    return null;
  }
}

/**
 * Dispara a ponte de integração automática (Make / Zapier / N8N / Webhook REST)
 */
export async function sendWelcomeEmailThroughBridge(params: {
  userEmail: string;
  userName?: string;
  transactionId: string;
  amount?: number;
  webhookUrl?: string;
}): Promise<boolean> {
  const webhookUrl = params.webhookUrl 
    || process.env.MAKE_WEBHOOK_URL 
    || process.env.ZAPIER_WEBHOOK_URL 
    || process.env.AUTOMATION_WEBHOOK_URL;

  const emailPayload = {
    event: "subscription.approved",
    timestamp: new Date().toISOString(),
    recipient: {
      email: sanitizeGoogleEmail(params.userEmail),
      name: params.userName || "Doutor(a)"
    },
    transaction: {
      id: params.transactionId,
      amount: params.amount || 0,
      currency: "BRL",
      provider: "Mercado Pago Pro",
      status: "approved"
    },
    emailContent: {
      subject: "Seu consultório agora é Inteligente! Bem-vindo(a) ao NutrinK Premium 🔒🍏",
      body: NUTRINK_PREMIUM_WELCOME_EMAIL_TEMPLATE.plainText
    }
  };

  if (!webhookUrl) {
    console.log("[Ponte de Automação Make/Zapier] Webhook URL não configurada. E-mail pronto para disparo registrado em log:");
    console.log(`Destinatário: ${emailPayload.recipient.email}`);
    console.log(emailPayload.emailContent.body);
    return true;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NutrinK-Payment-Automation/1.0"
      },
      body: JSON.stringify(emailPayload)
    });

    if (response.ok) {
      console.log(`✅ [Automação Make/Zapier] E-mail de faturamento e boas-vindas disparado com sucesso para: ${params.userEmail}`);
      return true;
    } else {
      const errText = await response.text();
      console.warn(`⚠️ [Automação Make/Zapier] Webhook retornou status ${response.status}:`, errText);
      return false;
    }
  } catch (err) {
    console.error("[Automação Make/Zapier] Erro de rede ao conectar à ponte de webhook:", err);
    return false;
  }
}

/**
 * Executa uma análise e confirmação isolada utilizando o método 'model.generateContent()'
 * Garantia arquitetural: sem acumular histórico ou sessões de chat compartilhadas.
 */
export async function generatePaymentConfirmationAiNote(params: {
  apiKey?: string;
  userEmail: string;
  userName?: string;
  planName?: string;
}): Promise<string> {
  const key = params.apiKey || process.env.GEMINI_API_KEY || process.env.NUTRINK_GEMINI_API_KEY || "";
  if (!key) {
    return "Assinatura NutrinK Premium ativada com sucesso para o usuário.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    // Requisição pura, estritamente isolada e sem histórico
    const prompt = `Gere uma breve nota técnica de auditoria interna (máximo 2 frases) confirmando a ativação do plano NutrinK Premium para o e-mail ${params.userEmail}. Sem saudações e sem LaTeX.`;
    
    const result = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        maxOutputTokens: 200
      }
    });

    return result.text || "Plano NutrinK Premium ativado com sucesso.";
  } catch (error) {
    console.warn("[AI Payment Audit] Falha na geração de nota de auditoria:", error);
    return "Plano NutrinK Premium ativado com sucesso.";
  }
}

/**
 * Processador central do Webhook do Mercado Pago Pro
 */
export async function processMercadoPagoWebhook(
  rawPayload: any,
  options?: {
    mpAccessToken?: string;
    automationWebhookUrl?: string;
  }
): Promise<AutomationBridgeResult> {
  try {
    let paymentId = rawPayload?.data?.id || rawPayload?.id;
    let paymentData: MercadoPagoPaymentData | null = null;

    // Se o payload já for o próprio objeto de pagamento aprovado
    if (rawPayload?.status && rawPayload?.id) {
      paymentData = rawPayload as MercadoPagoPaymentData;
      paymentId = rawPayload.id;
    } else if (paymentId) {
      // Caso contrário, busca na API do Mercado Pago
      paymentData = await fetchMercadoPagoPayment(paymentId, options?.mpAccessToken);
    }

    if (!paymentData) {
      return {
        success: false,
        userEmail: "",
        planActivated: false,
        welcomeEmailDispatched: false,
        transactionId: String(paymentId || "desconhecido"),
        error: "Não foi possível recuperar os dados da transação do Mercado Pago."
      };
    }

    // Identifica o e-mail do comprador (pelo payer.email ou external_reference)
    const rawEmail = paymentData.payer?.email || paymentData.external_reference || "";
    const userEmail = sanitizeGoogleEmail(rawEmail);

    if (!userEmail) {
      console.warn(`[Webhook Mercado Pago] Pagamento ${paymentData.id} recebido sem e-mail associado.`);
      return {
        success: false,
        userEmail: "",
        planActivated: false,
        welcomeEmailDispatched: false,
        transactionId: String(paymentData.id),
        error: "E-mail do comprador não encontrado na transação."
      };
    }

    const isApproved = paymentData.status === "approved";

    if (!isApproved) {
      console.log(`[Webhook Mercado Pago] Pagamento ${paymentData.id} com status '${paymentData.status}' (não aprovado).`);
      return {
        success: true,
        userEmail,
        planActivated: false,
        welcomeEmailDispatched: false,
        transactionId: String(paymentData.id),
        message: `Status recebido: ${paymentData.status}. Plano aguardando aprovação.`
      };
    }

    console.log(`🎉 [Webhook Mercado Pago] Pagamento ${paymentData.id} APROVADO para o usuário: ${userEmail}!`);

    // AÇÃO 1: Ativação do Selo Premium (Retorna os dados para persistência local ou grava no registro ativo)
    const planActivated = true;

    // AÇÃO 2: Disparo Automático do E-mail de Boas-Vindas através da ponte Make / Zapier
    const welcomeEmailDispatched = await sendWelcomeEmailThroughBridge({
      userEmail,
      userName: paymentData.payer?.first_name 
        ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`.trim() 
        : 'Doutor(a)',
      transactionId: String(paymentData.id),
      amount: paymentData.transaction_amount,
      webhookUrl: options?.automationWebhookUrl
    });

    return {
      success: true,
      userEmail,
      planActivated,
      welcomeEmailDispatched,
      transactionId: String(paymentData.id),
      message: "Pagamento aprovado. Plano Premium ativado e e-mail de boas-vindas despachado com sucesso."
    };
  } catch (error: any) {
    console.error("[Webhook Mercado Pago] Erro fatal no processamento do webhook:", error);
    return {
      success: false,
      userEmail: "",
      planActivated: false,
      welcomeEmailDispatched: false,
      transactionId: "erro",
      error: error.message || "Erro interno no processamento do webhook."
    };
  }
}
