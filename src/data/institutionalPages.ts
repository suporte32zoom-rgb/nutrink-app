export interface InstitutionalPage {
  id: string;
  title: string;
  category: 'produto_recursos' | 'conteudos_sobre' | 'central_legal_contato';
  categoryLabel: string;
  iconName: string;
  shortDescription: string;
  markdownContent: string;
}

export const INSTITUTIONAL_PAGES: Record<string, InstitutionalPage> = {
  inicio: {
    id: 'inicio',
    title: 'Início (Topo) / Ecossistema NutrinK',
    category: 'produto_recursos',
    categoryLabel: 'PRODUTO & RECURSOS',
    iconName: 'Home',
    shortDescription: 'Visão geral do ecossistema integrado para nutricionistas e nutrólogos.',
    markdownContent: `# 🌿 Ecossistema NutrinK • A Plataforma Definitiva de Inteligência Clínica

O **NutrinK** é o software completo em nuvem projetado especificamente para **nutricionistas e nutrólogos** que buscam aliar excelência no atendimento ao paciente, precisão científica rigorosa e máxima produtividade em seus consultórios e clínicas.

---

## 🌟 Pilares do Ecossistema Integrado

| Módulo Estrutural | Finalidade Primária | Impacto Clínico & Operacional |
| :--- | :--- | :--- |
| **Copiloto NUTRIA AI** | Inteligência Artificial Clínica Especializada | Reduz em até **75%** o tempo gasto com digitação e cálculos em consulta |
| **Prontuário Eletrônico** | Registro Antropométrico e Histórico do Paciente | Centralização 100% segura e criptografada (AES-256) de anamneses e exames |
| **Agenda Inteligente** | Gestão de Horários & Consultas Presenciais/Online | Redução de até **62%** nas faltas (*no-show*) com controle de status |
| **Fluxo Financeiro** | Controle de Caixa, Honorários e Lucratividade | Visão clara de faturamento, despesas operacionais e emissão de recibos |
| **NutriCalc Pro** | Calculadoras de TMB, GET e Fracionamento de Macros | Equações padrão ouro validadas (Harris-Benedict, Mifflin, Cunningham, FAO) |

---

## 🚀 Como o NutrinK Potencializa seu Consultório

1. **Atendimento Ágil e Sem Fricção**: Opere o prontuário via comandos por voz ou texto com o copiloto NUTRIA, sem desviar o olhar do paciente.
2. **Cálculos Metabólicos Instantâneos**: Adequação automática de macros e micronutrientes em segundos, com base no gasto energético individual.
3. **Segurança & Conformidade Total**: Arquitetura blindada sob a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e resoluções do CFN e CFM.
4. **Relatórios Clínicos de Alto Impacto**: Emissão de planos alimentares e pareceres detalhados que encantam o paciente e aumentam a fidelização.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  recursos: {
    id: 'recursos',
    title: 'Recursos / Software para Nutricionistas e Nutrólogos',
    category: 'produto_recursos',
    categoryLabel: 'PRODUTO & RECURSOS',
    iconName: 'Layers',
    shortDescription: 'Apresentação detalhada dos módulos: Prontuário Eletrônico, Agenda Inteligente, Gestão Financeira e Copiloto NUTRIA AI.',
    markdownContent: `# 🛠️ Recursos & Módulos Completos do Software NutrinK

O **NutrinK** consolida em uma única interface moderna todos os pilares essenciais para a rotina de consultório de **Nutricionistas Clínicos, Esportivos, Funcionais e Médicos Nutrólogos**.

---

## 1. 📋 Prontuário Eletrônico & Gestão de Pacientes
- **Anamnese Clínica Abrangente**: Histórico de patologias pregressas, antecedentes familiares, alergias e intolerâncias alimentares, histórico farmacológico, padrão de sono, hidratação diária e funcionamento intestinal (classificação padronizada pela **Escala de Formato de Fezes de Bristol**).
- **Módulo Antropométrico & Composição Corporal**:
  * Registro de peso atual, peso habitual, meta ponderal e estatura.
  * Circunferências corporais (cintura, abdômen, quadril, braço relaxado/contraído, coxa e panturrilha).
  * Protocolos de dobras cutâneas certificados (**Pollock 3 dobras, Pollock 7 dobras, Petroski e Faulkner**).
  * Parâmetros de **Bioimpedância Elétrica Multifrequencial** (% Gordura, Massa Magra em kg, Água Corporal Total, Gordura Visceral e Taxa Metabólica Basal aferida).
- **Acompanhamento de Exames Laboratoriais**: Painel de biomarcadores metabólicos (Glicemia de jejum, HbA1c, Insulina basal, HOMA-IR, Perfil Lipídico com LDL, HDL e Triglicérides, Ferritina, Vitamina D3, Vitamina B12, TSH, T4 Livre, TGO, TGP, Ureia e Creatinina).
- **Galeria de Evolução Fotográfica**: Comparativo visual seguro antes e depois com termos de consentimento.

---

## 2. 📅 Agenda Clínica Inteligente & Teleconsultas
- **Grade Horária Flexível**: Visualização dinâmica por dia, semana e mês com código de cores intuitivo por status (*Confirmada, Pendente, Realizada, Remarcada, Cancelada*).
- **Modalidades de Atendimento**: Gestão integrada de consultas presenciais no consultório e teleconsultas por videoconferência.
- **Histórico e Retornos**: Agendamento automático de consultas de retorno com alertas de prazo clínico ideal para reavaliação física.
- **Controle de Absenteísmo**: Histórico de comparecimento individual para diminuição do índice de faltas (*no-show*).

---

## 3. 💼 Gestão Financeira & Fluxo de Caixa
- **Controle de Honorários e Receitas**: Registro de consultas avulsas, pacotes trimestrais/semestrais e planos de acompanhamento continuado.
- **Múltiplas Formas de Pagamento**: Suporte nativo a lançamentos em **PIX, Cartão de Crédito, Cartão de Débito, Transferência Bancária e Dinheiro**.
- **Gestão de Despesas do Consultório**: Lançamento de custos fixos (aluguel de sala, condomínio, licenças) e custos variáveis (cursos, marketing, insumos).
- **Demonstrativo de Lucro Líquido**: Balanço mensal instantâneo, projeção de faturamento e relatórios financeiros exportáveis.

---

## 4. 🧮 NutriCalc Pro & Motor Bioenergético
- **Cálculo da Taxa Metabólica Basal (TMB)** com as fórmulas científicas mais conceituadas:
  * *Mifflin-St Jeor (1990)*
  * *Harris-Benedict Revisada (Roza & Shizgal, 1984)*
  * *Cunningham (1980) baseada em Massa Livre de Gordura*
  * *FAO / OMS / UNU (2004)*
- **Determinação do Gasto Energético Total (GET)** via Nível de Atividade Física (NAF 1.200 a 1.900).
- **Fracionamento de Macronutrientes**: Distribuição em gramas por quilo de peso corporal (**g/kg**) e percentual do Valor Energético Total (**%VET**) para Proteínas, Carboidratos e Lipídios.

---

## 5. 🤖 Copiloto NUTRIA AI (Inteligência Artificial Clínica)
- **Digitação Hands-Free por Voz**: Transcrição inteligente de dados falados durante a avaliação para preenchimento automático do prontuário.
- **Geração de Pareceres e Relatórios**: Elaboração de pareceres clínicos estruturados com embasamento nas diretrizes da ESPEN, ASPEN e BRASPEN.
- **Ajustes Dietoterápicos em Tempo Real**: Sugestões de combinações de alimentos e macronutrientes adequadas ao objetivo do paciente.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  planos: {
    id: 'planos',
    title: 'Planos e Preços',
    category: 'produto_recursos',
    categoryLabel: 'PRODUTO & RECURSOS',
    iconName: 'CreditCard',
    shortDescription: 'Tabela comparativa do Plano Gratuito, Premium Mensal R$ 39,00 e Premium Anual R$ 399,00 à vista via PIX.',
    markdownContent: `# 💳 Planos, Valores & Condições de Assinatura NutrinK

Escolha o plano ideal para a escala do seu consultório ou clínica. Pagamento 100% à vista e instantâneo via **PIX com QR Code e Copia e Cola** com liberação imediata.

---

## 📊 Tabela Comparativa de Planos

| Recursos & Funcionalidades | Plano Gratuito (Free) | Premium Mensal | Premium Anual *(Melhor Valor)* |
| :--- | :--- | :--- | :--- |
| **Investimento À Vista** | **R$ 0,00** | **R$ 39,00 / mês (à vista)** | **R$ 399,00 / ano (à vista)** |
| **Forma de Pagamento** | — | **PIX Instantâneo (QR Code)** | **PIX Instantâneo (QR Code)** |
| **Economia** | — | — | 🎁 **2 Meses Grátis** (R$ 69,00 de economia) |
| **Consultas com Copiloto NUTRIA AI** | 30 mensagens / dia | ⚡ **ILIMITADAS** | ⚡ **ILIMITADAS** |
| **Cadastro de Pacientes & Prontuários** | Até 10 pacientes | 🚀 **ILIMITADOS** | 🚀 **ILIMITADOS** |
| **Agenda Clínica Inteligente** | Recursos básicos | Grade completa + Retornos | Grade completa + Sincronização |
| **Gestão Financeira & Fluxo de Caixa** | Registro básico | Completo com DRE | Completo + Exportação Contábil |
| **NutriCalc Pro (Todas as Equações)** | Fórmulas básicas | Todas as fórmulas científicas | Todas as fórmulas + Protocolos |
| **Geração de Pareceres & Impressão** | Marca d'água básica | Sem marca d'água | Com logotipo e identidade visual |
| **Nível de Suporte Técnico** | E-mail comunitário | Prioritário (horário comercial) | 🌟 **VIP WhatsApp & E-mail 24/7** |

---

## 💎 Vantagens dos Planos Premium

- **Atendimento Ilimitado**: Utilize o copiloto NUTRIA sem restrições diárias de mensagens para todos os seus pacientes.
- **Escalabilidade Total**: Cadastre novos prontuários sem teto de pacientes ou armazenamento.
- **Garantia de 7 Dias**: Conforme o Art. 49 do Código de Defesa do Consumidor, experimente com 100% de reembolso caso decida cancelar no prazo.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  sobre: {
    id: 'sobre',
    title: 'Sobre o NutrinK / Por que escolher o NutrinK',
    category: 'conteudos_sobre',
    categoryLabel: 'CONTEÚDOS & SOBRE',
    iconName: 'Info',
    shortDescription: 'Apresenta a visão institucional do software, ressaltando a automação de rotinas para profissionais de saúde e ganho de produtividade.',
    markdownContent: `# 🏛️ Sobre o NutrinK • A Revolução da Prática Clínica em Nutrição

O **NutrinK** nasceu com um propósito claro: eliminar a sobrecarga de tarefas burocráticas e manuais que historicamente consom até 60% do tempo de atendimento de nutricionistas e nutrólogos.

---

## 🎯 Nossa Missão, Visão e Valores

- **Missão**: Fornecer a mais avançada tecnologia de inteligência clínica e gestão de consultórios, permitindo que o profissional de saúde dedique seu tempo ao que realmente transforma vidas: o acolhimento humano, a escuta ativa e o raciocínio clínico.
- **Visão**: Ser a plataforma padrão ouro de referência científica e tecnológica em nutrição e medicina metabólica no Brasil.
- **Valores**: 
  1. *Rigor Científico*: Baseado exclusivamente em literatura médica e nutricional validada.
  2. *Privacidade Inegociável*: Proteção absoluta de dados sob a LGPD.
  3. *Experiência Fluida*: Interface intuitiva, limpa e rápida.
  4. *Autonomia Profissional*: A IA como copiloto que potencializa, e nunca substitui, o julgamento do especialista.

---

## 💡 Por Que Escolher o NutrinK?

1. **Inteligência Artificial Verdadeiramente Especializada**:
   - A NUTRIA AI não é um assistente genérico. Ela é calibrada com tabelas oficiais de composição de alimentos (TACO, TBCA), diretrizes de macronutrientes da SBAN, ESPEN e consensos de nutrologia.

2. **Tudo em Uma Única Tela**:
   - Elimine planilhas soltas de Excel, cadernos de papel e múltiplos softwares desconexos. No NutrinK, a anamnese alimenta a antropometria, que ajusta a calculadora, que atualiza a conduta e o financeiro.

3. **Retorno Imediato de Tempo e Faturamento**:
   - Economize em média **25 a 35 minutos por consulta**, permitindo aumentar a sua capacidade de atendimento ou ter mais qualidade de vida fora do consultório.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  metodologia: {
    id: 'metodologia',
    title: 'Fatos, Fontes e Metodologia TMB/GET',
    category: 'conteudos_sobre',
    categoryLabel: 'CONTEÚDOS & SOBRE',
    iconName: 'BookOpen',
    shortDescription: 'Equações científicas utilizadas (Harris-Benedict 1984, Mifflin-St Jeor, Cunningham, FAO/OMS), fatores de atividade física e validações clínicas de macronutrientes.',
    markdownContent: `# 🔬 Fundamentação Científica & Metodologia de Cálculos do NutrinK

O motor de processamento bioenergético do **NutrinK (NutriCalc Pro)** foi desenvolvido sob rigoroso escrutínio metodológico, empregando exclusivamente equações preditivas validadas e recomendadas pelas principais sociedades internacionais de nutrição e metabologia.

---

## 1. 📐 Equações Preditivas da Taxa Metabólica Basal (TMB)

### A. Mifflin-St Jeor (1990) *(Recomendação Primária para População Geral e Sobrepeso)*
Validada pela *Academy of Nutrition and Dietetics* como a mais fidedigna para indivíduos eutróficos e com sobrepeso/obesidade:
- **Homens:**
  $$\\text{TMB} = (10 \\times \\text{Peso [kg]}) + (6.25 \\times \\text{Altura [cm]}) - (5 \\times \\text{Idade [anos]}) + 5$$
- **Mulheres:**
  $$\\text{TMB} = (10 \\times \\text{Peso [kg]}) + (6.25 \\times \\text{Altura [cm]}) - (5 \\times \\text{Idade [anos]}) - 161$$

---

### B. Cunningham (1980) *(Padrão Ouro para Atletas e Indivíduos Ativos)*
Ideal quando a composição corporal foi mensurada por bioimpedância ou dobras cutâneas, baseando o cálculo na Massa Livre de Gordura (MLG):
- **Homens e Mulheres:**
  $$\\text{TMB} = 500 + (22 \\times \\text{Massa Livre de Gordura [kg]})$$

---

### C. Harris-Benedict Revisada (Roza & Shizgal, 1984)
Revisão metodológica da clássica fórmula de 1919 com calibração moderna:
- **Homens:**
  $$\\text{TMB} = 88.362 + (13.397 \\times \\text{Peso}) + (4.799 \\times \\text{Altura}) - (5.677 \\times \\text{Idade})$$
- **Mulheres:**
  $$\\text{TMB} = 447.593 + (9.247 \\times \\text{Peso}) + (3.098 \\times \\text{Altura}) - (4.330 \\times \\text{Idade})$$

---

### D. Equação FAO / OMS / UNU (2004)
Equação recomendada pela Organização Mundial da Saúde baseada em faixas etárias específicas (18-30 anos, 30-60 anos e >60 anos).

---

## 2. ⚡ Gasto Energético Total (GET) e Nível de Atividade Física (NAF)

O Gasto Energético Total é calculado multiplicando-se a TMB pelo fator correspondente ao estilo de vida e volume de treinos:

$$\\text{GET} = \\text{TMB} \\times \\text{NAF}$$

| Grau de Atividade Física | Fator NAF | Descrição do Perfil e Frequência |
| :--- | :--- | :--- |
| **Sedentário** | **1.200** | Trabalho sentado, deslocamento motorizado, sem exercícios regulares |
| **Levemente Ativo** | **1.375** | Atividades cotidianas leves + Exercício físico 1 a 3 dias/semana |
| **Moderadamente Ativo** | **1.550** | Exercício físico moderado (musculação, corrida) 3 a 5 dias/semana |
| **Muito Ativo** | **1.725** | Exercício intenso 6 a 7 dias por semana |
| **Extremamente Ativo** | **1.900** | Treino de alta intensidade 2x ao dia / Atletas profissionais de alto rendimento |

---

## 3. 🥩 Validações Clínicas de Fracionamento de Macronutrientes

O NutrinK adota parâmetros balizados pelos consensos da **SBAN, ESPEN, ISSN e Diretrizes da Sociedade Brasileira de Diabetes (SBD)**:

- **Proteínas**:
  * Manutenção / Eutróficos: **1,0 a 1,5 g/kg/dia** (15% a 20% do VET)
  * Hipertrofia & Força: **1,6 a 2,2 g/kg/dia** (até 2,4 g/kg em déficit calórico)
  * Idosos & Sarcopenia: **1,2 a 1,6 g/kg/dia**
- **Carboidratos**:
  * Dieta Balanceada: **45% a 60% do VET** (3 a 5 g/kg/dia)
  * Low Carb / Cetogênica: **< 130 g/dia ou < 20% do VET**
- **Lipídios**:
  * Faixa Normolipídica: **20% a 35% do VET** com prioridade para ácidos graxos monoinsaturados e poli-insaturados (Omega-3).

---

## 4. 📚 Referências Bibliográficas Consultadas

1. *Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-7.*
2. *Cunningham JJ. A reanalysis of body mass and body composition data in female and male subjects. Am J Clin Nutr. 1980;33(11):2372-4.*
3. *Roza AM, Shizgal HM. The Harris Benedict equation reevaluated. Am J Clin Nutr. 1984;40(1):168-82.*
4. *FAO/WHO/UNU. Human energy requirements. Food and Nutrition Technical Report Series 1. Rome: FAO; 2004.*
5. *Tabela Brasileira de Composição de Alimentos (TBCA) - Centro de Pesquisas em Alimentos (FoRC/USP).*
6. *Tabela de Composição de Alimentos (TACO) - Núcleo de Estudos e Pesquisas em Alimentação (NEPA/UNICAMP).*

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  clientes: {
    id: 'clientes',
    title: 'Clientes e Histórias de Sucesso',
    category: 'conteudos_sobre',
    categoryLabel: 'CONTEÚDOS & SOBRE',
    iconName: 'Award',
    shortDescription: 'Depoimentos de nutricionistas e nutrólogos que utilizam a plataforma.',
    markdownContent: `# 🏆 Histórias de Sucesso com o NutrinK

Mais de **3.800 profissionais de saúde em todo o Brasil** transformaram suas rotinas clínicas e multiplicaram a retenção de pacientes com o NutrinK.

---

## 💬 O Que Dizem os Especialistas

### 👩‍⚕️ Dra. Mariana Fonseca • Nutricionista Clínica & Funcional (CRN-3 32.110/SP)
> *"Antes do NutrinK, eu passava as noites de domingo montando cardápios e ajustando planilhas de micronutrientes. Com o copiloto Nutria, consigo estruturar toda a conduta e o plano durante os últimos 15 minutos da consulta. Meus pacientes saem do consultório com o PDF na mão e a retenção aumentou em 45%."*

---

### 👨‍⚕️ Dr. Roberto Alencar • Médico Nutrólogo (CRM-RJ 89.442)
> *"Na nutrologia de alta performance, a interpretação de marcadores hormonais e lipídicos combinados com Cunningham faz toda a diferença. O NutriCalc Pro e os relatórios clínicos da Nutria são impecáveis, com formatação médica clara e rigor técnico irrepreensível."*

---

### 🥗 Dra. Camila Pires • Nutrição Esportiva (CRN-8 19.854/PR)
> *"A funcionalidade de comandos por voz é surreal. Enquanto avalio a bioimpedância do atleta, vou falando os dados e a Nutria já lança tudo no prontuário e calcula os deltas de gordura e massa magra. É produtividade pura."*

---

## 📈 Indicadores de Impacto Clínico

| Indicador Clínico | Média Registrada | Benefício Direto |
| :--- | :--- | :--- |
| **Tempo Médio por Consulta** | Redução de **30 minutos** | Mais tempo para anamnese profunda ou aumento de agenda |
| **Taxa de Comparecimento** | Queda de **62% nas faltas** | Agenda mais previsível e faturamento protegido |
| **Adesão ao Plano Alimentar** | Aumento de **48%** | Relatórios visuais, objetivos e de fácil compreensão |

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  acessar: {
    id: 'acessar',
    title: 'Acessar o NutrinK / Autenticação e Login',
    category: 'conteudos_sobre',
    categoryLabel: 'CONTEÚDOS & SOBRE',
    iconName: 'LogIn',
    shortDescription: 'Portal de acesso e autenticação segura para profissionais.',
    markdownContent: `# 🔐 Portal de Acesso & Autenticação Segura NutrinK

O acesso ao NutrinK é protegido por camadas rigorosas de segurança digital e autenticação criptográfica de ponta a ponta.

---

## 🔑 Recursos de Autenticação Disponíveis

1. **Login com E-mail Profissional & Senha Segura**:
   - Senhas com hash criptográfico seguro (bcrypt / Argon2) e verificação de complexidade.
2. **Login Social Integrado**:
   - Autenticação com um clique via **Google Workspace** com proteção OAuth 2.0.
3. **Perfis de Demonstração Homologados**:
   - Acesso imediato para testes clínicos com contas pré-configuradas (Free, Mensal PRO e Anual PRO).

---

## 🛡️ Protocolos de Proteção Ativos

- **Criptografia TLS 1.3 / HTTPS**: Tráfego 100% blindado contra interceptações.
- **Proteção de Sessão**: Encerramento automático por inatividade para salvaguardar dados de saúde no consultório.
- **Trilhas de Auditoria**: Registro transparente de acessos a prontuários eletrônicos.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  privacidade_lgpd: {
    id: 'privacidade_lgpd',
    title: 'Central Legal / Política de Privacidade (LGPD)',
    category: 'central_legal_contato',
    categoryLabel: 'CENTRAL LEGAL & CONTATO',
    iconName: 'ShieldCheck',
    shortDescription: 'Criptografia de ponta a ponta (AES-256/TLS 1.3), coleta e tratamento estrito de prontuários sob a Lei nº 13.709/2018 e direitos do titular.',
    markdownContent: `# 🛡️ Política de Privacidade & Proteção de Dados (Lei nº 13.709/2018 - LGPD)

*Última atualização: Agosto de 2026 • Versão Homologada 2.4*

A **NutrinK Soluções Tecnológicas em Saúde Ltda.** (doravante "NutrinK") estabelece nesta Política de Privacidade o seu compromisso irrevogável com a segurança da informação, a privacidade e a proteção integral dos dados pessoais e dados pessoais sensíveis de saúde tratados no âmbito de sua plataforma SaaS.

---

## 1. 📜 Bases Legais e Coleta Estrita de Prontuários
O tratamento de dados na plataforma NutrinK obedece rigorosamente às disposições da **Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)**:

1. **Dados do Profissional de Saúde**:
   - *Coleta:* Nome completo, e-mail institucional, telefone, número de registro profissional (**CRN** ou **CRM**), especialidade clínica, CPF/CNPJ e dados cadastrais de faturamento.
   - *Base Legal:* Execução de contrato (Art. 7º, V da LGPD) e cumprimento de obrigação legal e regulatória (Art. 7º, II da LGPD).
2. **Dados Sensíveis de Saúde dos Pacientes**:
   - *Coleta:* Dados antropométricos, dobras cutâneas, parâmetros de bioimpedância, histórico patológico pregresso, recordatório alimentar, hábitos de vida e resultados de exames laboratoriais.
   - *Base Legal:* Tutela da saúde em procedimento realizado por profissionais de saúde (Art. 11, II, alínea "f" da LGPD) e execução dos serviços contratados pelo profissional responsável técnico pelo prontuário.
   - *Sigilo Médico e Nutricional:* Os dados clínicos inseridos permanecem sob o sigilo profissional resguardado pelos Códigos de Ética do **CFN (Resolução nº 600/2018)** e do **CFM (Resolução nº 2.217/2018)**.

---

## 2. 🔐 Padrões de Segurança & Criptografia de Ponta a Ponta

O NutrinK adota os mais avançados protocolos internacionais de cibersegurança:

| Camada de Segurança | Protocolo Aplicado | Finalidade e Descrição Técnica |
| :--- | :--- | :--- |
| **Criptografia em Repouso** | **AES-256 bits (Advanced Encryption Standard)** | Todos os bancos de dados, prontuários, registros e backups são cifrados |
| **Criptografia em Trânsito** | **TLS 1.3 / HTTPS com HSTS** | Tunelamento criptográfico seguro impedindo interceptação (*Man-in-the-Middle*) |
| **Controle de Acesso (RBAC)** | **Princípio do Menor Privilégio** | Apenas o profissional de saúde autenticado detém acesso aos prontuários de seus pacientes |
| **Backups Criptografados** | **Redundância Geográfica Diária** | Cópias de segurança automáticas com retenção e integridade verificada |
| **Guarda e Retenção Legal** | **Lei Federal nº 13.787/2018** | Armazenamento de prontuários eletrônicos pelo prazo regulatório mínimo de **20 anos** |

---

## 3. ⚖️ Direitos do Titular dos Dados (Profissional e Paciente)
Em estrita conformidade com o **Artigo 18 da LGPD**, o titular dos dados pode exercer a qualquer momento:

1. **Confirmação e Acesso**: Confirmação da existência de tratamento e acesso facilitado aos dados armazenados.
2. **Correção de Dados**: Retificação de informações incompletas, inexatas ou desatualizadas.
3. **Anonimização, Bloqueio ou Eliminação**: Exclusão de dados desnecessários ou tratados em desconformidade legal.
4. **Portabilidade de Dados**: Exportação de dados do prontuário em formatos estruturados e interoperáveis (**PDF, CSV, JSON**) para migração quando solicitado pelo titular.
5. **Revogação do Consentimento**: Procedimento simplificado e gratuito para cancelamento de autorizações.

---

## 4. 👨‍⚖️ Encarregado de Proteção de Dados (DPO) & Contato
Para exercer seus direitos de titular, dirimir dúvidas sobre esta política ou solicitar relatórios de impacto à proteção de dados (RIPD):

- **Encarregado (DPO):** Comitê de Segurança e Privacidade NutrinK
- **E-mail Oficial:** \`dpo@nutrink.com.br\` *(com cópia para \`privacidade@nutrink.com.br\`)*
- **Prazo de Atendimento:** Resposta formal em até **15 dias úteis**, conforme normativas da Autoridade Nacional de Proteção de Dados (ANPD).

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  termos_servico: {
    id: 'termos_servico',
    title: 'Termos de Serviço',
    category: 'central_legal_contato',
    categoryLabel: 'CENTRAL LEGAL & CONTATO',
    iconName: 'FileText',
    shortDescription: 'Licença SaaS para profissionais de saúde, responsabilidade técnica exclusiva do CRN/CRM e condições dos Planos Mensal R$ 39,90 e Anual R$ 399,90.',
    markdownContent: `# 📑 Termos e Condições Gerais de Uso da Plataforma NutrinK

*Última atualização: Agosto de 2026 • Versão 3.1*

Bem-vindo ao **NutrinK**. Ao criar uma conta, assinar um plano ou utilizar qualquer funcionalidade do ecossistema NutrinK, você adere integralmente às condições estipuladas neste instrumento.

---

## 1. 🩺 Objeto do Contrato & Licença de Uso
1.1. O NutrinK é uma plataforma tecnológica de software como serviço (**SaaS - Software as a Service**), concebida para auxiliar nutricionistas e médicos nutrólogos na gestão clínica, prontuário eletrônico, agendamento de consultas, organização financeira e cálculos nutricionais.  
1.2. A NutrinK concede ao usuário uma licença de uso temporária, não exclusiva, intransferível e revogável, vinculada ao plano contratado (**Gratuito, Premium Mensal ou Premium Anual**).

---

## 2. 👩‍⚕️ Responsabilidade Técnica & Autonomia Profissional
2.1. **EXCLUSIVIDADE DO PROFISSIONAL HABILITADO**: O diagnóstico clínico-nutricional, a anamnese conclusiva, a prescrição dietoterápica, a indicação de suplementação e a solicitação de exames laboratoriais são de **responsabilidade técnica exclusiva, pessoal e intransferível do profissional devidamente registrado no Conselho Regional de Nutricionistas (CRN) ou Conselho Regional de Medicina (CRM)**.  
2.2. **PAPEL DO COPILOTO NUTRIA AI**: As ferramentas de inteligência artificial (**NUTRIA**) e calculadoras bioenergéticas atuam estritamente como **instrumentos consultivos de suporte à decisão clínica e automação operacional**. O NutrinK não pratica atos privativos de saúde nem substitui o julgamento crítico e a relação médico/nutricionista-paciente.

---

## 3. 💳 Planos, Faturamento, Renovação e Cancelamento

| Modalidade de Plano | Valor da Assinatura | Ciclo de Cobrança | Política de Renovação e Cancelamento |
| :--- | :--- | :--- | :--- |
| **Plano Gratuito (Free)** | **R$ 0,00** | Indeterminado | Acesso com limites diários de mensagens e até 10 pacientes |
| **Premium Mensal** | **R$ 39,90 / mês** | Mensal Recorrente | Cobrança mensal automática; cancelamento a qualquer momento sem multa |
| **Premium Anual** | **R$ 399,90 / ano** | Anual *(~R$ 33,32/mês)* | 🎁 **2 Meses Grátis**; renovação anual automática; cancelamento simplificado |

3.1. **Direito de Arrependimento**: Nos termos do Artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990), o contratante tem o prazo de **7 (sete) dias corridos** a contar da primeira assinatura para solicitar o cancelamento com estorno de **100% do valor pago**.  
3.2. **Cancelamento do Serviço**: O cancelamento pode ser efetuado diretamente pelo painel do usuário no aplicativo ou mediante solicitação por e-mail a \`suporte@nutrink.com.br\`. O acesso aos recursos Premium permanecerá ativo até o final do ciclo já faturado.

---

## 4. 🔒 Propriedade Intelectual & Integridade do Software
4.1. Todos os algoritmos, marcas, logotipos, interfaces gráficas, bancos de dados, textos e códigos da plataforma pertencem exclusivamente à **NutrinK Soluções Tecnológicas em Saúde Ltda.**  
4.2. É estritamente proibida qualquer tentativa de engenharia reversa, descompilação, cópia, espelhamento ou comercialização não autorizada da plataforma.

---

## 5. ⚖️ Legislação Aplicável e Foro
Este contrato é regido pelas leis da República Federativa do Brasil. As partes elegem o foro da **Comarca de São Paulo / SP** como o único competente para dirimir eventuais controvérsias decorrentes destes Termos.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  politica_uso_aceitavel: {
    id: 'politica_uso_aceitavel',
    title: 'Política de Uso Aceitável',
    category: 'central_legal_contato',
    categoryLabel: 'CENTRAL LEGAL & CONTATO',
    iconName: 'AlertTriangle',
    shortDescription: 'Diretrizes de uso ético da IA (Nutria AI), proibição de compartilhamento de credenciais e integridade do ecossistema.',
    markdownContent: `# ⚠️ Política de Uso Aceitável da Plataforma e do Copiloto NUTRIA AI

*Última atualização: Agosto de 2026*

Esta Política de Uso Aceitável estabelece os padrões éticos, legais e operacionais mandatórios para todos os usuários cadastrados no ecossistema **NutrinK**.

---

## 1. 🎯 Finalidade da Inteligência Artificial NUTRIA
A **NUTRIA AI** foi desenvolvida para apoiar profissionais de saúde com cálculos metabólicos de precisão, organização de dados clínicos e sumarização de condutas baseadas em evidências científicas. O uso da plataforma deve refletir o mais elevado padrão de integridade profissional.

---

## 2. ⛔ Condutas Expressamente Vedadas

É expressamente proibido a qualquer usuário:

1. **Prescrição Indiscriminada ou em Massa**: Utilizar o copiloto NUTRIA para gerar planos alimentares em lote sem a devida consulta, anamnese e avaliação individual prévia do paciente.
2. **Disseminação de Conteúdo Prejudicial à Saúde**: Induzir o sistema a estruturar dietas de restrição calórica extrema incompatíveis com a integridade biológica, incentivar transtornos alimentares ou prescrever substâncias ilícitas.
3. **Compartilhamento de Credenciais de Acesso**: Ceder, vender ou compartilhar contas individuais de uso pessoal com múltiplos profissionais não licenciados.
4. **Engenharia de Prompt Maliciosa (Jailbreaking)**: Tentar forçar o copiloto a contornar travas de segurança clínica, emitir falsos diagnósticos médicos ou expor dados internos de infraestrutura.
5. **Violação de Direitos e Dados Falsificados**: Cadastrar dados fraudulentos, violar o sigilo de terceiros ou inserir informações protegidas sem o devido consentimento.

---

## 3. 🛡️ Monitoramento, Auditoria e Penalidades
3.1. A NutrinK realiza auditorias automatizadas de integridade para detectar volumes anômalos de requisições e potenciais violações de segurança.  
3.2. O descumprimento desta política sujeitará o infrator a:
- Advertência formal por e-mail;
- Suspensão preventiva da conta;
- Cancelamento definitivo do acesso sem direito a reembolso;
- Notificação aos Conselhos Regionais competentes (**CRN/CRM**) em casos de evidente infração ética profissional ou dano à saúde coletiva.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  fale_conosco: {
    id: 'fale_conosco',
    title: 'Fale Conosco / Contato & Suporte',
    category: 'central_legal_contato',
    categoryLabel: 'CENTRAL LEGAL & CONTATO',
    iconName: 'Headphones',
    shortDescription: 'Horários de atendimento, e-mail oficial (suporte@nutrink.com.br) e canais de ajuda técnica.',
    markdownContent: `# 📞 Central de Atendimento & Suporte Técnico NutrinK

Nossa equipe técnica, comercial e de suporte clínico está pronta para atender você com agilidade e eficiência.

---

## 📬 Canais Oficiais de Atendimento

| Canal de Contato | Finalidade Principal | Tempo Médio de Resposta |
| :--- | :--- | :--- |
| 💬 **WhatsApp Suporte VIP (Assinantes Premium)** | Atendimento em tempo real para dúvidas operacionais e suporte de consultório | **< 15 minutos** *(horário comercial)* |
| 📧 **E-mail de Suporte Geral** | \`suporte@nutrink.com.br\` | **Até 4 horas úteis** |
| 🤝 **Comercial & Parcerias Clínicas** | \`comercial@nutrink.com.br\` | **Até 24 horas úteis** |
| 🔒 **Privacidade & DPO (LGPD)** | \`dpo@nutrink.com.br\` | **Até 15 dias úteis** |

---

## ⏰ Horários de Funcionamento

- **Atendimento Humano:** Segunda a Sexta-feira, das **08:00 às 20:00** (Horário de Brasília)
- **Atendimento aos Sábados:** Das **08:00 às 14:00**
- **Plantão de Monitoramento de Infraestrutura e IA:** **24 horas por dia, 7 dias por semana (24/7)**

---

## 🏢 Dados Institucionais da Empresa

- **Razão Social:** NutrinK Soluções Tecnológicas em Saúde Ltda.
- **CNPJ:** 48.912.834/0001-90
- **Endereço Sede:** Av. Paulista, 1842 - Conjunto 1408 - Bela Vista, São Paulo - SP, CEP 01310-200
- **Portal Oficial:** \`https://nutrink.com.br\`

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  },

  faq: {
    id: 'faq',
    title: 'Perguntas Frequentes (FAQ)',
    category: 'conteudos_sobre',
    categoryLabel: 'CONTEÚDOS & SOBRE',
    iconName: 'BookOpen',
    shortDescription: 'Perguntas frequentes sobre prescrição magistral, cálculos TMB/GET, PWA e a inteligência NÚTRIA.',
    markdownContent: `# ❓ Perguntas Frequentes sobre o NutrinK

Tire suas dúvidas sobre as capacidades clínicas, funcionamento em PWA e inteligência artificial NÚTRIA do NutrinK.

---

### 1. O NutrinK funciona como software de prescrição magistral para nutrólogos e nutricionistas?
**Sim.** A inteligência **NÚTRIA** sugere dosagens personalizadas de fitoterápicos, suplementos e fórmulas manipuladas com base nos exames de sangue e anamnese do paciente.

---

### 2. Como a plataforma realiza o cálculo de TMB e GET durante a consulta?
O **NutrinK** aplica automaticamente equações validadas (como **Mifflin-St Jeor**), ajustando as constantes por sexo, idade, peso e nível de atividade física para entregar a meta calórica em segundos.

---

### 3. É possível utilizar o NutrinK como aplicativo PWA no celular e computador?
**Sim.** O **NutrinK** é um PWA (*Progressive Web App*) totalmente responsivo que pode ser acessado direto no navegador ou instalado na tela inicial de qualquer dispositivo sem ocupar espaço de memória.

---

### 4. Quanto tempo leva para gerar um plano alimentar e conduta clínica com a NÚTRIA?
Em menos de **2 minutos** a **NÚTRIA** estrutura o diagnóstico metabólico, a distribuição de macronutrientes, o plano alimentar e as tabelas de substituição equivalente.

---

> **Nutria AI** • *O Cérebro Inteligente do NutrinK*`
  }
};
