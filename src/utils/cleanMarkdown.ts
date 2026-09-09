/**
 * Utilitário para higienização e limpeza de sintaxe matemática / LaTeX em textos da NÚTRIA
 * 
 * Regras Obrigatórias:
 * 1. Proibição absoluta de cifrões ($ ou $$) delimitando números, expressões ou variáveis.
 * 2. Conversão de comandos LaTeX (\text{}, \approx, \ge, \le, \times, \mu, etc.) em texto limpo e direto.
 * 3. Preservação de valores monetários em Reais (R$ 150,00) de forma correta.
 * 4. Apresentação limpa de passos de cálculos, unidades (kg, g, mg, mcg, kcal, kg/m²) e equações.
 */

export function cleanMathAndLatex(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Proteger valores monetários em Real brasileiro (R$ 150,00 ou R$150)
  const currencyPlaceholders: string[] = [];
  text = text.replace(/R\$\s*([0-9.,]+)/g, (match, val) => {
    const idx = currencyPlaceholders.length;
    currencyPlaceholders.push(`R$ ${val.trim()}`);
    return `__BRL_CURRENCY_${idx}__`;
  });

  // 2. Limpar blocos de equações delimitados por $$ ... $$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    return cleanFormulaSnippet(inner);
  });

  // 3. Limpar expressões inline delimitadas por $ ... $
  text = text.replace(/\$([^$\n\r]+?)\$/g, (match, inner) => {
    return cleanFormulaSnippet(inner);
  });

  // 4. Limpar comandos LaTeX comuns que possam ter ficado fora de delimitadores
  text = cleanLatexCommands(text);

  // 5. Restaurar os valores monetários em Reais protegidos
  text = text.replace(/__BRL_CURRENCY_(\d+)__/g, (match, idxStr) => {
    const idx = parseInt(idxStr, 10);
    return currencyPlaceholders[idx] || match;
  });

  return text;
}

/**
 * Limpa comandos e operadores LaTeX de um fragmento
 */
function cleanFormulaSnippet(snippet: string): string {
  let cleaned = snippet;

  // Remover \text{...} ou \mathrm{...} ou \mathbf{...}
  cleaned = cleaned.replace(/\\(text|mathrm|mathbf|mathit|textbf|textit)\{([^}]*)\}/g, '$2');

  // Substituir frações: \frac{a}{b} -> (a / b)
  cleaned = cleaned.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1 / $2)');

  // Substituir comandos matemáticos clássicos
  cleaned = cleanLatexCommands(cleaned);

  // Limpar chaves sobressalentes de LaTeX { }
  cleaned = cleaned.replace(/\{([^{}]+)\}/g, '$1');

  // Limpar barras invertidas residuais
  cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, '$1');
  cleaned = cleaned.replace(/\\/g, '');

  return cleaned.trim();
}

/**
 * Mapeamento e substituição de comandos LaTeX para português limpo
 */
function cleanLatexCommands(input: string): string {
  let res = input;

  // Comandos de texto e estilo
  res = res.replace(/\\(text|mathrm|mathbf|mathit|textbf|textit)\{([^}]*)\}/g, '$2');

  // Símbolos e Operadores
  res = res.replace(/\\approx/g, 'aprox.');
  res = res.replace(/\\thickapprox/g, 'aprox.');
  res = res.replace(/\\sim/g, '~');
  res = res.replace(/\\ge(q)?/g, 'mínimo de ');
  res = res.replace(/\\le(q)?/g, 'máximo de ');
  res = res.replace(/\\times/g, ' × ');
  res = res.replace(/\\cdot/g, ' · ');
  res = res.replace(/\\pm/g, ' ± ');
  res = res.replace(/\\neq/g, ' diferente de ');
  res = res.replace(/\\rightarrow/g, ' → ');
  res = res.replace(/\\to/g, ' → ');
  res = res.replace(/\\leftarrow/g, ' ← ');
  res = res.replace(/\\uparrow/g, ' ↑ ');
  res = res.replace(/\\downarrow/g, ' ↓ ');

  // Unidades e Letras Gregas
  res = res.replace(/\\mu\s*g/g, 'mcg');
  res = res.replace(/\\mu/g, 'u');
  res = res.replace(/\\alpha/g, 'alfa');
  res = res.replace(/\\beta/g, 'beta');
  res = res.replace(/\\Delta/g, 'variação');
  res = res.replace(/\\delta/g, 'd');

  // Espaçamentos LaTeX
  res = res.replace(/\\quad/g, ' ');
  res = res.replace(/\\qquad/g, ' ');
  res = res.replace(/\\[,;!]/g, ' ');

  // Potências e subscritos simples
  res = res.replace(/\^2/g, '²');
  res = res.replace(/\^3/g, '³');
  res = res.replace(/kg\/m\^2/g, 'kg/m²');
  res = res.replace(/kg\/m2/g, 'kg/m²');
  res = res.replace(/kg\/m\\text\{2\}/g, 'kg/m²');

  return res;
}

export default cleanMathAndLatex;
