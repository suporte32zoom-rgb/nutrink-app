import React, { useState } from 'react';
import { X, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { FinancialTransaction, Patient, TransactionType, PaymentMethod } from '../types';
import { getBrasiliaTodayISODate } from '../utils/dateUtils';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSaveTransaction: (transaction: FinancialTransaction) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSaveTransaction
}) => {
  const [type, setType] = useState<TransactionType>('receita');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(350);
  const [category, setCategory] = useState<string>('consulta_avulsa');
  const [paymentMethod, setPaymentMethod] = useState<FinancialTransaction['paymentMethod']>('pix');
  const [date, setDate] = useState(getBrasiliaTodayISODate());
  const [patientId, setPatientId] = useState('');
  const [status, setStatus] = useState<'concluido' | 'pendente'>('concluido');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    const patient = patients.find(p => p.id === patientId);

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date,
      type,
      description: description.trim(),
      amount: Number(amount),
      category: category as any,
      paymentMethod,
      patientId: patientId || undefined,
      patientName: patient?.name || undefined,
      status,
      receiptNumber: type === 'receita' ? `REC-${Math.floor(1000 + Math.random() * 9000)}-2026` : undefined
    };

    onSaveTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0217]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 shadow-fuchsia-950/40 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-fuchsia-950/50">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Novo Lançamento Financeiro</h3>
              <p className="text-xs text-purple-200">NutrinK Fluxo de Caixa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1.5 rounded-xl hover:bg-[#250847] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType('receita');
              setCategory('consulta_avulsa');
            }}
            className={`py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
              type === 'receita'
                ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-md'
                : 'bg-[#1e073c] text-purple-200 border-purple-800/50 hover:bg-[#280a4f]'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-fuchsia-400" />
            <span>Receita (Entrada)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('despesa');
              setCategory('aluguel_consultorio');
            }}
            className={`py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
              type === 'despesa'
                ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-md'
                : 'bg-[#1e073c] text-purple-200 border-purple-800/50 hover:bg-[#280a4f]'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
            <span>Despesa (Saída)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="text-purple-200 font-bold">Descrição *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'receita' ? 'ex: Consulta de Retorno + Plano' : 'ex: Assinatura de Software Nutricional'}
              className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white placeholder-purple-300/50 focus:outline-none focus:border-fuchsia-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-purple-200 font-bold">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm font-black text-white text-fuchsia-300 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-purple-200 font-bold">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-purple-200 font-bold">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
              >
                {type === 'receita' ? (
                  <>
                    <option value="consulta_avulsa">Consulta Avulsa</option>
                    <option value="plano_trimestral">Plano Trimestral</option>
                    <option value="plano_semestral">Plano Semestral</option>
                    <option value="bioimpedancia_avulsa">Exame Bioimpedância</option>
                    <option value="palestra_curso">Curso / Mentoria</option>
                  </>
                ) : (
                  <>
                    <option value="aluguel_consultorio">Aluguel / Sala</option>
                    <option value="software_plataformas">Softwares & Sistemas</option>
                    <option value="marketing_anuncios">Marketing & Tráfego</option>
                    <option value="equipamentos_antropometria">Equipamentos & Insumos</option>
                    <option value="cursos_atualizacoes">Cursos & Congressos</option>
                    <option value="impostos_taxas">Impostos / Contador</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-purple-200 font-bold">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
              >
                <option value="pix">PIX Instantâneo</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="transferencia">TED / Transferência</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-purple-200 font-bold">Vincular a Paciente (Opcional)</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
            >
              <option value="">Nenhum (Lançamento Geral / Despesa)</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-purple-900/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-200 rounded-xl font-bold transition-all border border-purple-800/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl font-bold shadow-md shadow-fuchsia-950/60 flex items-center gap-1.5 border border-fuchsia-400/30 transition-all hover:scale-105"
            >
              <DollarSign className="w-4 h-4" />
              <span>Salvar Lançamento</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
