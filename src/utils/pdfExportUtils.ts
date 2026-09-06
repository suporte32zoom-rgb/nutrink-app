import { Patient, MealPlan, UserAccount } from '../types';

/**
 * Generates an official, beautifully styled print window with clinic letterhead (NutrinK + Professional CRN)
 */
export function printMealPlanPdf(patient: Patient, userAccount?: UserAccount): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita janelas pop-up para gerar a impressão do plano alimentar.');
    return;
  }

  const mealPlan = patient.mealPlan;
  const doctorName = userAccount?.name || 'Dr. Nutricionista';
  const doctorCrn = userAccount?.crn || 'CRN Ativo';
  const doctorSpecialty = userAccount?.specialty || 'Nutrição Clínica & Esportiva';
  const clinicName = userAccount?.clinicName || '';
  const clinicAddress = userAccount?.clinicAddress || '';
  const clinicPhone = userAccount?.phone || '';
  const clinicEmail = userAccount?.email || 'contato@nutrink.com.br';
  const prescriptionFooter = userAccount?.prescriptionFooter || '';
  const nowStr = new Date().toLocaleDateString('pt-BR');

  const mealsHtml = mealPlan?.meals && mealPlan.meals.length > 0
    ? mealPlan.meals.map(m => `
        <div class="meal-card">
          <div class="meal-header">
            <div class="meal-title">${m.time ? `${m.time} - ` : ''}${m.name}</div>
            <div class="meal-calories">${m.items.reduce((s, i) => s + i.calories, 0)} kcal</div>
          </div>
          <table class="food-table">
            <thead>
              <tr>
                <th>Alimento</th>
                <th style="width: 140px;">Porção / Medida</th>
                <th style="text-align: right; width: 80px;">Calorias</th>
                <th style="text-align: right; width: 60px;">P (g)</th>
                <th style="text-align: right; width: 60px;">C (g)</th>
                <th style="text-align: right; width: 60px;">G (g)</th>
              </tr>
            </thead>
            <tbody>
              ${m.items.map(it => `
                <tr>
                  <td><strong>${it.foodName}</strong></td>
                  <td>${it.portion}</td>
                  <td style="text-align: right;">${it.calories}</td>
                  <td style="text-align: right;">${it.protein}g</td>
                  <td style="text-align: right;">${it.carbs}g</td>
                  <td style="text-align: right;">${it.fat}g</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')
    : `<p style="padding: 20px; background: #f8fafc; border-radius: 8px; font-style: italic;">Nenhuma refeição detalhada prescrita até o momento.</p>`;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Plano Alimentar - ${patient.name} | NutrinK</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #9333ea;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand {
            font-size: 24px;
            font-weight: 900;
            color: #581c87;
            letter-spacing: -0.5px;
          }
          .brand span {
            color: #c026d3;
          }
          .doctor-meta {
            text-align: right;
            font-size: 12px;
            color: #475569;
          }
          .doctor-meta strong {
            color: #0f172a;
            font-size: 14px;
            display: block;
          }
          .patient-card {
            background-color: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
          .patient-field {
            font-size: 11px;
            color: #6b21a8;
            font-weight: 700;
            text-transform: uppercase;
          }
          .patient-value {
            font-size: 14px;
            color: #1e1b4b;
            font-weight: 800;
            margin-top: 2px;
          }
          .macro-bar {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 18px;
            border-radius: 10px;
          }
          .macro-item {
            flex: 1;
            text-align: center;
          }
          .macro-val {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
          }
          .macro-lbl {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
          }
          .meal-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            margin-bottom: 18px;
            overflow: hidden;
            page-break-inside: avoid;
          }
          .meal-header {
            background-color: #f1f5f9;
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
          }
          .meal-title {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }
          .meal-calories {
            font-size: 12px;
            font-weight: 700;
            color: #7e22ce;
            background: #faf5ff;
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid #d8b4fe;
          }
          .food-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
          }
          .food-table th, .food-table td {
            padding: 8px 14px;
            border-bottom: 1px solid #f1f5f9;
          }
          .food-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            text-align: left;
          }
          .food-table tr:last-child td {
            border-bottom: none;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #94a3b8;
          }
          .guidelines {
            background: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 14px 18px;
            border-radius: 10px;
            margin-top: 24px;
            font-size: 12px;
            color: #92400e;
            page-break-inside: avoid;
          }
          .guidelines strong {
            color: #78350f;
            display: block;
            margin-bottom: 4px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Nutrin<span>K</span></div>
            <div style="font-size: 10px; color: #7e22ce; font-weight: bold; letter-spacing: 1px;">SISTEMA CLÍNICO & GESTÃO INTEGRADA</div>
            ${clinicName ? `<div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 4px;">${clinicName}</div>` : ''}
            ${clinicAddress ? `<div style="font-size: 11px; color: #64748b;">${clinicAddress}</div>` : ''}
          </div>
          <div class="doctor-meta">
            <strong>${doctorName}</strong>
            <div><span>${doctorCrn}</span> • <span>${doctorSpecialty}</span></div>
            ${clinicPhone ? `<div>Tel: <strong>${clinicPhone}</strong></div>` : ''}
            <div>${clinicEmail}</div>
          </div>
        </div>

        <div class="patient-card">
          <div>
            <div class="patient-field">Paciente</div>
            <div class="patient-value">${patient.name}</div>
          </div>
          <div>
            <div class="patient-field">Idade / Gênero</div>
            <div class="patient-value">${patient.age} anos (${patient.gender})</div>
          </div>
          <div>
            <div class="patient-field">Peso Atual / Meta</div>
            <div class="patient-value">${patient.currentWeightKg} kg → ${patient.targetWeightKg} kg</div>
          </div>
          <div>
            <div class="patient-field">Objetivo Clínico</div>
            <div class="patient-value">${patient.objective.replace('_', ' ').toUpperCase()}</div>
          </div>
        </div>

        <div class="macro-bar">
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetCalories || patient.get} kcal</div>
            <div class="macro-lbl">Meta Energética (VET)</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetProteinGrams || Math.round(patient.currentWeightKg * 2.0)}g</div>
            <div class="macro-lbl">Proteínas</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetCarbsGrams || Math.round((patient.get * 0.45) / 4)}g</div>
            <div class="macro-lbl">Carboidratos</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetFatGrams || Math.round((patient.get * 0.25) / 9)}g</div>
            <div class="macro-lbl">Lipídios (Gorduras)</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${patient.anamnese?.waterIntakeLiters || ((patient.currentWeightKg * 35)/1000).toFixed(1)} L/dia</div>
            <div class="macro-lbl">Meta de Hidratação</div>
          </div>
        </div>

        <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Cronograma de Refeições & Prescrição</h3>
        ${mealsHtml}

        <div class="guidelines">
          <strong>💧 Orientações Gerais & Hidratação:</strong>
          • Beba pelo menos ${(patient.anamnese?.waterIntakeLiters || ((patient.currentWeightKg * 35)/1000).toFixed(1))} litros de água ao longo do dia, distribuídos entre as refeições.<br>
          • Mastigue devagar e priorize alimentos frescos e integrais conforme a prescrição.<br>
          • Em caso de dúvidas ou necessidade de substituições, consulte seu nutricionista através do canal oficial.
        </div>

        ${prescriptionFooter ? `
        <div style="margin-top: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11.5px; color: #334155; line-height: 1.6;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">📌 Observações do Consultório:</strong>
          ${prescriptionFooter}
        </div>
        ` : ''}

        <div class="footer">
          <div>Documento gerado em ${nowStr} • <strong>${clinicName || 'NutrinK Consultório Inteligente'}</strong></div>
          <div>${doctorName} • ${doctorCrn} • Assinatura: ___________________________________</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Builds formatted WhatsApp message text and opens WhatsApp Web/App directly
 */
