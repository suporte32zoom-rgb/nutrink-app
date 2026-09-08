import { useState, useCallback } from 'react';
import { callNutriaDirect, NutriaCallParams, NutriaResponse, getClientGeminiModel } from '../services/nutriaGeminiDirect';
import { Patient, Appointment, FinancialTransaction, UserAccount, NutriaMessage } from '../types';

export interface UseNutriaOptions {
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

export function useNutria(options: UseNutriaOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<NutriaResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (
      message: string, 
      conversationHistory: Array<{ role: string; content: string }> | NutriaMessage[] = []
    ): Promise<NutriaResponse> => {
      setIsLoading(true);
      setError(null);

      // Normaliza histórico para objetos { role, content }
      const formattedHistory = conversationHistory.map(item => ({
        role: item.role,
        content: item.content
      }));

      try {
        const response = await callNutriaDirect({
          message,
          conversationHistory: formattedHistory,
          activePatient: options.activePatient || options.patientContext,
          patientContext: options.patientContext || options.activePatient,
          patients: options.patients,
          appointments: options.appointments,
          transactions: options.transactions,
          userAccount: options.userAccount,
          appContext: options.appContext
        });

        setLastResponse(response);
        return response;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [options.activePatient, options.patientContext, options.patients, options.appointments, options.transactions, options.userAccount, options.appContext]
  );

  return {
    sendMessage,
    isLoading,
    lastResponse,
    error,
    modelName: getClientGeminiModel()
  };
}

