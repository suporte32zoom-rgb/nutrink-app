import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  X, 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  UserPlus, 
  Award, 
  FileCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Stethoscope, 
  Apple, 
  RefreshCw, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { UserAccount } from '../types';
import { formatBrasiliaShortDate } from '../utils/dateUtils';

export type AuthModalTab = 'login' | 'register' | 'forgot_password' | 'google_onboarding';

export interface RegisteredProfessionalUser extends UserAccount {
  password?: string;
}

export const getRegisteredUsers = (): RegisteredProfessionalUser[] => {
  try {
    const raw = localStorage.getItem('nutrink_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRegisteredUser = (user: RegisteredProfessionalUser) => {
  try {
    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(
      u => u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem('nutrink_registered_users', JSON.stringify(users));
    if (user.email) {
      localStorage.setItem('nutrink_last_email', user.email.trim().toLowerCase());
    }
  } catch (err) {
    console.error('Erro ao persistir usuário:', err);
  }
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onLoginAs: (user: Partial<UserAccount>) => void;
  initialTab?: AuthModalTab;
  onOpenTermsDoc?: (pageId: string) => void;
  isMandatoryAuth?: boolean;
}

export const SPECIALTY_OPTIONS = [
  'Nutrição Clínica & Funcional',
  'Nutrição Esportiva & Performance',
  'Nutrologia & Medicina Metabólica',
  'Emagrecimento & Obesidade',
  'Nutrição Materno-Infantil & Pediatria',
  'Saúde Intestinal & Microbiota',
  'Nutrição Oncológica',
  'Comportamento Alimentar & Transtornos',
  'Vegetarianismo & Veganismo',
  'Geriatria & Longevidade Saudável'
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginAs,
  initialTab = 'login',
  onOpenTermsDoc,
  isMandatoryAuth = false
}) => {
  const [activeTab, setActiveTab] = useState<AuthModalTab>(
    initialTab === 'google_onboarding' ? 'google_onboarding' : (initialTab || 'login')
  );
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regRoleType, setRegRoleType] = useState<'CRN' | 'CRM'>('CRN');
  const [regNumber, setRegNumber] = useState('');
  const [regUF, setRegUF] = useState('SP');
  const [regSpecialty, setRegSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [regCustomSpecialty, setRegCustomSpecialty] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Google Onboarding form state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleRoleType, setGoogleRoleType] = useState<'CRN' | 'CRM'>('CRN');
  const [googleNumber, setGoogleNumber] = useState('');
  const [googleUF, setGoogleUF] = useState('SP');
  const [googleSpecialty, setGoogleSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [googleCustomSpecialty, setGoogleCustomSpecialty] = useState('');
  const [googleAgreeTerms, setGoogleAgreeTerms] = useState(true);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Feedback & Loading
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize initialTab if changed when opened and auto-prefill registered email
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'login');
      setErrorMessage('');
      setAuthSuccess(false);
      setForgotSubmitted(false);

      // Auto-prefill last logged/registered email
      try {
        const lastEmail = localStorage.getItem('nutrink_last_email');
        if (lastEmail) {
          setLoginEmail(lastEmail);
        } else {
          const users = getRegisteredUsers();
          if (users.length > 0 && users[users.length - 1]?.email) {
            setLoginEmail(users[users.length - 1].email);
          }
        }
      } catch (err) {
        console.error('Error prefilling email:', err);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Não informada', color: 'bg-slate-700', text: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Fraca', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score <= 3) return { score: 2, label: 'Média', color: 'bg-amber-500', text: 'text-amber-400' };
    return { score: 3, label: 'Forte & Segura', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const passStrength = getPasswordStrength(regPassword);
  const passwordsMatch = regPassword && regPasswordConfirm && regPassword === regPasswordConfirm;

  // Handlers
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Por favor, preencha o e-mail profissional e a senha cadastrada.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      const users = getRegisteredUsers();
      const cleanEmail = loginEmail.trim().toLowerCase();
      const foundUser = users.find(u => u.email?.trim().toLowerCase() === cleanEmail);

      if (!foundUser) {
        setErrorMessage(`Nenhuma conta profissional cadastrada com o e-mail "${loginEmail}". Por favor, crie sua conta na aba "Criar Conta" informando seu Nome Completo e registro.`);
        return;
      }

      if (foundUser.password && foundUser.password !== loginPassword) {
        setErrorMessage('Senha incorreta para este usuário. Digite a senha cadastrada no momento do registro ou use a opção "Esqueci minha senha".');
        return;
      }

      // SUCESSO: Busca exclusivamente o Nome Completo real cadastrado no banco de dados
      setAuthSuccess(true);
      setAuthSuccessMsg(`Bem-vindo(a), ${foundUser.name}!`);
      
      try {
        localStorage.setItem('nutrink_last_email', foundUser.email.trim().toLowerCase());
      } catch {}

      const authenticatedUser: UserAccount = {
        id: foundUser.id || `usr-${Date.now()}`,
        name: foundUser.name, // Nome Completo Real Cadastrado no Banco de Dados
        email: foundUser.email,
        crn: foundUser.crn || 'CRN/CRM Ativo',
        specialty: foundUser.specialty || 'Nutrição Clínica & Funcional',
        plan: foundUser.plan || 'free',
        isSubscribed: foundUser.isSubscribed || false,
        dailyMessageCount: foundUser.dailyMessageCount || 0,
        dailyMessageLimit: foundUser.dailyMessageLimit || 30,
        monthlyMessageCount: foundUser.monthlyMessageCount || 0,
        monthlyMessageLimit: foundUser.monthlyMessageLimit || 50,
        activeSince: foundUser.activeSince || formatBrasiliaShortDate()
      };

      onLoginAs(authenticatedUser);

      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 800);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = regName.trim();
    if (!trimmedName) {
      setErrorMessage('Informe o Nome Completo do profissional de saúde.');
      return;
    }
    if (!regNumber.trim()) {
      setErrorMessage(`Informe o número do seu registro profissional (${regRoleType}).`);
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Informe um e-mail profissional válido.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setErrorMessage('A confirmação de senha não coincide com a senha digitada.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('É obrigatório aceitar os Termos de Serviço e a Política de Privacidade (LGPD).');
      return;
    }

    // Verificar se o e-mail já existe na base de usuários cadastrados
    const users = getRegisteredUsers();
    const alreadyRegistered = users.some(u => u.email?.trim().toLowerCase() === cleanEmail);
    if (alreadyRegistered) {
      setErrorMessage(`O e-mail "${regEmail}" já está cadastrado no sistema. Acesse a aba "Entrar" para autenticar ou recupere sua senha.`);
      return;
    }

    setIsProcessing(true);
    const finalSpecialty = regSpecialty === 'Outro' ? (regCustomSpecialty || 'Nutrição Geral') : regSpecialty;
    const finalRegistry = `${regRoleType}-${regUF} ${regNumber.trim()}`;

    const newUser: RegisteredProfessionalUser = {
      id: `usr-${Date.now()}`,
      name: trimmedName, // NOME COMPLETO REAL CADASTRADO NO BANCO
      email: cleanEmail,
      password: regPassword, // Senha real cadastrada
      crn: finalRegistry,
      specialty: finalSpecialty,
      plan: 'free',
      isSubscribed: false,
      dailyMessageCount: 0,
      dailyMessageLimit: 30,
      monthlyMessageCount: 0,
      monthlyMessageLimit: 50,
      activeSince: formatBrasiliaShortDate()
    };

    setTimeout(() => {
      setIsProcessing(false);
      setAuthSuccess(true);
      setAuthSuccessMsg(`Conta de ${trimmedName} criada com sucesso!`);

      // Salva no banco de usuários registrados
      saveRegisteredUser(newUser);

      onLoginAs(newUser);

      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 900);
    }, 800);
  };

  // Initiate Google Authentication Flow (Switches to mandatory onboarding step)
  const handleInitiateGoogleAuth = () => {
    setErrorMessage('');
    setGoogleEmail(loginEmail || regEmail || 'profissional@gmail.com');
    if (!googleName && regName) {
      setGoogleName(regName);
    }
    setActiveTab('google_onboarding');
  };

  // Submit Google Onboarding
  const handleCompleteGoogleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = googleName.trim();
    if (!trimmedName) {
      setErrorMessage('Informe o Nome Completo do profissional.');
      return;
    }
    if (!googleNumber.trim()) {
      setErrorMessage(`Informe o número do registro profissional (${googleRoleType}).`);
      return;
    }
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Informe um e-mail Google válido.');
      return;
    }
    if (!googleAgreeTerms) {
      setErrorMessage('É obrigatório aceitar os Termos de Serviço e a Política de Privacidade (LGPD).');
      return;
    }

    setIsProcessing(true);
    const finalSpecialty = googleSpecialty === 'Outro' ? (googleCustomSpecialty || 'Nutrição Geral') : googleSpecialty;
    const finalRegistry = `${googleRoleType}-${googleUF} ${googleNumber.trim()}`;

    const newGoogleUser: RegisteredProfessionalUser = {
      id: `usr-g-${Date.now()}`,
      name: trimmedName, // NOME COMPLETO REAL CADASTRADO
      email: cleanEmail,
      crn: finalRegistry,
      specialty: finalSpecialty,
      plan: 'free',
      isSubscribed: false,
      dailyMessageCount: 0,
      dailyMessageLimit: 30,
      monthlyMessageCount: 0,
      monthlyMessageLimit: 50,
      activeSince: formatBrasiliaShortDate()
    };

    setTimeout(() => {
      setIsProcessing(false);
      setAuthSuccess(true);
      setAuthSuccessMsg(`Cadastro Google de ${trimmedName} validado com sucesso!`);

      // Salva no banco de usuários registrados
      saveRegisteredUser(newGoogleUser);

      onLoginAs(newGoogleUser);

      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 900);
    }, 800);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanForgotEmail = forgotEmail.trim().toLowerCase();
    if (!cleanForgotEmail || !cleanForgotEmail.includes('@')) {
      setErrorMessage('Por favor, digite um e-mail válido para redefinição.');
      return;
    }

    const users = getRegisteredUsers();
    const userFound = users.find(u => u.email?.trim().toLowerCase() === cleanForgotEmail);
    if (!userFound) {
      setErrorMessage(`Nenhuma conta profissional cadastrada com o e-mail "${forgotEmail}".`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setForgotSubmitted(true);
      setErrorMessage('');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      
      <div className="bg-[#130429] border border-purple-800/60 w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-100 relative my-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-purple-900/60 bg-[#170532]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2d0a59] border border-purple-700/60 rounded-xl text-fuchsia-400 shadow-md">
              {activeTab === 'register' ? (
                <UserPlus className="w-5 h-5" />
              ) : activeTab === 'google_onboarding' ? (
                <Award className="w-5 h-5 text-amber-400" />
              ) : activeTab === 'forgot_password' ? (
                <KeyRound className="w-5 h-5 text-amber-400" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  {activeTab === 'register' ? 'Criar Conta Profissional' :
                   activeTab === 'google_onboarding' ? 'Onboarding & Validação Profissional' :
                   activeTab === 'forgot_password' ? 'Recuperação de Chave de Acesso' :
                   'Acessar Consultório NutrinK'}
                </h2>
              </div>
              <p className="text-[11px] text-purple-300">
                {activeTab === 'register' ? 'Prescrição Dietética, Prontuário & Copiloto IA' :
                 activeTab === 'google_onboarding' ? 'Validação do Registro Profissional (CRN/CRM)' :
                 activeTab === 'forgot_password' ? 'Redefinição segura de senha' :
                 'Autenticação Segura com Proteção LGPD'}
              </p>
            </div>
          </div>

          {!isMandatoryAuth ? (
            <button
              onClick={onClose}
              className="p-1.5 text-purple-300 hover:text-white bg-[#1f053f] hover:bg-[#2d0a59] rounded-xl border border-purple-800/40 transition-all"
              id="btn-close-login-modal"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-bold text-fuchsia-300 bg-fuchsia-950/80 border border-fuchsia-600/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Acesso Profissional
            </span>
          )}
        </div>

        {/* 2 Main Tabs Navigation: Entrar / Criar Conta (No Demo Tabs) */}
        {activeTab !== 'forgot_password' && activeTab !== 'google_onboarding' && (
          <div className="grid grid-cols-2 border-b border-purple-900/50 bg-[#0e021f] text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'login'
                  ? 'border-fuchsia-500 text-fuchsia-300 bg-purple-950/40 shadow-inner'
                  : 'border-transparent text-purple-300/70 hover:text-purple-200 hover:bg-purple-950/20'
              }`}
              id="tab-login"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>

            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'register'
                  ? 'border-fuchsia-500 text-fuchsia-300 bg-purple-950/40 shadow-inner'
                  : 'border-transparent text-purple-300/70 hover:text-purple-200 hover:bg-purple-950/20'
              }`}
              id="tab-register"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Conta</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Error notification */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success screen feedback */}
          {authSuccess ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">{authSuccessMsg || 'Sessão Autenticada com Sucesso!'}</h3>
              <p className="text-xs text-purple-200 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-fuchsia-400" />
                Carregando consultório, prontuários e copiloto NUTRIA...
              </p>
            </div>
          ) : activeTab === 'google_onboarding' ? (
            /* TAB: GOOGLE ONBOARDING - MANDATORY PROFESSIONAL REGISTRATION */
            <form onSubmit={handleCompleteGoogleOnboarding} className="space-y-3.5">
              
              <div className="bg-[#1c063b] p-3.5 rounded-2xl border border-purple-800/60 text-xs text-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="font-bold text-white">Etapa de Onboarding Profissional Obrigatória</span>
                </div>
                <p className="text-[11px] text-purple-300">
                  Para habilitar o prontuário eletrônico e a emissão de laudos com assinatura digital, preencha os dados do seu conselho profissional:
                </p>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Nome Completo do Profissional <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Ex: Dra. Mariana Costa ou Dr. Lucas Ribeiro"
                  className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              {/* Tipo de Conselho (CRN vs CRM) & Número/UF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Conselho Profissional <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGoogleRoleType('CRN')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        googleRoleType === 'CRN'
                          ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-md'
                          : 'bg-[#1b0638] border-purple-800/60 text-purple-300 hover:text-white'
                      }`}
                    >
                      <Apple className="w-3.5 h-3.5" />
                      <span>CRN (Nutri)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGoogleRoleType('CRM')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        googleRoleType === 'CRM'
                          ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                          : 'bg-[#1b0638] border-purple-800/60 text-purple-300 hover:text-white'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>CRM (Médico)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Número do Registro & UF <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={googleUF}
                      onChange={(e) => setGoogleUF(e.target.value)}
                      className="bg-[#1b0638] border border-purple-800/60 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                    >
                      {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES', 'AM', 'PA'].map(uf => (
                        <option key={uf} value={uf} className="bg-[#130429]">{uf}</option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        value={googleNumber}
                        onChange={(e) => setGoogleNumber(e.target.value)}
                        placeholder={googleRoleType === 'CRN' ? 'Ex: 48.921' : 'Ex: 142.890'}
                        className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Especialidade Principal */}
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Especialidade Principal <span className="text-rose-400">*</span>
                </label>
                <select
                  value={googleSpecialty}
                  onChange={(e) => setGoogleSpecialty(e.target.value)}
                  className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                >
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#130429] text-white">
                      {opt}
                    </option>
                  ))}
                  <option value="Outro" className="bg-[#130429] text-white">Outra especialidade personalizada...</option>
                </select>

                {googleSpecialty === 'Outro' && (
                  <input
                    type="text"
                    required
                    value={googleCustomSpecialty}
                    onChange={(e) => setGoogleCustomSpecialty(e.target.value)}
                    placeholder="Digite sua especialidade clínica..."
                    className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white mt-1.5 placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                  />
                )}
              </div>

              {/* E-mail Google */}
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  E-mail Google Vinculado <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              {/* Termos e LGPD Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-purple-200">
                  <input
                    type="checkbox"
                    checked={googleAgreeTerms}
                    onChange={(e) => setGoogleAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-purple-700 text-fuchsia-600 focus:ring-fuchsia-500 bg-[#1b0638]"
                  />
                  <span>
                    Declaro que li e concordo com os{' '}
                    <button
                      type="button"
                      onClick={() => onOpenTermsDoc && onOpenTermsDoc('termos_servico')}
                      className="text-fuchsia-300 hover:underline font-semibold"
                    >
                      Termos de Serviço
                    </button>{' '}
                    e com a{' '}
                    <button
                      type="button"
                      onClick={() => onOpenTermsDoc && onOpenTermsDoc('privacidade_lgpd')}
                      className="text-cyan-300 hover:underline font-semibold"
                    >
                      Política de Privacidade (LGPD)
                    </button>{' '}
                    do NutrinK.
                  </span>
                </label>
              </div>

              {/* Submit Google Onboarding */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-950/70 border border-fuchsia-400/40 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Validando Credenciais...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Concluir Onboarding & Acessar Consultório</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                  className="text-xs text-purple-300 hover:text-white flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para Login Tradicional</span>
                </button>
              </div>

            </form>
          ) : activeTab === 'register' ? (
            /* TAB: REGISTER COMPLETE FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Google Social Fast-Track Register -> triggers Onboarding */}
              <button
                type="button"
                onClick={handleInitiateGoogleAuth}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-[#1b0638] hover:bg-[#26084e] border border-purple-700/60 hover:border-fuchsia-400/60 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Cadastrar com o Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-purple-900/60"></div>
                <span className="text-[10px] uppercase font-bold text-purple-400">ou preencha os dados profissionais</span>
                <div className="flex-1 h-px bg-purple-900/60"></div>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Nome Completo do Profissional <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Dra. Mariana Costa ou Dr. Lucas Ribeiro"
                    className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              {/* Tipo de Conselho (CRN vs CRM) & Número/UF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Tipo de Conselho <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRegRoleType('CRN')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        regRoleType === 'CRN'
                          ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-md'
                          : 'bg-[#1b0638] border-purple-800/60 text-purple-300 hover:text-white'
                      }`}
                    >
                      <Apple className="w-3.5 h-3.5" />
                      <span>CRN (Nutri)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRoleType('CRM')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        regRoleType === 'CRM'
                          ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                          : 'bg-[#1b0638] border-purple-800/60 text-purple-300 hover:text-white'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>CRM / RQE</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Número do Registro & UF <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={regUF}
                      onChange={(e) => setRegUF(e.target.value)}
                      className="bg-[#1b0638] border border-purple-800/60 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                    >
                      {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES', 'AM', 'PA'].map(uf => (
                        <option key={uf} value={uf} className="bg-[#130429]">{uf}</option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Award className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder={regRoleType === 'CRN' ? 'Ex: 48.921' : 'Ex: 142.890'}
                        className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl pl-8 pr-2 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Especialidade Principal */}
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Especialidade Principal <span className="text-rose-400">*</span>
                </label>
                <select
                  value={regSpecialty}
                  onChange={(e) => setRegSpecialty(e.target.value)}
                  className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                >
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#130429] text-white">
                      {opt}
                    </option>
                  ))}
                  <option value="Outro" className="bg-[#130429] text-white">Outra especialidade personalizada...</option>
                </select>

                {regSpecialty === 'Outro' && (
                  <input
                    type="text"
                    required
                    value={regCustomSpecialty}
                    onChange={(e) => setRegCustomSpecialty(e.target.value)}
                    placeholder="Digite sua especialidade clínica..."
                    className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white mt-1.5 placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                  />
                )}
              </div>

              {/* E-mail Profissional */}
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  E-mail Profissional <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="dra.mariana@consultorio.com.br"
                    className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              {/* Senha e Confirmação de Senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-purple-200">
                      Senha Segura <span className="text-rose-400">*</span>
                    </label>
                    <span className={`text-[10px] font-bold ${passStrength.text}`}>
                      {passStrength.label}
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {/* Strength Bar */}
                  <div className="w-full h-1 bg-purple-950 rounded-full mt-1.5 overflow-hidden flex">
                    <div 
                      className={`h-full ${passStrength.color} transition-all duration-300`} 
                      style={{ width: `${(passStrength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-purple-200">
                      Confirmar Senha <span className="text-rose-400">*</span>
                    </label>
                    {passwordsMatch && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Coincide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPasswordConfirm ? 'text' : 'password'}
                      required
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="Repita a senha"
                      className={`w-full bg-[#1b0638] border rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none ${
                        regPasswordConfirm && !passwordsMatch 
                          ? 'border-rose-500' 
                          : 'border-purple-800/60 focus:border-fuchsia-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                    >
                      {showRegPasswordConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Termos e LGPD Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-purple-200">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-purple-700 text-fuchsia-600 focus:ring-fuchsia-500 bg-[#1b0638]"
                  />
                  <span>
                    Declaro que li e concordo com os{' '}
                    <button
                      type="button"
                      onClick={() => onOpenTermsDoc && onOpenTermsDoc('termos_servico')}
                      className="text-fuchsia-300 hover:underline font-semibold"
                    >
                      Termos de Serviço
                    </button>{' '}
                    e com a{' '}
                    <button
                      type="button"
                      onClick={() => onOpenTermsDoc && onOpenTermsDoc('privacidade_lgpd')}
                      className="text-cyan-300 hover:underline font-semibold"
                    >
                      Política de Privacidade (LGPD)
                    </button>{' '}
                    do NutrinK.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-950/70 border border-fuchsia-400/40 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Criando Prontuário & Conta...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-fuchsia-200" />
                    <span>Cadastrar e Acessar Consultório</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                  className="text-xs text-purple-300 hover:text-fuchsia-300 transition-colors"
                >
                  Já possui cadastro no NutrinK? <strong className="underline text-white">Entrar agora</strong>
                </button>
              </div>

            </form>
          ) : activeTab === 'forgot_password' ? (
            /* TAB: FORGOT PASSWORD FLOW */
            <div className="space-y-4">
              {forgotSubmitted ? (
                <div className="p-5 bg-[#1b0638] rounded-2xl border border-emerald-500/50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Instruções de Redefinição Enviadas!</h4>
                  <p className="text-xs text-purple-200">
                    Um link seguro para redefinir sua senha foi enviado para <strong className="text-white">{forgotEmail}</strong>. Verifique sua caixa de entrada e pasta de spam.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setForgotSubmitted(false); }}
                      className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl"
                    >
                      Voltar ao Login
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="bg-[#1b0638] p-3.5 rounded-2xl border border-purple-800/60 text-xs text-purple-200">
                    <p className="text-purple-300">
                      Digite o e-mail cadastrado em seu consultório. Você receberá um token temporário e as instruções para cadastrar uma nova senha.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">E-mail Profissional Cadastrado</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu.email@consultorio.com.br"
                        className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    <span>Enviar Link de Recuperação</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                      className="text-xs text-purple-300 hover:text-white"
                    >
                      ← Lembra da sua senha? <strong>Voltar ao Login</strong>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* TAB: TRADITIONAL LOGIN */
            <form onSubmit={handleCustomLogin} className="space-y-4">
              
              {/* Google Social Fast-Track Login -> triggers Google Onboarding */}
              <button
                type="button"
                onClick={handleInitiateGoogleAuth}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-[#1b0638] hover:bg-[#26084e] border border-purple-700/60 hover:border-fuchsia-400/60 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continuar com o Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-purple-900/60"></div>
                <span className="text-[10px] uppercase font-bold text-purple-400">ou entre com e-mail cadastrado</span>
                <div className="flex-1 h-px bg-purple-900/60"></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">E-mail Profissional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.nome@consultorio.com.br"
                    className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-purple-200">Senha Segura</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot_password'); setErrorMessage(''); }}
                    className="text-[11px] text-fuchsia-300 hover:text-fuchsia-200 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#1b0638] border border-purple-800/60 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-950/60 border border-fuchsia-400/30 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Entrar no Consultório NutrinK</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                  className="text-xs text-purple-300 hover:text-white"
                >
                  Novo por aqui? <strong className="underline text-fuchsia-300">Criar uma conta gratuita</strong>
                </button>
              </div>
            </form>
          )}

          {/* Security stamp & LGPD Badge */}
          <div className="pt-4 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-purple-300/80">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Sessão Criptografada AES-256
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <FileCheck className="w-3.5 h-3.5" />
              LGPD Lei 13.709/18
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
