import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  CreditCard, 
  Wallet,
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  AlertCircle, 
  X, 
  Lock, 
  RefreshCw,
  Crown,
  Barcode,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionPlan, UserAccount } from '../types';
import { MercadoPagoLogo } from './MercadoPagoLogo';
import { safeFetchJson } from '../utils/api';
import { createCardTokenClient, getMercadoPagoClient } from '../services/mercadoPagoClient';

interface MercadoPagoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: 'premium_mensal' | 'premium_anual';
  billingCycle: 'monthly' | 'annual';
  userAccount: UserAccount;
  onPaymentSuccess: (plan: SubscriptionPlan) => void;
  customAmount?: number;
  customTitle?: string;
}

interface PaymentConfig {
  configured: boolean;
  isProduction: boolean;
  isSandbox: boolean;
  environment: string;
  publicKey: string;
  clientId?: string;
}

interface PixData {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  amount: number;
  expiresAt: string;
  provider: string;
  isProduction: boolean;
  ticketUrl?: string;
}

interface BoletoData {
  paymentId: string;
  barcode: string;
  digitableLine: string;
  ticketUrl: string;
  amount: number;
  status: string;
}

export const MercadoPagoCheckoutModal: React.FC<MercadoPagoCheckoutModalProps> = ({
  isOpen,
  onClose,
  planId,
  billingCycle,
  userAccount,
  onPaymentSuccess,
  customAmount,
  customTitle
}) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'credit' | 'debit' | 'boleto' | 'pro'>('pix');
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  
  // PIX State
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isVerifyingPix, setIsVerifyingPix] = useState(false);
  
  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState(userAccount?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState(userAccount?.cpf || '');
  const [installments, setInstallments] = useState('1');
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardBrand, setCardBrand] = useState<'visa' | 'master' | 'elo' | 'amex' | 'hipercard' | 'unknown'>('unknown');

  // Boleto State
  const [isLoadingBoleto, setIsLoadingBoleto] = useState(false);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [copiedBoleto, setCopiedBoleto] = useState(false);

  // Checkout Pro State
  const [preferenceUrl, setPreferenceUrl] = useState<string | null>(null);
  const [isLoadingPreference, setIsLoadingPreference] = useState(false);

  // Common Feedback State
  const [isApproved, setIsApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pollingIntervalRef = useRef<any>(null);

  const planAmount = customAmount && customAmount > 0 
    ? customAmount 
    : (planId === 'premium_anual' ? 399.00 : 39.00);

  const planName = customTitle 
    ? customTitle 
    : (planId === 'premium_anual' ? 'Plano Premium Anual (12 Meses)' : 'Plano Premium Mensal');

  // Load payment config on mount
  useEffect(() => {
    if (!isOpen) return;

    safeFetchJson<PaymentConfig>('/api/payments/config')
      .then(res => {
        if (res.ok && res.data) {
          setPaymentConfig(res.data);
        } else {
          setPaymentConfig({
            configured: true,
            isProduction: true,
            isSandbox: false,
            environment: 'production',
            publicKey: 'APP_USR-6b91cf33-8b1c-4b47-9f9e-3ae02649e209'
          });
        }
      })
      .catch(() => {
        setPaymentConfig({
          configured: true,
          isProduction: true,
          isSandbox: false,
          environment: 'production',
          publicKey: 'APP_USR-6b91cf33-8b1c-4b47-9f9e-3ae02649e209'
        });
      });
  }, [isOpen]);

  // Initialize MercadoPago.js frontend SDK when config is ready
  useEffect(() => {
    if (paymentConfig?.publicKey) {
      getMercadoPagoClient(paymentConfig.publicKey).catch((err) => {
        console.warn('[MercadoPago.js] Inicialização do SDK no modal:', err);
      });
    }
  }, [paymentConfig]);

  // Generate PIX and Preference when modal opens or plan changes
  useEffect(() => {
    if (!isOpen) return;
    generatePixPayment();
    generatePreference();
  }, [isOpen, planId, customAmount]);

  // Pix timer countdown
  useEffect(() => {
    if (!isOpen || !pixData || isApproved) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, pixData, isApproved]);

  // Real-time polling for PIX status via Mercado Pago API
  useEffect(() => {
    if (!isOpen || !pixData || isApproved || !pixData.paymentId) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await safeFetchJson<{ isApproved?: boolean; status?: string }>(`/api/payments/status/${pixData.paymentId}`);
        if (res.ok && res.data) {
          const data = res.data;
          if (data.isApproved || data.status === 'approved') {
            handleSuccessConfirmation();
          }
        }
      } catch {
        // Ignore polling network glitches
      }
    }, 3500);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [isOpen, pixData, isApproved]);

  // Detect card brand automatically
  const detectCardBrand = (number: string) => {
    const clean = number.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'master';
    if (/^(4011|438935|451416|4576|504175|5067|5090|627780|636297|636368)/.test(clean)) return 'elo';
    if (/^3[47]/.test(clean)) return 'amex';
    if (/^(606282|3841)/.test(clean)) return 'hipercard';
    return 'unknown';
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    setCardBrand(detectCardBrand(raw));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    setCardCpf(v);
  };

  // 1. Generate PIX Transparente
  const generatePixPayment = async () => {
    setIsLoadingPix(true);
    setErrorMessage(null);

    try {
      const response = await safeFetchJson<any>('/api/payments/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId,
          customAmount: customAmount,
          payerEmail: userAccount.email || 'contato@nutrink.com.br',
          payerName: userAccount.name || 'Profissional de Saúde',
          payerCpf: cardCpf.replace(/\D/g, '') || undefined
        })
      });

      if (response.ok && response.data) {
        const serverData = response.data;
        if (serverData && (serverData.qrCode || serverData.paymentId)) {
          setPixData(serverData);
          setTimeLeft(15 * 60);
          return;
        }
      } else {
        setErrorMessage(response.error || 'Falha ao comunicar com o Mercado Pago.');
      }
    } catch {
      setErrorMessage('Erro de conexão ao gerar o PIX no Mercado Pago.');
    } finally {
      setIsLoadingPix(false);
    }
  };

  // 2. Process Card Transparente (Credit / Debit)
  const handleProcessCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNumber = cardNumber.replace(/\D/g, '');
    const cleanCpf = cardCpf.replace(/\D/g, '');
    const cleanCvv = cardCvv.replace(/\D/g, '');
    const [expMonth, expYear] = cardExpiry.split('/');

    if (cleanNumber.length < 13) {
      setErrorMessage('Por favor, informe o número completo do cartão.');
      return;
    }
    if (!cardholderName.trim()) {
      setErrorMessage('Informe o nome do titular como está impresso no cartão.');
      return;
    }
    if (!expMonth || !expYear || expMonth.length !== 2) {
      setErrorMessage('Informe a validade do cartão no formato MM/AA.');
      return;
    }
    if (cleanCvv.length < 3) {
      setErrorMessage('Informe o código de segurança (CVV) de 3 ou 4 dígitos.');
      return;
    }
    if (cleanCpf.length < 11) {
      setErrorMessage('Informe um CPF válido para a emissão do comprovante fiscal.');
      return;
    }

    setIsProcessingCard(true);

    try {
      // 1. Captura de token do cartão de crédito via MercadoPago.js diretamente no cliente
      let clientToken: string | undefined = undefined;
      try {
        const tokenRes = await createCardTokenClient({
          cardNumber: cleanNumber,
          cardholderName: cardholderName.trim(),
          cardExpirationMonth: expMonth,
          cardExpirationYear: expYear.length === 2 ? `20${expYear}` : expYear,
          securityCode: cleanCvv,
          identificationType: 'CPF',
          identificationNumber: cleanCpf
        }, paymentConfig?.publicKey);

        if (tokenRes && tokenRes.id) {
          clientToken = tokenRes.id;
        }
      } catch (tokenErr) {
        console.warn('[MercadoPago.js] Tokenização no cliente avisou fallback:', tokenErr);
      }

      // 2. Processa a transação enviando o token gerado pelo SDK do frontend
      const response = await safeFetchJson<any>('/api/payments/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: clientToken,
          cardNumber: cleanNumber,
          cardholderName: cardholderName.trim(),
          cardExpirationMonth: expMonth,
          cardExpirationYear: expYear.length === 2 ? `20${expYear}` : expYear,
          securityCode: cleanCvv,
          identificationType: 'CPF',
          identificationNumber: cleanCpf,
          installments: Number(installments) || 1,
          paymentMethodId: cardBrand === 'unknown' ? 'credit_card' : cardBrand,
          payerEmail: userAccount.email || 'cliente.nutrink@gmail.com',
          payerName: cardholderName.trim(),
          planId: planId,
          customAmount: customAmount
        })
      });

      if (response.ok && response.data?.success) {
        const data = response.data;
        if (data.isApproved || data.status === 'approved') {
          handleSuccessConfirmation();
        } else if (data.status === 'in_process') {
          setSuccessMessage('Pagamento em análise pelo Mercado Pago. Sua conta será ativada automaticamente em instantes.');
        } else {
          setErrorMessage(data.message || 'Transação não aprovada pela operadora.');
        }
      } else {
        setErrorMessage(response.error || response.data?.error || 'Não foi possível processar o cartão. Verifique os dados e tente novamente.');
      }
    } catch {
      setErrorMessage('Erro de conexão ao processar o cartão no Mercado Pago.');
    } finally {
      setIsProcessingCard(false);
    }
  };

  // 3. Generate Boleto Transparente
  const handleGenerateBoleto = async () => {
    setIsLoadingBoleto(true);
    setErrorMessage(null);

    try {
      const response = await safeFetchJson<any>('/api/payments/create-boleto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId,
          customAmount: customAmount,
          payerEmail: userAccount.email || 'contato@nutrink.com.br',
          payerName: userAccount.name || cardholderName || 'Profissional de Saúde',
          payerCpf: cardCpf.replace(/\D/g, '') || undefined
        })
      });

      if (response.ok && response.data) {
        setBoletoData(response.data);
      } else {
        setErrorMessage(response.error || 'Falha ao emitir boleto no Mercado Pago.');
      }
    } catch {
      setErrorMessage('Erro de conexão ao emitir boleto.');
    } finally {
      setIsLoadingBoleto(false);
    }
  };

  // 4. Generate Preference for Checkout Pro
  const generatePreference = async () => {
    setIsLoadingPreference(true);

    try {
      const response = await safeFetchJson<any>('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId,
          payerEmail: userAccount.email || 'cliente.nutrink@gmail.com',
          payerName: userAccount.name || 'Profissional NutrinK'
        })
      });

      if (response.ok && response.data) {
        const data = response.data;
        const initPoint = data.init_point || data.initPoint || data.sandbox_init_point;
        if (initPoint) setPreferenceUrl(initPoint);
      }
    } catch {
      // Preference fallback error
    } finally {
      setIsLoadingPreference(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCopyBoleto = () => {
    if (!boletoData?.digitableLine) return;
    navigator.clipboard.writeText(boletoData.digitableLine);
    setCopiedBoleto(true);
    setTimeout(() => setCopiedBoleto(false), 3000);
  };

  const handleManualCheck = async () => {
    if (!pixData?.paymentId) return;
    setIsVerifyingPix(true);
    setErrorMessage(null);

    try {
      const res = await safeFetchJson<{ isApproved?: boolean; status?: string }>(`/api/payments/status/${pixData.paymentId}`);
      if (res.ok && res.data) {
        const data = res.data;
        if (data.isApproved || data.status === 'approved') {
          handleSuccessConfirmation();
          return;
        }
      }
      setErrorMessage('Pagamento ainda não confirmado pelo Mercado Pago. Aguarde alguns instantes ou conclua a transferência.');
    } catch {
      setErrorMessage('Erro ao consultar status do pagamento.');
    } finally {
      setIsVerifyingPix(false);
    }
  };

  const handleSuccessConfirmation = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    setIsApproved(true);
    
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {}

    setTimeout(() => {
      onPaymentSuccess(planId);
      onClose();
    }, 2800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c0438] via-[#14022a] to-[#0d011c] border border-purple-800/70 rounded-3xl shadow-2xl overflow-hidden text-white my-auto shadow-purple-950/90">
        
        {/* Top Header Bar */}
        <div className="relative p-5 sm:p-6 border-b border-purple-800/40 bg-gradient-to-r from-purple-950/90 via-[#27064d]/90 to-purple-950/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-[#009EE3] p-0.5 shadow-lg shadow-fuchsia-950/50">
                <div className="w-full h-full bg-[#1b0336] rounded-[14px] flex items-center justify-center text-fuchsia-400 font-black">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Checkout Transparente Oficial
                  </h3>
                  <span className="bg-[#009EE3]/20 border border-[#009EE3]/60 text-[#009EE3] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#009EE3]" />
                    <span>Mercado Pago</span>
                  </span>
                </div>
                <p className="text-xs text-purple-200">
                  {planName} • <strong className="text-emerald-400">R$ {planAmount.toFixed(2).replace('.', ',')}</strong> {billingCycle === 'annual' ? '/ano' : '/mês'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-purple-300 hover:text-white rounded-xl hover:bg-purple-900/40 transition-all"
              id="btn-close-checkout-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Security Environment Badge */}
          <div className="mt-3 flex items-center justify-between text-[11px] bg-[#120223] px-3 py-1.5 rounded-xl border border-purple-800/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-purple-200">Gateway:</span>
              <span className="font-bold text-emerald-400">
                Mercado Pago Produção (Checkout Transparente)
              </span>
            </div>
            <div className="flex items-center gap-1 text-purple-300 font-mono text-[10px]">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Criptografia 256-Bit SSL</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Payment Approved View */}
          {isApproved ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce shadow-xl shadow-emerald-950/50">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">Pagamento Aprovado no Mercado Pago!</h4>
                <p className="text-sm text-emerald-300 font-medium">
                  Sua assinatura NutrinK Pro foi ativada com sucesso.
                </p>
              </div>
              <p className="text-xs text-purple-300">
                Liberando todos os recursos do consultório em instantes...
              </p>
            </div>
          ) : (
            <>
              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#120224] rounded-2xl border border-purple-800/40">
                {/* Tab 1: PIX */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('pix'); setErrorMessage(null); }}
                  className={`py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'pix'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                  }`}
                  id="tab-select-pix"
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>Pix Instantâneo</span>
                </button>

                {/* Tab 2: Cartão de Crédito Transparente */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('credit'); setErrorMessage(null); }}
                  className={`py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'credit'
                      ? 'bg-gradient-to-r from-[#009EE3] to-[#0074A8] text-white shadow-lg shadow-cyan-950/50'
                      : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                  }`}
                  id="tab-select-credit"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Cartão até 12x</span>
                </button>

                {/* Tab 3: Boleto Bancário */}
                <button
                  type="button"
                  onClick={() => { 
                    setActiveTab('boleto'); 
                    setErrorMessage(null);
                    if (!boletoData) handleGenerateBoleto();
                  }}
                  className={`py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'boleto'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-950/50'
                      : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                  }`}
                  id="tab-select-boleto"
                >
                  <Barcode className="w-4 h-4 shrink-0" />
                  <span>Boleto</span>
                </button>

                {/* Tab 4: Checkout Pro Link */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('pro'); setErrorMessage(null); }}
                  className={`py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'pro'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950/50'
                      : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                  }`}
                  id="tab-select-pro"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Site Mercado Pago</span>
                </button>
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Info Notification */}
              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 1: PIX INSTANTÂNEO TRANSPARENTE                        */}
              {/* ========================================================= */}
              {activeTab === 'pix' && (
                <div className="space-y-4">
                  {isLoadingPix ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-purple-200 font-medium">Gerando cobrança PIX oficial no Mercado Pago...</p>
                    </div>
                  ) : pixData ? (
                    <div className="space-y-4">
                      
                      {/* Timer & Waiting status banner */}
                      <div className="flex items-center justify-between text-xs bg-[#190432] p-3 rounded-xl border border-purple-800/40 flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          <span>Aguardando transferência Pix em tempo real...</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-300 font-mono font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Expira em {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                        </div>
                      </div>

                      {/* QR Code Canvas */}
                      <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-2xl flex flex-col items-center justify-center border-4 border-[#009EE3]/40 relative">
                        <div className="mb-2 flex items-center gap-1.5 bg-[#009EE3] text-white px-3 py-1 rounded-full text-[11px] font-black shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Mercado Pago • Pix Transparente</span>
                        </div>

                        {pixData.qrCodeBase64 ? (
                          <div className="relative">
                            <img 
                              src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                              alt="QR Code PIX Mercado Pago"
                              className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center text-slate-800 font-bold text-xs text-center p-2">
                            QR Code PIX Mercado Pago
                          </div>
                        )}

                        <div className="text-center mt-2 space-y-0.5">
                          <span className="text-base text-slate-900 font-black block">
                            R$ {planAmount.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[11px] text-slate-600 font-semibold block">
                            Aponte a câmera do aplicativo do seu banco
                          </span>
                        </div>
                      </div>

                      {/* Pix Copia e Cola field */}
                      {pixData.qrCode && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple-200 flex items-center justify-between flex-wrap gap-1">
                            <span>Código PIX Copia e Cola:</span>
                            <span className="text-[11px] text-purple-400 font-normal">Padrão BACEN Oficial</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text"
                              readOnly
                              value={pixData.qrCode}
                              className="w-full bg-[#17032c] border border-purple-700/60 rounded-xl px-3 py-2.5 text-xs text-purple-200 font-mono focus:outline-none select-all truncate"
                            />
                            <button
                              type="button"
                              onClick={handleCopyPix}
                              className={`px-4 py-2.5 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all ${
                                copiedPix
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-gradient-to-r from-fuchsia-600 to-[#009EE3] hover:from-fuchsia-500 hover:to-[#0089C7] text-white shadow-md'
                              }`}
                              id="btn-copy-pix-complete"
                            >
                              {copiedPix ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copiar Pix</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions: Manual Verify */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="button"
                          onClick={handleManualCheck}
                          disabled={isVerifyingPix}
                          className="w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/60 transform hover:scale-[1.01] active:scale-[0.99]"
                          id="btn-verify-pix-payment"
                        >
                          <RefreshCw className={`w-4 h-4 ${isVerifyingPix ? 'animate-spin' : ''}`} />
                          <span>
                            {isVerifyingPix 
                              ? 'Consultando Mercado Pago em tempo real...' 
                              : 'Já realizei o Pix • Verificar Pagamento'}
                          </span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <button
                        onClick={generatePixPayment}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                      >
                        Tentar Novamente Gerar PIX
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: CARTÃO DE CRÉDITO TRANSPARENTE (1X ATÉ 12X)         */}
              {/* ========================================================= */}
              {activeTab === 'credit' && (
                <form onSubmit={handleProcessCardPayment} className="space-y-4">
                  
                  {/* Visual Card Preview */}
                  <div className="bg-gradient-to-r from-[#2a084e] via-[#1a0533] to-[#0f021f] border border-cyan-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MercadoPagoLogo variant="icon" className="w-5 h-5" />
                        <span className="text-xs font-black text-white">Cartão de Crédito</span>
                      </div>
                      <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-900/60 text-cyan-300 border border-purple-700/50">
                        {cardBrand === 'unknown' ? 'Cartão' : cardBrand.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="font-mono text-base sm:text-lg tracking-widest text-white font-bold">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex items-center justify-between text-xs text-purple-200">
                        <span className="uppercase font-semibold truncate max-w-[200px]">
                          {cardholderName || 'NOME DO TITULAR'}
                        </span>
                        <span className="font-mono font-bold">
                          {cardExpiry || 'MM/AA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="space-y-3 text-xs">
                    
                    {/* Número do Cartão */}
                    <div>
                      <label className="block text-purple-200 font-bold mb-1">
                        Número do Cartão
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-[#16032a] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                          maxLength={19}
                          id="input-card-number"
                        />
                        <div className="absolute right-3 top-2.5 text-purple-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Nome do Titular */}
                    <div>
                      <label className="block text-purple-200 font-bold mb-1">
                        Nome Impresso no Cartão
                      </label>
                      <input
                        type="text"
                        required
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="Como está gravado no cartão"
                        className="w-full bg-[#16032a] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm uppercase focus:border-cyan-400 focus:outline-none"
                        id="input-card-holder"
                      />
                    </div>

                    {/* Row: Validade + CVV + CPF */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-purple-200 font-bold mb-1">
                          Validade (MM/AA)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/AA"
                          className="w-full bg-[#16032a] border border-purple-700/60 rounded-xl px-3 py-2.5 text-white font-mono text-xs sm:text-sm focus:border-cyan-400 focus:outline-none text-center"
                          maxLength={5}
                          id="input-card-expiry"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-200 font-bold mb-1">
                          Código CVV
                        </label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          className="w-full bg-[#16032a] border border-purple-700/60 rounded-xl px-3 py-2.5 text-white font-mono text-xs sm:text-sm focus:border-cyan-400 focus:outline-none text-center"
                          maxLength={4}
                          id="input-card-cvv"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-200 font-bold mb-1">
                          CPF do Titular
                        </label>
                        <input
                          type="text"
                          required
                          value={cardCpf}
                          onChange={handleCpfChange}
                          placeholder="000.000.000-00"
                          className="w-full bg-[#16032a] border border-purple-700/60 rounded-xl px-3 py-2.5 text-white font-mono text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                          maxLength={14}
                          id="input-card-cpf"
                        />
                      </div>
                    </div>

                    {/* Parcelamento Inteligente (1x até 12x) */}
                    <div>
                      <label className="block text-purple-200 font-bold mb-1">
                        Opções de Parcelamento
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full bg-[#16032a] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                        id="select-card-installments"
                      >
                        <option value="1">1x de R$ {planAmount.toFixed(2).replace('.', ',')} (à vista sem juros)</option>
                        {Array.from({ length: 11 }, (_, i) => i + 2).map((num) => {
                          const installmentValue = (planAmount / num).toFixed(2).replace('.', ',');
                          return (
                            <option key={num} value={num}>
                              {num}x de R$ {installmentValue} {planId === 'premium_anual' ? 'sem juros' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessingCard}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#009EE3] via-[#0089C7] to-[#0074A8] hover:from-[#0089C7] hover:to-[#005f8c] text-white font-black text-sm sm:text-base shadow-xl shadow-cyan-950/70 border border-cyan-400/40 flex items-center justify-center gap-3 transition-all disabled:opacity-50 transform hover:scale-[1.01] active:scale-[0.99]"
                      id="btn-submit-card-payment"
                    >
                      {isProcessingCard ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Processando Cartão com Mercado Pago...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-cyan-200" />
                          <span>Pagar R$ {planAmount.toFixed(2).replace('.', ',')} com Segurança</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-purple-300 text-center mt-2 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Transação criptografada de ponta a ponta pelo Mercado Pago.</span>
                    </p>
                  </div>

                </form>
              )}

              {/* ========================================================= */}
              {/* TAB 3: BOLETO BANCÁRIO TRANSPARENTE                        */}
              {/* ========================================================= */}
              {activeTab === 'boleto' && (
                <div className="space-y-4">
                  {isLoadingBoleto ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-purple-200">Gerando boleto bancário oficial no Mercado Pago...</p>
                    </div>
                  ) : boletoData ? (
                    <div className="bg-[#18042f] border border-purple-800/60 rounded-2xl p-5 space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Barcode className="w-5 h-5 text-amber-400" />
                          <span className="font-bold text-sm text-white">Boleto Emitido com Sucesso</span>
                        </div>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                          R$ {planAmount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Linha Digitável */}
                      {boletoData.digitableLine && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple-200">Linha Digitável:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={boletoData.digitableLine}
                              className="w-full bg-[#120223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 focus:outline-none select-all truncate"
                            />
                            <button
                              type="button"
                              onClick={handleCopyBoleto}
                              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all ${
                                copiedBoleto
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-600 hover:bg-amber-500 text-white'
                              }`}
                            >
                              {copiedBoleto ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Download / View PDF Button */}
                      {boletoData.ticketUrl && (
                        <a
                          href={boletoData.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Visualizar / Imprimir Boleto Bancário</span>
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      )}

                      <p className="text-[11px] text-purple-300 text-center">
                        Compensação em até 1 a 2 dias úteis após o pagamento.
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <button
                        onClick={handleGenerateBoleto}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                      >
                        Gerar Boleto Bancário
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: CHECKOUT PRO EXTERNO                                */}
              {/* ========================================================= */}
              {activeTab === 'pro' && (
                <div className="bg-[#18042f] border border-purple-800/60 rounded-2xl p-5 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      <span>Checkout Oficial no Site do Mercado Pago</span>
                    </h4>
                    <p className="text-xs text-purple-200 leading-relaxed">
                      Caso prefira, você pode concluir seu pagamento diretamente no site ou aplicativo oficial do Mercado Pago utilizando seu saldo em conta, cartão salvo ou carteira digital.
                    </p>
                  </div>

                  {preferenceUrl ? (
                    <a
                      href={preferenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#009EE3] to-[#0074A8] hover:from-[#0089C7] hover:to-[#005f8c] text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-950/60 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <MercadoPagoLogo variant="icon" className="w-5 h-5" />
                      <span>Ir para o Mercado Pago • R$ {planAmount.toFixed(2).replace('.', ',')}</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  ) : (
                    <button
                      onClick={() => generatePreference()}
                      className="w-full py-3 px-4 rounded-2xl bg-[#009EE3] hover:bg-[#0089C7] text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Gerar Link do Mercado Pago</span>
                    </button>
                  )}

                  <p className="text-[10px] text-center text-purple-400">
                    Após concluir o pagamento, o retorno é automático para seu consultório NutrinK.
                  </p>
                </div>
              )}

            </>
          )}

        </div>

      </div>
    </div>
  );
};
