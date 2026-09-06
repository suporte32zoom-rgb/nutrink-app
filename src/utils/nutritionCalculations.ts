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
  macronutrientSuggestion: {
    protein: { grams: number; gramsPerKg: number; calories: number; percentage: number };
    carbs: { grams: number; gramsPerKg: number; calories: number; percentage: number };
    fat: { grams: number; gramsPerKg: number; calories: number; percentage: number };
  };
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; classification: string; idealRange: { min: number; max: number } } {
  const heightM = heightCm / 100;
  if (heightM <= 0) return { bmi: 0, classification: 'N/A', idealRange: { min: 0, max: 0 } };
  
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

export function calculateMetabolicRates(input: TMBInput): TMBResult {
  const { formula, gender, weightKg, heightCm, ageYears, bodyFatPercentage, activityFactor } = input;
  let tmb = 0;

  if (formula === 'mifflin') {
    // Mifflin-St Jeor:
    // Homens: 10*P + 6.25*A - 5*I + 5
    // Mulheres: 10*P + 6.25*A - 5*I - 161
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
    tmb = gender === 'masculino' ? base + 5 : base - 161;
  } else if (formula === 'harris_benedict') {
    // Harris-Benedict revisada (Roza & Shizgal 1984):
    if (gender === 'masculino') {
      tmb = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears);
    } else {
      tmb = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
    }
  } else if (formula === 'cunningham') {
    // Cunningham (1980): 500 + 22 * Massa Livre de Gordura (FFM)
    const bf = bodyFatPercentage ?? (gender === 'masculino' ? 15 : 23);
    const ffm = weightKg * (1 - bf / 100);
    tmb = 500 + (22 * ffm);
  } else {
    // DRI / IOM
    if (gender === 'masculino') {
      tmb = 204 - (4.0 * ageYears) + (450.5 * (heightCm / 100)) + (11.69 * weightKg);
    } else {
      tmb = 255 - (2.35 * ageYears) + (361.5 * (heightCm / 100)) + (9.39 * weightKg);
    }
  }

  tmb = Math.round(tmb);
  const get = Math.round(tmb * (activityFactor || 1.2));
  const bmiData = calculateBMI(weightKg, heightCm);
  const waterRecommendationLiters = Number(((weightKg * 35) / 1000).toFixed(1));

  // Default balanced distribution (ex: 2.0g/kg ptn, 25% fat, rest carb)
  const ptnGrams = Math.round(weightKg * 1.8);
  const ptnCals = ptnGrams * 4;
  const fatCals = Math.round(get * 0.28);
  const fatGrams = Math.round(fatCals / 9);
  const carbCals = Math.max(0, get - ptnCals - fatCals);
  const carbGrams = Math.round(carbCals / 4);

  return {
    tmb,
    get,
    bmi: bmiData.bmi,
    bmiClassification: bmiData.classification,
    idealWeightRange: bmiData.idealRange,
    waterRecommendationLiters,
    macronutrientSuggestion: {
      protein: {
        grams: ptnGrams,
        gramsPerKg: Number((ptnGrams / weightKg).toFixed(1)),
        calories: ptnCals,
        percentage: Math.round((ptnCals / get) * 100)
      },
      carbs: {
        grams: carbGrams,
        gramsPerKg: Number((carbGrams / weightKg).toFixed(1)),
        calories: carbCals,
        percentage: Math.round((carbCals / get) * 100)
      },
      fat: {
        grams: fatGrams,
        gramsPerKg: Number((fatGrams / weightKg).toFixed(1)),
        calories: fatCals,
        percentage: Math.round((fatCals / get) * 100)
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

  // Equação de Siri: %G = [(4.95 / DC) - 4.50] * 100
  const bodyFat = Number((((4.95 / bodyDensity) - 4.50) * 100).toFixed(1));
  const safeBf = Math.max(3, Math.min(60, bodyFat));

  return {
    bodyFatPercentage: safeBf,
    density: Number(bodyDensity.toFixed(4))
  };
}
