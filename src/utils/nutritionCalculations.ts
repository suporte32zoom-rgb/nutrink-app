import { Gender } from '../types';

export interface TMBInput {
  formula: 'mifflin' | 'harris_benedict' | 'cunningham' | 'dri';
  gender: Gender;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  bodyFatPercentage?: number;
  activityFactor: number;
}

export interface TMBResult {
  tmb: number;
  get: number;
  bmi: number;
  bmiClassification: string;
  idealWeightRange: { min: number; max: number };
  waterRecommendationLiters: number;
  waterRecommendationMl: number;
  macronutrientSuggestion: {
    protein: { grams: number; gramsPerKg: number; calories: number; percentage: number };
    carbs: { grams: number; gramsPerKg: number; calories: number; percentage: number };
    fat: { grams: number; gramsPerKg: number; calories: number; percentage: number };
  };
}

/**
 * Normaliza qualquer valor de altura inserido (cm ou m) para metros:
 * - Se > 3.0 (ex: 175, 180), considera centímetros e divide por 100 -> 1.75 m
 * - Se <= 3.0 e > 0 (ex: 1.75, 1.80), já está em metros -> 1.75 m
 * - Se <= 0 ou inválido -> 0
 */
export function normalizeHeightToMeters(height: number): number {
  if (!height || isNaN(height) || height <= 0) return 0;
  return height > 3.0 ? Number((height / 100).toFixed(2)) : Number(height.toFixed(2));
}

/**
 * Normaliza qualquer valor de altura inserido (cm ou m) para centímetros:
 * - Se <= 3.0 e > 0 (ex: 1.75, 1.80), considera metros e multiplica por 100 -> 175 cm
 * - Se > 3.0 (ex: 175, 180), já está em centímetros -> 175 cm
 * - Se <= 0 ou inválido -> 0
 */
export function normalizeHeightToCm(height: number): number {
  if (!height || isNaN(height) || height <= 0) return 0;
  return height <= 3.0 ? Math.round(height * 100) : Math.round(height);
}

/**
 * Cálculo Dinâmico de IMC:
 * Padroniza a altura em metros antes de calcular: peso / (alturaEmMetros * alturaEmMetros)
 */
export function calculateBMI(weightKg: number, rawHeight: number): {
  bmi: number;
  classification: string;
  idealRange: { min: number; max: number };
} {
  const heightM = normalizeHeightToMeters(rawHeight);
  if (!weightKg || weightKg <= 0 || heightM <= 0) {
    return { bmi: 0, classification: '-', idealRange: { min: 0, max: 0 } };
  }

  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let classification = 'Eutrofia (Peso Normal)';

  if (bmi < 18.5) classification = 'Baixo Peso';
  else if (bmi < 25.0) classification = 'Eutrofia (Peso Saudável)';
  else if (bmi < 30.0) classification = 'Sobrepeso (Pré-obesidade)';
  else if (bmi < 35.0) classification = 'Obesidade Grau I';
  else if (bmi < 40.0) classification = 'Obesidade Grau II (Severa)';
  else classification = 'Obesidade Grau III (Mórbida)';

  const minWeight = Number((18.5 * heightM * heightM).toFixed(1));
  const maxWeight = Number((24.9 * heightM * heightM).toFixed(1));

  return {
    bmi,
    classification,
    idealRange: { min: minWeight, max: maxWeight }
  };
}

/**
 * Cálculo Dinâmico de TMB (Mifflin-St Jeor):
 * - Homens: (10 * peso_kg) + (6.25 * altura_cm) - (5 * idade) + 5
 * - Mulheres: (10 * peso_kg) + (6.25 * altura_cm) - (5 * idade) - 161
 */
export function calculateMifflinTMB(
  gender: Gender,
  weightKg: number,
  rawHeight: number,
  ageYears: number
): number {
  if (!weightKg || weightKg <= 0 || !rawHeight || rawHeight <= 0 || !ageYears || ageYears <= 0) {
    return 0;
  }
  const heightCm = normalizeHeightToCm(rawHeight);
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
  const tmb = gender === 'masculino' ? base + 5 : base - 161;
  return Math.max(0, Math.round(tmb));
}

/**
 * Cálculo Dinâmico de GET (Gasto Energético Total):
 * GET = TMB * fator_NAF_selecionado
 */
export function calculateGET(tmb: number, activityFactor: number): number {
  if (!tmb || tmb <= 0) return 0;
  const naf = activityFactor > 0 ? activityFactor : 1.2;
  return Math.round(tmb * naf);
}

/**
 * Cálculo Dinâmico de Meta Hídrica:
 * Meta Hídrica = peso_kg * 35 (resultado em mL/dia e Litros/dia)
 */
export function calculateWaterRecommendation(weightKg: number): { ml: number; liters: number } {
  if (!weightKg || weightKg <= 0) {
    return { ml: 0, liters: 0 };
  }
  const ml = Math.round(weightKg * 35);
  const liters = Number((ml / 1000).toFixed(1));
  return { ml, liters };
}

/**
 * Cálculo Completo de Taxas Metabólicas e Distribuição Nutricional
 */
