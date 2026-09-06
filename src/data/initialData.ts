import { Patient, Appointment, FinancialTransaction, FoodItem, ClinicalProtocol } from '../types';

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
  { id: 'f1', name: 'Peito de Frango Grelhado', category: 'Proteínas', portion: '100g', portionGrams: 100, calories: 159, protein: 32.0, carbs: 0, fat: 2.5, fiber: 0 },
  { id: 'f2', name: 'Ovo de Galinha Inteiro Cozido', category: 'Proteínas', portion: '1 unidade (50g)', portionGrams: 50, calories: 78, protein: 6.5, carbs: 0.6, fat: 5.3, fiber: 0 },
  { id: 'f3', name: 'Whey Protein Concentrado 80%', category: 'Suplementos', portion: '1 dosador (30g)', portionGrams: 30, calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, fiber: 0 },
  { id: 'f4', name: 'Salmão Grelhado', category: 'Proteínas', portion: '100g', portionGrams: 100, calories: 206, protein: 22.0, carbs: 0, fat: 12.3, fiber: 0 },
  { id: 'f5', name: 'Tofu Firme Orgânico', category: 'Proteínas', portion: '100g', portionGrams: 100, calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { id: 'f6', name: 'Arroz Integral Cozido', category: 'Carboidratos', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7 },
  { id: 'f7', name: 'Feijão Carioca Cozido', category: 'Leguminosas', portion: '1 concha (100g)', portionGrams: 100, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5 },
  { id: 'f8', name: 'Batata Doce Cozida', category: 'Carboidratos', portion: '100g', portionGrams: 100, calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0 },
  { id: 'f9', name: 'Aveia em Flocos Finos', category: 'Cereais', portion: '30g (2 colheres de sopa)', portionGrams: 30, calories: 118, protein: 4.2, carbs: 20.0, fat: 2.1, fiber: 3.0 },
  { id: 'f10', name: 'Banana Prata', category: 'Frutas', portion: '1 unidade média (70g)', portionGrams: 70, calories: 69, protein: 0.9, carbs: 18.2, fat: 0.1, fiber: 1.4 },
  { id: 'f11', name: 'Maçã Gala com Casca', category: 'Frutas', portion: '1 unidade média (130g)', portionGrams: 130, calories: 77, protein: 0.4, carbs: 20.0, fat: 0.2, fiber: 2.6 },
  { id: 'f12', name: 'Azeite de Oliva Extra Virgem', category: 'Gorduras Boas', portion: '1 colher de sopa (10ml)', portionGrams: 10, calories: 88, protein: 0, carbs: 0, fat: 10.0, fiber: 0 },
  { id: 'f13', name: 'Pasta de Amendoim Integral', category: 'Gorduras Boas', portion: '1 colher de sopa (15g)', portionGrams: 15, calories: 92, protein: 4.0, carbs: 3.0, fat: 7.5, fiber: 1.2 },
  { id: 'f14', name: 'Castanha-do-Pará (Brasil)', category: 'Oleaginosas', portion: '2 unidades (10g)', portionGrams: 10, calories: 65, protein: 1.4, carbs: 1.2, fat: 6.6, fiber: 0.8 },
  { id: 'f15', name: 'Iogurte Natural Desnatado', category: 'Laticínios', portion: '1 pote (160g)', portionGrams: 160, calories: 66, protein: 6.4, carbs: 9.6, fat: 0.2, fiber: 0 },
  { id: 'f16', name: 'Queijo Cottage', category: 'Laticínios', portion: '50g (2 colheres de sopa)', portionGrams: 50, calories: 49, protein: 6.2, carbs: 1.7, fat: 1.8, fiber: 0 },
  { id: 'f17', name: 'Brócolis Cozido no Vapor', category: 'Vegetais', portion: '100g (1 xícara)', portionGrams: 100, calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { id: 'f18', name: 'Espinafre Refogado', category: 'Vegetais', portion: '100g', portionGrams: 100, calories: 42, protein: 2.9, carbs: 3.8, fat: 1.8, fiber: 2.2 },
  { id: 'f19', name: 'Chia em Grãos', category: 'Sementes', portion: '1 colher de sobremesa (10g)', portionGrams: 10, calories: 49, protein: 1.7, carbs: 4.2, fat: 3.1, fiber: 3.4 },
  { id: 'f20', name: 'Abacate Hass', category: 'Gorduras Boas', portion: '50g', portionGrams: 50, calories: 80, protein: 1.0, carbs: 4.3, fat: 7.3, fiber: 3.4 }
];

// Production Mode: Initial state is clean (0 patients, 0 appointments, 0 transactions)
export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];

