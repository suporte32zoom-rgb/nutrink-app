import React, { useState } from 'react';
import { 
  Calculator, 
  Flame, 
  Scale, 
  Activity, 
  BookOpen, 
  Search, 
  Bot, 
  Check, 
  Layers, 
  Apple,
  RotateCcw
} from 'lucide-react';
import { Gender, ClinicalProtocol } from '../types';
import { 
  calculateMetabolicRates, 
  calculatePollock3Folds, 
  calculateIdealWeight,
  calculateAdjustedWeight,
  normalizeHeightToCm, 
  normalizeHeightToMeters 
} from '../utils/nutritionCalculations';
import { CLINICAL_PROTOCOLS, INITIAL_FOOD_DATABASE } from '../data/initialData';

interface NutriCalcViewProps {
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const NutriCalcView: React.FC<NutriCalcViewProps> = ({ onOpenNutriaWithPrompt }) => {
  const [calcSubTab, setCalcSubTab] = useState<'tmb_get' | 'pollock' | 'protocolos' | 'tabela_alimentos'>('tmb_get');

  // TMB & GET Calculator State - Iniciam Zerados / Vazios
  const [formula, setFormula] = useState<'mifflin' | 'harris_benedict' | 'cunningham' | 'dri'>('mifflin');
  const [gender, setGender] = useState<Gender>('masculino');
  const [weightInput, setWeightInput] = useState<string>('');
  const [heightInput, setHeightInput] = useState<string>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [bodyFatInput, setBodyFatInput] = useState<string>('');
  const [activityFactor, setActivityFactor] = useState<number>(1.2);
  const [customProteinGPerKg, setCustomProteinGPerKg] = useState<number>(2.0);

  // Pollock 3 folds state - Iniciam Zerados / Vazios
  const [fold1Input, setFold1Input] = useState<string>('');
  const [fold2Input, setFold2Input] = useState<string>('');
  const [fold3Input, setFold3Input] = useState<string>('');

  // Protocol filter
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalProtocol>(CLINICAL_PROTOCOLS[0]);

  // Food search
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState('Todas');

  // Conversões e normalizações dinâmicas
  const weightKg = parseFloat(weightInput) || 0;
  const rawHeight = parseFloat(heightInput) || 0;
  const heightCm = normalizeHeightToCm(rawHeight);
  const heightM = normalizeHeightToMeters(rawHeight);
  const ageYears = parseInt(ageInput, 10) || 0;
  const bodyFat = parseFloat(bodyFatInput) || 0;

  const fold1 = parseFloat(fold1Input) || 0;
  const fold2 = parseFloat(fold2Input) || 0;
  const fold3 = parseFloat(fold3Input) || 0;

  // Compute Results Dinâmicos
  const metabolicResults = calculateMetabolicRates({
    formula,
    gender,
    weightKg,
    heightCm: rawHeight,
    ageYears,
    bodyFatPercentage: bodyFat,
    activityFactor
  });

  const pollockResults = calculatePollock3Folds(gender, ageYears, fold1, fold2, fold3);

  // Peso Ideal e Peso Ajustado para Obesidade (IMC >= 30)
  const idealWeight = calculateIdealWeight(rawHeight);
  const adjustedWeight = calculateAdjustedWeight(weightKg, rawHeight);
  const isObese = metabolicResults.bmi >= 30;

  // Custom Macro Calculations (Zero-safe)
  // Em obesidade, a base proteica clínica recomendada utiliza o Peso Ajustado
  const effectiveWeightForProtein = (isObese && adjustedWeight > 0) ? adjustedWeight : weightKg;
  const calculatedProteinGrams = effectiveWeightForProtein > 0 ? Math.round(effectiveWeightForProtein * customProteinGPerKg) : 0;
  const proteinCalories = calculatedProteinGrams * 4;
  const fatCalories = metabolicResults.get > 0 ? Math.round(metabolicResults.get * 0.25) : 0;
  const fatGrams = Math.round(fatCalories / 9);
  const carbsCalories = metabolicResults.get > 0 ? Math.max(0, metabolicResults.get - proteinCalories - fatCalories) : 0;
  const carbsGrams = Math.round(carbsCalories / 4);

  const proteinPct = metabolicResults.get > 0 ? Math.min(100, Math.round((proteinCalories / metabolicResults.get) * 100)) : 0;
  const carbsPct = metabolicResults.get > 0 ? Math.min(100, Math.round((carbsCalories / metabolicResults.get) * 100)) : 0;
  const fatPct = metabolicResults.get > 0 ? 25 : 0;

  const handleResetCalculations = () => {
    setWeightInput('');
    setHeightInput('');
    setAgeInput('');
    setBodyFatInput('');
    setActivityFactor(1.2);
    setFold1Input('');
    setFold2Input('');
    setFold3Input('');
  };

  // Filtered Food Table
  const filteredFoods = INITIAL_FOOD_DATABASE.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(foodSearch.toLowerCase());
    const matchesCat = foodCategory === 'Todas' || f.category === foodCategory;
    return matchesSearch && matchesCat;
  });

  const foodCategories = ['Todas', ...Array.from(new Set(INITIAL_FOOD_DATABASE.map(f => f.category)))];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-fuchsia-400" />
            NutriCalc & Protocolos Clínicos
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Calculadoras metabólicas, equações preditivas, composição corporal e diretrizes clínicas baseadas em evidências.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCalculations}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#220743] hover:bg-[#2d0959] text-purple-200 hover:text-white rounded-xl text-xs font-bold border border-purple-700/60 transition-all"
            title="Zerar todos os campos para nova avaliação"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Dados</span>
          </button>

          <button
            onClick={() => onOpenNutriaWithPrompt(`Nutria, faça uma revisão dietoterápica detalhada para um paciente ${gender}, ${ageYears > 0 ? `${ageYears} anos` : 'idade a definir'}, ${weightKg > 0 ? `${weightKg}kg` : 'peso a definir'}, ${heightCm > 0 ? `${heightCm}cm` : 'altura a definir'} com GET de ${metabolicResults.get > 0 ? `${metabolicResults.get} kcal` : 'a calcular'}.`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/50 self-start sm:self-auto border border-fuchsia-400/40 transition-all hover:scale-105"
          >
            <Bot className="w-4 h-4 text-fuchsia-200" />
            <span>Consultar NUTRIA sobre este Cálculo</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-1.5 flex space-x-1 overflow-x-auto scrollbar-none shadow-md">
        {[
          { id: 'tmb_get', label: 'TMB, GET & Macros', icon: Flame },
          { id: 'pollock', label: 'Pollock 3 Dobras (%BF)', icon: Scale },
          { id: 'protocolos', label: 'Protocolos NutrinK', icon: BookOpen },
          { id: 'tabela_alimentos', label: 'Tabela de Alimentos TACO', icon: Apple }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = calcSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCalcSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-[#220743]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab 1: TMB, GET & Macronutrientes */}
      {calcSubTab === 'tmb_get' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-white border-b border-purple-900/40 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-400" />
              Parâmetros do Paciente
            </h3>

            {/* Formula Selector */}
            <div>
              <label className="text-xs text-purple-200 font-bold">Equação Preditiva da TMB:</label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value as any)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-fuchsia-400 font-medium"
              >
                <option value="mifflin">Mifflin-St Jeor (Padrão Ouro para Adultos)</option>
                <option value="harris_benedict">Harris-Benedict Revisada (Roza & Shizgal 1984)</option>
                <option value="cunningham">Cunningham (Baseada na Massa Livre de Gordura)</option>
                <option value="dri">DRI / IOM (EER - Dietary Reference Intakes)</option>
              </select>
            </div>

            {/* Gender and Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-purple-200 font-bold">Gênero Biológico:</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  <button
                    onClick={() => setGender('masculino')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      gender === 'masculino'
                        ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-sm'
                        : 'bg-[#1e073c] text-purple-200 border-purple-800'
                    }`}
                  >
                    Masc
                  </button>
                  <button
                    onClick={() => setGender('feminino')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      gender === 'feminino'
                        ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-sm'
                        : 'bg-[#1e073c] text-purple-200 border-purple-800'
                    }`}
                  >
                    Fem
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-purple-200 font-bold">Idade (anos):</label>
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder="ex: 28"
                  className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>

            {/* Weight and Height with cm or m support */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-purple-200 font-bold">Peso Atual (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="ex: 75.0"
                  className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs text-purple-200 font-bold">Altura:</label>
                  <span className="text-[10px] text-fuchsia-300 font-semibold">
                    {heightCm > 0 ? `${heightCm} cm (${heightM.toFixed(2)} m)` : 'cm ou metros'}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  placeholder="ex: 175 ou 1.75"
                  className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>

            {/* Body Fat (for Cunningham) */}
            <div>
              <label className="text-xs text-purple-200 font-bold">% Gordura Estimado (Bioimpedância/Dobras):</label>
              <input
                type="number"
                step="0.1"
                value={bodyFatInput}
                onChange={(e) => setBodyFatInput(e.target.value)}
                placeholder="ex: 14.5"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            {/* Physical Activity Level */}
            <div>
              <label className="text-xs text-purple-200 font-bold">Nível de Atividade Física (NAF):</label>
              <select
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-xs text-white font-medium focus:outline-none"
              >
                <option value={1.2}>Sedentário (Pouco ou nenhum exercício) • 1.20</option>
                <option value={1.375}>Levemente Ativo (Treino 1-3 dias/semana) • 1.375</option>
                <option value={1.55}>Moderadamente Ativo (Treino 3-5 dias/semana) • 1.55</option>
                <option value={1.725}>Muito Ativo (Treino intenso 6-7 dias/semana) • 1.725</option>
                <option value={1.9}>Extremamente Ativo (Atleta com 2 treinos/dia) • 1.90</option>
              </select>
            </div>

            {/* Protein Target Slider */}
            <div className="pt-2 border-t border-purple-900/40">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-200 font-bold">Meta de Proteína (g/kg):</span>
                <span className="font-black text-fuchsia-300">
                  {customProteinGPerKg} g/kg {calculatedProteinGrams > 0 ? `(${calculatedProteinGrams}g)` : ''}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={customProteinGPerKg}
                onChange={(e) => setCustomProteinGPerKg(Number(e.target.value))}
                className="w-full mt-2 accent-fuchsia-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-purple-300 mt-0.5 font-medium">
                <span>1.2g (Manutenção)</span>
                <span>2.0g (Hipertrofia/Déficit)</span>
                <span>2.8g (Atleta)</span>
              </div>
            </div>

          </div>

          {/* Right Column: Calculations Breakdown & Results */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Primary Energy Results Box */}
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 shadow-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-fuchsia-400" />
                Resultados Energéticos do Paciente
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
                  <span className="text-[11px] text-purple-200 block uppercase font-bold">Taxa Metabólica Basal</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {metabolicResults.tmb > 0 ? metabolicResults.tmb : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200">kcal/dia (Mifflin)</span>
                </div>

                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-fuchsia-500/60 text-center bg-purple-950/40">
                  <span className="text-[11px] text-fuchsia-300 block uppercase font-bold">Gasto Total (GET)</span>
                  <span className="text-xl font-black text-fuchsia-200 mt-1 block">
                    {metabolicResults.get > 0 ? metabolicResults.get : '-'}
                  </span>
                  <span className="text-[10px] text-fuchsia-300">kcal/dia (NAF {activityFactor})</span>
                </div>

                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
                  <span className="text-[11px] text-purple-200 block uppercase font-bold">IMC Atual</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {metabolicResults.bmi > 0 ? metabolicResults.bmi : '-'}
                  </span>
                  <span className="text-[10px] text-fuchsia-300 font-bold">
                    {metabolicResults.bmi > 0 ? metabolicResults.bmiClassification.split(' ')[0] : 'Aguardando'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
                  <span className="text-[11px] text-purple-200 block uppercase font-bold">Necessidade Hídrica</span>
                  <span className="text-xl font-black text-purple-200 mt-1 block">
                    {metabolicResults.waterRecommendationLiters > 0 ? `${metabolicResults.waterRecommendationLiters} L` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200">35 mL / kg / dia</span>
                </div>
              </div>

              {/* Energy Strategies Strip (Superávit vs Déficit) */}
              <div className="mt-4 pt-4 border-t border-purple-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-xs">
                  <span className="text-rose-400 font-bold block">Déficit (Emagrecimento):</span>
                  <span className="text-sm font-black text-white mt-0.5 block">
                    {metabolicResults.get > 0 ? `${Math.max(0, metabolicResults.get - 450)} kcal` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200 font-medium">-450 kcal do GET</span>
                </div>

                <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-xs">
                  <span className="text-purple-200 font-bold block">Eucalórica (Manutenção):</span>
                  <span className="text-sm font-black text-white mt-0.5 block">
                    {metabolicResults.get > 0 ? `${metabolicResults.get} kcal` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200 font-medium">Equilíbrio Energético</span>
                </div>

                <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-xs">
                  <span className="text-fuchsia-300 font-bold block">Superávit (Hipertrofia):</span>
                  <span className="text-sm font-black text-white mt-0.5 block">
                    {metabolicResults.get > 0 ? `${metabolicResults.get + 350} kcal` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200 font-medium">+350 kcal do GET</span>
                </div>
              </div>

            </div>

            {/* Macronutrient Distribution Card */}
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-fuchsia-400" />
                  Distribuição Recomendada de Macronutrientes (Diária)
                </h3>
                {isObese && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Manejo de Obesidade (IMC ≥ 30) • Peso Ajustado
                  </span>
                )}
              </div>

              {isObese && (
                <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-fuchsia-950/30 rounded-2xl border border-amber-500/30 text-xs space-y-1.5 text-purple-100">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>Diretriz ABESO / CFN: Peso Ajustado</span>
                    <span>IMC: {metabolicResults.bmi} kg/m²</span>
                  </div>
                  <p className="text-[11px] text-purple-200 leading-relaxed">
                    Para evitar sobrecarga renal e metabólica em pacientes com obesidade, a meta de proteínas é calculada sobre o <strong>Peso Ajustado ({adjustedWeight} kg)</strong> em vez do peso real ({weightKg} kg).
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-semibold text-purple-200">
                    <span className="p-1.5 bg-[#120326]/60 rounded-lg border border-purple-800/40">
                      Peso Ideal (IMC 22.5): <strong className="text-white">{idealWeight} kg</strong>
                    </span>
                    <span className="p-1.5 bg-[#120326]/60 rounded-lg border border-amber-500/40">
                      Peso Ajustado: <strong className="text-amber-300">{adjustedWeight} kg</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs">
                
                {/* Protein */}
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-fuchsia-300">Proteínas (4 kcal/g)</span>
                    <span className="font-black text-white">
                      {calculatedProteinGrams > 0 ? `${calculatedProteinGrams}g (${proteinCalories} kcal) • ${proteinPct}%` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-[#120326] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${proteinPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Carbs */}
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-200">Carboidratos (4 kcal/g)</span>
                    <span className="font-black text-white">
                      {carbsGrams > 0 ? `${carbsGrams}g (${carbsCalories} kcal) • ${carbsPct}%` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-[#120326] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${carbsPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fat */}
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">Gorduras / Lipídios (9 kcal/g)</span>
                    <span className="font-black text-white">
                      {fatGrams > 0 ? `${fatGrams}g (${fatCalories} kcal) • ${fatPct}%` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-[#120326] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${fatPct}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Subtab 2: Pollock 3 Dobras */}
      {calcSubTab === 'pollock' && (
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-6 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-fuchsia-400" />
              Protocolo Jackson & Pollock (3 Dobras Cutâneas)
            </h3>
            <p className="text-xs text-purple-200 mt-1 font-medium">
              Cálculo de Densidade Corporal (DC) e Equação de Siri para estimativa de Percentual de Gordura (%BF).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-purple-200 font-bold">
                {gender === 'masculino' ? 'Dobra Peitoral (mm):' : 'Dobra Tríceps (mm):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={fold1Input}
                onChange={(e) => setFold1Input(e.target.value)}
                placeholder="ex: 12.0"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-xs text-purple-200 font-bold">
                {gender === 'masculino' ? 'Dobra Abdominal (mm):' : 'Dobra Supra-ilíaca (mm):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={fold2Input}
                onChange={(e) => setFold2Input(e.target.value)}
                placeholder="ex: 18.0"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-xs text-purple-200 font-bold">Dobra da Coxa (mm):</label>
              <input
                type="number"
                step="0.5"
                value={fold3Input}
                onChange={(e) => setFold3Input(e.target.value)}
                placeholder="ex: 15.0"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          {/* Pollock Result Box */}
          <div className="p-5 bg-[#1d0637] rounded-2xl border border-purple-800/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs text-purple-200 block uppercase font-bold">Soma das 3 Dobras</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {(fold1 + fold2 + fold3) > 0 ? `${(fold1 + fold2 + fold3).toFixed(1)} mm` : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-purple-200 block uppercase font-bold">Densidade Corporal (DC)</span>
              <span className="text-2xl font-black text-purple-200 mt-1 block">
                {pollockResults.density > 0 ? `${pollockResults.density} g/cm³` : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-fuchsia-300 block uppercase font-bold">% Gordura Corporal (Siri)</span>
              <span className="text-3xl font-black text-fuchsia-300 mt-1 block">
                {pollockResults.bodyFatPercentage > 0 ? `${pollockResults.bodyFatPercentage}%` : '-'}
              </span>
            </div>
          </div>

          <div className="text-xs text-purple-200 bg-[#1d0637] p-4 rounded-2xl border border-purple-800/40 font-medium">
            <strong className="text-white">Referência Clínica:</strong> Para homens adultos, a faixa ótima fica entre 10-16%. Para mulheres adultas, a faixa ótima fica entre 18-24%.
          </div>
        </div>
      )}

      {/* Subtab 3: Protocolos NutrinK */}
      {calcSubTab === 'protocolos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Protocol Selector List */}
          <div className="lg:col-span-4 bg-[#150328] border border-purple-900/50 rounded-3xl p-4 space-y-2 shadow-md">
            <h3 className="text-xs font-bold uppercase text-purple-200 mb-3">Protocolos Clínicos</h3>
            {CLINICAL_PROTOCOLS.map((proto) => (
              <button
                key={proto.id}
                onClick={() => setSelectedProtocol(proto)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  selectedProtocol.id === proto.id
                    ? 'bg-fuchsia-950/80 border-fuchsia-500 text-white shadow-md'
                    : 'bg-[#1d0637] border-purple-900/40 text-purple-100 hover:bg-[#250847]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">{proto.name}</span>
                  {selectedProtocol.id === proto.id && (
                    <Check className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-purple-200 mt-0.5 block">{proto.category}</span>
              </button>
            ))}
          </div>

          {/* Protocol Detailed Sheet */}
          <div className="lg:col-span-8 bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-5 shadow-md">
            <div className="flex items-start justify-between pb-3 border-b border-purple-900/40">
              <div>
                <span className="text-xs text-fuchsia-300 font-bold uppercase">{selectedProtocol.category}</span>
                <h2 className="text-lg font-black text-white mt-0.5">{selectedProtocol.name}</h2>
              </div>
              <button
                onClick={() => onOpenNutriaWithPrompt(`Nutria, elabore uma conduta clínica baseada no protocolo de "${selectedProtocol.name}" incluindo exemplos práticos de cardápio.`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Aplicar com NUTRIA</span>
              </button>
            </div>

            <div className="space-y-4 text-xs text-purple-100 font-medium">
              <div>
                <span className="font-bold text-white block mb-1">Indicação Clínica:</span>
                <p className="leading-relaxed text-purple-200">{selectedProtocol.indication}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-purple-200 font-bold block">Estratégia Calórica:</span>
                  <p className="text-white font-black mt-0.5">{selectedProtocol.targetKcalStrategy}</p>
                </div>
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-fuchsia-300 font-bold block">Aporte Proteico:</span>
                  <p className="text-white font-black mt-0.5">{selectedProtocol.proteinRangeGPerKg}</p>
                </div>
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-purple-200 font-bold block">Carboidratos / Lipídios:</span>
                  <p className="text-white font-black mt-0.5">Carbs: {selectedProtocol.carbsRangePercentage} • Gord: {selectedProtocol.fatRangePercentage}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-fuchsia-300 block mb-1">Nutrientes-Chave & Suplementação:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedProtocol.keyNutrients.map((nut, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-[#1d0637] text-white border border-purple-700/60 font-semibold">
                      ✓ {nut}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-purple-200 block mb-1">Alimentos Recomendados:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedProtocol.recommendedFoods.map((food, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-[#29094e] text-fuchsia-200 border border-fuchsia-500/40 font-semibold">
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                <span className="font-bold text-amber-300 block mb-1">Observações Clínicas & Cuidados:</span>
                <p className="text-purple-100 italic">{selectedProtocol.clinicalObservations}</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Subtab 4: Tabela de Alimentos TACO/TBCA */}
      {calcSubTab === 'tabela_alimentos' && (
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-fuchsia-400" />
                Tabela de Composição de Alimentos (Padrão TACO / TBCA)
              </h3>
              <p className="text-xs text-purple-200 mt-0.5 font-medium">Valores nutricionais de referência para elaboração de cardápios</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Buscar alimento..."
                  className="w-full bg-[#1e073c] border border-purple-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {foodCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFoodCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  foodCategory === cat
                    ? 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-500/60 shadow-sm'
                    : 'bg-[#220743] text-purple-200 hover:text-white border border-purple-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-100">
              <thead className="bg-[#1d0637] text-purple-200 uppercase font-bold border-b border-purple-900/40">
                <tr>
                  <th className="p-3">Alimento</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Porção Padrão</th>
                  <th className="p-3 text-right">Calorias</th>
                  <th className="p-3 text-right text-fuchsia-300">Proteína</th>
                  <th className="p-3 text-right text-purple-200">Carboidrato</th>
                  <th className="p-3 text-right text-amber-300">Lipídios</th>
                  <th className="p-3 text-right text-indigo-300">Fibras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30">
                {filteredFoods.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1d0637]/60">
                    <td className="p-3 font-bold text-white">{item.name}</td>
                    <td className="p-3 text-purple-200 font-medium">{item.category}</td>
                    <td className="p-3 text-purple-200">{item.portion}</td>
                    <td className="p-3 text-right font-black text-white">{item.calories} kcal</td>
                    <td className="p-3 text-right text-fuchsia-300 font-bold">{item.protein}g</td>
                    <td className="p-3 text-right text-purple-200 font-bold">{item.carbs}g</td>
                    <td className="p-3 text-right text-amber-300 font-bold">{item.fat}g</td>
                    <td className="p-3 text-right text-indigo-300 font-bold">{item.fiber}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