export function calculateMetabolicRates(input: TMBInput): TMBResult {
  const { formula, gender, weightKg, heightCm: rawHeight, ageYears, bodyFatPercentage, activityFactor } = input;

  const heightCm = normalizeHeightToCm(rawHeight);
  const heightM = normalizeHeightToMeters(rawHeight);
  const isInputValid = weightKg > 0 && heightCm > 0 && ageYears > 0;

  let tmb = 0;

  if (isInputValid) {
    if (formula === 'mifflin') {
      // Mifflin-St Jeor:
      // Homens: (10 * peso_kg) + (6.25 * altura_cm) - (5 * idade) + 5
      // Mulheres: (10 * peso_kg) + (6.25 * altura_cm) - (5 * idade) - 161
      tmb = calculateMifflinTMB(gender, weightKg, heightCm, ageYears);
    } else if (formula === 'harris_benedict') {
      // Harris-Benedict revisada (Roza & Shizgal 1984):
      if (gender === 'masculino') {
        tmb = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears);
      } else {
        tmb = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
      }
    } else if (formula === 'cunningham') {
      // Cunningham (1980): 500 + 22 * Massa Livre de Gordura (FFM)
      const bf = bodyFatPercentage && bodyFatPercentage > 0 ? bodyFatPercentage : (gender === 'masculino' ? 15 : 23);
      const ffm = weightKg * (1 - bf / 100);
      tmb = 500 + (22 * ffm);
    } else {
      // DRI / IOM
      if (gender === 'masculino') {
        tmb = 204 - (4.0 * ageYears) + (450.5 * heightM) + (11.69 * weightKg);
      } else {
        tmb = 255 - (2.35 * ageYears) + (361.5 * heightM) + (9.39 * weightKg);
      }
    }
    tmb = Math.max(0, Math.round(tmb));
  }

  const get = isInputValid && activityFactor > 0 ? Math.round(tmb * activityFactor) : 0;
  const bmiData = calculateBMI(weightKg, rawHeight);
  const waterData = calculateWaterRecommendation(weightKg);

  // Default balanced distribution (ex: 1.8g/kg ptn, 28% fat, rest carb)
  const ptnGrams = isInputValid ? Math.round(weightKg * 1.8) : 0;
  const ptnCals = ptnGrams * 4;
  const fatCals = get > 0 ? Math.round(get * 0.28) : 0;
  const fatGrams = Math.round(fatCals / 9);
  const carbCals = get > 0 ? Math.max(0, get - ptnCals - fatCals) : 0;
  const carbGrams = Math.round(carbCals / 4);

  return {
    tmb,
    get,
    bmi: bmiData.bmi,
    bmiClassification: bmiData.classification,
    idealWeightRange: bmiData.idealRange,
    waterRecommendationLiters: waterData.liters,
    waterRecommendationMl: waterData.ml,
    macronutrientSuggestion: {
      protein: {
        grams: ptnGrams,
        gramsPerKg: weightKg > 0 ? Number((ptnGrams / weightKg).toFixed(1)) : 0,
        calories: ptnCals,
        percentage: get > 0 ? Math.round((ptnCals / get) * 100) : 0
      },
      carbs: {
        grams: carbGrams,
        gramsPerKg: weightKg > 0 ? Number((carbGrams / weightKg).toFixed(1)) : 0,
        calories: carbCals,
        percentage: get > 0 ? Math.round((carbCals / get) * 100) : 0
      },
      fat: {
        grams: fatGrams,
        gramsPerKg: weightKg > 0 ? Number((fatGrams / weightKg).toFixed(1)) : 0,
        calories: fatCals,
        percentage: get > 0 ? Math.round((fatCals / get) * 100) : 0
      }
    }
  };
}

export function calculatePollock3Folds(
  gender: Gender,
  age: number,
  chestOrTricepsMm: number,
  abdomenOrSuprailiacMm: number,
  thighMm: number
): { bodyFatPercentage: number; density: number } {
  if (!age || age <= 0 || !chestOrTricepsMm || !abdomenOrSuprailiacMm || !thighMm) {
    return { bodyFatPercentage: 0, density: 0 };
  }

  const sumFolds = chestOrTricepsMm + abdomenOrSuprailiacMm + thighMm;
  let bodyDensity = 0;

  if (gender === 'masculino') {
    // Homens 3 dobras (Peitoral, Abdominal, Coxa):
    // DC = 1.10938 - (0.0008267 * soma) + (0.0000016 * (soma^2)) - (0.0002574 * idade)
    bodyDensity = 1.10938 - (0.0008267 * sumFolds) + (0.0000016 * Math.pow(sumFolds, 2)) - (0.0002574 * age);
  } else {
    // Mulheres 3 dobras (Tríceps, Supra-ilíaca, Coxa):
    // DC = 1.0994921 - (0.0009929 * soma) + (0.0000023 * (soma^2)) - (0.0001392 * idade)
    bodyDensity = 1.0994921 - (0.0009929 * sumFolds) + (0.0000023 * Math.pow(sumFolds, 2)) - (0.0001392 * age);
  }

  if (bodyDensity <= 0) return { bodyFatPercentage: 0, density: 0 };

  // Equação de Siri: %G = [(4.95 / DC) - 4.50] * 100
  const bodyFat = Number((((4.95 / bodyDensity) - 4.50) * 100).toFixed(1));
  const safeBf = Math.max(3, Math.min(60, bodyFat));

  return {
    bodyFatPercentage: safeBf,
    density: Number(bodyDensity.toFixed(4))
  };
}