export function sendMealPlanViaWhatsApp(patient: Patient, userAccount?: UserAccount): void {
  const phoneDigits = (patient.phone || '').replace(/\D/g, '');
  const doctorName = userAccount?.name || 'Dr(a). Nutricionista';
  const mealPlan = patient.mealPlan;

  let text = `Olá, *${patient.name}*! Tudo bem? Aqui é do consultório de *${doctorName}*.\n\n`;
  text += `🥗 Segue o seu *Plano Alimentar NutrinK* atualizado para o objetivo de *${patient.objective.replace('_', ' ').toUpperCase()}*:\n\n`;
  text += `📊 *Metas Diárias:*\n`;
  text += `• Calorias: *${mealPlan?.targetCalories || patient.get} kcal/dia*\n`;
  text += `• Hidratação: *${patient.anamnese?.waterIntakeLiters || ((patient.currentWeightKg * 35)/1000).toFixed(1)} Litros de água/dia*\n\n`;

  if (mealPlan?.meals && mealPlan.meals.length > 0) {
    text += `🍽️ *Cronograma de Refeições:*\n\n`;
    mealPlan.meals.forEach((m) => {
      text += `*${m.time ? `${m.time} - ` : ''}${m.name}*\n`;
      m.items.forEach(it => {
        text += `  • ${it.foodName}: ${it.portion} (${it.calories} kcal)\n`;
      });
      text += `\n`;
    });
  } else {
    text += `Seu plano estruturado está ativo no prontuário eletrônico.\n\n`;
  }

  text += `Qualquer dúvida na execução ou substituições, estou à disposição!\n`;
  text += `_NutrinK • Gestão Nutricional Inteligente_`;

  const encoded = encodeURIComponent(text);
  const targetUrl = phoneDigits.length >= 10
    ? `https://wa.me/55${phoneDigits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(targetUrl, '_blank');
}

/**
 * Automatically compiles shopping list items grouped by grocery category from a meal plan
 */
export interface GroceryCategory {
  categoryName: string;
  items: { foodName: string; weeklyQuantity: string }[];
}

export function generateShoppingListFromMealPlan(patient: Patient): GroceryCategory[] {
  const mealPlan = patient.mealPlan;
  if (!mealPlan || !mealPlan.meals) return [];

  const categoryMap: { [cat: string]: { [name: string]: { count: number; portion: string } } } = {
    'Hortifrúti (Frutas, Verduras & Legumes)': {},
    'Açougue, Aves & Peixes': {},
    'Laticínios & Ovos': {},
    'Mercearia & Cereais (Arroz, Feijão, Aveia)': {},
    'Gorduras Boas, Castanhas & Sementes': {},
    'Suplementos & Especiais': {}
  };

  mealPlan.meals.forEach(m => {
    m.items.forEach(it => {
      const lower = it.foodName.toLowerCase();
      let targetCat = 'Mercearia & Cereais (Arroz, Feijão, Aveia)';

      if (lower.includes('frango') || lower.includes('carne') || lower.includes('patinho') || lower.includes('alcatra') || lower.includes('peixe') || lower.includes('tilápia') || lower.includes('salmão') || lower.includes('atum')) {
        targetCat = 'Açougue, Aves & Peixes';
      } else if (lower.includes('ovo') || lower.includes('leite') || lower.includes('queijo') || lower.includes('iogurte') || lower.includes('cottage') || lower.includes('ricota')) {
        targetCat = 'Laticínios & Ovos';
      } else if (lower.includes('banana') || lower.includes('maçã') || lower.includes('mamão') || lower.includes('morango') || lower.includes('abacaxi') || lower.includes('brócolis') || lower.includes('espinafre') || lower.includes('couve') || lower.includes('alface') || lower.includes('tomate') || lower.includes('cenoura') || lower.includes('abobrinha')) {
        targetCat = 'Hortifrúti (Frutas, Verduras & Legumes)';
      } else if (lower.includes('azeite') || lower.includes('amendoim') || lower.includes('castanha') || lower.includes('nozes') || lower.includes('chia') || lower.includes('linhaça') || lower.includes('abacate')) {
        targetCat = 'Gorduras Boas, Castanhas & Sementes';
      } else if (lower.includes('whey') || lower.includes('creatina') || lower.includes('psyllium') || lower.includes('vitamina') || lower.includes('ômega')) {
        targetCat = 'Suplementos & Especiais';
      }

      if (!categoryMap[targetCat][it.foodName]) {
        categoryMap[targetCat][it.foodName] = { count: 0, portion: it.portion };
      }
      categoryMap[targetCat][it.foodName].count += 7; // 7 days in a week
    });
  });

  const result: GroceryCategory[] = [];

  Object.entries(categoryMap).forEach(([cat, foods]) => {
    const foodList = Object.entries(foods).map(([name, data]) => {
      return {
        foodName: name,
        weeklyQuantity: `Aprox. 7 porções (${data.portion}/dia)`
      };
    });

    if (foodList.length > 0) {
      result.push({
        categoryName: cat,
        items: foodList
      });
    }
  });

  return result;
}
