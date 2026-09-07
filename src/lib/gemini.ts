/**
 * NUTRIA - Integração do Google Gemini (lib/gemini.ts)
 * 
 * Centraliza a configuração do modelo dinâmico, diretrizes permanentes de atuação clínica
 * e histórico sanitizado para prevenir loops de repetição.
 */

import { GoogleGenAI } from '@google/genai';
import { 
  getClientGeminiModel, 
  getClientGeminiApiKey, 
  NUTRIA_SYSTEM_INSTRUCTION, 
  buildNutriaSystemInstruction,
  formatGeminiContents,
  callNutriaDirect,
  NutriaCallParams,
  NutriaResponse 
} from '../services/nutriaGeminiDirect';

export {
  getClientGeminiModel,
  getClientGeminiApiKey,
  NUTRIA_SYSTEM_INSTRUCTION,
  buildNutriaSystemInstruction,
  formatGeminiContents,
  callNutriaDirect
};

/**
 * Inicializador da API do Gemini utilizando @google/genai
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getClientGeminiApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Função utilitária de alto nível para envio de comandos e perguntas clínicas à NÚTRIA
 */
export async function askNutria(
  message: string, 
  options: Partial<NutriaCallParams> = {}
): Promise<NutriaResponse> {
  return callNutriaDirect({
    message,
    ...options
  });
}
