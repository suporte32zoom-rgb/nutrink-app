import { useState, useCallback } from 'react';
import { callNutriaDirect, NutriaCallParams, NutriaResponse } from '../services/nutriaGeminiDirect';
import { Patient, UserAccount } from '../types';

export interface UseNutriaOptions {
  activePatient?: Patient | null;
  patients?: Patient[];
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
      conversationHistory: Array<{ role: string; content: string }> = []
    ): Promise<NutriaResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callNutriaDirect({
          message,
          conversationHistory,
          activePatient: options.activePatient,
          patients: options.patients,
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
    [options.activePatient, options.patients, options.userAccount, options.appContext]
  );

  return {
    sendMessage,
    isLoading,
    lastResponse,
    error
  };
}
