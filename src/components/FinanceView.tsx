import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CreditCard, 
  QrCode, 
  Printer, 
  Bot, 
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { FinancialTransaction, Patient } from '../types';
import { NutrinKLogo } from './NutrinKLogo';

interface FinanceViewProps {
  transactions: FinancialTransaction[];
  patients: Patient[];
  onOpenNewTransaction: () => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  patients,
  onOpenNewTransaction,
  onOpenNutriaWithPrompt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<FinancialTransaction | null>(null);

  // Financial calculations
  const totalRevenue = transactions
    .filter(t => t.type === 'receita' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'despesa' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalRevenue - totalExpenses;

  const pendingRevenue = transactions
    .filter(t => t.type === 'receita' && t.status === 'pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.patientName && t.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'todos' || t.type === typeFilter;
    return matchesSearch && matchesType;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Payment Method Aggregation
  const pixRevenue = transactions.filter(t => t.type === 'receita' && t.paymentMethod === 'pix').reduce((a, c) => a + c.amount, 0);
  const cardRevenue = transactions.filter(t => t.type === 'receita' && (t.paymentMethod === 'cartao_credito' || t.paymentMethod === 'cartao_debito')).reduce((a, c) => a + c.amount, 0);
  const otherRevenue = totalRevenue - (pixRevenue + cardRevenue);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-fuchsia-400" />
            Financeiro & Faturamento Clínico
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Fluxo de caixa, recebimentos de consultas, pacotes e despesas operacionais do consultório.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNutriaWithPrompt("Nutria, faça um relatório financeiro do mês com total faturado, ticket médio e sugestões de precificação de planos de acompanhamento.")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="w-4 h-4 text-fuchsia-300" />
            <span>Auditoria Financeira NUTRIA</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/50 transition-all border border-fuchsia-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Receitas */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase">Receitas Totais</span>
            <div className="w-8 h-8 rounded-xl bg-purple-950 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/40 shadow-sm">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-fuchsia-300 mt-3">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-purple-200 mt-1 block">Entradas confirmadas no mês</span>
        </div>

        {/* Despesas */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase">Despesas / Custos</span>
            <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-300 flex items-center justify-center border border-rose-700/40 shadow-sm">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-300 mt-3">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-purple-200 mt-1 block">Aluguel, softwares e insumos</span>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase">Resultado Líquido</span>
            <div className="w-8 h-8 rounded-xl bg-purple-950 text-purple-200 flex items-center justify-center border border-purple-600/40 shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-fuchsia-300 font-bold mt-1 block">
            Margem Líquida: {totalRevenue > 0 ? Math.round((netBalance / totalRevenue) * 100) : 0}%
          </span>
        </div>

        {/* Pendente a Receber */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase">A Receber / Pendente</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-300 flex items-center justify-center border border-amber-700/40 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 mt-3">
            R$ {pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-purple-200 mt-1 block">Faturas aguardando pagamento</span>
        </div>

      </div>

      {/* Methods Breakdown Strip */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 shadow-md">
        <h3 className="text-xs font-bold uppercase text-purple-200 mb-3">Distribuição por Meio de Pagamento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-fuchsia-400" />
              <div>
                <span className="text-xs font-bold text-white">PIX Instantâneo</span>
                <span className="text-[10px] text-purple-200 block">Taxa Zero</span>
              </div>
            </div>
            <span className="font-black text-sm text-fuchsia-300">
              R$ {pixRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-purple-300" />
              <div>
                <span className="text-xs font-bold text-white">Cartão de Crédito / Débito</span>
                <span className="text-[10px] text-purple-200 block">Planos e Recorrência</span>
              </div>
            </div>
            <span className="font-black text-sm text-purple-200">
              R$ {cardRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-300" />
              <div>
                <span className="text-xs font-bold text-white">Boleto / Outros</span>
                <span className="text-[10px] text-purple-200 block">Convênios e Faturas</span>
              </div>
            </div>
            <span className="font-black text-sm text-white">
              R$ {otherRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar lançamento ou paciente..."
              className="w-full bg-[#1e073c] border border-purple-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-purple-300" />
            {(['todos', 'receita', 'despesa'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-500/60 shadow-sm'
                    : 'bg-[#220743] text-purple-200 hover:text-white border border-purple-800/40'
                }`}
              >
                {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-purple-100">
            <thead className="bg-[#1d0637] text-purple-200 uppercase font-bold border-b border-purple-900/40">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Descrição / Paciente</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Método</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1d0637]/60">
                  <td className="p-3 font-bold text-white">{tx.date}</td>
                  <td className="p-3">
                    <span className="font-bold text-white block">{tx.description}</span>
                    {tx.patientName && (
                      <span className="text-[11px] text-purple-200 font-medium">Paciente: {tx.patientName}</span>
                    )}
                  </td>
                  <td className="p-3 capitalize text-purple-200 font-medium">{tx.category.replace('_', ' ')}</td>
                  <td className="p-3 uppercase font-semibold text-purple-200">{tx.paymentMethod}</td>
                  <td className={`p-3 text-right font-black text-sm ${tx.type === 'receita' ? 'text-fuchsia-300' : 'text-rose-400'}`}>
                    {tx.type === 'receita' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      tx.status === 'concluido'
                        ? 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-600/40'
                        : 'bg-amber-950 text-amber-200 border border-amber-600/40'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {tx.type === 'receita' && (
                      <button
                        onClick={() => setSelectedReceiptTx(tx)}
                        className="p-1.5 text-purple-300 hover:text-fuchsia-300 rounded-lg hover:bg-[#250847] transition-colors"
                        title="Visualizar Recibo NutrinK"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Receipt Modal Preview */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 bg-[#0c0018]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#150328] border border-purple-700/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <NutrinKLogo size="sm" />
              <button
                onClick={() => setSelectedReceiptTx(null)}
                className="text-purple-300 hover:text-white font-bold text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/50 space-y-3 text-xs text-purple-100">
              <div className="flex justify-between">
                <span className="text-purple-200">Número do Recibo:</span>
                <span className="font-bold text-white">{selectedReceiptTx.receiptNumber || 'REC-2026-NUTRINK'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Data de Emissão:</span>
                <span className="font-semibold text-white">{selectedReceiptTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Paciente:</span>
                <span className="font-bold text-fuchsia-300">{selectedReceiptTx.patientName || 'Paciente Particular'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Serviço Prestado:</span>
                <span className="text-white font-medium">{selectedReceiptTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Forma de Pagamento:</span>
                <span className="uppercase text-white font-bold">{selectedReceiptTx.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-purple-800/40 flex justify-between items-center">
                <span className="font-bold text-sm text-white">Valor Pago:</span>
                <span className="text-xl font-black text-fuchsia-300">
                  R$ {selectedReceiptTx.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-purple-200 text-center italic">
              Declaramos para os devidos fins de comprovação que recebemos a quantia acima discriminada pelos serviços de atendimento e planejamento nutricional.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReceiptTx(null)}
                className="px-4 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-200 text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
