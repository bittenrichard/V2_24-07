import React, { useState, useMemo, useEffect } from 'react';
import { baserow } from '../../../shared/services/baserowClient';
import { useAuth } from '../../auth/hooks/useAuth';
import { Candidate } from '../../results/types';
import { Search, Download, Briefcase, Star, Loader2 } from 'lucide-react';

// --- COMPONENTE LoadingSpinner DEFINIDO DIRETAMENTE AQUI ---
const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
        <h2 className="mt-6 text-xl font-semibold text-gray-800">Carregando...</h2>
        <p className="mt-2 text-gray-500">Estamos preparando tudo para você.</p>
      </div>
    </div>
  );
};
// --- FIM DA DEFINIÇÃO ---

const CANDIDATOS_TABLE_ID = '702';

const CandidateDatabasePage: React.FC = () => {
    const { profile } = useAuth();
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllUserCandidates = async () => {
            if (!profile) return;
            setIsLoading(true);
            try {
                // --- LÓGICA DE BUSCA E FILTRO CORRIGIDA ---
                // 1. Pega TODOS os candidatos, sem filtro de usuário na API.
                const { results } = await baserow.get(CANDIDATOS_TABLE_ID, `?user_field_names=true`);

                // 2. Filtra os resultados aqui no código, o que é 100% confiável.
                const userCandidates = (results || []).filter(candidate =>
                    candidate.usuario && candidate.usuario.some(user => user.id === profile.id)
                );
                
                setAllCandidates(userCandidates);
            } catch (error) {
                console.error("Erro ao buscar o banco de talentos:", error);
                setAllCandidates([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllUserCandidates();
    }, [profile]);

    const filteredCandidates = useMemo(() => {
        if (!searchTerm) {
            return allCandidates;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return allCandidates.filter(candidate => {
            const inName = candidate.nome.toLowerCase().includes(lowercasedFilter);
            const inJob = candidate.vaga && candidate.vaga.some(v => v.value.toLowerCase().includes(lowercasedFilter));
            return inName || inJob;
        });
    }, [allCandidates, searchTerm]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Banco de Talentos</h1>
            <p className="text-gray-600 mb-8">Pesquise e reaproveite candidatos de processos seletivos anteriores.</p>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Todos os Candidatos ({filteredCandidates.length})</h3>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filtrar por nome ou vaga..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase border-b bg-gray-50">
                                <th className="px-4 py-3 font-semibold">Nome</th>
                                <th className="px-4 py-3 font-semibold">Vaga Original</th>
                                <th className="px-4 py-3 font-semibold">Score</th>
                                <th className="px-4 py-3 font-semibold text-center">Currículo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.map(candidate => (
                                <tr key={candidate.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-gray-800">{candidate.nome}</td>
                                    <td className="px-4 py-4 text-gray-600">
                                        <div className='flex items-center'>
                                            <Briefcase size={14} className="mr-2 text-gray-400" />
                                            {candidate.vaga && candidate.vaga[0] ? candidate.vaga[0].value : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-green-600 font-bold">
                                        <div className='flex items-center'>
                                            <Star size={14} className="mr-2 text-yellow-400" />
                                            {candidate.score}%
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <a
                                            href={candidate.curriculo && candidate.curriculo[0] ? candidate.curriculo[0].url : '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                                candidate.curriculo && candidate.curriculo[0]
                                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            title={candidate.curriculo && candidate.curriculo[0] ? 'Baixar currículo' : 'Currículo não disponível'}
                                        >
                                            <Download size={14} />
                                            Ver
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCandidates.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhum candidato encontrado para sua conta.
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateDatabasePage;