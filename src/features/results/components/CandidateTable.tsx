import React from 'react';
import { Candidate } from '../types';
import { MessageCircle, Eye, ChevronsUpDown, ArrowDown, ArrowUp } from 'lucide-react';

// Reutilizando a função que já criamos para formatar o telefone
const formatPhoneNumberForWhatsApp = (phone: string | null): string | null => {
  if (!phone) return null;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 11) return `55${digitsOnly}`;
  if (digitsOnly.length === 13) return digitsOnly;
  return null; 
};

// --- TIPOS IMPORTADOS DA RESULTSPAGE ---
type SortKey = 'nome' | 'score';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface CandidateTableProps {
  candidates: Candidate[];
  onViewDetails: (candidate: Candidate) => void;
  isLoading?: boolean;
  // --- NOVAS PROPS PARA ORDENAÇÃO ---
  requestSort: (key: SortKey) => void;
  sortConfig: SortConfig;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ 
  candidates, 
  onViewDetails,
  isLoading = false,
  requestSort,
  sortConfig
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown size={14} className="ml-2 text-gray-400" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp size={14} className="ml-2 text-indigo-600" />;
    }
    return <ArrowDown size={14} className="ml-2 text-indigo-600" />;
  };

  if (isLoading) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Histórico de Candidatos Analisados</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b">
              {/* --- CABEÇALHO CLICÁVEL PARA NOME --- */}
              <th className="px-4 py-3">
                <button onClick={() => requestSort('nome')} className="flex items-center font-semibold hover:text-indigo-600 transition-colors">
                  Candidato
                  {getSortIcon('nome')}
                </button>
              </th>
              {/* --- CABEÇALHO CLICÁVEL PARA SCORE --- */}
              <th className="px-4 py-3">
                <button onClick={() => requestSort('score')} className="flex items-center font-semibold hover:text-indigo-600 transition-colors">
                  Score
                  {getSortIcon('score')}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Resumo da IA</th>
              <th className="px-4 py-3 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const whatsappNumber = formatPhoneNumberForWhatsApp(candidate.telefone);
              return (
                <tr key={candidate.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{candidate.nome}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`font-bold mr-2 ${getScoreColor(candidate.score || 0)}`}>
                        {candidate.score || 0}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBarColor(candidate.score || 0)}`}
                          style={{ width: `${candidate.score || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-sm">
                    {candidate.resumo_ia}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                       <button 
                        onClick={() => onViewDetails(candidate)}
                        className="p-2 text-gray-500 hover:bg-gray-200 hover:text-indigo-600 rounded-full transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <a
                        href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !whatsappNumber && e.preventDefault()}
                        className={`p-2 rounded-full transition-colors ${
                          !whatsappNumber 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-green-100 hover:text-green-600'
                        }`}
                        title={whatsappNumber ? 'Chamar no WhatsApp' : 'Telefone não disponível'}
                      >
                        <MessageCircle size={18} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateTable;