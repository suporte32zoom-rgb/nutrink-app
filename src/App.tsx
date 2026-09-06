import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { CalendarView } from './components/CalendarView';
import { FinanceView } from './components/FinanceView';
import { NutriCalcView } from './components/NutriCalcView';
import { NutriaCopilot } from './components/NutriaCopilot';
import { NewPatientModal } from './components/NewPatientModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Footer } from './components/Footer';
import { InstitutionalDocModal } from './components/InstitutionalDocModal';
import { LoginModal } from './components/LoginModal';
import { TelemedicineView } from './components/TelemedicineView';
import { MercadoPagoSubscriptionsView } from './components/MercadoPagoSubscriptionsView';
import { 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_FOOD_DATABASE 
} from './data/initialData';
import { 
  Patient, 
  Appointment, 
  FinancialTransaction, 
  NutriaMessage, 
  NutriaActionExecution,
  UserAccount,
  SubscriptionPlan
} from './types';
import { safeFetchJson } from './utils/api';
import { callNutriaDirect } from './services/nutriaGeminiDirect';
import { Bot, Sparkles, MessageSquare, X } from 'lucide-react';

export function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'calendar' | 'finance' | 'nutricalc' | 'telemedicine' | 'nutria_hub' | 'plans'>('dashboard');

  // Application Data States (persistent in localStorage with initial empty/clean state)
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('nutrink_patients');
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('nutrink_appointments');
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('nutrink_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nutrink_patients', JSON.stringify(patients));
    } catch (e) {
      console.error('Error saving patients:', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('nutrink_appointments', JSON.stringify(appointments));
    } catch (e) {
      console.error('Error saving appointments:', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('nutrink_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  }, [transactions]);

  // User Account & Session Management (strictly queries registered users database for real Full Name)
  const [userAccount, setUserAccount] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('nutrink_user_session');
      if (!saved) return null;
      const parsed: UserAccount = JSON.parse(saved);

      // Verify and pull the exact Full Name from the registered users database
      const registeredUsersRaw = localStorage.getItem('nutrink_registered_users');
      if (registeredUsersRaw) {
        const registeredUsers = JSON.parse(registeredUsersRaw);
        const match = registeredUsers.find((u: any) => u.email?.trim().toLowerCase() === parsed.email?.trim().toLowerCase());
        if (match && match.name && match.name.trim()) {
          parsed.name = match.name.trim(); // Strictly enforce the real full registered name
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('nutrink_user_session');
    } catch {
      return false;
    }
  });

  // Modals
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInstitutionalModalOpen, setIsInstitutionalModalOpen] = useState(false);
  const [activeInstitutionalPageId, setActiveInstitutionalPageId] = useState<string>('inicio');

  // Open login modal ONLY when explicitly requested (not on app initial open)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  
  // If there is a registered user, ALWAYS default to 'login' (Entrar com e-mail e senha). Only 'register' if 0 users exist.
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot_password'>(() => {
    try {
      const registeredUsersRaw = localStorage.getItem('nutrink_registered_users');
      const hasRegisteredUsers = registeredUsersRaw && JSON.parse(registeredUsersRaw).length > 0;
      const hasLastEmail = !!localStorage.getItem('nutrink_last_email');
      return (hasRegisteredUsers || hasLastEmail) ? 'login' : 'register';
    } catch {
      return 'login';
    }
  });

  const [preSelectedPatientForApt, setPreSelectedPatientForApt] = useState<Patient | null>(null);

  // Fallback guest object for child components that require non-null UserAccount
  const [guestDailyCount, setGuestDailyCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nutrink_guest_msg_count');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const effectiveUserAccount: UserAccount = userAccount || {
    id: 'usr-unauthenticated',
    name: 'Profissional de Saúde',
    email: '',
    crn: '',
    specialty: 'Nutrição Clínica & Funcional',
    plan: 'free',
    isSubscribed: false,
    dailyMessageCount: guestDailyCount,
    dailyMessageLimit: 30,
    monthlyMessageCount: guestDailyCount,
    monthlyMessageLimit: 50,
    activeSince: '2026'
  };

  const handleOpenInstitutionalPage = (pageId: string) => {
    setActiveInstitutionalPageId(pageId);
    setIsInstitutionalModalOpen(true);
  };

  const handleOpenLoginModal = (tab: 'login' | 'register' | 'forgot_password' = 'login') => {
    setAuthModalTab(tab);
    setIsLoginModalOpen(true);
  };

  const handleLoginAs = (updated: Partial<UserAccount>) => {
    const newUser: UserAccount = {
      id: updated.id || `usr-${Date.now()}`,
      name: updated.name || 'Profissional de Saúde',
      email: updated.email || '',
      crn: updated.crn || 'CRN Ativo',
      specialty: updated.specialty || 'Nutrição Clínica & Funcional',
      plan: updated.plan || 'free',
      isSubscribed: updated.isSubscribed || false,
      dailyMessageCount: updated.dailyMessageCount || 0,
      dailyMessageLimit: updated.dailyMessageLimit || 30,
      monthlyMessageCount: updated.monthlyMessageCount || 0,
      monthlyMessageLimit: updated.monthlyMessageLimit || 50,
      activeSince: updated.activeSince || '2026'
    };

    try {
      localStorage.setItem('nutrink_user_session', JSON.stringify(newUser));
      if (newUser.email) {
        localStorage.setItem('nutrink_last_email', newUser.email.trim().toLowerCase());
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    setUserAccount(newUser);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    setCurrentTab('dashboard'); // Directs straight to the initial dashboard page

    // Personalized welcome message in NUTRIA copilot with the real registered professional's name
    setNutriaMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: `Olá, **${newUser.name}**! Eu sou a **NUTRIA**, sua inteligência operacional e copiloto clínico no NutrinK.

Seu consultório foi inicializado com sucesso (${newUser.crn} • ${newUser.specialty}). Como posso otimizar seus atendimentos hoje?
- **Clínico**: *"Calcule a TMB e GET de um paciente"*, *"Sugira protocolo nutricional para hipertrofia ou emagrecimento"*, *"Interprete exames de ferritina e B12"*.
- **Operacional**: *"Cadastre um novo paciente"*, *"Agende uma consulta"*, *"Lance uma receita financeira"*.
- **Planos**: *"Quais são os diferenciais do Plano Premium?"*`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('nutrink_user_session');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
    setUserAccount(null);
    setIsAuthenticated(false);
    setIsProfileModalOpen(false);
    setAuthModalTab('login'); // strictly asks to enter email and password from original registration
    setIsLoginModalOpen(true);
  };

  // Real-time backend subscription sync (via Mercado Pago Webhook)
  useEffect(() => {
    if (!userAccount?.email) return;

    const checkBackendSubscription = async () => {
      try {
        const email = encodeURIComponent(userAccount.email.trim().toLowerCase());
        const res = await safeFetchJson<{ hasActiveSubscription: boolean; planId: any }>(`/api/payments/user-subscription/${email}`);
        if (res.ok && res.data) {
          const data = res.data;
          if (data.hasActiveSubscription && (!userAccount.isSubscribed || userAccount.plan !== data.planId)) {
            const upgradedUser: UserAccount = {
              ...userAccount,
              plan: data.planId,
              isSubscribed: true,
              dailyMessageLimit: 99999,
              monthlyMessageLimit: 99999
            };
            setUserAccount(upgradedUser);
            localStorage.setItem('nutrink_user_session', JSON.stringify(upgradedUser));

            // Also update registered users list in local DB
            const registeredRaw = localStorage.getItem('nutrink_registered_users');
            if (registeredRaw) {
              const regList = JSON.parse(registeredRaw);
              const updatedList = regList.map((u: any) => 
                u.email?.toLowerCase() === userAccount.email.toLowerCase()
                  ? { ...u, plan: data.planId, isSubscribed: true }
                  : u
              );
              localStorage.setItem('nutrink_registered_users', JSON.stringify(updatedList));
            }
          }
        }
      } catch {
        // silent fallback
      }
    };

    checkBackendSubscription();
    const subSyncInterval = setInterval(checkBackendSubscription, 10000);
    return () => clearInterval(subSyncInterval);
  }, [userAccount?.email, userAccount?.plan, userAccount?.isSubscribed]);

  // Iframe Compatibility & Cross-Framework PostMessage Bridge (Hostinger, React, Next, Vue, Nuxt, Angular, Svelte, WordPress)
  useEffect(() => {
    // Notify parent window that NutrinK is loaded and ready
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'NUTRINK_APP_READY',
          version: '1.0.0',
          compatibleFrameworks: ['Angular', 'Astro', 'Gatsby', 'Next.js', 'Nitro', 'Nuxt', 'Parcel', 'React', 'React Router', 'Svelte', 'SvelteKit', 'Vite', 'Vue.js'],
          status: 'online'
        }, '*');
      }
    } catch {
      // Ignore cross-origin exceptions
    }

    const handleParentMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        // Navigate tab from parent framework / CMS
        if (data.type === 'NUTRINK_NAVIGATE' && data.tab) {
          const validTabs = ['dashboard', 'patients', 'calendar', 'finance', 'nutricalc', 'telemedicine', 'nutria_hub', 'plans'];
          if (validTabs.includes(data.tab)) {
            setCurrentTab(data.tab);
          }
        }

        // Open modals from parent framework
        if (data.type === 'NUTRINK_OPEN_MODAL') {
          if (data.modal === 'new_patient') setIsNewPatientOpen(true);
          if (data.modal === 'new_appointment') setIsNewAppointmentOpen(true);
          if (data.modal === 'new_transaction') setIsNewTransactionOpen(true);
          if (data.modal === 'subscription' || data.modal === 'plans') setIsSubscriptionModalOpen(true);
          if (data.modal === 'login') setIsLoginModalOpen(true);
          if (data.modal === 'profile') setIsProfileModalOpen(true);
        }

        // Parent framework requesting app state/statistics
        if (data.type === 'NUTRINK_REQUEST_STATE') {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'NUTRINK_STATE_RESPONSE',
              patientsCount: patients.length,
              appointmentsCount: appointments.length,
              transactionsCount: transactions.length,
              isAuthenticated: !!userAccount,
              user: userAccount ? { name: userAccount.name, email: userAccount.email, plan: userAccount.plan } : null
            }, '*');
          }
        }
      } catch (err) {
        console.warn('Iframe message processing warning:', err);
      }
    };

    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [patients.length, appointments.length, transactions.length, userAccount]);

  // Floating AI Chat
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // NUTRIA AI Conversation State
  const [nutriaMessages, setNutriaMessages] = useState<NutriaMessage[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      content: `Olá, Doutor(a)! Eu sou a **NUTRIA**, sua inteligência operacional e copiloto clínico no ecossistema NutrinK.

Como posso otimizar sua rotina hoje? Você pode me solicitar:
- **Operacional**: *"Cadastre um novo paciente chamado Rodrigo, 32 anos, 80kg"*, *"Agende consulta para amanhã às 15h"*, *"Lance uma receita de R$ 350 via PIX"*.
- **Clínico**: *"Calcule a TMB e GET de um paciente de 75kg e 178cm"*, *"Sugira o cardápio e aporte de proteína para hipertrofia"*, *"Interprete os exames de ferritina e B12"*.
- **Planos**: *"Quais são os planos de assinatura do NutrinK?"*`,
      timestamp: '08:00'
    }
  ]);
  const [isNutriaLoading, setIsNutriaLoading] = useState(false);

  // Selected Patient object
  const activePatient = patients.find(p => p.id === selectedPatientId) || null;

  // Revenue computations
  const totalRevenue = transactions
    .filter(t => t.type === 'receita' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'despesa' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Update appointment status
  const handleUpdateAppointmentStatus = (aptId: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
  };

  // Open modal with preselected patient
  const handleOpenNewAppointmentWithPatient = (patient: Patient) => {
    setPreSelectedPatientForApt(patient);
    setIsNewAppointmentOpen(true);
  };

  // Patient Updates
  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Open NUTRIA with a prompt
  const handleOpenNutriaWithPrompt = (prompt: string) => {
    setIsFloatingChatOpen(true);
    handleSendNutriaMessage(prompt);
  };

  // Subscription plan selection
  const handleSelectPlan = (plan: SubscriptionPlan, registeredUser?: Partial<UserAccount>) => {
    let finalUser: UserAccount;
    setUserAccount(prev => {
      const base = registeredUser ? { ...effectiveUserAccount, ...registeredUser } : (prev || effectiveUserAccount);
      const updated: UserAccount = {
        ...base,
        plan: plan,
        isSubscribed: plan !== 'free',
        subscriptionExpiresAt: plan === 'premium_anual' ? '15/08/2027' : '15/09/2026'
      };
      finalUser = updated;
      try {
        localStorage.setItem('nutrink_user_session', JSON.stringify(updated));
        if (updated.email) {
          localStorage.setItem('nutrink_last_email', updated.email.trim().toLowerCase());
        }
      } catch {}
      return updated;
    });
    setIsAuthenticated(true);
    setIsSubscriptionModalOpen(false);
    
    // Direct back to Dashboard
    setCurrentTab('dashboard');

    const userName = registeredUser?.name || userAccount?.name || 'Doutor(a)';

    // Confirmation message in NUTRIA
    const upgradeMsg: NutriaMessage = {
      id: `msg-upg-${Date.now()}`,
      role: 'assistant',
      content: `# 🎉 PARABÉNS, ${userName.toUpperCase()}! SEU CONSULTÓRIO ESTÁ ATIVADO!
      
Seu acesso ao **Plano ${plan === 'premium_anual' ? 'Premium Anual (R$ 399,00 à vista via PIX)' : 'Premium Mensal (R$ 39,00 à vista via PIX)'}** foi liberado e seu cadastro foi registrado com sucesso!

### 🌟 Seu Consultório Inteligente Desbloqueado:
- **Copiloto NUTRIA ILIMITADO**: Sem restrições de mensagens, cálculos ou consultas.
- **Relatórios & Prescrições Completas**: Prontas para impressão e envio aos pacientes.
- **NutriCalc & Todos os Módulos**: Acesso irrestrito a todas as ferramentas clínicas e financeiras.

> 🔑 **Credenciais de Acesso:** Sua senha foi configurada. Para seus próximos acessos ao sistema, basta utilizar seu e-mail cadastrado e sua senha.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setNutriaMessages(prev => [...prev, upgradeMsg]);
  };

  // Intercept Mercado Pago return URL redirects (/sucesso, /erro, /pendente or ?payment_status=approved...)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase();
      const paymentStatus = urlParams.get('payment_status') || urlParams.get('collection_status') || urlParams.get('status');
      const planParam = urlParams.get('plan') as SubscriptionPlan | null;

      const isSuccessRoute = pathname.includes('/sucesso') || paymentStatus === 'approved';
      const isErrorRoute = pathname.includes('/erro') || paymentStatus === 'rejected' || paymentStatus === 'failure';
      const isPendingRoute = pathname.includes('/pendente') || paymentStatus === 'pending' || paymentStatus === 'in_process';

      if (isSuccessRoute) {
        const targetPlan: SubscriptionPlan = planParam === 'premium_anual' ? 'premium_anual' : 'premium_mensal';
        handleSelectPlan(targetPlan);
        
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch {}

        // Clean query parameters and pathname back to root without reloading
        window.history.replaceState({}, document.title, '/');
      } else if (isPendingRoute) {
        setNutriaMessages(prev => [
          ...prev,
          {
            id: `msg-pending-${Date.now()}`,
            role: 'assistant',
            content: `⏳ **Pagamento em Análise no Mercado Pago!**\n\nRecebemos seu pedido de assinatura. Caso tenha optado por boleto bancário ou PIX em processamento, seu plano será ativado automaticamente assim que a compensação for confirmada.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        window.history.replaceState({}, document.title, '/');
      } else if (isErrorRoute) {
        setNutriaMessages(prev => [
          ...prev,
          {
            id: `msg-error-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ **Transação não concluída no Mercado Pago.**\n\nO pagamento não foi processado pela operadora. Você pode tentar novamente com outro cartão, saldo ou PIX instantâneo no menu **Minha Conta > Assinatura**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        window.history.replaceState({}, document.title, '/');
      }
    } catch (e) {
      console.warn('Erro ao processar retorno do Mercado Pago:', e);
    }
  }, []);

  // Send message to NUTRIA Backend
  const handleSendNutriaMessage = async (userInput: string) => {
    // Check if user is asking about plans directly
    const inputLower = userInput.toLowerCase();
    const isPlanInquiry = inputLower.includes('plano') || inputLower.includes('assinatura') || inputLower.includes('preço') || inputLower.includes('valor') || inputLower.includes('quanto custa') || inputLower.includes('upgrade');

    const userPlan = effectiveUserAccount.plan;
    const isFree = userPlan === 'free';
    const msgCount = effectiveUserAccount.dailyMessageCount;
    const msgLimit = effectiveUserAccount.dailyMessageLimit;

    // Free tier message limit enforcement (unless inquiring about plans)
    if (isFree && msgCount >= msgLimit && !isPlanInquiry) {
      const userMsg: NutriaMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: userInput,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      const isUnauthenticated = !isAuthenticated || !userAccount?.email || userAccount.id === 'usr-unauthenticated';

      const limitBlockedMsg: NutriaMessage = {
        id: `msg-limit-${Date.now() + 1}`,
        role: 'assistant',
        content: isUnauthenticated
          ? `🔒 Você atingiu o limite de **30 mensagens gratuitas** por dia com a NUTRIA. Para continuar enviando comandos, salvando prontuários e gerando prescrições clínicas completas, **crie sua conta gratuita** ou assine o **Plano Premium**!`
          : `🔒 Você atingiu o limite de **30 mensagens diárias** do Plano Gratuito. Assine o **Plano Premium** (R$ 39,90/mês ou R$ 399,90/ano) para ter conversas ilimitadas e relatórios clínicos completos!

---

### 📊 Conheça as Vantagens do Plano Premium NutrinK:
- **NUTRIA Ilimitada**: Sem restrições de mensagens diárias.
- **Relatórios Completos**: Tabelas de macronutrientes, micronutrientes e exames prontos para download.
- **NutriCalc Avançado**: Cálculos metabólicos de Harris-Benedict, Cunningham e Mifflin-St Jeor.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isLocked: true
      };

      setNutriaMessages(prev => [...prev, userMsg, limitBlockedMsg]);

      if (isUnauthenticated) {
        handleOpenLoginModal('register');
      } else {
        setIsSubscriptionModalOpen(true);
      }
      return;
    }

    const userMsg: NutriaMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setNutriaMessages(prev => [...prev, userMsg]);
    setIsNutriaLoading(true);

    // Increment message count for free users (both authenticated and guest)
    if (isFree) {
      if (userAccount) {
        setUserAccount(prev => {
          if (!prev) return null;
          const updated = {
            ...prev,
            dailyMessageCount: prev.dailyMessageCount + 1
          };
          try {
            localStorage.setItem('nutrink_user_session', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      } else {
        setGuestDailyCount(prevCount => {
          const next = prevCount + 1;
          try {
            localStorage.setItem('nutrink_guest_msg_count', next.toString());
          } catch {}
          return next;
        });
      }
    }

    try {
      const result = await callNutriaDirect({
        message: userInput,
        activePatient: activePatient,
        patients: patients,
        userAccount: effectiveUserAccount,
        conversationHistory: nutriaMessages.slice(-6).map(m => ({
          role: m.role,
          content: m.content
        })),
        appContext: {
          patientsCount: patients.length,
          todayAppointmentsCount: appointments.filter(a => a.date === '2026-08-15').length,
          monthlyRevenue: totalRevenue,
          monthlyExpenses: totalExpenses,
          userPlan: effectiveUserAccount.plan
        }
      });

      // Check if NUTRIA executed an operational action
      let actionExecuted: NutriaActionExecution | undefined = result.actionExecuted;

      if (actionExecuted) {
        // Apply action to application state
        if ((actionExecuted.type === 'patient_created' || actionExecuted.type === 'ADD_PATIENT') && actionExecuted.payload) {
          const newPat: Patient = actionExecuted.payload;
          setPatients(prev => [newPat, ...prev]);
        } else if ((actionExecuted.type === 'appointment_scheduled' || actionExecuted.type === 'SCHEDULE_APPOINTMENT') && actionExecuted.payload) {
          const newApt: Appointment = actionExecuted.payload;
          setAppointments(prev => [...prev, newApt]);
        } else if ((actionExecuted.type === 'transaction_logged' || actionExecuted.type === 'ADD_FINANCE_TRANSACTION') && actionExecuted.payload) {
          const newTx: FinancialTransaction = actionExecuted.payload;
          setTransactions(prev => [newTx, ...prev]);
        } else if ((actionExecuted.type === 'meal_plan_generated' || actionExecuted.type === 'UPDATE_MEAL_PLAN') && actionExecuted.payload) {
          const { patientId, mealPlan } = actionExecuted.payload;
          setPatients(prev => prev.map(p => {
            if (p.id === patientId || p.name.toLowerCase() === activePatient?.name.toLowerCase()) {
              return { ...p, mealPlan };
            }
            return p;
          }));
        } else if (actionExecuted.type === 'NAVIGATE_TAB' && actionExecuted.payload?.tab) {
          setCurrentTab(actionExecuted.payload.tab);
        } else if (actionExecuted.type === 'OPEN_SUBSCRIPTION_MODAL') {
          setIsSubscriptionModalOpen(true);
        } else if (actionExecuted.type === 'OPEN_INSTITUTIONAL_DOC' && actionExecuted.payload?.pageId) {
          setActiveInstitutionalPageId(actionExecuted.payload.pageId);
          setIsInstitutionalModalOpen(true);
        } else if (actionExecuted.type === 'OPEN_LOGIN_MODAL') {
          setIsLoginModalOpen(true);
        }
      }

      const replyContent = result.reply || "Solicitação processada com sucesso no ecossistema NutrinK.";

      const assistantMsg: NutriaMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        actionExecuted
      };

      setNutriaMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Erro ao consultar NUTRIA:', err);

      const fallbackMsg: NutriaMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu uma instabilidade momentânea na conexão. Os dados da sua consulta foram mantidos com segurança.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setNutriaMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsNutriaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white">
      
      {/* Top Application Header */}
      <Header
        onOpenNewPatient={() => setIsNewPatientOpen(true)}
        onOpenNewAppointment={() => {
          setPreSelectedPatientForApt(null);
          setIsNewAppointmentOpen(true);
        }}
        onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
        onOpenNutriaChat={() => setIsFloatingChatOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenLoginModal={() => handleOpenLoginModal('login')}
        userAccount={userAccount}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
      />

      {/* Navigation Sub-header / Tabs */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'patients') {
            setSelectedPatientId(null);
          }
        }}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        unreadNutriaAlerts={2}
        todayAppointmentsCount={appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
      />

      {/* Main Content Area with 90px bottom padding to prevent FAB overlap */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-[90px]" style={{ paddingBottom: '90px' }}>
        
        {currentTab === 'plans' && (
          <MercadoPagoSubscriptionsView
            userAccount={userAccount || undefined}
            onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            onSelectPlan={(plan, billingCycle) => {
              if (userAccount) {
                const planId = billingCycle === 'annual' ? 'premium_anual' : 'premium_mensal';
                const upgradedUser: UserAccount = {
                  ...userAccount,
                  plan: planId,
                  isSubscribed: true,
                  dailyMessageLimit: 99999,
                  monthlyMessageLimit: 99999
                };
                setUserAccount(upgradedUser);
                localStorage.setItem('nutrink_user_session', JSON.stringify(upgradedUser));
              }
            }}
          />
        )}
        
        {currentTab === 'dashboard' && (
          <DashboardView
            patients={patients}
            appointments={appointments}
            transactions={transactions}
            userAccount={userAccount}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setCurrentTab('patients');
            }}
            onOpenNewPatient={() => setIsNewPatientOpen(true)}
            onOpenNewAppointment={() => {
              setPreSelectedPatientForApt(null);
              setIsNewAppointmentOpen(true);
            }}
            onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
            onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

        {currentTab === 'patients' && (
          <PatientsView
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onOpenNewPatient={() => setIsNewPatientOpen(true)}
            onOpenNewAppointmentWithPatient={handleOpenNewAppointmentWithPatient}
            onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
            onUpdatePatient={handleUpdatePatient}
            foodDatabase={INITIAL_FOOD_DATABASE}
            userAccount={userAccount || undefined}
            onStartTelemedicine={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentTab('telemedicine');
            }}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            appointments={appointments}
            patients={patients}
            onOpenNewAppointment={() => {
              setPreSelectedPatientForApt(null);
              setIsNewAppointmentOpen(true);
            }}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setCurrentTab('patients');
            }}
            onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
            onStartTelemedicine={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentTab('telemedicine');
            }}
          />
        )}

        {currentTab === 'finance' && (
          <FinanceView
            transactions={transactions}
            patients={patients}
            onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
            onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
          />
        )}

        {currentTab === 'nutricalc' && (
          <NutriCalcView
            onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
          />
        )}

        {currentTab === 'telemedicine' && (
          <TelemedicineView
            patients={patients}
            appointments={appointments}
            userAccount={effectiveUserAccount}
            onUpdatePatient={handleUpdatePatient}
            onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
            onNavigateTab={(tab) => {
              if (tab === 'patients' && selectedPatientId) {
                setCurrentTab('patients');
              } else {
                setCurrentTab(tab);
              }
            }}
          />
        )}

        {currentTab === 'nutria_hub' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-fuchsia-400" />
                  Central NUTRIA • Assistente & Copiloto Clínico
                </h1>
                <p className="text-xs text-purple-300">
                  Gerencie prontuários, planos alimentares, exames e rotinas por texto ou voz.
                </p>
              </div>
            </div>

            <NutriaCopilot
              messages={nutriaMessages}
              onSendMessage={handleSendNutriaMessage}
              isLoading={isNutriaLoading}
              activePatient={activePatient}
              todayAppointments={appointments.filter(a => a.date === '2026-08-15')}
              patientsCount={patients.length}
              monthlyRevenue={totalRevenue}
              monthlyExpenses={totalExpenses}
              userAccount={effectiveUserAccount}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={(tab) => handleOpenLoginModal(tab || 'register')}
            />
          </div>
        )}

      </main>

      {/* Institutional Footer */}
      <Footer 
        onOpenPage={handleOpenInstitutionalPage}
        onOpenPlans={() => setIsSubscriptionModalOpen(true)}
        onOpenLogin={handleOpenLoginModal}
      />

      {/* Floating NUTRIA Action Button (when not on nutria_hub and drawer is closed) */}
      {currentTab !== 'nutria_hub' && !isFloatingChatOpen && (
        <button
          onClick={() => setIsFloatingChatOpen(true)}
          className="fixed bottom-4 right-4 z-50 px-3.5 py-2.5 sm:px-4 sm:py-2.5 max-w-[180px] sm:max-w-none bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-full shadow-2xl hover:shadow-fuchsia-500/40 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 border border-fuchsia-400/50 group shadow-purple-950/90 cursor-pointer"
          id="btn-open-nutria-floating"
          title="Falar com Copiloto NUTRIA AI"
        >
          <div className="relative shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-fuchsia-300 rounded-full animate-ping"></span>
          </div>
          <span className="truncate text-xs sm:text-sm font-bold tracking-tight">
            Falar com NUTRIA
          </span>
        </button>
      )}

      {/* Floating NUTRIA Chat Drawer */}
      {isFloatingChatOpen && (
        <div 
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-32px)] sm:w-full max-w-md p-1 sm:p-2"
        >
          <NutriaCopilot
            messages={nutriaMessages}
            onSendMessage={handleSendNutriaMessage}
            isLoading={isNutriaLoading}
            activePatient={activePatient}
            todayAppointments={appointments.filter(a => a.date === '2026-08-15')}
            patientsCount={patients.length}
            monthlyRevenue={totalRevenue}
            monthlyExpenses={totalExpenses}
            isFloating={true}
            onCloseFloating={() => setIsFloatingChatOpen(false)}
            userAccount={effectiveUserAccount}
            onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            onOpenLoginModal={(tab) => handleOpenLoginModal(tab || 'register')}
          />
        </div>
      )}

      {/* Institutional Document Modal (Markdown viewer with copy, print, tabs) */}
      <InstitutionalDocModal
        isOpen={isInstitutionalModalOpen}
        initialPageId={activeInstitutionalPageId}
        onClose={() => setIsInstitutionalModalOpen(false)}
        onOpenNutriaPrompt={(prompt) => {
          setIsInstitutionalModalOpen(false);
          setIsFloatingChatOpen(true);
          handleSendNutriaMessage(prompt);
        }}
        onOpenSubscriptionModal={() => {
          setIsInstitutionalModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        onSelectPlan={() => {
          setIsInstitutionalModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        onOpenLoginModal={() => {
          setIsInstitutionalModalOpen(false);
          handleOpenLoginModal('login');
        }}
        onOpenLogin={() => {
          setIsInstitutionalModalOpen(false);
          handleOpenLoginModal('login');
        }}
      />

      {/* Login & Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={userAccount}
        onLoginAs={handleLoginAs}
        onOpenTermsDoc={(pageId) => {
          setIsLoginModalOpen(false);
          handleOpenInstitutionalPage(pageId);
        }}
        isMandatoryAuth={false}
      />

      {/* Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userAccount={effectiveUserAccount}
        onSelectPlan={(plan, billingCycle, registeredUser) => handleSelectPlan(plan, registeredUser)}
        isAuthenticated={isAuthenticated}
        onOpenLoginModal={(tab) => handleOpenLoginModal(tab || 'register')}
      />

      {/* User Account / Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userAccount={effectiveUserAccount}
        onUpdateUserAccount={(updated) => {
          const updatedFull: UserAccount = { ...effectiveUserAccount, ...updated };
          setUserAccount(updatedFull);
          try {
            localStorage.setItem('nutrink_user_session', JSON.stringify(updatedFull));
          } catch {}
        }}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenLoginModal={(tab) => {
          setIsProfileModalOpen(false);
          handleOpenLoginModal(tab || 'login');
        }}
        onLogout={handleLogout}
      />

      {/* Clinical Modals */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onSavePatient={(newPatient) => {
          setPatients(prev => [newPatient, ...prev]);
        }}
      />

      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => {
          setIsNewAppointmentOpen(false);
          setPreSelectedPatientForApt(null);
        }}
        patients={patients}
        preSelectedPatient={preSelectedPatientForApt}
        onSaveAppointment={(newApt) => {
          setAppointments(prev => [...prev, newApt]);
        }}
      />

      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
        patients={patients}
        onSaveTransaction={(newTx) => {
          setTransactions(prev => [newTx, ...prev]);
        }}
      />

    </div>
  );
}

export default App;
