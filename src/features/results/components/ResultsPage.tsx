import React, { useState, useMemo, useCallback, useEffect } from 'react';
import UploadArea from './UploadArea';
import CandidateTable from './CandidateTable';
import { useCandidates } from '../hooks/useCandidates';
import { JobPosting } from '../../screening/types';
import { Candidate } from '../types';
import { sendCurriculumsToWebhook } from '../../../shared/services/webhookService';
import CandidateDetailModal from './CandidateDetailModal';
import { baserow } from '../../../shared/services/baserowClient';
import { useAuth } from '../../auth/hooks/useAuth';

// --- COMPONENTE ProgressBar DECLARADO AQUI DENTRO ---
interface ProgressBarProps {
  progress: number;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};
// --- FIM DA DECLARAÇÃO DO ProgressBar ---

const CANDIDATOS_TABLE_ID = '702';

type SortKey = 'nome' | 'score';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface ResultsPageProps {
  selectedJob: JobPosting | null;
  onDataSynced: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ selectedJob, onDataSynced }) => {
  const { profile } = useAuth();
  const { candidates, isLoading, error: candidatesError, refetchCandidates } = useCandidates(selectedJob?.id, profile?.id);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'score', direction: 'descending' });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isUploading) {
      setUploadProgress(0); 
      interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const sortedCandidates = useMemo(() => {
    let sortableCandidates = [...candidates];
    sortableCandidates.sort((a, b) => {
      const aValue = a[sortConfig.key] || (sortConfig.key === 'score' ? 0 : '');
      const bValue = b[sortConfig.key] || (sortConfig.key === 'score' ? 0 : '');

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableCandidates;
  }, [candidates, sortConfig]);

  const requestSort = (key: SortKey) => {
    if (sortConfig.key === key) {
      const newDirection = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
      setSortConfig({ key, direction: newDirection });
    } else {
      const newDirection = key === 'score' ? 'descending' : 'ascending';
      setSortConfig({ key, direction: newDirection });
    }
  };

  // --- FUNÇÃO handleFilesSelected ATUALIZADA COM A LÓGICA CORRETA ---
  const handleFilesSelected = async (files: FileList) => {
    if (!selectedJob || !profile) {
      setUploadError('Vaga ou usuário não identificado. Não é possível enviar os currículos.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Enviar para a IA analisar (continua igual)
      const result = await sendCurriculumsToWebhook(files, selectedJob.id.toString());
      setUploadProgress(100);

      if (!result.success || !result.candidates) {
        throw new Error(result.message || 'A análise da IA falhou.');
      }
      
      if (result.candidates.length !== files.length) {
          console.warn("Atenção: O número de resultados da IA não corresponde ao número de arquivos enviados. Alguns candidatos podem não ser salvos.");
      }

      // 2. Mapear cada arquivo para uma promessa de criação de candidato
      const createCandidatePromises = Array.from(files).map(async (file, index) => {
        // Pega o resultado da IA pela ORDEM (índice), que é mais seguro
        const candidateDataFromIA = result.candidates?.[index];

        // Se não houver dados da IA para este arquivo, pula para o próximo
        if (!candidateDataFromIA) {
          console.error(`Não foram encontrados dados da IA para o arquivo: ${file.name}`);
          return;
        }

        // Faz o upload do arquivo original para o storage do Baserow
        const uploadedFile = await baserow.uploadFile(file);

        const newCandidato = {
          "nome": candidateDataFromIA.name || 'Candidato sem nome',
          "vaga": [selectedJob.id],
          "usuario": [profile.id],
          "score": Number(candidateDataFromIA.score) || 0,
          "resumo_ia": candidateDataFromIA.summary || '',
          "telefone": candidateDataFromIA.Telefone ? candidateDataFromIA.Telefone.replace(/\D/g, '') : '',
          "curriculo": [uploadedFile] // Salva a referência do arquivo
        };
        
        // Retorna a promessa de salvar o novo candidato no banco
        return baserow.post(CANDIDATOS_TABLE_ID, newCandidato);
      });
      
      // 3. Aguarda todas as operações de criação terminarem
      await Promise.all(createCandidatePromises);
      
      // 4. Atualiza a lista na tela
      await refetchCandidates();
      onDataSynced();

    } catch (error) {
      console.error('Erro no processo de upload e salvamento:', error);
      setUploadError(error instanceof Error ? error.message : 'Erro ao processar currículos. Tente novamente.');
    } finally {
      setTimeout(() => {
          setIsUploading(false);
      }, 1000);
    }
  };


  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };
  
  const handleCloseDetailModal = () => {
    setSelectedCandidate(null);
  };

  if (!selectedJob) {
      return (
        <div className="text-center p-10">
            <h3 className="text-xl font-semibold">Nenhuma vaga selecionada</h3>
            <p className="text-gray-500 mt-2">Volte ao dashboard para selecionar uma vaga e ver os resultados.</p>
        </div>
      );
  }

  return (
    <>
      <div className="fade-in">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">
            Resultados: {selectedJob?.titulo || 'Vaga não selecionada'}
          </h3>
          <p className="text-gray-600">
            Envie os currículos para iniciar a análise da IA.
          </p>
        </div>

        {(uploadError || candidatesError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{uploadError || candidatesError}</p>
          </div>
        )}

        <UploadArea
          onFilesSelected={handleFilesSelected}
          isUploading={isUploading}
        />
        
        {isUploading && (
          <div className="mb-8 -mt-4">
            <ProgressBar progress={uploadProgress} />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Aguarde, a IA está analisando os currículos. Isso pode levar alguns instantes...
            </p>
          </div>
        )}

        <CandidateTable
          candidates={sortedCandidates}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
          requestSort={requestSort}
          sortConfig={sortConfig}
        />
      </div>

      {selectedCandidate && (
        <CandidateDetailModal 
          candidate={selectedCandidate}
          onClose={handleCloseDetailModal}
        />
      )}
    </>
  );
};

export default ResultsPage;