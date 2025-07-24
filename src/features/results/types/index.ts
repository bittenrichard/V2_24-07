// Representa um Candidato como vem da API do Baserow
export interface Candidate {
  id: number;
  order: string;
  nome: string;
  telefone: string | null;
  score: number | null;
  resumo_ia: string | null;
  data_triagem: string;
  vaga: { id: number; value: string }[]; // Relação com a tabela Vagas
  usuario: { id: number; value: string }[]; // Relação com a tabela Usuários
  
  // --- CAMPO ADICIONADO PARA O ARQUIVO DO CURRÍCULO ---
  curriculo?: { url: string; name: string }[];
  
  // Campos abaixo usados nos modais
  TRIAGEM?: string;
}