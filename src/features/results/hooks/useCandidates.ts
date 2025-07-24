import { useState, useEffect, useCallback } from 'react';
import { Candidate } from '../types';
import { baserow } from '../../../shared/services/baserowClient';

const CANDIDATOS_TABLE_ID = '702'; // ID da tabela Candidatos

export const useCandidates = (jobId?: number, userId?: number) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!jobId || !userId) {
      setCandidates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // --- ALTERAÇÃO AQUI: Removido o parâmetro de ordenação 'sorts' ---
      const params = `?filter__field_usuario__contains=${userId}`;
      const { results } = await baserow.get(CANDIDATOS_TABLE_ID, params);

      if (results) {
        const jobCandidates = results.filter(candidate => 
          candidate.vaga && candidate.vaga.some(v => v.id === jobId)
        );
        setCandidates(jobCandidates);
      } else {
        setCandidates([]);
      }
      
    } catch (err: any) {
      console.error('Erro ao buscar candidatos no Baserow:', err);
      setError('Não foi possível carregar o histórico de candidatos.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId, userId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    candidates,
    isLoading,
    error,
    refetchCandidates: fetchCandidates,
  };
};