import { FoodItem } from '../types';

/**
 * Tabela Brasileira de Composição de Alimentos (TACO - UNICAMP / IBGE)
 * Base de dados nutricional expandida com valores por porção padrão e 100g.
 */
export const EXTENDED_TACO_DATABASE: FoodItem[] = [
  // --- PROTEÍNAS ANIMAIS & AVES ---
  { id: 'taco-1', name: 'Peito de Frango Grelhado sem Pele', category: 'Proteínas', portion: '100g (1 filé médio)', portionGrams: 100, calories: 159, protein: 32.0, carbs: 0, fat: 2.5, fiber: 0 },
  { id: 'taco-2', name: 'Peito de Frango Cozido Desfiado', category: 'Proteínas', portion: '100g (4 colheres de sopa)', portionGrams: 100, calories: 163, protein: 31.5, carbs: 0, fat: 3.2, fiber: 0 },
  { id: 'taco-3', name: 'Ovo de Galinha Inteiro Cozido', category: 'Proteínas', portion: '1 unidade grande (50g)', portionGrams: 50, calories: 78, protein: 6.5, carbs: 0.6, fat: 5.3, fiber: 0 },
  { id: 'taco-4', name: 'Ovo de Galinha Frito no Azeite/Poché', category: 'Proteínas', portion: '1 unidade (50g)', portionGrams: 50, calories: 95, protein: 6.3, carbs: 0.5, fat: 7.2, fiber: 0 },
  { id: 'taco-5', name: 'Clara de Ovo Cozida', category: 'Proteínas', portion: '2 unidades (60g)', portionGrams: 60, calories: 32, protein: 6.8, carbs: 0.4, fat: 0.1, fiber: 0 },
  { id: 'taco-6', name: 'Carne Bovina Patinho Moído Grelhado', category: 'Proteínas', portion: '100g (4 colheres de sopa)', portionGrams: 100, calories: 219, protein: 35.9, carbs: 0, fat: 7.3, fiber: 0 },
  { id: 'taco-7', name: 'Carne Bovina Alcatra Grelhada', category: 'Proteínas', portion: '100g (1 bife)', portionGrams: 100, calories: 241, protein: 31.9, carbs: 0, fat: 11.6, fiber: 0 },
  { id: 'taco-8', name: 'Carne Bovina Filé Mignon Grelhado', category: 'Proteínas', portion: '100g (1 medalhão)', portionGrams: 100, calories: 220, protein: 32.8, carbs: 0, fat: 8.8, fiber: 0 },
  { id: 'taco-9', name: 'Lombo Suíno Assado', category: 'Proteínas', portion: '100g (1 fatia média)', portionGrams: 100, calories: 210, protein: 35.7, carbs: 0, fat: 6.4, fiber: 0 },

  // --- PEIXES & FRUTOS DO MAR ---
  { id: 'taco-10', name: 'Salmão Fresco Grelhado', category: 'Peixes & Frutos do Mar', portion: '100g (1 posta média)', portionGrams: 100, calories: 206, protein: 22.1, carbs: 0, fat: 12.3, fiber: 0 },
  { id: 'taco-11', name: 'Tilápia / Saint Peter Filé Grelhado', category: 'Peixes & Frutos do Mar', portion: '100g (1 filé)', portionGrams: 100, calories: 128, protein: 26.0, carbs: 0, fat: 2.7, fiber: 0 },
  { id: 'taco-12', name: 'Atum Sólido em Água (Enlatado)', category: 'Peixes & Frutos do Mar', portion: '1 lata drenada (120g)', portionGrams: 120, calories: 132, protein: 29.8, carbs: 0, fat: 0.9, fiber: 0 },
  { id: 'taco-13', name: 'Sardinha em Molho de Tomate/Grelhada', category: 'Peixes & Frutos do Mar', portion: '100g', portionGrams: 100, calories: 164, protein: 21.0, carbs: 0, fat: 8.4, fiber: 0 },
  { id: 'taco-14', name: 'Camarão Cozido no Vapor', category: 'Peixes & Frutos do Mar', portion: '100g (1 pires de chá)', portionGrams: 100, calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3, fiber: 0 },

  // --- PROTEÍNAS VEGETAIS ---
  { id: 'taco-15', name: 'Tofu Firme Orgânico', category: 'Proteínas Vegetais', portion: '100g (2 fatias grossas)', portionGrams: 100, calories: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { id: 'taco-16', name: 'Proteína Texturizada de Soja (PTS) Hidratada', category: 'Proteínas Vegetais', portion: '100g', portionGrams: 100, calories: 110, protein: 18.2, carbs: 7.5, fat: 0.8, fiber: 4.6 },
  { id: 'taco-17', name: 'Tempeh Grelhado', category: 'Proteínas Vegetais', portion: '100g', portionGrams: 100, calories: 192, protein: 20.3, carbs: 7.6, fat: 10.8, fiber: 3.5 },

  // --- CARBOIDRATOS COMPLEXOS & TUBÉRCULOS ---
  { id: 'taco-18', name: 'Arroz Branco Cozido', category: 'Carboidratos', portion: '100g (4 colheres de sopa)', portionGrams: 100, calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 0.4 },
  { id: 'taco-19', name: 'Arroz Integral Cozido', category: 'Carboidratos', portion: '100g (4 colheres de sopa)', portionGrams: 100, calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7 },
  { id: 'taco-20', name: 'Batata Doce Cozida', category: 'Carboidratos', portion: '100g (1 pedaço médio)', portionGrams: 100, calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0 },
  { id: 'taco-21', name: 'Batata Inglesa Cozida', category: 'Carboidratos', portion: '100g (1 unidade média)', portionGrams: 100, calories: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3 },
  { id: 'taco-22', name: 'Mandioca / Aipim Cozido', category: 'Carboidratos', portion: '100g (1 pedaço)', portionGrams: 100, calories: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.6 },
  { id: 'taco-23', name: 'Inhame Cozido', category: 'Carboidratos', portion: '100g', portionGrams: 100, calories: 97, protein: 1.5, carbs: 23.2, fat: 0.2, fiber: 2.6 },
  { id: 'taco-24', name: 'Tapioca (Goma Hidratada Pronta)', category: 'Carboidratos', portion: '60g (3 colheres de sopa)', portionGrams: 60, calories: 144, protein: 0.1, carbs: 36.0, fat: 0.1, fiber: 0.2 },
  { id: 'taco-25', name: 'Macarrão de Trigo Cozido', category: 'Carboidratos', portion: '100g (1 pegador cheio)', portionGrams: 100, calories: 141, protein: 4.5, carbs: 28.5, fat: 0.9, fiber: 1.8 },
  { id: 'taco-26', name: 'Quinoa em Grãos Cozida', category: 'Carboidratos', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { id: 'taco-27', name: 'Pão de Forma 100% Integral', category: 'Carboidratos', portion: '50g (2 fatias)', portionGrams: 50, calories: 120, protein: 5.5, carbs: 22.0, fat: 1.4, fiber: 4.2 },
  { id: 'taco-28', name: 'Aveia em Flocos Finos', category: 'Cereais', portion: '30g (2 colheres de sopa)', portionGrams: 30, calories: 118, protein: 4.2, carbs: 20.0, fat: 2.1, fiber: 3.0 },

  // --- LEGUMINOSAS (FEIJÕES & GRÃOS) ---
  { id: 'taco-29', name: 'Feijão Carioca Cozido (com Caldo)', category: 'Leguminosas', portion: '100g (1 concha média)', portionGrams: 100, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5 },
  { id: 'taco-30', name: 'Feijão Preto Cozido', category: 'Leguminosas', portion: '100g (1 concha média)', portionGrams: 100, calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5, fiber: 8.4 },
  { id: 'taco-31', name: 'Lentilha Cozida', category: 'Leguminosas', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9 },
  { id: 'taco-32', name: 'Grão-de-Bico Cozido', category: 'Leguminosas', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },

  // --- LATICÍNIOS & DERIVADOS ---
  { id: 'taco-33', name: 'Leite Desnatado Pasteurizado', category: 'Laticínios', portion: '200ml (1 copo)', portionGrams: 200, calories: 70, protein: 6.8, carbs: 10.0, fat: 0.4, fiber: 0 },
  { id: 'taco-34', name: 'Leite Integral Pasteurizado', category: 'Laticínios', portion: '200ml (1 copo)', portionGrams: 200, calories: 124, protein: 6.4, carbs: 9.6, fat: 6.6, fiber: 0 },
  { id: 'taco-35', name: 'Iogurte Natural Desnatado', category: 'Laticínios', portion: '160g (1 pote)', portionGrams: 160, calories: 66, protein: 6.4, carbs: 9.6, fat: 0.2, fiber: 0 },
  { id: 'taco-36', name: 'Iogurte Grego Tradicional Natural', category: 'Laticínios', portion: '100g', portionGrams: 100, calories: 115, protein: 7.0, carbs: 4.5, fat: 7.5, fiber: 0 },
  { id: 'taco-37', name: 'Queijo Cottage', category: 'Laticínios', portion: '50g (2 colheres de sopa)', portionGrams: 50, calories: 49, protein: 6.2, carbs: 1.7, fat: 1.8, fiber: 0 },
  { id: 'taco-38', name: 'Queijo Minas Frescal', category: 'Laticínios', portion: '50g (1 fatia média)', portionGrams: 50, calories: 132, protein: 8.7, carbs: 1.6, fat: 10.1, fiber: 0 },
  { id: 'taco-39', name: 'Ricota Fresca', category: 'Laticínios', portion: '50g (2 fatias)', portionGrams: 50, calories: 70, protein: 6.3, carbs: 1.9, fat: 4.1, fiber: 0 },

  // --- FRUTAS FRESCAS ---
  { id: 'taco-40', name: 'Banana Prata', category: 'Frutas', portion: '70g (1 unidade média)', portionGrams: 70, calories: 69, protein: 0.9, carbs: 18.2, fat: 0.1, fiber: 1.4 },
  { id: 'taco-41', name: 'Maçã Gala com Casca', category: 'Frutas', portion: '130g (1 unidade média)', portionGrams: 130, calories: 77, protein: 0.4, carbs: 20.0, fat: 0.2, fiber: 2.6 },
  { id: 'taco-42', name: 'Mamão Papaia', category: 'Frutas', portion: '150g (1/2 unidade)', portionGrams: 150, calories: 68, protein: 0.8, carbs: 17.1, fat: 0.2, fiber: 2.7 },
  { id: 'taco-43', name: 'Morango Fresco', category: 'Frutas', portion: '100g (8 unidades)', portionGrams: 100, calories: 30, protein: 0.9, carbs: 6.8, fat: 0.3, fiber: 1.7 },
  { id: 'taco-44', name: 'Abacaxi Pérola Fatiado', category: 'Frutas', portion: '100g (1 fatia média)', portionGrams: 100, calories: 48, protein: 0.9, carbs: 12.3, fat: 0.1, fiber: 1.0 },
  { id: 'taco-45', name: 'Melancia em Cubos', category: 'Frutas', portion: '200g (1 fatia grande)', portionGrams: 200, calories: 66, protein: 1.8, carbs: 16.2, fat: 0.2, fiber: 0.8 },
  { id: 'taco-46', name: 'Laranja Pêra sem Casca', category: 'Frutas', portion: '130g (1 unidade média)', portionGrams: 130, calories: 60, protein: 1.3, carbs: 14.8, fat: 0.1, fiber: 2.2 },
  { id: 'taco-47', name: 'Uva Roxa / Verde', category: 'Frutas', portion: '100g (1 cacho pequeno)', portionGrams: 100, calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9 },
  { id: 'taco-48', name: 'Kiwi Fresco', category: 'Frutas', portion: '80g (1 unidade)', portionGrams: 80, calories: 49, protein: 0.9, carbs: 11.7, fat: 0.4, fiber: 2.1 },
  { id: 'taco-49', name: 'Abacate Hass / Avocado', category: 'Frutas / Gorduras', portion: '50g (2 colheres de sopa)', portionGrams: 50, calories: 80, protein: 1.0, carbs: 4.3, fat: 7.3, fiber: 3.4 },

  // --- VEGETAIS, LEGUMES & VERDURAS ---
  { id: 'taco-50', name: 'Brócolis Cozido no Vapor', category: 'Vegetais', portion: '100g (1 xícara)', portionGrams: 100, calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { id: 'taco-51', name: 'Espinafre Refogado no Azeite', category: 'Vegetais', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 62, protein: 2.9, carbs: 3.8, fat: 4.1, fiber: 2.2 },
  { id: 'taco-52', name: 'Couve Manteiga Refogada', category: 'Vegetais', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 75, protein: 2.8, carbs: 6.8, fat: 4.3, fiber: 3.1 },
  { id: 'taco-53', name: 'Alface Americana / Crespa', category: 'Vegetais', portion: '50g (1 prato de sobremesa)', portionGrams: 50, calories: 7, protein: 0.7, carbs: 1.2, fat: 0.1, fiber: 0.8 },
  { id: 'taco-54', name: 'Rúcula Fresca', category: 'Vegetais', portion: '50g (1 prato)', portionGrams: 50, calories: 13, protein: 1.3, carbs: 1.8, fat: 0.3, fiber: 0.9 },
  { id: 'taco-55', name: 'Tomate Salada Cru', category: 'Vegetais', portion: '100g (1 unidade média)', portionGrams: 100, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: 'taco-56', name: 'Cenoura Cozida em Cubos', category: 'Vegetais', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 34, protein: 0.8, carbs: 7.7, fat: 0.2, fiber: 2.6 },
  { id: 'taco-57', name: 'Abobrinha Italiana Cozida', category: 'Vegetais', portion: '100g (1 xícara)', portionGrams: 100, calories: 17, protein: 1.2, carbs: 3.1, fat: 0.2, fiber: 1.0 },
  { id: 'taco-58', name: 'Couve-Flor Cozida no Vapor', category: 'Vegetais', portion: '100g (1 xícara)', portionGrams: 100, calories: 25, protein: 1.9, carbs: 5.0, fat: 0.3, fiber: 2.0 },

  // --- GORDURAS BOAS, SEMENTES & OLEAGINOSAS ---
  { id: 'taco-59', name: 'Azeite de Oliva Extra Virgem', category: 'Gorduras Boas', portion: '10ml (1 colher de sopa)', portionGrams: 10, calories: 88, protein: 0, carbs: 0, fat: 10.0, fiber: 0 },
  { id: 'taco-60', name: 'Pasta de Amendoim Integral', category: 'Gorduras Boas', portion: '15g (1 colher de sopa)', portionGrams: 15, calories: 92, protein: 4.0, carbs: 3.0, fat: 7.5, fiber: 1.2 },
  { id: 'taco-61', name: 'Castanha-do-Pará (Brasil)', category: 'Oleaginosas', portion: '10g (2 unidades)', portionGrams: 10, calories: 65, protein: 1.4, carbs: 1.2, fat: 6.6, fiber: 0.8 },
  { id: 'taco-62', name: 'Castanha de Caju Torrada sem Sal', category: 'Oleaginosas', portion: '20g (1 punhado)', portionGrams: 20, calories: 116, protein: 3.6, carbs: 6.0, fat: 9.2, fiber: 0.7 },
  { id: 'taco-63', name: 'Nozes Chilenas', category: 'Oleaginosas', portion: '15g (3 metades)', portionGrams: 15, calories: 98, protein: 2.3, carbs: 2.0, fat: 9.8, fiber: 1.0 },
  { id: 'taco-64', name: 'Chia em Grãos', category: 'Sementes', portion: '10g (1 colher de sobremesa)', portionGrams: 10, calories: 49, protein: 1.7, carbs: 4.2, fat: 3.1, fiber: 3.4 },
  { id: 'taco-65', name: 'Linhaça Dourada Moída', category: 'Sementes', portion: '10g (1 colher de sobremesa)', portionGrams: 10, calories: 53, protein: 1.8, carbs: 2.9, fat: 4.2, fiber: 2.7 },
  { id: 'taco-66', name: 'Gergelim Branco Tostado', category: 'Sementes', portion: '10g (1 colher de sopa)', portionGrams: 10, calories: 58, protein: 1.8, carbs: 2.3, fat: 5.0, fiber: 1.2 },

  // --- SUPLEMENTOS & FÓRMULAS ---
  { id: 'taco-67', name: 'Whey Protein Concentrado 80%', category: 'Suplementos', portion: '30g (1 dosador)', portionGrams: 30, calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, fiber: 0 },
  { id: 'taco-68', name: 'Whey Protein Isolado (WPI 90%)', category: 'Suplementos', portion: '30g (1 dosador)', portionGrams: 30, calories: 110, protein: 27.0, carbs: 0.5, fat: 0.3, fiber: 0 },
  { id: 'taco-69', name: 'Proteína Vegetal (Ervilha e Arroz)', category: 'Suplementos', portion: '30g (1 dosador)', portionGrams: 30, calories: 115, protein: 22.0, carbs: 2.5, fat: 1.2, fiber: 1.5 },
  { id: 'taco-70', name: 'Creatina Monoidratada Pura', category: 'Suplementos', portion: '5g (1 dosador)', portionGrams: 5, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  { id: 'taco-71', name: 'Psyllium em Pó Puro', category: 'Fibras & Suplementos', portion: '10g (1 colher de sopa)', portionGrams: 10, calories: 20, protein: 0.2, carbs: 8.0, fat: 0.1, fiber: 7.5 }
];
