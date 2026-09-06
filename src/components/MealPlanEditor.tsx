import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Printer, 
  Share2, 
  FileDown, 
  Check, 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Clock, 
  Flame, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Apple,
  Beef,
  Milk,
  Wheat,
  Nut,
  Pill,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { Patient, MealPlan, Meal, MealItem, FoodItem, UserAccount } from '../types';
import { EXTENDED_TACO_DATABASE } from '../data/tacoDatabase';
import { printMealPlanPdf, sendMealPlanViaWhatsApp, generateShoppingListFromMealPlan } from '../utils/pdfExportUtils';

interface MealPlanEditorProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  userAccount?: UserAccount;
}

export const MealPlanEditor: React.FC<MealPlanEditorProps> = ({
  patient,
  onUpdatePatient,
  onOpenNutriaWithPrompt,
  userAccount
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'prescricao' | 'compras' | 'taco_busca'>('prescricao');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [tacoSearch, setTacoSearch] = useState('');
  const [selectedTacoCategory, setSelectedTacoCategory] = useState<string>('todos');
  const [selectedMealForAdd, setSelectedMealForAdd] = useState<string>('Café da Manhã');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fallback initial meal plan if none exists
  const currentPlan: MealPlan = patient.mealPlan || {
    id: `mp-${Date.now()}`,
    title: `Plano Estruturado - ${patient.objective.replace('_', ' ').toUpperCase()}`,
    targetCalories: patient.get || 2000,
    targetProteinGrams: Math.round(patient.currentWeightKg * 2.0),
    targetCarbsGrams: Math.round(((patient.get || 2000) * 0.45) / 4),
    targetFatGrams: Math.round(((patient.get || 2000) * 0.25) / 9),
    targetFiberGrams: 30,
    hydrationGoalLiters: parseFloat(((patient.currentWeightKg * 35) / 1000).toFixed(1)),
    dateCreated: new Date().toLocaleDateString('pt-BR'),
    supplements: ['Creatina Monoidratada 5g/dia', 'Multivitamínico 1 dose no almoço', 'Whey Protein 30g pós-treino'],
    meals: [
      {
        id: 'm-1',
        name: 'Café da Manhã',
        time: '07:30',
        items: [
          { id: 'mi-1', foodName: 'Ovo de Galinha Inteiro Cozido', portion: '2 unidades (100g)', calories: 156, protein: 13.0, carbs: 1.2, fat: 10.6, fiber: 0 },
          { id: 'mi-2', foodName: 'Pão de Forma 100% Integral', portion: '2 fatias (50g)', calories: 120, protein: 5.5, carbs: 22.0, fat: 1.4, fiber: 3.5 },
          { id: 'mi-3', foodName: 'Mamão Papaia', portion: '1/2 unidade (150g)', calories: 68, protein: 0.8, carbs: 17.1, fat: 0.2, fiber: 2.7 }
        ]
      },
      {
        id: 'm-2',
        name: 'Almoço Completo',
        time: '12:30',
        items: [
          { id: 'mi-4', foodName: 'Peito de Frango Grelhado sem Pele', portion: '150g (1 filé grande)', calories: 238, protein: 48.0, carbs: 0, fat: 3.7, fiber: 0 },
          { id: 'mi-5', foodName: 'Arroz Integral Cozido', portion: '120g (4 colheres)', calories: 148, protein: 3.1, carbs: 31.0, fat: 1.2, fiber: 2.8 },
          { id: 'mi-6', foodName: 'Feijão Carioca Cozido (com Caldo)', portion: '100g (1 concha)', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 6.2 },
          { id: 'mi-7', foodName: 'Brócolis Cozido no Vapor', portion: '100g (1 xícara)', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.4 },
          { id: 'mi-8', foodName: 'Azeite de Oliva Extra Virgem', portion: '1 colher de sopa (10ml)', calories: 88, protein: 0, carbs: 0, fat: 10.0, fiber: 0 }
        ]
      },
      {
        id: 'm-3',
        name: 'Lanche da Tarde / Pré-Treino',
        time: '16:00',
        items: [
          { id: 'mi-9', foodName: 'Banana Prata', portion: '1 unidade média (70g)', calories: 69, protein: 0.9, carbs: 18.2, fat: 0.1, fiber: 1.9 },
          { id: 'mi-10', foodName: 'Aveia em Flocos Finos', portion: '30g (2 colheres)', calories: 118, protein: 4.2, carbs: 20.0, fat: 2.1, fiber: 3.0 },
          { id: 'mi-11', foodName: 'Whey Protein Concentrado 80%', portion: '1 dosador (30g)', calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, fiber: 0 }
        ]
      },
      {
        id: 'm-4',
        name: 'Jantar / Ceia',
        time: '20:00',
        items: [
          { id: 'mi-12', foodName: 'Patinho Bovino Moído Grelhado', portion: '130g', calories: 284, protein: 46.6, carbs: 0, fat: 9.5, fiber: 0 },
          { id: 'mi-13', foodName: 'Batata Doce Cozida', portion: '120g', calories: 103, protein: 1.9, carbs: 24.1, fat: 0.1, fiber: 2.2 },
          { id: 'mi-14', foodName: 'Salada de Folhas Verdes & Tomate', portion: '1 prato cheio', calories: 25, protein: 1.5, carbs: 4.5, fat: 0.2, fiber: 2.5 }
        ]
      }
    ]
  };

  // Compute live macro sums from active meals
  const totalCalories = currentPlan.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0), 0);
  const totalProtein = currentPlan.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0), 0);
  const totalCarbs = currentPlan.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.carbs, 0), 0);
  const totalFat = currentPlan.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.fat, 0), 0);

  // Add food item from TACO to selected meal
  const handleAddFoodFromTaco = (food: FoodItem) => {
    const updatedMeals = currentPlan.meals.map(m => {
      if (m.name.toLowerCase() === selectedMealForAdd.toLowerCase() || m.id === selectedMealForAdd) {
        const newItem: MealItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          foodName: food.name,
          portion: food.portion,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber || 0
        };
        return {
          ...m,
          items: [...m.items, newItem]
        };
      }
      return m;
    });

    const updatedPlan: MealPlan = {
      ...currentPlan,
      meals: updatedMeals
    };

    onUpdatePatient({
      ...patient,
      mealPlan: updatedPlan
    });
  };

  // Remove food item
  const handleRemoveFoodItem = (mealId: string, itemId: string) => {
    const updatedMeals = currentPlan.meals.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          items: m.items.filter(i => i.id !== itemId)
        };
      }
      return m;
    });

    onUpdatePatient({
      ...patient,
      mealPlan: {
        ...currentPlan,
        meals: updatedMeals
      }
    });
  };

  // Filter TACO items
  const filteredTacoItems = EXTENDED_TACO_DATABASE.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(tacoSearch.toLowerCase()) || f.category.toLowerCase().includes(tacoSearch.toLowerCase());
    const matchesCat = selectedTacoCategory === 'todos' || f.category === selectedTacoCategory;
    return matchesSearch && matchesCat;
  });

  const tacoCategories = Array.from(new Set(EXTENDED_TACO_DATABASE.map(f => f.category)));

  // Weekly Shopping List compiled automatically
  const shoppingList = generateShoppingListFromMealPlan(patient);

  return (
    <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl shadow-purple-950/40">
      
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-black text-white tracking-tight">{currentPlan.title}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 uppercase">
              Oficial TACO / NutrinK
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-1">
            Meta Prescrita: <strong>{currentPlan.targetCalories} kcal</strong> | Atual Calculado: <strong className="text-fuchsia-300">{totalCalories} kcal</strong>
          </p>
        </div>

        {/* Action Buttons for PDF, WhatsApp and Copilot */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => printMealPlanPdf({ ...patient, mealPlan: currentPlan }, userAccount)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-105"
            title="Gerar PDF timbrado para impressão ou download"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Imprimir / Gerar PDF Timbrado</span>
          </button>

          <button
            onClick={() => sendMealPlanViaWhatsApp({ ...patient, mealPlan: currentPlan }, userAccount)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105"
            title="Enviar prescrição formatada diretamente no WhatsApp do paciente"
          >
            <Phone className="w-3.5 h-3.5 text-slate-950" />
            <span>Enviar WhatsApp</span>
          </button>

          <button
            onClick={() => onOpenNutriaWithPrompt(`Nutria, refine este plano alimentar para ${patient.name} mantendo a meta de ${currentPlan.targetCalories} kcal, distribuindo 2.0g/kg de proteína e adaptando as preferências alimentares.`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>Otimizar com NUTRIA</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-900/30 pb-2">
        <button
          onClick={() => setActiveSubTab('prescricao')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'prescricao'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950/50'
              : 'text-purple-200 hover:text-white hover:bg-[#220743]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Cardápio & Refeições</span>
        </button>

        <button
          onClick={() => setActiveSubTab('taco_busca')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'taco_busca'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950/50'
              : 'text-purple-200 hover:text-white hover:bg-[#220743]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tabela TACO (Adicionar Alimentos)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('compras')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'compras'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950/50'
              : 'text-purple-200 hover:text-white hover:bg-[#220743]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Lista de Compras da Semana</span>
        </button>
      </div>

      {/* Real-time Macronutrient Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
          <span className="text-[11px] text-purple-200 uppercase font-bold">Total Calórico</span>
          <p className="text-lg font-black text-white mt-0.5">{totalCalories} kcal</p>
          <span className="text-[10px] text-purple-300">Meta: {currentPlan.targetCalories} kcal</span>
        </div>

        <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
          <span className="text-[11px] text-fuchsia-300 uppercase font-bold">Proteínas</span>
          <p className="text-lg font-black text-fuchsia-200 mt-0.5">{totalProtein.toFixed(1)}g</p>
          <span className="text-[10px] text-purple-300">Meta: {currentPlan.targetProteinGrams}g</span>
        </div>

        <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
          <span className="text-[11px] text-purple-300 uppercase font-bold">Carboidratos</span>
          <p className="text-lg font-black text-purple-100 mt-0.5">{totalCarbs.toFixed(1)}g</p>
          <span className="text-[10px] text-purple-300">Meta: {currentPlan.targetCarbsGrams}g</span>
        </div>

        <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
          <span className="text-[11px] text-amber-300 uppercase font-bold">Gorduras</span>
          <p className="text-lg font-black text-amber-200 mt-0.5">{totalFat.toFixed(1)}g</p>
          <span className="text-[10px] text-purple-300">Meta: {currentPlan.targetFatGrams}g</span>
        </div>

        <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-indigo-300 uppercase font-bold">Meta de Água</span>
          <p className="text-lg font-black text-indigo-200 mt-0.5">{currentPlan.hydrationGoalLiters} L</p>
          <span className="text-[10px] text-purple-300">35ml por kg</span>
        </div>
      </div>

      {/* SubTab 1: Meals Prescription View & Editing */}
      {activeSubTab === 'prescricao' && (
        <div className="space-y-4">
          {currentPlan.meals.map((meal) => {
            const mealCalories = meal.items.reduce((s, i) => s + i.calories, 0);
            const mealProtein = meal.items.reduce((s, i) => s + i.protein, 0);
            const mealCarbs = meal.items.reduce((s, i) => s + i.carbs, 0);
            const mealFat = meal.items.reduce((s, i) => s + i.fat, 0);

            return (
              <div key={meal.id} className="p-4 sm:p-5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-fuchsia-300 font-black text-xs border border-fuchsia-500/40">
                      {meal.time || 'Horário'}
                    </span>
                    <h4 className="font-black text-sm text-white">{meal.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-white bg-[#120326] px-2.5 py-1 rounded-lg border border-purple-800/40">
                      {mealCalories} kcal
                    </span>
                    <span className="text-fuchsia-300 hidden sm:inline">P: {mealProtein.toFixed(1)}g</span>
                    <span className="text-purple-300 hidden sm:inline">C: {mealCarbs.toFixed(1)}g</span>
                    <span className="text-amber-300 hidden sm:inline">G: {mealFat.toFixed(1)}g</span>
                  </div>
                </div>

                {/* Items in this meal */}
                <div className="space-y-2">
                  {meal.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#140327] hover:bg-[#20063e] border border-purple-900/30 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span>
                        <span className="text-white font-bold">{item.foodName}</span>
                        <span className="text-purple-200">({item.portion})</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">{item.calories} kcal</span>
                        <span className="text-fuchsia-300">P: {item.protein}g</span>
                        <span className="text-purple-300">C: {item.carbs}g</span>
                        <span className="text-amber-300">G: {item.fat}g</span>
                        
                        <button
                          onClick={() => handleRemoveFoodItem(meal.id, item.id)}
                          className="p-1 text-purple-400 hover:text-rose-400 transition-colors"
                          title="Remover este alimento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {meal.items.length === 0 && (
                    <div className="p-3 text-center text-purple-300 text-xs italic">
                      Nenhum alimento nesta refeição. Use a aba "Tabela TACO" para incluir itens.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Prescribed Supplements */}
          {currentPlan.supplements && currentPlan.supplements.length > 0 && (
            <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40">
              <h4 className="text-xs font-bold text-fuchsia-300 uppercase mb-2">Suplementação Prescrita & Fitoterápicos</h4>
              <div className="flex flex-wrap gap-2">
                {currentPlan.supplements.map((sup, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-[#2b0a54] text-xs text-purple-100 border border-purple-700/60 font-semibold">
                    💊 {sup}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Tabela TACO Search & Quick Add */}
      {activeSubTab === 'taco_busca' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tacoSearch}
                  onChange={(e) => setTacoSearch(e.target.value)}
                  placeholder="Buscar alimentos (ex: frango, arroz, aveia, whey)..."
                  className="w-full pl-9 pr-3 py-2 bg-[#120326] border border-purple-700 rounded-xl text-xs text-white placeholder-purple-300 focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-purple-200 font-bold shrink-0">Inserir em:</span>
                <select
                  value={selectedMealForAdd}
                  onChange={(e) => setSelectedMealForAdd(e.target.value)}
                  className="bg-[#120326] border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                >
                  {currentPlan.meals.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedTacoCategory('todos')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                  selectedTacoCategory === 'todos'
                    ? 'bg-fuchsia-600 text-white'
                    : 'bg-[#140327] text-purple-200 hover:text-white'
                }`}
              >
                Todas Categorias
              </button>
              {tacoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedTacoCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                    selectedTacoCategory === cat
                      ? 'bg-fuchsia-600 text-white'
                      : 'bg-[#140327] text-purple-200 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TACO Foods List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredTacoItems.map((food) => (
              <div key={food.id} className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between hover:border-fuchsia-500/50 transition-colors">
                <div>
                  <h5 className="font-bold text-xs text-white">{food.name}</h5>
                  <span className="text-[11px] text-purple-200 block">{food.portion} • {food.category}</span>
                  <div className="flex items-center gap-2 text-[11px] mt-1">
                    <span className="font-black text-fuchsia-300">{food.calories} kcal</span>
                    <span className="text-purple-300">P: {food.protein}g</span>
                    <span className="text-purple-300">C: {food.carbs}g</span>
                    <span className="text-amber-300">G: {food.fat}g</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddFoodFromTaco(food)}
                  className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 shrink-0 ml-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Smart Weekly Shopping List */}
      {activeSubTab === 'compras' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
                Lista de Compras Inteligente do Paciente
              </h4>
              <p className="text-xs text-purple-200 mt-0.5">
                Compilada automaticamente com base em todas as refeições dos 7 dias da semana.
              </p>
            </div>

            <button
              onClick={() => {
                let text = `🛒 *Lista de Compras Semanal - NutrinK*\nPaciente: *${patient.name}*\n\n`;
                shoppingList.forEach(cat => {
                  text += `*${cat.categoryName.toUpperCase()}*\n`;
                  cat.items.forEach(it => {
                    text += `  [ ] ${it.foodName} (${it.weeklyQuantity})\n`;
                  });
                  text += `\n`;
                });
                text += `_NutrinK • Gestão Nutricional Inteligente_`;
                navigator.clipboard.writeText(text);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Lista Copiada para o WhatsApp!' : 'Copiar para WhatsApp'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shoppingList.map((cat, idx) => (
              <div key={idx} className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-2">
                <h5 className="font-bold text-xs text-fuchsia-300 uppercase tracking-wide border-b border-purple-900/40 pb-1.5">
                  {cat.categoryName}
                </h5>
                <ul className="space-y-1.5">
                  {cat.items.map((it, itemIdx) => (
                    <li key={itemIdx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#140327]/60">
                      <span className="text-white font-medium">{it.foodName}</span>
                      <span className="text-purple-300 text-[11px] font-semibold">{it.weeklyQuantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
