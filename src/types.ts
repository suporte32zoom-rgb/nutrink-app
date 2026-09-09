export type Gender = 'masculino' | 'feminino' | 'outro';

export type PatientObjective = 
  | 'hipertrofia' 
  | 'emagrecimento' 
  | 'saude_longevidade' 
  | 'performance_esportiva' 
  | 'manejo_diabetes' 
  | 'saude_intestinal' 
  | 'reeducacao_alimentar' 
  | 'vegetariano_vegano'
  | 'gestacao_lactacao'
  | 'outro';

export type Objective = PatientObjective;

export type LocationType = 'presencial_consultorio' | 'online_video';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'dinheiro' | 'transferencia';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  portion: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealItem {
  id: string;
  foodName: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  substitutes?: string;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  items: MealItem[];
  notes?: string;
}

export interface MealPlan {
  id: string;
  title: string;
  dateCreated: string;
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetFiberGrams: number;
  meals: Meal[];
  generalGuidelines?: string;
  hydrationGoalLiters: number;
  supplements?: string[];
}

export interface LabMarker {
  id: string;
  marker: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'baixo' | 'elevado' | 'critico';
  interpretation?: string;
}

export interface LabExam {
  id: string;
  patientId: string;
  date: string;
  title: string;
  laboratory?: string;
  markers: LabMarker[];
  nutriaClinicalReview?: string;
}

export interface AnthropometricRecord {
  id: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  waistCircumferenceCm?: number;
  hipCircumferenceCm?: number;
  armCircumferenceCm?: number;
  thighCircumferenceCm?: number;
  tricepsFoldMm?: number;
  subscapularFoldMm?: number;
  suprailiacFoldMm?: number;
  abdominalFoldMm?: number;
  notes?: string;
}

export interface Anamnese {
  clinicalHistory?: string;
  foodAllergiesAndIntolerances?: string;
  dietaryPreferences?: string;
  dietaryAversions?: string;
  routineAndOccupation?: string;
  bowelHabit?: 'diario_normal' | 'constipado' | 'diarreico' | 'irregular';
  sleepHoursPerNight?: number;
  waterIntakeLiters?: number;
  physicalActivity?: string;
  alcoholConsumption?: 'nunca' | 'social' | 'frequente';
  smoking?: boolean;
  currentMedicationsAndSupplements?: string;
  emotionalRelationshipWithFood?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  age: number;
  gender: Gender;
  objective: PatientObjective;
  initialWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercentage: number;
  muscleMassPercentage?: number;
  activityFactor: number; // 1.2, 1.375, 1.55, 1.725, 1.9
  tmb: number;
  get: number;
  anamnese: Anamnese;
  mealPlan?: MealPlan;
  evolutionHistory: AnthropometricRecord[];
  labExams: LabExam[];
  notes: string;
  status: 'ativo' | 'em_espera' | 'inativo';
  createdAt: string;
  tags: string[];
  lastConsultationDate?: string;
  nextConsultationDate?: string;
}

export type AppointmentStatus = 'confirmada' | 'pendente' | 'realizada' | 'cancelada';
export type AppointmentType = 
  | 'primeira_consulta' 
  | 'retorno' 
  | 'avaliacao_bioimpedancia' 
  | 'ajuste_plano' 
  | 'consultoria_online';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  price: number;
  paymentStatus: 'pago' | 'pendente';
  paymentMethod?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'dinheiro';
  notes?: string;
  location: 'presencial_consultorio' | 'online_video';
}

export type TransactionType = 'receita' | 'despesa';
export type TransactionCategory = 
  | 'consulta_avulsa' 
  | 'plano_mensal' 
  | 'plano_trimestral' 
  | 'plano_semestral' 
  | 'bioimpedancia' 
  | 'aluguel_sala' 
  | 'software_sistemas' 
  | 'marketing_anuncios' 
  | 'insumos_materiais' 
  | 'cursos_congressos' 
  | 'impostos' 
  | 'outros';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'dinheiro' | 'transferencia';
  status: 'concluido' | 'pendente' | 'cancelado';
  patientId?: string;
  patientName?: string;
  receiptNumber?: string;
}

export interface NutriaActionExecution {
  type: 
    | 'ADD_PATIENT'
    | 'patient_created'
    | 'UPDATE_PATIENT'
    | 'SCHEDULE_APPOINTMENT'
    | 'appointment_scheduled'
    | 'CANCEL_APPOINTMENT'
    | 'ADD_FINANCE_TRANSACTION'
    | 'transaction_logged'
    | 'UPDATE_MEAL_PLAN'
    | 'meal_plan_generated'
    | 'NAVIGATE_TAB'
    | 'INTERPRET_LABS'
    | 'CALCULATE_ENERGY_METRICS'
    | 'OPEN_SUBSCRIPTION_MODAL'
    | 'UPGRADE_PLAN'
    | 'OPEN_INSTITUTIONAL_DOC'
    | 'OPEN_LOGIN_MODAL';
  payload: any;
  summary: string;
}

export type SubscriptionPlan = 'free' | 'premium_mensal' | 'premium_anual';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  crn: string;
  specialty: string;
  plan: SubscriptionPlan;
  dailyMessageCount: number;
  dailyMessageLimit: number;
  monthlyMessageCount: number;
  monthlyMessageLimit: number;
  isSubscribed: boolean;
  activeSince: string;
  renewalDate?: string;
  subscriptionExpiresAt?: string;
  paymentMethod?: 'pix' | 'cartao_credito';
  phone?: string;
  cpf?: string;
  clinicAddress?: string;
  clinicName?: string;
  prescriptionFooter?: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'local' | 'email';
  googleId?: string;
}

export interface NutriaMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionExecuted?: NutriaActionExecution;
  quickPrompts?: string[];
  isLocked?: boolean;
}

export interface ClinicalProtocol {
  id: string;
  name: string;
  category: string;
  indication: string;
  targetKcalStrategy: string;
  proteinRangeGPerKg: string;
  carbsRangePercentage: string;
  fatRangePercentage: string;
  keyNutrients: string[];
  recommendedFoods: string[];
  foodsToLimit: string[];
  clinicalObservations: string;
}

export interface LiveTranscriptItem {
  id: string;
  speaker: 'nutricionista' | 'paciente' | 'nutria';
  text: string;
  timestamp: string;
}

export interface LiveClinicalInsight {
  id: string;
  type: 'calculo' | 'suplemento' | 'conduta' | 'alerta';
  title: string;
  description: string;
  badge?: string;
  timestamp: string;
  applied?: boolean;
}

export interface TelemedicineSession {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  roomName: string;
  roomUrl: string;
  status: 'preparando' | 'em_andamento' | 'encerrada';
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  transcripts: LiveTranscriptItem[];
  insights: LiveClinicalInsight[];
  clinicalSummary?: string;
  generatedMealPlanDraft?: MealPlan;
  dietStrategySuggested?: string;
  estimatedTMB?: number;
  estimatedGET?: number;
  suggestedSupplements?: string[];
}

