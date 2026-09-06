import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  X, 
  Lock, 
  KeyRound,
  Crown,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  User,
  Mail,
  Award,
  Phone,
  Eye,
  EyeOff,
  Stethoscope,
  Apple
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionPlan, UserAccount } from '../types';
import { generatePixPayload, getPixQrCodeUrl } from '../utils/pix';
import { saveRegisteredUser, RegisteredProfessionalUser, SPECIALTY_OPTIONS } from './LoginModal';

const BRAZILIAN_UFS = [
  'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 
  'DF', 'ES', 'MT', 'MS', 'MA', 'PA', 'PB', 'RN', 'AL', 'SE', 
  'PI', 'RO', 'TO', 'AC', 'AM', 'AP', 'RR'
];

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: 'premium_mensal' | 'premium_anual';
  userAccount?: UserAccount | null;
  onPaymentSuccess: (plan: SubscriptionPlan, registeredUser?: Partial<UserAccount>) => void;
}

export const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({
  isOpen,
  onClose,
  initialPlanId = 'premium_anual',
  userAccount,
  onPaymentSuccess
}) => {
  // Step state: 'register' (Cadastro & Senha) -> 'payment' (PIX QR Code & Pagamento)
  const [step, setStep] = useState<'register' | 'payment'>('register');

  const [selectedPlan, setSelectedPlan] = useState<'premium_mensal' | 'premium_anual'>(
    initialPlanId || 'premium_anual'
  );

  // Step 1: Registration Form State
  const [regName, setRegName] = useState(
    userAccount?.name && userAccount.name !== 'Profissional de Saúde' ? userAccount.name : ''
  );
  const [regEmail, setRegEmail] = useState(userAccount?.email || '');
  const [regRoleType, setRegRoleType] = useState<'CRN' | 'CRM'>(
    userAccount?.crn?.includes('CRM') ? 'CRM' : 'CRN'
  );
  const [regNumber, setRegNumber] = useState(() => {
    if (!userAccount?.crn) return '';
    const match = userAccount.crn.match(/\d+/);
    return match ? match[0] : '';
  });
  const [regUF, setRegUF] = useState('SP');
  const [regSpecialty, setRegSpecialty] = useState(userAccount?.specialty || SPECIALTY_OPTIONS[0]);
  const [regPhone, setRegPhone] = useState(userAccount?.phone || '');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Step 2: Payment & Verification State
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 min countdown

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlan(initialPlanId);
    }
  }, [initialPlanId, isOpen]);

  // Reset or pre-fill on modal open
  useEffect(() => {
    if (isOpen) {
      if (userAccount?.name && userAccount.name !== 'Profissional de Saúde') {
        setRegName(userAccount.name);
      }
      if (userAccount?.email) {
        setRegEmail(userAccount.email);
      }
      if (userAccount?.phone) {
        setRegPhone(userAccount.phone);
      }
      setFormError(null);
      setIsApproved(false);
      setIsVerifying(false);
      setTimeLeft(15 * 60);
      setStep('register');
    }
  }, [isOpen, userAccount]);

  // Timer countdown for Step 2
  useEffect(() => {
    if (!isOpen || isApproved || step !== 'payment') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isApproved, step]);

  if (!isOpen) return null;

  const planAmount = selectedPlan === 'premium_anual' ? 399.00 : 39.00;
  const planLabel = selectedPlan === 'premium_anual' ? 'Plano Anual (À Vista)' : 'Plano Mensal (À Vista)';
  const pixPayload = generatePixPayload(
    planAmount, 
    `NutrinK ${selectedPlan === 'premium_anual' ? 'Anual' : 'Mensal'}`,
    `NUTRINK${Date.now().toString().slice(-6)}`
  );
  const qrCodeUrl = getPixQrCodeUrl(pixPayload);

  // Step 1 Validation & Proceed to Payment
  const handleProceedToPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanNumber = regNumber.trim();

    if (!cleanName || cleanName.length < 3) {
      setFormError('Por favor, informe seu nome completo profissional.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Por favor, informe um endereço de e-mail válido para seu login.');
      return;
    }

    if (!cleanNumber) {
      setFormError(`Por favor, informe o número do seu registro profissional (${regRoleType}).`);
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setFormError('A senha de acesso deve ter pelo menos 6 caracteres.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setFormError('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    if (!agreeTerms) {
      setFormError('É necessário aceitar os Termos de Uso e Política de Privacidade de Saúde.');
      return;
    }

    // Advance to Step 2 (PIX Payment)
    setStep('payment');
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
  };

  // Final Confirmation: Save User + Activate Plan
  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsApproved(true);

      const professionalRegisterFormatted = `${regRoleType}-${regNumber.trim()}/${regUF}`;

      // Build registered user object
      const fullUser: RegisteredProfessionalUser = {
        id: userAccount?.id && userAccount.id !== 'usr-unauthenticated' 
          ? userAccount.id 
          : `usr-${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        crn: professionalRegisterFormatted,
        specialty: regSpecialty,
        phone: regPhone.trim(),
        password: regPassword,
        plan: selectedPlan,
        isSubscribed: true,
        dailyMessageCount: 0,
        dailyMessageLimit: 999999,
        monthlyMessageCount: 0,
        monthlyMessageLimit: 999999,
        activeSince: new Date().getFullYear().toString(),
        subscriptionExpiresAt: selectedPlan === 'premium_anual' ? '15/08/2027' : '15/09/2026',
        paymentMethod: 'pix'
      };

      // Persist in local storage & session
      saveRegisteredUser(fullUser);
      try {
        localStorage.setItem('nutrink_user_session', JSON.stringify(fullUser));
        localStorage.setItem('nutrink_last_email', fullUser.email);
      } catch (err) {
        console.error('Erro ao salvar sessão:', err);
      }

      // Celebratory Confetti
      try {
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log('Confetti error:', e);
      }

      setTimeout(() => {
        onPaymentSuccess(selectedPlan, fullUser);
        onClose();
      }, 1900);
    }, 1300);
  };

  const handleWhatsAppVoucher = () => {
    const text = encodeURIComponent(
      `Olá! Acabei de realizar o pagamento PIX no valor de R$ ${planAmount.toFixed(2).replace('.', ',')} para o ${planLabel} no NutrinK.\n\n` +
      `👤 Nome do Titular: ${regName.trim() || 'Profissional'}\n` +
      `📋 Registro: ${regRoleType}-${regNumber}/${regUF}\n` +
      `📧 E-mail de Acesso: ${regEmail.trim().toLowerCase() || 'Meu e-mail'}`
    );
    window.open(`https://wa.me/5586999999999?text=${text}`, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#150328] border border-purple-800/70 rounded-3xl max-w-2xl w-full text-white shadow-2xl overflow-hidden relative max-h-[94vh] flex flex-col my-auto shadow-purple-950/90">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#440974] via-[#5b0e9f] to-[#3b0666] p-5 sm:p-6 text-center relative border-b border-purple-800/60 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-purple-200 hover:text-white bg-[#220743]/80 hover:bg-[#2e0b59] rounded-xl transition-all font-bold text-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Assinatura & Ativação de Consultório</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {step === 'register' ? (
              <>1. Cadastro Profissional & <span className="text-[#15DEC0]">Criação de Senha</span></>
            ) : (
              <>2. Pagamento Instantâneo via <span className="text-[#15DEC0]">PIX</span></>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-md mx-auto font-medium">
            {step === 'register' 
              ? 'Complete seus dados e crie sua senha de acesso antes de gerar o PIX para ativação do plano.'
              : 'Efetue o pagamento via QR Code ou Copia e Cola para liberação imediata do seu plano.'}
          </p>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto mt-3">
            <button
              onClick={() => { if (!isApproved) setStep('register'); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                step === 'register'
                  ? 'bg-fuchsia-600/90 text-white ring-1 ring-fuchsia-400 shadow-sm'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
              }`}
            >
              {step === 'payment' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <span className="w-4 h-4 rounded-full bg-fuchsia-400/30 text-white flex items-center justify-center text-[10px]">1</span>}
              <span>1. Cadastro & Senha</span>
            </button>

            <div className="w-4 sm:w-8 h-0.5 bg-purple-700/60"></div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                step === 'payment'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-1 ring-emerald-400 shadow-sm'
                  : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-400/30 text-white flex items-center justify-center text-[10px]">2</span>
              <span>2. Pagamento PIX</span>
            </div>
          </div>

          {/* Plan Selector Bar */}
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto mt-3.5 p-1.5 bg-[#18042f] rounded-2xl border border-purple-700/60">
            <button
              type="button"
              onClick={() => setSelectedPlan('premium_mensal')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                selectedPlan === 'premium_mensal'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md ring-1 ring-fuchsia-400'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <span>Plano Mensal</span>
              <span className="text-sm font-black text-white">R$ 39,00 <span className="text-[10px] font-normal text-purple-200">à vista</span></span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('premium_anual')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                selectedPlan === 'premium_anual'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-1 ring-emerald-400'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-md uppercase shadow-sm">
                2 Meses Grátis
              </span>
              <span>Plano Anual</span>
              <span className="text-sm font-black text-white">R$ 399,00 <span className="text-[10px] font-normal text-purple-200">à vista</span></span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* STEP 1: Registration and Password Creation */}
          {step === 'register' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 animate-fadeIn">
              
              {formError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="bg-[#1b0533] border border-purple-800/60 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-800/50 pb-2">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dados do Titular & Acesso</span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Nome Completo do Profissional *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dra. Ana Paula Silva"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email (Login) */}
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    E-mail Profissional (Será seu Login) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Ex: dra.anapaula@nutricao.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Professional Register (CRN/CRM) + UF */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1">
                      Conselho
                    </label>
                    <div className="flex bg-[#0f011d] p-1 rounded-xl border border-purple-700/80">
                      <button
                        type="button"
                        onClick={() => setRegRoleType('CRN')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          regRoleType === 'CRN' ? 'bg-fuchsia-600 text-white' : 'text-purple-300'
                        }`}
                      >
                        <Apple className="w-3 h-3" />
                        <span>CRN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRoleType('CRM')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          regRoleType === 'CRM' ? 'bg-purple-600 text-white' : 'text-purple-300'
                        }`}
                      >
                        <Stethoscope className="w-3 h-3" />
                        <span>CRM</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1">
                      Número do Registro *
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: 48192"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        className="w-full bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1">
                      Estado (UF)
                    </label>
                    <select
                      value={regUF}
                      onChange={(e) => setRegUF(e.target.value)}
                      className="w-full bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                    >
                      {BRAZILIAN_UFS.map(uf => (
                        <option key={uf} value={uf} className="bg-[#150328] text-white">{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specialty & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1">
                      Especialidade Principal
                    </label>
                    <select
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      className="w-full bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none truncate"
                    >
                      {SPECIALTY_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="bg-[#150328] text-white">{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1">
                      WhatsApp / Celular (Opcional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="Ex: (11) 98765-4321"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-purple-800/50">
                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1">
                      Criar Senha de Acesso *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1">
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPasswordConfirm ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Repita a senha"
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        className={`w-full bg-[#0f011d] border rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none ${
                          regPasswordConfirm && regPassword !== regPasswordConfirm 
                            ? 'border-rose-500' 
                            : 'border-purple-700/80 focus:border-fuchsia-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                      >
                        {showRegPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-fuchsia-600 focus:ring-0 focus:ring-offset-0 bg-[#0f011d] border-purple-700"
                    />
                    <span className="text-[11px] text-purple-300 leading-tight">
                      Concordo com os <strong>Termos de Uso</strong> e <strong>Política de Privacidade de Saúde (LGPD)</strong> do ecossistema NutrinK.
                    </span>
                  </label>
                </div>

              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-purple-300 hover:text-white hover:bg-[#250847] transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-fuchsia-600 hover:from-emerald-500 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  id="btn-proceed-to-pix"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>Continuar para Pagamento PIX (R$ {planAmount.toFixed(2).replace('.', ',')})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: PIX QR Code & Confirmation */}
          {step === 'payment' && (
            <>
              {/* Success State */}
              {isApproved ? (
                <div className="py-8 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Cadastro Concluído & Pagamento Aprovado!
                  </h3>
                  <p className="text-xs text-purple-200 max-w-sm mx-auto">
                    Seu consultório <strong>{regName}</strong> ({regRoleType}-{regNumber}/{regUF}) foi criado com sucesso com o <strong>{planLabel}</strong>.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs text-emerald-300 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                      Entrando no consultório com todas as ferramentas liberadas...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Titular Summary Banner with edit button */}
                  <div className="p-3 bg-[#1c0536] border border-purple-800/70 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-fuchsia-600/30 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 shrink-0 font-bold">
                        {regRoleType}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-white truncate flex items-center gap-1.5">
                          <span>{regName}</span>
                          <span className="text-[10px] text-amber-300 font-mono">({regRoleType}-{regNumber}/{regUF})</span>
                        </div>
                        <div className="text-[11px] text-purple-300 truncate">
                          {regEmail} • {regSpecialty}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('register')}
                      className="px-3 py-1.5 rounded-xl bg-[#2b0854] hover:bg-[#3b0d73] text-purple-200 hover:text-white text-[11px] font-bold border border-purple-700/60 shrink-0 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Alterar</span>
                    </button>
                  </div>

                  {/* QR Code and Value Card */}
                  <div className="bg-gradient-to-b from-[#1c0536] to-[#120224] border border-purple-800/70 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-6 shadow-xl">
                    
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="p-3 bg-white rounded-2xl shadow-lg relative group">
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code PIX NutrinK" 
                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/5 rounded-2xl pointer-events-none"></div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Expira em: <strong className="text-amber-300">{formatTime(timeLeft)}</strong></span>
                      </div>
                    </div>

                    {/* Info and Key Copy */}
                    <div className="flex-1 space-y-3.5 text-left w-full">
                      
                      {/* Amount Badge */}
                      <div className="flex items-baseline justify-between border-b border-purple-800/60 pb-2">
                        <div>
                          <span className="text-[11px] text-purple-300 font-medium block">Valor Total à Vista</span>
                          <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                            R$ {planAmount.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-900/60 text-purple-200 border border-purple-700 text-xs font-bold">
                          {selectedPlan === 'premium_anual' ? 'Assinatura Anual' : 'Assinatura Mensal'}
                        </span>
                      </div>

                      {/* PIX Copia e Cola (Payload) */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-fuchsia-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Código PIX Copia e Cola:</span>
                          </span>
                          <span className="text-[10px] text-purple-400 font-medium">Banco Central do Brasil</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={pixPayload}
                            className="flex-1 bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl px-3 py-2.5 text-xs text-purple-200 font-mono truncate focus:outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPayload}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border shadow-md ${
                              copiedPayload 
                                ? 'bg-emerald-600 border-emerald-400 text-white' 
                                : 'bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-600 hover:to-purple-600 text-white border-fuchsia-500/60'
                            }`}
                            id="btn-copy-pix-payload"
                          >
                            {copiedPayload ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-purple-200" />
                                <span>Copiar Código</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Immediate Activation Notice */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Ambiente criptografado com liberação imediata após o pagamento.</span>
                      </div>

                    </div>
                  </div>

                  {/* Step-by-step instructions */}
                  <div className="bg-[#100220] border border-purple-800/40 rounded-2xl p-4 text-xs text-purple-200 space-y-2.5">
                    <div className="font-bold text-white flex items-center gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Como realizar o pagamento em 3 passos:</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-[#1b0533] border border-purple-800/50">
                        <span className="font-bold text-amber-300 block mb-1">1. Abra seu Banco</span>
                        <span>No aplicativo do seu banco, acesse a área <strong>PIX</strong> &gt; <strong>Ler QR Code</strong> ou <strong>PIX Copia e Cola</strong>.</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#1b0533] border border-purple-800/50">
                        <span className="font-bold text-amber-300 block mb-1">2. Pague o Valor</span>
                        <span>Aponte a câmera para o <strong>QR Code</strong> ou cole o código acima e confira o valor de <strong>R$ {planAmount.toFixed(2).replace('.', ',')}</strong>.</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#1b0533] border border-purple-800/50">
                        <span className="font-bold text-amber-300 block mb-1">3. Confirme Abaixo</span>
                        <span>Clique em <strong>"Já Fiz o PIX / Concluir Cadastro"</strong> para ativar seu acesso.</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setStep('register')}
                        className="px-3.5 py-2.5 rounded-xl bg-[#18042f] hover:bg-[#250847] text-purple-300 hover:text-white text-xs font-bold transition-all border border-purple-800 flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar ao Cadastro</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleWhatsAppVoucher}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1d0637] hover:bg-[#2a0950] text-purple-200 hover:text-white text-xs font-bold transition-all border border-purple-700/60 flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Comprovante</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isVerifying}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-fuchsia-600 hover:from-emerald-500 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/60 border border-emerald-400/50 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                      id="btn-confirm-pix-payment"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Ativando seu plano...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Já Fiz o PIX • Finalizar Cadastro e Ativar</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