export const CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  {
    id: 'proto-hipertrofia',
    name: 'Hipertrofia Muscular & Otimização da Síntese Proteica (MPS)',
    category: 'Nutrição Esportiva',
    indication: 'Praticantes de musculação e atletas visando ganho de massa livre de gordura.',
    targetKcalStrategy: 'Superávit calórico controlado (+250 a +500 kcal/dia acima do GET).',
    proteinRangeGPerKg: '1.8 a 2.4 g/kg de peso corporal fracionados a cada 3-4 horas.',
    carbsRangePercentage: '45% a 55% do VET (4.0 a 7.0 g/kg).',
    fatRangePercentage: '20% a 30% do VET (0.8 a 1.2 g/kg).',
    keyNutrients: ['Leucina (3g por refeição)', 'Creatina Monoidratada (0.05g/kg/dia)', 'Vitamina D3', 'Zinco Quelato', 'Ômega 3'],
    recommendedFoods: ['Peito de frango', 'Ovos inteiros', 'Salmão', 'Arroz integral/branco', 'Aveia', 'Batata doce', 'Azeite de oliva', 'Frutas vermelhas'],
    foodsToLimit: ['Gorduras trans hidrogenadas', 'Álcool em excesso', 'Açúcares refinados ultraprocessados'],
    clinicalObservations: 'Monitorar ganho de peso a uma taxa de 0.25% a 0.5% do peso corporal por semana para minimizar acúmulo de gordura.'
  },
  {
    id: 'proto-emagrecimento',
    name: 'Emagrecimento com Preservação de Massa Magra',
    category: 'Composição Corporal',
    indication: 'Pacientes com sobrepeso ou obesidade, ou em fase de definição muscular.',
    targetKcalStrategy: 'Déficit calórico moderado (-300 a -600 kcal/dia do GET).',
    proteinRangeGPerKg: '2.0 a 2.6 g/kg de peso (manter balanço nitrogenado positivo durante o déficit).',
    carbsRangePercentage: '30% a 45% do VET (priorizar carboidratos de baixo índice glicêmico e alto teor de fibras).',
    fatRangePercentage: '25% a 30% do VET (foco em ácidos graxos monoinsaturados e poli-insaturados).',
    keyNutrients: ['Fibras solúveis (30-40g/dia)', 'Psyllium', 'Magnésio', 'Cálcio', 'Água (40ml/kg)'],
    recommendedFoods: ['Vegetais folhosos verde-escuros', 'Leguminosas', 'Proteínas magras', 'Frutas de baixa carga glicêmica (morango, mirtilo, maçã)', 'Sementes de chia'],
    foodsToLimit: ['Bebidas açucaradas', 'Frituras', 'Doces concentrados', 'Snacks ultraprocessados'],
    clinicalObservations: 'Manter treinamento resistido para estímulo mecanotransdutivo e proteção muscular.'
  },
  {
    id: 'proto-diabetes-dm2',
    name: 'Manejo Clínico do Diabetes Tipo 2 & Resistência Insulínica',
    category: 'Nutrição Clínica & Endocrinologia',
    indication: 'Pacientes com pré-diabetes, DM2, esteatose hepática ou síndrome metabólica.',
    targetKcalStrategy: 'Eucalórica ou leve déficit calórico para melhora da sensibilidade à insulina.',
    proteinRangeGPerKg: '1.4 a 1.8 g/kg.',
    carbsRangePercentage: '30% a 40% do VET (Low GI/GL, ricos em beta-glucanas e amido resistente).',
    fatRangePercentage: '30% a 38% do VET (predominância de MUFAs do azeite, abacate e oleaginosas).',
    keyNutrients: ['Cromo picolinato', 'Berberina / Ácido Alfa-Lipóico (quando indicado)', 'Magnésio Quelato', 'Vitamina D'],
    recommendedFoods: ['Azeite de oliva extravirgem', 'Aveia em flocos', 'Canela do Ceilão', 'Sementes de linhaça moída', 'Peixes ricos em EPA/DHA', 'Brócolis e crucíferas'],
    foodsToLimit: ['Farinhas brancas refinadas', 'Sucos de frutas coados', 'Doces', 'Gorduras saturadas animais em excesso'],
    clinicalObservations: 'Orientar o consumo de saladas e proteínas antes dos carboidratos nas refeições para atenuar pico pós-prandial de glicose.'
  },
  {
    id: 'proto-fodmaps',
    name: 'Protocolo Low FODMAPs para Síndrome do Intestino Irritável (SII)',
    category: 'Saúde Intestinal & Gastroenterologia',
    indication: 'Pacientes com queixas de distensão abdominal frequente, gases, dor e fezes irregulares.',
    targetKcalStrategy: 'Atendimento às necessidades energéticas basais sem restrição calórica agressiva.',
    proteinRangeGPerKg: '1.2 a 1.6 g/kg.',
    carbsRangePercentage: '45% a 55% com exclusão temporária de carboidratos fermentáveis de cadeia curta.',
    fatRangePercentage: '25% a 30%.',
    keyNutrients: ['L-Glutamina', 'Zinco carnosina', 'Enzimas digestivas específicas', 'Probióticos selecionados na fase de reintrodução'],
    recommendedFoods: ['Arroz', 'Quinoa', 'Banana prata madura', 'Cenoura', 'Abobrinha', 'Ovos', 'Carnes frescas sem marinadas com alho/cebola'],
    foodsToLimit: ['Alho', 'Cebola', 'Trigo em excesso', 'Maçã', 'Leite com lactose', 'Mel', 'Leguminosas não demolhadas'],
    clinicalObservations: 'Fase de eliminação restrita por 2 a 6 semanas, seguida por fase de reintrodução estruturada por grupos de alimentos.'
  },
  {
    id: 'proto-vegetariano',
    name: 'Nutrição Vegetariana e Vegana de Alta Densidade Nutricional',
    category: 'Dietas Plant-Based',
    indication: 'Pacientes vegetarianos ou veganos em busca de adequação de micronutrientes e composição corporal.',
    targetKcalStrategy: 'Alinhado ao objetivo (hipertrofia, manutenção ou emagrecimento).',
    proteinRangeGPerKg: '1.6 a 2.2 g/kg (compensando escore DIAAS com combinação de leguminosas + cereais).',
    carbsRangePercentage: '50% a 60% do VET.',
    fatRangePercentage: '20% a 28% do VET.',
    keyNutrients: ['Vitamina B12 (suplementação obrigatória em veganos)', 'Ferro Não-Heme + Vitamina C', 'Zinco', 'Cálcio', 'Iodo', 'Ômega 3 DHA algal'],
    recommendedFoods: ['Tofu', 'Tempeh', 'Lentilha', 'Grão de bico', 'Edamame', 'Castanhas do Brasil', 'Sementes de cânhamo e chia', 'Levedura nutricional enriquecida'],
    foodsToLimit: ['Embutidos veganos ultraprocessados', 'Açúcares simples', 'Óleos refinados'],
    clinicalObservations: 'Sempre prescrever fontes de vitamina C (limão, laranja, pimentão) junto às principais refeições para potencializar a absorção do ferro vegetal.'
  }
];
